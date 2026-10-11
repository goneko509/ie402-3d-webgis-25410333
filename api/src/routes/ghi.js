// Đăng nhập (UC06) và thêm / sửa / xóa cây (UC05). Phân quyền theo khu do trigger CSDL quyết định qua SESSION_CONTEXT.
import { Router } from 'express';
import { query, withSession, sql } from '../db.js';
import { requireAuth, signToken } from '../auth.js';
import { HttpError } from '../errors.js';
import { feature } from '../geo.js';
import { SELECT_CAY } from './doc.js';

export const ghiRouter = Router();

ghiRouter.post('/dang-nhap', async (req, res) => {
  const { ten_dang_nhap: ten, mat_khau: matKhau } = req.body ?? {};
  if (typeof ten !== 'string' || typeof matKhau !== 'string' || !ten || !matKhau)
    throw new HttpError(400, 'Cần nhập tên đăng nhập và mật khẩu.');
  // sp_dang_nhap kiểm tra băm mật khẩu và ghi SESSION_CONTEXT; API chỉ cần mã tài khoản nên xóa phiên ngay trong cùng batch.
  const [acc] = await query(`
    DECLARE @ma_tk INT;
    BEGIN TRY
      EXEC sp_dang_nhap @ten, @mk, @ma_tk OUTPUT;
      EXEC sp_set_session_context @key = N'ma_tk', @value = NULL;
    END TRY
    BEGIN CATCH
      EXEC sp_set_session_context @key = N'ma_tk', @value = NULL;
      THROW;
    END CATCH;
    SELECT t.ma_tk, t.ten_dang_nhap, t.vai_tro, t.ma_nql, n.ten_nql, n.chuc_vu
    FROM tai_khoan t LEFT JOIN nguoi_quan_ly n ON n.ma_nql = t.ma_nql WHERE t.ma_tk = @ma_tk;`,
  { ten: [sql.VarChar(50), ten], mk: [sql.NVarChar(100), matKhau] });
  const khu = await query('SELECT ma_khu_vuc, ten_khu_vuc FROM khu_vuc WHERE ma_nql = @n ORDER BY ma_khu_vuc', { n: [sql.Int, acc.ma_nql] });
  res.json({ token: signToken(acc), tai_khoan: { ...acc, khu_phu_trach: acc.ma_nql === null ? 'tất cả' : khu } });
});

const TINH_TRANG = ['Bình thường', 'Suy yếu', 'Nguy hiểm'];

/** Kiểm tra sơ bộ thân yêu cầu; CSDL vẫn là nơi quyết định cuối cùng (R1-R13). partial: cho phép thiếu trường (PUT). */
function validate(body, partial) {
  const b = body ?? {};
  const out = {};
  const num = (k, min, max) => {
    if (b[k] === undefined) { if (partial) return; throw new HttpError(400, `Thiếu trường ${k}.`); }
    const v = Number(b[k]);
    if (!Number.isFinite(v) || v < min || v > max) throw new HttpError(400, `${k} phải là số trong khoảng ${min} - ${max}.`);
    out[k] = v;
  };
  num('ma_loai', 1, 1e6);
  num('chieu_cao', 0.1, 100);
  num('ban_kinh_tan', 0.1, 30);
  num('dbh', -1e6, 1000);                       // DBH <= 0 để CSDL từ chối (R1, CHECK ck_cay_xanh_dbh)
  num('x', 600000, 800000);
  num('y', 1100000, 1300000);
  if (b.ngay_trong === undefined) { if (!partial) throw new HttpError(400, 'Thiếu trường ngay_trong.'); }
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(b.ngay_trong)) throw new HttpError(400, 'ngay_trong phải có dạng YYYY-MM-DD.');
  else out.ngay_trong = b.ngay_trong;
  if (b.tinh_trang === undefined) { if (!partial) out.tinh_trang = 'Bình thường'; }
  else if (!TINH_TRANG.includes(b.tinh_trang)) throw new HttpError(400, `tinh_trang phải là: ${TINH_TRANG.join(', ')}.`);
  else out.tinh_trang = b.tinh_trang;
  if (partial && (out.x === undefined) !== (out.y === undefined)) throw new HttpError(400, 'Đổi vị trí cần cả x và y.');
  if (b.ma_khu_vuc !== undefined) throw new HttpError(400, 'Không nhập ma_khu_vuc: khu vực do hệ thống tự gán theo vị trí.');
  return out;
}

