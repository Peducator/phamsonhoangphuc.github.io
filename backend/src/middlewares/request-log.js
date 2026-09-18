'use strict';

/**
 * Audit log cho POST/PATCH/DELETE (README 9.6):
 * - Một dòng JSON prefix [audit]: thời điểm, method, path, IP, User-Agent, status, thời lượng.
 * - Ghi CẢ lần bị từ chối (401/429) để thấy dấu hiệu dò secret.
 * - Không log body và tuyệt đối không log giá trị secret.
 * - Ra stdout, để systemd/docker lo xoay vòng file — app tự không rotate.
 */

const METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

module.exports = function requestLog(req, res, next) {
  if (!METHODS.has(req.method)) return next();

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = {
      at: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
      status: res.statusCode,
      ms: Math.round(ms * 10) / 10,
    };
    console.log(`[audit] ${JSON.stringify(line)}`);
  });

  next();
};
