'use strict';

const { Router } = require('express');
const controller = require('../controllers/blog.controller');
const rateLimit = require('../middlewares/rate-limit');
const requireSecret = require('../middlewares/require-secret');

const router = Router();

// GET công khai: chỉ bài published + phân trang ?page&limit
router.get('/', controller.listPublic);
router.get('/:slug', controller.getPublic);

// GET quản trị (có secret): thấy cả draft
router.get('/admin/all', rateLimit, requireSecret, controller.listAdmin);
router.get('/admin/:slug', rateLimit, requireSecret, controller.getAdmin);

// Route ghi: rate limit đếm lần sai TRƯỚC khi kiểm secret (README 9.2)
router.post('/', rateLimit, requireSecret, controller.create);
router.patch('/:slug', rateLimit, requireSecret, controller.update);
router.delete('/:slug', rateLimit, requireSecret, controller.remove);

module.exports = router;
