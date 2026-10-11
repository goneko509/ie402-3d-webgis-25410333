"""Sinh 25 cây GIẢ LẬP (vị trí và thuộc tính) để đủ 333 cây, xuất ra 11_bo_sung_25_cay.sql và 11_bo_sung_25_cay.json.

TOÀN BỘ 25 CÂY NÀY LÀ DỮ LIỆU GIẢ LẬP (khác 308 cây có vị trí số hóa từ ảnh vệ tinh):
  * vị trí: ngẫu nhiên (seed cố định), mỗi khu 5 cây, nằm trong khu và không nằm trên ranh giới khu,
    cách tòa nhà >= R, cách tim đường xe chạy >= 5 m, lối đi bộ/xe đạp >= 2,5 m,
    cách cây khác >= max(6 m; 0,6 x (R1 + R2));
  * cao độ Z: nội suy IDW (lũy thừa 2) từ 5 cây gần nhất đã số hóa;
  * loài, H, R: theo tỷ lệ và khoảng giá trị của script 02;
  * ngày trồng, DBH: theo quy tắc script 09 (tốc độ lớn, mức tăng DBH theo loài, mốc 06/10/2026);
  * tình trạng: Bình thường.
Chạy bằng Python của QGIS (cần GDAL/OGR):  python-qgis-ltr.bat 11_sinh_25_cay.py

CẬP NHẬT 07/10/2026: vị trí sinh ở đây chỉ là điểm khởi đầu. Sau đó người dùng đối chiếu cả 25 điểm trên ảnh vệ tinh
trong QGIS, dời 7 điểm vào tâm tán cây thật và xác nhận 18 điểm còn lại trùng tán cây (xem 12_cap_nhat_vi_tri_so_hoa.py).
"""
import datetime as dt
import json
import math
import os
import random

from osgeo import ogr

ogr.UseExceptions()
HERE = os.path.dirname(os.path.abspath(__file__))
GPKG = os.path.join(HERE, '..', 'Tree.gpkg')
SEED, PER_ZONE = 333, 5
MOC = dt.date(2026, 10, 6)
# loài: (mã, tên, tỷ lệ %, cao_min, cao_max, tan_min, tan_max, tốc độ lớn m/năm, tăng DBH cm/năm)
LOAI = [(1, 'Bàng', 30, 8, 15, 3.0, 6.0, 0.7, 1.5), (2, 'Sao đen', 25, 15, 30, 3.0, 6.0, 0.8, 1.2),
        (3, 'Lim xẹt', 25, 8, 15, 3.0, 5.0, 0.6, 1.3), (4, 'Me tây', 20, 12, 20, 6.0, 10.0, 0.6, 2.0)]
DRIVE = {'tertiary', 'tertiary_link', 'secondary', 'primary', 'residential', 'unclassified', 'road', 'service', 'track'}

rng = random.Random(SEED)
ds = ogr.Open(GPKG)
zones = sorted(((f.GetField('ma_khu_vuc'), f.GetField('ten_khu_vuc'), f.GetGeometryRef().Clone()) for f in ds.GetLayerByName('khu_vuc')))
buildings = [f.GetGeometryRef().Clone() for f in ds.GetLayerByName('buildings')]
roads = [(f.GetGeometryRef().Clone(), f.GetField('highway') in DRIVE) for f in ds.GetLayerByName('roads')]
trees = []
for f in ds.GetLayerByName('cay_xanh'):
    g = f.GetGeometryRef()
    trees.append((g.GetX(), g.GetY(), g.GetZ(), f.GetField('ban_kinh_tan')))


def near(geoms, p, d):
    return any(g.Distance(p) < d for g in geoms if g.GetEnvelope()[0] - d <= p.GetX() <= g.GetEnvelope()[1] + d
               and g.GetEnvelope()[2] - d <= p.GetY() <= g.GetEnvelope()[3] + d)


def idw_z(x, y, k=5):
    nb = sorted(trees, key=lambda t: (t[0] - x) ** 2 + (t[1] - y) ** 2)[:k]
    w = [1.0 / max((t[0] - x) ** 2 + (t[1] - y) ** 2, 1e-6) for t in nb]
    return sum(wi * t[2] for wi, t in zip(w, nb)) / sum(w)


