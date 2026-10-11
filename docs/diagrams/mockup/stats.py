"""Thống kê theo khu cho bảng thống kê của mockup (công thức Chương 2: C = A_canopy / A_zone, V = 2/3·π·R²·k·H, k = 0,75)."""
import json
import math
import sys
from osgeo import ogr

ogr.UseExceptions()
ds = ogr.Open('D:/0. UIT/HK3/IE402.F31.CN1.CNTT - Hệ thống thông tin địa lý 3 chiều - Phan Thanh Vũ/Final_Project/Latex_Final/Topic7_Implementation_Plan/Tree.gpkg')
K = 0.75
zones = {}
for f in ds.GetLayerByName('khu_vuc'):
    zones[f.GetField('ma_khu_vuc')] = {'ten': f.GetField('ten_khu_vuc'), 'ha': f.GetField('dien_tich'),
                                       'geom': f.GetGeometryRef().Clone(), 'n': 0, 'v': 0.0, 'bufs': []}
for f in ds.GetLayerByName('cay_xanh'):
    z = zones.get(f.GetField('ma_khu_vuc'))
    if not z:
        continue
    R, H = f.GetField('ban_kinh_tan'), f.GetField('chieu_cao')
    z['n'] += 1
    z['v'] += 2.0 / 3 * math.pi * R * R * K * H
    z['bufs'].append(f.GetGeometryRef().Buffer(R, 16))
out = []
for k in sorted(zones):
    z = zones[k]
    u = ogr.Geometry(ogr.wkbMultiPolygon)
    for b in z['bufs']:
        u.AddGeometry(b)
    canopy = u.UnionCascaded().Intersection(z['geom']).GetArea() if z['bufs'] else 0.0
    out.append({'ma': k, 'ten': z['ten'], 'ha': round(z['ha'], 2), 'n': z['n'], 'mat_do': round(z['n'] / z['ha'], 2),
                'che_phu': round(canopy / (z['ha'] * 10000) * 100, 2), 'tan_m2': round(canopy), 'the_tich': round(z['v'])})
json.dump(out, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for o in out:
    print(o)
