"""Phân tích che phủ tán cây và dựng lớp cây 3D (B-rep) từ Tree.gpkg.

Chạy bằng Python của QGIS (python-qgis-ltr.bat), từ thư mục ketqua:
    python-qgis-ltr.bat 01_phan_tich_che_phu.py

Đầu vào : ../Tree.gpkg (EPSG:3405) - chỉ đọc
Đầu ra  : KetQua.gpkg  - vung_tan (tán từng cây), vung_che_phu (tán đã Dissolve theo khu),
                        cay_than_3d, cay_tan_3d (MultiPolygonZ, B-rep)
          thong_ke.json - số liệu theo khu và toàn vùng, kiểm định sai lệch

Công thức (Chương 2):
    vùng tán      = Buffer(vị trí cây, R); Dissolve; Intersect với khu vực
    tỷ lệ che phủ = A_tan / A_khu x 100 %
    thể tích tán  = 2/3 * pi * R^2 * h_c, h_c = k * H, k = 0,75
"""
import json
import math
import os

from osgeo import ogr, osr

ogr.UseExceptions()
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'Tree.gpkg')
OUT = os.path.join(HERE, 'KetQua.gpkg')
K = 0.75          # tỷ lệ chiều cao tán / chiều cao cây
QUAD_SEGS = 16    # số đoạn mỗi góc phần tư khi Buffer -> đa giác 64 cạnh
N_LON, N_LAT = 16, 8   # độ mịn khối tán ellipsoid
N_TRUNK = 12           # số cạnh lăng trụ thân

src = ogr.Open(SRC)
srs = osr.SpatialReference(); srs.ImportFromEPSG(3405)

zones = []
for f in src.GetLayerByName('khu_vuc'):
    zones.append({'ma': f.GetField('ma_khu_vuc'), 'ten': f.GetField('ten_khu_vuc'), 'geom': f.GetGeometryRef().Clone()})
zones.sort(key=lambda z: z['ma'])
bf = src.GetLayerByName('VNUHCM_Boundary').GetNextFeature()
boundary = bf.GetGeometryRef().Clone()

trees = []
for f in src.GetLayerByName('cay_xanh'):
    g = f.GetGeometryRef()
    trees.append({'ma_cay': f.GetField('ma_cay'), 'ma_loai': f.GetField('ma_loai'), 'ma_khu_vuc': f.GetField('ma_khu_vuc'),
                  'x': g.GetX(), 'y': g.GetY(), 'H': f.GetField('chieu_cao'), 'R': f.GetField('ban_kinh_tan'),
                  'dbh': f.GetField('dbh')})
for t in trees:
    t['buf'] = ogr.CreateGeometryFromWkt('POINT (%r %r)' % (t['x'], t['y'])).Buffer(t['R'], QUAD_SEGS)
    t['V'] = 2.0 / 3 * math.pi * t['R'] ** 2 * K * t['H']


def union(geoms):
    m = ogr.Geometry(ogr.wkbMultiPolygon)
    for g in geoms:
        m.AddGeometry(g)
    return m.UnionCascaded()


canopy_all = union(t['buf'] for t in trees)      # tán của mọi cây (tán có thể vươn sang khu bên cạnh)

# ---------- thống kê theo khu ----------
rows = []
for z in zones:
    zt = [t for t in trees if t['ma_khu_vuc'] == z['ma']]
    a_zone = z['geom'].GetArea()
    can = canopy_all.Intersection(z['geom'])
    z['canopy'] = can
    rows.append({'ma': z['ma'], 'ten': z['ten'], 'dien_tich_ha': a_zone / 1e4, 'so_cay': len(zt),
                 'mat_do': len(zt) / (a_zone / 1e4), 'dien_tich_tan_m2': can.GetArea(),
                 'ty_le_che_phu': can.GetArea() / a_zone * 100, 'the_tich_m3': sum(t['V'] for t in zt)})
