-- Nạp dữ liệu danh mục Người quản lý (MS SQL Server)
-- LƯU Ý BÁO CÁO: họ tên, chức vụ, số điện thoại đều là dữ liệu GIẢ ĐỊNH.
-- Một người có thể quản lý nhiều khu vực (khu_vuc.ma_nql là khóa ngoại 1-N).
-- Chạy được nhiều lần: chỉ thêm người chưa có (so theo họ tên).

USE ie402_green_space;
GO

INSERT INTO nguoi_quan_ly (ten_nql, chuc_vu, so_dien_thoai)
SELECT v.ten_nql, v.chuc_vu, v.so_dien_thoai
FROM (VALUES
    (N'Nguyễn Văn An',  N'Tổ trưởng tổ cây xanh', N'0901000001'),
    (N'Trần Thị Bình',  N'Nhân viên cây xanh',    N'0901000002'),
    (N'Lê Minh Châu',   N'Nhân viên cây xanh',    N'0901000003')
) AS v (ten_nql, chuc_vu, so_dien_thoai)
WHERE NOT EXISTS (SELECT 1 FROM nguoi_quan_ly n WHERE n.ten_nql = v.ten_nql);
GO

SELECT ma_nql, ten_nql, chuc_vu, so_dien_thoai FROM nguoi_quan_ly ORDER BY ma_nql;
