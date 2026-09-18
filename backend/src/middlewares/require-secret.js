'use strict';

const crypto = require('node:crypto');
const { fail } = require('../services/shared');

/** Nhận secret qua 1 trong 2 cách: "x-admin-secret: <secret>" hoặc "Authorization: Bearer <secret>". */
function extractSecret(req) {
  const header = req.get('x-admin-secret');
  if (header) return header.trim();
  const auth = req.get('authorization');
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim();
  return '';
}

module.exports = function requireSecret(req, res, next) {
  const expected = process.env.ADMIN_SECRET;

  // Fail-closed: chưa cấu hình secret thì chặn TẤT CẢ route ghi, không có giá trị mặc định.
  if (!expected) {
    return next(fail(503, 'SERVICE_UNAVAILABLE', 'Chưa cấu hình ADMIN_SECRET — các route ghi đang bị chặn.'));
  }

  const provided = extractSecret(req);
  if (!provided) {
    return next(fail(401, 'UNAUTHORIZED', 'Thiếu secret. Gửi header "x-admin-secret" hoặc "Authorization: Bearer <secret>".'));
  }

  // timingSafeEqual NÉM lỗi khi 2 buffer khác độ dài → phải tự so độ dài trước.
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    // Không bao giờ log giá trị secret — chỉ báo sai.
    return next(fail(401, 'UNAUTHORIZED', 'Secret không đúng.'));
  }

  next();
};
