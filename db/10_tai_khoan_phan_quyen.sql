-- Tài khoản quản trị viên, phân quyền theo khu vực, tên khoa học và miền giá trị tình trạng (MS SQL Server)
-- Căn cứ: Nghị định 258/2025/NĐ-CP (mục 112 file thảo luận; số Điều cần đối chiếu văn bản gốc):
--   * Dữ liệu cây xanh ghi tên khoa học (Điều 26)            -> loai_cay.ten_khoa_hoc
--   * Cây có nguy cơ gây nguy hiểm, cây suy yếu (Điều 3, 22) -> miền giá trị cay_xanh.tinh_trang
--   * Đơn vị được giao quản lý lập hồ sơ, theo dõi cây (Điều 23, 32) -> quản trị viên = cán bộ phụ trách khu,
--     chỉ được thêm/sửa/xóa cây trong khu mình phụ trách (R12)
-- Tài khoản, mật khẩu demo là DỮ LIỆU GIẢ ĐỊNH; mật khẩu chỉ lưu dạng băm SHA2_512 kèm salt ngẫu nhiên
-- (môi trường thật nên băm ở tầng ứng dụng bằng thuật toán chuyên cho mật khẩu như bcrypt/PBKDF2).
-- Chạy được nhiều lần.

USE ie402_green_space;
GO
SET QUOTED_IDENTIFIER ON;   -- bắt buộc cho chỉ mục có điều kiện (filtered index)
SET ANSI_NULLS ON;
GO

-- ===== 1. Tên khoa học của loài (nguồn: Wikipedia, mục 98) =====
IF COL_LENGTH('loai_cay', 'ten_khoa_hoc') IS NULL
    ALTER TABLE loai_cay ADD ten_khoa_hoc NVARCHAR(200) NULL;
GO
UPDATE l SET l.ten_khoa_hoc = v.tkh
FROM loai_cay l
JOIN (VALUES (N'Bàng', N'Terminalia catappa'), (N'Sao đen', N'Hopea odorata'),
             (N'Lim xẹt', N'Peltophorum pterocarpum'), (N'Me tây', N'Albizia saman (đồng danh Samanea saman)')
     ) AS v (ten_loai, tkh) ON v.ten_loai = l.ten_loai;
GO

-- ===== 2. Miền giá trị tình trạng cây =====
IF OBJECT_ID('ck_cay_xanh_tinh_trang') IS NULL
    ALTER TABLE cay_xanh ADD CONSTRAINT ck_cay_xanh_tinh_trang
        CHECK (tinh_trang IN (N'Bình thường', N'Suy yếu', N'Nguy hiểm'));
GO

-- ===== 3. Bảng tài khoản quản trị viên =====
IF OBJECT_ID('tai_khoan') IS NULL
BEGIN
    CREATE TABLE tai_khoan (
        ma_tk INT IDENTITY(1,1) PRIMARY KEY,
        ten_dang_nhap VARCHAR(50) NOT NULL CONSTRAINT uq_tai_khoan_ten UNIQUE,
        mat_khau_hash VARBINARY(64) NOT NULL,          -- SHA2_512(salt + mật khẩu)
        salt VARBINARY(16) NOT NULL,
        vai_tro VARCHAR(20) NOT NULL CONSTRAINT ck_tai_khoan_vai_tro CHECK (vai_tro IN ('QuanTri')),
        trang_thai VARCHAR(20) NOT NULL CONSTRAINT df_tai_khoan_trang_thai DEFAULT 'HoatDong'
            CONSTRAINT ck_tai_khoan_trang_thai CHECK (trang_thai IN ('HoatDong', 'Khoa')),
        ma_nql INT NULL CONSTRAINT fk_tai_khoan_nql REFERENCES nguoi_quan_ly(ma_nql)
    );
END;
GO
-- mỗi người quản lý có tối đa một tài khoản; tài khoản kỹ thuật để ma_nql trống
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_tai_khoan_ma_nql' AND object_id = OBJECT_ID('tai_khoan'))
    CREATE UNIQUE INDEX uq_tai_khoan_ma_nql ON tai_khoan(ma_nql) WHERE ma_nql IS NOT NULL;
GO

