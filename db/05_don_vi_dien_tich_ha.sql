-- Thống nhất đơn vị diện tích của bảng khu_vuc là HECTA (ha) (MS SQL Server)
-- Hệ tọa độ EPSG:3405 có đơn vị mét, nên shape.STArea() trả về m²; dien_tich lưu = STArea() / 10000.
-- Chạy được nhiều lần (luôn tính lại từ hình học).

USE ie402_green_space;
GO

-- Kiểu cột thực tế trên CSDL là NUMERIC(18,2): với đơn vị ha chỉ chính xác đến 100 m².
-- Đổi sang DECIMAL(12,4): chính xác đến 0,0001 ha = 1 m².
ALTER TABLE khu_vuc ALTER COLUMN dien_tich DECIMAL(12,4) NULL;
GO

UPDATE khu_vuc SET dien_tich = ROUND(shape.STArea() / 10000.0, 4);
GO

-- Ghi chú đơn vị vào siêu dữ liệu cột (hiện trong SSMS: Properties của cột -> Extended Properties)
IF EXISTS (SELECT 1 FROM sys.extended_properties
           WHERE major_id = OBJECT_ID('khu_vuc') AND name = 'MS_Description'
             AND minor_id = COLUMNPROPERTY(OBJECT_ID('khu_vuc'), 'dien_tich', 'ColumnId'))
    EXEC sp_dropextendedproperty @name = N'MS_Description', @level0type = N'SCHEMA', @level0name = N'dbo',
         @level1type = N'TABLE', @level1name = N'khu_vuc', @level2type = N'COLUMN', @level2name = N'dien_tich';
EXEC sp_addextendedproperty @name = N'MS_Description',
     @value = N'Diện tích khu vực, đơn vị ha (= shape.STArea() / 10000, EPSG:3405)',
     @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'khu_vuc',
     @level2type = N'COLUMN', @level2name = N'dien_tich';
GO

SELECT ma_khu_vuc, dien_tich AS dien_tich_ha, ROUND(shape.STArea() / 10000.0, 4) AS kiem_tra_ha FROM khu_vuc ORDER BY ma_khu_vuc;
