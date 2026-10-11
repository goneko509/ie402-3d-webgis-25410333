-- Khôi phục cây 14 bị kiểm thử giao diện xóa nhầm (07/10/2026 21:07) và xóa cây kiểm thử 391.
-- Dữ liệu gốc lấy từ Tree.gpkg (đồng bộ với SQL Server trước sự cố).
USE ie402_green_space;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF EXISTS (SELECT 1 FROM cay_xanh WHERE ma_cay = 14) THROW 50901, N'Cây 14 đã tồn tại, không khôi phục.', 1;
DELETE FROM cay_xanh WHERE ma_cay = 391 AND chieu_cao = 8.5 AND ban_kinh_tan = 3.2 AND dbh = 18.0 AND ngay_trong = '2021-03-15';
SET IDENTITY_INSERT cay_xanh ON;
INSERT INTO cay_xanh (ma_cay, ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, dbh, ngay_trong, shape)
VALUES (14, 4, 13.70, 6.60, N'Bình thường', 40.8, '2006-05-14',
        geometry::STGeomFromText('POINT (696169.770811 1202796.962911 30.072178)', 3405));
SET IDENTITY_INSERT cay_xanh OFF;
COMMIT;
GO
SELECT COUNT(*) AS so_cay, (SELECT COUNT(*) FROM cay_xanh WHERE ma_cay = 391) AS con_391 FROM cay_xanh;
SELECT ma_cay, ma_loai, ma_khu_vuc, chieu_cao, ban_kinh_tan, dbh, ngay_trong, tinh_trang, shape.STX AS x, shape.STY AS y, shape.Z AS z
FROM cay_xanh WHERE ma_cay = 14;
GO
