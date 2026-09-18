'use strict';

const {
  fail,
  now,
  SLUG_RE,
  slugify,
  pickFrom,
  vString,
  vStringArray,
  vUrl,
  vPathOrUrl,
  vBool,
  vNumber,
  assertValid,
  suggestSlug,
  newId,
} = require('./shared');
const store = require('../data/store');

const MAX_DESCRIPTION = 20_000;
const MAX_TECH = 20;
const TECH_MAX_LEN = 40;
const MAX_URL = 2048;

/** Kiểm tra slug hợp lệ (khi client chỉ định). */
function checkSlugFormat(slug, errors) {
  if (!SLUG_RE.test(slug)) {
    errors.push(`"slug" chỉ được chứa a-z, 0-9 và dấu "-" (nhận được: "${slug}")`);
  }
}

function clean(body, { partial }) {
  const errors = [];
  const out = {};

  out.title = vString(errors, 'title', body.title, { required: !partial, max: 120 });
  out.summary = vString(errors, 'summary', body.summary, { required: !partial, max: 200 });
  out.description = vString(errors, 'description', body.description, { max: MAX_DESCRIPTION });

  const tech = vStringArray(errors, 'techStack', body.techStack, { maxItems: MAX_TECH, maxLen: TECH_MAX_LEN });
  if (tech !== undefined) out.techStack = tech;

  // links: chỉ nhận 2 khoá repo/demo, mỗi khoá phải là https URL (README 6.1).
  if (body.links !== undefined) {
    if (body.links === null) {
      out.links = null;
    } else if (typeof body.links === 'object' && !Array.isArray(body.links)) {
      const links = {};
      const repo = vUrl(errors, 'links.repo', body.links.repo, { max: MAX_URL });
      if (repo !== undefined && repo !== null) links.repo = repo;
      const demo = vUrl(errors, 'links.demo', body.links.demo, { max: MAX_URL });
      if (demo !== undefined && demo !== null) links.demo = demo;
      out.links = links;
    } else {
      errors.push('"links" phải là object { repo, demo }');
    }
  }

  const cover = vPathOrUrl(errors, 'coverImage', body.coverImage);
  if (cover !== undefined) out.coverImage = cover;

  const featured = vBool(errors, 'featured', body.featured);
  if (featured !== undefined) out.featured = featured;

  const order = vNumber(errors, 'order', body.order);
  if (order !== undefined) out.order = order;

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

function isTaken(slug) {
  return store.read('projects').some((p) => p.slug === slug);
}

function sorted(items) {
  return [...items].sort(
    (a, b) => a.order - b.order || String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

function list() {
  return sorted(store.read('projects'));
}

function findBySlug(slug) {
  return store.read('projects').find((p) => p.slug === slug) || null;
}

function get(slug) {
  const found = findBySlug(slug);
  if (!found) fail(404, 'NOT_FOUND', `Không có project nào với slug "${slug}".`);
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
  const record = {
    id: newId(),
    slug,
    title: data.title,
    summary: data.summary,
    description: data.description ?? '',
    techStack: data.techStack ?? [],
    links: data.links ?? {},
    coverImage: data.coverImage ?? '',
    featured: data.featured ?? false,
    order: data.order ?? 0,
    createdAt: ts,
    updatedAt: ts,
  };

  store.write('projects', [...store.read('projects'), record]);
  return record;
}

function update(slug, body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'VALIDATION_ERROR', 'Body phải là object.');
  }
  if (Object.keys(body).length === 0) {
    fail(400, 'VALIDATION_ERROR', 'Body rỗng — các trường có thể sửa: title, summary, description, techStack, links, coverImage, featured, order, slug.');
  }

  const record = get(slug); // 404 trước khi validate để không báo lỗi lung tung
  const data = clean(body, { partial: true });

  if (data.slug && data.slug !== record.slug && isTaken(data.slug)) {
    const error = new Error(`Slug "${data.slug}" đã tồn tại.`);
    error.status = 409;
    error.code = 'SLUG_CONFLICT';
    error.details = { suggestedSlug: suggestSlug(data.slug, isTaken) };
    throw error;
  }

  // Copy TỪNG KHOÁ đã khai báo — không Object.assign với body thô (chống prototype pollution).
  for (const [key, value] of Object.entries(pickFrom(data, ['title', 'summary', 'description', 'techStack', 'links', 'coverImage', 'featured', 'order', 'slug']))) {
    if (value !== undefined) record[key] = value;
  }
  record.updatedAt = now();

  store.write('projects', store.read('projects'));
  return record;
}

function remove(slug) {
  const record = get(slug);
  store.write('projects', store.read('projects').filter((p) => p.id !== record.id));
  return record; // trả về object vừa xoá để frontend cập nhật danh sách ngay
}

module.exports = { list, get, create, update, remove };
