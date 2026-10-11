-- Giả lập tình trạng "Nguy hiểm" (DỮ LIỆU GIẢ ĐỊNH, chỉ minh họa; mục 196 file thảo luận). Chạy sau script 19, 20, 21.
-- Quy tắc (sinh dữ liệu MỘT LẦN, không phải quy tắc tự động của hệ thống):
--   cây "Suy yếu" có MỨC ĐỘ NGUY HIỂM "Cao" (>= 0,7) theo sp_cay_nguy_co_cong_trinh với tầm đổ k = 1 (công trình nằm trong
--   30 % đầu tầm đổ) -> "Nguy hiểm". Tinh thần đánh giá rủi ro cây đô thị (ISA TRAQ): khả năng gãy đổ x khả năng trúng
--   công trình; NĐ 258/2025: cây có nguy cơ gây nguy hiểm.
-- KHÔNG tự cập nhật sau mỗi lần phân tích: tình trạng là DỮ LIỆU ĐẦU VÀO của phân tích; tự ghi ngược kết quả vào tình trạng
-- sẽ thành vòng lặp (vd. phá một tòa nhà thì cây "hết nguy hiểm"), khó kiểm soát và ghi đè dữ liệu.
-- Cập nhật cả bản mặc định (cay_xanh_mac_dinh) cho đúng các cây này để "Khôi phục DL mặc định" không đưa chúng về Suy yếu.
-- Nhật ký ghi các thay đổi này với ma_tk trống ("CSDL trực tiếp"). Chạy lại: không đổi gì thêm (cây đã Nguy hiểm thì giữ).
-- Hoàn nguyên: UPDATE cay_xanh SET tinh_trang = N'Suy yếu' WHERE tinh_trang = N'Nguy hiểm'; (và cùng lệnh cho cay_xanh_mac_dinh)
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @kq TABLE (ma_cay INT, ma_loai INT, ten_loai NVARCHAR(100), tinh_trang NVARCHAR(50), ma_khu_vuc INT, ten_khu_vuc NVARCHAR(200),
                   chieu_cao FLOAT, tam_do DECIMAL(6, 2), x FLOAT, y FLOAT, ma_toa_nha INT, ten_toa_nha NVARCHAR(300), kc_nha DECIMAL(6, 2),
                   ma_duong INT, ten_duong NVARCHAR(300), cap_duong VARCHAR(50), kc_duong DECIMAL(6, 2), anh_huong NVARCHAR(50),
                   muc_do_nguy_hiem DECIMAL(4, 3), muc_nguy_hiem NVARCHAR(20), so_toa_nha INT, so_doan_duong INT, kc_xa_nhat DECIMAL(6, 2));
INSERT INTO @kq EXEC sp_cay_nguy_co_cong_trinh @ma_khu = NULL, @he_so = 1.0;

BEGIN TRANSACTION;
UPDATE c SET tinh_trang = N'Nguy hiểm'
FROM cay_xanh c JOIN @kq k ON k.ma_cay = c.ma_cay
WHERE k.muc_nguy_hiem = N'Cao' AND c.tinh_trang = N'Suy yếu';

UPDATE m SET tinh_trang = N'Nguy hiểm'
FROM cay_xanh_mac_dinh m JOIN @kq k ON k.ma_cay = m.ma_cay
WHERE k.muc_nguy_hiem = N'Cao' AND m.tinh_trang = N'Suy yếu';
COMMIT TRANSACTION;

-- Kết quả
SELECT k.ma_cay, k.ten_loai, k.muc_do_nguy_hiem, k.kc_nha, k.kc_duong, c.tinh_trang
FROM @kq k JOIN cay_xanh c ON c.ma_cay = k.ma_cay WHERE k.muc_nguy_hiem = N'Cao' ORDER BY k.muc_do_nguy_hiem DESC;
SELECT tinh_trang, COUNT(*) AS so_cay FROM cay_xanh GROUP BY tinh_trang;
SELECT tinh_trang, COUNT(*) AS so_cay_mac_dinh FROM cay_xanh_mac_dinh GROUP BY tinh_trang;
