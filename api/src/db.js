// Kết nối SQL Server: connection pool dùng chung, hàm truy vấn tham số hóa, và thao tác ghi có phiên làm việc.
import sql from 'mssql';
import { config } from './config.js';

export { sql };

let poolPromise;
export function getPool() {
  poolPromise ??= new sql.ConnectionPool(config.db).connect();
  return poolPromise;
}

/**
 * Truy vấn tham số hóa. params: { ten: [kiểu mssql, giá trị] }
 * Trả về recordset (mảng dòng); dùng cho thao tác đọc, không đặt phiên.
 */
export async function query(text, params = {}) {
  const req = (await getPool()).request();
  for (const [name, [type, value]] of Object.entries(params)) req.input(name, type, value);
  const res = await req.query(text);
  return res.recordset ?? [];
}

/**
 * Thao tác ghi dưới danh nghĩa một tài khoản đã đăng nhập (đặc tả mục 6).
 *
 * SESSION_CONTEXT gắn với KẾT NỐI, còn pool dùng chung nhiều kết nối. Vì vậy toàn bộ thao tác chạy trong MỘT batch
 * trên một kết nối: đặt phiên -> transaction -> câu lệnh ghi -> xóa phiên. Nhánh CATCH cũng xóa phiên rồi ném lại
 * lỗi (giữ nguyên số lỗi THROW của trigger), nên kết nối trả về pool không bao giờ còn phiên cũ, kể cả khi trigger
 * từ chối thao tác.
 *
 * body: các câu lệnh T-SQL thực hiện thao tác ghi; có thể SELECT kết quả ở cuối.
 */
export async function withSession(maTk, body, params = {}) {
  const batch = `
    SET XACT_ABORT OFF;
    BEGIN TRY
      EXEC sp_set_session_context @key = N'ma_tk', @value = @__ma_tk;
      BEGIN TRANSACTION;
      ${body}
      COMMIT TRANSACTION;
      EXEC sp_set_session_context @key = N'ma_tk', @value = NULL;
    END TRY
    BEGIN CATCH
      IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
      EXEC sp_set_session_context @key = N'ma_tk', @value = NULL;
      THROW;
    END CATCH;`;
  return query(batch, { ...params, __ma_tk: [sql.Int, maTk] });
}
