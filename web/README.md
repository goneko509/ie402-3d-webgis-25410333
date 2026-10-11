# Giao diện WebGIS 3D cây xanh

React 19 + Vite 8 + ArcGIS Maps SDK for JavaScript 5.1 (`@arcgis/core`, đóng gói cục bộ, không cần CDN hay API key).
Đặc tả: `../docs/dac_ta_hien_thuc.md` (mục 7); bố cục theo mockup Chương 3.

## Chạy

1. Chạy API: `cd ../api && npm start` (cổng 3001).
2. `npm install`, rồi `npm run dev` → http://localhost:5173 (Vite chuyển `/api` tới cổng 3001).
   Lần đầu Vite phải đóng gói trước `@arcgis/core` nên trang có thể mất vài phút mới hiện.
3. Bản triển khai: `VITE_API_URL=https://<địa chỉ API> npm run build` → thư mục `dist/`.

## Cấu trúc

| Tệp | Nội dung |
|---|---|
| `src/scene/taoCanh.js` | SceneView local EPSG:3405; các lớp: khu vực, đường, ranh giới (phủ mặt đất), tòa nhà (đùn khối), thân cây (trụ theo DBH), tán cây (cầu 2R × 0,75H, màu theo loài), vùng che phủ |
| `src/App.jsx` | Tải dữ liệu, UC02 tìm cây (đánh dấu, đưa vào khung nhìn, mở cửa sổ thông tin), UC03 chọn khu, UC04 bật/tắt lớp |
| `src/App.jsx` (quản trị) | UC06 đăng nhập (phiên lưu sessionStorage, hết hạn/401 thì tự đăng xuất), UC05 thêm (nhấp mặt đất), sửa (chọn cây, nhấp để dời), xóa (xác nhận) |
| `src/components/` | Thanh tiêu đề (ô tìm kiếm, đăng nhập), bảng lớp dữ liệu + chú giải, bảng thống kê che phủ, hộp đăng nhập, thanh quản trị, biểu mẫu cây |

Cảnh local không có lưới tile: khi đưa camera tới một đối tượng dùng `scale`, không dùng `zoom`.
`goTo` chỉ dời camera khi nhận geometry thật (Point, Graphic); với điểm dạng object thuần thì nó resolve mà không làm gì (SDK 5.1).

## Kiểm thử giao diện

Khi API và `npm run dev` đang chạy (Chrome headless qua puppeteer, ảnh vào `tests/anh/`):

- `node tests/kiem_thu_giao_dien.mjs`: UC01 - UC04 và lỗi JavaScript (ảnh 1 - 5).
- `node tests/kiem_thu_quan_tri.mjs`: UC06, UC05 với tài khoản `ttb` (ảnh 6 - 10). Bài này **ghi vào CSDL** rồi hoàn tác
  (thêm + xóa một cây thử, sửa cây 14 rồi trả lại). Điểm thêm cách mọi cây ≥ 15 m. Trước mỗi lần xóa hoặc sửa, bài test
  kiểm tra tiêu đề biểu mẫu đúng mã cây mong đợi; nếu sai thì dừng và chỉ dọn cây thử mới tạo.
