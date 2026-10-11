-- Cập nhật cao độ Z (IDW) cho các cây bổ sung đã được dời vị trí trên ảnh vệ tinh - sinh bởi 12_cap_nhat_vi_tri_so_hoa.py
USE ie402_green_space;
GO
SET XACT_ABORT ON;
BEGIN TRANSACTION;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (696105.752676 1203413.789733 20.022019)', 3405) WHERE ma_cay = 358;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (695403.183599 1202907.897745 25.498380)', 3405) WHERE ma_cay = 361;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (696524.504638 1202849.892394 37.480493)', 3405) WHERE ma_cay = 362;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (696250.712594 1202902.630307 32.938272)', 3405) WHERE ma_cay = 363;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (696641.411596 1203033.718231 35.958736)', 3405) WHERE ma_cay = 364;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (695410.742531 1203179.670261 29.266640)', 3405) WHERE ma_cay = 366;
UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (696940.739048 1203021.891105 29.443061)', 3405) WHERE ma_cay = 376;
COMMIT;
GO
