"""기존 채널 목록과 방송사 편성표를 PC 녹음에서도 사용한다."""
from datetime import datetime, timedelta, timezone
from pathlib import Path
import re
import time
from urllib.parse import urlparse

import httpx

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent


def stations():
    result = {}
    for block in re.findall(r'\{ id: "[^"\n]+"[^\n]+\}', (ROOT / "stations.js").read_text(encoding="utf-8")):
        item = dict(re.findall(r'(\w+): "([^"\n]*)"', block))
        if item.get("id") and item.get("type"):
            item["scheduleSupported"] = item["id"] not in ("gugak", "febc")
            item["rerunSupported"] = item["type"] == "kbs-api"
            result[item["id"]] = item
    return result


def minutes(value):
    match = re.match(r"^(\d{1,2}):?(\d{2})", str(value or ""))
    if not match or int(match[2]) >= 60 or int(match[1]) > 47:
        raise ValueError("편성 시각 형식 오류")
    return int(match[1]) * 60 + int(match[2])


def normalize_schedule(items, date):
    midnight = datetime.combine(date, datetime.min.time(), KST)
    normalized = []
    for item in items:
        try:
            start = item["startMin"]
            if not isinstance(start, (int, float)) or not item.get("title"):
                continue
            end = item.get("endMin")
            normalized.append(dict(item, startMin=start, endMin=end))
        except (ValueError, TypeError, KeyError):
            continue
    normalized.sort(key=lambda item: item["startMin"])
    result = []
    for i, item in enumerate(normalized):
        start = item["startMin"]
        end = item["endMin"]
        if end is None:
            end = normalized[i + 1]["startMin"] if i + 1 < len(normalized) else 1440
        if end <= start:
            end += 1440
        if not 0 < end - start <= 1440:
            continue
        result.append({"start": (midnight + timedelta(minutes=start)).timestamp(),
                       "end": (midnight + timedelta(minutes=end)).timestamp(),
                       "title": str(item["title"])[:200], "rerun": item.get("rerun")})
    return result


class RadioSources:
    def __init__(self):
        self.stations = stations()
        self.cache = {}

    def request(self, url, **kwargs):
        response = httpx.get(url, timeout=12, follow_redirects=True, **kwargs)
        response.raise_for_status()
        return response

    def stream(self, station_id):
        station = self.stations[station_id]
        if station["type"] == "direct":
            url = station["streamUrl"]
        else:
            response = self.request(station["apiUrl"])
            url = response.json()["channel_item"][0]["service_url"] if station["type"] == "kbs-api" else response.text.strip()
        if not isinstance(url, str) or urlparse(url).scheme not in ("http", "https"):
            raise ValueError("방송 스트림 주소가 올바르지 않습니다.")
        return url

    def schedule(self, station_id, date):
        key = (station_id, date.isoformat())
        if key in self.cache and self.cache[key][0] > time.monotonic():
            value = self.cache[key][1]
            if value is None:
                raise ValueError("편성표 재조회 대기 중")
            return value
        try:
            value = self.fetch_schedule(station_id, date)
        except Exception:
            self.cache[key] = (time.monotonic() + 60, None)
            raise ValueError("편성표를 확인하지 못했습니다.") from None
        self.cache[key] = (time.monotonic() + 900, value)
        for old in list(self.cache):
            if old[1] < (date - timedelta(days=2)).isoformat():
                self.cache.pop(old, None)
        return value

    def fetch_schedule(self, station_id, date):
        station = self.stations[station_id]
        ymd = date.strftime("%Y%m%d")
        items = []
        if station["type"] == "kbs-api":
            code = station["apiUrl"].rsplit("/", 1)[-1]
            data = self.request("https://static.api.kbs.co.kr/mediafactory/v1/schedule/weekly", params={
                "local_station_code": "00", "channel_code": code,
                "program_planned_date_from": ymd, "program_planned_date_to": ymd}).json()
            rows = next((day.get("schedules", []) for day in data if day.get("program_planned_date") == ymd), [])
            for row in rows:
                items.append({"startMin": minutes(str(row.get("program_planned_start_time", ""))[:4]),
                    "endMin": minutes(str(row.get("program_planned_end_time", ""))[:4]),
                    "title": row.get("programming_table_title") or row.get("program_title"),
                    "rerun": {"재방": True, "본방": False}.get(row.get("rerun_classification"))})
        elif station["group"] == "mbc":
            rows = self.request("https://control.imbc.com/Schedule/Radio", params={"sDate": ymd,
                "sType": "FM" if station_id == "mbcsfm" else "FM4U"}).json()
            items = [{"startMin": minutes(row["StartTime"]), "endMin": minutes(row["EndTime"]),
                      "title": row.get("Title")} for row in rows if not row.get("BroadDate") or row["BroadDate"] == date.isoformat()]
        elif station["group"] == "sbs":
            code = "Love" if station_id == "sbslove" else "Power"
            rows = self.request(f"https://static.cloud.sbs.co.kr/schedule/{date.year}/{date.month}/{date.day}/{code}.json").json()
            items = [{"startMin": minutes(row["start_time"]), "endMin": minutes(row["end_time"]), "title": row.get("title")} for row in rows]
        elif station["scheduleSupported"]:
            rows = self.request("https://cantabile.tplinkdns.com:3689/", params={"schedule": station_id, "date": ymd}).json().get("items", [])
            items = [{"startMin": row.get("startMin") if row.get("startMin") is not None else minutes(row.get("start")),
                      "endMin": row.get("endMin") if row.get("endMin") is not None else minutes(row["end"]) if row.get("end") else None,
                      "title": row.get("title")} for row in rows]
        return normalize_schedule(items, date)

    def current(self, station_id, now):
        date = datetime.fromtimestamp(now, KST).date()
        for day in (date, date - timedelta(days=1)):
            try:
                match = next((item for item in self.schedule(station_id, day) if item["start"] <= now < item["end"]), None)
                if match:
                    return match
            except ValueError:
                pass
        return None
