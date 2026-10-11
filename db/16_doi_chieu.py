"""Đối chiếu kết quả sp_thong_ke_che_phu (16_ket_qua.txt) với ketqua/thong_ke.json (đã kiểm chứng ở Chương 4).

Tiêu chí chấp nhận (đặc tả mục 3): lệch diện tích tán <= 0,5 %; số cây, thể tích khớp.
Chạy bằng Python trong d:/0. UIT/HK3/.venv (cần pandas):  python 16_doi_chieu.py
"""
import io
import json
import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.normpath(os.path.join(HERE, '..', '..', 'Latex_Final', 'Topic7_Implementation_Plan', 'ketqua', 'thong_ke.json'))

txt = open(os.path.join(HERE, '16_ket_qua.txt'), encoding='utf-8-sig').read().splitlines()
sql = pd.read_csv(io.StringIO('\n'.join([txt[0]] + txt[2:])), sep='|')
sql['ma_khu_vuc'] = pd.to_numeric(sql['ma_khu_vuc'], errors='coerce')

ref = json.load(open(REF, encoding='utf-8'))
rows = [{'ma_khu_vuc': r['ma'], 'ref_cay': r['so_cay'], 'ref_tan': r['dien_tich_tan_m2'], 'ref_v': r['the_tich_m3']} for r in ref['theo_khu']]
t = ref['toan_vung']
rows.append({'ma_khu_vuc': float('nan'), 'ref_cay': t['so_cay'], 'ref_tan': t['dien_tich_tan_m2'], 'ref_v': t['the_tich_m3']})
ref = pd.DataFrame(rows)

df = pd.concat([sql.reset_index(drop=True), ref.drop(columns='ma_khu_vuc').reset_index(drop=True)], axis=1)   # cùng thứ tự: khu 1-5, toàn vùng
df['lech_tan_pct'] = (df['dien_tich_tan_m2'] - df['ref_tan']) / df['ref_tan'] * 100
df['lech_v_pct'] = (df['the_tich_m3'] - df['ref_v']) / df['ref_v'] * 100
print(df[['ten_khu_vuc', 'so_cay', 'ref_cay', 'dien_tich_tan_m2', 'ref_tan', 'lech_tan_pct', 'lech_v_pct']].round(3).to_string(index=False))

ok = (df['so_cay'] == df['ref_cay']).all() and (df['lech_tan_pct'].abs() <= 0.5).all() and (df['lech_v_pct'].abs() <= 0.01).all()
print('KẾT LUẬN:', 'ĐẠT' if ok else 'KHÔNG ĐẠT')
sys.exit(0 if ok else 1)
