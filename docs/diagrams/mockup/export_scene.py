"""Xuất dữ liệu khu 2 (EPSG:3405) từ Tree.gpkg ra scene.json cho khung 3D của mockup."""
import json
import sys
from osgeo import ogr

gpkg = 'D:/0. UIT/HK3/IE402.F31.CN1.CNTT - Hệ thống thông tin địa lý 3 chiều - Phan Thanh Vũ/Final_Project/Latex_Final/Topic7_Implementation_Plan/Tree.gpkg'
out = sys.argv[1]
ogr.UseExceptions()
ds = ogr.Open(gpkg)
zone_id = 2


def rings(g):
    t = ogr.GT_Flatten(g.GetGeometryType())
    polys = [g] if t == ogr.wkbPolygon else [g.GetGeometryRef(i) for i in range(g.GetGeometryCount())]
    return [[list(p.GetGeometryRef(0).GetPoint_2D(j)) for j in range(p.GetGeometryRef(0).GetPointCount())] for p in polys]


kv = ds.GetLayerByName('khu_vuc')
kv.SetAttributeFilter('ma_khu_vuc = %d' % zone_id)
zf = kv.GetNextFeature()
zg = zf.GetGeometryRef().Clone()
env = zg.GetEnvelope()                       # minx, maxx, miny, maxy
pad = 40
box = ogr.CreateGeometryFromWkt('POLYGON((%f %f,%f %f,%f %f,%f %f,%f %f))' % (
    env[0] - pad, env[2] - pad, env[1] + pad, env[2] - pad, env[1] + pad, env[3] + pad, env[0] - pad, env[3] + pad, env[0] - pad, env[2] - pad))

scene = {'zone': {'name': zf.GetField('ten_khu_vuc'), 'area_ha': zf.GetField('dien_tich'), 'rings': rings(zg)},
         'env': [env[0] - pad, env[1] + pad, env[2] - pad, env[3] + pad], 'buildings': [], 'roads': [], 'trees': []}

b = ds.GetLayerByName('buildings'); b.SetSpatialFilter(box)
for f in b:
    g = f.GetGeometryRef().Intersection(box)
    if g and not g.IsEmpty() and ogr.GT_Flatten(g.GetGeometryType()) in (ogr.wkbPolygon, ogr.wkbMultiPolygon):
        scene['buildings'].append({'h': f.GetField('chieu_cao') or 6, 'name': f.GetField('name'), 'rings': rings(g)})

r = ds.GetLayerByName('roads'); r.SetSpatialFilter(box)
for f in r:
    g = f.GetGeometryRef().Intersection(box)
    if g is None or g.IsEmpty():
        continue
    parts = [g] if ogr.GT_Flatten(g.GetGeometryType()) == ogr.wkbLineString else [g.GetGeometryRef(i) for i in range(g.GetGeometryCount())]
    for p in parts:
        if ogr.GT_Flatten(p.GetGeometryType()) == ogr.wkbLineString:
            scene['roads'].append({'hw': f.GetField('highway'), 'pts': [list(p.GetPoint_2D(j)) for j in range(p.GetPointCount())]})

t = ds.GetLayerByName('cay_xanh'); t.SetSpatialFilter(box)
for f in t:
    x, y = f.GetGeometryRef().GetPoint_2D(0)
    scene['trees'].append({'id': f.GetField('ma_cay'), 'loai': f.GetField('ma_loai'), 'kv': f.GetField('ma_khu_vuc'),
                           'x': x, 'y': y, 'h': f.GetField('chieu_cao'), 'r': f.GetField('ban_kinh_tan'),
                           'dbh': f.GetField('dbh'), 'ngay_trong': f.GetField('ngay_trong'), 'tt': f.GetField('tinh_trang')})

json.dump(scene, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
print('buildings', len(scene['buildings']), 'roads', len(scene['roads']), 'trees', len(scene['trees']), 'env', [round(v) for v in scene['env']])
