"""Hoàn tất số hóa 25 cây bổ sung (ma_cay 357-381) sau khi người dùng đối chiếu trên ảnh vệ tinh trong QGIS (07/10/2026).

Người dùng sửa vị trí trực tiếp trên lớp cây SQL Server (Move Feature, nền ảnh vệ tinh Google): 7 điểm được dời vào
tâm tán cây thật, 18 điểm được xác nhận đã trùng tán cây trên ảnh. Script này:
  1. đọc vị trí hiện tại của 25 cây từ 12_sau_khi_doi.txt (sqlcmd -s "|": ma_cay|ma_khu_vuc|x|y|ngay_cap_nhat);
  2. nội suy lại cao độ Z (IDW, 5 cây gần nhất trong 308 cây) cho các điểm đã dời, sinh 12_cap_nhat_z.sql;
  3. sao lưu Tree.gpkg rồi cập nhật hình học, ma_khu_vuc, ngay_cap_nhat của 25 cây trong lớp cay_xanh.
Chạy bằng Python của QGIS, sau đó chạy 12_cap_nhat_z.sql bằng sqlcmd.
"""
import json
import math
import os
import sqlite3

from osgeo import ogr

ogr.UseExceptions()
HERE = os.path.dirname(os.path.abspath(__file__))
GPKG = os.path.join(HERE, '..', 'Tree.gpkg')
BAK = os.path.join(HERE, '..', 'backup', 'Tree_20261007_truoc_cap_nhat_vi_tri_25_cay.gpkg')

old = {i + 357: o for i, o in enumerate(json.load(open(os.path.join(HERE, '11_bo_sung_25_cay.json'), encoding='utf-8')))}
cur = {int(r[0]): r for r in (l.strip().split('|') for l in open(os.path.join(HERE, '12_sau_khi_doi.txt'), encoding='utf-8') if '|' in l)}
assert sorted(cur) == list(range(357, 382))

ds = ogr.Open(GPKG)
base = []
for f in ds.GetLayerByName('cay_xanh'):
    if f.GetField('ma_cay') < 357:
        g = f.GetGeometryRef(); base.append((g.GetX(), g.GetY(), g.GetZ()))
ds = None


def idw_z(x, y, k=5):
    nb = sorted(base, key=lambda t: (t[0] - x) ** 2 + (t[1] - y) ** 2)[:k]
    w = [1.0 / max((t[0] - x) ** 2 + (t[1] - y) ** 2, 1e-6) for t in nb]
    return sum(wi * t[2] for wi, t in zip(w, nb)) / sum(w)


new_xyz = {}
sql = ['-- Cập nhật cao độ Z (IDW) cho các cây bổ sung đã được dời vị trí trên ảnh vệ tinh - sinh bởi 12_cap_nhat_vi_tri_so_hoa.py',
       'USE ie402_green_space;', 'GO', 'SET XACT_ABORT ON;', 'BEGIN TRANSACTION;']
for ma, r in sorted(cur.items()):
    x, y = float(r[2]), float(r[3])
    moved = math.hypot(x - old[ma]['x'], y - old[ma]['y']) > 0.01
    z = idw_z(x, y) if moved else old[ma]['z']
    new_xyz[ma] = (x, y, z, int(r[1]), r[4], moved)
    if moved:
        sql.append("UPDATE cay_xanh SET shape = geometry::STGeomFromText('POINT (%.6f %.6f %.6f)', 3405) WHERE ma_cay = %d;" % (x, y, z, ma))
sql += ['COMMIT;', 'GO']
open(os.path.join(HERE, '12_cap_nhat_z.sql'), 'w', encoding='utf-8').write('\n'.join(sql) + '\n')

src = sqlite3.connect(GPKG); dst = sqlite3.connect(BAK); src.backup(dst); dst.close(); src.close()
ds = ogr.Open(GPKG, update=1)
lyr = ds.GetLayerByName('cay_xanh'); lyr.SetAttributeFilter('ma_cay >= 357')
feats = list(lyr)
ds.StartTransaction()
for f in feats:
    x, y, z, kv, ts, moved = new_xyz[f.GetField('ma_cay')]
    g = ogr.Geometry(ogr.wkbPoint25D); g.AddPoint(x, y, z)
    f.SetGeometry(g); f.SetField('ma_khu_vuc', kv); f.SetField('ngay_cap_nhat', ts)
    lyr.SetFeature(f)
ds.CommitTransaction()
ds = None
print('backup', BAK)
print('da doi:', [m for m, v in new_xyz.items() if v[5]])
print('gpkg cap nhat', len(feats), 'cay')
