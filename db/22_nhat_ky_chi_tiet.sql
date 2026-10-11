-- Nhật ký thay đổi cây có giá trị trước / sau (JSON) và hoàn tác từng thay đổi (admin), mục 190 file thảo luận.
-- Chạy sau script 21. Chạy được nhiều lần.
--   * nhat_ky_cay thêm gia_tri_cu / gia_tri_moi: JSON một cây {ma_loai, chieu_cao, ban_kinh_tan, dbh, ngay_trong,
--     tinh_trang, ma_khu_vuc, x, y, z}. Thêm: chỉ có mới; xóa: chỉ có cũ; sửa: cả hai.
--   * thoi_diem: giờ Việt Nam (AT TIME ZONE 'SE Asia Standard Time'), đúng cả local lẫn Azure SQL (chạy UTC).
--   * Thứ tự trigger: trg_cay_xanh_gan_khu_vuc chạy ĐẦU (gán khu bằng UPDATE lồng), trg_cay_xanh_phan_quyen chạy CUỐI;
--     trg_cay_xanh_nhat_ky ở giữa nên giá trị mới đọc từ bảng đã có khu cuối cùng.
--   * sp_hoan_tac_nhat_ky @ma_nk: hoàn tác MỘT thay đổi, chỉ khi đó là thay đổi mới nhất của cây (tránh ghi đè thay đổi
--     sau): thêm -> xóa cây; sửa -> đưa về giá trị cũ; xóa -> thêm lại cây (giữ mã). Bản thân thao tác hoàn tác được ghi
--     nhật ký dưới tài khoản admin.
SET NOCOUNT ON;
GO

IF COL_LENGTH('nhat_ky_cay', 'gia_tri_cu') IS NULL
    ALTER TABLE nhat_ky_cay ADD gia_tri_cu NVARCHAR(MAX) NULL, gia_tri_moi NVARCHAR(MAX) NULL;
GO

-- Thời điểm luôn theo giờ Việt Nam: Azure SQL chạy theo UTC, SQL Server local theo giờ máy
IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'df_nhat_ky_cay_thoi_diem'
           AND definition NOT LIKE '%SE Asia Standard Time%')
BEGIN
    ALTER TABLE nhat_ky_cay DROP CONSTRAINT df_nhat_ky_cay_thoi_diem;
    ALTER TABLE nhat_ky_cay ADD CONSTRAINT df_nhat_ky_cay_thoi_diem
        DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'SE Asia Standard Time' AS DATETIME2(0)) FOR thoi_diem;
END;
GO

EXEC sp_settriggerorder @triggername = 'trg_cay_xanh_gan_khu_vuc', @order = 'First', @stmttype = 'INSERT';
EXEC sp_settriggerorder @triggername = 'trg_cay_xanh_gan_khu_vuc', @order = 'First', @stmttype = 'UPDATE';
GO