a_all = boundary.GetArea()
can_all = canopy_all.Intersection(boundary)
total = {'ten': 'Toàn vùng nghiên cứu', 'dien_tich_ha': a_all / 1e4, 'so_cay': len(trees), 'mat_do': len(trees) / (a_all / 1e4),
         'dien_tich_tan_m2': can_all.GetArea(), 'ty_le_che_phu': can_all.GetArea() / a_all * 100,
         'the_tich_m3': sum(t['V'] for t in trees)}

# ---------- kiểm định (bảng kiểm thử, dòng 5): đối chiếu với tính tay ----------
# (a) sai số do xấp xỉ đường tròn bằng đa giác 4*QUAD_SEGS cạnh: so tổng diện tích Buffer với tổng pi*R^2
n = 4 * QUAD_SEGS
sum_exact = sum(math.pi * t['R'] ** 2 for t in trees)
sum_poly = sum(t['buf'].GetArea() for t in trees)
# (b) một khu mẫu: khu nhỏ nhất (Quảng trường Sáng tạo) - tổng pi*R^2 (tính tay) so với diện tích tán đã Dissolve
z3 = next(z for z in zones if z['ma'] == 3)
t3 = [t for t in trees if t['ma_khu_vuc'] == 3]
inside = [t for t in t3 if z3['geom'].Contains(t['buf'])]
overlap_pairs = sum(1 for i, a in enumerate(t3) for b in t3[i + 1:] if math.hypot(a['x'] - b['x'], a['y'] - b['y']) < a['R'] + b['R'])
hand3 = sum(math.pi * t['R'] ** 2 for t in t3)
gis3 = union(t['buf'] for t in t3).Intersection(z3['geom']).GetArea()
check = {
    'so_canh_da_giac': n,
    'ty_le_ly_thuyet': n / (2 * math.pi) * math.sin(2 * math.pi / n),
    'tong_pi_R2_m2': sum_exact, 'tong_buffer_m2': sum_poly,
    'sai_lech_xap_xi_pct': (sum_poly - sum_exact) / sum_exact * 100,
    'khu_mau': z3['ten'], 'so_cay_khu_mau': len(t3), 'so_cay_tan_nam_tron_trong_khu': len(inside),
    'so_cap_tan_chong_lan': overlap_pairs,
    'tinh_tay_tong_pi_R2_m2': hand3, 'gis_tan_da_dissolve_m2': gis3,
    'chenh_lech_pct': (gis3 - hand3) / hand3 * 100,
}


# ---------- hình học 3D (B-rep): thân lăng trụ N_TRUNK cạnh, tán ellipsoid N_LON x N_LAT mặt ----------
def ring(pts):
    r = ogr.Geometry(ogr.wkbLinearRing25D if hasattr(ogr, 'wkbLinearRing25D') else ogr.wkbLinearRing)
    for p in pts + [pts[0]]:
        r.AddPoint(*p)
    poly = ogr.Geometry(ogr.wkbPolygon25D); poly.AddGeometry(r)
    return poly


def trunk(t):
    rad = max(t['dbh'] / 200.0, 0.1)            # DBH (cm) -> bán kính (m)
    top = t['H'] * (1 - K)
    pts = [(t['x'] + rad * math.cos(2 * math.pi * i / N_TRUNK), t['y'] + rad * math.sin(2 * math.pi * i / N_TRUNK)) for i in range(N_TRUNK)]
    m = ogr.Geometry(ogr.wkbMultiPolygon25D)
    m.AddGeometry(ring([(x, y, 0.0) for x, y in pts][::-1]))
    m.AddGeometry(ring([(x, y, top) for x, y in pts]))
    for i in range(N_TRUNK):
        a, b = pts[i], pts[(i + 1) % N_TRUNK]
        m.AddGeometry(ring([(a[0], a[1], 0.0), (b[0], b[1], 0.0), (b[0], b[1], top), (a[0], a[1], top)]))
    return m


