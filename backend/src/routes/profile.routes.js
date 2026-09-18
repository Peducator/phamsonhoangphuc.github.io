'use strict';

const { Router } = require('express');
const controller = require('../controllers/profile.controller');
const rateLimit = require('../middlewares/rate-limit');
const requireSecret = require('../middlewares/require-secret');

const router = Router();

router.get('/', controller.get); // công khai
router.patch('/', rateLimit, requireSecret, controller.update); // route ghi duy nhất

module.exports = router;
