param([switch]$UrlOnly, [switch]$Desktop, [switch]$Browser, [string]$AppPath)
$ErrorActionPreference = 'Stop'
$analysisPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $analysisPython)) { throw 'setup.ps1을 먼저 실행하세요.' }
$connectArgs = @((Join-Path $PSScriptRoot 'connect_app.py'))
if ($UrlOnly) { $connectArgs += '--url-only' }
if ($Desktop) { $connectArgs += '--desktop' }
if ($Browser) { $connectArgs += '--browser' }
if ($AppPath) { $connectArgs += @('--app', $AppPath) }
& $analysisPython @connectArgs
if ($LASTEXITCODE -ne 0) { throw 'PC 연결을 완료하지 못했습니다. 위 안내를 확인하세요.' }
