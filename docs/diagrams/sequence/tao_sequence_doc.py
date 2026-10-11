# Sơ đồ tuần tự KHỔ DỌC (mục 240): rộng 600 px, chữ Times New Roman 15 px -> khi đưa vào báo cáo rộng \textwidth (478 pt)
# chữ hiển thị ~12 pt, bằng chữ thân bài. Không có dòng tiêu đề trong hình (chú thích hình do LaTeX đặt).
# Nhãn viết với các điểm được phép xuống dòng theo cụm nghĩa: "|" (xuống dòng nếu cần) và "\n" (bắt buộc xuống dòng);
# bộ sinh dồn các cụm vào ít dòng nhất vừa khung, KHÔNG bao giờ ngắt giữa một cụm.
# Chạy: python tao_sequence_doc.py  (ghi đè 14 tệp .drawio trong thư mục này và ghi_chu.json)
import os, html, json

THU_MUC = os.path.dirname(os.path.abspath(__file__))
esc = lambda t: html.escape(t, quote=True)
FS = 15                        # cỡ chữ (px)
W = 600                        # bề rộng sơ đồ (px)
DONG = FS * 1.15               # chiều cao một dòng chữ
VONG = 18                      # chiều cao vòng tự gọi (self message)
FONT = 'fontFamily=Times New Roman;'
AN_TOAN = 0.95                 # chừa 5 % sai số đo chữ

LIFE = f'shape=umlLifeline;fillColor=#dae8fc;strokeColor=#333333;fontColor=#000000;{FONT}fontSize={FS};fontStyle=1;whiteSpace=nowrap;html=1;'
ACTOR = f'html=1;shape=umlLifeline;participant=umlActor;fillColor=none;strokeColor=#000000;fontColor=#000000;{FONT}fontSize={FS};fontStyle=1;size=46;verticalLabelPosition=top;verticalAlign=bottom;labelPosition=center;align=center;whiteSpace=nowrap;'
ACT = 'html=1;fillColor=#dae8fc;strokeColor=#333333;strokeWidth=1;'
MSG = 'html=1;edgeStyle=none;endArrow=block;endSize=7;'
RET = 'html=1;edgeStyle=none;endArrow=open;endSize=7;dashed=1;'
SELF = 'html=1;edgeStyle=none;endArrow=block;endSize=6;rounded=0;'
NHAN = f'text;html=1;strokeColor=none;fillColor=none;whiteSpace=wrap;{FONT}fontSize={FS};verticalAlign=bottom;spacing=0;'
GUARD = f'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;{FONT}fontSize={FS};fontStyle=2;whiteSpace=wrap;spacing=0;'
FRAME = f'shape=umlFrame;whiteSpace=wrap;html=1;width=44;height=22;fontStyle=1;{FONT}fontSize={FS};fillColor=#ffffff;swimlaneFillColor=none;strokeColor=#333333;'
SEP = 'endArrow=none;dashed=1;html=1;strokeColor=#333333;'

try:                           # đo chữ bằng chính phông Times New Roman của Windows
    from PIL import ImageFont
    _F = ImageFont.truetype('times.ttf', FS)
    _FB = ImageFont.truetype('timesbd.ttf', FS)
    do = lambda t: _F.getlength(t)
    do_dam = lambda t: _FB.getlength(t)
except Exception:
    do = lambda t: len(t) * FS * 0.45
    do_dam = lambda t: len(t) * FS * 0.5


def tach(t):
    """Nhãn -> danh sách dòng bắt buộc, mỗi dòng là danh sách cụm không được ngắt."""
    return [d.split('|') for d in t.split('\n')]


def rong_min(t):
    """Bề rộng tối thiểu: cụm dài nhất (không ngắt được)."""
    return max(do(c) for d in tach(t) for c in d) / AN_TOAN


def boc(t, rong, ten=''):
    """Dồn các cụm vào ít dòng nhất trong bề rộng rong; trả về các dòng nối bằng xuống dòng."""
    dong = []
    for cum in tach(t):
        cur = ''
        for c in cum:
            thu = (cur + ' ' + c) if cur else c
            if cur and do(thu) > rong * AN_TOAN:
                dong.append(cur); cur = c
            else:
                cur = thu
        dong.append(cur)
    for d in dong:
        if do(d) > rong * AN_TOAN:
            print(f'  ! {ten}: cụm dài quá {rong:.0f} px: "{d}"')
    return '\n'.join(dong)


