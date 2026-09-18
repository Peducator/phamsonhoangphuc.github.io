'use strict';

const { Router } = require('express');
const controller = require('../controllers/projects.controller');
const rateLimit = require('../middlewares/rate-limit');
const requireSecret = require('../middlewares/require-secret');

const router = Router();

// GET công khai
router.get('/', controller.list);
router.get('/:slug', controller.get);

// Route ghi: rate limit đếm lần sai TRƯỚC khi kiểm secret (README 9.2)
router.post('/', rateLimit, requireSecret, controller.create);
router.patch('/:slug', rateLimit, requireSecret, controller.update);
router.delete('/:slug', rateLimit, requireSecret, controller.remove);

module.exports = router;
