-- Kiểm thử dòng 3 - 4 của Bảng Kết quả kiểm thử (Chương 4) - MS SQL Server
-- Dòng 3: tìm kiếm cây theo mã / loài.
-- Dòng 4: thêm / sửa / xóa cây của quản trị viên, kèm các ràng buộc: tự gán khu, phân quyền theo khu (R12),
--         cây ngoài vùng nghiên cứu, đăng nhập sai.
-- KHÔNG làm đổi dữ liệu: luồng thành công chạy trong transaction rồi ROLLBACK; các bước bị từ chối do trigger/thủ tục
-- tự hủy câu lệnh. Kết quả lưu trong biến bảng (không bị ROLLBACK xóa). Chỉ để lại khoảng trống mã IDENTITY.
-- Chạy: sqlcmd -S localhost\SQLEXPRESS -U sa -P <mật khẩu> -C -f 65001 -I -i 13_kiem_thu_3_4.sql

USE ie402_green_space;
GO
SET NOCOUNT ON;
DECLARE @kq TABLE (stt VARCHAR(5), buoc NVARCHAR(200), mong_doi NVARCHAR(120), thuc_te NVARCHAR(200), ket_qua NVARCHAR(10));
DECLARE @ma_tk INT, @ma_cay INT, @n INT, @kv INT, @x FLOAT, @y FLOAT, @cao_moi NUMERIC(10,2), @truoc INT;

-- ===== Dòng 3: tìm kiếm =====
SELECT @n = COUNT(*), @kv = MAX(ma_loai) FROM cay_xanh WHERE ma_cay = 14;
INSERT @kq VALUES ('3.1', N'Tìm theo mã cây = 14', N'1 cây, loài Me tây (mã 4)',
    CONCAT(@n, N' cây, mã loài ', @kv), IIF(@n = 1 AND @kv = 4, N'Đạt', N'Không đạt'));

SELECT @n = COUNT(*) FROM cay_xanh c JOIN loai_cay l ON l.ma_loai = c.ma_loai WHERE l.ten_loai LIKE N'%Me tây%';
SELECT @truoc = COUNT(*) FROM cay_xanh WHERE ma_loai = 4;
INSERT @kq VALUES ('3.2', N'Tìm theo tên loài "Me tây"', CONCAT(N'Bằng số cây mã loài 4 (', @truoc, N')'),
    CONCAT(@n, N' cây'), IIF(@n = @truoc AND @n > 0, N'Đạt', N'Không đạt'));

-- ===== Dòng 4: đăng nhập =====
BEGIN TRY
    EXEC sp_dang_nhap 'ttb', N'sai-mat-khau', @ma_tk OUTPUT;
    INSERT @kq VALUES ('4.1', N'Đăng nhập sai mật khẩu', N'Từ chối (lỗi 50201)', N'Đăng nhập được', N'Không đạt');
END TRY
BEGIN CATCH
    INSERT @kq VALUES ('4.1', N'Đăng nhập sai mật khẩu', N'Từ chối (lỗi 50201)', CONCAT(N'Lỗi ', ERROR_NUMBER()), IIF(ERROR_NUMBER() = 50201, N'Đạt', N'Không đạt'));
END CATCH;

SET @ma_tk = NULL;
EXEC sp_dang_nhap 'ttb', N'Demo@2026', @ma_tk OUTPUT;           -- tài khoản demo của người quản lý 2 (khu 2, khu 5)
INSERT @kq VALUES ('4.2', N'Đăng nhập ttb (phụ trách khu 2, 5)', N'Thành công, có phiên làm việc',
    CONCAT(N'ma_tk = ', @ma_tk, N'; SESSION_CONTEXT = ', CAST(SESSION_CONTEXT(N'ma_tk') AS INT)),
    IIF(@ma_tk IS NOT NULL AND CAST(SESSION_CONTEXT(N'ma_tk') AS INT) = @ma_tk, N'Đạt', N'Không đạt'));

