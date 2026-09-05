from copy import deepcopy
from datetime import datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import json
from pathlib import Path
import tempfile
import threading
import time
import unittest
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient
from pipeline import ffmpeg
from radio_sources import KST, RadioSources, normalize_schedule, stations
from recorder import Recorder, default_rule, plan, recording_window, validate_rules
from server import Jobs, create_app


class Sources:
    stations = stations()

    def current(self, station_id, now):
        return {"start": now - 100, "end": now + 600, "title": "정규 방송", "rerun": False}


class RecorderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.config = {"token": "test" * 10, "modelPython": "missing", "mossSource": "missing"}
        self.jobs = Jobs(self.root, self.config)
        self.sources = Sources()
        self.recorder = Recorder(self.root, self.config, self.jobs, self.sources)

    def test_catalog_uses_every_client_channel_and_rejects_arbitrary_urls(self):
        self.assertEqual(len(self.sources.stations), 15)
        with self.assertRaises(ValueError):
            validate_rules({"rules": [default_rule() | {"stationId": "http://evil.test"}]}, self.sources.stations)
        with self.assertRaises(ValueError):
            validate_rules({"rules": [default_rule(), default_rule()]}, self.sources.stations)
        with self.assertRaises(ValueError):
            validate_rules({"rules": [default_rule() | {"stationId": "cbsmusic"}]}, self.sources.stations)

    def test_overnight_weekdays_and_midnight_end(self):
        monday = datetime(2026, 9, 7, 23, 30, tzinfo=KST)
        rule = default_rule() | {"startMinute": 23 * 60, "endMinute": 60, "weekdays": [0]}
        end = datetime(2026, 9, 8, 1, tzinfo=KST).timestamp()
        self.assertEqual(recording_window(rule, monday.timestamp()), end)
        self.assertEqual(recording_window(rule, (monday + timedelta(hours=1)).timestamp()), end)
        self.assertIsNone(recording_window(rule, end))
        self.assertIsNone(recording_window(rule, (monday + timedelta(days=1)).timestamp()))
        self.assertEqual(recording_window(default_rule(), monday.timestamp()), datetime(2026, 9, 8, tzinfo=KST).timestamp())

    def test_kbs_broadcast_day_beyond_24_hours(self):
        date = datetime(2026, 9, 5, tzinfo=KST).date()
        normalized = normalize_schedule([{"startMin": 1500, "endMin": 1620, "title": "재방", "rerun": True}], date)
        self.assertEqual(datetime.fromtimestamp(normalized[0]["start"], KST).hour, 1)
        self.assertEqual(datetime.fromtimestamp(normalized[0]["start"], KST).day, 6)
        source = RadioSources()
        with patch.object(source, "schedule", side_effect=[[], normalized]):
            self.assertTrue(source.current("kbs1fm", datetime(2026, 9, 6, 2, tzinfo=KST).timestamp())["rerun"])

    def test_program_selection_reruns_and_unknown_schedule(self):
        now = time.time()
        rule = default_rule()
        target, _ = plan(rule, now, self.sources)
        self.assertLessEqual(target["end"] - now, 600)
        with patch.object(self.sources, "current", return_value={"start": now - 1, "end": now + 100, "title": "재방 프로그램", "rerun": True}):
            self.assertIsNone(plan(rule, now, self.sources)[0])
        with patch.object(self.sources, "current", return_value=None):
            self.assertIsNone(plan(rule, now, self.sources)[0])
            self.assertIsNotNone(plan(rule | {"excludeReruns": False}, now, self.sources)[0])
            self.assertIsNone(plan(rule | {"excludeReruns": False, "programs": ["선택 방송"]}, now, self.sources)[0])
        self.assertIsNone(plan(rule | {"programs": ["다른 방송"]}, now, self.sources)[0])
        self.assertIsNotNone(plan(rule | {"programs": ["정규 방송"]}, now, self.sources)[0])

    def test_settings_persist_and_secrets_are_not_exposed(self):
        rules = [default_rule() | {"enabled": True}, default_rule() | {"stationId": "cbsmusic", "excludeReruns": False, "splitTracks": False}]
        self.recorder.update({"rules": rules})
        restored = Recorder(self.root, self.config, self.jobs, self.sources)
        self.assertEqual(restored.snapshot()["rules"], rules)
        self.assertNotIn(self.config["token"], json.dumps(restored.snapshot()))
        self.assertNotIn("apiUrl", json.dumps(restored.snapshot()))

    def test_channels_capture_concurrently(self):
        rules = [default_rule() | {"enabled": True}, default_rule() | {"stationId": "kbs2fm", "enabled": True}]
        self.recorder.update({"rules": rules})
        barrier = threading.Barrier(2)
        seen = []
        def capture(rule, target):
            seen.append(rule["stationId"])
            barrier.wait(timeout=3)
            self.recorder.shutdown.set()
        with patch.object(self.recorder, "capture", side_effect=capture):
            self.recorder.start()
            for thread in self.recorder.threads.values():
                thread.join(timeout=5)
            self.recorder.close()
        self.assertCountEqual(seen, ["kbs1fm", "kbs2fm"])

    def test_authenticated_api_settings_and_original_download(self):
        app = create_app(self.root, self.config, start_worker=False)
        client = TestClient(app, base_url="http://127.0.0.1")
        headers = {"Authorization": "Bearer " + self.config["token"]}
        self.assertEqual(client.get("/recorder").status_code, 401)
        self.assertEqual(client.put("/recorder", headers=headers, json={"rules": [default_rule()]}).status_code, 200)
        self.assertEqual(client.put("/recorder", headers=headers, json={"rules": [default_rule() | {"weekdays": []}]}).status_code, 400)
        self.assertTrue(client.get("/health", headers=headers).json()["serverRecorder"])

    def test_real_ffmpeg_recording_and_single_analysis_enqueue(self):
        fixture = self.root / "broadcast.ts"
        ffmpeg("-f", "lavfi", "-i", "sine=frequency=440:duration=6", "-c:a", "aac", "-f", "mpegts", fixture)
        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, *_):
                pass
        server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(self.root)))
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            self.sources.stream = lambda _: f"http://127.0.0.1:{server.server_port}/broadcast.ts"
            for split in (False, True):
                rule = default_rule() | {"enabled": True, "splitTracks": split}
                self.recorder.update({"rules": [rule]})
                self.recorder.capture(rule, {"title": "실제 FFmpeg 검증", "end": time.time() + 4, "rerun": False})
                job = self.jobs.listing()[0]
                self.assertEqual(job["status"], "queued" if split else "recorded")
                self.assertGreater(job["duration"], 2)
                self.assertGreater((self.jobs.folder(job["id"]) / "original.bin").stat().st_size, 10000)
            self.assertEqual(self.jobs.queue.qsize(), 1)
            job = self.jobs.read(self.jobs.queue.get_nowait())
            self.assertTrue(job["options"]["cloudFallback"])
            self.assertEqual(job["options"]["maxCloudSeconds"], 600)
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def test_recording_recovery_preserves_original_without_killing_unrelated_pid(self):
        job_id = str(uuid4())
        folder = self.jobs.folder(job_id)
        folder.mkdir()
        ffmpeg("-f", "lavfi", "-i", "sine=duration=2", "-f", "mp4", folder / "original.bin")
        job = {"id": job_id, "createdAt": 1, "status": "recording", "splitTracks": False, "recorderPid": 123}
        self.jobs.save(job)
        with patch("recorder.psutil.Process") as process:
            process.return_value.name.return_value = "unrelated.exe"
            self.recorder.recover(job)
            process.return_value.terminate.assert_not_called()
        self.assertEqual(self.jobs.read(job_id)["status"], "recorded")
        self.assertTrue((folder / "original.bin").exists())


if __name__ == "__main__":
    unittest.main()