// Cao độ Z nội suy IDW (lũy thừa 2) từ 5 cây gần nhất, cùng quy tắc script db/11, db/12; @bo_qua: mã cây đang sửa
const SQL_DIEM = `
  DECLARE @p GEOMETRY = geometry::Point(@x, @y, 3405);
  DECLARE @z FLOAT = (SELECT SUM(w * z) / SUM(w) FROM (
      SELECT TOP 5 c.shape.Z AS z, 1.0 / (POWER(c.shape.STDistance(@p), 2) + 1e-6) AS w
      FROM cay_xanh c WHERE c.ma_cay <> ISNULL(@bo_qua, -1) ORDER BY c.shape.STDistance(@p)) n);
  DECLARE @shape GEOMETRY = geometry::STGeomFromText(CONCAT('POINT (',
      CAST(@x AS DECIMAL(12, 3)), ' ', CAST(@y AS DECIMAL(12, 3)), ' ', CAST(@z AS DECIMAL(9, 3)), ')'), 3405);`;

async function docCay(ma) {
  const [row] = await query(`${SELECT_CAY} WHERE c.ma_cay = @ma`, { ma: [sql.Int, ma] });
  return row ? feature(row, 'wkt', 'ma_cay') : null;
}

function maCay(req) {
  const ma = Number(req.params.ma);
  if (!Number.isInteger(ma)) throw new HttpError(400, 'Mã cây phải là số nguyên.');
  return ma;
}

ghiRouter.post('/cay', requireAuth, async (req, res) => {
  const v = validate(req.body, false);
  // Bảng có trigger nên OUTPUT phải ghi INTO biến bảng
  const [r] = await withSession(req.user.ma_tk, `
    ${SQL_DIEM}
    DECLARE @moi TABLE (ma_cay INT);
    INSERT INTO cay_xanh (ma_loai, chieu_cao, ban_kinh_tan, dbh, ngay_trong, tinh_trang, shape)
    OUTPUT INSERTED.ma_cay INTO @moi
    VALUES (@ma_loai, @chieu_cao, @ban_kinh_tan, @dbh, @ngay_trong, @tinh_trang, @shape);
    SELECT ma_cay FROM @moi;`, {
    x: [sql.Float, v.x], y: [sql.Float, v.y], bo_qua: [sql.Int, null],
    ma_loai: [sql.Int, v.ma_loai], chieu_cao: [sql.Decimal(10, 2), v.chieu_cao], ban_kinh_tan: [sql.Decimal(10, 2), v.ban_kinh_tan],
    dbh: [sql.Decimal(5, 1), v.dbh], ngay_trong: [sql.Date, v.ngay_trong], tinh_trang: [sql.NVarChar(100), v.tinh_trang],
  });
  res.status(201).json(await docCay(r.ma_cay));
});

ghiRouter.put('/cay/:ma', requireAuth, async (req, res) => {
  const ma = maCay(req);
  const v = validate(req.body, true);
  const sets = [];
  const params = { ma: [sql.Int, ma], bo_qua: [sql.Int, ma], x: [sql.Float, v.x ?? 0], y: [sql.Float, v.y ?? 0] };
  const types = { ma_loai: sql.Int, chieu_cao: sql.Decimal(10, 2), ban_kinh_tan: sql.Decimal(10, 2), dbh: sql.Decimal(5, 1),
    ngay_trong: sql.Date, tinh_trang: sql.NVarChar(100) };
  for (const [k, t] of Object.entries(types)) if (v[k] !== undefined) { sets.push(`${k} = @${k}`); params[k] = [t, v[k]]; }
  if (v.x !== undefined) sets.push('shape = @shape');
  if (!sets.length) throw new HttpError(400, 'Không có trường nào để cập nhật.');
  const [r] = await withSession(req.user.ma_tk, `
    ${v.x !== undefined ? SQL_DIEM : ''}
    UPDATE cay_xanh SET ${sets.join(', ')} WHERE ma_cay = @ma;
    SELECT @@ROWCOUNT AS so_dong;`, params);
  if (!r?.so_dong) throw new HttpError(404, 'Không tìm thấy cây.');
  res.json(await docCay(ma));
});

