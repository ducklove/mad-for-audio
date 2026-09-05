import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient
from pipeline import Pipeline, duration, export_track, ffmpeg, ground_metadata, merge_music, parse_segments, run, spoken_credits
from server import create_app
from cloud_config import load_cloud_keys, cloud_connection


def segment(start, end, kind="music", title="소나타", **kw):
    return dict(start=start, end=end, kind=kind, title=title, composer="모차르트", performer="김연주",
                evidence="모차르트 소나타 김연주", uncertain=False, **kw)


class AnalysisTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(os.environ, {"OPENROUTER_API_KEY": "", "GEMINI_API_KEY": ""})
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.config = {"token": "test-" * 8, "geminiApiKey": "", "maxCloudSeconds": 600,
                       "modelPython": "missing", "mossSource": "missing", "modelCache": str(self.root)}
        self.app = create_app(self.root, self.config, start_worker=False)
        self.client = TestClient(self.app, base_url="http://127.0.0.1")
        self.headers = {"Authorization": "Bearer " + self.config["token"]}

    def tearDown(self):
        self.temp.cleanup()

    def test_origin_auth_and_idempotent_upload(self):
        self.assertEqual(self.client.get("/jobs").status_code, 401)
        self.assertEqual(self.client.get("/jobs", headers={**self.headers, "Origin": "https://evil.test"}).status_code, 403)
        self.assertEqual(self.client.get("/jobs", headers={**self.headers, "Host": "evil.test"}).status_code, 403)
        preflight = self.client.options("/jobs", headers={"Origin": "https://ducklove.github.io",
            "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "authorization,x-mfa-meta"})
        self.assertEqual(preflight.status_code, 200)
        self.assertEqual(preflight.headers["access-control-allow-private-network"], "true")
        job_id = str(uuid4())
        url = f"/jobs/{job_id}"
        self.assertEqual(self.client.put(url, headers=self.headers, content=b"first").status_code, 200)
        self.assertEqual(self.client.put(url, headers=self.headers, content=b"second").status_code, 200)
        self.assertEqual((self.root / "jobs" / job_id / "original.bin").read_bytes(), b"first")
        self.assertEqual(self.app.state.jobs.queue.qsize(), 1)
        self.assertEqual(self.client.get("/jobs/not-a-uuid", headers=self.headers).status_code, 400)

    def test_bad_coverage_does_not_silently_lose_audio(self):
        for items in ([segment(1, 10)], [segment(0, 6), segment(5, 10)],
                      [segment(0, float("nan"))], [], [segment(0, 12)]):
            with self.assertRaises(ValueError):
                parse_segments(json.dumps({"segments": items}), 10)
        self.assertEqual(len(parse_segments(json.dumps({"segments": [segment(0, 10)]}), 10)), 1)

    def test_metadata_requires_transcript_evidence(self):
        result = ground_metadata(segment(0, 10), "쇼팽 야상곡을 듣습니다")
        self.assertFalse(result["composer"])
        self.assertFalse(result["evidence"])
        result = ground_metadata(segment(0, 10), "다음은 모차르트 소나타 김연주입니다")
        self.assertEqual(result["composer"], "모차르트")
        self.assertEqual(result["performer"], "김연주")

    def test_merge_respects_music_changes_and_speech(self):
        tracks = merge_music([segment(10, 60), segment(60, 90), segment(90, 110, title="협주곡"),
                              segment(110, 115, "speech"), segment(115, 140, title="협주곡")], 160)
        self.assertEqual([(t["start"], t["end"]) for t in tracks], [(10, 90), (90, 110), (115, 140)])
        # 오디오 전용 창에서 모델이 임의로 10초씩 나눠도 같은 연속 음악은 한 트랙이다.
        tracks = merge_music([ground_metadata(segment(i, i + 10), "") for i in range(0, 90, 10)], 100)
        self.assertEqual(len(tracks), 1)
        self.assertFalse(tracks[0]["title"])
        self.assertFalse(tracks[0]["evidence"])

    def test_spoken_credits_do_not_mix_previous_and_next_piece(self):
        text = "세레나데 3번이었습니다. 김연주의 플루트와 이연주의 기타 연주였습니다. 다음 곡은 모차르트의 협주곡입니다. 2악장 아다지오를 박연주의 피아노와 서울 악단의 연주로 전해드리겠습니다."
        before, after = spoken_credits(text, False), spoken_credits(text, True)
        self.assertEqual(before["title"], "세레나데 3번")
        self.assertFalse(before["composer"])
        self.assertIn("김연주", before["performer"])
        self.assertNotIn("박연주", before["performer"])
        self.assertEqual(after["composer"], "모차르트")
        self.assertEqual(after["title"], "협주곡")
        self.assertIn("박연주", after["performer"])
        self.assertNotIn("김연주", after["performer"])
        self.assertFalse(spoken_credits("세레나데 3번이었습니다.", True))

    def test_no_key_or_exhausted_budget_never_calls_cloud(self):
        job = {"options": {"maxCloudSeconds": 10}, "cloudCalls": 0, "cloudSeconds": 0}
        with patch("pipeline.httpx.post") as post:
            with self.assertRaises(ValueError):
                Pipeline(self.config).gemini([(Path("unused"), 0, 5)], "", job, lambda _: None)
            self.config["geminiApiKey"] = "test"
            with self.assertRaises(ValueError):
                Pipeline(self.config).gemini([(Path("unused"), 0, 15)], "", job, lambda _: None)
            post.assert_not_called()

    def test_restart_requires_retry_and_keeps_cloud_usage(self):
        job_id = str(uuid4())
        jobs = self.app.state.jobs
        jobs.save({"id": job_id, "name": "중단된 방송", "createdAt": 1, "status": "running",
                   "cloudSeconds": 120, "cloudCalls": 1})
        jobs.start()
        jobs.queue.put(None)
        jobs.worker.join(timeout=2)
        self.assertEqual(jobs.read(job_id)["status"], "error")
        response = self.client.post(f"/jobs/{job_id}/retry", headers=self.headers)
        self.assertEqual(response.json()["cloudSeconds"], 120)
        self.assertEqual(response.json()["cloudCalls"], 1)
        self.assertEqual(response.json()["status"], "queued")

    def test_cloud_usage_is_reserved_before_failure(self):
        import httpx
        self.config["geminiApiKey"] = "test-key"
        clip_path = self.root / "clip.wav"
        clip_path.write_bytes(b"test audio")
        job = {"options": {"maxCloudSeconds": 120}, "cloudCalls": 0, "cloudSeconds": 0}
        snapshots = []
        with patch("pipeline.httpx.post", return_value=httpx.Response(503)) as post:
            with self.assertRaises(ValueError):
                Pipeline(self.config).gemini([(clip_path, 0, 60)], "테스트", job, lambda j: snapshots.append(dict(j)))
            self.assertEqual(post.call_count, 1)
            self.assertEqual(snapshots[0]["cloudSeconds"], 60)
            self.assertEqual(snapshots[0]["cloudCalls"], 1)
            self.assertNotIn("test-key", str(snapshots))

    def test_dotenv_keys_are_private_and_openrouter_takes_precedence(self):
        env_path = self.root / ".env"
        env_path.write_text('\ufeffOPENROUTER_API_KEY="router-test"\nGEMINI_API_KEY=google-test\nIGNORED_SETTING=1\n', encoding="utf-8")
        loaded = load_cloud_keys(dict(self.config), env_path)
        self.assertEqual(cloud_connection(loaded), ("openrouter", "google/gemini-3.8-flash", "router-test"))
        self.assertNotIn("IGNORED_SETTING", loaded)
        self.assertFalse(os.environ.get("OPENROUTER_API_KEY"))
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "environment-test"}):
            self.assertEqual(load_cloud_keys({}, env_path)["openrouterApiKey"], "environment-test")
        client = TestClient(create_app(self.root, loaded, start_worker=False), base_url="http://127.0.0.1")
        response = client.get("/health", headers=self.headers)
        self.assertTrue(response.json()["geminiConfigured"])
        self.assertEqual(response.json()["geminiProvider"], "openrouter")
        self.assertNotIn("router-test", response.text)
        self.assertNotIn("google-test", response.text)

    def test_pairing_requires_auth_to_issue_and_is_origin_bound_one_use(self):
        self.assertEqual(self.client.post("/connection-link").status_code, 401)
        response = self.client.post("/connection-link", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        ticket = response.json()["url"].split("pc-analysis-pair=")[1]
        self.assertNotIn(self.config["token"], response.text)
        headers = {"Authorization": "Bearer " + ticket, "Origin": "https://ducklove.github.io"}
        self.assertEqual(self.client.post("/pair", headers={"Authorization": "Bearer " + ticket}).status_code, 403)
        self.assertEqual(self.client.post("/pair", headers={**headers, "Origin": "https://evil.test"}).status_code, 403)
        claimed = self.client.post("/pair", headers=headers)
        self.assertEqual(claimed.json()["token"], self.config["token"])
        self.assertEqual(claimed.headers["cache-control"], "no-store")
        self.assertEqual(self.client.post("/pair", headers=headers).status_code, 401)
        link = self.client.post("/connection-link", headers=self.headers).json()["url"]
        import time
        with patch("server.time.monotonic", return_value=time.monotonic() + 121):
            self.assertEqual(self.client.post("/pair", headers={**headers,
                "Authorization": "Bearer " + link.split("pc-analysis-pair=")[1]}).status_code, 401)

    def test_openrouter_audio_json_usage_and_failures(self):
        import httpx
        self.config["openrouterApiKey"] = "router-test"
        audio = self.root / "clip.wav"
        audio.write_bytes(b"audio")
        job = {"options": {"maxCloudSeconds": 30}, "cloudCalls": 0, "cloudSeconds": 0}
        response = {"choices": [{"finish_reason": "stop", "message": {"content": '{"title":"곡"}'}}],
                    "usage": {"prompt_tokens": 50, "completion_tokens": 10, "cost": 0.0001}}
        with patch("pipeline.httpx.post", return_value=httpx.Response(200, json=response)) as post:
            result = Pipeline(self.config).gemini([(audio, 10, 15)], "분석", job, lambda _: None)
            self.assertEqual(json.loads(result)["title"], "곡")
            self.assertEqual(post.call_args.args[0], "https://openrouter.ai/api/v1/chat/completions")
            payload = post.call_args.kwargs["json"]
            self.assertEqual(payload["model"], "google/gemini-3.8-flash")
            self.assertEqual(payload["messages"][0]["content"][2]["input_audio"]["format"], "wav")
            self.assertEqual(job["usage"][0]["cost"], 0.0001)
            self.assertEqual(job["cloudSeconds"], 5)
            self.assertNotIn("router-test", json.dumps(job))
        for response in (httpx.Response(401), httpx.Response(200, json={"error": {"message": "private"}}),
                         httpx.Response(200, json={"choices": [{"finish_reason": "length"}]})):
            with patch("pipeline.httpx.post", return_value=response) as post:
                with self.assertRaises(ValueError) as error:
                    Pipeline(self.config).gemini([(audio, 0, 5)], "분석", job, lambda _: None)
                self.assertEqual(post.call_count, 1)
                self.assertNotIn("private", str(error.exception))
        self.assertEqual(job["cloudCalls"], 4)
        self.assertEqual(job["cloudSeconds"], 20)

    def test_real_ffmpeg_pipeline_tags_edit_and_zip(self):
        job_id = str(uuid4())
        folder = self.app.state.jobs.folder(job_id)
        folder.mkdir()
        source = folder / "sample.wav"
        ffmpeg("-f", "lavfi", "-i", "sine=frequency=440:duration=12", source)
        (folder / "original.bin").write_bytes(source.read_bytes())
        job = {"id": job_id, "name": "검증 방송", "status": "running", "createdAt": 1,
               "cloudSeconds": 0, "cloudCalls": 0, "tracks": [],
               "options": {"cloudFallback": False, "maxCloudSeconds": 600}}
        pipeline = Pipeline(self.config)
        data = json.dumps({"segments": [segment(0, 2, "speech"), segment(2, 10), segment(10, 12, "speech")]})
        with patch.object(pipeline, "model", side_effect=[{0: "모차르트 소나타 김연주"}, {0: data}]):
            pipeline.process(folder, job, self.app.state.jobs.save)
        self.assertEqual(job["status"], "done")
        self.assertAlmostEqual(duration(folder / "track-1.flac"), 8, places=2)
        probe = json.loads(run(["ffprobe", "-v", "error", "-show_format", "-of", "json", folder / "track-1.flac"]))
        tags = {k.lower(): v for k, v in probe["format"]["tags"].items()}
        self.assertEqual(tags["composer"], "모차르트")
        self.assertEqual(tags["artist"], "김연주")
        response = self.client.post(f"/jobs/{job_id}/tracks/1", headers=self.headers,
            json={"start": 3, "end": 9, "title": "변경 곡", "composer": "변경 작곡가", "performer": "변경 연주자"})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertAlmostEqual(duration(folder / "track-1.flac"), 6, places=2)
        response = self.client.get(f"/jobs/{job_id}/archive", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content.startswith(b"PK"))
        response = self.client.get(f"/jobs/{job_id}/preview?start=1&end=3", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content.startswith(b"RIFF"))
        self.assertEqual(self.client.get(f"/jobs/{job_id}/preview?start=-1&end=3", headers=self.headers).status_code, 400)
        self.assertTrue((folder / "original.bin").exists())

    def test_local_runtime_failure_does_not_send_whole_recording(self):
        pipeline = Pipeline(self.config)
        folder = self.root / "failure"
        folder.mkdir()
        wav = folder / "original.wav"
        ffmpeg("-f", "lavfi", "-i", "sine=duration=1", wav)
        (folder / "original.bin").write_bytes(wav.read_bytes())
        with patch.object(pipeline, "model", side_effect=RuntimeError("모델 미설치")), patch.object(pipeline, "gemini") as cloud:
            with self.assertRaises(RuntimeError):
                pipeline.process(folder, {"options": {"cloudFallback": True}}, lambda _: None)
            cloud.assert_not_called()

    def test_overlapping_window_keeps_announcement_coordinates(self):
        folder = self.root / "overlap"
        folder.mkdir()
        source = folder / "input.wav"
        ffmpeg("-f", "lavfi", "-i", "sine=duration=90", source)
        (folder / "original.bin").write_bytes(source.read_bytes())
        text = "다음 곡은 모차르트의 협주곡입니다. 2악장을 박연주의 피아노와 서울 악단의 연주로 전해드리겠습니다."
        outputs = {i: json.dumps({"segments": [dict(segment(0, edge, "speech"), title="", composer="", performer="", evidence=""),
            dict(segment(edge, end), title="", composer="", performer="", evidence="")]})
            for i, edge, end in [(0, 80, 90), (1, 50, 60)]}
        job = {"status": "running", "cloudSeconds": 0, "cloudCalls": 0,
               "options": {"cloudFallback": False, "maxCloudSeconds": 0}}
        pipeline = Pipeline(self.config)
        with patch.object(pipeline, "model", side_effect=[{0: text, 1: text}, outputs]):
            pipeline.process(folder, job, lambda _: None)
        self.assertEqual(len(job["tracks"]), 1)
        self.assertEqual(job["tracks"][0]["start"], 80)
        self.assertEqual(job["tracks"][0]["composer"], "모차르트")
        self.assertIn("박연주", job["tracks"][0]["performer"])
        self.assertTrue(job["tracks"][0]["review"])


if __name__ == "__main__":
    unittest.main()
