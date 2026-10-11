-- UC05 (mục 218-219 file thảo luận): gốc cây KHÔNG được nằm trong nền (footprint) tòa nhà.
-- Kiểm tra khi THÊM cây hoặc ĐỔI VỊ TRÍ (UPDATE cột shape); sửa thuộc tính khác không kiểm tra. Khoảng đệm 0 m: tán cây che
-- lấn mái nhà là bình thường, chỉ cấm gốc cây nằm trong nền nhà. Áp dụng cho mọi đường ghi (giao diện Thêm / Nhân bản /
-- Dời vị trí, API trực tiếp, hoàn tác / khôi phục). Kiểm tra trước khi tạo (08/10/2026): 0 / 333 cây vi phạm.
-- Lỗi 50103 (API ánh xạ 422). Trigger ném lỗi -> cả câu lệnh (kể cả nhật ký do trigger khác ghi) bị hoàn tác.
-- Đường giao thông KHÔNG kiểm tra: dữ liệu OSM là đường tim, không có bề rộng mặt đường.
-- Không đổi dữ liệu; chạy được nhiều lần.
CREATE OR ALTER TRIGGER trg_cay_xanh_ngoai_toa_nha
ON cay_xanh
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(shape) RETURN;                 -- INSERT: mọi cột coi như được cập nhật; UPDATE: chỉ khi đổi vị trí
    DECLARE @ma_cay INT, @toa_nha NVARCHAR(300);
    SELECT TOP 1 @ma_cay = i.ma_cay,
           @toa_nha = COALESCE(NULLIF(t.ten, N''), N'#' + CAST(t.ma_toa_nha AS NVARCHAR(20)))
    FROM inserted i
    JOIN toa_nha t ON t.shape.STIntersects(geometry::Point(i.shape.STX, i.shape.STY, 3405)) = 1;   -- chỉ mục six_toa_nha
    IF @ma_cay IS NOT NULL
    BEGIN
        DECLARE @tb NVARCHAR(2048) = CONCAT(N'Vị trí cây nằm trong tòa nhà ', @toa_nha, N'.');
        THROW 50103, @tb, 1;
    END
END;
GO
