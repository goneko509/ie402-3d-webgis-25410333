# Tạo các sơ đồ tuần tự (mỗi UC một file .drawio) trong imgs/diagrams/sequence (mục 228 file thảo luận).
#  1) TÁCH 6 kịch bản có sẵn (trang "UC01 Sequence Diagram" của DFD.drawio) thành file riêng, dời về gốc tọa độ; đổi tác nhân
#     "Quản trị viên" -> "Người quản lý khu" (3 tác nhân, mục 227); kịch bản 5 thành UC05.1 Thêm cây.
#  2) SINH sơ đồ mới cho UC05.2, UC05.3, UC05.4, UC07, UC08, UC09, UC10, UC11 cùng phong cách (lifeline, thanh kích hoạt,
#     thông điệp đồng bộ / trả về, khung alt / opt / loop, ghi chú tiền điều kiện).
# Mặc định KHÔNG ghi đè file .drawio đã có (giữ phần đã sửa tay trong draw.io); tạo lại bằng: python tao_sequence.py --ghi-de
# Xuất PDF: bash xuat_pdf.sh.
import os, re, html, sys
GHI_DE = '--ghi-de' in sys.argv
import xml.etree.ElementTree as ET

THU_MUC = os.path.dirname(os.path.abspath(__file__))
NGUON = os.path.join(THU_MUC, '..', 'DFD.drawio')
esc = lambda t: html.escape(t, quote=True)


def ghi_file(ten, cells_xml, w, h):
    noi_dung = (f'<mxfile host="Electron"><diagram id="{ten}" name="{ten}"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" '
                f'tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{int(w)}" pageHeight="{int(h)}" math="0" shadow="0">'
                '<root><mxCell id="0" /><mxCell id="1" parent="0" />' + cells_xml + '</root></mxGraphModel></diagram></mxfile>')
    duong = os.path.join(THU_MUC, ten + '.drawio')
    if os.path.exists(duong) and not GHI_DE:
        print('  bỏ qua (đã có):', ten); return
    with open(duong, 'w', encoding='utf-8') as f:
        f.write(noi_dung)


# ======================= 1) TÁCH KỊCH BẢN CÓ SẴN =======================
def tach_co_san():
    s = open(NGUON, encoding='utf-8').read()
    m = re.search(r'<diagram [^>]*name="UC01 Sequence Diagram"[^>]*>(.*?)</diagram>', s, re.S)
    root = ET.fromstring(m.group(1)).find('root')
    cells = root.findall('mxCell')
    byid = {c.get('id'): c for c in cells}

    def toa_do(c):
        g = c.find('mxGeometry')
        if c.get('edge'):
            p = g.find("mxPoint[@as='sourcePoint']")
            if p is not None:
                return float(p.get('x', 0)), float(p.get('y', 0))
            for k in ('source', 'target'):
                if c.get(k) and c.get(k) in byid:
                    return toa_do(byid[c.get(k)])
            return None
        par = c.get('parent')
        if par not in ('1', None) and par in byid:
            return toa_do(byid[par])
        if g is None:
            return None
        return float(g.get('x', 0) or 0), float(g.get('y', 0) or 0)

    def vung(xy):
        if not xy:
            return None
        x, y = xy
        if y < 820: return 'K1'
        if y < 1400: return 'K2' if x < 1000 else 'K3'
        if y < 2160: return 'K4' if x < 1000 else 'K5'
        return 'K6'

    nhom = {}
    for c in cells:
        if c.get('id') in ('0', '1'):
            continue
        k = vung(toa_do(c))
        if k:
            nhom.setdefault(k, []).append(c)

    TEN = {'K1': 'UC01_XemBanDo3D', 'K2': 'UC02_TraCuuCay', 'K3': 'UC03_ThongKe', 'K4': 'UC04_BatTatLop',
           'K5': 'UC05_1_ThemCay', 'K6': 'UC06_DangNhap'}
    for k, ds in nhom.items():
        # khung bao (đỉnh tuyệt đối mức trên cùng) để dời về gốc (20, 20)
        xs, ys, x2, y2 = [], [], [], []
        for c in ds:
            g = c.find('mxGeometry')
            if c.get('parent') == '1' and not c.get('edge') and g is not None:
                x, y = float(g.get('x', 0) or 0), float(g.get('y', 0) or 0)
                xs.append(x); ys.append(y); x2.append(x + float(g.get('width', 0) or 0)); y2.append(y + float(g.get('height', 0) or 0))
        dx, dy = 20 - min(xs), 20 - min(ys)
        out = []
        for c in ds:
            c2 = ET.fromstring(ET.tostring(c))
            g = c2.find('mxGeometry')
            if c2.get('parent') == '1' and g is not None:
                if c2.get('edge'):
                    for p in g.iter('mxPoint'):
                        if p.get('x') is not None: p.set('x', str(float(p.get('x')) + dx))
                        if p.get('y') is not None: p.set('y', str(float(p.get('y')) + dy))
                else:
                    g.set('x', str(float(g.get('x', 0) or 0) + dx)); g.set('y', str(float(g.get('y', 0) or 0) + dy))
            v = c2.get('value')
            if v:
                v = v.replace('Quản trị viên', 'Người quản lý khu')
                v = v.replace('Kịch bản 5 – Thêm/sửa/xóa cây xanh (UC05), luồng Thêm', 'Kịch bản UC05.1 – Thêm cây')
                v = v.replace('Kịch bản 6 – Đăng nhập (UC06)', 'Kịch bản UC06 – Đăng nhập')
                v = re.sub(r'Kịch bản ([1-4]) – (.*) \((UC0\d)\)', r'Kịch bản \3 – \2', v)
                c2.set('value', v)
            out.append(ET.tostring(c2, encoding='unicode'))
        ghi_file(TEN[k], ''.join(out), max(x2) + dx + 40, max(y2) + dy + 40)
        print('tách', TEN[k], len(ds), 'phần tử')


