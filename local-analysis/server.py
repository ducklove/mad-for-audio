"""PC 전용 곡 분리 서비스. 인터넷에 공개하지 않고 127.0.0.1에서만 실행한다."""
import asyncio
from contextlib import asynccontextmanager
import json
import os
from pathlib import Path
import queue
import re
import secrets
import shutil
import threading
import time
from uuid import UUID
import zipfile
import tempfile
from album_quality import AlbumQuality, episode_key, album_id

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.background import BackgroundTask

from pipeline import Pipeline, export_track, FIELDS, clip
from cloud_config import cloud_connection, load_cloud_keys
from recorder import Recorder

# MSIX 앱의 LocalAppData 가상화에 영향을 받지 않는 사용자 폴더를 사용한다.
DATA = Path(os.environ.get("MFA_ANALYSIS_HOME", str(Path.home() / ".mad-for-audio" / "analysis")))
ORIGINS = ["https://ducklove.github.io", "http://127.0.0.1:8123", "http://localhost:8123"]


def load_config(root=DATA):
    root.mkdir(parents=True, exist_ok=True)
    path = root / "config.json"
    if not path.exists():
        base = Path(__file__).parent.resolve()
        python = base / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        config = {"token": secrets.token_urlsafe(32), "geminiApiKey": "", "maxCloudSeconds": 600,
                  "modelPython": str(python), "modelCache": str(root / "models"),
                  "mossSource": str(base / ".moss-audio"), "allowedOrigins": ORIGINS}
        path.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
    config = json.loads(path.read_text(encoding="utf-8"))
    if len(config.get("token", "")) < 32:
        raise ValueError("로컬 연결 코드가 너무 짧습니다. 32자 이상으로 설정하세요.")
    return load_cloud_keys(config)


