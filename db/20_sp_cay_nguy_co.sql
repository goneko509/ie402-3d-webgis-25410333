-- UC07: phân tích cây có nguy cơ ảnh hưởng công trình (mục 185 file thảo luận).
-- Tầm đổ của cây = @he_so * H (m): cây đổ có thể chạm mọi thứ trong bán kính này quanh gốc.
-- Cây có nguy cơ: CHỈ cây tình trạng "Suy yếu" / "Nguy hiểm" (mục 195: cây "Bình thường" không được gán mức độ nguy hiểm,
-- dù có công trình trong tầm đổ - tránh nhãn "nguy hiểm" sai bản chất cho cây khỏe) VÀ có tòa nhà hoặc đoạn đường
-- trong tầm đổ. Với mỗi cây trả về tòa nhà gần nhất và đoạn đường gần nhất trong tầm đổ (STDistance, chỉ mục không gian
-- six_toa_nha / six_duong). Đường: mọi cấp OSM trừ 'proposed', 'construction' (chưa tồn tại).
-- MỨC ĐỘ NGUY HIỂM (mục 194) = 1 - (khoảng cách tới đối tượng GẦN NHẤT / tầm đổ), trong [0, 1], càng gần 1 càng nguy hiểm.
--   Theo đối tượng gần nhất vì: cây không chạm được đối tượng gần nhất thì không chạm được đối tượng xa hơn; đối tượng gần
--   bị trúng cả khi cây đổ một phần / gãy cành -> lấy gần nhất là đánh giá bất lợi nhất (không đánh giá thấp rủi ro).
--   Nhãn: Cao >= 0,7 (đối tượng nằm trong 30 % đầu tầm đổ); Trung bình 0,4 - 0,7; Thấp < 0,4.
-- Phạm vi ảnh hưởng (thông tin bổ sung, không dùng xếp hạng): số tòa nhà, số đoạn đường trong tầm đổ và khoảng cách
--   tới đối tượng xa nhất trong tầm đổ.
-- Sắp xếp: mức độ nguy hiểm giảm dần; bằng nhau thì cây ảnh hưởng nhà xếp trước.
-- Chạy được nhiều lần.
CREATE OR ALTER PROCEDURE sp_cay_nguy_co_cong_trinh
    @ma_khu INT = NULL,       -- NULL: toàn vùng
    @he_so FLOAT = 1.0        -- hệ số tầm đổ k (0,5 - 1,5)
AS
BEGIN
    SET NOCOUNT ON;
    IF @he_so IS NULL OR @he_so < 0.5 OR @he_so > 1.5
        THROW 50301, N'Hệ số tầm đổ phải trong khoảng 0,5 - 1,5.', 1;

    WITH cay AS (
        SELECT c.ma_cay, c.ma_loai, l.ten_loai, c.tinh_trang, c.ma_khu_vuc, k.ten_khu_vuc,
               CAST(c.chieu_cao AS FLOAT) AS chieu_cao, @he_so * CAST(c.chieu_cao AS FLOAT) AS tam_do,
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
        -- Tính khoảng cách trong bảng con rồi mới gộp (SQL Server không cho MAX trên biểu thức có tham chiếu ra ngoài)
        OUTER APPLY (SELECT COUNT(*) AS so, MAX(x.kc) AS xa FROM (SELECT t.shape.STDistance(cay.goc) AS kc
                     FROM toa_nha t WHERE t.shape.STDistance(cay.goc) <= cay.tam_do) x) dn
        OUTER APPLY (SELECT COUNT(*) AS so, MAX(x.kc) AS xa FROM (SELECT r.shape.STDistance(cay.goc) AS kc
                     FROM duong r WHERE r.shape.STDistance(cay.goc) <= cay.tam_do
                       AND ISNULL(r.cap_duong, '') NOT IN ('proposed', 'construction')) x) dd
    ), chi_so AS (
        SELECT ket_qua.*,
               CASE WHEN kc_nha IS NULL THEN kc_duong WHEN kc_duong IS NULL THEN kc_nha
                    WHEN kc_nha < kc_duong THEN kc_nha ELSE kc_duong END AS kc_gan,
               1 - (CASE WHEN kc_nha IS NULL THEN kc_duong WHEN kc_duong IS NULL THEN kc_nha
                         WHEN kc_nha < kc_duong THEN kc_nha ELSE kc_duong END) / NULLIF(tam_do, 0) AS nguy_hiem
        FROM ket_qua
    )
    SELECT ma_cay, ma_loai, ten_loai, tinh_trang, ma_khu_vuc, ten_khu_vuc,
           chieu_cao, CAST(tam_do AS DECIMAL(6, 2)) AS tam_do, x, y,
           ma_toa_nha, ten_toa_nha, CAST(kc_nha AS DECIMAL(6, 2)) AS kc_nha,
           ma_duong, ten_duong, cap_duong, CAST(kc_duong AS DECIMAL(6, 2)) AS kc_duong,
           CASE WHEN kc_nha IS NOT NULL AND kc_duong IS NOT NULL THEN N'Nhà và đường'
                WHEN kc_nha IS NOT NULL THEN N'Nhà' ELSE N'Đường' END AS anh_huong,
           CAST(nguy_hiem AS DECIMAL(4, 3)) AS muc_do_nguy_hiem,
           CASE WHEN nguy_hiem >= 0.7 THEN N'Cao' WHEN nguy_hiem >= 0.4 THEN N'Trung bình' ELSE N'Thấp' END AS muc_nguy_hiem,
           so_toa_nha, so_doan_duong, CAST(kc_xa_nhat AS DECIMAL(6, 2)) AS kc_xa_nhat
    FROM chi_so
    WHERE kc_nha IS NOT NULL OR kc_duong IS NOT NULL
    ORDER BY nguy_hiem DESC, CASE WHEN kc_nha IS NOT NULL THEN 0 ELSE 1 END, ma_cay;
END;
GO
