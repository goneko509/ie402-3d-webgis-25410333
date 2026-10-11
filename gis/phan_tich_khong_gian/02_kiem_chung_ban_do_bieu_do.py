"""(1) Kiểm chứng số liệu che phủ bằng thuật toán QGIS Processing (native:buffer, native:intersection);
(2) vẽ bản đồ vùng tán và biểu đồ thống kê (PDF vector) cho Chương 4.

Chạy sau 01_phan_tich_che_phu.py, bằng Python của QGIS:
    python-qgis-ltr.bat 02_kiem_chung_ban_do_bieu_do.py
Đầu ra: kiem_chung_qgis.json; ../../imgs/ketqua_vung_tan.pdf, ../../imgs/ketqua_bieudo.pdf
"""
import json
import os
import sys

from osgeo import ogr
from qgis.core import QgsApplication, QgsVectorLayer, QgsProcessingFeedback

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'Tree.gpkg')
RES = os.path.join(HERE, 'KetQua.gpkg')
IMGS = os.path.join(HERE, '..', '..', 'imgs')
stats = json.load(open(os.path.join(HERE, 'thong_ke.json'), encoding='utf-8'))

# ---------------- (1) QGIS Processing ----------------
QgsApplication.setPrefixPath(os.environ.get('QGIS_PREFIX_PATH', r'C:\Program Files\QGIS 3.44.14\apps\qgis-ltr'), True)
qgs = QgsApplication([], False); qgs.initQgis()
sys.path.append(os.path.join(os.environ.get('QGIS_PREFIX_PATH', r'C:\Program Files\QGIS 3.44.14\apps\qgis-ltr'), 'python', 'plugins'))
import processing                                         # noqa: E402
from processing.core.Processing import Processing         # noqa: E402
Processing.initialize()

trees = QgsVectorLayer(SRC + '|layername=cay_xanh', 'cay_xanh', 'ogr')
zones = QgsVectorLayer(SRC + '|layername=khu_vuc', 'khu_vuc', 'ogr')
fb = QgsProcessingFeedback()
from qgis.core import QgsProperty                          # noqa: E402
buf = processing.run('native:buffer', {
    'INPUT': trees, 'DISTANCE': QgsProperty.fromField('ban_kinh_tan'), 'SEGMENTS': 16, 'END_CAP_STYLE': 0,
    'JOIN_STYLE': 0, 'MITER_LIMIT': 2, 'DISSOLVE': True, 'OUTPUT': 'memory:'}, feedback=fb)['OUTPUT']
inter = processing.run('native:intersection', {
    'INPUT': buf, 'OVERLAY': zones, 'INPUT_FIELDS': [], 'OVERLAY_FIELDS': ['ma_khu_vuc'], 'OVERLAY_FIELDS_PREFIX': 'kv_', 'OUTPUT': 'memory:'}, feedback=fb)['OUTPUT']
qg = {}
for f in inter.getFeatures():
    qg[f['kv_ma_khu_vuc']] = qg.get(f['kv_ma_khu_vuc'], 0.0) + f.geometry().area()
cmp_rows = []
for r in stats['theo_khu']:
    a = qg.get(r['ma'], 0.0)
    cmp_rows.append({'ma': r['ma'], 'ten': r['ten'], 'qgis_m2': a, 'script_m2': r['dien_tich_tan_m2'],
                     'chenh_lech_m2': a - r['dien_tich_tan_m2']})
with open(os.path.join(HERE, 'kiem_chung_qgis.json'), 'w', encoding='utf-8') as fo:
    json.dump(cmp_rows, fo, ensure_ascii=False, indent=1)
for c in cmp_rows:
    print('QGIS Processing vs script: %-42s %9.1f %9.1f  lệch %.3f m2' % (c['ten'], c['qgis_m2'], c['script_m2'], c['chenh_lech_m2']))

# ---------------- (2) bản đồ và biểu đồ ----------------
import matplotlib                                          # noqa: E402
matplotlib.use('Agg')
import matplotlib.pyplot as plt                            # noqa: E402
from matplotlib.patches import PathPatch, Patch, FancyArrow  # noqa: E402
from matplotlib.path import Path                           # noqa: E402
from matplotlib.lines import Line2D                        # noqa: E402

plt.rcParams.update({'font.family': 'Times New Roman', 'font.size': 11, 'pdf.fonttype': 42})
INK, INK2, MUTED, SURF = '#0b0b0b', '#52514e', '#898781', '#ffffff'
GREEN = '#008300'


def polys(g):
    t = ogr.GT_Flatten(g.GetGeometryType())
    if t == ogr.wkbPolygon:
        return [g]
    if t in (ogr.wkbMultiPolygon, ogr.wkbGeometryCollection):
        return [p for i in range(g.GetGeometryCount()) for p in polys(g.GetGeometryRef(i))]
    return []


