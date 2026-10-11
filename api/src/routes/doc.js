// Các endpoint đọc (UC01 - UC04): không cần đăng nhập, không đặt phiên làm việc.
import { Router } from 'express';
import { query, sql } from '../db.js';
import { HttpError } from '../errors.js';
import { featureCollection, feature, parseBbox } from '../geo.js';

export const docRouter = Router();

// Câu SELECT dùng chung cho cây: kèm tên loài, tên khu, tuổi cây (năm tròn tính đến hôm nay)
export const SELECT_CAY = `
  SELECT c.ma_cay, c.ma_loai, l.ten_loai, l.ten_khoa_hoc, c.ma_khu_vuc, k.ten_khu_vuc,
         CAST(c.chieu_cao AS FLOAT) AS chieu_cao, CAST(c.ban_kinh_tan AS FLOAT) AS ban_kinh_tan,
         CAST(c.dbh AS FLOAT) AS dbh, CONVERT(CHAR(10), c.ngay_trong, 23) AS ngay_trong,
         DATEDIFF(YEAR, c.ngay_trong, GETDATE())
           - CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, c.ngay_trong, GETDATE()), c.ngay_trong) > GETDATE() THEN 1 ELSE 0 END AS tuoi,
         c.tinh_trang, c.shape.Z AS z, c.shape.STAsText() AS wkt
  FROM cay_xanh c
  JOIN loai_cay l ON l.ma_loai = c.ma_loai
  LEFT JOIN khu_vuc k ON k.ma_khu_vuc = c.ma_khu_vuc`;

docRouter.get('/health', async (_req, res) => {
  const [r] = await query('SELECT (SELECT COUNT(*) FROM cay_xanh) AS so_cay, (SELECT COUNT(*) FROM khu_vuc) AS so_khu');
  res.json({ trang_thai: 'ok', csdl: r });
});

docRouter.get('/khu-vuc', async (_req, res) => {
  const rows = await query(`
    SELECT k.ma_khu_vuc, k.ten_khu_vuc, CAST(k.dien_tich AS FLOAT) AS dien_tich_ha, k.ma_nql, n.ten_nql,
           k.shape.STAsText() AS wkt
    FROM khu_vuc k LEFT JOIN nguoi_quan_ly n ON n.ma_nql = k.ma_nql
    ORDER BY k.ma_khu_vuc`);
  res.json(featureCollection(rows, 'wkt', 'ma_khu_vuc'));
});

docRouter.get('/loai-cay', async (_req, res) => {
  res.json(await query(`
    SELECT ma_loai, ten_loai, ten_khoa_hoc, dac_tinh_sinh_hoc, thoidiem_rungla, thoidiem_rahoa, tuoi_tho_tb
    FROM loai_cay ORDER BY ma_loai`));
});

// ?khu=<mã khu>&loai=<mã loài>&q=<mã cây hoặc một phần tên loài / tên khoa học>
docRouter.get('/cay', async (req, res) => {
  const where = [];
  const params = {};
  const int = (v, name) => {
    const n = Number(v);
    if (!Number.isInteger(n)) throw new HttpError(400, `Tham số ${name} phải là số nguyên.`);
    return n;
  };
  if (req.query.khu !== undefined) { where.push('c.ma_khu_vuc = @khu'); params.khu = [sql.Int, int(req.query.khu, 'khu')]; }
  if (req.query.loai !== undefined) { where.push('c.ma_loai = @loai'); params.loai = [sql.Int, int(req.query.loai, 'loai')]; }
  const q = String(req.query.q ?? '').trim();
  if (q) {
    if (/^\d+$/.test(q)) { where.push('c.ma_cay = @ma'); params.ma = [sql.Int, Number(q)]; }
    else { where.push('(l.ten_loai LIKE @q OR l.ten_khoa_hoc LIKE @q)'); params.q = [sql.NVarChar, `%${q}%`]; }
  }
  const rows = await query(`${SELECT_CAY} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY c.ma_cay`, params);
  res.json(featureCollection(rows, 'wkt', 'ma_cay'));
});

docRouter.get('/cay/:ma', async (req, res) => {
  const ma = Number(req.params.ma);
  if (!Number.isInteger(ma)) throw new HttpError(400, 'Mã cây phải là số nguyên.');
  const [row] = await query(`${SELECT_CAY} WHERE c.ma_cay = @ma`, { ma: [sql.Int, ma] });
  if (!row) throw new HttpError(404, 'Không tìm thấy cây.');
  res.json(feature(row, 'wkt', 'ma_cay'));
});

