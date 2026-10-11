-- UC07 (mục 209-212 file thảo luận): phân tích cây có nguy cơ theo VÙNG MỤC TIÊU của ISA (Tree Risk Assessment BMP).
-- Thay thế bản ở script 20. Không đổi dữ liệu; chỉ CREATE OR ALTER thủ tục. Chạy được nhiều lần.
--   Vùng ngã đổ (tầm đổ) = @he_so * H, mặc định 1,5 x H: vùng có thể đổ của ISA (tính cả trượt / nảy khi cây đổ).
--   MỨC NGUY HIỂM theo vị trí đối tượng GẦN NHẤT (tòa nhà / đoạn đường) so với 3 vùng mục tiêu ISA:
--     Cao        : trong tán (khoảng cách <= bán kính tán R)  -> bị tán / cành đập kể cả khi chỉ gãy một phần
--     Trung bình : trong 1 x H                                  -> trúng thân / tán khi cây đổ cả cây
--     Thấp       : từ 1 x H đến 1,5 x H                         -> chỉ khi cây đổ rồi trượt / nảy
--   Lấy đối tượng gần nhất vì đó là trường hợp bất lợi nhất (cây chạm được đối tượng xa thì chạm được đối tượng gần).
--   muc_do_nguy_hiem = 1 - khoảng cách gần nhất / tầm đổ (0..1): giữ để XẾP THỨ TỰ trong cùng mức (gần hơn xếp trước).
--   Chỉ cây "Suy yếu" / "Nguy hiểm" được đánh giá (cây Bình thường không gán mức nguy hiểm - mục 195).
-- Hệ số @he_so vẫn nhận 0,5 - 1,5 (tương thích API cũ); giao diện cố định 1,5 x H. Vùng Thấp chỉ có khi @he_so > 1.
-- Căn cứ: ISA Basic Tree Risk Assessment Form Instructions (vùng mục tiêu: trong tán / 1 x H / 1,5 x H); Việt Nam
-- (Nghị định 64/2010/NĐ-CP, TCVN 9257:2012) không quy định khoảng cách vùng ngã đổ -> đây là GIẢ ĐỊNH PHÂN TÍCH (mục 211).
CREATE OR ALTER PROCEDURE sp_cay_nguy_co_cong_trinh
    @ma_khu INT = NULL,       -- NULL: toàn vùng
    @he_so FLOAT = 1.5        -- vùng ngã đổ = @he_so x H (giao diện dùng 1,5)
