-- Kiểm tra CSDL sau khi chuyển (chạy trên cả local và Azure, so sánh kết quả): số dòng, đối tượng lập trình, tổng kiểm tra cây xanh.
SET NOCOUNT ON;
SELECT t.name AS bang, SUM(p.rows) AS so_dong
FROM sys.tables t JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
GROUP BY t.name ORDER BY t.name;
SELECT type_desc AS loai, name AS ten FROM sys.objects WHERE type IN ('TR', 'P', 'FN', 'IF', 'TF', 'V') ORDER BY type_desc, name;
SELECT COUNT(*) AS so_cay, CAST(SUM(shape.STX + shape.STY + shape.Z) AS DECIMAL(20, 4)) AS tong_xyz,
       CAST(SUM(chieu_cao + ban_kinh_tan + dbh) AS DECIMAL(20, 2)) AS tong_thuoc_tinh, SUM(ma_khu_vuc) AS tong_khu
FROM cay_xanh;
SELECT compatibility_level FROM sys.databases WHERE name = DB_NAME();