ghiRouter.delete('/cay/:ma', requireAuth, async (req, res) => {
  const ma = maCay(req);
  const [r] = await withSession(req.user.ma_tk, `
    DELETE FROM cay_xanh WHERE ma_cay = @ma;
    SELECT @@ROWCOUNT AS so_dong;`, { ma: [sql.Int, ma] });
  if (!r?.so_dong) throw new HttpError(404, 'Không tìm thấy cây.');
  res.status(204).end();
});

// Khôi phục dữ liệu cây mặc định (sp_khoi_phuc_mac_dinh, script db/21): chỉ tài khoản kỹ thuật admin (ma_nql trống).
// GET: xem trước danh sách thay đổi của người quản lý sẽ bị hoàn tác; POST: thực hiện (CSDL kiểm tra lại quyền, lỗi 50401).
function chiAdmin(req) {
  if (req.user.ma_nql !== null && req.user.ma_nql !== undefined)
    throw new HttpError(403, 'Chỉ tài khoản kỹ thuật (admin) được khôi phục dữ liệu mặc định.');
}
const tomTatKhoiPhuc = (rows) => ({
  so_xoa_cay_them: rows.filter((r) => r.hanh_dong === 'xoa_cay_them').length,
  so_hoan_tac_sua: rows.filter((r) => r.hanh_dong === 'hoan_tac_sua').length,
  so_phuc_hoi_cay_xoa: rows.filter((r) => r.hanh_dong === 'phuc_hoi_cay_xoa').length,
  chi_tiet: rows,
});
ghiRouter.get('/khoi-phuc', requireAuth, async (req, res) => {
  chiAdmin(req);
  res.json(tomTatKhoiPhuc(await query('EXEC sp_khoi_phuc_mac_dinh @thuc_hien = 0')));
});
ghiRouter.post('/khoi-phuc', requireAuth, async (req, res) => {
  chiAdmin(req);
  res.json(tomTatKhoiPhuc(await withSession(req.user.ma_tk, 'EXEC sp_khoi_phuc_mac_dinh @thuc_hien = 1;')));
});

// Nhật ký thay đổi cây (script db/22): admin xem chi tiết giá trị trước / sau và hoàn tác từng thay đổi.
// ?gioi_han=<1-500, mặc định 100>. co_the_hoan_tac: là thay đổi mới nhất của cây và có đủ giá trị để hoàn tác.
const docJson = (s) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
ghiRouter.get('/nhat-ky', requireAuth, async (req, res) => {
  chiAdmin(req);
  const n = req.query.gioi_han === undefined ? 100 : Number(req.query.gioi_han);
  if (!Number.isInteger(n) || n < 1 || n > 500) throw new HttpError(400, 'gioi_han phải là số nguyên 1 - 500.');
  const rows = await query(`
    SELECT TOP (@n) n.ma_nk, n.ma_cay, n.thao_tac, n.thoi_diem, t.ten_dang_nhap,
           CAST(CASE WHEN n.ma_tk IS NOT NULL AND t.ma_nql IS NULL THEN 1 ELSE 0 END AS BIT) AS la_admin,
           n.gia_tri_cu, n.gia_tri_moi,
           CAST(CASE WHEN NOT EXISTS (SELECT 1 FROM nhat_ky_cay s WHERE s.ma_cay = n.ma_cay AND s.ma_nk > n.ma_nk)
                      AND (n.thao_tac = 'them' OR n.gia_tri_cu IS NOT NULL) THEN 1 ELSE 0 END AS BIT) AS co_the_hoan_tac
    FROM nhat_ky_cay n LEFT JOIN tai_khoan t ON t.ma_tk = n.ma_tk
    ORDER BY n.ma_nk DESC`, { n: [sql.Int, n] });
  res.json(rows.map((r) => ({ ...r, ma_nk: Number(r.ma_nk), gia_tri_cu: docJson(r.gia_tri_cu), gia_tri_moi: docJson(r.gia_tri_moi) })));
});
ghiRouter.post('/nhat-ky/:ma_nk/hoan-tac', requireAuth, async (req, res) => {
  chiAdmin(req);
  const ma = Number(req.params.ma_nk);
  if (!Number.isInteger(ma) || ma < 1) throw new HttpError(400, 'Mã nhật ký không hợp lệ.');
  const [r] = await withSession(req.user.ma_tk, 'EXEC sp_hoan_tac_nhat_ky @ma_nk = @ma;', { ma: [sql.BigInt, ma] });
  res.json(r);
});
