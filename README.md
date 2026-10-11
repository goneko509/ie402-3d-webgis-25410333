# Hệ thống WebGIS 3D quản lý cây xanh đô thị tích hợp đánh giá độ che phủ và nguy cơ ngã đổ (Hệ thống cây xanh tại Làng Đại học ĐHQG-TP.HCM)

> **Đồ án môn học:** IE402 - Hệ thống thông tin địa lý 3 chiều (3D GIS)
> **Đơn vị đào tạo:** Khoa Công nghệ Thông tin - Trường Đại học Công nghệ Thông tin, ĐHQG-HCM (UIT)
> **Giảng viên hướng dẫn:** ThS. Phan Thanh Vũ
> **Sinh viên thực hiện:** Nguyễn Tấn Viễn - MSSV: 25410333 (Nhóm 10)
> **Lớp:** IE402.F31.CN1.CNTT
> **Link website demo trực tuyến:** [https://ie402-webgis-25410333.azurewebsites.net](https://ie402-webgis-25410333.azurewebsites.net)

---

## 1. Giới thiệu tổng quan đề tài

Đề tài **"Mô hình hóa GIS 3D và xây dựng WebGIS quản lý cây xanh đô thị tích hợp đánh giá độ che phủ và nguy cơ ngã đổ"** tập trung giải quyết bài toán chuyển đổi số trong quản lý mảng xanh đô thị tại Khu đô thị Đại học Quốc gia Thành phố Hồ Chí Minh (ĐHQG-HCM).

So với phương pháp quản lý điểm 2D truyền thống, hệ thống xây dựng mô hình dữ liệu 3 chiều chân thực theo cơ sở lý thuyết B-rep rút gọn, tính toán tỷ lệ che phủ bề mặt và thể tích tán cây, đồng thời phát triển ứng dụng WebGIS 3D hoàn chỉnh phục vụ đa tác nhân: cho phép cộng đồng tra cứu thông tin, hỗ trợ chuyên viên quản lý phân quyền theo khu vực (thêm, nhân bản, sửa, dời vị trí, xóa cây có nhật ký lưu vết và hoàn tác), và tự động phân tích không gian xác định các cây có nguy cơ ngã đổ lên công trình, đường giao thông theo tiêu chuẩn quốc tế ISA.

### Tóm tắt các kết quả số liệu cốt lõi của đề tài (đối chiếu báo cáo):

- **Phạm vi vùng nghiên cứu:** Khu đô thị ĐHQG-HCM với tổng diện tích tự nhiên là **616,27 ha**, được phân chia topo chặt chẽ thành **5 phân khu quản lý** theo tim các trục đường giao thông chính:
  1. Khu phía Tây: 303,53 ha (96 cây).
  2. Khu Trung tâm Marie Curie - Isaac Newton: 42,24 ha (45 cây).
  3. Khu Quảng trường Sáng tạo: 15,43 ha (36 cây).
  4. Khu Đông Bắc: 148,97 ha (29 cây).
  5. Khu Đông Nam: 106,10 ha (127 cây).
- **Dữ liệu cây xanh 3D:** **333 cây xanh** được số hóa hoàn chỉnh với hệ tọa độ phẳng quốc gia VN-2000 UTM Zone 48N (EPSG:3405), gán cao độ địa hình Z, mô hình hóa thân trụ (theo đường kính ngang ngực DBH) và tán cầu ellipsoid co giãn (theo chiều cao cây $H$ và bán kính tán $R$). Dữ liệu phân bố chuẩn xác trên 4 loài cây chủ đạo trong CSDL:
  - *Bàng* (*Terminalia catappa*): 102 cây (30,63%).
  - *Sao đen* (*Hopea odorata*): 91 cây (27,33%).
  - *Lim xẹt* (*Peltophorum pterocarpum*): 70 cây (21,02%).
  - *Me tây* (*Albizia saman*): 70 cây (21,02%).
- **Tình trạng sức khỏe cây xanh (giả định):** 266 cây Bình thường (79,88%), 59 cây Suy yếu (17,72%), 8 cây Nguy hiểm (2,40%).
- **Lớp bản đồ nền đô thị (Base layer):** **716 khối tòa nhà** (đùn khối 3D Extrusion theo số tầng và chiều cao thực tế/giả định) và **2.486 đoạn đường giao thông** nội khu trích xuất từ OpenStreetMap.
- **Chỉ số không gian xanh toàn vùng:** Tỷ lệ che phủ tán cây đạt **0,48%** (tương đương diện tích tán thực tế là **29.868 m²**), tổng thể tích tán xấp xỉ **246.750 m³**, mật độ trung bình toàn vùng đạt **0,54 cây/ha** (phân khu đạt độ che phủ cao nhất là Khu Quảng trường Sáng tạo với 2,24%).

- **Đánh giá nguy cơ ngã đổ (Tree Risk Assessment):** Tự động khoanh vùng ảnh hưởng $1{,}5 \times H$ đối với các cây thuộc diện *Suy yếu* hoặc *Nguy hiểm*, phân cấp rủi ro theo 3 mức vùng mục tiêu ISA (Mức Cao: mục tiêu trong tán cây; Mức Trung bình: mục tiêu trong phạm vi $1 \times H$; Mức Thấp: mục tiêu trong phạm vi $1{,}5 \times H$).

---

## 2. Kiến trúc hệ thống và công nghệ sử dụng

Hệ thống được thiết kế theo mô hình **kiến trúc 3 lớp (3-tier architecture)** hiện đại, độc lập và bảo mật cao:

```
+-----------------------------------------------------------------------------------------+
|                          Lớp trình bày (Presentation Tier - Web Client)                 |
|       React 19 + Vite 8 + ArcGIS Maps SDK for JavaScript 5.1 (@arcgis/core)             |
|       SceneView Local EPSG:3405 - Tích hợp 20 thành phần UI - Ảnh vệ tinh Esri World    |
+-----------------------------------------------------------------------------------------+
                                           |   ^
                         HTTP RESTful JSON |   | GeoJSON (EPSG:3405) / Bearer JWT
                                           v   |
+-----------------------------------------------------------------------------------------+
|                          Lớp ứng dụng (Application Tier - Backend API)                  |
|                   Node.js 24 LTS + Express 5 + mssql driver (tedious)                   |
|       Connection Pool + Quản lý phiên an toàn (SESSION_CONTEXT / withSession)           |
+-----------------------------------------------------------------------------------------+
                                           |   ^
                             T-SQL Queries |   | Spatial Geometry Tables / JSON Output
                                           v   |
+-----------------------------------------------------------------------------------------+
|                          Lớp dữ liệu (Data Tier - Spatial Database & GIS)               |
|              Microsoft SQL Server Spatial 2025 / Azure SQL Database Serverless          |
|              GEOMETRY (EPSG:3405) + Spatial Indexes + 41 T-SQL Scripts (R1-R13)         |
+-----------------------------------------------------------------------------------------+
```

### Bảng công nghệ và thư viện kỹ thuật chi tiết:

| Thành phần                    | Công nghệ / Thư viện | Phiên bản                            | Mục đích và vai trò trong hệ thống                                                                                         |
| ------------------------------- | ------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework**    | React                    | `^19.3.0`                            | Xây dựng giao diện ứng dụng SPA tốc độ cao, quản lý state phản ứng                                                    |
| **Frontend Build Tool**   | Vite                     | `^8.3.3`                             | Bundler thế hệ mới, tối ưu hóa tiền đóng gói và dev server cục bộ                                                    |
| **3D GIS Web Engine**     | `@arcgis/core`         | `^5.1.26`                            | Dựng cảnh 3D cục bộ (`SceneView` local mode) trực tiếp trên hệ VN-2000, kết xuất cây B-rep và tòa nhà đùn khối |
| **Satellite Imagery**     | Esri World Imagery       | Web Tile Service                       | Lớp bản đồ ảnh vệ tinh toàn cầu độ phân giải cao phủ nền địa hình                                                |
| **Backend Runtime**       | Node.js                  | `>= 20.6` (khuyên dùng Node 24)    | Nền tảng thực thi JavaScript phía máy chủ hỗ trợ ES Modules                                                               |
| **Backend Framework**     | Express                  | `^5.2.1`                             | Xây dựng 16 RESTful API endpoint, bộ lọc CORS và middleware xác thực                                                       |
| **Database Driver**       | `mssql`                | `^12.7.4`                            | Kết nối pool kết nối hiệu năng cao tới SQL Server qua driver`tedious`                                                    |
| **Authentication**        | `jsonwebtoken`         | `^9.0.3`                             | Ký và giải mã JSON Web Token (JWT) có thời hạn 8 giờ cho các phiên quản trị                                           |
| **Spatial Conversion**    | `wellknown`            | `^0.5.0`                             | Chuyển đổi dữ liệu hình học WKT (Well-Known Text) sang định dạng chuẩn GeoJSON                                         |
| **Spatial Database**      | Microsoft SQL Server     | 2019/2022/2025 Express hoặc Azure SQL | Lưu trữ thực thể hình học không gian 3D`GEOMETRY` (EPSG:3405), thực thi các stored procedure và trigger phân quyền  |
| **GIS Desktop & Tooling** | QGIS & GDAL/OGR          | 3.34+ / 3.44 LTR                       | Số hóa dữ liệu không gian, biên tập GeoPackage (`Tree.gpkg`) và chạy kịch bản phân tích không gian Python         |

---

## 3. Cấu trúc thư mục mã nguồn và tài nguyên đồ án

Cấu trúc thư mục trong `Demo/Code` được tổ chức tinh gọn, phản ánh nguyên bản môi trường phát triển thực tế:

```
Code/
|-- api/                            # Dịch vụ Backend REST API (Node.js/Express)
|   |-- src/
|   |   |-- server.js               # Điểm khởi chạy HTTP Server
|   |   |-- app.js                  # Khởi tạo app Express, middleware CORS, route
|   |   |-- db.js                   # Connection pool, cơ chế cách ly phiên withSession
|   |   |-- config.js               # Đọc và xác thực biến môi trường (.env)
|   |   |-- errors.js               # Ánh xạ mã lỗi T-SQL sang mã trạng thái HTTP chuẩn
|   |   |-- auth.js                 # Middleware xác thực JWT Bearer Token
|   |   |-- geo.js                  # Chuyển đổi WKT sang cấu trúc GeoJSON
|   |   `-- routes/
|   |       |-- doc.js              # 8 endpoint đọc dữ liệu (cây, khu vực, loài, lớp nền, thống kê, nguy cơ)
|   |       `-- ghi.js              # 8 endpoint ghi dữ liệu (đăng nhập, thêm/sửa/xóa, khôi phục, hoàn tác)
|   |-- tests/
|   |   `-- kiem_thu_api.py         # Bộ kiểm thử tích hợp tự động 31/31 ca kiểm thử
|   |-- .env.example                # Mẫu cấu hình môi trường local
|   |-- .env                        # File cấu hình môi trường đang chạy (cổng 3001)
|   `-- package.json                # Khai báo phụ thuộc backend
|
|-- web/                            # Giao diện ứng dụng WebGIS 3D (React 19 / Vite 8)
|   |-- src/
|   |   |-- main.jsx                # Điểm khởi tạo ứng dụng React
|   |   |-- App.jsx                 # Điều phối state chính: tải lớp, tìm kiếm, lọc, phân quyền
|   |   |-- styles.css              # Hệ thống CSS hiện đại cho toàn bộ giao diện WebGIS
|   |   |-- api.js                  # Module giao tiếp HTTP API với backend
|   |   |-- scene/
|   |   |   |-- taoCanh.js          # Dựng SceneView EPSG:3405, render thân trụ + tán cầu 3D
|   |   |   `-- vn2000.js           # Định nghĩa hệ tọa độ phẳng VN-2000
|   |   `-- components/             # 17 component chức năng tương ứng 20 thành phần UI
|   |       |-- ThanhTieuDe.jsx     # Header, thanh tìm kiếm nhanh, nút đăng nhập/đăng xuất
|   |       |-- ThanhQuanTri.jsx    # Thanh công cụ quản trị (Thêm cây, Khôi phục dữ liệu)
|   |       |-- BangLopDuLieu.jsx   # Điều khiển hiển thị 7 lớp dữ liệu không gian
|   |       |-- BangThongKe.jsx     # Bảng phân tích diện tích che phủ, thể tích tán và mật độ
|   |       |-- BieuMauCay.jsx      # Form thêm mới, nhân bản và sửa thuộc tính/vị trí cây
|   |       |-- ThongTinCay.jsx     # Popup chi tiết thuộc tính khi chọn cây trên cảnh 3D
|   |       |-- ThongTinLoai.jsx    # Cửa sổ thông tin đặc tính sinh học loài cây
|   |       |-- BoLocCay.jsx        # Lọc danh sách cây theo thuộc tính kích thước, loài, khu
|   |       |-- PhanTichNguyCo.jsx  # Bảng phân tích rủi ro cây ngã đổ theo tiêu chuẩn ISA
|   |       |-- HopDangNhap.jsx     # Hộp thoại đăng nhập tài khoản quản trị
|   |       |-- HopKhoiPhuc.jsx     # Hộp thoại xem trước và thực hiện khôi phục dữ liệu mặc định
|   |       |-- NhatKyThayDoi.jsx   # Giao diện xem lịch sử thay đổi và nút bấm hoàn tác
|   |       `-- ...
|   |-- tests/                      # Kịch bản kiểm thử E2E tự động bằng Puppeteer
|   |   |-- kiem_thu_giao_dien.mjs  # Kiểm thử tương tác công cộng (23/23 bước Đạt)
|   |   `-- kiem_thu_quan_tri.mjs   # Kiểm thử tương tác quản trị & phân quyền (25/25 bước Đạt)
|   |-- vite.config.js              # Cấu hình Vite dev server và reverse proxy cổng 3001
|   `-- package.json                # Khai báo phụ thuộc frontend
|
|-- db/                             # Tập hợp đầy đủ 41 script T-SQL và công cụ tự động hóa CSDL
|   |-- 01_init_schema.sql          # Khởi tạo lược đồ bảng, kiểu dữ liệu GEOMETRY và khóa ngoại
|   |-- 02_random_thuoc_tinh.sql    # Sinh thuộc tính kích thước cây thực tế
|   |-- 03_seed_nguoi_quan_ly.sql   # Nạp thông tin 5 cán bộ quản lý phụ trách 5 khu
|   |-- 04_dong_bo_khu_vuc.sql      # Cập nhật ranh giới 5 khu vực phân chia theo tim đường
|   |-- 05_don_vi_dien_tich_ha.sql  # Chuẩn hóa đơn vị diện tích hecta (ha)
|   |-- 06_trigger_gan_khu_vuc.sql  # Trigger tự động gán khu vực cho cây (STContains)
|   |-- 07_ngay_cap_nhat.sql        # Trigger tự động cập nhật thời gian sửa đổi bản ghi
|   |-- 08_loai_cay_thoi_gian.sql   # Bổ sung đặc tính rụng lá, ra hoa, tuổi thọ loài cây
|   |-- 09_dbh_ngay_trong_tuoi_tho.sql # Cập nhật thuộc tính DBH và ngày trồng
|   |-- 10_tai_khoan_phan_quyen.sql # Bảng tài khoản, băm mật khẩu và trigger phân quyền khu
|   |-- 11_bo_sung_25_cay.sql       # Nạp bổ sung 25 cây số hóa (nâng tổng số lên 333 cây)
|   |-- 12_cap_nhat_z.sql           # Cập nhật cao độ Z nội suy IDW cho cây số hóa
|   |-- 13_kiem_thu_3_4.sql         # 11 kịch bản kiểm thử CSDL toàn vẹn nghiệp vụ
|   |-- 14_lop_nen.sql              # Khởi tạo bảng tòa nhà, đường, ranh giới
|   |-- 15_nap_lop_nen.sql          # Nạp dữ liệu không gian 716 khối nhà và 2.486 đoạn đường
|   |-- 16_sp_thong_ke.sql          # Stored procedure sp_thong_ke_che_phu tính che phủ động
|   |-- 18_tai_khoan_api_azure.sql  # Cấu hình người dùng database quyền tối thiểu cho API
|   |-- 20_sp_cay_nguy_co.sql       # Thủ tục đánh giá nguy cơ cây ngã đổ ban đầu
|   |-- 21_khoi_phuc_mac_dinh.sql   # Thủ tục sp_khoi_phuc_mac_dinh hoàn nguyên dữ liệu
|   |-- 22_nhat_ky_chi_tiet.sql     # Bảng nhat_ky_cay và thủ tục sp_hoan_tac_nhat_ky
|   |-- 24_nguy_co_isa.sql          # Thủ tục sp_cay_nguy_co_cong_trinh theo vùng mục tiêu ISA
|   |-- 25_cay_ngoai_toa_nha.sql    # Trigger chặn đặt vị trí gốc cây trong nền tòa nhà
|   `-- ...                         # Các script kiểm tra đồng bộ và phục hồi dữ liệu đối chứng
|
|-- gis/                            # Dữ liệu GIS không gian và kịch bản phân tích không gian
|   |-- Tree.gpkg                   # Lớp dữ liệu GeoPackage chuẩn (333 cây, nhà, đường, 5 khu)
|   |-- Tree_backup.gpkg            # Bản sao lưu GeoPackage ban đầu
|   |-- DHQG.qgz                    # Dự án bản đồ tổng thể QGIS 2D/3D
|   |-- DHQG_Boundary.kml           # File ranh giới KML vùng nghiên cứu
|   |-- VNUHCM.kml                  # File ranh giới mở rộng đối chiếu
|   |-- styles/                     # Tập hợp file style ký hiệu bản đồ QGIS (.qml)
|   `-- phan_tich_khong_gian/       # Các script Python phân tích không gian (GDAL/PyQGIS)
|       |-- 01_phan_tich_che_phu.py # Thuật toán Buffer, Dissolve, Intersect tính độ che phủ
|       |-- 02_kiem_chung_ban_do_bieu_do.py # Vẽ biểu đồ thống kê đối chứng số liệu
|       |-- 03_du_an_3d.py          # Cấu hình tự động dự án 3D Map View trong QGIS
|       |-- DuAn_3D.qgz             # Dự án 3D QGIS độc lập
|       |-- KetQua.gpkg             # Lớp kết quả vùng đệm tán cây dạng GeoPackage
|       `-- thong_ke.json           # Dữ liệu kết quả phân tích thống kê JSON
|
|-- docs/                           # Hồ sơ thiết kế kỹ thuật, sơ đồ nghiệp vụ và phân công
|   |-- diagrams/                   # File nguồn thiết kế sơ đồ (.drawio)
|   |   |-- ERD_Chen.drawio         # Sơ đồ quan hệ thực thể mở rộng (ERD)
|   |   |-- DFD.drawio              # Sơ đồ luồng dữ liệu mức ngữ cảnh và mức 1 (DFD L0, L1)
|   |   |-- UseCase.drawio          # Sơ đồ ca sử dụng hệ thống (15 use case)
|   |   |-- KienTruc_3Lop.drawio    # Sơ đồ mô hình kiến trúc 3 lớp
|   |   `-- BRep_Cay.drawio         # Mô hình toán học B-rep cây xanh 3 chiều
|   `-- mockup/                     # Mã nguồn HTML/CSS phục vụ dựng mẫu giao diện
|
`-- trien_khai/                     # Công cụ triển khai hạ tầng đám mây
    `-- trien_khai.sh               # Bash script tự động đóng gói và deploy lên Azure App Service
```

---

## 4. Danh sách use case và phân quyền tác nhân

Hệ thống thiết lập cơ chế phân quyền RBAC (Role-Based Access Control) chặt chẽ kết hợp kiểm tra phân quyền mức cơ sở dữ liệu qua trigger với **ba nhóm tác nhân**:

| Tác nhân                                     | Quyền hạn trên hệ thống                                         | Danh sách use case cho phép                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Người dùng (Public User)**          | Chỉ đọc (Read-only), không cần đăng nhập                     | UC01, UC02, UC03, UC04, UC07, UC08, UC09                                                    |
| **Người quản lý khu (Zone Manager)** | Đọc & Ghi (Read & Write trong khu được phân công phụ trách) | Kế thừa toàn bộ quyền của Người dùng + UC05 (UC05.1, UC05.2, UC05.3, UC05.4), UC06 |
| **Quản trị hệ thống (System Admin)** | Toàn quyền kỹ thuật trên mọi phân khu                         | Kế thừa toàn bộ quyền của Quản lý khu (thao tác trên mọi khu) + UC10, UC11       |

### Bảng tổng hợp 15 Use Cases của hệ thống (đối chiếu Chương 2 và Chương 4):

| Mã UC           | Tên use case                           | Tác nhân trực tiếp | Mô tả tóm tắt chức năng                                                                                  |
| ---------------- | --------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| **UC01**   | Xem bản đồ 3D cây xanh              | Người dùng          | Dựng cảnh 3D địa hình, nhà đùn khối, đường, cây B-rep (EPSG:3405), xoay/thu phóng/di chuyển     |
| **UC02**   | Tra cứu thông tin cây                | Người dùng          | Tìm kiếm cây theo mã số định danh hoặc tên loài; mở cửa sổ popup xem chi tiết thuộc tính       |
| **UC03**   | Xem thống kê che phủ và cây xanh   | Người dùng          | Xem tỷ lệ che phủ (%), thể tích tán (m³), mật độ cây theo khu; xem biểu đồ che phủ              |
| **UC04**   | Bật / tắt các lớp dữ liệu         | Người dùng          | Bật/tắt 7 lớp: tòa nhà, đường, cây, vùng che phủ, ranh giới, ảnh vệ tinh Esri, vùng ngã đổ   |
| **UC05.1** | Thêm cây                              | Người quản lý khu  | Nhấp chuột chọn vị trí trên cảnh 3D trong khu phụ trách (chặn ngoài khu, chặn trong nhà)          |
| **UC05.2** | Nhân bản cây                         | Người quản lý khu  | Nhân bản thuộc tính từ cây có sẵn, đặt vị trí mới (ràng buộc cách cây khác$\ge 1$ m)       |
| **UC05.3** | Sửa cây (gồm dời vị trí)          | Người quản lý khu  | Chỉnh sửa thuộc tính kích thước hoặc ghim dời vị trí cây trên cảnh 3D                            |
| **UC05.4** | Xóa cây                               | Người quản lý khu  | Xóa cây xanh khỏi cơ sở dữ liệu với hộp thoại xác nhận an toàn                                    |
| **UC06**   | Đăng nhập / đăng xuất             | Quản lý khu, Admin   | Xác thực băm mật khẩu, cấp mã JSON Web Token (8 giờ), hiển thị thẻ thông tin tài khoản           |
| **UC07**   | Phân tích nguy cơ ngã đổ          | Người dùng          | Khoanh vùng$1{,}5 \times H$ quanh cây suy yếu/nguy hiểm, phân cấp rủi ro theo tiêu chuẩn ISA        |
| **UC08**   | Lọc cây theo thuộc tính             | Người dùng          | Lọc cây trực quan trên bản đồ theo loài,$H$, $R$, DBH, ngày trồng, tình trạng                  |
| **UC09**   | Xem theo loài và tình trạng cây    | Người dùng          | Nhấp vào loài hoặc tình trạng để làm nổi bật nhóm cây tương ứng, mở cửa sổ thông tin loài |
| **UC10**   | Khôi phục dữ liệu mặc định       | Quản trị hệ thống  | Xem trước danh sách thay đổi và thực hiện khôi phục dữ liệu cây về trạng thái mặc định      |
| **UC11**   | Xem nhật ký và hoàn tác thay đổi | Quản trị hệ thống  | Xem chi tiết lịch sử chỉnh sửa (trước/sau) và hoàn tác trực tiếp từng thao tác                   |

---

## 5. Danh mục 20 thành phần giao diện WebGIS

Giao diện ứng dụng được cấu trúc khoa học với **20 thành phần giao diện trực quan** (đánh số từ ① đến ⑳ theo Bảng 3.2 ở Chương 3 báo cáo):

| Ký hiệu    | Tên thành phần                | Vị trí / Loại     | Chức năng và tương tác chính                                                                                      | UC liên quan          |
| ------------ | -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| **①** | Khung cảnh 3D                   | Trung tâm           | Hiển thị địa hình, 716 tòa nhà đùn khối, 2.486 đường và 333 cây B-rep trong hệ VN-2000                   | UC01, UC02             |
| **②** | Ô tìm kiếm nhanh              | Header trái         | Tìm kiếm tức thời theo mã cây hoặc tên loài; tự động phóng camera tới đối tượng                        | UC02                   |
| **③** | Hộp bối cảnh                  | Header giữa         | Hiển thị phân khu đang chọn, số lượng cây, điều kiện lọc đang áp dụng; nút Đặt lại                   | UC03, UC08, UC09       |
| **④** | Nút Đăng nhập / Đăng xuất | Header phải         | Mở hộp thoại xác thực đăng nhập; sau khi đăng nhập chuyển thành nút Đăng xuất                           | UC06                   |
| **⑤** | Bảng lớp dữ liệu             | Sidebar trái trên  | Bật/tắt 7 lớp dữ liệu: nhà, đường, cây, tán, ranh giới, ảnh vệ tinh, vùng ngã đổ                       | UC04                   |
| **⑥** | Chú giải loài cây            | Sidebar trái giữa  | Hiển thị bảng màu và tên 4 loài cây; bấm vào loài để kích hoạt chế độ xem theo loài                   | UC01, UC09             |
| **⑦** | Khung bộ lọc cây              | Sidebar trái dưới | Thanh trượt và ô chọn lọc cây theo loài, chiều cao, bán kính tán, DBH, tình trạng                          | UC08                   |
| **⑧** | Bảng thống kê che phủ        | Sidebar phải trên  | Thống kê số cây, mật độ, tỷ lệ che phủ (%), thể tích tán (m³); biểu đồ so sánh các khu                | UC03                   |
| **⑨** | Bảng thống kê cây xanh       | Sidebar phải giữa  | Biểu đồ cơ cấu cây xanh theo loài và theo tình trạng sức khỏe của phân khu đang xem                       | UC03, UC09             |
| **⑩** | Khung phân tích nguy cơ       | Sidebar phải dưới | Nút Phân tích/Ẩn, bảng danh sách cây có nguy cơ ngã đổ xếp theo 3 mức rủi ro ISA                          | UC07                   |
| **⑪** | Cụm công cụ điều hướng    | Góc trái cảnh 3D  | Nút Home (về toàn vùng), phóng to/thu nhỏ, xoay la bàn hướng Bắc                                               | UC01                   |
| **⑫** | Cửa sổ thông tin cây         | Popup nổi           | Hiển thị toàn bộ thông số cây, tuổi cây, tọa độ VN-2000/WGS84, liên kết Google Maps                        | UC02                   |
| **⑬** | Cửa sổ thông tin loài        | Popup nổi           | Hiển thị đặc tính sinh học, tuổi thọ trung bình, phân bố tình trạng của loài cây                         | UC09                   |
| **⑭** | Vùng ngã đổ trên cảnh 3D   | Trên cảnh 3D       | Vòng tròn$1 \times H$ và $1{,}5 \times H$ quanh cây nguy hiểm; tô đỏ tòa nhà và đường bị ảnh hưởng | UC07                   |
| **⑮** | Hộp thoại đăng nhập         | Modal                | Nhập tên đăng nhập và mật khẩu quản trị; hiển thị thông báo lỗi khi xác thực thất bại                 | UC06                   |
| **⑯** | Thanh công cụ quản trị       | Header phải         | Hiển thị thẻ tài khoản, phân khu phụ trách; nút Thêm cây và nút Khôi phục DL mặc định                  | UC05.1, UC06, UC10     |
| **⑰** | Nhóm nút quản trị trên cây | Trong popup cây     | Nút Sửa, Nhân bản, Xóa cây (chỉ sáng khi cây thuộc khu vực cán bộ phụ trách)                              | UC05.2, UC05.3, UC05.4 |
| **⑱** | Biểu mẫu nhập liệu cây      | Sidebar phải        | Form thêm mới/sửa cây: chọn loài, chiều cao, tán, DBH, ngày trồng, tình trạng                                | UC05.1, UC05.2, UC05.3 |
| **⑲** | Ghim dời vị trí 3D            | Trên cảnh 3D       | Cho phép nhấp chuột dời vị trí cây trên bản đồ; nút "Về vị trí cũ" để hoàn tác ghim                  | UC05.3                 |
| **⑳** | Hộp Khôi phục & Nhật ký     | Modal quản trị     | Xem trước khôi phục dữ liệu mặc định (UC10) và xem nhật ký chi tiết kèm nút Hoàn tác (UC11)             | UC10, UC11             |

---

## 6. Yêu cầu môi trường tiên quyết

Để cài đặt và chạy thử nghiệm đầy đủ hệ thống trên máy tính cá nhân (local environment), cần chuẩn bị các công cụ sau:

1. **Node.js:** Phiên bản `>= 20.6.0` (khuyến nghị phiên bản Node.js 24 LTS).
2. **npm:** Đi kèm Node.js (phiên bản `>= 10.0.0`).
3. **Microsoft SQL Server:** Phiên bản 2019, 2022 hoặc 2025 Express/Developer:
   - Dịch vụ SQL Server đang hoạt động và cho phép giao thức TCP/IP lắng nghe tại cổng `1433`.
   - Bật chế độ xác thực kết hợp (SQL Server and Windows Authentication mode).
4. **Python (Tùy chọn):** Phiên bản `3.10+` (chỉ cần khi chạy kịch bản kiểm thử tự động API `kiem_thu_api.py` hoặc các script xử lý không gian GDAL trong thư mục `gis/phan_tich_khong_gian/`).
5. **QGIS (Tùy chọn):** Phiên bản `3.34+` hoặc `3.44 LTR` (để mở xem các dự án bản đồ `.qgz`).

---

## 7. Hướng dẫn thiết lập cơ sở dữ liệu

Trước khi chạy ứng dụng web và API, cơ sở dữ liệu không gian cần được thiết lập đầy đủ trong SQL Server theo các bước sau:

### Bước 1: Tạo cơ sở dữ liệu

Mở công cụ **SQL Server Management Studio (SSMS)** hoặc **Azure Data Studio**, kết nối tới máy chủ SQL Server local và tạo một database mới:

```sql
CREATE DATABASE ie402_green_space;
GO
```

### Bước 2: Nạp cấu trúc bảng và nghiệp vụ cây xanh (01 - 13)

Mở và thực thi lần lượt các file script trong thư mục `db/`:

1. `01_init_schema.sql`: Tạo các bảng `loai_cay`, `khu_vuc`, `nguoi_quan_ly`, `cay_xanh` với cột hình học `GEOMETRY` (EPSG:3405).
2. `02_random_thuoc_tinh.sql`: Khởi tạo giá trị ban đầu cho các thuộc tính kích thước cây.
3. `03_seed_nguoi_quan_ly.sql`: Tạo 5 cán bộ quản lý phụ trách 5 khu vực.
4. `04_dong_bo_khu_vuc.sql`: Nạp ranh giới chuẩn của 5 phân khu quản lý.
5. `05_don_vi_dien_tich_ha.sql`: Chuẩn hóa cột tính toán diện tích khu vực sang đơn vị hecta (ha).
6. `06_trigger_gan_khu_vuc.sql`: Tạo trigger `trg_gan_khu_vuc` tự động gán phân khu cho cây dựa trên tọa độ không gian.
7. `07_ngay_cap_nhat.sql`: Bổ sung trigger tự động ghi nhận thời điểm cập nhật bản ghi.
8. `08_loai_cay_thoi_gian.sql` & `09_dbh_ngay_trong_tuoi_tho.sql`: Hoàn thiện đặc tính sinh thái, DBH và ngày trồng.
9. `10_tai_khoan_phan_quyen.sql`: Tạo bảng tài khoản `tai_khoan` và trigger phân quyền nghiêm ngặt `trg_kiem_tra_phan_quyen`.
10. `11_bo_sung_25_cay.sql` & `12_cap_nhat_z.sql`: Nạp đủ 333 cây số hóa và cập nhật cao độ địa hình Z.
11. `13_kiem_thu_3_4.sql`: Chạy kịch bản kiểm tra toàn vẹn nghiệp vụ (xác nhận 11/11 bài test đạt chuẩn).

### Bước 3: Nạp lớp bản đồ nền, thủ tục thống kê và phân tích nguy cơ (14 - 25)

Tiếp tục thực thi các script sau trong `db/`:

1. `14_lop_nen.sql`: Tạo các bảng dữ liệu nền `toa_nha`, `duong`, `ranh_gioi`.
2. `15_nap_lop_nen.sql`: Nạp dữ liệu không gian của 716 khối nhà và 2.486 đoạn đường giao thông.
3. `16_sp_thong_ke.sql`: Tạo thủ tục lưu trữ `sp_thong_ke_che_phu` tính toán diện tích che phủ động theo từng phân khu và toàn vùng.
4. `21_khoi_phuc_mac_dinh.sql`: Tạo thủ tục `sp_khoi_phuc_mac_dinh` phục vụ tính năng hoàn nguyên dữ liệu mặc định của admin.
5. `22_nhat_ky_chi_tiet.sql`: Tạo bảng `nhat_ky_cay` và thủ tục `sp_hoan_tac_nhat_ky` hoàn tác từng thao tác thay đổi.
6. `24_nguy_co_isa.sql`: Tạo thủ tục lưu trữ `sp_cay_nguy_co_cong_trinh` phân tích nguy cơ cây ngã đổ theo vùng mục tiêu ISA.
7. `25_cay_ngoai_toa_nha.sql`: Tạo trigger chặn đặt vị trí gốc cây nằm bên trong đường bao móng của tòa nhà.

---

## 8. Hướng dẫn cài đặt thư viện và cấu hình môi trường

### 8.1. Cài đặt và cấu hình dịch vụ Backend API (`api/`)

1. Mở cửa sổ dòng lệnh (Terminal) và di chuyển vào thư mục API:
   ```bash
   cd api
   ```
2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Kiểm tra file cấu hình biến môi trường `.env`:
   File cấu hình mẫu đã được chuẩn bị sẵn tại `api/.env`:
   ```ini
   PORT=3001
   DB_SERVER=localhost
   DB_PORT=1433
   DB_NAME=ie402_green_space
   DB_USER=sa
   DB_PASSWORD=<mat_khau_sql_server>
   DB_TRUST_CERT=true
   DB_POOL_MAX=10
   JWT_SECRET=<chuoi_jwt_secret_ngau_nhien>
   JWT_EXPIRES=8h
   CORS_ORIGIN=http://localhost:5173
   ```

   > **Lưu ý:** Cấu hình file `.env` mẫu từ file `.env.example`. Thay đổi `DB_USER` và `DB_PASSWORD` cho đúng với thông tin xác thực SQL Server trên máy bạn. Tuyệt đối không đưa mật khẩu cá nhân lên hệ thống quản lý phiên bản.
   >

### 8.2. Cài đặt và cấu hình dịch vụ Frontend Web (`web/`)

1. Mở một cửa sổ dòng lệnh mới và di chuyển vào thư mục giao diện:
   ```bash
   cd web
   ```
2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```

   *(Thao tác này sẽ tải về React 19, Vite 8 và gói đóng gói cục bộ của `@arcgis/core`).*

---

## 9. Hướng dẫn khởi chạy hệ thống (local)

Hệ thống cần 2 tiến trình chạy song song: dịch vụ Backend API và dịch vụ Frontend Web.

### Bước 1: Khởi động dịch vụ Backend API (cổng 3001)

Tại thư mục `api/`, chạy lệnh:

```bash
npm start
# Hoặc chế độ tự khởi động lại khi sửa mã nguồn:
npm run dev
```

Khi khởi động thành công, màn hình terminal sẽ hiển thị:

```
API WebGIS 3D cay xanh lang Dai hoc dang lang nghe tai cong 3001
Ket noi CSDL thanh cong toi localhost:1433/ie402_green_space
```

### Bước 2: Khởi động dịch vụ Frontend Web (cổng 5173)

Tại thư mục `web/`, chạy lệnh:

```bash
npm run dev
```

Khi khởi động thành công, Vite sẽ cung cấp địa chỉ truy cập cục bộ:

```
  VITE v8.3.3  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Bước 3: Mở trình duyệt và trải nghiệm

Mở trình duyệt (khuyến nghị Google Chrome hoặc Microsoft Edge) và truy cập đường dẫn:

```
http://localhost:5173
```

> **Lưu ý kỹ thuật:** Trong lần đầu tiên tải trang, Vite sẽ thực hiện tiền biên dịch (pre-bundle) gói thư viện 3D lớn `@arcgis/core`, do đó cảnh 3D có thể mất từ 10 đến 30 giây để hoàn tất khởi dựng.

---

## 10. Tài khoản thử nghiệm và ma trận phân quyền

Hệ thống cung cấp sẵn các tài khoản thử nghiệm tương ứng với từng vai trò tác nhân:

### 10.1. Danh sách tài khoản thử nghiệm:

- **Người quản lý khu vực (Zone Manager):**
  - **Tên đăng nhập:** `ttb`
  - **Mật khẩu:** `Demo@2026`
  - **Phân công phụ trách:** Phân khu 2 (Khu Ký túc xá Khu B - ĐHQG-HCM).
  - **Hành vi kiểm chứng:** Cán bộ có thể thêm, nhân bản, sửa (dời vị trí), xóa cây trong Khu 2 thành công. Nếu thao tác cây ở phân khu khác (ví dụ Khu 1), trigger CSDL sẽ phát sinh lỗi 50104 và API trả về `403 Forbidden`: *"Bạn chỉ được thao tác cây trong khu được phân công"*.
- **Quản trị hệ thống (System Administrator):**
  - **Tên đăng nhập:** `admin`
  - **Mật khẩu:** `Demo@2026`
  - **Quyền hạn kỹ thuật:** Không bị giới hạn phân khu (`ma_nql` để trống); có thể thao tác dữ liệu cây ở toàn bộ 5 khu vực; mở khóa tính năng Khôi phục dữ liệu mặc định (UC10) và tính năng Xem nhật ký & Hoàn tác thay đổi (UC11).

---

## 11. Danh mục 16 RESTful API endpoint chính

Dịch vụ backend cung cấp **16 RESTful API endpoint** được phân chia thành 2 router chuẩn hóa:

| Phương thức | Đường dẫn (Endpoint)         | Quyền hạn | Mục đích chức năng                                                                   | UC liên quan    |
| -------------- | -------------------------------- | ----------- | ----------------------------------------------------------------------------------------- | ---------------- |
| `GET`        | `/api/health`                  | Public      | Kiểm tra trạng thái hoạt động của API và số lượng bản ghi CSDL                | –               |
| `GET`        | `/api/khu-vuc`                 | Public      | Lấy danh sách 5 phân khu quản lý kèm polygon hình học (EPSG:3405)                 | UC01, UC03       |
| `GET`        | `/api/loai-cay`                | Public      | Lấy danh mục 4 loài cây kèm đặc tính rụng lá, ra hoa, tuổi thọ                | UC01, UC09       |
| `GET`        | `/api/cay?khu=&loai=&q=`       | Public      | Tìm kiếm và lọc danh sách cây theo khu, loài hoặc mã định danh/tên            | UC01, UC02, UC08 |
| `GET`        | `/api/cay/:ma`                 | Public      | Lấy chi tiết thuộc tính một cây cụ thể theo mã định danh                       | UC02             |
| `GET`        | `/api/lop-nen/:lop`            | Public      | Lấy dữ liệu không gian lớp nền:`toa-nha`, `duong`, `ranh-gioi` (`?bbox=`)   | UC01, UC04       |
| `GET`        | `/api/thong-ke?khu=`           | Public      | Gọi`sp_thong_ke_che_phu` lấy diện tích che phủ, mật độ, thể tích tán         | UC03             |
| `GET`        | `/api/phan-tich/cay-nguy-co`   | Public      | Gọi`sp_cay_nguy_co_cong_trinh` lấy danh sách cây nguy cơ theo ISA                  | UC07             |
| `POST`       | `/api/dang-nhap`               | Public      | Xác thực đăng nhập qua`sp_dang_nhap`, cấp mã JWT (thời hạn 8 giờ)             | UC06             |
| `POST`       | `/api/cay`                     | Bearer JWT  | Thêm một cây mới vào hệ thống (tự động gán khu và nội suy cao độ Z)        | UC05.1, UC05.2   |
| `PUT`        | `/api/cay/:ma`                 | Bearer JWT  | Chỉnh sửa thuộc tính kích thước hoặc cập nhật vị trí tọa độ mới của cây | UC05.3           |
| `DELETE`     | `/api/cay/:ma`                 | Bearer JWT  | Xóa một cây xanh khỏi cơ sở dữ liệu (tự động lưu vết vào nhật ký)         | UC05.4           |
| `GET`        | `/api/khoi-phuc`               | Admin JWT   | Xem trước danh sách các thay đổi của người quản lý sẽ bị hoàn nguyên       | UC10             |
| `POST`       | `/api/khoi-phuc`               | Admin JWT   | Gọi`sp_khoi_phuc_mac_dinh` thực hiện hoàn nguyên dữ liệu cây mặc định        | UC10             |
| `GET`        | `/api/nhat-ky?gioi_han=`       | Admin JWT   | Lấy danh sách lịch sử sửa đổi kèm trạng thái có thể hoàn tác hay không     | UC11             |
| `POST`       | `/api/nhat-ky/:ma_nk/hoan-tac` | Admin JWT   | Gọi`sp_hoan_tac_nhat_ky` khôi phục lại giá trị cũ của bản ghi nhật ký        | UC11             |

---

## 12. Hướng dẫn chạy bộ kiểm thử tự động (79 bài test)

Hệ thống được trang bị bộ kiểm thử tự động toàn diện với **tổng cộng 79 bài test tự động** xuyên suốt 3 tầng kiến trúc (CSDL, API backend, E2E frontend):

### 12.1. Kiểm thử toàn vẹn CSDL T-SQL (11 bài test Đạt)

Chạy script `db/13_kiem_thu_3_4.sql` trong SQL Server Management Studio để kiểm chứng:

- Kiểm tra các ràng buộc CHECK (R1 - R13): DBH $\le 0$, ngày trồng tương lai, tình trạng sai danh mục.
- Kiểm tra trigger tự gán khu vực (`trg_gan_khu_vuc`), trigger phân quyền khu (`trg_kiem_tra_phan_quyen`), trigger chặn đặt gốc cây trong nền nhà (`trg_chan_cay_trong_toa_nha`).
- *Kết quả:* **11/11 bài test đạt chuẩn (100% PASSED)**.

### 12.2. Kiểm thử tích hợp Backend API (31 bài test Đạt)

Bộ kiểm thử chạy ở chế độ độc lập với pool kết nối đơn lẻ nhằm chứng minh cơ chế an toàn phiên làm việc `SESSION_CONTEXT`:

```bash
cd api
# Bước 1: Khởi chạy API ở chế độ test
npm run start:test

# Bước 2: Mở một terminal khác và chạy script kiểm thử Python
python tests/kiem_thu_api.py
```

*Kết quả:* Toàn bộ **31/31 ca kiểm thử** (xác thực, thêm cây hợp lệ, chặn cây ngoài ranh giới, chặn cây sai khu vực, kiểm tra làm sạch phiên sau mỗi truy vấn) đều đạt kết quả **PASSED**. Dữ liệu sau khi kiểm thử tự động dọn dẹp và giữ nguyên vẹn 333 cây ban đầu.

### 12.3. Kiểm thử tự động giao diện E2E bằng Puppeteer (48 bài test Đạt)

Khi cả backend (`cổng 3001`) và frontend (`cổng 5173`) đang hoạt động:

```bash
cd web
# Kiểm thử các ca sử dụng giao diện người dùng (UC01 - UC04, UC07 - UC09):
node tests/kiem_thu_giao_dien.mjs

# Kiểm thử chức năng phân quyền quản trị và quản trị hệ thống (UC05, UC06, UC10):
node tests/kiem_thu_quan_tri.mjs
```

- **Bộ kiểm thử giao diện người dùng (`kiem_thu_giao_dien.mjs`):** **23/23 bước Đạt** (kiểm tra tải cảnh 3D, 7 lớp dữ liệu, chú giải 4 loài, thống kê 333 cây, tìm kiếm cây 14, tìm loài Sao đen 91 cây, lọc cây, xem theo loài/tình trạng, phân tích nguy cơ ngã đổ, không có lỗi JavaScript).
- **Bộ kiểm thử giao diện quản trị (`kiem_thu_quan_tri.mjs`):** **25/25 bước Đạt** (đăng nhập sai báo lỗi; thẻ tài khoản đúng khu phụ trách; thêm cây chỉ bật ở khu phụ trách; chặn vị trí ngoài khu và trong tòa nhà; thêm, xóa, nhân bản, sửa sidebar và dời vị trí rồi hoàn trả chính xác; cây khu khác bị khóa Sửa/Xóa; admin mở xem trước khôi phục; đăng xuất).

---

## 13. Hướng dẫn đóng gói và triển khai đám mây Azure

Hệ thống hỗ trợ quy trình triển khai nhanh lên nền tảng đám mây Microsoft Azure:

### Kiến trúc triển khai Azure:

- **Web App Single-Container:** Dịch vụ Azure App Service (gói B1 Linux, Node.js 24 LTS) phục vụ cả API Express và toàn bộ bản build giao diện tĩnh của React (`STATIC_DIR=public`).
- **Database Serverless:** Dịch vụ Azure SQL Database Serverless (bậc tính phí tự động tạm dừng khi không có truy vấn).

### Quy trình đóng gói và phát hành:

Sử dụng script tự động hóa chuẩn bị sẵn tại `trien_khai/trien_khai.sh` (yêu cầu cài đặt Azure CLI):

```bash
bash trien_khai/trien_khai.sh
```

Script sẽ tự động:

1. Thực hiện lệnh `npm run build` trong thư mục `web/` để xuất mã tĩnh tối ưu vào `web/dist/`.
2. Gom mã nguồn backend `api/src`, cấu hình phụ thuộc `package.json` và đưa thư mục `web/dist` thành thư mục `public/`.
3. Nén thành gói triển khai `goi.zip` và đẩy trực tiếp lên Azure App Service qua giao thức ZIP Deploy.
4. Tự động kiểm tra trạng thái sức khỏe dịch vụ qua endpoint `https://ie402-webgis-25410333.azurewebsites.net/api/health`.
