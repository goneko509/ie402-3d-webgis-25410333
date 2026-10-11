-- Khôi phục dữ liệu cây mặc định (chức năng của tài khoản kỹ thuật admin, mục 189 file thảo luận).
-- Khi demo, giảng viên / thành viên khác có thể thêm, sửa, xóa cây bằng tài khoản người quản lý; admin cần đưa dữ liệu về
-- mặc định nhưng GIỮ NGUYÊN các thay đổi do chính admin (tài khoản kỹ thuật, ma_nql trống) làm.
--   1. nhat_ky_cay + trigger trg_cay_xanh_nhat_ky: ghi mọi thêm / sửa / xóa cây kèm tài khoản (SESSION_CONTEXT ma_tk).
--   2. cay_xanh_mac_dinh: bản chụp dữ liệu mặc định (chụp MỘT LẦN khi chạy script lần đầu = dữ liệu lúc đó).
--   3. sp_khoi_phuc_mac_dinh @thuc_hien: 0 = xem trước, 1 = thực hiện. Quy tắc theo NGƯỜI SỬA CUỐI:
--        a) cây KHÔNG có trong bản mặc định, do người quản lý thêm          -> xóa
--        b) cây mặc định, người sửa cuối là người quản lý, khác bản mặc định -> đưa về giá trị mặc định
--        c) cây mặc định đã bị xóa, người xóa là người quản lý              -> thêm lại (giữ mã cây cũ)
--      Cây admin thêm / sửa / xóa sau cùng: giữ nguyên. Thay đổi không qua ứng dụng (ma_tk trống): giữ nguyên.
-- Chạy được nhiều lần (không chụp lại bản mặc định nếu đã có).
SET NOCOUNT ON;
GO

IF OBJECT_ID('nhat_ky_cay') IS NULL
    CREATE TABLE nhat_ky_cay (
        ma_nk BIGINT IDENTITY(1,1) PRIMARY KEY,
        ma_cay INT NOT NULL,
        thao_tac VARCHAR(10) NOT NULL CONSTRAINT ck_nhat_ky_cay_thao_tac CHECK (thao_tac IN ('them', 'sua', 'xoa')),
        ma_tk INT NULL,                                   -- NULL: thay đổi không qua ứng dụng (quản trị CSDL trực tiếp)
        thoi_diem DATETIME2(0) NOT NULL CONSTRAINT df_nhat_ky_cay_thoi_diem DEFAULT SYSDATETIME()
    );
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_nhat_ky_cay_ma_cay' AND object_id = OBJECT_ID('nhat_ky_cay'))
    CREATE INDEX ix_nhat_ky_cay_ma_cay ON nhat_ky_cay (ma_cay, ma_nk);
GO

-- Ghi nhật ký. Bỏ qua lần kích hoạt lồng (trg_cay_xanh_gan_khu_vuc tự UPDATE lại bảng) để không ghi trùng.
CREATE OR ALTER TRIGGER trg_cay_xanh_nhat_ky
ON cay_xanh
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;
    DECLARE @ma_tk INT = CAST(SESSION_CONTEXT(N'ma_tk') AS INT);
    INSERT INTO nhat_ky_cay (ma_cay, thao_tac, ma_tk)
    SELECT COALESCE(i.ma_cay, d.ma_cay),
           CASE WHEN d.ma_cay IS NULL THEN 'them' WHEN i.ma_cay IS NULL THEN 'xoa' ELSE 'sua' END, @ma_tk
    FROM inserted i FULL OUTER JOIN deleted d ON d.ma_cay = i.ma_cay;
END;
GO

-- Kiểu cột sao nguyên từ cay_xanh (SELECT INTO) để so sánh / khôi phục không lệch độ chính xác
IF OBJECT_ID('cay_xanh_mac_dinh') IS NULL
BEGIN
    SELECT ma_cay + 0 AS ma_cay, ma_loai, ma_khu_vuc, chieu_cao, ban_kinh_tan, dbh, ngay_trong, tinh_trang, shape,
           CAST(SYSDATETIME() AS DATETIME2(0)) AS thoi_diem_chup
    INTO cay_xanh_mac_dinh FROM cay_xanh;          -- ma_cay + 0: không mang thuộc tính IDENTITY sang bản chụp
    ALTER TABLE cay_xanh_mac_dinh ALTER COLUMN ma_cay INT NOT NULL;
    ALTER TABLE cay_xanh_mac_dinh ADD CONSTRAINT pk_cay_xanh_mac_dinh PRIMARY KEY (ma_cay);
END;
GO

