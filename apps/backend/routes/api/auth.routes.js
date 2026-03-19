const express = require('express');
const router = express.Router();

const { getMe } = require('../../controllers/api/auth.controller');

router.get('/me', getMe);

module.exports = router;
