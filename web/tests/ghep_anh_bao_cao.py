"""Ghép 4 ảnh tests/anh/bc_a..d.png thành lưới 2 x 2 có nhãn (a)-(d) -> Latex_Final/imgs/webgis_giao_dien.png (mục 242)."""
import os
from PIL import Image, ImageDraw, ImageFont
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'anh')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'Latex_Final', 'imgs', 'webgis_giao_dien.png')
TEN = ['bc_a_tong_quan.png', 'bc_b_anh_ve_tinh.png', 'bc_c_vung_che_phu.png', 'bc_d_chan_trong_nha.png']
anh = [Image.open(os.path.join(D, t)).convert('RGB') for t in TEN]
W = 1600; anh = [a.resize((W, round(a.height * W / a.width)), Image.LANCZOS) for a in anh]
H = anh[0].height; G = 24
o = Image.new('RGB', (2 * W + G, 2 * H + G), 'white')
f = ImageFont.truetype('arialbd.ttf', 56)
for k, a in enumerate(anh):
    x, y = (k % 2) * (W + G), (k // 2) * (H + G)
    o.paste(a, (x, y))
    d = ImageDraw.Draw(o); nhan = f'({"abcd"[k]})'
    d.rounded_rectangle((x + 18, y + H - 100, x + 128, y + H - 18), 12, fill='white', outline='#333333', width=3)
    d.text((x + 73, y + H - 59), nhan, font=f, fill='black', anchor='mm')
o.save(OUT, optimize=True)
print(OUT, o.size)
