-- Thống kê che phủ theo khu và toàn vùng (UC03) - MS SQL Server / Azure SQL
-- Công thức như Chương 2 và script ketqua/01:
--   vùng tán = hợp (UnionAggregate) các Buffer bán kính R của MỌI cây, cắt theo khu (tán có thể vươn sang khu bên cạnh)
--   tỷ lệ che phủ = diện tích tán trong khu / diện tích khu x 100 %
--   thể tích tán  = tổng 2/3 * pi * R^2 * h_c, h_c = 0,75 * H (cây thuộc khu)
-- @ma_khu_vuc NULL: trả 5 khu + dòng toàn vùng (ma_khu_vuc NULL); có giá trị: chỉ khu đó.

USE ie402_green_space;
GO

CREATE OR ALTER PROCEDURE sp_thong_ke_che_phu @ma_khu_vuc INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @k FLOAT = 0.75;
    DECLARE @tan GEOMETRY = (SELECT geometry::UnionAggregate(shape.STBuffer(ban_kinh_tan)) FROM cay_xanh);

    ;WITH cay_theo_khu AS (                  -- geometry không GROUP BY được: tổng hợp cây trước rồi nối khu
        SELECT ma_khu_vuc, COUNT(*) AS so_cay,
               SUM(2.0 / 3 * PI() * ban_kinh_tan * ban_kinh_tan * @k * chieu_cao) AS the_tich_m3
        FROM cay_xanh
        GROUP BY ma_khu_vuc
    ), theo_khu AS (
        SELECT kv.ma_khu_vuc, kv.ten_khu_vuc, kv.shape,
               ISNULL(c.so_cay, 0) AS so_cay, ISNULL(c.the_tich_m3, 0) AS the_tich_m3
        FROM khu_vuc kv
        LEFT JOIN cay_theo_khu c ON c.ma_khu_vuc = kv.ma_khu_vuc
    ), dong AS (
        SELECT ma_khu_vuc, ten_khu_vuc, so_cay, the_tich_m3,
               shape.STArea() AS dien_tich_m2,
               ISNULL(shape.STIntersection(@tan).STArea(), 0) AS dien_tich_tan_m2
        FROM theo_khu
        UNION ALL
        SELECT NULL, N'Toàn vùng nghiên cứu',
               (SELECT COUNT(*) FROM cay_xanh),
               (SELECT SUM(2.0 / 3 * PI() * ban_kinh_tan * ban_kinh_tan * @k * chieu_cao) FROM cay_xanh),
               r.shape.STArea(),
               ISNULL(r.shape.STIntersection(@tan).STArea(), 0)
        FROM ranh_gioi r
    )
    SELECT ma_khu_vuc, ten_khu_vuc, so_cay,
           CAST(dien_tich_m2 / 10000 AS DECIMAL(10,2)) AS dien_tich_ha,
           CAST(so_cay / (dien_tich_m2 / 10000) AS DECIMAL(10,2)) AS mat_do,
           CAST(dien_tich_tan_m2 AS DECIMAL(12,1)) AS dien_tich_tan_m2,
           CAST(dien_tich_tan_m2 / dien_tich_m2 * 100 AS DECIMAL(6,3)) AS ty_le_che_phu,
           CAST(the_tich_m3 AS DECIMAL(12,1)) AS the_tich_m3
    FROM dong
    WHERE @ma_khu_vuc IS NULL OR ma_khu_vuc = @ma_khu_vuc
    ORDER BY CASE WHEN ma_khu_vuc IS NULL THEN 1 ELSE 0 END, ma_khu_vuc;
END;
GO