def patch(g, **kw):
    verts, codes = [], []
    for p in polys(g):
        for i in range(p.GetGeometryCount()):
            r = p.GetGeometryRef(i); pts = [r.GetPoint_2D(j) for j in range(r.GetPointCount())]
            verts += pts; codes += [Path.MOVETO] + [Path.LINETO] * (len(pts) - 2) + [Path.CLOSEPOLY]
    return PathPatch(Path(verts, codes), **kw) if verts else None


def lines(g):
    t = ogr.GT_Flatten(g.GetGeometryType())
    if t == ogr.wkbLineString:
        return [[g.GetPoint_2D(j) for j in range(g.GetPointCount())]]
    return [l for i in range(g.GetGeometryCount()) for l in lines(g.GetGeometryRef(i))]


src = ogr.Open(SRC); res = ogr.Open(RES)
geo = lambda name, ds=src: [f.GetGeometryRef().Clone() for f in ds.GetLayerByName(name)]
zone_feats = [(f.GetField('ma_khu_vuc'), f.GetField('ten_khu_vuc'), f.GetGeometryRef().Clone()) for f in src.GetLayerByName('khu_vuc')]
buildings, roads = geo('buildings'), geo('roads')
bfeat = src.GetLayerByName('VNUHCM_Boundary').GetNextFeature(); boundary = bfeat.GetGeometryRef().Clone()
canopy = geo('vung_che_phu', res)
tree_bufs = geo('vung_tan', res)
tree_pts = [(f.GetGeometryRef().GetX(), f.GetGeometryRef().GetY(), f.GetField('ma_khu_vuc')) for f in src.GetLayerByName('cay_xanh')]


def draw_base(ax, clip=None):
    for z in zone_feats:
        ax.add_patch(patch(z[2], facecolor='#f4f3ee', edgecolor='none', zorder=0))
    for r in roads:
        for l in lines(r):
            xs, ys = zip(*l); ax.plot(xs, ys, color='#d9d5cb', lw=0.6, zorder=1, solid_capstyle='round')
    for b in buildings:
        p = patch(b, facecolor='#c9c6be', edgecolor='#a9a69e', lw=0.2, zorder=2)
        if p: ax.add_patch(p)
    for z in zone_feats:
        ax.add_patch(patch(z[2], facecolor='none', edgecolor=INK2, lw=0.8, ls=(0, (4, 2)), zorder=5))
    ax.add_patch(patch(boundary, facecolor='none', edgecolor=INK, lw=1.4, zorder=6))


def scalebar(ax, length, label, pos=(0.05, 0.05)):
    x0, x1 = ax.get_xlim(); y0, y1 = ax.get_ylim()
    sx, sy = x0 + (x1 - x0) * pos[0], y0 + (y1 - y0) * pos[1]
    ax.plot([sx, sx + length], [sy, sy], color=INK, lw=2.5, solid_capstyle='butt', zorder=10)
    ax.text(sx + length / 2, sy + (y1 - y0) * 0.015, label, ha='center', va='bottom', color=INK, fontsize=9, zorder=10)


def north(ax, pos=(0.93, 0.86)):
    ax.annotate('N', xy=(pos[0], pos[1] + 0.08), xytext=(pos[0], pos[1]), xycoords='axes fraction', ha='center', va='top',
                fontsize=11, fontweight='bold', color=INK, arrowprops=dict(arrowstyle='-|>', color=INK, lw=1.2), zorder=10)


fig, (a1, a2) = plt.subplots(1, 2, figsize=(8.6, 4.1), gridspec_kw={'width_ratios': [1.35, 1]})
# panel trái: toàn vùng
draw_base(a1)
for c in canopy:
    a1.add_patch(patch(c, facecolor=GREEN, edgecolor=GREEN, lw=0.4, zorder=4))
env = boundary.GetEnvelope(); pad = 80
a1.set_xlim(env[0] - pad, env[1] + pad); a1.set_ylim(env[2] - pad, env[3] + pad)
for ma, ten, g in zone_feats:
    c = g.PointOnSurface(); s = next(r for r in stats['theo_khu'] if r['ma'] == ma)
    a1.text(c.GetX(), c.GetY(), '%d\n%s %%' % (ma, ('%.2f' % s['ty_le_che_phu']).replace('.', ',')), ha='center', va='center',
            fontsize=10, color=INK, zorder=8, bbox=dict(boxstyle='round,pad=0.25', fc='white', ec=MUTED, lw=0.5))