CREATE OR ALTER TRIGGER trg_cay_xanh_nhat_ky
ON cay_xanh
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;      -- bỏ lần kích hoạt lồng (UPDATE của trg_cay_xanh_gan_khu_vuc)
    DECLARE @ma_tk INT = CAST(SESSION_CONTEXT(N'ma_tk') AS INT);
    INSERT INTO nhat_ky_cay (ma_cay, thao_tac, ma_tk, gia_tri_cu, gia_tri_moi)
    SELECT COALESCE(i.ma_cay, d.ma_cay),
           CASE WHEN d.ma_cay IS NULL THEN 'them' WHEN i.ma_cay IS NULL THEN 'xoa' ELSE 'sua' END, @ma_tk,
           (SELECT d.ma_loai, d.chieu_cao, d.ban_kinh_tan, d.dbh, d.ngay_trong, d.tinh_trang, d.ma_khu_vuc,
                   d.shape.STX AS x, d.shape.STY AS y, d.shape.Z AS z
            WHERE d.ma_cay IS NOT NULL FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT c.ma_loai, c.chieu_cao, c.ban_kinh_tan, c.dbh, c.ngay_trong, c.tinh_trang, c.ma_khu_vuc,
                   c.shape.STX AS x, c.shape.STY AS y, c.shape.Z AS z
            FROM cay_xanh c WHERE c.ma_cay = i.ma_cay FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted i FULL OUTER JOIN deleted d ON d.ma_cay = i.ma_cay;
END;
GO

CREATE OR ALTER PROCEDURE sp_hoan_tac_nhat_ky
    @ma_nk BIGINT
WITH EXECUTE AS OWNER          -- thêm lại cây đã xóa cần IDENTITY_INSERT (quyền ALTER)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @ma_tk INT = CAST(SESSION_CONTEXT(N'ma_tk') AS INT);
    IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE ma_tk = @ma_tk AND ma_nql IS NULL AND trang_thai = 'HoatDong')
        THROW 50401, N'Chỉ tài khoản kỹ thuật (admin) được hoàn tác thay đổi.', 1;

    DECLARE @ma_cay INT, @thao_tac VARCHAR(10), @cu NVARCHAR(MAX);
    SELECT @ma_cay = ma_cay, @thao_tac = thao_tac, @cu = gia_tri_cu FROM nhat_ky_cay WHERE ma_nk = @ma_nk;
    IF @ma_cay IS NULL THROW 50402, N'Không tìm thấy mục nhật ký.', 1;
    IF EXISTS (SELECT 1 FROM nhat_ky_cay WHERE ma_cay = @ma_cay AND ma_nk > @ma_nk)
        THROW 50403, N'Chỉ hoàn tác được thay đổi mới nhất của cây (cây đã có thay đổi sau đó).', 1;
    IF @thao_tac IN ('sua', 'xoa') AND @cu IS NULL
        THROW 50404, N'Mục nhật ký này không lưu giá trị cũ (ghi trước khi có nhật ký chi tiết), không hoàn tác được.', 1;

    BEGIN TRANSACTION;
    IF @thao_tac = 'them'
        DELETE FROM cay_xanh WHERE ma_cay = @ma_cay;
    ELSE IF @thao_tac = 'sua'
        UPDATE cay_xanh
        SET ma_loai = JSON_VALUE(@cu, '$.ma_loai'), chieu_cao = JSON_VALUE(@cu, '$.chieu_cao'),
            ban_kinh_tan = JSON_VALUE(@cu, '$.ban_kinh_tan'), dbh = JSON_VALUE(@cu, '$.dbh'),
            ngay_trong = JSON_VALUE(@cu, '$.ngay_trong'), tinh_trang = JSON_VALUE(@cu, '$.tinh_trang'),
            shape = geometry::STGeomFromText(CONCAT('POINT(', JSON_VALUE(@cu, '$.x'), ' ', JSON_VALUE(@cu, '$.y'), ' ',
                                                    ISNULL(JSON_VALUE(@cu, '$.z'), '0'), ')'), 3405)
        WHERE ma_cay = @ma_cay;
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM cay_xanh WHERE ma_cay = @ma_cay) THROW 50405, N'Cây đã tồn tại, không thêm lại được.', 1;
        SET IDENTITY_INSERT cay_xanh ON;
        INSERT INTO cay_xanh (ma_cay, ma_loai, chieu_cao, ban_kinh_tan, dbh, ngay_trong, tinh_trang, shape)
        VALUES (@ma_cay, JSON_VALUE(@cu, '$.ma_loai'), JSON_VALUE(@cu, '$.chieu_cao'), JSON_VALUE(@cu, '$.ban_kinh_tan'),
                JSON_VALUE(@cu, '$.dbh'), JSON_VALUE(@cu, '$.ngay_trong'), JSON_VALUE(@cu, '$.tinh_trang'),
                geometry::STGeomFromText(CONCAT('POINT(', JSON_VALUE(@cu, '$.x'), ' ', JSON_VALUE(@cu, '$.y'), ' ',
                                                ISNULL(JSON_VALUE(@cu, '$.z'), '0'), ')'), 3405));
        SET IDENTITY_INSERT cay_xanh OFF;
    END;
    COMMIT TRANSACTION;
    SELECT @ma_cay AS ma_cay, @thao_tac AS thao_tac_da_hoan_tac;
END;
GO
