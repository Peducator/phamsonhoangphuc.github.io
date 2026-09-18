'use strict';

const service = require('../services/blog.service');

// Controller không try/catch: service ném lỗi, Express 5 đẩy về error-handler.
// Riêng lỗi 409 SLUG_CONFLICT có details.suggestedSlug — tách ra để đưa vào body response.

function toConflict(err) {
  return { error: { code: 'SLUG_CONFLICT', message: err.message, details: err.details } };
}

// ---- GET công khai ----

function listPublic(req, res) {
  res.json(service.listPublic(req.query));
}

function getPublic(req, res) {
  res.json(service.getPublic(req.params.slug));
}

// ---- GET cho quản trị (có secret): thấy cả draft ----

function listAdmin(req, res) {
  const items = service.listAdmin();
  res.json({ items, total: items.length });
}

function getAdmin(req, res) {
  res.json(service.getAdmin(req.params.slug));
}

// ---- Route ghi ----

function create(req, res) {
  try {
    res.status(201).json(service.create(req.body));
  } catch (err) {
    if (err.status === 409) return res.status(409).json(toConflict(err));
    throw err;
  }
}

function update(req, res) {
  try {
    res.json(service.update(req.params.slug, req.body));
  } catch (err) {
    if (err.status === 409) return res.status(409).json(toConflict(err));
    throw err;
  }
}

function remove(req, res) {
  res.json(service.remove(req.params.slug));
}

module.exports = { listPublic, getPublic, listAdmin, getAdmin, create, update, remove };
