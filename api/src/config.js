// Cấu hình đọc từ biến môi trường (file .env không commit; mẫu ở .env.example).
const env = process.env;

function required(name) {
  const v = env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name} (xem .env.example)`);
  return v;
}

// DB_SERVER: "localhost" + DB_PORT (khuyên dùng; không cần dịch vụ SQL Browser), "localhost\SQLEXPRESS" (instance có tên,
// cần SQL Browser đang chạy) hoặc "xxx.database.windows.net" (Azure SQL, cổng 1433)
const [server, instanceName] = (env.DB_SERVER || 'localhost').split('\\');
const dbPort = instanceName ? undefined : Number(env.DB_PORT || 1433);

export const config = {
  port: Number(env.PORT || 3001),
  isTest: env.NODE_ENV === 'test',
  corsOrigin: (env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  // Thư mục bản build giao diện (web/dist) do chính API phục vụ khi triển khai một app duy nhất (Azure); local để trống
  staticDir: env.STATIC_DIR || '',
  jwtSecret: required('JWT_SECRET'),
  jwtExpires: env.JWT_EXPIRES || '8h',
  db: {
    server,
    ...(dbPort ? { port: dbPort } : {}),
    database: env.DB_NAME || 'ie402_green_space',
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    pool: { max: Number(env.DB_POOL_MAX || 10), min: 0, idleTimeoutMillis: 30000 },
    options: {
      instanceName,
      encrypt: true,
      trustServerCertificate: env.DB_TRUST_CERT !== 'false',   // local tự ký: true; Azure: false
    },
  },
};
