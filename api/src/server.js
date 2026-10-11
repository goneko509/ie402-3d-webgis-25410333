// Điểm khởi động: node --env-file=.env src/server.js
import { app } from './app.js';
import { config } from './config.js';
import { getPool } from './db.js';

await getPool();   // kết nối CSDL trước khi nhận yêu cầu, lỗi cấu hình sẽ hiện ngay
app.listen(config.port, () => {
  console.log(`API WebGIS cây xanh: http://localhost:${config.port}/api  (CSDL ${config.db.database}${config.isTest ? ', chế độ kiểm thử' : ''})`);
});
