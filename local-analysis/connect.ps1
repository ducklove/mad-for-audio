param([switch]$UrlOnly)
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'start.ps1') | Out-Null
$analysisData = if ($env:MFA_ANALYSIS_HOME) { $env:MFA_ANALYSIS_HOME } else { Join-Path $env:USERPROFILE '.mad-for-audio\analysis' }
$analysisConfig = Get-Content -LiteralPath (Join-Path $analysisData 'config.json') -Raw | ConvertFrom-Json
$analysisHeaders = @{ Authorization = 'Bearer ' + $analysisConfig.token }
$analysisReady = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    try {
        $analysisHealth = Invoke-RestMethod 'http://127.0.0.1:8766/health' -Headers $analysisHeaders -TimeoutSec 2
        $analysisReady = $analysisHealth.ok
        if ($analysisReady) { break }
    } catch { Start-Sleep -Milliseconds 500 }
}
if (-not $analysisReady) { throw 'PC 분석 서비스에 연결하지 못했습니다.' }
$analysisLink = Invoke-RestMethod 'http://127.0.0.1:8766/connection-link' -Method Post -Headers $analysisHeaders -TimeoutSec 5
if ($UrlOnly) { Write-Output $analysisLink.url } else {
    Start-Process -FilePath $analysisLink.url
    Write-Output '배포 앱에서 이 PC 연결을 진행합니다. 연결 링크는 2분 동안 한 번만 사용할 수 있습니다.'
}
