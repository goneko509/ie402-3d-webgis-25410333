-- Bảng lớp nền D4 cho WebGIS (chỉ đọc đối với ứng dụng) - MS SQL Server / Azure SQL
-- Hình học EPSG:3405 (VN-2000 / UTM 48N), nạp dữ liệu bằng 15_nap_lop_nen.sql (sinh từ Tree.gpkg bởi 15_sinh_lop_nen.py).
-- Chạy lại được: xóa và tạo lại ba bảng.

USE ie402_green_space;
GO

DROP TABLE IF EXISTS toa_nha;
DROP TABLE IF EXISTS duong;
DROP TABLE IF EXISTS ranh_gioi;
GO

CREATE TABLE toa_nha (
    ma_toa_nha INT NOT NULL PRIMARY KEY,           -- fid trong Tree.gpkg
    ten NVARCHAR(200) NULL,
    chieu_cao NUMERIC(6,2) NOT NULL CONSTRAINT ck_toa_nha_chieu_cao CHECK (chieu_cao > 0),   -- m
    nguon_chieu_cao NVARCHAR(100) NOT NULL,       -- OSM height / OSM building:levels x 3,5 m / giả định 3 tầng
    shape GEOMETRY NOT NULL
);

CREATE TABLE duong (
    ma_duong INT NOT NULL PRIMARY KEY,             -- fid trong Tree.gpkg
    ten NVARCHAR(200) NULL,
    cap_duong VARCHAR(30) NULL,                    -- thẻ highway của OSM
    shape GEOMETRY NOT NULL
);

CREATE TABLE ranh_gioi (
    ma INT NOT NULL PRIMARY KEY,
    ten NVARCHAR(200) NOT NULL,
    shape GEOMETRY NOT NULL
);
GO

ALTER TABLE toa_nha ADD CONSTRAINT ck_toa_nha_srid CHECK (shape.STSrid = 3405);
ALTER TABLE duong ADD CONSTRAINT ck_duong_srid CHECK (shape.STSrid = 3405);
ALTER TABLE ranh_gioi ADD CONSTRAINT ck_ranh_gioi_srid CHECK (shape.STSrid = 3405);
GO

CREATE SPATIAL INDEX six_toa_nha ON toa_nha (shape) USING GEOMETRY_AUTO_GRID
    WITH (BOUNDING_BOX = (692000, 1200000, 702000, 1206000));
CREATE SPATIAL INDEX six_duong ON duong (shape) USING GEOMETRY_AUTO_GRID
    WITH (BOUNDING_BOX = (692000, 1200000, 702000, 1206000));
GO