def sinh_doc(ten, tieu_de, tac_nhan, thanh_phan, buoc, ghi_chu=None, thu_muc=THU_MUC):
    """Bước: ('m'|'r', i, j, nhãn) thông điệp / trả về; ('s', i, nhãn[, 'T'|'P']) tự gọi, nhãn bên trái / phải
    (mặc định: cột cuối bên trái, cột khác bên phải); ('f', 'alt'|'opt'|'loop', [(điều kiện, bước)...]) khung.
    tieu_de không vẽ vào hình (chú thích hình do LaTeX đặt); ghi chú đưa thành câu văn trong báo cáo (ghi_chu.json)."""
    # Khoảng cách giữa các cột: đủ cho cụm dài nhất phải đặt trong khoảng đó, phần dư chia đều
    n = len(thanh_phan)
    x_tn, x_cuoi = 52, W - 38
    can = [60.0] * n
    def ben_trai(b):
        return (b[3] == 'T') if len(b) > 3 else (b[1] == n and n > 1)
    def thu_thap(ds):
        for b in ds:
            if b[0] in ('m', 'r') and abs(b[1] - b[2]) == 1:
                g = min(b[1], b[2]); can[g] = max(can[g], rong_min(b[3]) + 18)
            elif b[0] == 's' and ben_trai(b):
                can[b[1] - 1] = max(can[b[1] - 1], rong_min(b[2]) + 46)
            elif b[0] == 'f':
                for dk, con in b[2]:
                    can[0] = max(can[0], rong_min(dk) + 26)
                    thu_thap(con)
    thu_thap(buoc)
    cx = [x_tn]
    if n == 1:
        cx.append(x_tn + max(can[0], 170))
    else:
        du = (x_cuoi - x_tn) - sum(can)
        if du < 0:
            print(f'  ! {ten}: thiếu {-du:.0f} px bề rộng', [round(c) for c in can])
        for c in can:
            cx.append(cx[-1] + c + du / n)
    o_nhan = []
    cells, nen, dem = [], [], [0]
    def id_():
        dem[0] += 1; return f'{ten}-{dem[0]}'
    def v(val, style, x, y, w, h, lop=None):
        val = '<br>'.join(html.escape(d, quote=False) for d in val.split('\n'))
        (cells if lop is None else lop).append(f'<mxCell id="{id_()}" value="{esc(val)}" style="{style}" vertex="1" parent="1"><mxGeometry x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" as="geometry" /></mxCell>')
    def e(style, x1_, y1_, x2_, y2_, pts=()):
        p = ''.join(f'<mxPoint x="{a:.1f}" y="{b:.1f}" />' for a, b in pts)
        cells.append(f'<mxCell id="{id_()}" value="" style="{style}" edge="1" parent="1"><mxGeometry relative="1" as="geometry">'
                     f'<mxPoint x="{x1_:.1f}" y="{y1_:.1f}" as="sourcePoint" /><mxPoint x="{x2_:.1f}" y="{y2_:.1f}" as="targetPoint" />'
                     + (f'<Array as="points">{p}</Array>' if p else '') + '</mxGeometry></mxCell>')
    hoat = {}
    def cham(i, y):
        a = hoat.setdefault(i, [y, y]); a[0] = min(a[0], y); a[1] = max(a[1], y)

    def chay(ds, y, muc):
        for b in ds:
            if b[0] in ('m', 'r'):
                _, i, j, nhan = b
                trai, phai = sorted((cx[i], cx[j]))
                rong = phai - trai - 18
                nhan = boc(nhan, rong, ten)
                h = len(nhan.split('\n')) * DONG
                y += h + 2                                       # nhãn nằm TRÊN mũi tên
                v(nhan, NHAN + 'align=center;', trai + 9, y - h - 2, rong, h)
                cham(i, y); cham(j, y)
                hx = 5 if cx[j] > cx[i] else -5
                e(MSG if b[0] == 'm' else RET, cx[i] + hx, y, cx[j] - hx, y)
                y += 8
            elif b[0] == 's':
                i, nhan = b[1], b[2]
                ben_phai = not ben_trai(b)
                rong = (W - 8 - (cx[i] + 36)) if ben_phai else (cx[i] - 34 - (cx[i - 1] + 12))
                nhan = boc(nhan, rong, ten)
                h = len(nhan.split('\n')) * DONG
                y += 4
                cham(i, y); cham(i, y + VONG)
                hx = 5 if ben_phai else -5
                e(SELF, cx[i] + hx, y, cx[i] + hx, y + VONG, [(cx[i] + 6 * hx, y), (cx[i] + 6 * hx, y + VONG)])
                x_nhan = cx[i] + 36 if ben_phai else cx[i] - 34 - rong
                rthat = max(do(d) for d in nhan.split('\n')) / AN_TOAN
                o_nhan.append((x_nhan, x_nhan + rthat, y - 5, y - 5 + h, i) if ben_phai else (x_nhan + rong - rthat, x_nhan + rong, y - 5, y - 5 + h, i))
                v(nhan, NHAN + 'fillColor=#ffffff;' + ('align=left;' if ben_phai else 'align=right;') + 'verticalAlign=top;', x_nhan, y - 5, rong, h)
                y += max(VONG, h - 5) + 11
            elif b[0] == 'f':
                _, loai, nhanh = b
                ytren = y
                trai = 6 + 6 * muc
                for k, (dk, con) in enumerate(nhanh):
                    if k > 0:
                        e(SEP, trai, y, W - trai, y)
                    rong_dk = cx[1] - 14 - (x_tn + 12)
                    dk = boc(dk, rong_dk, ten)
                    hdk = len(dk.split('\n')) * DONG
                    v(dk, GUARD, x_tn + 12, y + 24 if k == 0 else y + 3, rong_dk, hdk)
                    y += hdk + (26 if k == 0 else 5)
                    y = chay(con, y, muc + 1)
                    y += 2
                v(loai, FRAME, trai, ytren, W - 2 * trai, y - ytren)
                y += 8
        return y

    # Đầu sơ đồ: nhãn tác nhân (phía trên hình người), đầu lifeline (1 hoặc 2 dòng)
    Y0 = 4 + len(tac_nhan.split('\n')) * DONG
    dau = [34 + (len(t.split('\n')) - 1) * DONG for t in thanh_phan]
    y_dau = Y0 + max([46] + dau) + 12
    yend = chay(buoc, y_dau, 0)
    cao = yend - Y0 + 6
    for i in range(len(cx)):
        if i == 0:
            v(tac_nhan, ACTOR, cx[0] - 50, Y0, 100, cao, nen)
        else:
            t = thanh_phan[i - 1]
            w = max(70, max(do_dam(d) for d in t.split('\n')) / AN_TOAN + 20)
            v(t, LIFE + f'size={dau[i - 1]:.0f};', cx[i] - w / 2, Y0, w, cao, nen)
    for i, (a, b) in hoat.items():
        v('', ACT, cx[i] - 5, a - 6, 10, b - a + 12, nen)
    for x1_, x2_, y1_, y2_, i in o_nhan:                          # nhãn tự gọi không được đè thanh kích hoạt cột khác
        for j, (a, b) in hoat.items():
            if j != i and x1_ - 8 < cx[j] < x2_ + 8 and y1_ < b + 6 and a - 6 < y2_:
                print(f'  ! {ten}: nhãn tự gọi ở cột {i} đè thanh kích hoạt cột {j} (y {y1_:.0f})')
    yday = Y0 + cao + 6
    noi_dung = (f'<mxfile host="Electron"><diagram id="{ten}" name="{ten}"><mxGraphModel dx="900" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" '
                f'connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{W}" pageHeight="{int(yday + 10)}" math="0" shadow="0"><root>'
                '<mxCell id="0" /><mxCell id="1" parent="0" />' + ''.join(nen + cells) + '</root></mxGraphModel></diagram></mxfile>')
    os.makedirs(thu_muc, exist_ok=True)
    open(os.path.join(thu_muc, ten + '.drawio'), 'w', encoding='utf-8').write(noi_dung)
    GHI_CHU[ten] = ghi_chu
    print('sinh', ten, f'{W} x {int(yday)} px')


