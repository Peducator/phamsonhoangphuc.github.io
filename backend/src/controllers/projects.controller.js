'use strict';

const service = require('../services/projects.service');

// Controller không try/catch: service ném lỗi, Express 5 đẩy về error-handler.
// Riêng lỗi 409 SLUG_CONFLICT có details.suggestedSlug — tách ra để đưa vào body response.

function toConflict(err) {
  return { error: { code: 'SLUG_CONFLICT', message: err.message, details: err.details } };
}

function list(req, res) {
  const items = service.list();
  res.json({ items, total: items.length });
}

function get(req, res) {
  res.json(service.get(req.params.slug));
}

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

module.exports = { list, get, create, update, remove };
