'use strict';

const service = require('../services/profile.service');

function get(req, res) {
  res.json(service.get());
}

function update(req, res) {
  res.json(service.update(req.body));
}

module.exports = { get, update };
