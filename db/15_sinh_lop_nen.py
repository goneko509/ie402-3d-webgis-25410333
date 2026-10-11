"""Sinh 15_nap_lop_nen.sql (INSERT tòa nhà, đường, ranh giới) từ Tree.gpkg.

Chạy bằng Python của QGIS (cần GDAL/OGR):  python-qgis-ltr.bat 15_sinh_lop_nen.py
Sau đó: sqlcmd ... -i 14_lop_nen.sql  rồi  sqlcmd ... -i 15_nap_lop_nen.sql
File SQL sinh ra chạy được cả trên SQL Server local lẫn Azure SQL (không cần ODBC/GDAL ở máy đích).
"""
import os

from osgeo import ogr

ogr.UseExceptions()
HERE = os.path.dirname(os.path.abspath(__file__))
GPKG = os.path.normpath(os.path.join(HERE, '..', '..', 'Latex_Final', 'Topic7_Implementation_Plan', 'Tree.gpkg'))
OUT = os.path.join(HERE, '15_nap_lop_nen.sql')
BATCH = 100


def q(s):
    return 'NULL' if s is None else "N'" + str(s).replace("'", "''") + "'"


def wkt2d(g):
    g = g.Clone(); g.FlattenTo2D()
    return g.ExportToWkt()


ds = ogr.Open(GPKG)
lines = ['-- Sinh tự động bởi 15_sinh_lop_nen.py từ Tree.gpkg - không sửa tay.', 'USE ie402_green_space;', 'GO',
         'SET NOCOUNT ON;', 'DELETE FROM toa_nha; DELETE FROM duong; DELETE FROM ranh_gioi;', 'GO']
counts = {}


def emit(table, cols, rows):
    counts[table] = len(rows)
    for i in range(0, len(rows), BATCH):
        lines.append('INSERT INTO %s (%s) VALUES' % (table, ', '.join(cols)))
        lines.append(',\n'.join('(' + ', '.join(r) + ')' for r in rows[i:i + BATCH]) + ';')
        lines.append('GO')


rows = []
for f in ds.GetLayerByName('buildings'):
    rows.append([str(f.GetFID()), q(f.GetField('name')), '%.2f' % f.GetField('chieu_cao'), q(f.GetField('nguon_chieu_cao')),
                 "geometry::STGeomFromText('%s', 3405).MakeValid()" % wkt2d(f.GetGeometryRef())])
emit('toa_nha', ['ma_toa_nha', 'ten', 'chieu_cao', 'nguon_chieu_cao', 'shape'], rows)

rows = []
for f in ds.GetLayerByName('roads'):
    hw = f.GetField('highway')
    rows.append([str(f.GetFID()), q(f.GetField('name')), "'%s'" % hw if hw else 'NULL',
                 "geometry::STGeomFromText('%s', 3405)" % wkt2d(f.GetGeometryRef())])
emit('duong', ['ma_duong', 'ten', 'cap_duong', 'shape'], rows)

rows = []
for f in ds.GetLayerByName('VNUHCM_Boundary'):
    rows.append([str(f.GetFID()), q(f.GetField('Name') or 'Làng Đại học ĐHQG TP.HCM'),
                 "geometry::STGeomFromText('%s', 3405).MakeValid()" % wkt2d(f.GetGeometryRef())])
emit('ranh_gioi', ['ma', 'ten', 'shape'], rows)

lines.append('SELECT (SELECT COUNT(*) FROM toa_nha) AS toa_nha, (SELECT COUNT(*) FROM duong) AS duong, '
             '(SELECT COUNT(*) FROM ranh_gioi) AS ranh_gioi, (SELECT SUM(CAST(shape.STIsValid() AS INT)) FROM toa_nha) AS toa_nha_hop_le;')
lines.append('GO')
open(OUT, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(counts, os.path.getsize(OUT) // 1024, 'KB')