CREATE OR ALTER PROCEDURE sp_tao_tai_khoan @ten VARCHAR(50), @mat_khau NVARCHAR(100), @ma_nql INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM tai_khoan WHERE ten_dang_nhap = @ten) RETURN;
    DECLARE @salt VARBINARY(16) = CRYPT_GEN_RANDOM(16);
    INSERT INTO tai_khoan (ten_dang_nhap, mat_khau_hash, salt, vai_tro, ma_nql)
    VALUES (@ten, HASHBYTES('SHA2_512', @salt + CAST(@mat_khau AS VARBINARY(200))), @salt, 'QuanTri', @ma_nql);
END;
GO

-- Đăng nhập: trả về ma_tk nếu đúng và tài khoản đang hoạt động; ghi ma_tk vào SESSION_CONTEXT
-- để trigger phân quyền biết người đang thao tác (ứng dụng gọi thủ tục này sau khi mở kết nối).
CREATE OR ALTER PROCEDURE sp_dang_nhap @ten VARCHAR(50), @mat_khau NVARCHAR(100), @ma_tk INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT @ma_tk = ma_tk FROM tai_khoan
    WHERE ten_dang_nhap = @ten AND trang_thai = 'HoatDong'
      AND mat_khau_hash = HASHBYTES('SHA2_512', salt + CAST(@mat_khau AS VARBINARY(200)));
    IF @ma_tk IS NULL
        THROW 50201, N'Sai tên đăng nhập, mật khẩu hoặc tài khoản đã bị khóa.', 1;
    EXEC sp_set_session_context @key = N'ma_tk', @value = @ma_tk;
END;
GO

-- Tài khoản demo (giả định): mỗi người quản lý một tài khoản + một tài khoản kỹ thuật
EXEC sp_tao_tai_khoan 'nva', N'Demo@2026', 1;
EXEC sp_tao_tai_khoan 'ttb', N'Demo@2026', 2;
EXEC sp_tao_tai_khoan 'lmc', N'Demo@2026', 3;
EXEC sp_tao_tai_khoan 'admin', N'Demo@2026', NULL;
GO

-- ===== 4. Phân quyền theo khu: quản trị viên chỉ thêm/sửa/xóa cây trong khu mình phụ trách (R12) =====
-- Chỉ áp dụng khi có phiên đăng nhập ứng dụng (SESSION_CONTEXT ma_tk); tài khoản kỹ thuật (ma_nql trống)
-- không bị giới hạn; truy cập quản trị CSDL trực tiếp (không qua sp_dang_nhap) không chịu ràng buộc này.
CREATE OR ALTER TRIGGER trg_cay_xanh_phan_quyen
ON cay_xanh
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ma_tk INT = CAST(SESSION_CONTEXT(N'ma_tk') AS INT);
    IF @ma_tk IS NULL RETURN;
    DECLARE @ma_nql INT = (SELECT ma_nql FROM tai_khoan WHERE ma_tk = @ma_tk);
    IF @ma_nql IS NULL RETURN;
    IF EXISTS (SELECT 1 FROM cay_xanh c JOIN inserted i ON i.ma_cay = c.ma_cay
               JOIN khu_vuc k ON k.ma_khu_vuc = c.ma_khu_vuc WHERE k.ma_nql <> @ma_nql)
       OR EXISTS (SELECT 1 FROM deleted d JOIN khu_vuc k ON k.ma_khu_vuc = d.ma_khu_vuc WHERE k.ma_nql <> @ma_nql)
        THROW 50104, N'Quản trị viên chỉ được thêm, sửa, xóa cây trong khu vực mình phụ trách.', 1;
END;
GO
-- chạy sau trigger gán khu vực để kiểm tra trên ma_khu_vuc đã được gán
EXEC sp_settriggerorder @triggername = 'trg_cay_xanh_phan_quyen', @order = 'Last', @stmttype = 'INSERT';
EXEC sp_settriggerorder @triggername = 'trg_cay_xanh_phan_quyen', @order = 'Last', @stmttype = 'UPDATE';
GO

SELECT ten_loai, ten_khoa_hoc FROM loai_cay ORDER BY ma_loai;
SELECT t.ma_tk, t.ten_dang_nhap, t.vai_tro, t.trang_thai, t.ma_nql, n.ten_nql,
       LEN(t.mat_khau_hash) AS do_dai_hash
FROM tai_khoan t LEFT JOIN nguoi_quan_ly n ON n.ma_nql = t.ma_nql ORDER BY t.ma_tk;
