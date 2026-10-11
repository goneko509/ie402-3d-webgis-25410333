-- Giả lập tình trạng cây (DỮ LIỆU GIẢ ĐỊNH, chỉ minh họa): khoảng 20 % cây "Suy yếu", "Nguy hiểm" = 0.
-- Điểm suy yếu dựa trên thuộc tính đã có của cây (chỉ số lâm học thường dùng):
--   * Độ thon thân H/D = chieu_cao (m) / (dbh (cm) / 100): thân cao mà mảnh -> kém ổn định (H/D > ~80 thường coi là rủi ro)
--   * Tỷ lệ tán = 2R / H: tán nhỏ so với chiều cao -> sinh trưởng kém
--   Hạng tính TRONG TỪNG LOÀI (so với cây cùng loài): mỗi loài có dáng riêng (Sao đen vốn cao, thon, tán hẹp),
--   xếp hạng chung sẽ dồn gần hết "Suy yếu" vào Sao đen.
--   diem = 0,45 * hạng(H/D) + 0,35 * (1 - hạng(2R/H)) + 0,20 * nhiễu; nhiễu tính bằng băm MD5 của mã cây nên
--   CỐ ĐỊNH (chạy lại cho cùng kết quả). 20 % cây điểm cao nhất -> "Suy yếu", còn lại -> "Bình thường".
-- Trigger trg_cay_xanh_gan_khu_vuc cập nhật ngay_cap_nhat của các dòng bị sửa (không đổi khu, không đổi hình học).
-- Hoàn nguyên (trước script này cả 333 cây đều "Bình thường"): UPDATE cay_xanh SET tinh_trang = N'Bình thường';
-- Chạy được nhiều lần (kết quả như nhau với cùng dữ liệu H, R, DBH).
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

WITH chi_so AS (
    SELECT ma_cay, ma_loai,
           CAST(chieu_cao AS FLOAT) / (CAST(dbh AS FLOAT) / 100) AS do_thon,
           2 * CAST(ban_kinh_tan AS FLOAT) / CAST(chieu_cao AS FLOAT) AS ty_le_tan,
           (ABS(CAST(CAST(HASHBYTES('MD5', CONCAT('IE402-tinh-trang-', ma_cay)) AS BINARY(4)) AS INT)) % 10000) / 10000.0 AS nhieu
    FROM cay_xanh
), diem AS (
    SELECT ma_cay,
           0.45 * PERCENT_RANK() OVER (PARTITION BY ma_loai ORDER BY do_thon)
         + 0.35 * (1 - PERCENT_RANK() OVER (PARTITION BY ma_loai ORDER BY ty_le_tan))
         + 0.20 * nhieu AS diem_suy_yeu
    FROM chi_so
), xep_hang AS (
    SELECT ma_cay, ROW_NUMBER() OVER (ORDER BY diem_suy_yeu DESC, ma_cay) AS hang, COUNT(*) OVER () AS tong
    FROM diem
)
UPDATE c
SET tinh_trang = CASE WHEN x.hang <= ROUND(0.20 * x.tong, 0) THEN N'Suy yếu' ELSE N'Bình thường' END
FROM cay_xanh c JOIN xep_hang x ON x.ma_cay = c.ma_cay
WHERE c.tinh_trang <> CASE WHEN x.hang <= ROUND(0.20 * x.tong, 0) THEN N'Suy yếu' ELSE N'Bình thường' END;

COMMIT TRANSACTION;

-- Kết quả: tỷ lệ theo tình trạng, theo khu, và chỉ số trung bình hai nhóm (nhóm Suy yếu phải thon hơn, tán nhỏ hơn)
SELECT tinh_trang, COUNT(*) AS so_cay, CAST(100.0 * COUNT(*) / SUM(COUNT(*)) OVER () AS DECIMAL(5, 1)) AS phan_tram
FROM cay_xanh GROUP BY tinh_trang;
SELECT k.ten_khu_vuc, COUNT(*) AS so_cay, SUM(CASE WHEN c.tinh_trang = N'Suy yếu' THEN 1 ELSE 0 END) AS suy_yeu
FROM cay_xanh c JOIN khu_vuc k ON k.ma_khu_vuc = c.ma_khu_vuc GROUP BY k.ma_khu_vuc, k.ten_khu_vuc ORDER BY k.ma_khu_vuc;
SELECT tinh_trang,
       CAST(AVG(CAST(chieu_cao AS FLOAT) / (CAST(dbh AS FLOAT) / 100)) AS DECIMAL(6, 1)) AS do_thon_tb,
       CAST(AVG(2 * CAST(ban_kinh_tan AS FLOAT) / CAST(chieu_cao AS FLOAT)) AS DECIMAL(5, 2)) AS ty_le_tan_tb
FROM cay_xanh GROUP BY tinh_trang;