-- ===== Dòng 4: luồng thành công trong khu được phân công (ROLLBACK cuối luồng) =====
SELECT @x = shape.STPointOnSurface().STX, @y = shape.STPointOnSurface().STY FROM khu_vuc WHERE ma_khu_vuc = 2;
BEGIN TRY
    BEGIN TRANSACTION;
    INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, dbh, ngay_trong, shape)
    VALUES (1, 8.5, 3.2, N'Bình thường', 18.0, '2021-03-15', geometry::Point(@x, @y, 3405));
    SET @ma_cay = SCOPE_IDENTITY();
    SELECT @kv = ma_khu_vuc FROM cay_xanh WHERE ma_cay = @ma_cay;
    INSERT @kq VALUES ('4.3', N'Thêm cây trong khu 2 (không nhập mã khu)', N'Thành công, khu tự gán = 2',
        CONCAT(N'ma_cay = ', @ma_cay, N', ma_khu_vuc = ', @kv), IIF(@kv = 2, N'Đạt', N'Không đạt'));

    UPDATE cay_xanh SET chieu_cao = 9.0 WHERE ma_cay = @ma_cay;
    SELECT @cao_moi = chieu_cao FROM cay_xanh WHERE ma_cay = @ma_cay;
    INSERT @kq VALUES ('4.4', N'Sửa chiều cao cây vừa thêm', N'Chiều cao = 9,0 m',
        CONCAT(N'chieu_cao = ', @cao_moi), IIF(@cao_moi = 9.0, N'Đạt', N'Không đạt'));

    DELETE FROM cay_xanh WHERE ma_cay = @ma_cay;
    SELECT @n = COUNT(*) FROM cay_xanh WHERE ma_cay = @ma_cay;
    INSERT @kq VALUES ('4.5', N'Xóa cây vừa thêm', N'Không còn bản ghi', CONCAT(@n, N' bản ghi'), IIF(@n = 0, N'Đạt', N'Không đạt'));
    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    INSERT @kq VALUES ('4.3-5', N'Luồng thêm/sửa/xóa trong khu 2', N'Thành công', CONCAT(N'Lỗi ', ERROR_NUMBER(), N': ', ERROR_MESSAGE()), N'Không đạt');
END CATCH;

-- ===== Dòng 4: các thao tác phải bị từ chối =====
SELECT @x = shape.STPointOnSurface().STX, @y = shape.STPointOnSurface().STY FROM khu_vuc WHERE ma_khu_vuc = 1;  -- khu 1 do người quản lý 3 phụ trách
BEGIN TRY
    INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, dbh, ngay_trong, shape)
    VALUES (1, 8.5, 3.2, N'Bình thường', 18.0, '2021-03-15', geometry::Point(@x, @y, 3405));
    INSERT @kq VALUES ('4.6', N'Thêm cây trong khu 1 (của người khác)', N'Từ chối (lỗi 50104)', N'Thêm được', N'Không đạt');
    DELETE FROM cay_xanh WHERE ma_cay = SCOPE_IDENTITY();
END TRY
BEGIN CATCH
    INSERT @kq VALUES ('4.6', N'Thêm cây trong khu 1 (của người khác)', N'Từ chối (lỗi 50104)', CONCAT(N'Lỗi ', ERROR_NUMBER()), IIF(ERROR_NUMBER() = 50104, N'Đạt', N'Không đạt'));
END CATCH;

SELECT TOP 1 @ma_cay = ma_cay, @cao_moi = chieu_cao FROM cay_xanh WHERE ma_khu_vuc = 1 ORDER BY ma_cay;
BEGIN TRY
    UPDATE cay_xanh SET chieu_cao = chieu_cao + 1 WHERE ma_cay = @ma_cay;
    INSERT @kq VALUES ('4.7', CONCAT(N'Sửa cây ', @ma_cay, N' ở khu 1 (của người khác)'), N'Từ chối (lỗi 50104)', N'Sửa được', N'Không đạt');
    UPDATE cay_xanh SET chieu_cao = @cao_moi WHERE ma_cay = @ma_cay;
END TRY
BEGIN CATCH
    INSERT @kq VALUES ('4.7', CONCAT(N'Sửa cây ', @ma_cay, N' ở khu 1 (của người khác)'), N'Từ chối (lỗi 50104)', CONCAT(N'Lỗi ', ERROR_NUMBER()), IIF(ERROR_NUMBER() = 50104, N'Đạt', N'Không đạt'));
END CATCH;

SELECT @x = shape.STEnvelope().STPointN(1).STX - 500, @y = shape.STEnvelope().STPointN(1).STY - 500 FROM khu_vuc WHERE ma_khu_vuc = 1;
BEGIN TRY
    INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, dbh, ngay_trong, shape)
    VALUES (1, 8.5, 3.2, N'Bình thường', 18.0, '2021-03-15', geometry::Point(@x, @y, 3405));
    INSERT @kq VALUES ('4.8', N'Thêm cây ngoài vùng nghiên cứu', N'Từ chối (lỗi 50102)', N'Thêm được', N'Không đạt');
    DELETE FROM cay_xanh WHERE ma_cay = SCOPE_IDENTITY();
END TRY
BEGIN CATCH
    INSERT @kq VALUES ('4.8', N'Thêm cây ngoài vùng nghiên cứu', N'Từ chối (lỗi 50102)', CONCAT(N'Lỗi ', ERROR_NUMBER()), IIF(ERROR_NUMBER() = 50102, N'Đạt', N'Không đạt'));
END CATCH;

-- ===== Kết thúc: xóa phiên, xác nhận dữ liệu không đổi =====
EXEC sp_set_session_context @key = N'ma_tk', @value = NULL;
SELECT @n = COUNT(*) FROM cay_xanh;
INSERT @kq VALUES ('4.9', N'Dữ liệu sau kiểm thử', N'Vẫn 333 cây', CONCAT(@n, N' cây'), IIF(@n = 333, N'Đạt', N'Không đạt'));

SELECT stt, buoc, mong_doi, thuc_te, ket_qua FROM @kq ORDER BY stt;
GO
