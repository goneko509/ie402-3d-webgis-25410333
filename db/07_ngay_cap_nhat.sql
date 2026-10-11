-- Thêm cột kỹ thuật ngay_cap_nhat cho bảng cay_xanh (MS SQL Server)
-- Đây là siêu dữ liệu của BẢN GHI (dấu vết cập nhật), KHÔNG phải thuộc tính thời gian
-- của thực thể cây (mục 97 - 99 file thảo luận); không đưa vào ERD.
-- ngay_cap_nhat: thời điểm bản ghi được thêm hoặc sửa lần gần nhất, do trigger
-- trg_cay_xanh_gan_khu_vuc (script 06) tự ghi; người dùng không cần nhập.
-- 308 cây hiện có lấy ngày tạo bộ dữ liệu giả định 06/10/2026.
-- Chạy được nhiều lần. Sau script này, chạy lại 06_trigger_gan_khu_vuc.sql.

USE ie402_green_space;
GO

IF COL_LENGTH('cay_xanh', 'ngay_cap_nhat') IS NULL
BEGIN
    ALTER TABLE cay_xanh ADD ngay_cap_nhat DATETIME2(0) NULL;
END;
GO

UPDATE cay_xanh SET ngay_cap_nhat = '2026-10-06T00:00:00' WHERE ngay_cap_nhat IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.default_constraints
               WHERE parent_object_id = OBJECT_ID('cay_xanh')
                 AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('cay_xanh'), 'ngay_cap_nhat', 'ColumnId'))
    ALTER TABLE cay_xanh ADD CONSTRAINT df_cay_xanh_ngay_cap_nhat DEFAULT SYSDATETIME() FOR ngay_cap_nhat;
GO

ALTER TABLE cay_xanh ALTER COLUMN ngay_cap_nhat DATETIME2(0) NOT NULL;
GO

SELECT COUNT(*) AS so_cay, MIN(ngay_cap_nhat) AS som_nhat, MAX(ngay_cap_nhat) AS muon_nhat FROM cay_xanh;
