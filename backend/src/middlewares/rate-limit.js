'use strict';

const { rateLimit } = require('express-rate-limit');

function positiveInt(value, dflt) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : dflt;
}

const windowMs = positiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const limit = positiveInt(process.env.RATE_LIMIT_MAX, 10);

/**
 * Chống dò secret — xem README mục 9.2:
 * - Chỉ áp cho NHÓM ROUTE GHI (mount trong routes files), không áp cho GET công khai.
 * - skipSuccessfulRequests: chỉ đếm các lần THẤT BẠI — gõ đúng secret bao nhiêu lần cũng không bị chặn.
 * - Đặt middleware này TRƯỚC require-secret để các lần sai secret được đếm.
 */
module.exports = rateLimit({
  windowMs,
  limit,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    const resetAt = req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime).getTime() : Date.now() + windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: `Quá nhiều lần thử sai trong ${Math.round(windowMs / 60000)} phút. Thử lại sau ${retryAfter} giây.`,
      },
    });
  },
});
