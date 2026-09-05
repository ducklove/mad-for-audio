"""평가에서 실제 발생한 응답 형식과 재결제 방지 동작을 검증한다."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import evaluate_economy as evaluation


class EconomyEvaluationTests(unittest.TestCase):
    def test_recovers_fenced_json_without_following_commentary(self):
        value = evaluation.parse_answer('```json\n{"tracks": []}\n```\n추가 설명과 추측')
        self.assertEqual(value, {'tracks': []})

    def test_recovers_json_after_unstructured_audio_description(self):
        value = evaluation.parse_answer('00:08 speech\n{"announcements": []}')
        self.assertEqual(value, {'announcements': []})

    def test_does_not_accept_audio_unavailable_message(self):
        with self.assertRaises(ValueError):
            evaluation.parse_answer('첨부된 오디오 파일을 확인할 수 없습니다.')

    def test_does_not_accept_multiple_json_objects(self):
        with self.assertRaises(ValueError):
            evaluation.parse_answer('설명 {"tracks": []} {"tracks": [1]}')

    def test_nested_verification_cost_is_not_counted_twice(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(evaluation, 'OUTPUT', Path(directory)):
            root = Path(directory)
            evaluation.write(root/'case/request.json', {'usage': {'cost': .01}})
            evaluation.write(root/'case/verification/request.json', {'usage': {'cost': .02}})
            evaluation.write(root/'case/verification/job.json', {'usage': [{'cost': .02}]})
            evaluation.write(root/'case/attempt.json', {'state': 'failed'})
            self.assertAlmostEqual(evaluation.known_cost(), .03)

    def test_incomplete_attempt_is_not_automatically_charged_again(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(evaluation, 'OUTPUT', Path(directory)), \
                patch.object(evaluation, 'load_cloud_keys', return_value={'openrouterApiKey': 'test-key'}), \
                patch.object(evaluation.httpx, 'post', side_effect=TimeoutError('시험 시간 초과')) as post:
            with self.assertRaises(TimeoutError):
                evaluation.request('case', 'test', 'test-model', '시험 프롬프트')
            with self.assertRaisesRegex(RuntimeError, '자동 재호출'):
                evaluation.request('case', 'test', 'test-model', '시험 프롬프트')
            self.assertEqual(post.call_count, 1)


if __name__ == '__main__':
    unittest.main()