-- EXECUTE AS OWNER: thêm lại cây đã xóa cần SET IDENTITY_INSERT (quyền ALTER), tài khoản API trên Azure không có quyền này.
-- SESSION_CONTEXT không đổi khi giả danh, nên trigger vẫn biết tài khoản admin đang thao tác.
CREATE OR ALTER PROCEDURE sp_khoi_phuc_mac_dinh
    @thuc_hien BIT = 0
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @ma_tk INT = CAST(SESSION_CONTEXT(N'ma_tk') AS INT);
    IF @thuc_hien = 1 AND NOT EXISTS (SELECT 1 FROM tai_khoan WHERE ma_tk = @ma_tk AND ma_nql IS NULL AND trang_thai = 'HoatDong')
        THROW 50401, N'Chỉ tài khoản kỹ thuật (admin) được khôi phục dữ liệu mặc định.', 1;

    -- Thao tác cuối và thao tác thêm (nếu có) của mỗi cây, kèm loại tài khoản
    DECLARE @ds TABLE (ma_cay INT PRIMARY KEY, hanh_dong VARCHAR(20), ten_dang_nhap VARCHAR(50), thoi_diem DATETIME2(0));
    WITH cuoi AS (
        SELECT n.ma_cay, n.thao_tac, n.thoi_diem, t.ten_dang_nhap, t.ma_nql, n.ma_tk,
               ROW_NUMBER() OVER (PARTITION BY n.ma_cay ORDER BY n.ma_nk DESC) AS rn
        FROM nhat_ky_cay n LEFT JOIN tai_khoan t ON t.ma_tk = n.ma_tk
    ), them AS (
        SELECT n.ma_cay, t.ten_dang_nhap, t.ma_nql, n.thoi_diem,
               ROW_NUMBER() OVER (PARTITION BY n.ma_cay ORDER BY n.ma_nk) AS rn
        FROM nhat_ky_cay n JOIN tai_khoan t ON t.ma_tk = n.ma_tk WHERE n.thao_tac = 'them'
    )
    INSERT INTO @ds
    -- a) cây ngoài bản mặc định, do người quản lý thêm -> xóa
    SELECT c.ma_cay, 'xoa_cay_them', th.ten_dang_nhap, th.thoi_diem
    FROM cay_xanh c JOIN them th ON th.ma_cay = c.ma_cay AND th.rn = 1
    WHERE th.ma_nql IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cay_xanh_mac_dinh m WHERE m.ma_cay = c.ma_cay)
    UNION ALL
    -- b) cây mặc định bị người quản lý sửa sau cùng, khác bản mặc định -> hoàn tác
    SELECT c.ma_cay, 'hoan_tac_sua', cu.ten_dang_nhap, cu.thoi_diem
    FROM cay_xanh c JOIN cay_xanh_mac_dinh m ON m.ma_cay = c.ma_cay
    JOIN cuoi cu ON cu.ma_cay = c.ma_cay AND cu.rn = 1
    WHERE cu.ma_nql IS NOT NULL
      AND (ISNULL(c.ma_loai, -1) <> ISNULL(m.ma_loai, -1) OR ISNULL(c.chieu_cao, -1) <> ISNULL(m.chieu_cao, -1)
           OR ISNULL(c.ban_kinh_tan, -1) <> ISNULL(m.ban_kinh_tan, -1) OR ISNULL(c.dbh, -1) <> ISNULL(m.dbh, -1)
           OR ISNULL(c.ngay_trong, '19000101') <> ISNULL(m.ngay_trong, '19000101') OR ISNULL(c.tinh_trang, N'') <> ISNULL(m.tinh_trang, N'')
           OR c.shape.STEquals(m.shape) = 0)
    UNION ALL
    -- c) cây mặc định đã bị người quản lý xóa -> thêm lại
    SELECT m.ma_cay, 'phuc_hoi_cay_xoa', cu.ten_dang_nhap, cu.thoi_diem
    FROM cay_xanh_mac_dinh m JOIN cuoi cu ON cu.ma_cay = m.ma_cay AND cu.rn = 1
    WHERE cu.thao_tac = 'xoa' AND cu.ma_nql IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cay_xanh c WHERE c.ma_cay = m.ma_cay);

    IF @thuc_hien = 1 AND EXISTS (SELECT 1 FROM @ds)
    BEGIN
        BEGIN TRANSACTION;
        DELETE c FROM cay_xanh c JOIN @ds d ON d.ma_cay = c.ma_cay AND d.hanh_dong = 'xoa_cay_them';
        UPDATE c SET ma_loai = m.ma_loai, chieu_cao = m.chieu_cao, ban_kinh_tan = m.ban_kinh_tan, dbh = m.dbh,
                     ngay_trong = m.ngay_trong, tinh_trang = m.tinh_trang, shape = m.shape
        FROM cay_xanh c JOIN cay_xanh_mac_dinh m ON m.ma_cay = c.ma_cay JOIN @ds d ON d.ma_cay = c.ma_cay AND d.hanh_dong = 'hoan_tac_sua';
        IF EXISTS (SELECT 1 FROM @ds WHERE hanh_dong = 'phuc_hoi_cay_xoa')
        BEGIN
            SET IDENTITY_INSERT cay_xanh ON;
            INSERT INTO cay_xanh (ma_cay, ma_loai, chieu_cao, ban_kinh_tan, dbh, ngay_trong, tinh_trang, shape)
            SELECT m.ma_cay, m.ma_loai, m.chieu_cao, m.ban_kinh_tan, m.dbh, m.ngay_trong, m.tinh_trang, m.shape
            FROM cay_xanh_mac_dinh m JOIN @ds d ON d.ma_cay = m.ma_cay AND d.hanh_dong = 'phuc_hoi_cay_xoa';
            SET IDENTITY_INSERT cay_xanh OFF;
        END;
        COMMIT TRANSACTION;
    END;

    SELECT d.ma_cay, d.hanh_dong, d.ten_dang_nhap, d.thoi_diem
    FROM @ds d ORDER BY d.hanh_dong, d.ma_cay;
END;
GO