# ======================= 2) SINH SƠ ĐỒ MỚI =======================
LIFE = 'shape=umlLifeline;fillColor=#dae8fc;strokeColor=#333333;fontColor=#000000;fontFamily=Helvetica;fontSize=14;fontStyle=1;size=40;'
ACTOR = 'shape=umlLifeline;participant=umlActor;fillColor=none;strokeColor=#000000;fontColor=#000000;fontFamily=Helvetica;fontSize=14;fontStyle=1;size=50;verticalLabelPosition=top;verticalAlign=bottom;labelPosition=center;align=center;'   # tên tác nhân ở TRÊN hình người
ACT = 'html=1;fillColor=#dae8fc;strokeColor=#333333;strokeWidth=1;'
MSG = 'html=1;edgeStyle=none;endArrow=block;labelBackgroundColor=#ffffff;fontFamily=Helvetica;fontSize=13;'
RET = 'html=1;edgeStyle=none;endArrow=open;dashed=1;labelBackgroundColor=#ffffff;fontFamily=Helvetica;fontSize=13;'
SELF = 'html=1;edgeStyle=none;endArrow=block;rounded=0;fontFamily=Helvetica;fontSize=13;'
TXT = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontFamily=Helvetica;fontSize=13;whiteSpace=wrap;'
GUARD = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontFamily=Helvetica;fontSize=13;fontStyle=2;'
FRAME = 'shape=umlFrame;whiteSpace=wrap;html=1;width=45;height=25;fontStyle=1;fontFamily=Helvetica;fontSize=13;fillColor=none;strokeColor=#333333;'
SEP = 'endArrow=none;dashed=1;html=1;strokeColor=#333333;'
NOTE = 'shape=note;whiteSpace=wrap;html=1;size=14;fillColor=#fff2cc;strokeColor=#333333;fontFamily=Helvetica;fontSize=13;align=left;spacingLeft=6;'
TITLE = 'text;html=1;fontStyle=1;fontSize=14;fontFamily=Helvetica;align=left;'


