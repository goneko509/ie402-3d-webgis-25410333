"""Kiểm thử tự động API WebGIS (đặc tả mục 4 - 6). Chạy khi server ở chế độ kiểm thử: npm run start:test (cổng 3002, pool 1 kết nối).

Chạy bằng Python trong d:/0. UIT/HK3/.venv (cần requests):  python tests/kiem_thu_api.py [http://localhost:3002/api]
Mọi cây thêm trong lúc kiểm thử đều bị xóa ở cuối; dữ liệu sau kiểm thử phải còn 333 cây.
"""
import sys

import requests

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3002/api'
MK = 'Demo@2026'   # mật khẩu tài khoản demo (script db/10)
kq = []


def check(ma, ten, dieu_kien, thuc_te=''):
    kq.append((ma, ten, 'Đạt' if dieu_kien else 'KHÔNG ĐẠT', thuc_te))


def get(path, **kw):
    return requests.get(BASE + path, timeout=30, **kw)


def phien_trong():
    return get('/_kiem-thu/phien').json()['ma_tk'] is None


def dang_nhap(ten, mk=MK):
    return requests.post(BASE + '/dang-nhap', json={'ten_dang_nhap': ten, 'mat_khau': mk}, timeout=30)


def cay_moi(x, y, **kw):
    body = {'ma_loai': 1, 'chieu_cao': 8.5, 'ban_kinh_tan': 3.2, 'dbh': 18.0, 'ngay_trong': '2021-03-15', 'x': x, 'y': y}
    body.update(kw)
    return body


# ---------- Đọc ----------
r = get('/health'); check('D1', 'GET /health', r.status_code == 200 and r.json()['csdl']['so_cay'] == 333, r.text[:80])
r = get('/khu-vuc'); f = r.json()['features']
check('D2', 'GET /khu-vuc: 5 khu, có hình học, crs EPSG:3405', r.status_code == 200 and len(f) == 5 and f[0]['geometry']['type'] in ('Polygon', 'MultiPolygon') and r.json()['crs'] == 'EPSG:3405', f'{len(f)} khu')
r = get('/loai-cay'); check('D3', 'GET /loai-cay: 4 loài', r.status_code == 200 and len(r.json()) == 4, f'{len(r.json())} loài')
r = get('/cay', params={'q': '14'}); p = r.json()['features'][0]['properties']
check('D4', 'Tìm theo mã cây 14', len(r.json()['features']) == 1 and p['ten_loai'] == 'Me tây' and p['ma_khu_vuc'] == 2, f"{p['ten_loai']}, khu {p['ma_khu_vuc']}")
n_ten = len(get('/cay', params={'q': 'Me tây'}).json()['features']); n_loai = len(get('/cay', params={'loai': 4}).json()['features'])
check('D5', 'Tìm theo tên loài "Me tây" = số cây mã loài 4', n_ten == n_loai > 0, f'{n_ten} = {n_loai}')
check('D6', 'GET /cay/999999 -> 404; /cay/abc -> 400', get('/cay/999999').status_code == 404 and get('/cay/abc').status_code == 400)
nt, nd, nr = (len(get(f'/lop-nen/{l}').json()['features']) for l in ('toa-nha', 'duong', 'ranh-gioi'))
check('D7', 'Lớp nền: 716 tòa nhà, 2486 đường, 1 ranh giới', (nt, nd, nr) == (716, 2486, 1), f'{nt}, {nd}, {nr}')
nb = len(get('/lop-nen/toa-nha', params={'bbox': '696000,1202600,696500,1203100'}).json()['features'])
check('D8', 'Lọc tòa nhà theo bbox; bbox sai -> 400; lớp lạ -> 404', 0 < nb < 716 and get('/lop-nen/toa-nha', params={'bbox': '1,2,3'}).status_code == 400 and get('/lop-nen/abc').status_code == 404, f'{nb} tòa nhà trong bbox')
tk = get('/thong-ke').json(); tong = tk[-1]
check('D9', 'Thống kê: 5 khu + toàn vùng (333 cây, che phủ ~0,485 %)', len(tk) == 6 and tong['ma_khu_vuc'] is None and tong['so_cay'] == 333 and abs(tong['ty_le_che_phu'] - 0.485) < 0.01, f"{tong['so_cay']} cây, {tong['ty_le_che_phu']} %")
check('D10', 'Thống kê một khu (?khu=3)', len(get('/thong-ke', params={'khu': 3}).json()) == 1)

