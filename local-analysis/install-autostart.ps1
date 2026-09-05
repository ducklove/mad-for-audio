$ErrorActionPreference = 'Stop'
$analysisStart = Join-Path $PSScriptRoot 'start.ps1'
$analysisStartup = [Environment]::GetFolderPath('Startup')
$analysisShell = New-Object -ComObject WScript.Shell
$analysisShortcut = $analysisShell.CreateShortcut((Join-Path $analysisStartup 'Mad for Audio PC Analysis.lnk'))
$analysisShortcut.TargetPath = (Get-Command powershell.exe).Source
$analysisShortcut.Arguments = '-NoProfile -WindowStyle Hidden -File "' + $analysisStart + '"'
$analysisShortcut.WorkingDirectory = $PSScriptRoot
$analysisShortcut.WindowStyle = 7
$analysisShortcut.Description = 'Mad for Audio PC 곡 분석 서버 자동 실행'
$analysisShortcut.Save()
Write-Output '현재 사용자의 Windows 로그인 시 PC 분석 서버가 자동 실행되도록 등록했습니다.'
