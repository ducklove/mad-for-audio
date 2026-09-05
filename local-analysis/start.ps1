$ErrorActionPreference = 'Stop'
$analysisData = if ($env:MFA_ANALYSIS_HOME) { $env:MFA_ANALYSIS_HOME } else { Join-Path $env:USERPROFILE '.mad-for-audio\analysis' }
New-Item -ItemType Directory -Path $analysisData -Force | Out-Null
$analysisPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $analysisPython)) { throw 'setup.ps1을 먼저 실행하세요.' }
if (Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue) {
    Write-Output '8766 포트의 서비스가 이미 실행 중입니다.'
    exit 0
}
$analysisProcess = Start-Process -FilePath $analysisPython -ArgumentList ('"' + (Join-Path $PSScriptRoot 'server.py') + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $analysisData 'service.log') -RedirectStandardError (Join-Path $analysisData 'service-error.log')
$analysisProcess.Id | Set-Content -LiteralPath (Join-Path $analysisData 'service.pid')
Write-Output "PC 분석 서비스를 시작했습니다. 설정 파일: $analysisData\config.json"
