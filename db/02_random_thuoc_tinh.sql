-- Sinh ngẫu nhiên thuộc tính cho bảng cay_xanh (MS SQL Server)
-- Gán: ma_loai (loại cây), chieu_cao (m), ban_kinh_tan (m)
-- LƯU Ý BÁO CÁO: đây là dữ liệu GIẢ ĐỊNH, sinh ngẫu nhiên trong khoảng
-- tham khảo theo từng loài, không phải số đo thực địa.
--
-- Trong SQL Server, RAND() chỉ được tính MỘT lần cho cả câu lệnh, nên phải
-- dùng CHECKSUM(NEWID()) để mỗi dòng có một số ngẫu nhiên riêng.
-- Mỗi lần chạy cho kết quả khác nhau, nên chỉ chạy một lần rồi giữ nguyên.

USE ie402_green_space;
GO

-- ==========================================
-- 1. Khoảng giá trị tham khảo theo loài
-- ==========================================
-- ty_le: tỷ lệ phần trăm số cây của loài (tổng = 100)
DECLARE @khoang TABLE (
    ten_loai NVARCHAR(100),
    ty_le INT,
    cao_min FLOAT, cao_max FLOAT,
    tan_min FLOAT, tan_max FLOAT
);
INSERT INTO @khoang VALUES
(N'Bàng',    30,  8, 15, 3.0,  6.0),   -- tán rộng phân tầng
(N'Sao đen', 25, 15, 30, 3.0,  6.0),   -- thân cao, tán hình tháp hẹp
(N'Lim xẹt', 25,  8, 15, 3.0,  5.0),
(N'Me tây',  20, 12, 20, 6.0, 10.0);   -- tán dù rất rộng

-- ==========================================
-- 2. Mỗi cây nhận 3 số ngẫu nhiên trong [0, 1]
-- ==========================================
DROP TABLE IF EXISTS #rnd;
SELECT
    ma_cay,
    ABS(CHECKSUM(NEWID())) % 100 AS r_loai,             -- 0..99, chọn loài
    ABS(CHECKSUM(NEWID())) % 10001 / 10000.0 AS r_cao,  -- độ lớn của cây
    ABS(CHECKSUM(NEWID())) % 10001 / 10000.0 AS r_tan   -- nhiễu riêng cho tán
INTO #rnd
FROM cay_xanh;

-- ==========================================
-- 3. Cập nhật loại cây theo tỷ lệ phần trăm
-- ==========================================
-- Cộng dồn tỷ lệ: Bàng 0-29, Sao đen 30-54, Lim xẹt 55-79, Me tây 80-99
;WITH k AS (
    SELECT l.ma_loai, k.*,
           SUM(k.ty_le) OVER (ORDER BY l.ma_loai) - k.ty_le AS tu,
           SUM(k.ty_le) OVER (ORDER BY l.ma_loai) AS den
    FROM @khoang k
    JOIN loai_cay l ON l.ten_loai = k.ten_loai
)
UPDATE c
SET c.ma_loai = k.ma_loai
FROM cay_xanh c
JOIN #rnd r ON r.ma_cay = c.ma_cay
JOIN k ON r.r_loai >= k.tu AND r.r_loai < k.den;

-- ==========================================
-- 4. Cập nhật chiều cao và bán kính tán theo loài
-- ==========================================
-- Bán kính tán lấy 70% theo độ lớn của cây và 30% nhiễu ngẫu nhiên,
-- để cây cao thường có tán lớn hơn, nhưng không tuyệt đối.
UPDATE c
SET c.chieu_cao    = ROUND(k.cao_min + r.r_cao * (k.cao_max - k.cao_min), 1),
    c.ban_kinh_tan = ROUND(k.tan_min + (0.7 * r.r_cao + 0.3 * r.r_tan)
                                       * (k.tan_max - k.tan_min), 1)
FROM cay_xanh c
JOIN #rnd r ON r.ma_cay = c.ma_cay
JOIN loai_cay l ON l.ma_loai = c.ma_loai
JOIN @khoang k ON k.ten_loai = l.ten_loai;

DROP TABLE #rnd;
GO

-- ==========================================
-- 5. Kiểm tra kết quả
-- ==========================================
SELECT l.ten_loai,
       COUNT(*) AS so_cay,
       MIN(c.chieu_cao) AS cao_min, MAX(c.chieu_cao) AS cao_max,
       CAST(AVG(c.chieu_cao) AS DECIMAL(5,1)) AS cao_tb,
       MIN(c.ban_kinh_tan) AS tan_min, MAX(c.ban_kinh_tan) AS tan_max,
       CAST(AVG(c.ban_kinh_tan) AS DECIMAL(5,1)) AS tan_tb
FROM cay_xanh c
JOIN loai_cay l ON l.ma_loai = c.ma_loai
GROUP BY l.ten_loai
ORDER BY so_cay DESC;

SELECT COUNT(*) AS cay_thieu_thuoc_tinh
FROM cay_xanh
WHERE ma_loai IS NULL OR chieu_cao IS NULL OR ban_kinh_tan IS NULL;