# ---------- Đăng nhập ----------
r = dang_nhap('ttb', 'sai-mat-khau'); check('A1', 'Đăng nhập sai mật khẩu -> 401', r.status_code == 401, r.json().get('loi', ''))
check('A2', 'Phiên trống sau đăng nhập thất bại', phien_trong())
r = dang_nhap('ttb'); tk_ttb = r.json()
khu = [k['ma_khu_vuc'] for k in tk_ttb['tai_khoan']['khu_phu_trach']]
check('A3', 'Đăng nhập ttb -> token, phụ trách khu 2 và 5', r.status_code == 200 and tk_ttb['token'] and khu == [2, 5], f'khu {khu}')
check('A4', 'Phiên trống sau đăng nhập thành công', phien_trong())
H = {'Authorization': 'Bearer ' + tk_ttb['token']}

# ---------- Thêm / sửa / xóa ----------
p14 = get('/cay/14').json()['geometry']['coordinates']          # cây 14 thuộc khu 2
x2, y2 = p14[0] + 3, p14[1] + 3
check('G1', 'Thêm cây không có token -> 401', requests.post(BASE + '/cay', json=cay_moi(x2, y2), timeout=30).status_code == 401)
check('G2', 'Token giả mạo -> 401', requests.post(BASE + '/cay', json=cay_moi(x2, y2), headers={'Authorization': 'Bearer abc.def.ghi'}, timeout=30).status_code == 401)
r = requests.post(BASE + '/cay', json=cay_moi(x2, y2), headers=H, timeout=30); moi = r.json() if r.status_code == 201 else {}
ma_moi = moi.get('id'); pm = moi.get('properties', {})
check('G3', 'ttb thêm cây ở khu 2 -> 201, khu tự gán = 2, có cao độ Z', r.status_code == 201 and pm.get('ma_khu_vuc') == 2 and pm.get('z') is not None, f"mã {ma_moi}, khu {pm.get('ma_khu_vuc')}, z {pm.get('z')}")
check('G4', 'Phiên trống sau thêm thành công', phien_trong())
r = requests.put(BASE + f'/cay/{ma_moi}', json={'chieu_cao': 9}, headers=H, timeout=30)
check('G5', 'Sửa chiều cao -> 200, 9,0 m', r.status_code == 200 and r.json()['properties']['chieu_cao'] == 9.0)
z_cu = r.json()['properties']['z']
r = requests.put(BASE + f'/cay/{ma_moi}', json={'x': x2 + 2, 'y': y2 - 2}, headers=H, timeout=30)
check('G6', 'Dời vị trí trong khu 2 -> 200, tọa độ và Z cập nhật', r.status_code == 200 and abs(r.json()['geometry']['coordinates'][0] - (x2 + 2)) < 0.01, f"z {z_cu} -> {r.json()['properties']['z']}")
r = requests.delete(BASE + f'/cay/{ma_moi}', headers=H, timeout=30)
check('G7', 'Xóa cây vừa thêm -> 204, sau đó 404', r.status_code == 204 and get(f'/cay/{ma_moi}').status_code == 404)

c1 = get('/cay', params={'khu': 1}).json()['features'][0]          # một cây ở khu 1 (người quản lý khác)
x1, y1 = c1['geometry']['coordinates'][0] + 3, c1['geometry']['coordinates'][1] + 3
r = requests.post(BASE + '/cay', json=cay_moi(x1, y1), headers=H, timeout=30)
check('G8', 'ttb thêm cây ở khu 1 -> 403', r.status_code == 403, r.json().get('loi', ''))
check('G9', 'Phiên trống sau khi trigger từ chối (kết nối dùng lại an toàn)', phien_trong())
r = requests.put(BASE + f"/cay/{c1['id']}", json={'chieu_cao': c1['properties']['chieu_cao'] + 1}, headers=H, timeout=30)
check('G10', f"ttb sửa cây {c1['id']} ở khu 1 -> 403", r.status_code == 403)
r = requests.post(BASE + '/cay', json=cay_moi(690000, 1199000), headers=H, timeout=30)
check('G11', 'Thêm cây ngoài vùng nghiên cứu -> 422', r.status_code == 422, r.json().get('loi', ''))
r = requests.post(BASE + '/cay', json=cay_moi(x2, y2, dbh=0), headers=H, timeout=30)
check('G12', 'DBH = 0 -> 400, nêu ràng buộc ck_cay_xanh_dbh', r.status_code == 400 and r.json().get('chi_tiet', {}).get('rang_buoc') == 'ck_cay_xanh_dbh', str(r.json().get('chi_tiet')))
r = requests.post(BASE + '/cay', json=cay_moi(x2, y2, ma_khu_vuc=1), headers=H, timeout=30)
check('G13', 'Gửi kèm ma_khu_vuc -> 400 (khu do hệ thống gán)', r.status_code == 400)
r = requests.post(BASE + '/cay', json=cay_moi(x2, y2, ngay_trong='2099-01-01'), headers=H, timeout=30)
check('G14', 'Ngày trồng ở tương lai -> 400 (ck_cay_xanh_ngay_trong)', r.status_code == 400 and r.json().get('chi_tiet', {}).get('rang_buoc') == 'ck_cay_xanh_ngay_trong')