def crown(t):
    hc = K * t['H']; cz = t['H'] - hc / 2; c = hc / 2
    def P(i, j):                                 # i: kinh tuyến, j: vĩ tuyến (0 = đỉnh, N_LAT = đáy)
        phi = math.pi * j / N_LAT; lam = 2 * math.pi * i / N_LON
        return (t['x'] + t['R'] * math.sin(phi) * math.cos(lam), t['y'] + t['R'] * math.sin(phi) * math.sin(lam), cz + c * math.cos(phi))
    m = ogr.Geometry(ogr.wkbMultiPolygon25D)
    for j in range(N_LAT):
        for i in range(N_LON):
            i2 = (i + 1) % N_LON
            if j == 0:
                m.AddGeometry(ring([P(0, 0), P(i2, 1), P(i, 1)]))
            elif j == N_LAT - 1:
                m.AddGeometry(ring([P(i, j), P(i2, j), P(0, N_LAT)]))
            else:
                m.AddGeometry(ring([P(i, j), P(i2, j), P(i2, j + 1), P(i, j + 1)]))
    return m


# ---------- ghi KetQua.gpkg ----------
drv = ogr.GetDriverByName('GPKG')
for suffix in ('', '-wal', '-shm'):          # DeleteDataSource lỗi âm thầm với đường dẫn có dấu
    if os.path.exists(OUT + suffix):
        os.remove(OUT + suffix)
out = drv.CreateDataSource(OUT)


def layer(name, gtype, fields):
    lyr = out.CreateLayer(name, srs, gtype)
    for fname, ftype in fields:
        lyr.CreateField(ogr.FieldDefn(fname, ftype))
    return lyr


TREE_FIELDS = [('ma_cay', ogr.OFTInteger), ('ma_loai', ogr.OFTInteger), ('ma_khu_vuc', ogr.OFTInteger),
               ('chieu_cao', ogr.OFTReal), ('ban_kinh_tan', ogr.OFTReal), ('dbh', ogr.OFTReal)]
lt = layer('vung_tan', ogr.wkbPolygon, TREE_FIELDS + [('the_tich_tan', ogr.OFTReal)])
lth = layer('cay_than_3d', ogr.wkbMultiPolygon25D, TREE_FIELDS)
ltn = layer('cay_tan_3d', ogr.wkbMultiPolygon25D, TREE_FIELDS)
for t in trees:
    for lyr, geom in ((lt, t['buf']), (lth, trunk(t)), (ltn, crown(t))):
        f = ogr.Feature(lyr.GetLayerDefn())
        f.SetField('ma_cay', t['ma_cay']); f.SetField('ma_loai', t['ma_loai']); f.SetField('ma_khu_vuc', t['ma_khu_vuc'])
        f.SetField('chieu_cao', t['H']); f.SetField('ban_kinh_tan', t['R']); f.SetField('dbh', t['dbh'])
        if lyr is lt:
            f.SetField('the_tich_tan', t['V'])
        f.SetGeometry(geom); lyr.CreateFeature(f)

lz = layer('vung_che_phu', ogr.wkbMultiPolygon, [('ma_khu_vuc', ogr.OFTInteger), ('ten_khu_vuc', ogr.OFTString),
                                                 ('so_cay', ogr.OFTInteger), ('ty_le_che_phu', ogr.OFTReal),
                                                 ('dien_tich_tan', ogr.OFTReal)])
for z, r in zip(zones, rows):
    f = ogr.Feature(lz.GetLayerDefn())
    f.SetField('ma_khu_vuc', z['ma']); f.SetField('ten_khu_vuc', z['ten']); f.SetField('so_cay', r['so_cay'])
    f.SetField('ty_le_che_phu', r['ty_le_che_phu']); f.SetField('dien_tich_tan', r['dien_tich_tan_m2'])
    f.SetGeometry(ogr.ForceToMultiPolygon(z['canopy'])); lz.CreateFeature(f)
out = None

json.dump({'theo_khu': rows, 'toan_vung': total, 'kiem_dinh': check, 'k': K},
          open(os.path.join(HERE, 'thong_ke.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for r in rows + [total]:
    print('%-45s %4d cây  %7.2f ha  %6.2f cây/ha  tán %8.0f m2  %5.2f %%  V %8.0f m3' % (
        r['ten'], r['so_cay'], r['dien_tich_ha'], r['mat_do'], r['dien_tich_tan_m2'], r['ty_le_che_phu'], r['the_tich_m3']))
print(json.dumps(check, ensure_ascii=False, indent=1))
