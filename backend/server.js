'use strict';

/**
 * Personal site API — wiring chính.
 * Thứ tự middleware quan trọng (README mục 2 & 9):
 *   helmet → CORS → express.json(1mb) → audit log → routers → 404 → error-handler
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const store = require('./src/data/store');
const requestLog = require('./src/middlewares/request-log');
const errorHandler = require('./src/middlewares/error-handler');

const app = express();

function positiveInt(value, dflt) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : dflt;
}

// ----- CORS -----

// Danh sách origin phân tách bằng dấu phẩy; mặc định localhost:3000 (frontend Next dev).
// KHÔNG bao giờ để "*" khi deploy thật (README mục 11).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // origin undefined = curl / server-to-server → cho qua; trình duyệt sẽ luôn gửi origin.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false); // không header CORS → browser tự chặn, curl vẫn gọi được
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  // x-admin-secret phải được khai báo, nếu không trình duyệt chặn preflight ở mọi route ghi.
  allowedHeaders: ['Content-Type', 'x-admin-secret', 'Authorization'],
  maxAge: 86400,
};

// ----- Middleware toàn cục -----

// Chỉ set khi thật sự chạy sau reverse proxy — README mục 11.
// TRUST_PROXY = số hop (1, 2, ...) hoặc "true" (đặt sau 1 proxy tin được).
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : Number(process.env.TRUST_PROXY));
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // content cho phép 100k ký tự — 1mb là đủ dư
app.use(requestLog);

// ----- Routes -----

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/api/projects', require('./src/routes/projects.routes'));
app.use('/api/blog', require('./src/routes/blog.routes'));
app.use('/api/profile', require('./src/routes/profile.routes'));

// 404 cho mọi đường dẫn khác — trả JSON theo format chung, không phải trang HTML
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint không tồn tại.' } });
});

// Error handler cuối cùng — mọi lỗi của routes/services đổ về đây
app.use(errorHandler);

// ----- Khởi động -----

store.init(); // nạp dữ liệu + seed khi thiếu file; file JSON hỏng sẽ chết ngay ở đây

const PORT = positiveInt(process.env.PORT, 4000);
app.listen(PORT, () => {
  console.log(`[server] API đang chạy ở http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    console.warn('[server] ADMIN_SECRET chưa cấu hình — mọi route ghi sẽ trả 503 (fail-closed).');
  } else if (secret.length < 32) {
    console.warn('[server] ADMIN_SECRET ngắn hơn 32 ký tự — nên dùng: openssl rand -hex 32');
  }
  if (!process.env.CORS_ORIGIN) {
    console.warn('[server] CORS_ORIGIN chưa đặt — mặc định chỉ cho http://localhost:3000.');
  }
});

module.exports = app;
