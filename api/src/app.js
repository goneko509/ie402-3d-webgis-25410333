// Khởi tạo ứng dụng Express: CORS, JSON, các router, xử lý lỗi.
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { query } from './db.js';
import { docRouter } from './routes/doc.js';
import { ghiRouter } from './routes/ghi.js';
import { errorHandler, HttpError } from './errors.js';

export const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '100kb' }));

app.use('/api', docRouter);
app.use('/api', ghiRouter);

// Chỉ ở chế độ kiểm thử (pool 1 kết nối): đọc SESSION_CONTEXT của kết nối để chứng minh phiên đã được xóa
if (config.isTest) {
  app.get('/api/_kiem-thu/phien', async (_req, res) => {
    const [r] = await query(`SELECT CAST(SESSION_CONTEXT(N'ma_tk') AS INT) AS ma_tk, @@SPID AS spid`);
    res.json(r);
  });
}

// Triển khai một app (Azure): phục vụ giao diện React đã build cùng nguồn gốc với /api, không cần CORS
if (config.staticDir) app.use(express.static(path.resolve(config.staticDir), { maxAge: '1h' }));

app.use((_req, _res, next) => next(new HttpError(404, 'Không tìm thấy đường dẫn.')));
app.use(errorHandler);