AS
BEGIN
    SET NOCOUNT ON;
    IF @he_so IS NULL OR @he_so < 0.5 OR @he_so > 1.5
        THROW 50301, N'Hệ số tầm đổ phải trong khoảng 0,5 - 1,5.', 1;

    WITH cay AS (
        SELECT c.ma_cay, c.ma_loai, l.ten_loai, c.tinh_trang, c.ma_khu_vuc, k.ten_khu_vuc,
               CAST(c.chieu_cao AS FLOAT) AS chieu_cao, CAST(c.ban_kinh_tan AS FLOAT) AS ban_kinh_tan,
               @he_so * CAST(c.chieu_cao AS FLOAT) AS tam_do,
               c.shape.STX AS x, c.shape.STY AS y,
               geometry::Point(c.shape.STX, c.shape.STY, 3405) AS goc     -- điểm 2D tại gốc cây
        FROM cay_xanh c
        JOIN loai_cay l ON l.ma_loai = c.ma_loai
        JOIN khu_vuc k ON k.ma_khu_vuc = c.ma_khu_vuc
        WHERE (@ma_khu IS NULL OR c.ma_khu_vuc = @ma_khu)
          AND c.tinh_trang IN (N'Suy yếu', N'Nguy hiểm')     -- luôn luôn: cây Bình thường không được đánh giá
    ), ket_qua AS (
        SELECT cay.*, n.ma_toa_nha, n.ten_toa_nha, n.kc AS kc_nha, d.ma_duong, d.ten_duong, d.cap_duong, d.kc AS kc_duong,
               dn.so AS so_toa_nha, dd.so AS so_doan_duong,
               CASE WHEN ISNULL(dn.xa, -1) > ISNULL(dd.xa, -1) THEN dn.xa ELSE dd.xa END AS kc_xa_nhat
        FROM cay
        OUTER APPLY (SELECT TOP 1 t.ma_toa_nha, t.ten AS ten_toa_nha, t.shape.STDistance(cay.goc) AS kc
                     FROM toa_nha t WHERE t.shape.STDistance(cay.goc) <= cay.tam_do
                     ORDER BY t.shape.STDistance(cay.goc)) n
        OUTER APPLY (SELECT TOP 1 r.ma_duong, r.ten AS ten_duong, r.cap_duong, r.shape.STDistance(cay.goc) AS kc
                     FROM duong r WHERE r.shape.STDistance(cay.goc) <= cay.tam_do
                       AND ISNULL(r.cap_duong, '') NOT IN ('proposed', 'construction')
                     ORDER BY r.shape.STDistance(cay.goc)) d
        OUTER APPLY (SELECT COUNT(*) AS so, MAX(x.kc) AS xa FROM (SELECT t.shape.STDistance(cay.goc) AS kc
                     FROM toa_nha t WHERE t.shape.STDistance(cay.goc) <= cay.tam_do) x) dn
        OUTER APPLY (SELECT COUNT(*) AS so, MAX(x.kc) AS xa FROM (SELECT r.shape.STDistance(cay.goc) AS kc
                     FROM duong r WHERE r.shape.STDistance(cay.goc) <= cay.tam_do
                       AND ISNULL(r.cap_duong, '') NOT IN ('proposed', 'construction')) x) dd
    ), chi_so AS (
        SELECT ket_qua.*,
               CASE WHEN kc_nha IS NULL THEN kc_duong WHEN kc_duong IS NULL THEN kc_nha
                    WHEN kc_nha < kc_duong THEN kc_nha ELSE kc_duong END AS kc_gan
        FROM ket_qua
    ), xep_muc AS (
        SELECT chi_so.*,
               1 - kc_gan / NULLIF(tam_do, 0) AS nguy_hiem,
               CASE WHEN kc_gan <= ban_kinh_tan THEN 1 WHEN kc_gan <= chieu_cao THEN 2 ELSE 3 END AS hang_muc
        FROM chi_so
        WHERE kc_gan IS NOT NULL
    )
    SELECT ma_cay, ma_loai, ten_loai, tinh_trang, ma_khu_vuc, ten_khu_vuc,
           chieu_cao, ban_kinh_tan, CAST(tam_do AS DECIMAL(6, 2)) AS tam_do, x, y,
           ma_toa_nha, ten_toa_nha, CAST(kc_nha AS DECIMAL(6, 2)) AS kc_nha,
           ma_duong, ten_duong, cap_duong, CAST(kc_duong AS DECIMAL(6, 2)) AS kc_duong,
           CASE WHEN kc_nha IS NOT NULL AND kc_duong IS NOT NULL THEN N'Nhà và đường'
                WHEN kc_nha IS NOT NULL THEN N'Nhà' ELSE N'Đường' END AS anh_huong,
           CAST(nguy_hiem AS DECIMAL(4, 3)) AS muc_do_nguy_hiem,
           CASE hang_muc WHEN 1 THEN N'Cao' WHEN 2 THEN N'Trung bình' ELSE N'Thấp' END AS muc_nguy_hiem,
           CASE hang_muc WHEN 1 THEN N'Trong tán' WHEN 2 THEN N'Trong 1 × H' ELSE N'Trong 1,5 × H' END AS vung_muc_tieu,
           so_toa_nha, so_doan_duong, CAST(kc_xa_nhat AS DECIMAL(6, 2)) AS kc_xa_nhat
    FROM xep_muc
    ORDER BY hang_muc, nguy_hiem DESC, CASE WHEN kc_nha IS NOT NULL THEN 0 ELSE 1 END, ma_cay;
END;
GO
