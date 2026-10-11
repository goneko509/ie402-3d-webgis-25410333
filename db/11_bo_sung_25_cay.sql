-- Bổ sung 25 cây GIẢ LẬP (vị trí ngẫu nhiên, thuộc tính giả định) để đủ 333 cây - MS SQL Server
-- Sinh bởi 11_sinh_25_cay.py (seed 333); xem quy tắc trong docstring script. Chỉ chạy MỘT lần.
-- ma_khu_vuc do trigger trg_cay_xanh_gan_khu_vuc tự gán theo vị trí; ngay_cap_nhat lấy mặc định.
USE ie402_green_space;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF (SELECT COUNT(*) FROM cay_xanh) <> 308 THROW 50301, N'Bảng cay_xanh không còn 308 cây; script đã chạy hoặc dữ liệu đã thay đổi.', 1;
INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, dbh, ngay_trong, shape) VALUES
(2, 18.8, 4.4, N'Bình thường', 28.8, '2000-05-11', geometry::STGeomFromText('POINT (694820.710790 1203342.935826 15.461849)', 3405)),
(1, 10.7, 4.2, N'Bình thường', 21.2, '2012-08-08', geometry::STGeomFromText('POINT (696525.595769 1203699.538454 21.426914)', 3405)),
(4, 12.2, 7.3, N'Bình thường', 42.0, '2003-06-11', geometry::STGeomFromText('POINT (694659.745225 1203067.435525 13.043939)', 3405)),
(1, 10.5, 4.2, N'Bình thường', 20.0, '2013-07-19', geometry::STGeomFromText('POINT (694924.377779 1202644.703381 17.288326)', 3405)),
(3, 14.6, 4.9, N'Bình thường', 28.3, '2005-05-25', geometry::STGeomFromText('POINT (695301.016459 1202840.850559 26.866415)', 3405)),
(2, 20.8, 4.4, N'Bình thường', 31.1, '2002-06-07', geometry::STGeomFromText('POINT (696475.416520 1202851.887846 37.497448)', 3405)),
(3, 13.2, 4.5, N'Bình thường', 27.2, '2004-06-21', geometry::STGeomFromText('POINT (696324.943407 1202983.246566 33.875589)', 3405)),
(2, 28.3, 5.6, N'Bình thường', 35.4, '1995-05-11', geometry::STGeomFromText('POINT (696418.320067 1203062.851830 34.724627)', 3405)),
(4, 17.9, 8.2, N'Bình thường', 69.7, '1993-08-25', geometry::STGeomFromText('POINT (696662.873005 1203179.611739 35.533031)', 3405)),
(4, 17.1, 8.0, N'Bình thường', 66.3, '1995-08-21', geometry::STGeomFromText('POINT (696465.937528 1203258.690159 21.742838)', 3405)),
(1, 11.8, 4.4, N'Bình thường', 28.8, '2007-05-08', geometry::STGeomFromText('POINT (696700.922887 1203002.736364 35.736753)', 3405)),
(4, 16.7, 8.7, N'Bình thường', 43.9, '2002-09-01', geometry::STGeomFromText('POINT (696872.356245 1203004.733430 32.396140)', 3405)),
(4, 15.1, 7.5, N'Bình thường', 44.4, '2004-06-14', geometry::STGeomFromText('POINT (697027.856727 1202908.743015 28.980432)', 3405)),
(1, 14.2, 4.9, N'Bình thường', 28.6, '2006-08-27', geometry::STGeomFromText('POINT (696967.168807 1202873.661343 30.696674)', 3405)),
(2, 27.6, 5.5, N'Bình thường', 42.2, '1994-09-10', geometry::STGeomFromText('POINT (696836.580144 1202846.985596 37.417919)', 3405)),
(2, 23.8, 5.0, N'Bình thường', 39.9, '1995-05-01', geometry::STGeomFromText('POINT (697764.043935 1203324.510998 18.033176)', 3405)),
(1, 9.4, 3.5, N'Bình thường', 23.1, '2011-09-28', geometry::STGeomFromText('POINT (697535.826548 1203981.780032 10.317812)', 3405)),
(1, 14.5, 5.1, N'Bình thường', 29.6, '2005-08-25', geometry::STGeomFromText('POINT (697230.947010 1203763.209572 12.937871)', 3405)),
(3, 8.5, 3.5, N'Bình thường', 18.9, '2012-09-22', geometry::STGeomFromText('POINT (697507.507591 1203322.228837 17.352410)', 3405)),
(1, 10.0, 3.7, N'Bình thường', 22.2, '2010-08-20', geometry::STGeomFromText('POINT (697027.740754 1203065.791048 26.452878)', 3405)),
(4, 13.3, 7.6, N'Bình thường', 40.9, '2006-09-20', geometry::STGeomFromText('POINT (696006.673908 1201868.038580 25.863141)', 3405)),
(2, 29.4, 5.3, N'Bình thường', 37.1, '1992-07-09', geometry::STGeomFromText('POINT (696087.764052 1202053.339311 27.144327)', 3405)),
(3, 14.3, 4.6, N'Bình thường', 28.6, '2005-06-20', geometry::STGeomFromText('POINT (696669.252335 1202000.113297 19.837169)', 3405)),
(2, 18.9, 3.7, N'Bình thường', 27.2, '2003-05-20', geometry::STGeomFromText('POINT (696775.644668 1202653.993945 35.579236)', 3405)),
(1, 13.8, 5.5, N'Bình thường', 31.9, '2005-06-02', geometry::STGeomFromText('POINT (696415.276628 1201822.903256 21.419087)', 3405));
COMMIT;
GO

SELECT k.ten_khu_vuc, COUNT(*) AS so_cay FROM cay_xanh c JOIN khu_vuc k ON k.ma_khu_vuc = c.ma_khu_vuc GROUP BY k.ten_khu_vuc;
SELECT COUNT(*) AS tong_so_cay FROM cay_xanh;
GO
