$ErrorActionPreference = 'Stop'
$analysisData = if ($env:MFA_ANALYSIS_HOME) { $env:MFA_ANALYSIS_HOME } else { Join-Path $env:USERPROFILE '.mad-for-audio\analysis' }
$analysisPidPath = Join-Path $analysisData 'service.pid'
if (-not (Test-Path -LiteralPath $analysisPidPath)) { throw '이 설치에서 시작한 서비스 PID 기록이 없습니다.' }
$analysisProcessId = [int](Get-Content -LiteralPath $analysisPidPath -Raw)
$analysisProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $analysisProcessId"
$analysisScript = Join-Path $PSScriptRoot 'server.py'
if (-not $analysisProcess) {
    New-Item -ItemType File -Path (Join-Path $analysisData 'service.stopped') -Force | Out-Null
    Write-Output '기록된 프로세스가 이미 종료됐습니다. 자동 복구도 중지했습니다.'
    exit 0
}
if ($analysisProcess.CommandLine -notmatch [regex]::Escape($analysisScript)) { throw '다른 프로세스이므로 종료하지 않았습니다.' }
$analysisConfig = Get-Content -LiteralPath (Join-Path $analysisData 'config.json') -Raw | ConvertFrom-Json
$analysisJobs = Invoke-RestMethod 'http://127.0.0.1:8766/jobs' -Headers @{ Authorization = 'Bearer ' + $analysisConfig.token } -TimeoutSec 10
if ($analysisJobs | Where-Object { $_.status -in @('running', 'queued', 'editing', 'recording') }) {
    throw '녹음·분석·편집이 진행 중입니다. 서버 녹음을 끄고 작업이 끝난 뒤 종료하세요.'
}
New-Item -ItemType File -Path (Join-Path $analysisData 'service.stopped') -Force | Out-Null
& taskkill.exe /PID $analysisProcessId /T /F
if ($LASTEXITCODE -ne 0) { throw '서비스 종료에 실패했습니다.' }
Write-Output 'PC 분석 서비스를 종료했습니다.'
