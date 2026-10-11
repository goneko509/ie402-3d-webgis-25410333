-- Thuộc tính thời gian (chu kỳ năm) của LOAI_CAY (MS SQL Server)
-- thoidiem_rungla: thời điểm/mùa rụng lá; thoidiem_rahoa: thời điểm/mùa ra hoa.
-- Đây là đặc trưng của loài theo thời gian (thời gian chu kỳ), không phải thời điểm nhập dữ liệu.
-- Nguồn (truy cập 06/10/2026):
--   Bàng: vi.wikipedia.org/wiki/Bàng ("lá sớm rụng về mùa khô", "hoa nở vào mùa hè");
--         en.wikipedia.org/wiki/Terminalia_catappa ("They fall during the dry season").
--   Sao đen: vi.wikipedia.org/wiki/Sao_đen ("lá xanh bốn mùa"); Wikipedia không nêu mùa hoa.
--   Lim xẹt: en.wikipedia.org/wiki/Peltophorum_pterocarpum ("deciduous tree",
--            "masses of golden flowers in the summer"); không nêu thời điểm rụng lá.
--   Me tây (còng): en.wikipedia.org/wiki/Albizia_saman ("sheds its leaves for a while during
--            dry periods"); Wikipedia không nêu mùa hoa.
-- Ô Wikipedia không nêu để NULL (chưa có nguồn), không tự điền.
-- Chạy được nhiều lần.

USE ie402_green_space;
GO

IF COL_LENGTH('loai_cay', 'thoidiem_rungla') IS NULL
    ALTER TABLE loai_cay ADD thoidiem_rungla NVARCHAR(200) NULL;
IF COL_LENGTH('loai_cay', 'thoidiem_rahoa') IS NULL
    ALTER TABLE loai_cay ADD thoidiem_rahoa NVARCHAR(200) NULL;
GO

UPDATE l SET l.thoidiem_rungla = v.rungla, l.thoidiem_rahoa = v.rahoa
FROM loai_cay l
JOIN (VALUES
    (N'Bàng',    N'Mùa khô (lá chuyển đỏ hồng hoặc nâu vàng trước khi rụng)', N'Mùa hè'),
    (N'Sao đen', N'Không rụng lá theo mùa (lá xanh bốn mùa)',                  NULL),
    (N'Lim xẹt', N'Rụng lá theo mùa (nguồn không nêu thời điểm)',             N'Mùa hè'),
    (N'Me tây',  N'Một thời gian trong mùa khô',                              NULL)
) AS v (ten_loai, rungla, rahoa) ON v.ten_loai = l.ten_loai;
GO

SELECT ma_loai, ten_loai, thoidiem_rungla, thoidiem_rahoa FROM loai_cay ORDER BY ma_loai;