const LOP_NEN = {
  'toa-nha': `SELECT ma_toa_nha, ten, CAST(chieu_cao AS FLOAT) AS chieu_cao, nguon_chieu_cao, shape.STAsText() AS wkt FROM toa_nha`,
  duong: `SELECT ma_duong, ten, cap_duong, shape.STAsText() AS wkt FROM duong`,
  'ranh-gioi': `SELECT ma, ten, shape.STAsText() AS wkt FROM ranh_gioi`,
};

// ?bbox=minx,miny,maxx,maxy (EPSG:3405) để chỉ lấy đối tượng giao với khung nhìn
docRouter.get('/lop-nen/:lop', async (req, res) => {
  const base = LOP_NEN[req.params.lop];
  if (!base) throw new HttpError(404, 'Lớp nền không tồn tại (toa-nha, duong, ranh-gioi).');
  const bbox = parseBbox(req.query.bbox);
  if (bbox === undefined) throw new HttpError(400, 'bbox phải có dạng minx,miny,maxx,maxy.');
  const params = {};
  let where = '';
  if (bbox) {
    where = ` WHERE shape.STIntersects(geometry::STPolyFromText(
      CONCAT('POLYGON((', @x1, ' ', @y1, ',', @x2, ' ', @y1, ',', @x2, ' ', @y2, ',', @x1, ' ', @y2, ',', @x1, ' ', @y1, '))'), 3405)) = 1`;
    ['x1', 'y1', 'x2', 'y2'].forEach((k, i) => { params[k] = [sql.Decimal(12, 3), bbox[i]]; });
  }
  const rows = await query(base + where, params);
  res.json(featureCollection(rows, 'wkt'));
});

// ?khu=<mã khu>: kết quả sp_thong_ke_che_phu (5 khu + dòng toàn vùng có ma_khu_vuc = null)
docRouter.get('/thong-ke', async (req, res) => {
  const params = { khu: [sql.Int, null] };
  if (req.query.khu !== undefined) {
    const n = Number(req.query.khu);
    if (!Number.isInteger(n)) throw new HttpError(400, 'Tham số khu phải là số nguyên.');
    params.khu = [sql.Int, n];
  }
  const rows = await query('EXEC sp_thong_ke_che_phu @ma_khu_vuc = @khu', params);
  res.json(rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'string' && k !== 'ten_khu_vuc' ? Number(v) : v]))));
});

// UC07: cây có nguy cơ ảnh hưởng công trình (sp_cay_nguy_co_cong_trinh, script db/24 - vùng mục tiêu ISA).
// ?khu=<mã khu>&he_so=<k, 0,5 - 1,5; mặc định 1,5 = vùng ngã đổ 1,5 x H>. Chỉ cây Suy yếu / Nguy hiểm.
// Mức: Cao (đối tượng gần nhất trong tán) / Trung bình (trong 1 x H) / Thấp (trong 1,5 x H); xếp Cao -> Thấp, gần -> xa.
const SO_NGUY_CO = ['chieu_cao', 'ban_kinh_tan', 'tam_do', 'x', 'y', 'kc_nha', 'kc_duong', 'muc_do_nguy_hiem', 'kc_xa_nhat'];
docRouter.get('/phan-tich/cay-nguy-co', async (req, res) => {
  const params = { khu: [sql.Int, null], k: [sql.Float, 1.5] };
  if (req.query.khu !== undefined && req.query.khu !== '') {
    const n = Number(req.query.khu);
    if (!Number.isInteger(n)) throw new HttpError(400, 'Tham số khu phải là số nguyên.');
    params.khu = [sql.Int, n];
  }
  if (req.query.he_so !== undefined) {
    const k = Number(req.query.he_so);
    if (!Number.isFinite(k) || k < 0.5 || k > 1.5) throw new HttpError(400, 'Hệ số tầm đổ he_so phải trong khoảng 0,5 - 1,5.');
    params.k = [sql.Float, k];
  }
  // Đã bỏ tat_ca (xét mọi cây): cây Bình thường không được gán mức độ nguy hiểm -> báo lỗi rõ ràng thay vì lặng lẽ bỏ qua
  if (req.query.tat_ca !== undefined) throw new HttpError(400, 'Tham số tat_ca đã bỏ: chỉ đánh giá cây Suy yếu / Nguy hiểm.');
  const rows = await query('EXEC sp_cay_nguy_co_cong_trinh @ma_khu = @khu, @he_so = @k', params);
  res.json(rows.map((r) => ({ ...r, ...Object.fromEntries(SO_NGUY_CO.map((k) => [k, r[k] === null ? null : Number(r[k])])) })));
});
