# API WebGIS 3D cây xanh

Node.js 24 + Express 5 + mssql. Đặc tả: `../docs/dac_ta_hien_thuc.md` (mục 4 - 6).

## Chạy local

1. Chuẩn bị CSDL `ie402_green_space`: các script `Latex_Final/Topic7_Implementation_Plan/db/01`–`13`, rồi `webgis/db/14`, `15_nap_lop_nen.sql`, `16`.
2. `cp .env.example .env` và điền `DB_PASSWORD`, `JWT_SECRET`.
   SQL Server Express của máy này nghe TCP cổng 1433 và tắt dịch vụ SQL Browser, nên dùng `DB_SERVER=localhost`, `DB_PORT=1433`
   (không dùng `localhost\SQLEXPRESS`).
3. `npm install`
4. `npm start` (cổng 3001) hoặc `npm run dev` (tự khởi động lại khi sửa mã).

## Triển khai Azure

- Một web app `ie402-webgis-25410333` (Linux, Node 24 LTS), chạy trên plan B1 sẵn có, nhóm tài nguyên `DefaultResourceGroup-USW3`.
  - API phục vụ luôn bản build giao diện: biến `STATIC_DIR=public`.
  - Lệnh khởi động: `node src/server.js`. Cấu hình nằm trong App Settings, không dùng file `.env`.
- CSDL Azure SQL `srv-25410333-ie402/ie402_green_space`, nhóm tài nguyên `rg-ie402-webgis`.
  - Gói serverless theo ưu đãi miễn phí: hết hạn mức tháng thì CSDL tự tạm dừng, không tính tiền.
  - Dữ liệu được nhập nguyên từ CSDL local bằng file bacpac (SqlPackage).
  - API kết nối bằng người dùng `webgis_api`, chỉ có quyền tối thiểu (`../db/18`).
- Mật khẩu và secret nằm trong `.env.azure` (được gitignore).
  - Chạy API local nối vào CSDL Azure: `node --env-file=.env --env-file=.env.azure src/server.js`.
- Cập nhật mã lên Azure: `bash ../trien_khai/trien_khai.sh` (build web, đóng gói zip, đẩy lên App Service).
- Lưu ý: CSDL local và CSDL Azure từ giờ là **hai bản độc lập**; sửa dữ liệu ở bản này không tự đồng bộ sang bản kia.

## Kiểm thử

Tạo `.env.test` gồm `NODE_ENV=test`, `DB_POOL_MAX=1`, `PORT=3002`, rồi:

```
npm run start:test
"d:/0. UIT/HK3/.venv/Scripts/python.exe" tests/kiem_thu_api.py
```

Pool chỉ có một kết nối và endpoint `/api/_kiem-thu/phien` (chỉ có ở chế độ kiểm thử) đọc `SESSION_CONTEXT` của kết nối đó,
nhờ vậy kiểm thử chứng minh được phiên làm việc luôn được xóa sau mỗi thao tác, kể cả khi trigger từ chối.
Kiểm thử thêm rồi xóa các cây tạm; dữ liệu sau kiểm thử vẫn 333 cây.

## Endpoint

| Phương thức | Đường dẫn | Ghi chú |
|---|---|---|
| GET | `/api/health` | |
| GET | `/api/khu-vuc` | FeatureCollection, EPSG:3405 |
| GET | `/api/loai-cay` | |
| GET | `/api/cay?khu=&loai=&q=` | `q`: mã cây hoặc một phần tên loài / tên khoa học |
| GET | `/api/cay/:ma` | |
| GET | `/api/lop-nen/toa-nha` · `duong` · `ranh-gioi` | `?bbox=minx,miny,maxx,maxy` |
| GET | `/api/thong-ke?khu=` | 5 khu + dòng toàn vùng (`ma_khu_vuc = null`) |
| POST | `/api/dang-nhap` | `{ten_dang_nhap, mat_khau}` → `{token, tai_khoan}` |
| POST · PUT · DELETE | `/api/cay`, `/api/cay/:ma` | Header `Authorization: Bearer <token>` |

Lỗi trả về `{ "loi": "...", "chi_tiet": {...} }`: 400 dữ liệu sai / vi phạm ràng buộc, 401 chưa đăng nhập hoặc sai mật khẩu,
403 cây thuộc khu người khác, 404 không tìm thấy, 422 vị trí ngoài vùng nghiên cứu.

## Ghi chú bảo mật

`npm audit` báo 3 lỗi mức trung bình ở `sprintf-js` (phụ thuộc của driver `tedious`). Cách sửa npm đề xuất là hạ `mssql` về 4.2
(2017), không áp dụng. API không đưa dữ liệu người dùng vào `sprintf`, nên rủi ro thấp; theo dõi bản cập nhật của `tedious`.
