"""채널별 독립 녹음과 공용 곡 분석 대기열. 설정과 원본은 PC에 보존한다."""
from copy import deepcopy
from datetime import datetime, timedelta
import json
import os
from pathlib import Path
import shutil
import subprocess
import threading
import time
from uuid import uuid4

import psutil
from pipeline import duration
from radio_sources import KST, RadioSources


def default_rule():
    return {"stationId": "kbs1fm", "enabled": False, "startMinute": 0, "endMinute": 1440,
            "weekdays": list(range(7)), "programs": [], "excludeReruns": True, "splitTracks": True,
            "cloudFallback": True, "maxCloudSeconds": 600, "segmentMinutes": 120, "qualityMode": False}


def validate_rules(data, stations):
    if not isinstance(data, dict) or not isinstance(data.get("rules"), list) or len(data["rules"]) > len(stations):
        raise ValueError("채널별 녹음 설정을 확인하세요.")
    result, seen = [], set()
    for value in data["rules"]:
        if not isinstance(value, dict) or value.get("stationId") not in stations or value["stationId"] in seen:
            raise ValueError("채널이 잘못됐거나 중복됐습니다.")
        rule = default_rule() | value
        for key in ("enabled", "excludeReruns", "splitTracks", "cloudFallback", "qualityMode"):
            if type(rule[key]) is not bool:
                raise ValueError("녹음 옵션은 켬/끔이어야 합니다.")
        for key, low, high in (("startMinute", 0, 1439), ("endMinute", 0, 1440),
                               ("maxCloudSeconds", 0, 3600), ("segmentMinutes", 15, 120)):
            if type(rule[key]) is not int or not low <= rule[key] <= high:
                raise ValueError("녹음 시간 또는 전송 한도를 확인하세요.")
        if rule["startMinute"] == rule["endMinute"]:
            raise ValueError("종일 녹음은 00:00부터 24:00까지로 설정하세요.")
        if (not isinstance(rule["weekdays"], list) or not rule["weekdays"] or
                any(type(day) is not int or day not in range(7) for day in rule["weekdays"])):
            raise ValueError("녹음할 요일을 선택하세요.")
        if (not isinstance(rule["programs"], list) or len(rule["programs"]) > 50 or
                any(not isinstance(p, str) or not p.strip() or len(p) > 200 for p in rule["programs"])):
            raise ValueError("프로그램 이름을 한 줄에 하나씩 입력하세요.")
        station = stations[rule["stationId"]]
        if rule["excludeReruns"] and not station["rerunSupported"]:
            raise ValueError(station["name"] + "은 재방송 정보가 지원되지 않습니다. 재방송 제외를 꺼 주세요.")
        if rule["programs"] and not station["scheduleSupported"]:
            raise ValueError(station["name"] + "은 프로그램 선택이 지원되지 않습니다. 시간으로 설정하세요.")
        cleaned = {key: rule[key] for key in default_rule()}
        cleaned["weekdays"] = sorted(set(rule["weekdays"]))
        cleaned["programs"] = list(dict.fromkeys(p.strip() for p in rule["programs"]))
        result.append(cleaned)
        seen.add(rule["stationId"])
    return result


def recording_window(rule, now):
    current = datetime.fromtimestamp(now, KST)
    for day in (current.date(), current.date() - timedelta(days=1)):
        if day.weekday() not in rule["weekdays"]:
            continue
        midnight = datetime.combine(day, datetime.min.time(), KST)
        start = midnight + timedelta(minutes=rule["startMinute"])
        end = midnight + timedelta(minutes=rule["endMinute"])
        if end <= start:
            end += timedelta(days=1)
        if start.timestamp() <= now < end.timestamp():
            return end.timestamp()
    return None


def plan(rule, now, sources):
    end = recording_window(rule, now)
    if end is None:
        return None, "예약 시간 대기"
    program = sources.current(rule["stationId"], now)
    if rule["excludeReruns"]:
        if not program or program["rerun"] is None:
            return None, "재방송 여부 확인 불가 · 편성 재조회 대기"
        if program["rerun"]:
            return None, "재방송 제외: " + program["title"]
    if rule["programs"] and (not program or program["title"] not in rule["programs"]):
        return None, "선택한 프로그램 대기" if program else "편성 확인 불가 · 재조회 대기"
    end = min(end, now + rule["segmentMinutes"] * 60, program["end"] if program else float("inf"))
    if end - now < 2:
        return None, "다음 방송 구간 대기"
    return {"end": end, "title": program["title"] if program else "시간 녹음",
            "broadcastStart": program["start"] if program else now,
            "broadcastEnd": min(recording_window(rule, now), program["end"]) if program else end,
            "scheduleKnown": program is not None, "rerun": program["rerun"] if program else None}, "녹음 준비"


