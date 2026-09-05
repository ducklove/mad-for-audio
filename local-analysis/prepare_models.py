"""명시적인 설치 단계에서 모델을 내려받는다. 녹음 전 CUDA도 확인한다."""
import os
from pathlib import Path
import json
import torch
from huggingface_hub import snapshot_download
from server import DATA, load_config

if __name__ == "__main__":
    if not torch.cuda.is_available():
        raise SystemExit("CUDA를 사용할 수 없습니다. NVIDIA 드라이버를 확인하세요.")
    config = load_config()
    os.environ["HF_HOME"] = config["modelCache"]
    revisions = {"Qwen/Qwen3-ASR-1.7B": "7278e1e70fe206f11671096ffdd38061171dd6e5",
                 "OpenMOSS-Team/MOSS-Audio-4B-Instruct": "6907a499dc0e87cc77c8ae0fe23fd0eb5476a02d"}
    for name, revision in revisions.items():
        snapshot_download(name, revision=revision, cache_dir=str(Path(config["modelCache"]) / "hub"),
                          ignore_patterns=["*.bin", "*.pt", "*.pth", "*.onnx"])
    (DATA / "models-ready.json").write_text(json.dumps(revisions), encoding="utf-8")
    print("로컬 분석 모델 준비 완료")
