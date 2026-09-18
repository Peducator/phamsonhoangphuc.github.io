'use strict';

/**
 * Helper dùng chung cho toàn bộ services: lỗi có status, validate, slug.
 * File này không import gì khác trong src — để tránh phụ thuộc vòng.
 */

const crypto = require('node:crypto');

/** Lỗi nghiệp vụ có status + code — error-handler trả thẳng ra JSON. */
class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

/** Ném HttpError trong service; Express 5 tự đẩy về error-handler. */
function fail(status, code, message) {
  throw new HttpError(status, code, message);
}

/** Thời gian ISO 8601 UTC — server tự set, client gửi lên bị bỏ qua. */
const now = () => new Date().toISOString();

const SLUG_RE = /^[a-z0-9-]+$/;

/** "Dự án mới!" → "du-an-moi" — bỏ dấu tiếng Việt, ký tự lạ thành "-", gộp rồi cắt "-". */
function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu thanh
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Copy TỪNG KHOÁ đã khai báo từ body (chống prototype pollution) —
 * không bao giờ Object.assign(record, body) với body thô. Trường lạ bị bỏ qua.
 */
function pickFrom(body, keys) {
  const out = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) out[key] = body[key];
  }
  return out;
}

/* ----- validators: nhận giá trị thô, trả về -----
 * undefined → không gửi (hoặc gửi "" — trim rỗng = coi như không gửi)
 * null      → client chủ động xoá giá trị (PATCH); trường bắt buộc sẽ bị báo lỗi
 * khác      → giá trị đã trim, hợp lệ
 * Lỗi validate được đẩy vào mảng errors; cuối hàm clean() gọi assertValid() một lần.
 */

function vString(errors, field, value, { required = false, max = Infinity } = {}) {
  if (value === undefined) {
    if (required) errors.push(`"${field}" là bắt buộc`);
    return undefined;
  }
  if (value === null) {
    if (required) errors.push(`"${field}" không được là null`);
    return null;
  }
  if (typeof value !== 'string') {
    errors.push(`"${field}" phải là chuỗi`);
    return undefined;
  }
  const s = value.trim();
  if (s.length === 0) {
    if (required) errors.push(`"${field}" là bắt buộc`);
    return undefined; // trim mà rỗng = coi như không gửi
  }
  if (s.length > max) {
    errors.push(`"${field}" tối đa ${max} ký tự`);
    return undefined;
  }
  return s;
}

function vStringArray(errors, field, value, { maxItems, maxLen } = {}) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) {
    errors.push(`"${field}" phải là mảng`);
    return undefined;
  }
  if (value.length > maxItems) {
    errors.push(`"${field}" tối đa ${maxItems} phần tử`);
    return undefined;
  }
  const out = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.trim().length === 0 || item.trim().length > maxLen) {
      errors.push(`"${field}" mỗi phần tử phải là chuỗi 1-${maxLen} ký tự`);
      return undefined;
    }
    out.push(item.trim());
  }
  return out;
}

function vUrl(errors, field, value, { schemes = ['https'], max = 2048 } = {}) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    errors.push(`"${field}" phải là chuỗi URL`);
    return undefined;
  }
  const s = value.trim();
  if (s.length === 0) return undefined;
  if (s.length > max) {
    errors.push(`"${field}" tối đa ${max} ký tự`);
    return undefined;
  }
  if (!schemes.some((scheme) => s.startsWith(`${scheme}://`))) {
    errors.push(`"${field}" phải bắt đầu bằng ${schemes.map((x) => `${x}://`).join(' hoặc ')}`);
    return undefined;
  }
  return s;
}

/** Ảnh/CV: bắt đầu bằng "/" (file tĩnh trong frontend/public) hoặc "https://". */
function vPathOrUrl(errors, field, value, { max = 2048 } = {}) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    errors.push(`"${field}" phải là chuỗi`);
    return undefined;
  }
  const s = value.trim();
  if (s.length === 0) return undefined;
  if (s.length > max) {
    errors.push(`"${field}" tối đa ${max} ký tự`);
    return undefined;
  }
  if (!s.startsWith('/') && !s.startsWith('https://')) {
    errors.push(`"${field}" phải bắt đầu bằng "/" hoặc "https://"`);
    return undefined;
  }
  return s;
}

function vBool(errors, field, value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'boolean') {
    errors.push(`"${field}" phải là true/false`);
    return undefined;
  }
  return value;
}

function vNumber(errors, field, value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`"${field}" phải là số`);
    return undefined;
  }
  return value;
}

function vEnum(errors, field, value, allowed) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    errors.push(`"${field}" phải là một trong: ${allowed.join(', ')}`);
    return undefined;
  }
  return value;
}

/** Bỏ các khoá mang giá trị undefined — tránh ghi đè giá trị cũ khi merge/spread. */
function compact(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Gọi cuối mỗi hàm clean(): còn lỗi nào → 400 gộp tất cả vào một message. */
function assertValid(errors) {
  if (errors.length > 0) fail(400, 'VALIDATION_ERROR', errors.join('; '));
}

/** Slug trùng → gợi ý "slug-2", "slug-3"... (không tự đổi ngầm — README mục 7). */
function suggestSlug(base, isTaken) {
  let n = 2;
  while (isTaken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

module.exports = {
  HttpError,
  fail,
  now,
  SLUG_RE,
  slugify,
  isPlainObject,
  pickFrom,
  compact,
  vString,
  vStringArray,
  vUrl,
  vPathOrUrl,
  vBool,
  vNumber,
  vEnum,
  assertValid,
  suggestSlug,
  newId: () => crypto.randomUUID(),
};