z3 = next(z for z in zone_feats if z[0] == 3)
e3 = z3[2].GetEnvelope(); m3 = 25
a1.add_patch(plt.Rectangle((e3[0] - m3, e3[2] - m3), e3[1] - e3[0] + 2 * m3, e3[3] - e3[2] + 2 * m3, fill=False, ec='#c62828', lw=1.2, zorder=9))
a1.set_title('(a) Toàn vùng (nhãn: mã khu, tỷ lệ che phủ)', fontsize=9.5, color=INK)
scalebar(a1, 500, '500 m'); north(a1)
# panel phải: phóng to khu 3
draw_base(a2)
for b in tree_bufs:
    a2.add_patch(patch(b, facecolor='none', edgecolor=GREEN, lw=0.5, ls=(0, (2, 1.5)), zorder=4))
for c in canopy:
    a2.add_patch(patch(c, facecolor=GREEN, alpha=0.55, edgecolor=GREEN, lw=1.0, zorder=4))
xs = [p[0] for p in tree_pts]; ys = [p[1] for p in tree_pts]
a2.scatter(xs, ys, s=6, color=INK, zorder=7, linewidths=0)
a2.set_xlim(e3[0] - m3, e3[1] + m3); a2.set_ylim(e3[2] - m3, e3[3] + m3)
a2.set_title('(b) Khu 3 – Quảng trường Sáng tạo', fontsize=9.5, color=INK)
for sp in a2.spines.values():
    sp.set_edgecolor('#c62828'); sp.set_linewidth(1.2)
scalebar(a2, 100, '100 m'); north(a2)
for ax in (a1, a2):
    ax.set_aspect('equal'); ax.set_xticks([]); ax.set_yticks([])
handles = [Patch(fc=GREEN, ec=GREEN, label='Vùng tán (Buffer R, Dissolve, cắt theo khu)'),
           Line2D([0], [0], color=GREEN, lw=0.8, ls=(0, (2, 1.5)), label='Buffer tán từng cây'),
           Line2D([0], [0], marker='o', color='none', markerfacecolor=INK, markersize=3.5, label='Vị trí cây'),
           Patch(fc='#c9c6be', ec='#a9a69e', label='Tòa nhà (OSM)'),
           Line2D([0], [0], color=INK2, lw=0.8, ls=(0, (4, 2)), label='Ranh giới khu vực'),
           Line2D([0], [0], color=INK, lw=1.4, label='Ranh giới vùng nghiên cứu')]
fig.legend(handles=handles, loc='lower center', ncol=3, frameon=False, fontsize=9.5, bbox_to_anchor=(0.5, 0.0))
fig.tight_layout(rect=(0, 0.09, 1, 1))
fig.savefig(os.path.join(IMGS, 'ketqua_vung_tan.pdf'), bbox_inches='tight'); fig.savefig(os.path.join(HERE, 'ketqua_vung_tan.png'), dpi=110, bbox_inches='tight')
plt.close(fig)

# biểu đồ: 2 panel cùng thứ tự khu, mỗi panel một trục
rows = stats['theo_khu']
names = ['%d. %s' % (r['ma'], r['ten'].replace('Khu phía Tây', 'Phía Tây').replace('Khu ', '').replace('Trung tâm Marie Curie - Isaac Newton', 'Trung tâm MC – IN')) for r in rows]
fig, axes = plt.subplots(1, 2, figsize=(7.6, 2.9), sharey=True)
for ax, key, title, fmt in ((axes[0], 'ty_le_che_phu', 'Tỷ lệ che phủ (%)', '%.2f'), (axes[1], 'mat_do', 'Mật độ (cây/ha)', '%.2f')):
    vals = [r[key] for r in rows]
    y = range(len(rows))
    ax.barh(y, vals, height=0.45, color=GREEN, zorder=3)
    tot = stats['toan_vung'][key]
    ax.axvline(tot, color=INK2, lw=1, ls=(0, (3, 2)), zorder=4)
    ax.text(tot, -0.62, ' toàn vùng ' + (fmt % tot).replace('.', ','), color=INK2, fontsize=9, va='bottom', ha='left')
    for i, v in enumerate(vals):
        ax.text(v + max(vals) * 0.015, i, (fmt % v).replace('.', ','), va='center', ha='left', color=INK, fontsize=10)
    ax.set_xlim(0, max(vals) * 1.22); ax.set_ylim(len(rows) - 0.5, -0.9); ax.set_title(title, fontsize=11, color=INK, loc='left')
    ax.grid(axis='x', color='#e6e4de', lw=0.6, zorder=0); ax.tick_params(colors=INK2, length=0)
    for s in ('top', 'right', 'left'):
        ax.spines[s].set_visible(False)
    ax.spines['bottom'].set_color(MUTED)
    ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, p: ('%g' % v).replace('.', ',')))
axes[0].set_yticks(list(range(len(rows)))); axes[0].set_yticklabels(names, color=INK)
fig.tight_layout()
fig.savefig(os.path.join(IMGS, 'ketqua_bieudo.pdf'), bbox_inches='tight'); fig.savefig(os.path.join(HERE, 'ketqua_bieudo.png'), dpi=110, bbox_inches='tight')
print('saved maps and chart')
qgs.exitQgis()
