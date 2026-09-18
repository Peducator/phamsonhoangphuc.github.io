'use strict';

const {
  fail,
  now,
  SLUG_RE,
  slugify,
  pickFrom,
  compact,
  vString,
  vStringArray,
  vPathOrUrl,
  vEnum,
  assertValid,
  suggestSlug,
  newId,
} = require('./shared');
const store = require('../data/store');

const MAX_CONTENT = 100_000;
const MAX_TAGS = 10;
const TAG_MAX_LEN = 30;
const WORDS_PER_MINUTE = 200;

function checkSlugFormat(slug, errors) {
  if (!SLUG_RE.test(slug)) {
    errors.push(`"slug" chỉ được chứa a-z, 0-9 và dấu "-" (nhận được: "${slug}")`);
  }
}

function clean(body, { partial }) {
  const errors = [];
  const out = {};

  out.title = vString(errors, 'title', body.title, { required: !partial, max: 160 });
  out.content = vString(errors, 'content', body.content, { required: !partial, max: MAX_CONTENT });

  // excerpt: không gửi thì create() tự cắt từ content (README 6.2).
  out.excerpt = vString(errors, 'excerpt', body.excerpt, { max: 300 });

  const tags = vStringArray(errors, 'tags', body.tags, { maxItems: MAX_TAGS, maxLen: TAG_MAX_LEN });
  if (tags !== undefined) out.tags = tags;

  const cover = vPathOrUrl(errors, 'coverImage', body.coverImage);
  if (cover !== undefined) out.coverImage = cover;

  const status = vEnum(errors, 'status', body.status, ['draft', 'published']);
  if (status !== undefined) out.status = status;

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string' || body.slug.trim() === '') {
      errors.push('"slug" nếu gửi phải là chuỗi không rỗng');
    } else {
      checkSlugFormat(body.slug.trim(), errors);
      out.slug = body.slug.trim();
    }
  }

  assertValid(errors);
  return out;
}

/** Giới hạn phân trang — README 12 câu 2: có ngay từ đầu, mặc định 1/10, tối đa 50. */
function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit };
}

function isTaken(slug) {
  return store.read('blog').some((p) => p.slug === slug);
}

function withServerFields(data, base) {
  const merged = { ...base, ...compact(data) };

  // Excerpt tự sinh nếu chưa có: cắt 160 ký tự đầu của content.
  if (!merged.excerpt && merged.content) {
    merged.excerpt = merged.content.replace(/\s+/g, ' ').slice(0, 160) + (merged.content.length > 160 ? '…' : '');
  }

  // readingTime: tổng số từ / 200 từ mỗi phút, ít nhất 1 phút.
  const words = merged.content.trim().split(/\s+/).filter(Boolean).length;
  merged.readingTimeMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  // publishedAt: set lần ĐẦU chuyển sang published, các lần sau giữ nguyên.
  if (merged.status === 'published' && !merged.publishedAt) {
    merged.publishedAt = now();
  }
  if (merged.status === 'draft') {
    merged.publishedAt = null;
  }

  return merged;
}

/** Danh sách công khai: chỉ bài published, mới nhất trước, có phân trang. */
function listPublic(query = {}) {
  const { page, limit } = parsePagination(query);
  const published = store
    .read('blog')
    .filter((p) => p.status === 'published')
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
  const total = published.length;
  const start = (page - 1) * limit;
  return {
    items: published.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Danh sách cho route ghi (có secret): thấy cả draft — phục vụ quản trị. */
function listAdmin() {
  return [...store.read('blog')].sort((a, b) =>
    String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)),
  );
}

function findBySlug(slug) {
  return store.read('blog').find((p) => p.slug === slug) || null;
}

/** GET chi tiết công khai: bài draft trả 404 như thể không tồn tại. */
function getPublic(slug) {
  const found = findBySlug(slug);
  if (!found || found.status !== 'published') {
    fail(404, 'NOT_FOUND', `Không có bài viết nào với slug "${slug}".`);
  }
  return found;
}

/** GET chi tiết cho route ghi: thấy cả draft. */
function getAdmin(slug) {
  const found = findBySlug(slug);
  if (!found) fail(404, 'NOT_FOUND', `Không có bài viết nào với slug "${slug}".`);
  return found;
}

function create(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'VALIDATION_ERROR', 'Body phải là object.');
  }

  const data = clean(body, { partial: false });
  const slug = data.slug || slugify(data.title);
  if (!slug) fail(400, 'VALIDATION_ERROR', 'Không sinh được slug từ "title" — hãy gửi "slug" trong body.');
  if (isTaken(slug)) {
    const error = new Error(`Slug "${slug}" đã tồn tại.`);
    error.status = 409;
    error.code = 'SLUG_CONFLICT';
    error.details = { suggestedSlug: suggestSlug(slug, isTaken) };
    throw error;
  }

  const ts = now();
  const record = withServerFields(
    {
      tags: [],
      coverImage: '',
      status: 'draft', // an toàn hơn: viết xong mới công khai (README 12 câu 3)
      publishedAt: null,
    },
    {
      id: newId(),
      slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt ?? '',
      createdAt: ts,
      updatedAt: ts,
    },
  );

  store.write('blog', [...store.read('blog'), record]);
  return record;
}

function update(slug, body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'VALIDATION_ERROR', 'Body phải là object.');
  }
  if (Object.keys(body).length === 0) {
    fail(400, 'VALIDATION_ERROR', 'Body rỗng — các trường có thể sửa: title, excerpt, content, tags, coverImage, status, slug.');
  }

  const record = getAdmin(slug);
  const data = clean(body, { partial: true });

  if (data.slug && data.slug !== record.slug && isTaken(data.slug)) {
    const error = new Error(`Slug "${data.slug}" đã tồn tại.`);
    error.status = 409;
    error.code = 'SLUG_CONFLICT';
    error.details = { suggestedSlug: suggestSlug(data.slug, isTaken) };
    throw error;
  }

  const prevPublishedAt = record.publishedAt;
  for (const [key, value] of Object.entries(pickFrom(data, ['title', 'excerpt', 'content', 'tags', 'coverImage', 'status', 'slug']))) {
    if (value !== undefined) record[key] = value;
  }

  const merged = withServerFields(data, record);
  // withServerFields trả object mới — gán lại từng trường server đã tính vào record.
  record.excerpt = merged.excerpt;
  record.readingTimeMinutes = merged.readingTimeMinutes;
  record.publishedAt = merged.publishedAt === undefined ? prevPublishedAt : merged.publishedAt;
  record.updatedAt = now();

  store.write('blog', store.read('blog'));
  return record;
}

function remove(slug) {
  const record = getAdmin(slug);
  store.write('blog', store.read('blog').filter((p) => p.id !== record.id));
  return record;
}

module.exports = { listPublic, listAdmin, getPublic, getAdmin, create, update, remove };
