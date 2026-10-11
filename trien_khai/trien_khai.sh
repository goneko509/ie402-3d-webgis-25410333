#!/usr/bin/env bash
# Triển khai WebGIS lên Azure App Service (một app: API Express phục vụ luôn giao diện React đã build).
# Chạy trong Git Bash từ thư mục webgis:  bash trien_khai/trien_khai.sh
# Cần: Azure CLI (máy này: /d/AzureCLI/az, đã az login), Node 24. Cấu hình app (DB_*, JWT_SECRET, STATIC_DIR=public, ...)
# đã đặt trong App Settings; gói zip KHÔNG chứa .env hay mật khẩu.
set -euo pipefail
AZ="${AZ:-/d/AzureCLI/az}"
RG=DefaultResourceGroup-USW3
APP=ie402-webgis-25410333
GOC="$(cd "$(dirname "$0")/.." && pwd)"
TAM="${TAM:-/d/AzureCLI/tmp/goi_trien_khai}"
export PYTHONIOENCODING=utf-8

echo "== 1. Build giao diện (web/dist)"
(cd "$GOC/web" && npm run build >/dev/null)

echo "== 2. Gom gói: api/src, package.json, package-lock.json, public/ (= web/dist)"
rm -rf "$TAM" && mkdir -p "$TAM/goi"
cp -r "$GOC/api/src" "$GOC/api/package.json" "$GOC/api/package-lock.json" "$TAM/goi/"
cp -r "$GOC/web/dist" "$TAM/goi/public"
(cd "$TAM/goi" && /c/Windows/System32/tar.exe -a -cf ../goi.zip *)
ls -la "$TAM/goi.zip"

echo "== 3. Đẩy gói lên App Service (Azure tự chạy npm install --production)"
"$AZ" webapp deploy -g "$RG" -n "$APP" --type zip --src-path "$TAM/goi.zip" --track-status true -o none

echo "== 4. Kiểm tra"
curl -s "https://$APP.azurewebsites.net/api/health"; echo
