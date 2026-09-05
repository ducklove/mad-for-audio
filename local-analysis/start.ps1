$ErrorActionPreference = 'Stop'
$analysisData = if ($env:MFA_ANALYSIS_HOME) { $env:MFA_ANALYSIS_HOME } else { Join-Path $env:USERPROFILE '.mad-for-audio\analysis' }
New-Item -ItemType Directory -Path $analysisData -Force | Out-Null
$analysisPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $analysisPython)) { throw 'setup.ps1을 먼저 실행하세요.' }
& $analysisPython (Join-Path $PSScriptRoot 'start_service.py')
if ($LASTEXITCODE -ne 0) { throw 'PC 분석 서비스 시작에 실패했습니다.' }
Write-Output "PC 분석 서비스 자동 실행·복구를 요청했습니다. 설정 파일: $analysisData\config.json"
