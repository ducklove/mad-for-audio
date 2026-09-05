"""클라우드 키는 서버 메모리에서만 읽고 모델 프로세스나 브라우저로 보내지 않는다."""
import os
from pathlib import Path

from dotenv import dotenv_values

GEMINI_MODEL = "gemini-3.8-flash"
OPENROUTER_MODEL = "google/" + GEMINI_MODEL
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def load_cloud_keys(config, env_path=ENV_PATH):
    # 현재 디렉터리를 탐색하지 않고 저장소 루트의 지정 파일만 읽는다.
    # 보간을 끄고 허용된 키만 취해 다른 .env 설정을 서비스 환경에 주입하지 않는다.
    values = dotenv_values(env_path, encoding="utf-8-sig", interpolate=False) if env_path.is_file() else {}
    for field, variable in (("openrouterApiKey", "OPENROUTER_API_KEY"), ("geminiApiKey", "GEMINI_API_KEY")):
        config[field] = os.environ.get(variable) or values.get(variable) or config.get(field, "")
    return config


def cloud_connection(config):
    key = config.get("openrouterApiKey") or os.environ.get("OPENROUTER_API_KEY")
    if key:
        return "openrouter", OPENROUTER_MODEL, key
    return "google", GEMINI_MODEL, config.get("geminiApiKey") or os.environ.get("GEMINI_API_KEY")