class Jobs:
    def __init__(self, root, config):
        self.root = root / "jobs"
        self.root.mkdir(parents=True, exist_ok=True)
        self.config = config
        self.queue = queue.Queue()
        self.lock = threading.RLock()
        self.uploads = set()
        self.worker = None
        self.closing = threading.Event()

    def folder(self, job_id):
        try:
            if str(UUID(job_id)) != job_id:
                raise ValueError()
        except ValueError:
            raise HTTPException(400, "작업 ID가 올바르지 않습니다.") from None
        return self.root / job_id

    def read(self, job_id):
        with self.lock:
            path = self.folder(job_id) / "job.json"
            if not path.exists():
                raise HTTPException(404, "작업을 찾을 수 없습니다.")
            return json.loads(path.read_text(encoding="utf-8"))

    def save(self, job):
        with self.lock:
            folder = self.folder(job["id"])
            folder.mkdir(exist_ok=True)
            job["updatedAt"] = time.time()
            temp = folder / "job.tmp.json"
            temp.write_text(json.dumps(job, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
            temp.replace(folder / "job.json")

    def listing(self, limit=None):
        with self.lock:
            paths = sorted(self.root.glob("*/job.json"), key=lambda p: p.stat().st_mtime, reverse=True)
            if limit:
                paths = paths[:limit]
            return sorted((json.loads(p.read_text(encoding="utf-8")) for p in paths),
                          key=lambda j: j["createdAt"], reverse=True)

    def start(self):
        # 완료된 API 호출은 자동 재집행하지 않는다. 중단된 작업은 명시적 재시도만 가능하다.
        for job in self.listing():
            if job["status"] in ("running", "editing"):
                job.update(status="error", message="PC 서비스가 중단됐습니다. 원본을 보존했으며 재시도할 수 있습니다.")
                self.save(job)
            elif job["status"] == "queued":
                self.queue.put(job["id"])
        self.worker = threading.Thread(target=self.work, daemon=True)
        self.worker.start()
        self.album_scheduler = threading.Thread(target=self.schedule_albums, daemon=True)
        self.album_scheduler.start()

    def enqueue_album(self, seed_id):
        with self.lock:
            seed = self.read(seed_id)
            key = episode_key(seed)
            if not key: raise HTTPException(409, '편성이 확인된 PC 서버 녹음에서 방송 음반을 만들 수 있습니다.')
            sources = sorted([j for j in self.listing() if episode_key(j)==key], key=lambda j:j['startedAt'])
            if any(j['status'] in ('recording','running','editing','queued') for j in sources):
                raise HTTPException(409, '방송 녹음·파일 분석이 끝난 뒤 정밀 분석을 시작하세요.')
            ready = max((j.get('albumReadyAt',0) for j in sources),default=0)
            if ready > time.time(): raise HTTPException(409, '방송이 끝날 때까지 원본을 모으고 있습니다.')
            usable = [j for j in sources if j.get('duration',0)>0 and (self.folder(j['id'])/'original.bin').is_file()]
            if not usable: raise HTTPException(409, '분석할 수 있는 녹음 원본이 없습니다.')
            if not all(j.get('options',{}).get('cloudFallback') for j in usable):
                raise HTTPException(409, '이 방송의 일부 원본에서 Gemini 사용이 꺼져 있습니다.')
            if not cloud_connection(self.config)[2]: raise HTTPException(409, 'Gemini 연결 설정이 필요합니다.')
            source_ids = [j['id'] for j in usable]
            ident = album_id(key + json.dumps(source_ids))
            if (self.folder(ident)/'job.json').exists(): return self.read(ident)
            job = {'id':ident,'name':seed['name'],'stationId':seed['stationId'],'program':seed['program'],
                'source':'broadcast-album','episodeKey':key,'sourceJobIds':source_ids,
                'sourceFiles':[{'id':j['id'],'startedAt':j['startedAt'],'duration':j['duration']} for j in usable],
                'omittedSourceIds':[j['id'] for j in sources if j not in usable],
                'startedAt':usable[0]['startedAt'],'createdAt':time.time(),'status':'queued','tracks':[],
                'message':'방송 전체 음성 정밀 분석 대기','cloudCalls':0,'cloudSeconds':0,
                'options':{'cloudFallback':True,'maxCloudSeconds':self.config.get('albumMaxCloudSeconds',21600)}}
            self.save(job); self.queue.put(ident)
            return job

    def schedule_albums(self):
        while not self.closing.wait(15):
            for job in self.listing():
                if job['status'] != 'awaiting-album' or job.get('albumReadyAt',0)>time.time(): continue
                try:
                    album=self.enqueue_album(job['id'])
                    with self.lock:
                        current=self.read(job['id'])
                        if current['status']=='awaiting-album':
                            current.update(status='recorded',albumId=album['id'],message='원본 보관 · 방송 음반에서 정밀 분석')
                            self.save(current)
                except HTTPException:
                    continue

    def library(self):
        rows=self.listing()
        albums={}
        for job in rows:
            if job.get('source')=='broadcast-album' and job.get('episodeKey') not in albums:
                albums[job['episodeKey']]=job
        hidden={ident for album in albums.values() if album['status'] in ('done','review') for ident in album['sourceJobIds']}
        return [j for j in rows if j['id'] not in hidden and
                (j.get('source')!='broadcast-album' or albums[j['episodeKey']]['id']==j['id'])][:50]

    def work(self):
        while True:
            job_id = self.queue.get()
            if job_id is None:
                self.closing.set()
                return
            job = None
            try:
                job = self.read(job_id)
                if job["status"] != "queued":
                    continue
                job["status"] = "running"
                self.save(job)
                pipeline = Pipeline(self.config)
                if job.get('source') == 'broadcast-album':
                    sources=[self.read(ident) for ident in job['sourceJobIds']]
                    AlbumQuality(self.root,self.config).process(self.folder(job_id),job,sources,self.save)
                elif job.pop("metadataOnly", False):
                    pipeline.review_metadata(self.folder(job_id), job, self.save)
                else:
                    pipeline.process(self.folder(job_id), job, self.save)
            except Exception as error:
                if job is not None:
                    job.update(status="error", message=str(error)[:1800])
                    self.save(job)
            finally:
                self.queue.task_done()


def create_app(root=DATA, config=None, start_worker=True):
    config = config or load_config(root)
    jobs = Jobs(root, config)
    recorder = Recorder(root, config, jobs)
    pairing_tickets = {}

    @asynccontextmanager
    async def lifespan(app):
        if start_worker:
            jobs.start()
            recorder.start()
        yield
        if start_worker:
            jobs.closing.set()
            await run_in_threadpool(recorder.close)
            jobs.queue.put(None)

    app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.jobs = jobs
    app.state.recorder = recorder
    origins = config.get("allowedOrigins", ORIGINS)
    app.add_middleware(CORSMiddleware, allow_origins=origins,
                       allow_methods=["GET", "PUT", "POST", "DELETE"],
                       allow_headers=["Authorization", "Content-Type", "X-MFA-Meta"],
                       expose_headers=["Content-Disposition"])

    @app.middleware("http")
    async def guard(request, call_next):
        if request.url.hostname not in ("127.0.0.1", "localhost"):
            return JSONResponse({"detail": "허용되지 않은 호스트입니다."}, 403)
        origin = request.headers.get("origin")
        if origin and origin not in origins:
            return JSONResponse({"detail": "허용되지 않은 앱 출처입니다."}, 403)
        if request.method != "OPTIONS" and request.url.path != "/pair" and not secrets.compare_digest(
                request.headers.get("authorization", ""), "Bearer " + config["token"]):
            return JSONResponse({"detail": "PC 분석 서비스 연결 코드를 확인하세요."}, 401,
                                headers={"Access-Control-Allow-Origin": origin} if origin in origins else None)
        response = await call_next(request)
        if request.method == "OPTIONS" and origin in origins:
            response.headers["Access-Control-Allow-Private-Network"] = "true"
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/connection-link")
    def connection_link():
        # 이미 인증된 로컬 설치 도구만 일회용 연결 링크를 발급할 수 있다.
        with jobs.lock:
            now = time.monotonic()
            for ticket in list(pairing_tickets):
                if pairing_tickets[ticket] < now:
                    del pairing_tickets[ticket]
            if len(pairing_tickets) >= 10:
                raise HTTPException(429, "잠시 뒤 연결 링크를 다시 만드세요.")
            ticket = secrets.token_urlsafe(32)
            pairing_tickets[ticket] = now + 120
        return {"url": "https://ducklove.github.io/mad-for-audio/#pc-analysis-pair=" + ticket,
                "expiresIn": 120}

    @app.post("/pair")
    def pair(request: Request):
        if request.headers.get("origin") not in origins:
            raise HTTPException(403, "허용된 앱에서 연결하세요.")
        authorization = request.headers.get("authorization", "")
        ticket = authorization.removeprefix("Bearer ") if authorization.startswith("Bearer ") else ""
        with jobs.lock:
            expires = pairing_tickets.pop(ticket, 0)
        if expires <= time.monotonic():
            raise HTTPException(401, "연결 링크가 만료됐습니다. PC 연결 도구를 다시 실행하세요.")
        return {"token": config["token"]}

    @app.get("/health")
    def health():
        provider, model, key = cloud_connection(config)
        return {"ok": True, "version": 1, "localConfigured": Path(config["modelPython"]).is_file()
                and (Path(config["mossSource"]) / "src").is_dir() and (root / "models-ready.json").is_file(),
                "geminiConfigured": bool(key), "geminiProvider": provider,
                "geminiModel": model, "maxCloudSeconds": config.get("maxCloudSeconds", 600), "serverRecorder": True,
                "metadataReview": True, "albumQuality": True,
                "albumMaxCloudSeconds": config.get('albumMaxCloudSeconds',21600)}

    @app.get("/recorder")
    def recorder_status():
        return recorder.snapshot()

    @app.put("/recorder")
    async def recorder_update(request: Request):
        body = await request.body()
        if len(body) > 64000:
            raise HTTPException(413, "녹음 설정이 너무 큽니다.")
        try:
            return recorder.update(json.loads(body))
        except ValueError as error:
            raise HTTPException(400, str(error)[:300]) from None
        except (TypeError, KeyError):
            raise HTTPException(400, "채널·요일·시간·프로그램·재방송 지원 여부를 확인하세요.") from None

    @app.get("/jobs")
    def listing():
        return jobs.library()

    @app.post('/jobs/{job_id}/album')
    def album(job_id: str):
        return jobs.enqueue_album(job_id)

    @app.get("/jobs/{job_id}")
    def read(job_id: str):
        return jobs.read(job_id)

    @app.put("/jobs/{job_id}")
    async def upload(job_id: str, request: Request):
        folder = jobs.folder(job_id)
        with jobs.lock:
            if (folder / "job.json").exists():
                return jobs.read(job_id)  # 같은 녹음을 재업로드해도 한 번만 처리한다.
            if job_id in jobs.uploads:
                raise HTTPException(409, "이미 전송 중입니다.")
            jobs.uploads.add(job_id)
        partial = folder / "upload.part"
        try:
            from urllib.parse import unquote
            if len(request.headers.get("x-mfa-meta", "")) > 16000:
                raise HTTPException(400, "녹음 정보가 너무 큽니다.")
            meta = json.loads(unquote(request.headers.get("x-mfa-meta", "{}")))
            opts = meta.get("options", {})
            cap = opts.get("maxCloudSeconds", 600)
            if type(cap) is not int or not 0 <= cap <= 3600:
                raise HTTPException(400, "Gemini 전송 한도는 0~3600초여야 합니다.")
            folder.mkdir(exist_ok=True)
            size = 0
            # 8시간 방송(압축 파일 최대 1GiB). 디스크 여유를 확인하고 스트리밍 저장한다.
            if shutil.disk_usage(root).free < 8 * 1024**3:
                raise HTTPException(507, "PC 저장 공간이 부족합니다. 8GB 이상 확보하세요.")
            with partial.open("wb") as dest:
                async with asyncio.timeout(900):
                    async for chunk in request.stream():
                        size += len(chunk)
                        if size > 1024**3:
                            raise HTTPException(413, "녹음 파일은 1GB 이하여야 합니다.")
                        await run_in_threadpool(dest.write, chunk)
            if not size:
                raise HTTPException(400, "녹음 파일이 비어 있습니다.")
            partial.replace(folder / "original.bin")
            job = {"id": job_id, "name": str(meta.get("stationName", "라디오 녹음"))[:200],
                   "startedAt": str(meta.get("startedAt", ""))[:60], "status": "queued", "message": "PC 분석 대기 중",
                   "createdAt": time.time(), "tracks": [], "cloudSeconds": 0, "cloudCalls": 0,
                   "options": {"cloudFallback": opts.get("cloudFallback") is True, "maxCloudSeconds": cap}}
            jobs.save(job)
            jobs.queue.put(job_id)
            return job
        except (ValueError, TypeError, AttributeError):
            raise HTTPException(400, "녹음 정보 형식이 올바르지 않습니다.") from None
        finally:
            partial.unlink(missing_ok=True)
            with jobs.lock:
                jobs.uploads.discard(job_id)

    @app.post("/jobs/{job_id}/retry")
    def retry(job_id: str):
        with jobs.lock:
            job = jobs.read(job_id)
            if job["status"] not in ("error", "review"):
                raise HTTPException(409, "실패했거나 확인이 필요한 작업만 재시도할 수 있습니다.")
            if job.get('source')=='broadcast-album':
                job['retryRequests']=[]
                for path in jobs.folder(job_id).glob('*.json'):
                    if '.previous-' in path.name: continue
                    record=json.loads(path.read_text(encoding='utf-8'))
                    if isinstance(record,dict) and record.get('state') in ('requested','failed','responded'):
                        job['retryRequests'].append(path.name)
            job.update(status="queued", message="다시 분석 대기 중")
            jobs.save(job)  # 사용량 카운터는 초기화하지 않는다.
            jobs.queue.put(job_id)
            return job

    @app.post("/jobs/{job_id}/metadata")
    def metadata_review(job_id: str):
        with jobs.lock:
            job = jobs.read(job_id)
            if job["status"] not in ("done", "review") or not job.get("tracks"):
                raise HTTPException(409, "곡 분석이 완료된 작업만 정보를 재검토할 수 있습니다.")
            if not job["options"].get("cloudFallback"):
                raise HTTPException(409, "이 녹음은 Gemini 보완이 꺼져 있습니다.")
            if job["cloudCalls"] >= 10 or job["options"]["maxCloudSeconds"] <= 0:
                raise HTTPException(409, "앱의 파일당 Gemini 호출 한도 또는 전송 설정을 확인하세요. 사용량은 초기화하지 않습니다.")
            if not all((jobs.folder(job_id) / name).is_file() for name in ("source.wav", "asr-input.json", "asr-output.jsonl", "moss-output.jsonl")):
                raise HTTPException(409, "곡 정보 재검토에 필요한 전사 또는 원본 분석 파일이 없습니다.")
            job.update(status="queued", metadataOnly=True, message="곡 정보만 재검토 대기 중")
            jobs.save(job)
            jobs.queue.put(job_id)
            return job

    @app.post("/jobs/{job_id}/tracks/{track_id}")
    async def edit(job_id: str, track_id: int, request: Request):
        body = await request.body()
        if len(body) > 16000:
            raise HTTPException(413, "수정 내용이 너무 큽니다.")
        try:
            data = json.loads(body)
            import math
            start, end = float(data["start"]), float(data["end"])
            if not all(math.isfinite(v) for v in (start, end)):
                raise ValueError()
            if any(not isinstance(data.get(k), str) or len(data[k]) > 500 for k in FIELDS):
                raise ValueError()
        except (ValueError, TypeError, KeyError):
            raise HTTPException(400, "곡 정보와 시작·종료 초를 확인하세요.") from None
        with jobs.lock:
            job = jobs.read(job_id)
            if job["status"] not in ("done", "review"):
                raise HTTPException(409, "분석이 끝난 뒤 수정할 수 있습니다.")
            track = next((t for t in job["tracks"] if t["id"] == track_id), None)
            if not track or not 0 <= start < end <= job["duration"]:
                raise HTTPException(400, "원본 범위 안에서 시작·종료 초를 지정하세요.")
            if any(t["id"] != track_id and start < t["end"] and end > t["start"] for t in job["tracks"]):
                raise HTTPException(400, "다른 곡과 구간이 겹칩니다.")
            old_status = job["status"]
            job["status"] = "editing"
            jobs.save(job)
        updated = dict(track, start=start, end=end, **{k: data[k].strip() for k in FIELDS})
        updated.update(review=any(not updated[k] for k in FIELDS), source="user", uncertain=False)
        try:
            await run_in_threadpool(export_track, jobs.folder(job_id), updated)
        except Exception:
            job["status"] = old_status
            jobs.save(job)
            raise HTTPException(500, "곡 파일을 다시 저장하지 못했습니다. 기존 파일을 보존했습니다.") from None
        track.update(updated)
        job["status"] = "review" if job.get("unresolved") or any(t["review"] for t in job["tracks"]) else "done"
        job["message"] = f"{len(job['tracks'])}곡 저장" + (" · 확인 필요" if job["status"] == "review" else "")
        jobs.save(job)
        return job

    @app.get("/jobs/{job_id}/files/{filename}")
    def download(job_id: str, filename: str):
        job = jobs.read(job_id)
        folder = jobs.folder(job_id)
        if filename == "original":
            if job["status"] == "recording":
                raise HTTPException(409, "녹음 구간이 끝난 뒤 원본을 내려받으세요.")
            if job.get('source')=='broadcast-album':
                return FileResponse(folder/'source.wav',filename='방송-통합원본.wav',media_type='audio/wav')
            return FileResponse(folder / "original.bin", filename="원본-녹음.m4a" if job.get("source") == "server-recorder" else "원본-녹음.bin")
        if filename == "source":
            path = folder / "source.wav"
            if not path.exists():
                raise HTTPException(404, "미리 듣기 파일이 준비되지 않았습니다.")
            return FileResponse(path, media_type="audio/wav")
        match = re.fullmatch(r"track-(\d+)\.flac", filename)
        track = next((t for t in job["tracks"] if match and t["id"] == int(match[1])), None)
        if not track or not (folder / filename).is_file():
            raise HTTPException(404, "곡 파일이 없습니다.")
        name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", track["title"] or "곡명 미확인")[:120]
        return FileResponse(folder / filename, media_type="audio/flac", filename=f"{track['id']:02d} {name}.flac")

    @app.get("/jobs/{job_id}/preview")
    def preview(job_id: str, start: float, end: float):
        job = jobs.read(job_id)
        import math
        if (not math.isfinite(start) or not math.isfinite(end)
                or not 0 <= start < end <= job.get("duration", 0) or end - start > 180):
            raise HTTPException(400, "미리 듣기는 원본 범위 안에서 180초 이내로 지정하세요.")
        folder = jobs.folder(job_id)
        handle, name = tempfile.mkstemp(prefix="preview-", suffix=".wav", dir=folder)
        os.close(handle)
        path = Path(name)
        try:
            clip(folder / "source.wav", path, start, end)
        except Exception:
            path.unlink(missing_ok=True)
            raise HTTPException(500, "원본 구간을 열지 못했습니다.") from None
        return FileResponse(path, media_type="audio/wav", background=BackgroundTask(path.unlink, missing_ok=True))

    @app.get("/jobs/{job_id}/archive")
    def archive(job_id: str):
        with jobs.lock:
            job = jobs.read(job_id)
            if job["status"] not in ("done", "review"):
                raise HTTPException(409, "분석이 끝난 뒤 다운로드하세요.")
            folder = jobs.folder(job_id)
            handle, name = tempfile.mkstemp(prefix="tracks-", suffix=".zip", dir=folder)
            os.close(handle)
            path = Path(name)
            with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_STORED) as out:
                for track in job["tracks"]:
                    out.write(folder / f"track-{track['id']}.flac", f"track-{track['id']}.flac")
                out.writestr("곡정보.json", json.dumps(job, ensure_ascii=False, indent=2))
            return FileResponse(path, filename="분리된-곡.zip", media_type="application/zip",
                                background=BackgroundTask(path.unlink, missing_ok=True))

    return app


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(create_app(), host="127.0.0.1", port=8766, access_log=False)
