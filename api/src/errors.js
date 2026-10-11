// Ánh xạ lỗi SQL Server (THROW của trigger / thủ tục, vi phạm ràng buộc) sang mã HTTP (đặc tả mục 5).

export class HttpError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

const SQL_ERRORS = {
  50101: [400, 'Vị trí cây không hợp lệ (thiếu tọa độ hoặc sai hệ tọa độ EPSG:3405).'],
  50102: [422, 'Vị trí nằm ngoài vùng nghiên cứu hoặc nằm đúng trên ranh giới khu vực.'],
  50103: [422, 'Vị trí cây nằm trong tòa nhà: chọn vị trí ngoài nền nhà.'],
  50104: [403, 'Bạn chỉ được thêm, sửa, xóa cây trong khu vực được phân công.'],
  50201: [401, 'Sai tên đăng nhập, mật khẩu hoặc tài khoản đã bị khóa.'],
  50301: [400, 'Hệ số tầm đổ phải trong khoảng 0,5 - 1,5.'],
  50401: [403, 'Chỉ tài khoản kỹ thuật (admin) được khôi phục dữ liệu mặc định / hoàn tác thay đổi.'],
  50402: [404, 'Không tìm thấy mục nhật ký.'],
  50403: [409, 'Chỉ hoàn tác được thay đổi mới nhất của cây (cây đã có thay đổi sau đó).'],
  50404: [409, 'Mục nhật ký này không lưu giá trị cũ (ghi trước khi có nhật ký chi tiết), không hoàn tác được.'],
  50405: [409, 'Cây đã tồn tại, không thêm lại được.'],
};

export function toHttpError(err) {
  if (err instanceof HttpError) return err;
  const number = err?.number ?? err?.originalError?.info?.number;
  if (SQL_ERRORS[number]) {
    const [status, message] = SQL_ERRORS[number];
    return new HttpError(status, message, { sql_error: number });
  }
  if (number === 547) {
    // CHECK / FOREIGN KEY: tên ràng buộc nằm trong thông điệp, ví dụ "ck_cay_xanh_dbh"
    const constraint = /constraint "([^"]+)"/.exec(err.message)?.[1];
    return new HttpError(400, 'Dữ liệu vi phạm ràng buộc toàn vẹn.', { sql_error: 547, rang_buoc: constraint });
  }
  return new HttpError(500, 'Lỗi máy chủ.', process.env.NODE_ENV === 'production' ? undefined : { loi: err?.message });
}

// Middleware cuối của Express
export function errorHandler(err, req, res, _next) {
  const e = toHttpError(err);
  if (e.status >= 500) console.error(err);
  res.status(e.status).json({ loi: e.message, ...(e.detail ? { chi_tiet: e.detail } : {}) });
}
