-- Kịch bản khởi tạo Cơ sở dữ liệu Không gian cho Đồ án GIS 3D (MS SQL Server)
-- Hệ tọa độ sử dụng: VN-2000 (SRID: 3405)

-- ==========================================
-- 0. XÓA CÁC BẢNG CŨ (Nếu đã tồn tại)
-- ==========================================
-- Chú ý: Phải xóa các bảng có chứa khóa ngoại (bảng con) trước
DROP TABLE IF EXISTS tai_khoan;
DROP TABLE IF EXISTS cay_xanh;
DROP TABLE IF EXISTS loai_cay;
DROP TABLE IF EXISTS khu_vuc;
DROP TABLE IF EXISTS nguoi_quan_ly;
GO

-- ==========================================
-- 1. TẠO LẠI CÁC BẢNG DANH MỤC & KHÔNG GIAN
-- ==========================================
-- 1. Bảng danh mục Người quản lý
CREATE TABLE nguoi_quan_ly (
    ma_nql INT IDENTITY(1,1) PRIMARY KEY,
    ten_nql NVARCHAR(100),
    chuc_vu NVARCHAR(100),
    so_dien_thoai VARCHAR(20)
);
GO

-- 2. Bảng danh mục Khu vực (Polygon)
CREATE TABLE khu_vuc (
    ma_khu_vuc INT IDENTITY(1,1) PRIMARY KEY,
    ten_khu_vuc NVARCHAR(200),
    dien_tich DECIMAL(12,4),       -- đơn vị: ha (= shape.STArea() / 10000), chính xác đến 1 m²
    ma_nql INT FOREIGN KEY REFERENCES nguoi_quan_ly(ma_nql),
    shape GEOMETRY 
);
GO

-- 3. Bảng danh mục Loại cây
CREATE TABLE loai_cay (
    ma_loai INT IDENTITY(1,1) PRIMARY KEY,
    ten_loai NVARCHAR(100) NOT NULL,
    ten_khoa_hoc NVARCHAR(200),      -- tên khoa học (NĐ 258/2025/NĐ-CP), script 10
    dac_tinh_sinh_hoc NVARCHAR(MAX),
    thoidiem_rungla NVARCHAR(200),   -- thuộc tính thời gian (chu kỳ năm), script 08
    thoidiem_rahoa NVARCHAR(200),    -- thuộc tính thời gian (chu kỳ năm), script 08
    tuoi_tho_tb INT CONSTRAINT ck_loai_cay_tuoi_tho CHECK (tuoi_tho_tb > 0)   -- năm, giả định, script 09
);
GO

-- Nạp dữ liệu mồi cho bảng Loại cây (4 loại chính)
-- Sử dụng tiền tố N trước chuỗi để lưu đúng tiếng Việt Unicode
-- Thời điểm rụng lá/ra hoa theo Wikipedia (nguồn ghi trong 08_loai_cay_thoi_gian.sql); NULL = nguồn không nêu
-- Tuổi thọ trung bình: giả định (script 09)
INSERT INTO loai_cay (ten_loai, ten_khoa_hoc, dac_tinh_sinh_hoc, thoidiem_rungla, thoidiem_rahoa, tuoi_tho_tb) VALUES
(N'Bàng', N'Terminalia catappa', N'Cây bóng mát, tán lá rộng phân tầng, sinh trưởng nhanh.', N'Mùa khô (lá chuyển đỏ hồng hoặc nâu vàng trước khi rụng)', N'Mùa hè', 60),
(N'Sao đen', N'Hopea odorata', N'Cây thân gỗ lớn, tán hình tháp, rễ cọc đâm sâu.', N'Không rụng lá theo mùa (lá xanh bốn mùa)', NULL, 150),
(N'Lim xẹt', N'Peltophorum pterocarpum', N'Cây tán rộng, chịu hạn tốt, hoa vàng đặc trưng.', N'Rụng lá theo mùa (nguồn không nêu thời điểm)', N'Mùa hè', 80),
(N'Me tây', N'Albizia saman (đồng danh Samanea saman)', N'Cây tán dù, độ phủ lớn, phát triển tốt ở khu vực đô thị.', N'Một thời gian trong mùa khô', NULL, 100);
GO

-- 4. Bảng Cây xanh (PointZ) - Bảng chính chuẩn hóa
CREATE TABLE cay_xanh (
    ma_cay INT IDENTITY(1,1) PRIMARY KEY,
    ma_loai INT FOREIGN KEY REFERENCES loai_cay(ma_loai),
    ma_khu_vuc INT FOREIGN KEY REFERENCES khu_vuc(ma_khu_vuc),
    chieu_cao NUMERIC(10,2),       -- m
    ban_kinh_tan NUMERIC(10,2),    -- m
    tinh_trang NVARCHAR(100) CONSTRAINT ck_cay_xanh_tinh_trang
        CHECK (tinh_trang IN (N'Bình thường', N'Suy yếu', N'Nguy hiểm')),   -- script 10
    dbh DECIMAL(5,1) CONSTRAINT ck_cay_xanh_dbh CHECK (dbh > 0),   -- cm, đường kính ngang ngực (1,3 m), script 09
    ngay_trong DATE CONSTRAINT ck_cay_xanh_ngay_trong CHECK (ngay_trong <= CAST(GETDATE() AS DATE)),  -- thuộc tính thời gian, script 09
    ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT df_cay_xanh_ngay_cap_nhat DEFAULT SYSDATETIME(),  -- cột kỹ thuật: dấu vết cập nhật bản ghi, không phải thuộc tính thực thể (script 07)
    shape GEOMETRY
);
GO

-- 5. Bảng Tài khoản quản trị viên (script 10: thủ tục đăng nhập, tài khoản demo, trigger phân quyền theo khu)
SET QUOTED_IDENTIFIER ON;
GO
CREATE TABLE tai_khoan (
    ma_tk INT IDENTITY(1,1) PRIMARY KEY,
    ten_dang_nhap VARCHAR(50) NOT NULL CONSTRAINT uq_tai_khoan_ten UNIQUE,
    mat_khau_hash VARBINARY(64) NOT NULL,     -- SHA2_512(salt + mật khẩu), không lưu mật khẩu rõ
    salt VARBINARY(16) NOT NULL,
    vai_tro VARCHAR(20) NOT NULL CONSTRAINT ck_tai_khoan_vai_tro CHECK (vai_tro IN ('QuanTri')),
    trang_thai VARCHAR(20) NOT NULL CONSTRAINT df_tai_khoan_trang_thai DEFAULT 'HoatDong'
        CONSTRAINT ck_tai_khoan_trang_thai CHECK (trang_thai IN ('HoatDong', 'Khoa')),
    ma_nql INT NULL CONSTRAINT fk_tai_khoan_nql REFERENCES nguoi_quan_ly(ma_nql)
);
CREATE UNIQUE INDEX uq_tai_khoan_ma_nql ON tai_khoan(ma_nql) WHERE ma_nql IS NOT NULL;
GO

-- ==========================================
-- LƯU Ý KHI MAPPING DỮ LIỆU TỪ QGIS
-- ==========================================
-- Khi anh import file Trees.gpkg từ QGIS vào SQL Server, hãy import nó thành bảng "raw_trees".
-- Sau đó mở New Query và chạy câu lệnh tương tự như sau để chuyển dữ liệu sang bảng cay_xanh:
/*
INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, shape)
SELECT 
    l.ma_loai, 
    r.chieucao, 
    r.bankinhtan, 
    r.tinhtrang, 
    r.geom 
FROM raw_trees r
JOIN loai_cay l ON r.loaicay = l.ten_loai;
*/