def sinh(ten, tieu_de, tac_nhan, thanh_phan, buoc, ghi_chu=None):
    """thanh_phan: danh sách tên lifeline (sau tác nhân). buoc: ('m'|'r', i, j, nhãn), ('s', i, nhãn), ('f', loại, [(điều kiện, [bước])...])."""
    cot = [('A', tac_nhan, 90, 40)]
    x = 430                                     # khoảng tác nhân - Giao diện rộng: nhãn thông điệp dài không che mũi tên
    for t in thanh_phan:
        w = max(110, 9 * len(t) + 20)
        cot.append(('P', t, x + w / 2, w)); x += w + 260
    cx = [c[2] for c in cot]
    rong = max(x, cx[-1] + 46 + 420 + 30)        # chừa chỗ nhãn tự gọi của cột cuối nằm trong khung
    cells, n = [], [0]
    def id_():
        n[0] += 1; return f'{ten}-{n[0]}'
    def v(val, style, x, y, w, h):
        cells.append(f'<mxCell id="{id_()}" value="{esc(val)}" style="{style}" vertex="1" parent="1"><mxGeometry x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" as="geometry" /></mxCell>')
    def e(val, style, x1, y1, x2, y2, pts=()):
        p = ''.join(f'<mxPoint x="{a:.1f}" y="{b:.1f}" />' for a, b in pts)
        cells.append(f'<mxCell id="{id_()}" value="{esc(val)}" style="{style}" edge="1" parent="1"><mxGeometry relative="1" as="geometry">'
                     f'<mxPoint x="{x1:.1f}" y="{y1:.1f}" as="sourcePoint" /><mxPoint x="{x2:.1f}" y="{y2:.1f}" as="targetPoint" />'
                     + (f'<Array as="points">{p}</Array>' if p else '') + '</mxGeometry></mxCell>')
    hoat = {}                                   # i -> [y đầu, y cuối] để vẽ thanh kích hoạt
    def cham(i, y):
        a = hoat.setdefault(i, [y, y]); a[0] = min(a[0], y); a[1] = max(a[1], y)
    y0 = 150
    def chay(ds, y, muc):
        for b in ds:
            if b[0] in ('m', 'r'):
                _, i, j, nhan = b
                cham(i, y); cham(j, y)
                hx = 5 if cx[j] > cx[i] else -5
                e(nhan, MSG if b[0] == 'm' else RET, cx[i] + hx, y, cx[j] - hx, y)
                y += 42
            elif b[0] == 's':
                _, i, nhan = b
                cham(i, y); cham(i, y + 22)
                e('', SELF, cx[i] + 5, y, cx[i] + 5, y + 22, [(cx[i] + 40, y), (cx[i] + 40, y + 22)])
                v(nhan, TXT, cx[i] + 46, y - 6, 400, 34)
                y += 50
            elif b[0] == 'f':
                _, loai, nhanh = b
                ytren = y
                y += 34
                for k, (dk, con) in enumerate(nhanh):
                    if k > 0:
                        e('', SEP, 30 + 8 * muc, y - 12, rong - 30 - 8 * muc, y - 12); y += 14
                    v(dk, GUARD, cx[0] + 22, (ytren + 2) if k == 0 else (y - 12), 560, 25)   # điều kiện bên phải lifeline tác nhân
                    if k > 0: y += 14
                    y = chay(con, y, muc + 1)
                y += 6
                v(loai, FRAME, 20 + 8 * muc, ytren, rong - 40 - 16 * muc, y - ytren)
                y += 18
        return y
    yend = chay(buoc, y0, 0)
    # lifeline, thanh kích hoạt, tiêu đề, ghi chú
    cao = yend - 50 + 30
    for i, (loai, t, c, w) in enumerate(cot):
        if loai == 'A':
            v(t, ACTOR, c - 20, 80, 40, cao - 20)
        else:
            v(t, LIFE, c - w / 2, 80, w, cao - 20)
        if i in hoat:
            a, b = hoat[i]
            v('', ACT, c - 5, a - 6, 10, b - a + 12)
    v(tieu_de, TITLE, 20, 15, rong - 40, 30)
    yday = 80 + cao
    if ghi_chu:
        v(ghi_chu, NOTE, 20, yday, min(760, rong - 40), 60); yday += 60
    # thanh kích hoạt vẽ SAU lifeline để nằm trên: đưa các ô kích hoạt lên cuối danh sách
    ghi_file(ten, ''.join(cells), rong, yday + 30)
    print('sinh', ten)


GD, BE, DB = 1, 2, 3
TP = ['Giao diện', 'BackEnd', 'CSDL']

