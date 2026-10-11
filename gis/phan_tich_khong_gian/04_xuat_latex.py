"""Sinh ketqua_so_lieu.tex (macro số liệu + bảng che phủ) từ thong_ke.json, kiem_chung_qgis.json; chép ảnh 3D sang imgs/.

Chạy sau 01-03 (Python thường hoặc Python của QGIS):  python 04_xuat_latex.py
Chương 4 dùng: \\input{Topic7_Implementation_Plan/ketqua/ketqua_so_lieu.tex}
"""
import json
import os
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
IMGS = os.path.join(HERE, '..', '..', 'imgs')
s = json.load(open(os.path.join(HERE, 'thong_ke.json'), encoding='utf-8'))
q = json.load(open(os.path.join(HERE, 'kiem_chung_qgis.json'), encoding='utf-8'))


def vn(v, d=2):
    """Số kiểu Việt Nam: dấu phẩy thập phân, dấu chấm phân nhóm nghìn."""
    txt = '{:,.{}f}'.format(v, d)
    return txt.replace(',', '\u2009').replace('.', ',').replace('\u2009', '.').replace('-', '\u2212')


t, c = s['toan_vung'], s['kiem_dinh']
max_diff = max(abs(r['chenh_lech_m2']) for r in q)
macros = {
    'KqSoCay': '%d' % t['so_cay'], 'KqDienTich': vn(t['dien_tich_ha']), 'KqChePhu': vn(t['ty_le_che_phu']),
    'KqMatDo': vn(t['mat_do']), 'KqDienTichTan': vn(t['dien_tich_tan_m2'], 0), 'KqTheTich': vn(t['the_tich_m3'], 0),
    'KqSaiSoDaGiac': vn(c['sai_lech_xap_xi_pct']), 'KqSoCanh': '%d' % c['so_canh_da_giac'],
    'KqKhuMau': c['khu_mau'], 'KqSoCayKhuMau': '%d' % c['so_cay_khu_mau'], 'KqSoCayTrongKhu': '%d' % c['so_cay_tan_nam_tron_trong_khu'],
    'KqCapChongLan': '%d' % c['so_cap_tan_chong_lan'], 'KqSoCayVuon': '%d' % (c['so_cay_khu_mau'] - c['so_cay_tan_nam_tron_trong_khu']), 'KqTinhTay': vn(c['tinh_tay_tong_pi_R2_m2'], 1),
    'KqGisKhuMau': vn(c['gis_tan_da_dissolve_m2'], 1), 'KqChenhLech': vn(c['chenh_lech_pct']),
    'KqLechQgis': vn(max_diff, 3),
}
best = max(s['theo_khu'], key=lambda r: r['ty_le_che_phu']); worst = min(s['theo_khu'], key=lambda r: r['ty_le_che_phu'])
macros.update({'KqKhuCao': best['ten'], 'KqCheCao': vn(best['ty_le_che_phu']), 'KqKhuThap': worst['ten'], 'KqCheThap': vn(worst['ty_le_che_phu'])})

out = ['% Tệp sinh tự động bởi 04_xuat_latex.py - không sửa tay; chạy lại 01-04 khi dữ liệu cây thay đổi.']
out += ['\\newcommand{\\%s}{%s}' % (k, v) for k, v in macros.items()]
rows = ['%d. %s & %d & %s & %s & %s & %s & %s \\\\ \\hline' % (r['ma'], r['ten'], r['so_cay'], vn(r['dien_tich_ha']), vn(r['mat_do']),
                                                            vn(r['dien_tich_tan_m2'], 0), vn(r['ty_le_che_phu']), vn(r['the_tich_m3'], 0))
        for r in s['theo_khu']]
rows.append('\\textbf{%s} & \\textbf{%d} & \\textbf{%s} & \\textbf{%s} & \\textbf{%s} & \\textbf{%s} & \\textbf{%s} \\\\ \\hline' % (
    t['ten'], t['so_cay'], vn(t['dien_tich_ha']), vn(t['mat_do']), vn(t['dien_tich_tan_m2'], 0), vn(t['ty_le_che_phu']), vn(t['the_tich_m3'], 0)))
out.append('\\newcommand{\\KqBangChePhuRows}{%\n' + '\n'.join(rows) + '\n}')
open(os.path.join(HERE, 'ketqua_so_lieu.tex'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')

if os.path.exists(os.path.join(HERE, 'canh_3d.png')):
    shutil.copy(os.path.join(HERE, 'canh_3d.png'), os.path.join(IMGS, 'ketqua_canh_3d.png'))
print('\n'.join(out))
