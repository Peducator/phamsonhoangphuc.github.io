'use strict';

/**
 * Error handler duy nhất của app — mọi lỗi của routes/controllers/services đổ về đây.
 * - Lỗi body-parse của express.json bắt theo err.type (không đoán theo câu chữ — README 9.5).
 * - HttpError từ services: trả status + code của nó.
 * - Còn lại: 500, chỉ log stack vào stdout, response chỉ "Internal server error".
 */

const { HttpError } = require('../services/shared');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  switch (err.type) {
    case 'entity.parse.failed':
      return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Body không phải JSON hợp lệ.' } });
    case 'entity.too.large':
      return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Body vượt quá 1mb.' } });
    case 'charset.unsupported':
      return res.status(415).json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Charset không được hỗ trợ.' } });
    default:
      break;
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  if (err.statusCode && typeof err.statusCode === 'number' && err.statusCode >= 400) {
    // Lỗi dựng sẵn của Express/express-rate-limit có statusCode nhưng không phải HttpError.
    return res.status(err.statusCode).json({ error: { code: 'REQUEST_ERROR', message: 'Request không hợp lệ.' } });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}\n${err.stack || err}`);
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
};
