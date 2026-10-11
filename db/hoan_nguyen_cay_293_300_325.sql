-- Hoàn nguyên vị trí cây 293, 300, 325 về đúng Tree.gpkg (07/10/2026).
-- Ba cây bị dời nhầm trong phiên chỉnh sửa QGIS sáng 07/10 (lệch 86-195 m); Z không đổi nên giữ nguyên.
-- Trigger trg_cay_xanh_gan_khu_vuc tự gán lại khu theo vị trí mới.
USE ie402_green_space;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF (SELECT COUNT(*) FROM cay_xanh
    WHERE (ma_cay = 293 AND ABS(shape.STX - 694530.019967) < 0.01)
       OR (ma_cay = 300 AND ABS(shape.STX - 694532.481965) < 0.01)
       OR (ma_cay = 325 AND ABS(shape.STX - 697244.476378) < 0.01)) <> 3
    THROW 50902, N'Tọa độ hiện tại không đúng giá trị bị dời, không hoàn nguyên.', 1;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (694334.864765297 1202631.37931463 13.1298397248787)', 3405) WHERE ma_cay = 293;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (694446.67753093 1202629.70441829 10.7595829903566)', 3405) WHERE ma_cay = 300;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (697255.741714876 1202828.23534961 30.8974563861578)', 3405) WHERE ma_cay = 325;
COMMIT;
GO
SELECT ma_cay, ma_khu_vuc, shape.STX AS x, shape.STY AS y, shape.Z AS z, (SELECT COUNT(*) FROM cay_xanh) AS so_cay
FROM cay_xanh WHERE ma_cay IN (293, 300, 325);
GO