GHI_CHU = {}
GD, BE, DB = 1, 2, 3
TP = ['Giao diện', 'BackEnd', 'CSDL']
NQL = 'Người QL khu'
QTHT = 'Quản trị\nhệ thống'


def tat_ca():
    # "|" = chỗ được phép xuống dòng (giữa hai cụm nghĩa); "\n" = bắt buộc xuống dòng
    sinh_doc('UC01_XemBanDo3D', 'Kịch bản UC01 – Xem bản đồ 3D cây xanh', 'Người dùng', TP, [
        ('m', 0, GD, '1. Mở ứng dụng'),
        ('m', GD, BE, '2. GET /khu-vuc,|/cay,|/lop-nen/*,|/loai-cay,|/thong-ke'),
        ('m', BE, DB, '3. Truy vấn|bảng không gian,|sp_thong_ke_che_phu'),
        ('r', DB, BE, '4. Dữ liệu|(EPSG:3405)'),
        ('r', BE, GD, '5. GeoJSON,|danh mục loài,|thống kê'),
        ('s', GD, '6. Dựng SceneView local:|tòa nhà đùn theo chiều cao;|cây = thân trụ + tán theo H, R;|tô màu theo loài'),
        ('s', GD, '7. Căn toàn vùng nghiên cứu|vừa khít phần bản đồ trống|(gán cho nút Home)'),
        ('r', GD, 0, '8. Cảnh 3D,|Chú giải loài cây,|hộp bối cảnh'),
        ('f', 'loop', [('[điều hướng]', [
            ('m', 0, GD, '9. Xoay, phóng to /|thu nhỏ, di chuyển;|Home'),
            ('r', GD, 0, '10. Cảnh 3D|theo góc nhìn mới')])]),
    ], 'Lớp nền gồm tòa nhà, đường, ranh giới (/lop-nen/{toa-nha, duong, ranh-gioi}). Dữ liệu tải một lần và dùng lại cho UC02 – UC04, UC08, UC09. Mất kết nối: hiển thị thông báo lỗi.')

    sinh_doc('UC02_TraCuuCay', 'Kịch bản UC02 – Tra cứu thông tin cây', 'Người dùng', TP, [
        ('f', 'alt', [('[nhấp vào cây|trên cảnh 3D]', [
            ('m', 0, GD, '1. Nhấp vào cây'),
            ('s', GD, '2. Xác định cây tại điểm nhấp|(lớp cây đã tải)')]),
            ('[tìm theo mã|hoặc loài]', [
            ('m', 0, GD, "1'. Nhập mã / tên loài,|bấm tìm"),
            ('m', GD, BE, "2'. GET /cay?q="),
            ('m', BE, DB, "3'. Truy vấn|cay_xanh, loai_cay"),
            ('r', DB, BE, "4'. Các cây khớp"),
            ('r', BE, GD, "5'. Danh sách|mã cây")])]),
        ('s', GD, '6. Đánh dấu cây, phóng tới (1:950),|vòng chọn; nhiều cây:|đưa cả nhóm vào khung nhìn'),
        ('r', GD, 0, '7. Cửa sổ|thông tin cây'),
    ], 'Cửa sổ thông tin: loài, H, R, DBH, ngày trồng, tuổi, tình trạng, khu, tọa độ VN-2000 / WGS84, liên kết Google Maps; lớp Vùng ngã đổ bật thì thêm đối tượng trong vùng ngã đổ. Không tìm thấy: ô tìm ghi "Không tìm thấy"; cây bị Lọc cây ẩn: ghi "bị bộ lọc ẩn".')

    sinh_doc('UC03_ThongKe', 'Kịch bản UC03 – Xem thống kê che phủ và cây xanh', 'Người dùng', TP, [
        ('m', GD, BE, '1. GET /thong-ke'),
        ('m', BE, DB, '2. EXEC|sp_thong_ke_che_phu'),
        ('s', DB, '3. Hợp vùng tán|(STBuffer R, hợp),|diện tích, tỷ lệ che phủ,|thể tích tán,|mật độ theo khu'),
        ('r', DB, BE, '4. Kết quả các khu|và toàn vùng'),
        ('r', BE, GD, '5. Số liệu|(lưu tại giao diện)'),
        ('m', 0, GD, '6. Chọn khu vực|(hoặc Toàn vùng|nghiên cứu)'),
        ('s', GD, '7. Căn khu vừa khít phần|bản đồ trống, tô viền khu'),
        ('s', GD, '8. Thống kê cây xanh theo loài,|tình trạng (%)|từ dữ liệu cây đã tải'),
        ('r', GD, 0, '9. KPI, biểu đồ,|thống kê cây xanh'),
    ], 'Bước 1 – 5 chạy khi tải trang và sau mỗi lần dữ liệu cây thay đổi. Khu chưa có cây: số liệu bằng 0. Chọn khu không gọi lại API.')

    sinh_doc('UC04_BatTatLop', 'Kịch bản UC04 – Bật/tắt các lớp dữ liệu', 'Người dùng', ['Giao diện', 'Dịch vụ ảnh\nvệ tinh (Esri)'], [
        ('m', 0, GD, '1. Tích / bỏ tích|một lớp trong|Lớp dữ liệu'),
        ('f', 'alt', [('[Ảnh vệ tinh]', [
            ('m', GD, 2, '2. Yêu cầu ảnh|(MapImageLayer,|EPSG:3405)'),
            ('r', 2, GD, '3. Ảnh vệ tinh')]),
            ('[Vùng ngã đổ]', [
            ('s', GD, "2'. Vẽ / xóa vòng 1 × H, 1,5 × H|từ kho phân tích (UC07)")]),
            ('[tòa nhà, đường,|cây xanh,|vùng che phủ,|ranh giới]', [
            ('s', GD, "2''. Ẩn / hiện lớp|(dữ liệu đã tải ở UC01)")])]),
        ('r', GD, 0, '4. Cảnh 3D|được cập nhật'),
    ], 'Mặc định bật mọi lớp trừ Ảnh vệ tinh và Vùng ngã đổ.')

    sinh_doc('UC05_1_ThemCay', 'Kịch bản UC05.1 – Thêm cây', NQL, TP, [
        ('m', 0, GD, '1. Chọn khu phụ trách,|bấm "Thêm cây"'),
        ('s', GD, '2. Mở biểu mẫu ở sidebar,|làm mờ ngoài khu;|căn khu nếu đang nhìn xa|(đang phóng to: giữ camera)'),
        ('f', 'loop', [('[chọn vị trí,|nhấp lại để đổi]', [
            ('m', 0, GD, '3. Nhấp vị trí|trên bản đồ'),
            ('s', GD, '4. Kiểm tra trong khu,|ngoài nền tòa nhà;|đặt ghim')])]),
        ('m', 0, GD, '5. Nhập loài, H, R, DBH,|ngày trồng, tình trạng;|bấm Lưu'),
        ('m', GD, BE, '6. POST /cay'),
        ('s', BE, '7. Kiểm tra sơ bộ thuộc tính;|gắn SESSION_CONTEXT|mã tài khoản'),
        ('m', BE, DB, '8. INSERT|cay_xanh'),
        ('s', DB, '9. Ràng buộc R1–R13;|trigger: gán khu,|phân quyền,|ngoài tòa nhà,|ghi nhật ký'),
        ('f', 'alt', [('[hợp lệ, thuộc|khu phụ trách]', [
            ('r', DB, BE, '10. Ghi thành công|(mã cây mới)'),
            ('r', BE, GD, '11. 201|+ cây mới'),
            ('r', GD, 0, '12. Tải lại cảnh,|thông báo')]),
            ('[sai thuộc tính /|ngoài khu /|trong tòa nhà]', [
            ('r', DB, BE, "10'. Báo lỗi,|hoàn tác"),
            ('r', BE, GD, "11'. 400 /|403 / 422"),
            ('r', GD, 0, "12'. Hiện lỗi|trong biểu mẫu")])]),
    ], 'Tiền điều kiện: Người quản lý khu đã đăng nhập (UC06, «include»). Tài khoản kỹ thuật: thêm ở mọi khu.')

    sinh_doc('UC05_2_NhanBanCay', 'Kịch bản UC05.2 – Nhân bản cây', NQL, TP, [
        ('m', 0, GD, '1. Chọn cây,|bấm "Nhân bản"'),
        ('s', GD, '2. Mở biểu mẫu điền sẵn|(trừ tình trạng),|đánh dấu cây nguồn,|làm mờ ngoài khu'),
        ('m', 0, GD, '3. Nhấp vị trí mới|trên bản đồ'),
        ('s', GD, '4. Kiểm tra: trong khu,|ngoài nền nhà,|cách mọi cây ≥ 1 m'),
        ('m', 0, GD, '5. Xem lại thuộc tính,|tích "Đã kiểm tra",|bấm Lưu'),
        ('m', GD, BE, '6. POST /cay|(thuộc tính, x, y)'),
        ('m', BE, DB, '7. INSERT|cay_xanh'),
        ('s', DB, '8. Trigger:|gán khu, phân quyền,|ngoài tòa nhà,|ghi nhật ký'),
        ('f', 'alt', [('[hợp lệ]', [
            ('r', DB, BE, '9. Ghi thành công|(mã cây mới)'),
            ('r', BE, GD, '10. 201|+ cây mới'),
            ('r', GD, 0, '11. Thông báo,|tải lại cảnh; đặt tiếp')]),
            ('[ngoài khu phụ trách|hoặc trong tòa nhà]', [
            ('r', DB, BE, "9'. Báo lỗi,|hoàn tác"),
            ('r', BE, GD, "10'. 403 / 422"),
            ('r', GD, 0, "11'. Hiện lỗi|trong biểu mẫu")])]),
    ], 'Tiền điều kiện: Người quản lý khu đã đăng nhập (UC06, «include»). Cây nguồn có thể thuộc khu bất kỳ (chỉ dùng làm mẫu).')

    sinh_doc('UC05_3_SuaCay', 'Kịch bản UC05.3 – Sửa cây (gồm dời vị trí)', NQL, TP, [
        ('m', 0, GD, '1. Chọn cây|trong khu phụ trách,|bấm "Sửa"'),
        ('s', GD, '2. Đóng cửa sổ, mở biểu mẫu|ở sidebar (giá trị hiện tại),|đánh dấu cây,|làm mờ ngoài khu'),
        ('f', 'loop', [('[dời vị trí|(tùy chọn),|nhấp tùy ý]', [
            ('m', 0, GD, '3. Nhấp vị trí mới'),
            ('s', GD, '4. Kiểm tra trong khu,|ngoài nền nhà,|cách cây khác ≥ 1 m;|đặt ghim')])]),
        ('m', 0, GD, '5. Sửa thuộc tính,|bấm Lưu'),
        ('m', GD, BE, '6. PUT /cay/{ma}|(thuộc tính,|[x, y])'),
        ('m', BE, DB, '7. UPDATE|cay_xanh'),
        ('s', DB, '8. Trigger:|gán khu (nếu dời),|kiểm tra quyền,|ngoài tòa nhà,|ghi nhật ký cũ → mới'),
        ('f', 'alt', [('[hợp lệ]', [
            ('r', DB, BE, '9. Ghi thành công'),
            ('r', BE, GD, '10. Cây|đã cập nhật'),
            ('r', GD, 0, '11. Tải lại cảnh,|mở lại cửa sổ cây')]),
            ('[vi phạm quyền|hoặc vị trí]', [
            ('r', DB, BE, "9'. Báo lỗi,|hoàn tác"),
            ('r', BE, GD, "10'. 403 / 422"),
            ('r', GD, 0, "11'. Hiện lỗi|trong biểu mẫu")])]),
    ], 'Tiền điều kiện: đã đăng nhập (UC06). Hủy: thoát biểu mẫu, mở lại cửa sổ cây; "Về vị trí cũ" bỏ vị trí mới và ghim.')

    sinh_doc('UC05_4_XoaCay', 'Kịch bản UC05.4 – Xóa cây', NQL, TP, [
        ('m', 0, GD, '1. Chọn cây|trong khu phụ trách,|bấm "Xóa"'),
        ('s', GD, '2. Hỏi xác nhận ngay|trong cửa sổ thông tin'),
        ('m', 0, GD, '3. Xác nhận xóa'),
        ('m', GD, BE, '4. DELETE|/cay/{ma}'),
        ('m', BE, DB, '5. DELETE|cay_xanh'),
        ('s', DB, '6. Trigger:|kiểm tra khu phụ trách,|ghi nhật ký'),
        ('f', 'alt', [('[được phép]', [
            ('r', DB, BE, '7. Xóa thành công'),
            ('r', BE, GD, '8. 204'),
            ('r', GD, 0, '9. Đóng cửa sổ,|tải lại cảnh,|thông báo "Đã xóa"')]),
            ('[không thuộc|khu phụ trách]', [
            ('r', DB, BE, "7'. Báo lỗi,|hoàn tác"),
            ('r', BE, GD, "8'. 403"),
            ('r', GD, 0, "9'. Hiện lỗi|trong cửa sổ")])]),
    ], 'Tiền điều kiện: đã đăng nhập (UC06).')

    sinh_doc('UC06_DangNhap', 'Kịch bản UC06 – Đăng nhập / đăng xuất', NQL, TP, [
        ('m', 0, GD, '1. Bấm "Đăng nhập quản trị",|nhập tên đăng nhập,|mật khẩu'),
        ('m', GD, BE, '2. POST|/dang-nhap'),
        ('m', BE, DB, '3. EXEC|sp_dang_nhap'),
        ('s', DB, '4. Băm mật khẩu|kèm salt, so khớp;|kiểm tra trạng thái|Hoạt động'),
        ('f', 'alt', [('[khớp, tài khoản|Hoạt động]', [
            ('r', DB, BE, '5. Mã tài khoản,|người quản lý'),
            ('s', BE, '6. Lấy khu|phụ trách;|cấp mã phiên|(JWT)', 'T'),
            ('r', BE, GD, '7. Token|+ thông tin|tài khoản'),
            ('r', GD, 0, '8. Thẻ tài khoản,|thanh quản trị')]),
            ('[sai thông tin /|tài khoản bị khóa]', [
            ('r', DB, BE, "5'. Lỗi 50201"),
            ('r', BE, GD, "6'. 401"),
            ('r', GD, 0, "7'. Báo lỗi|trong hộp đăng nhập")])]),
        ('f', 'opt', [('[Đăng xuất]', [
            ('m', 0, GD, '9. Bấm "Đăng xuất"'),
            ('s', GD, '10. Xóa phiên,|đóng biểu mẫu quản trị')])]),
    ], 'JWT: JSON Web Token. Thẻ tài khoản: tên, vai trò, khu phụ trách; nút Thêm cây (và Khôi phục với tài khoản kỹ thuật). Mỗi thao tác ghi sau đó, BackEnd gắn mã tài khoản vào SESSION_CONTEXT để trigger phân quyền biết người thao tác (UC05, UC10, UC11).')

    sinh_doc('UC07_PhanTichNguyCo', 'Kịch bản UC07 – Phân tích nguy cơ ngã đổ (vùng 1,5 × H, vùng mục tiêu ISA)', 'Người dùng', TP, [
        ('m', GD, BE, '1. GET /phan-tich/|cay-nguy-co|(nạp sẵn)'),
        ('m', BE, DB, '2. EXEC sp_cay_|nguy_co_cong_trinh|(he_so = 1,5)'),
        ('s', DB, '3. Cây Suy yếu /|Nguy hiểm có nhà,|đường trong 1,5 × H;|mức theo đối tượng|gần nhất: trong tán /|1 × H / 1,5 × H'),
        ('r', DB, BE, '4. Kết quả|toàn vùng'),
        ('r', BE, GD, '5. Danh sách|(lưu kho phía|trình duyệt)'),
        ('m', 0, GD, '6. Bấm "Phân tích"|hoặc bật lớp|"Vùng ngã đổ"'),
        ('s', GD, '7. Bỏ chọn loài / tình trạng;|lọc kho theo khu đang xem;|vẽ vòng 1H, 1,5H;|tô nhà, đường'),
        ('r', GD, 0, '8. Danh sách mức,|vòng trên bản đồ'),
        ('f', 'opt', [('[đổi khu khi|lớp đang bật]', [
            ('m', 0, GD, '9. Chọn khu khác'),
            ('s', GD, '10. Vẽ lại từ kho|(không gọi API)')])]),
    ], 'Bước 1 – 5: nạp sẵn ngầm một lần sau khi tải cảnh (UC01). Kho được nạp lại khi dữ liệu cây thay đổi (thêm / sửa / xóa / khôi phục / hoàn tác). "Ẩn" = tắt lớp Vùng ngã đổ (UC04).')

    sinh_doc('UC08_LocCay', 'Kịch bản UC08 – Lọc cây theo thuộc tính', 'Người dùng', ['Giao diện'], [
        ('m', 0, GD, '1. Chọn điều kiện:|loài, H, R, DBH,|ngày trồng,|tình trạng'),
        ('s', GD, '2. Tạo biểu thức lọc|(definitionExpression)|cho các lớp cây'),
        ('s', GD, '3. Đếm số cây còn hiện'),
        ('r', GD, 0, '4. Cây thỏa điều kiện,|số cây hiện'),
        ('f', 'opt', [('[Xóa lọc / Đặt lại]', [
            ('m', 0, GD, '5. Bấm "Xóa lọc"|hoặc "Đặt lại"'),
            ('r', GD, 0, '6. Hiện lại|toàn bộ cây')])]),
    ], 'Dữ liệu cây đã tải ở UC01. Bị khóa khi đang xem theo loài / tình trạng (UC09); dùng lại được sau "Đặt lại".')

    sinh_doc('UC09_TheoLoaiTinhTrang', 'Kịch bản UC09 – Xem theo loài và tình trạng cây', 'Người dùng', ['Giao diện'], [
        ('m', 0, GD, '1. Bấm loài|(Chú giải / Thống kê)|hoặc tình trạng|(Thống kê)'),
        ('s', GD, '2. Lần đầu: xóa và khóa|Lọc cây (UC08)'),
        ('s', GD, '3. Làm mờ cây không thỏa|(loài VÀ tình trạng)'),
        ('s', GD, '4. Có chọn loài: mở cửa sổ|thông tin loài;|cập nhật hộp bối cảnh'),
        ('f', 'opt', [('[đang xem|toàn vùng]', [
            ('s', GD, '5. Tìm khu có nhiều cây thỏa nhất,|tô viền khu,|căn cụm cây vừa khít')])]),
        ('r', GD, 0, '6. Bản đồ,|cửa sổ loài,|thống kê đồng bộ'),
        ('f', 'opt', [('[Đặt lại]', [
            ('m', 0, GD, '7. Bấm "Đặt lại"'),
            ('s', GD, '8. Bỏ chọn,|mở khóa Lọc cây;|giữ khu và camera')])]),
    ], 'Dữ liệu cây đã tải ở UC01. Nhấp bản đồ, đóng cửa sổ, đổi khu KHÔNG bỏ chọn; chỉ "Đặt lại" (hoặc Phân tích, UC07).')

    sinh_doc('UC10_KhoiPhucMacDinh', 'Kịch bản UC10 – Khôi phục dữ liệu mặc định', QTHT, TP, [
        ('m', 0, GD, '1. Bấm "Khôi phục|DL mặc định"'),
        ('m', GD, BE, '2. GET /khoi-phuc|(xem trước)'),
        ('m', BE, DB, '3. EXEC sp_khoi_|phuc_mac_dinh|@thuc_hien = 0'),
        ('r', DB, BE, '4. Các thay đổi|của người quản lý'),
        ('r', BE, GD, '5. Bản xem trước'),
        ('r', GD, 0, '6. Số cây sẽ xóa /|hoàn tác / phục hồi'),
        ('f', 'alt', [('[xác nhận]', [
            ('m', 0, GD, '7. Xác nhận|khôi phục'),
            ('m', GD, BE, '8. POST|/khoi-phuc'),
            ('m', BE, DB, '9. EXEC sp_khoi_|phuc_mac_dinh|@thuc_hien = 1'),
            ('s', DB, '10. Kiểm tra|tài khoản kỹ thuật;|hoàn tác thay đổi|của người quản lý,|giữ thay đổi|của admin'),
            ('r', DB, BE, '11. Kết quả'),
            ('r', BE, GD, '12. Số cây|đã xử lý'),
            ('r', GD, 0, '13. Tải lại cảnh,|thông báo')]),
            ('[hủy]', [('m', 0, GD, "7'. Đóng hộp")])]),
    ], 'Tiền điều kiện: đăng nhập tài khoản kỹ thuật (UC06, «include»). Không phải admin: lỗi 50401 (403).')

    sinh_doc('UC11_NhatKyHoanTac', 'Kịch bản UC11 – Xem nhật ký và hoàn tác thay đổi', QTHT, TP, [
        ('m', 0, GD, '1. Mở thẻ|"Nhật ký thay đổi"|(hộp Khôi phục, UC10)'),
        ('m', GD, BE, '2. GET /nhat-ky'),
        ('m', BE, DB, '3. Truy vấn|nhat_ky_cay'),
        ('r', DB, BE, '4. Nhật ký|(giá trị cũ → mới)'),
        ('r', BE, GD, '5. Danh sách'),
        ('r', GD, 0, '6. Hiển thị nhật ký'),
        ('m', 0, GD, '7. Bấm "Hoàn tác"|một mục'),
        ('m', GD, BE, '8. POST|/nhat-ky/{ma_nk}/|hoan-tac'),
        ('m', BE, DB, '9. EXEC|sp_hoan_tac_nhat_ky'),
        ('s', DB, '10. Kiểm tra admin;|chỉ thay đổi mới nhất|của cây;|áp giá trị cũ'),
        ('f', 'alt', [('[hợp lệ]', [
            ('r', DB, BE, '11. Thành công'),
            ('r', BE, GD, '12. Kết quả'),
            ('r', GD, 0, '13. Tải lại cảnh,|thông báo')]),
            ('[không tìm thấy /|không phải thay đổi|mới nhất /|không có giá trị cũ]', [
            ('r', DB, BE, "11'. Lỗi|50402 – 50405"),
            ('r', BE, GD, "12'. 404 / 409"),
            ('r', GD, 0, "13'. Hiện lỗi")])]),
    ], 'Tiền điều kiện: đăng nhập tài khoản kỹ thuật (UC06).')


if __name__ == '__main__':
    tat_ca()
    json.dump(GHI_CHU, open(os.path.join(THU_MUC, 'ghi_chu.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
