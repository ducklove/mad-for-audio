"""GPU 모델은 별도 프로세스에서 순차 실행한다. 종료하면 VRAM도 반환된다."""
import argparse
import json
import os
from pathlib import Path
import sys
import time


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("kind", choices=["asr", "moss"])
    parser.add_argument("manifest")
    parser.add_argument("output")
    args = parser.parse_args()
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA를 사용할 수 없습니다. CUDA용 PyTorch와 NVIDIA 드라이버를 확인하세요.")
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    from huggingface_hub import snapshot_download
    if args.kind == "asr":
        from qwen_asr import Qwen3ASRModel
        model_path = snapshot_download("Qwen/Qwen3-ASR-1.7B", revision="7278e1e70fe206f11671096ffdd38061171dd6e5", local_files_only=True)
        model = Qwen3ASRModel.from_pretrained(
            model_path, dtype=torch.bfloat16, device_map="cuda:0",
            max_inference_batch_size=1, max_new_tokens=1024, local_files_only=True,
        )
        def infer(item):
            result = model.transcribe(audio=item["path"], language="Korean")
            return {"text": result[0].text}
    else:
        sys.path.insert(0, os.environ["MFA_MOSS_SOURCE"])
        import soundfile as sf
        from scipy.signal import resample_poly
        from math import gcd
        from src.modeling_moss_audio import MossAudioModel
        from src.processing_moss_audio import MossAudioProcessor
        name = snapshot_download("OpenMOSS-Team/MOSS-Audio-4B-Instruct", revision="6907a499dc0e87cc77c8ae0fe23fd0eb5476a02d", local_files_only=True)
        model = MossAudioModel.from_pretrained(name, dtype=torch.bfloat16, device_map="cuda:0", local_files_only=True)
        model.eval()
        processor = MossAudioProcessor.from_pretrained(name, enable_time_marker=True, local_files_only=True)
        def infer(item):
            # 입력은 이미 검증한 PCM WAV다. Windows에서 TorchCodec DLL을 추가 요구하지 않는다.
            raw, sample_rate = sf.read(item["path"], dtype="float32")
            if raw.ndim > 1:
                raw = raw.mean(axis=1)
            target_rate = processor.config.mel_sr
            if sample_rate != target_rate:
                divisor = gcd(sample_rate, target_rate)
                raw = resample_poly(raw, target_rate // divisor, sample_rate // divisor)
            inputs = processor(text=item["prompt"], audios=[raw], return_tensors="pt").to(model.device)
            if inputs.get("audio_data") is not None:
                inputs["audio_data"] = inputs["audio_data"].to(model.dtype)
            inputs["audio_input_mask"] = inputs["input_ids"] == processor.audio_token_id
            with torch.inference_mode():
                ids = model.generate(**inputs, max_new_tokens=2048, do_sample=False, use_cache=True)
            return {"text": processor.decode(ids[0, inputs["input_ids"].shape[1]:], skip_special_tokens=True)}
    with Path(args.output).open("w", encoding="utf-8") as out:
        for item in manifest:
            started = time.perf_counter()
            torch.cuda.reset_peak_memory_stats()
            try:
                result = infer(item)
            except torch.cuda.OutOfMemoryError:
                # 적재/추론 장애는 방송 전체를 유료 API로 보내지 않고 작업을 중단한다.
                raise RuntimeError("GPU 메모리가 부족합니다. 다른 GPU 작업을 종료하고 다시 시도하세요.") from None
            torch.cuda.synchronize()
            out.write(json.dumps({"index": item["index"], **result,
                                  "elapsedSeconds": round(time.perf_counter() - started, 3),
                                  "peakGpuBytes": torch.cuda.max_memory_allocated()}, ensure_ascii=False) + "\n")
            out.flush()


if __name__ == "__main__":
    main()
