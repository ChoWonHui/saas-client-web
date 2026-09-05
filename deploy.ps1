# 카페24 웹호스팅 배포. 빌드 후 dist/ 를 웹 루트(~/www)에 올린다.
#   실행: .\deploy.ps1
#
# 기존 www/sample_*.html 은 건드리지 않는다 — 파일을 덮어쓰기만 하고 지우지 않는다.
# (에셋 파일명에 해시가 붙으므로 재배포를 반복하면 www/assets 에 옛 파일이 쌓인다.
#  용량이 신경 쓰이면 -Clean 으로 assets 만 비우고 다시 올린다)
param([switch]$Clean)

$ErrorActionPreference = 'Stop'

$Key    = "C:\Users\Lenovo\OneDrive\조원희\바탕 화면\aws key\jsj32166_key_20260724.pem"
$Remote = "jsj32166@jsj32166.mycafe24.com"
$Dist   = Join-Path $PSScriptRoot "dist"

Write-Host "[1/3] 빌드" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "빌드 실패" }

Write-Host "[2/3] 업로드" -ForegroundColor Cyan
if ($Clean) { ssh -i $Key $Remote "rm -rf www/assets" }
ssh -i $Key $Remote "mkdir -p www/assets"
scp -i $Key "$Dist\index.html" "$Dist\.htaccess" "${Remote}:www/"
scp -i $Key "$Dist\assets\*" "${Remote}:www/assets/"

Write-Host "[3/3] 확인" -ForegroundColor Cyan
$r = Invoke-WebRequest "https://jsj32166.mycafe24.com/" -UseBasicParsing -TimeoutSec 20
Write-Host "https://jsj32166.mycafe24.com/ -> $($r.StatusCode)" -ForegroundColor Green