def sinh_moi():
    sinh('UC05_2_NhanBanCay', 'Kịch bản UC05.2 – Nhân bản cây', 'Người quản lý khu', TP, [
        ('m', 0, GD, '1. Chọn cây, bấm "Nhân bản"'),
        ('s', GD, '2. Mở biểu mẫu điền sẵn (trừ tình trạng), đánh dấu cây nguồn, làm mờ ngoài khu'),
        ('m', 0, GD, '3. Nhấp vị trí mới trên bản đồ'),
        ('s', GD, '4. Kiểm tra: trong khu, ngoài nền nhà, cách mọi cây ≥ 1 m'),
        ('m', 0, GD, '5. Xem lại thuộc tính, tích "Đã kiểm tra", bấm Lưu'),
        ('m', GD, BE, '6. POST /cay (thuộc tính, x, y)'),
        ('m', BE, DB, '7. INSERT cay_xanh'),
        ('s', DB, '8. Trigger: gán khu, kiểm tra khu phụ trách, ngoài tòa nhà, ghi nhật ký'),
        ('f', 'alt', [('[hợp lệ]', [
            ('r', DB, BE, '9. Ghi thành công (mã cây mới)'),
            ('r', BE, GD, '10. 201 + cây mới'),
            ('r', GD, 0, '11. Thông báo, tải lại cảnh; đặt tiếp')]),
            ('[ngoài khu phụ trách / trong tòa nhà]', [
            ('r', DB, BE, "9'. Báo lỗi, hoàn tác"),
            ('r', BE, GD, "10'. 403 / 422"),
            ('r', GD, 0, "11'. Hiện lỗi trong biểu mẫu")])]),
    ], 'Tiền điều kiện: Người quản lý khu đã đăng nhập (UC06, «include»). Cây nguồn có thể thuộc khu bất kỳ (chỉ dùng làm mẫu).')

    sinh('UC05_3_SuaCay', 'Kịch bản UC05.3 – Sửa cây (gồm dời vị trí)', 'Người quản lý khu', TP, [
        ('m', 0, GD, '1. Chọn cây trong khu phụ trách, bấm "Sửa"'),
        ('s', GD, '2. Đóng cửa sổ, mở biểu mẫu ở sidebar (giá trị hiện tại), đánh dấu cây, làm mờ ngoài khu'),
        ('f', 'loop', [('[dời vị trí (tùy chọn), nhấp bao nhiêu lần tùy ý]', [
            ('m', 0, GD, '3. Nhấp vị trí mới'),
            ('s', GD, '4. Kiểm tra trong khu, ngoài nền nhà, cách cây khác ≥ 1 m; đặt ghim')])]),
        ('m', 0, GD, '5. Sửa thuộc tính, bấm Lưu'),
        ('m', GD, BE, '6. PUT /cay/{ma} (thuộc tính, [x, y])'),
        ('m', BE, DB, '7. UPDATE cay_xanh'),
        ('s', DB, '8. Trigger: gán khu (nếu dời), kiểm tra quyền, ngoài tòa nhà, ghi nhật ký cũ → mới'),
        ('f', 'alt', [('[hợp lệ]', [
            ('r', DB, BE, '9. Ghi thành công'),
            ('r', BE, GD, '10. Cây đã cập nhật'),
            ('r', GD, 0, '11. Tải lại cảnh, mở lại cửa sổ cây')]),
            ('[vi phạm quyền / vị trí]', [
            ('r', DB, BE, "9'. Báo lỗi, hoàn tác"),
            ('r', BE, GD, "10'. 403 / 422"),
            ('r', GD, 0, "11'. Hiện lỗi trong biểu mẫu")])]),
    ], 'Tiền điều kiện: đã đăng nhập (UC06). Hủy: thoát biểu mẫu, mở lại cửa sổ cây; "Về vị trí cũ" bỏ vị trí mới và ghim.')

    sinh('UC05_4_XoaCay', 'Kịch bản UC05.4 – Xóa cây', 'Người quản lý khu', TP, [
        ('m', 0, GD, '1. Chọn cây trong khu phụ trách, bấm "Xóa"'),
        ('s', GD, '2. Hỏi xác nhận ngay trong cửa sổ thông tin'),
        ('m', 0, GD, '3. Xác nhận xóa'),
        ('m', GD, BE, '4. DELETE /cay/{ma}'),
        ('m', BE, DB, '5. DELETE cay_xanh'),
        ('s', DB, '6. Trigger: kiểm tra khu phụ trách, ghi nhật ký'),
        ('f', 'alt', [('[được phép]', [
            ('r', DB, BE, '7. Xóa thành công'),
            ('r', BE, GD, '8. 204'),
            ('r', GD, 0, '9. Đóng cửa sổ, tải lại cảnh, thông báo "Đã xóa"')]),
            ('[không thuộc khu phụ trách]', [
            ('r', DB, BE, "7'. Báo lỗi, hoàn tác"),
            ('r', BE, GD, "8'. 403"),
            ('r', GD, 0, "9'. Hiện lỗi trong cửa sổ")])]),
    ], 'Tiền điều kiện: đã đăng nhập (UC06).')

    sinh('UC07_PhanTichNguyCo', 'Kịch bản UC07 – Phân tích nguy cơ ngã đổ (vùng 1,5 × H, vùng mục tiêu ISA)', 'Người dùng', TP, [
        ('m', GD, BE, '1. GET /phan-tich/cay-nguy-co (nạp sẵn)'),
        ('m', BE, DB, '2. EXEC sp_cay_nguy_co_cong_trinh (he_so = 1,5)'),
        ('s', DB, '3. Cây Suy yếu / Nguy hiểm có nhà / đường trong 1,5 × H; mức theo đối tượng gần nhất: trong tán / 1 × H / 1,5 × H'),
        ('r', DB, BE, '4. Kết quả toàn vùng'),
        ('r', BE, GD, '5. Danh sách (lưu kho phía trình duyệt)'),
        ('m', 0, GD, '6. Bấm "Phân tích" hoặc bật lớp "Vùng ngã đổ"'),
        ('s', GD, '7. Bỏ chọn loài / tình trạng; lọc kho theo khu đang xem; vẽ vòng 1H, 1,5H; tô nhà, đường'),
        ('r', GD, 0, '8. Danh sách mức, vòng trên bản đồ'),
        ('f', 'opt', [('[đổi khu khi lớp đang bật]', [
            ('m', 0, GD, '9. Chọn khu khác'),
            ('s', GD, '10. Vẽ lại từ kho (không gọi API)')])]),
    ], 'Bước 1–5: nạp sẵn ngầm một lần sau khi tải cảnh (UC01). Kho được nạp lại khi dữ liệu cây thay đổi (thêm / sửa / xóa / khôi phục / hoàn tác). "Ẩn" = tắt lớp Vùng ngã đổ (UC04).')

    sinh('UC08_LocCay', 'Kịch bản UC08 – Lọc cây theo thuộc tính', 'Người dùng', ['Giao diện'], [
        ('m', 0, GD, '1. Chọn điều kiện: loài, H, R, DBH, ngày trồng, tình trạng'),
        ('s', GD, '2. Tạo biểu thức lọc (definitionExpression) cho các lớp cây'),
        ('s', GD, '3. Đếm số cây còn hiện'),
        ('r', GD, 0, '4. Cây thỏa điều kiện, số cây hiện'),
        ('f', 'opt', [('[Xóa lọc / Đặt lại]', [
            ('m', 0, GD, '5. Bấm "Xóa lọc" hoặc "Đặt lại"'),
            ('r', GD, 0, '6. Hiện lại toàn bộ cây')])]),
    ], 'Dữ liệu cây đã tải ở UC01. Bị khóa khi đang xem theo loài / tình trạng (UC09); dùng lại được sau "Đặt lại".')

    sinh('UC09_TheoLoaiTinhTrang', 'Kịch bản UC09 – Xem theo loài và tình trạng cây', 'Người dùng', ['Giao diện'], [
        ('m', 0, GD, '1. Bấm loài (Chú giải / Thống kê) hoặc tình trạng (Thống kê)'),
        ('s', GD, '2. Lần đầu: xóa và khóa Lọc cây (UC08)'),
        ('s', GD, '3. Làm mờ cây không thỏa (loài VÀ tình trạng)'),
        ('s', GD, '4. Có chọn loài: mở cửa sổ thông tin loài; cập nhật hộp bối cảnh'),
        ('f', 'opt', [('[đang xem toàn vùng]', [
            ('s', GD, '5. Tìm khu có nhiều cây thỏa nhất, tô viền khu, căn cụm cây vừa khít')])]),
        ('r', GD, 0, '6. Bản đồ, cửa sổ loài, thống kê đồng bộ'),
        ('f', 'opt', [('[Đặt lại]', [
            ('m', 0, GD, '7. Bấm "Đặt lại"'),
            ('s', GD, '8. Bỏ chọn, mở khóa Lọc cây; giữ khu và camera')])]),
    ], 'Dữ liệu cây đã tải ở UC01. Nhấp bản đồ, đóng cửa sổ, đổi khu KHÔNG bỏ chọn; chỉ "Đặt lại" (hoặc Phân tích, UC07).')

    sinh('UC10_KhoiPhucMacDinh', 'Kịch bản UC10 – Khôi phục dữ liệu mặc định', 'Quản trị hệ thống', TP, [
        ('m', 0, GD, '1. Bấm "Khôi phục DL mặc định"'),
        ('m', GD, BE, '2. GET /khoi-phuc (xem trước)'),
        ('m', BE, DB, '3. EXEC sp_khoi_phuc_mac_dinh @thuc_hien = 0'),
        ('r', DB, BE, '4. Các thay đổi của người quản lý'),
        ('r', BE, GD, '5. Bản xem trước'),
        ('r', GD, 0, '6. Số cây sẽ xóa / hoàn tác / phục hồi'),
        ('f', 'alt', [('[xác nhận]', [
            ('m', 0, GD, '7. Xác nhận khôi phục'),
            ('m', GD, BE, '8. POST /khoi-phuc'),
            ('m', BE, DB, '9. EXEC sp_khoi_phuc_mac_dinh @thuc_hien = 1'),
            ('s', DB, '10. Kiểm tra tài khoản kỹ thuật; hoàn tác thay đổi của người quản lý, giữ thay đổi của admin'),
            ('r', DB, BE, '11. Kết quả'),
            ('r', BE, GD, '12. Số cây đã xử lý'),
            ('r', GD, 0, '13. Tải lại cảnh, thông báo')]),
            ('[hủy]', [('m', 0, GD, "7'. Đóng hộp")])]),
    ], 'Tiền điều kiện: đăng nhập tài khoản kỹ thuật (UC06, «include»). Không phải admin: lỗi 50401 (403).')

    sinh('UC11_NhatKyHoanTac', 'Kịch bản UC11 – Xem nhật ký và hoàn tác thay đổi', 'Quản trị hệ thống', TP, [
        ('m', 0, GD, '1. Mở thẻ "Nhật ký thay đổi" (trong hộp Khôi phục, UC10)'),
        ('m', GD, BE, '2. GET /nhat-ky'),
        ('m', BE, DB, '3. Truy vấn nhat_ky_cay'),
        ('r', DB, BE, '4. Nhật ký (giá trị cũ → mới)'),
        ('r', BE, GD, '5. Danh sách'),
        ('r', GD, 0, '6. Hiển thị nhật ký'),
        ('m', 0, GD, '7. Bấm "Hoàn tác" một mục'),
        ('m', GD, BE, '8. POST /nhat-ky/{ma_nk}/hoan-tac'),
        ('m', BE, DB, '9. EXEC sp_hoan_tac_nhat_ky'),
        ('s', DB, '10. Kiểm tra admin, chỉ thay đổi mới nhất của cây, áp giá trị cũ'),
        ('f', 'alt', [('[hợp lệ]', [
            ('r', DB, BE, '11. Thành công'),
            ('r', BE, GD, '12. Kết quả'),
            ('r', GD, 0, '13. Tải lại cảnh, thông báo')]),
            ('[không tìm thấy / không phải thay đổi mới nhất / không có giá trị cũ]', [
            ('r', DB, BE, "11'. Lỗi 50402 – 50405"),
            ('r', BE, GD, "12'. 404 / 409"),
            ('r', GD, 0, "13'. Hiện lỗi")])]),
    ], 'Tiền điều kiện: đăng nhập tài khoản kỹ thuật (UC06).')


