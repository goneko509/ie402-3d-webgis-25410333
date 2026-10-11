#!/usr/bin/env bash
# Xuất hàng loạt PDF (cắt sát nội dung) cho báo cáo:
#   - mọi sơ đồ tuần tự imgs/diagrams/sequence/*.drawio  -> imgs/sequence/<tên>.pdf
#   - sơ đồ Use Case (trang đầu UseCase.drawio)          -> imgs/UseCase-Use Case Diagram.drawio.pdf
# Cần draw.io-export (npm i -g draw.io-export, lệnh "drawio"). Chạy: bash xuat_pdf.sh
set -euo pipefail
cd "$(dirname "$0")"
DICH="../../sequence"
mkdir -p "$DICH"
for f in *.drawio; do
  ten="${f%.drawio}"
  echo "xuất $ten"
  timeout 180 drawio "$f" -o "$DICH/$ten.pdf" >/dev/null 2>&1 || echo "  LỖI: $ten"
done
echo "xuất Use Case"
timeout 180 drawio ../UseCase.drawio -F pdf -o "../../UseCase-Use Case Diagram.drawio.pdf" >/dev/null 2>&1 || echo "  LỖI: Use Case"
ls -1 "$DICH"
