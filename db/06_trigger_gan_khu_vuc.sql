-- Ràng buộc toàn vẹn Cây xanh - Khu vực (MS SQL Server), phục vụ UC05 Thêm/sửa/xóa cây
-- Quy tắc (nguyên tắc 9, 10 - mục 78 file thảo luận):
--   * Mỗi cây thuộc đúng một khu vực; ma_khu_vuc luôn do CSDL tự tính bằng STContains,
--     người dùng không cần (và không thể) nhập tay sai.
--   * Cây nằm ngoài mọi khu vực, nằm đúng trên ranh giới khu, hoặc sai SRID thì bị từ chối.
--   * Khi hình học khu vực thay đổi, cây được gán lại; nếu có cây "mồ côi" thì hủy thay đổi.
-- Chạy được nhiều lần (CREATE OR ALTER).

USE ie402_green_space;
GO

CREATE OR ALTER TRIGGER trg_cay_xanh_gan_khu_vuc
ON cay_xanh
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM inserted) RETURN;

    -- Cột kỹ thuật ngay_cap_nhat (dấu vết cập nhật bản ghi, script 07): ghi thời điểm thêm/sửa
    IF COL_LENGTH('cay_xanh', 'ngay_cap_nhat') IS NOT NULL AND NOT UPDATE(ngay_cap_nhat)
        UPDATE c SET c.ngay_cap_nhat = SYSDATETIME()
        FROM cay_xanh c JOIN inserted i ON i.ma_cay = c.ma_cay;

    -- Chỉ xử lý khu vực khi hình học hoặc mã khu vực bị thay đổi
    IF NOT (UPDATE(shape) OR UPDATE(ma_khu_vuc)) RETURN;

    IF EXISTS (SELECT 1 FROM inserted WHERE shape IS NULL OR shape.STSrid <> 3405)
        THROW 50101, N'Cây phải có vị trí (shape) với SRID 3405 (VN-2000 / UTM 48N).', 1;

    UPDATE c
    SET c.ma_khu_vuc = k.ma_khu_vuc
    FROM cay_xanh c
    JOIN inserted i ON i.ma_cay = c.ma_cay
    CROSS APPLY (SELECT TOP 1 kv.ma_khu_vuc
                 FROM khu_vuc kv
                 WHERE kv.shape.STContains(i.shape) = 1) k;

    IF EXISTS (SELECT 1 FROM inserted i
               WHERE NOT EXISTS (SELECT 1 FROM khu_vuc kv WHERE kv.shape.STContains(i.shape) = 1))
        THROW 50102, N'Cây nằm ngoài mọi khu vực hoặc nằm đúng trên ranh giới khu vực.', 1;
END;
GO

CREATE OR ALTER TRIGGER trg_khu_vuc_gan_lai_cay
ON khu_vuc
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    -- Diện tích là thuộc tính dẫn xuất, đơn vị ha (mục 86)
    UPDATE kv SET kv.dien_tich = ROUND(kv.shape.STArea() / 10000.0, 4)
    FROM khu_vuc kv JOIN inserted i ON i.ma_khu_vuc = kv.ma_khu_vuc;

    -- Kiểm tra trước: thay đổi không được làm cây nào "mồ côi"
    IF EXISTS (SELECT 1 FROM cay_xanh c
               WHERE NOT EXISTS (SELECT 1 FROM khu_vuc kv WHERE kv.shape.STContains(c.shape) = 1))
        THROW 50103, N'Thay đổi khu vực làm có cây không thuộc khu nào; thay đổi bị hủy.', 1;

    -- Gán lại khu vực cho mọi cây (308 cây, chi phí nhỏ)
    UPDATE c
    SET c.ma_khu_vuc = k.ma_khu_vuc
    FROM cay_xanh c
    CROSS APPLY (SELECT TOP 1 kv.ma_khu_vuc
                 FROM khu_vuc kv
                 WHERE kv.shape.STContains(c.shape) = 1) k
    WHERE ISNULL(c.ma_khu_vuc, -1) <> k.ma_khu_vuc;
END;
GO

SELECT name, OBJECT_NAME(parent_id) AS bang, is_disabled
FROM sys.triggers WHERE name IN ('trg_cay_xanh_gan_khu_vuc', 'trg_khu_vuc_gan_lai_cay');
