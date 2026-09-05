param([switch]$SkipModels)
$ErrorActionPreference = 'Stop'
$analysisRoot = $PSScriptRoot
$analysisPython = Join-Path $analysisRoot '.venv\Scripts\python.exe'
function Run-Checked {
    param([string]$Exe, [string[]]$Arguments)
    & $Exe @Arguments
    if ($LASTEXITCODE -ne 0) { throw "설치 명령 실패: $Exe" }
}
if (-not (Test-Path -LiteralPath $analysisPython)) {
    Run-Checked python @('-m', 'venv', (Join-Path $analysisRoot '.venv'))
}
Run-Checked $analysisPython @('-m', 'pip', 'install', '--upgrade', 'pip')
Run-Checked $analysisPython @('-m', 'pip', 'install', '--no-cache-dir', 'torch==2.9.1', 'torchaudio==2.9.1', '--index-url', 'https://download.pytorch.org/whl/cu128')
Run-Checked $analysisPython @('-m', 'pip', 'install', '--no-cache-dir', '-r', (Join-Path $analysisRoot 'requirements.txt'))
$mossSource = Join-Path $analysisRoot '.moss-audio'
if (-not (Test-Path -LiteralPath (Join-Path $mossSource '.git'))) {
    Run-Checked git @('clone', 'https://github.com/OpenMOSS/MOSS-Audio.git', $mossSource)
}
Run-Checked git @('-C', $mossSource, 'checkout', 'ce783cb7ffe13a175c4618249a5a4d279807bf95')
if (-not $SkipModels) {
    Run-Checked $analysisPython @((Join-Path $analysisRoot 'prepare_models.py'))
}
Write-Output '설치 완료. start.ps1로 PC 분석 서비스를 실행하세요.'