class Recorder:
    def __init__(self, root, config, jobs, sources=None):
        self.root, self.config, self.jobs = root, config, jobs
        self.sources = sources or RadioSources()
        self.lock = threading.RLock()
        self.path = root / "recorder.json"
        self.rules = validate_rules(json.loads(self.path.read_text(encoding="utf-8")), self.sources.stations) if self.path.exists() else [default_rule()]
        self.shutdown = threading.Event()
        self.threads, self.runtime = {}, {}
        self.started = False

    def snapshot(self):
        with self.lock:
            return {"rules": deepcopy(self.rules), "channels": [
                {key: value for key, value in station.items() if key in ("id", "name", "scheduleSupported", "rerunSupported")}
                for station in self.sources.stations.values()], "runtime": deepcopy(self.runtime),
                "queuedJobs": self.jobs.queue.qsize(), "freeBytes": shutil.disk_usage(self.root).free,
                "timezone": "Asia/Seoul"}

    def update(self, data):
        rules = validate_rules(data, self.sources.stations)
        with self.lock:
            temp = self.path.with_suffix(".tmp.json")
            temp.write_text(json.dumps({"rules": rules}, ensure_ascii=False, indent=2), encoding="utf-8")
            temp.replace(self.path)
            self.rules = rules
            if self.started:
                self.launch_workers()
        return self.snapshot()

    def rule(self, station_id):
        with self.lock:
            return deepcopy(next((rule for rule in self.rules if rule["stationId"] == station_id), None))

    def status(self, station_id, state, message, **extra):
        with self.lock:
            self.runtime[station_id] = {"state": state, "message": message, **extra}

    def start(self):
        # 서버 비정상 종료 뒤 남은 FFmpeg는 해당 원본을 쓰는 프로세스만 확인하여 정리한다.
        for job in self.jobs.listing():
            if job.get("status") == "recording":
                self.recover(job)
        with self.lock:
            self.started = True
            self.launch_workers()

    def launch_workers(self):
        for rule in self.rules:
            station_id = rule["stationId"]
            if station_id not in self.threads:
                thread = threading.Thread(target=self.work, args=(station_id,), daemon=True)
                self.threads[station_id] = thread
                thread.start()

    def close(self):
        self.shutdown.set()
        for thread in list(self.threads.values()):
            thread.join(timeout=20)

    def work(self, station_id):
        while not self.shutdown.is_set():
            rule = self.rule(station_id)
            if not rule or not rule["enabled"]:
                self.status(station_id, "stopped", "녹음 꺼짐")
                self.shutdown.wait(1)
                continue
            try:
                target, message = plan(rule, time.time(), self.sources)
                if not target:
                    self.status(station_id, "waiting", message)
                    self.shutdown.wait(5)
                    continue
                if shutil.disk_usage(self.root).free < 8 * 1024**3:
                    self.status(station_id, "error", "PC 여유 공간 8GB 미만 · 녹음 대기")
                    self.shutdown.wait(30)
                    continue
                self.capture(rule, target)
            except Exception:
                self.status(station_id, "error", "녹음 연결 실패 · 30초 뒤 재시도")
                self.shutdown.wait(30)

    def capture(self, rule, target):
        station_id = rule["stationId"]
        self.status(station_id, "connecting", "방송 스트림 연결 중")
        stream = self.sources.stream(station_id)
        if self.shutdown.is_set() or self.rule(station_id) != rule or target["end"] - time.time() < 2:
            return
        job_id = str(uuid4())
        folder = self.jobs.folder(job_id)
        folder.mkdir()
        now = time.time()
        job = {"id": job_id, "stationId": station_id, "source": "server-recorder",
               "name": self.sources.stations[station_id]["name"] + " · " + target["title"],
               "startedAt": datetime.fromtimestamp(now, KST).isoformat(), "createdAt": now,
               "status": "recording", "message": "PC 서버에서 녹음 중", "tracks": [],
               "cloudSeconds": 0, "cloudCalls": 0, "splitTracks": rule["splitTracks"],
               "program": target, "options": {"cloudFallback": rule["cloudFallback"], "maxCloudSeconds": rule["maxCloudSeconds"]}}
        job['qualityMode'] = rule.get('qualityMode', False) and rule['cloudFallback']
        self.jobs.save(job)
        process = None
        capture_env = dict(os.environ)
        capture_env.pop("OPENROUTER_API_KEY", None)
        capture_env.pop("GEMINI_API_KEY", None)
        try:
            with (folder / "recording.log").open("wb") as log:
                process = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-rw_timeout", "15000000", "-protocol_whitelist", "http,https,tcp,tls,crypto",
                    "-i", stream, "-t", str(target["end"] - now), "-map", "0:a:0", "-vn", "-c:a", "copy",
                    "-bsf:a", "aac_adtstoasc",
                    "-movflags", "+frag_keyframe+empty_moov+default_base_moof", "-frag_duration", "5000000",
                    "-flush_packets", "1", "-f", "mp4", str(folder / "original.bin")],
                    stdin=subprocess.PIPE, stdout=log, stderr=log, env=capture_env,
                    creationflags=0x08000000 if os.name == "nt" else 0)
                job["recorderPid"] = process.pid
                self.jobs.save(job)
                self.status(station_id, "recording", job["name"], jobId=job_id, startedAt=job["startedAt"], endsAt=target["end"])
                reason = "방송 구간 완료"
                while process.poll() is None:
                    if self.shutdown.is_set() or self.rule(station_id) != rule:
                        reason = "설정 변경 또는 서버 종료로 구간 마감"
                        break
                    if time.time() >= target["end"]:
                        break
                    if shutil.disk_usage(self.root).free < 2 * 1024**3:
                        reason = "저장 공간 부족으로 구간 마감"
                        break
                    original = folder / "original.bin"
                    if original.exists() and time.time() - original.stat().st_mtime > 90:
                        reason = "방송 수신 중단으로 구간 마감"
                        break
                    self.shutdown.wait(.5)
                if process.poll() is None:
                    try:
                        process.communicate(b"q\n", timeout=5)
                    except (OSError, subprocess.TimeoutExpired):
                        process.kill()
                        process.wait(timeout=5)
                if process.returncode != 0:
                    reason = "방송 연결 중단 · 받은 구간 보관"
                self.finish(job, reason)
                if time.time() < target["end"] - 5 and self.rule(station_id) == rule:
                    self.status(station_id, "waiting", "방송 스트림 재연결 대기")
                    self.shutdown.wait(10)
        except Exception:
            if process and process.poll() is None:
                process.kill()
                process.wait(timeout=5)
            self.finish(job, "녹음 오류 · 받은 구간 보관")
            raise
        finally:
            if process and process.stdin:
                process.stdin.close()

    def finish(self, job, reason):
        job["recordingNote"] = reason
        job["endedAt"] = datetime.now(KST).isoformat()
        try:
            job["duration"] = duration(self.jobs.folder(job["id"]) / "original.bin")
        except Exception:
            job.update(status="error", message="녹음 파일을 확인하지 못했습니다. 원본·로그는 보존했습니다.")
            self.jobs.save(job)
            return
        precise = (job.get('qualityMode') and job['splitTracks'] and job.get('options',{}).get('cloudFallback')
                   and job.get('program',{}).get('scheduleKnown'))
        job["status"] = "awaiting-album" if precise else "queued" if job["splitTracks"] else "recorded"
        job["message"] = "PC 녹음 완료 · 곡 분석 대기" if job["splitTracks"] else "PC 원본 녹음 저장 완료"
        if precise:
            job['message'] = '방송 종료 후 전체 음성으로 음반 정밀 분석 대기'
            job['albumReadyAt'] = job.get('program',{}).get('broadcastEnd', time.time()) + 30
        self.jobs.save(job)
        if job["splitTracks"] and not precise:
            self.jobs.queue.put(job["id"])

    def recover(self, job):
        try:
            pid = job.get("recorderPid")
            if pid:
                process = psutil.Process(pid)
                expected = str(self.jobs.folder(job["id"]) / "original.bin")
                if "ffmpeg" in process.name().lower() and expected in process.cmdline():
                    process.terminate()
                    try:
                        process.wait(5)
                    except psutil.TimeoutExpired:
                        process.kill()
                        process.wait(5)
        except psutil.NoSuchProcess:
            pass
        except psutil.Error:
            raise RuntimeError("중단된 녹음 프로세스 확인에 실패했습니다. 원본을 보존했습니다.") from None
        self.finish(job, "서버 재시작으로 중단된 녹음 구간 복구")