def pick_species():
    r = rng.uniform(0, 100); acc = 0
    for l in LOAI:
        acc += l[2]
        if r < acc:
            return l
    return LOAI[-1]


new = []
for ma_kv, ten_kv, zg in zones:
    env = zg.GetEnvelope(); placed = 0; tries = 0
    boundary = zg.GetBoundary()
    while placed < PER_ZONE:
        tries += 1
        assert tries < 200000, ten_kv
        l = pick_species()
        r_cao, r_tan = rng.random(), rng.random()
        H = round(l[3] + r_cao * (l[4] - l[3]), 1)
        R = round(l[5] + (0.7 * r_cao + 0.3 * r_tan) * (l[6] - l[5]), 1)
        x, y = rng.uniform(env[0], env[1]), rng.uniform(env[2], env[3])
        p = ogr.CreateGeometryFromWkt('POINT (%f %f)' % (x, y))
        if not zg.Contains(p) or boundary.Distance(p) < 2:
            continue
        if near(buildings, p, R):
            continue
        if near([g for g, drive in roads if drive], p, 5.0) or near([g for g, drive in roads if not drive], p, 2.5):
            continue
        others = [(t[0], t[1], t[3]) for t in trees] + [(n['x'], n['y'], n['R']) for n in new]
        if any(math.hypot(ox - x, oy - y) < max(6.0, 0.6 * (R + orr)) for ox, oy, orr in others):
            continue
        tuoi = max(3.0, H / l[7] * rng.uniform(0.85, 1.15))
        nam = MOC.year - int(round(tuoi))
        ngay = dt.date(nam, rng.randint(5, 9), rng.randint(1, 28))
        tuoi_chinh_xac = (MOC - ngay).days / 365.25
        dbh = round(tuoi_chinh_xac * l[8] * rng.uniform(0.9, 1.1), 1)
        new.append({'ma_khu_vuc_du_kien': ma_kv, 'khu': ten_kv, 'ma_loai': l[0], 'loai': l[1], 'x': round(x, 6), 'y': round(y, 6),
                    'z': round(idw_z(x, y), 6), 'H': H, 'R': R, 'dbh': dbh, 'ngay_trong': ngay.isoformat()})
        placed += 1

sql = ['-- Bổ sung 25 cây GIẢ LẬP (vị trí ngẫu nhiên, thuộc tính giả định) để đủ 333 cây - MS SQL Server',
       '-- Sinh bởi 11_sinh_25_cay.py (seed %d); xem quy tắc trong docstring script. Chỉ chạy MỘT lần.' % SEED,
       '-- ma_khu_vuc do trigger trg_cay_xanh_gan_khu_vuc tự gán theo vị trí; ngay_cap_nhat lấy mặc định.',
       'USE ie402_green_space;', 'GO', 'SET XACT_ABORT ON;', 'BEGIN TRANSACTION;',
       'IF (SELECT COUNT(*) FROM cay_xanh) <> 308 THROW 50301, N\'Bảng cay_xanh không còn 308 cây; script đã chạy hoặc dữ liệu đã thay đổi.\', 1;',
       'INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, tinh_trang, dbh, ngay_trong, shape) VALUES']
vals = ["(%d, %.1f, %.1f, N'Bình thường', %.1f, '%s', geometry::STGeomFromText('POINT (%.6f %.6f %.6f)', 3405))"
        % (n['ma_loai'], n['H'], n['R'], n['dbh'], n['ngay_trong'], n['x'], n['y'], n['z']) for n in new]
sql.append(',\n'.join(vals) + ';')
sql += ['COMMIT;', 'GO', '',
        'SELECT k.ten_khu_vuc, COUNT(*) AS so_cay FROM cay_xanh c JOIN khu_vuc k ON k.ma_khu_vuc = c.ma_khu_vuc GROUP BY k.ten_khu_vuc;',
        'SELECT COUNT(*) AS tong_so_cay FROM cay_xanh;', 'GO']
open(os.path.join(HERE, '11_bo_sung_25_cay.sql'), 'w', encoding='utf-8').write('\n'.join(sql) + '\n')
json.dump(new, open(os.path.join(HERE, '11_bo_sung_25_cay.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for n in new:
    print(n['khu'][:22], n['loai'], n['H'], n['R'], n['dbh'], n['ngay_trong'], round(n['z'], 1))
print(len(new), 'cây')
