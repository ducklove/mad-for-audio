from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from connect_app import check_app_closed, launch_desktop, validate_link


class ConnectAppTests(unittest.TestCase):
    def test_only_official_one_time_links_are_accepted(self):
        valid = "https://ducklove.github.io/mad-for-audio/#pc-analysis-pair=" + "a" * 43
        self.assertEqual(validate_link(valid), valid)
        for invalid in (valid.replace("ducklove.github.io", "example.com"),
                        valid.replace("https:", "http:"),
                        valid.replace("/#", "/?key=secret#"), valid[:-1]):
            with self.assertRaises(RuntimeError):
                validate_link(invalid)

    def test_running_app_is_left_untouched(self):
        executable = Path("radio/Mad for Audio.exe")
        process = SimpleNamespace(info={"exe": str(executable.resolve())})
        with patch("connect_app.psutil.process_iter", return_value=[process]), patch("connect_app.subprocess.Popen") as launch:
            with self.assertRaisesRegex(RuntimeError, "종료"):
                launch_desktop(executable, "https://ducklove.github.io/mad-for-audio/#pc-analysis-pair=" + "a" * 43)
            launch.assert_not_called()

    def test_desktop_receives_only_ticket_and_not_cloud_keys(self):
        executable = Path("radio/Mad for Audio.exe")
        url = "https://ducklove.github.io/mad-for-audio/#pc-analysis-pair=" + "a" * 43
        with patch("connect_app.psutil.process_iter", return_value=[]), patch("connect_app.subprocess.Popen") as launch, patch.dict("connect_app.os.environ", {"OPENROUTER_API_KEY": "secret", "GEMINI_API_KEY": "secret"}):
            launch_desktop(executable, url)
            args, kwargs = launch.call_args
            self.assertEqual(args[0], [str(executable)])
            self.assertEqual(kwargs["env"]["MFA_TRAY_HOME"], url)
            self.assertNotIn("OPENROUTER_API_KEY", kwargs["env"])
            self.assertNotIn("GEMINI_API_KEY", kwargs["env"])


if __name__ == "__main__":
    unittest.main()
