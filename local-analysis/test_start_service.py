import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx
import start_service


class WatchdogTests(unittest.TestCase):
    def test_retries_after_failure_and_respects_manual_stop(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            count = []
            def tick(_):
                count.append(1)
                if len(count) == 2:
                    (root / "service.stopped").touch()
            with patch.object(start_service, "DATA", root), \
                 patch.object(start_service, "start", side_effect=[RuntimeError("private"), None]) as start, \
                 patch.object(start_service.time, "sleep", side_effect=tick):
                start_service.watch()
                self.assertEqual(start.call_count, 2)
                start_service.watch()
                self.assertEqual(start.call_count, 2)
            log = (root / "watchdog.log").read_text(encoding="utf-8")
            self.assertIn("RuntimeError", log)
            self.assertNotIn("private", log)

    def test_slow_or_unauthorized_server_is_not_replaced(self):
        for result in [httpx.ReadTimeout("busy"), httpx.Response(401)]:
            with patch.object(start_service, "load_config", return_value={"token": "test"}), \
                 patch.object(start_service.httpx, "get", side_effect=result if isinstance(result, Exception) else None,
                              return_value=result), \
                 patch.object(start_service.subprocess, "Popen") as spawn:
                with self.assertRaises((httpx.ReadTimeout, RuntimeError)):
                    start_service.start()
                spawn.assert_not_called()


if __name__ == "__main__":
    unittest.main()