# Tài khoản kỹ thuật (không gắn người quản lý) không bị giới hạn khu
Ha = {'Authorization': 'Bearer ' + dang_nhap('admin').json()['token']}
# B1: gốc cây trong nền tòa nhà -> 422 / 50103 (trigger trg_cay_xanh_ngoai_toa_nha, script db/25). Lỡ tạo được (chưa chạy
# script 25) thì xóa ngay để không để lại cây trong nhà.
def _trong_vong(x, y, r):
    c = False
    for i in range(len(r)):
        (x1, y1), (x2, y2) = r[i - 1][:2], r[i][:2]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
_khu = [(_k['geometry']['coordinates'] if _k['geometry']['type'] == 'Polygon' else _k['geometry']['coordinates'][0])[0] for _k in get('/khu-vuc').json()['features']]
_nha = None
for _f in get('/lop-nen/toa-nha').json()['features']:
    _g = _f['geometry']; _r = (_g['coordinates'] if _g['type'] == 'Polygon' else _g['coordinates'][0])[0]
    _x = (min(p[0] for p in _r) + max(p[0] for p in _r)) / 2; _y = (min(p[1] for p in _r) + max(p[1] for p in _r)) / 2
    if all(_trong_vong(_x + dx, _y + dy, _r) for dx, dy in ((3, 0), (-3, 0), (0, 3), (0, -3))) and any(_trong_vong(_x, _y, k) for k in _khu):
        _nha = (_x, _y); break
r = requests.post(BASE + '/cay', json=cay_moi(*_nha), headers=Ha, timeout=30)
if r.status_code == 201:
    requests.delete(BASE + f"/cay/{r.json()['id']}", headers=Ha, timeout=30)
check('B1', 'Gốc cây nằm trong nền tòa nhà -> 422, mã 50103 (kể cả tài khoản kỹ thuật)',
      r.status_code == 422 and r.json().get('chi_tiet', {}).get('sql_error') == 50103, f'{r.status_code} {r.json().get("loi", "")}')
r = requests.post(BASE + '/cay', json=cay_moi(x1, y1), headers=Ha, timeout=30)
ok = r.status_code == 201 and r.json()['properties']['ma_khu_vuc'] == 1
if r.status_code == 201:
    requests.delete(BASE + f"/cay/{r.json()['id']}", headers=Ha, timeout=30)
check('G15', 'Tài khoản kỹ thuật admin thêm/xóa cây ở khu 1 -> 201/204', ok)

# ---------- UC07: phân tích cây có nguy cơ ảnh hưởng công trình (sp_cay_nguy_co_cong_trinh) ----------
pt = get('/phan-tich/cay-nguy-co').json()
yeu = all(r['tinh_trang'] in ('Suy yếu', 'Nguy hiểm') for r in pt)
trong_tam = all((r['kc_nha'] is not None and r['kc_nha'] <= r['tam_do'] + 0.01) or (r['kc_duong'] is not None and r['kc_duong'] <= r['tam_do'] + 0.01) for r in pt)
# Vùng ngã đổ mặc định 1,5 x H; mức theo vùng mục tiêu ISA của đối tượng gần nhất: trong tán -> Cao, <= 1 x H -> Trung bình,
# <= 1,5 x H -> Thấp. Xếp Cao -> Trung bình -> Thấp, trong cùng mức chỉ số (1 - gần nhất / tầm đổ) giảm dần.
HANG = {'Cao': 0, 'Trung bình': 1, 'Thấp': 2}
gan = lambda r: min(x for x in (r['kc_nha'], r['kc_duong']) if x is not None)
muc = lambda r: 'Cao' if gan(r) <= r['ban_kinh_tan'] + 0.005 else 'Trung bình' if gan(r) <= r['chieu_cao'] + 0.005 else 'Thấp'
xep = all((HANG[pt[i]['muc_nguy_hiem']], -pt[i]['muc_do_nguy_hiem']) <= (HANG[pt[i + 1]['muc_nguy_hiem']], -pt[i + 1]['muc_do_nguy_hiem']) for i in range(len(pt) - 1))
dung_cs = all(abs(r['tam_do'] - 1.5 * r['chieu_cao']) < 0.01 and abs(r['muc_do_nguy_hiem'] - (1 - gan(r) / r['tam_do'])) < 0.002 and r['muc_nguy_hiem'] == muc(r) for r in pt)
xa = all(r['kc_xa_nhat'] >= min(x for x in (r['kc_nha'], r['kc_duong']) if x is not None) - 0.01 and r['kc_xa_nhat'] <= r['tam_do'] + 0.01 and r['so_toa_nha'] + r['so_doan_duong'] >= 1 for r in pt)
check('P1', 'Phân tích nguy cơ (mặc định 1,5 x H): chỉ cây Suy yếu/Nguy hiểm, có nhà hoặc đường trong vùng ngã đổ, xếp Cao -> Thấp', len(pt) > 0 and yeu and trong_tam and xep, f'{len(pt)} cây')
check('P5', 'Tầm đổ = 1,5 x H; mức theo vùng ISA (trong tán / 1H / 1,5H) của đối tượng gần nhất; chỉ số = 1 - gần nhất/tầm đổ; phạm vi ảnh hưởng: xa nhất trong [gần nhất, tầm đổ], ít nhất 1 đối tượng', dung_cs and xa)
n05, n10 = (len(get('/phan-tich/cay-nguy-co', params={'he_so': k}).json()) for k in (0.5, 1.0))
check('P2', 'Tầm đổ tăng thì số cây không giảm (k = 0,5 / 1 / 1,5 mặc định)', n05 <= n10 <= len(pt), f'{n05} <= {n10} <= {len(pt)}')
p5 = get('/phan-tich/cay-nguy-co', params={'khu': 5}).json()
check('P3', 'Lọc theo khu 5: mọi cây thuộc khu 5, là tập con của toàn vùng', all(r['ma_khu_vuc'] == 5 for r in p5) and {r['ma_cay'] for r in p5} <= {r['ma_cay'] for r in pt}, f'{len(p5)} cây')
bt = get('/cay', params={'q': ''}).json()['features']
ma_bt = {f['properties']['ma_cay'] for f in bt if f['properties']['tinh_trang'] == 'Bình thường'}
check('P6', 'Cây Bình thường KHÔNG được gán mức độ nguy hiểm (kể cả k = 1,5); tham số tat_ca đã bỏ -> 400',
      not ({r['ma_cay'] for r in get('/phan-tich/cay-nguy-co', params={'he_so': 1.5}).json()} & ma_bt)
      and get('/phan-tich/cay-nguy-co', params={'tat_ca': 1}).status_code == 400, f'{len(ma_bt)} cây Bình thường')
