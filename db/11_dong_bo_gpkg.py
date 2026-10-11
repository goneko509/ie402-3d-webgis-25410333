"""Đồng bộ 25 cây bổ sung (đã INSERT vào SQL Server) sang lớp cay_xanh của Tree.gpkg.

Đầu vào: 11_moi_tu_sql.txt (sqlcmd -s "|": ma_cay|ma_loai|ma_khu_vuc|H|R|dbh|ngay_trong|ngay_cap_nhat|x|y|z)
Sao lưu Tree.gpkg vào ../backup trước khi ghi (sqlite backup API, an toàn với WAL).
Chạy bằng Python của QGIS: python-qgis-ltr.bat 11_dong_bo_gpkg.py
"""
import os
import sqlite3

from osgeo import ogr

ogr.UseExceptions()
HERE = os.path.dirname(os.path.abspath(__file__))
GPKG = os.path.join(HERE, '..', 'Tree.gpkg')
BAK = os.path.join(HERE, '..', 'backup', 'Tree_20261007_truoc_bo_sung_25_cay.gpkg')

src = sqlite3.connect(GPKG); dst = sqlite3.connect(BAK)
src.backup(dst); dst.close(); src.close()
print('backup', BAK)

rows = [l.strip().split('|') for l in open(os.path.join(HERE, '11_moi_tu_sql.txt'), encoding='utf-8') if l.strip()]
assert len(rows) == 25, len(rows)
ds = ogr.Open(GPKG, update=1)
lyr = ds.GetLayerByName('cay_xanh')
ids = {f.GetField('ma_cay') for f in lyr}
assert not ids & {int(r[0]) for r in rows}, 'đã đồng bộ trước đó'
ds.StartTransaction()
for r in rows:
    f = ogr.Feature(lyr.GetLayerDefn())
    f.SetField('ma_cay', int(r[0])); f.SetField('ma_loai', int(r[1])); f.SetField('ma_khu_vuc', int(r[2]))
    f.SetField('chieu_cao', float(r[3])); f.SetField('ban_kinh_tan', float(r[4])); f.SetField('dbh', float(r[5]))
    f.SetField('ngay_trong', r[6]); f.SetField('ngay_cap_nhat', r[7]); f.SetField('tinh_trang', 'Bình thường')
    g = ogr.Geometry(ogr.wkbPoint25D); g.AddPoint(float(r[8]), float(r[9]), float(r[10]))
    f.SetGeometry(g)
    lyr.CreateFeature(f)
ds.CommitTransaction()
print('cay_xanh:', lyr.GetFeatureCount())
ds = None