def sinh_cap_nhat():
    """Vẽ lại 6 sơ đồ có sẵn (UC01-UC04, UC05.1, UC06) theo luồng hiện tại (mục 239); bản tách cũ lưu backup/sequence_tach_cu."""
    global GHI_DE
    cu, GHI_DE = GHI_DE, True
    sinh('UC01_XemBanDo3D', 'Kịch bản UC01 – Xem bản đồ 3D cây xanh', 'Người dùng', TP, [
        ('m', 0, GD, '1. Mở ứng dụng'),
        ('m', GD, BE, '2. GET /khu-vuc, /cay, /lop-nen/{toa-nha, duong, ranh-gioi}, /loai-cay, /thong-ke'),
        ('m', BE, DB, '3. Truy vấn bảng không gian, sp_thong_ke_che_phu'),
        ('r', DB, BE, '4. Dữ liệu (EPSG:3405)'),
        ('r', BE, GD, '5. GeoJSON, danh mục loài, thống kê'),
        ('s', GD, '6. Dựng SceneView local: tòa nhà đùn theo chiều cao; cây = thân trụ + tán theo H, R; tô màu theo loài'),
        ('s', GD, '7. Căn toàn vùng nghiên cứu vừa khít phần bản đồ trống (gán cho nút Home)'),
        ('r', GD, 0, '8. Cảnh 3D, Chú giải loài cây, hộp bối cảnh'),
        ('f', 'loop', [('[điều hướng]', [
            ('m', 0, GD, '9. Xoay, phóng to / thu nhỏ, di chuyển; Home'),
            ('r', GD, 0, '10. Cảnh 3D theo góc nhìn mới')])]),
    ], 'Dữ liệu tải một lần và dùng lại cho UC02 – UC04, UC08, UC09. Mất kết nối: hiển thị thông báo lỗi.')

    sinh('UC02_TraCuuCay', 'Kịch bản UC02 – Tra cứu thông tin cây', 'Người dùng', TP, [
        ('f', 'alt', [('[nhấp vào cây trên cảnh 3D]', [
            ('m', 0, GD, '1. Nhấp vào cây'),
            ('s', GD, '2. Xác định cây tại điểm nhấp (lớp cây đã tải)')]),
            ('[tìm theo mã hoặc loài]', [
            ('m', 0, GD, "1'. Nhập mã / tên loài, bấm tìm"),
            ('m', GD, BE, "2'. GET /cay?q="),
            ('m', BE, DB, "3'. Truy vấn cay_xanh, loai_cay"),
            ('r', DB, BE, "4'. Các cây khớp"),
            ('r', BE, GD, "5'. Danh sách mã cây")])]),
        ('s', GD, '6. Đánh dấu cây, phóng tới (1:950), vòng chọn; nhiều cây: đưa cả nhóm vào khung nhìn'),
        ('r', GD, 0, '7. Cửa sổ thông tin cây'),
    ], 'Cửa sổ thông tin: loài, H, R, DBH, ngày trồng, tuổi, tình trạng, khu, tọa độ VN-2000 / WGS84, liên kết Google Maps; lớp Vùng ngã đổ bật thì thêm đối tượng trong vùng ngã đổ. Không tìm thấy: ô tìm ghi "Không tìm thấy"; cây bị Lọc cây ẩn: ghi "bị bộ lọc ẩn".')

    sinh('UC03_ThongKe', 'Kịch bản UC03 – Xem thống kê che phủ và cây xanh', 'Người dùng', TP, [
        ('m', GD, BE, '1. GET /thong-ke (khi tải trang, sau mỗi lần dữ liệu cây đổi)'),
        ('m', BE, DB, '2. EXEC sp_thong_ke_che_phu'),
        ('s', DB, '3. Hợp vùng tán (STBuffer R, hợp), diện tích, tỷ lệ che phủ, thể tích tán, mật độ theo khu'),
        ('r', DB, BE, '4. Kết quả các khu và toàn vùng'),
        ('r', BE, GD, '5. Số liệu (lưu tại giao diện)'),
        ('m', 0, GD, '6. Chọn khu vực (hoặc Toàn vùng nghiên cứu)'),
        ('s', GD, '7. Căn khu vừa khít phần bản đồ trống, tô viền khu'),
        ('s', GD, '8. Thống kê cây xanh theo loài, tình trạng (%) từ dữ liệu cây đã tải'),
        ('r', GD, 0, '9. KPI, biểu đồ, thống kê cây xanh'),
    ], 'Khu chưa có cây: số liệu bằng 0. Chọn khu không gọi lại API; số liệu che phủ được nạp lại sau mỗi thao tác ghi.')

    sinh('UC04_BatTatLop', 'Kịch bản UC04 – Bật/tắt các lớp dữ liệu', 'Người dùng', ['Giao diện', 'Dịch vụ ảnh vệ tinh (Esri)'], [
        ('m', 0, GD, '1. Tích / bỏ tích một lớp trong Lớp dữ liệu'),
        ('f', 'alt', [('[Ảnh vệ tinh]', [
            ('m', GD, 2, '2. Yêu cầu ảnh (MapImageLayer, EPSG:3405)'),
            ('r', 2, GD, '3. Ảnh vệ tinh')]),
            ('[Vùng ngã đổ]', [
            ('s', GD, "2'. Vẽ / xóa vòng 1 × H, 1,5 × H từ kho phân tích (UC07)")]),
            ('[tòa nhà, đường, cây xanh, vùng che phủ, ranh giới]', [
            ('s', GD, "2''. Ẩn / hiện lớp (dữ liệu đã tải ở UC01)")])]),
        ('r', GD, 0, '4. Cảnh 3D được cập nhật'),
    ], 'Mặc định bật mọi lớp trừ Ảnh vệ tinh và Vùng ngã đổ.')

    sinh('UC05_1_ThemCay', 'Kịch bản UC05.1 – Thêm cây', 'Người quản lý khu', TP, [
        ('m', 0, GD, '1. Chọn khu phụ trách, bấm "Thêm cây"'),
        ('s', GD, '2. Mở biểu mẫu ở sidebar, làm mờ ngoài khu; căn khu nếu đang nhìn xa (đang phóng to: giữ camera)'),
        ('f', 'loop', [('[chọn vị trí, nhấp lại để đổi]', [
            ('m', 0, GD, '3. Nhấp vị trí trên bản đồ'),
            ('s', GD, '4. Kiểm tra trong khu, ngoài nền tòa nhà; đặt ghim')])]),
        ('m', 0, GD, '5. Nhập loài, H, R, DBH, ngày trồng, tình trạng; bấm Lưu'),
        ('m', GD, BE, '6. POST /cay'),
        ('s', BE, '7. Kiểm tra sơ bộ thuộc tính; gắn SESSION_CONTEXT mã tài khoản'),
        ('m', BE, DB, '8. INSERT cay_xanh'),
        ('s', DB, '9. Ràng buộc R1–R13; trigger: gán khu, phân quyền, ngoài tòa nhà, ghi nhật ký'),
        ('f', 'alt', [('[hợp lệ, thuộc khu phụ trách]', [
            ('r', DB, BE, '10. Ghi thành công (mã cây mới)'),
            ('r', BE, GD, '11. 201 + cây mới'),
            ('r', GD, 0, '12. Tải lại cảnh, thông báo')]),
            ('[sai thuộc tính / ngoài khu / trong tòa nhà]', [
            ('r', DB, BE, "10'. Báo lỗi, hoàn tác"),
            ('r', BE, GD, "11'. 400 / 403 / 422"),
            ('r', GD, 0, "12'. Hiện lỗi trong biểu mẫu")])]),
    ], 'Tiền điều kiện: Người quản lý khu đã đăng nhập (UC06, «include»). Tài khoản kỹ thuật: thêm ở mọi khu.')

    sinh('UC06_DangNhap', 'Kịch bản UC06 – Đăng nhập / đăng xuất', 'Người quản lý khu', TP, [
        ('m', 0, GD, '1. Bấm "Đăng nhập quản trị", nhập tên đăng nhập, mật khẩu'),
        ('m', GD, BE, '2. POST /dang-nhap'),
        ('m', BE, DB, '3. EXEC sp_dang_nhap'),
        ('s', DB, '4. Băm mật khẩu kèm salt, so khớp; kiểm tra trạng thái Hoạt động'),
        ('f', 'alt', [('[khớp, tài khoản Hoạt động]', [
            ('r', DB, BE, '5. Mã tài khoản, người quản lý'),
            ('s', BE, '6. Lấy khu phụ trách; cấp mã phiên (JSON Web Token)'),
            ('r', BE, GD, '7. Token + thông tin tài khoản'),
            ('r', GD, 0, '8. Thẻ tài khoản, thanh quản trị')]),
            ('[sai thông tin / tài khoản bị khóa]', [
            ('r', DB, BE, "5'. Lỗi 50201"),
            ('r', BE, GD, "6'. 401"),
            ('r', GD, 0, "7'. Báo lỗi trong hộp đăng nhập")])]),
        ('f', 'opt', [('[Đăng xuất]', [
            ('m', 0, GD, '9. Bấm "Đăng xuất"'),
            ('s', GD, '10. Xóa phiên, đóng biểu mẫu quản trị')])]),
    ], 'Thẻ tài khoản: tên, vai trò, khu phụ trách; nút Thêm cây (và Khôi phục với tài khoản kỹ thuật). Mỗi thao tác ghi sau đó, BackEnd gắn mã tài khoản vào SESSION_CONTEXT để trigger phân quyền biết người thao tác (UC05, UC10, UC11).')
    GHI_DE = cu


if __name__ == '__main__':
    if '--cap-nhat-cu' in sys.argv:
        sinh_cap_nhat()
    else:
        tach_co_san()
        sinh_moi()