check('P4', 'Tham số sai (he_so = 2, khu = abc) -> 400', get('/phan-tich/cay-nguy-co', params={'he_so': 2}).status_code == 400 and get('/phan-tich/cay-nguy-co', params={'khu': 'abc'}).status_code == 400)

# ---------- Khôi phục dữ liệu mặc định: chỉ kiểm tra quyền và xem trước (không thực hiện, tránh xóa dữ liệu đang thử) ----------
check('R1', 'Khôi phục: không token -> 401; người quản lý ttb (xem trước / thực hiện) -> 403',
      get('/khoi-phuc').status_code == 401 and get('/khoi-phuc', headers=H).status_code == 403
      and requests.post(BASE + '/khoi-phuc', headers=H, timeout=30).status_code == 403)
xt = get('/khoi-phuc', headers=Ha)
check('R2', 'Khôi phục: admin xem trước -> 200, có số liệu tóm tắt', xt.status_code == 200 and {'so_xoa_cay_them', 'so_hoan_tac_sua', 'so_phuc_hoi_cay_xoa', 'chi_tiet'} <= set(xt.json()), str({k: v for k, v in xt.json().items() if k != 'chi_tiet'}))

nk = get('/nhat-ky', params={'gioi_han': 5}, headers=Ha)
check('N1', 'Nhật ký: ttb -> 403; admin -> 200, mỗi mục có thao tác, tài khoản, giá trị cũ/mới, cờ hoàn tác',
      get('/nhat-ky', headers=H).status_code == 403 and nk.status_code == 200
      and all({'ma_nk', 'ma_cay', 'thao_tac', 'gia_tri_cu', 'gia_tri_moi', 'co_the_hoan_tac'} <= set(x) for x in nk.json()), f'{len(nk.json())} mục')
check('N2', 'Hoàn tác: ttb -> 403; mã nhật ký không tồn tại -> 404',
      requests.post(BASE + '/nhat-ky/1/hoan-tac', headers=H, timeout=30).status_code == 403
      and requests.post(BASE + '/nhat-ky/999999999/hoan-tac', headers=Ha, timeout=30).status_code == 404)

r = get('/health'); check('K1', 'Dữ liệu sau kiểm thử vẫn 333 cây', r.json()['csdl']['so_cay'] == 333, str(r.json()['csdl']['so_cay']))
check('K2', 'Phiên trống cuối cùng', phien_trong())

w = max(len(t) for _, t, _, _ in kq)
for ma, ten, ketqua, tt in kq:
    print(f'{ma:<4} {ten:<{w}}  {ketqua:<9} {tt}')
dat = sum(1 for k in kq if k[2] == 'Đạt')
print(f'\nTỔNG: {dat}/{len(kq)} Đạt')
sys.exit(0 if dat == len(kq) else 1)
