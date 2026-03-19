const express = require('express');
const router = express.Router();

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const { submitTest, listMyResults, getResultsByTest } = require('../../controllers/api/results.controller');

router.post('/tests/:id/submit', isAuthenticated, submitTest);
router.get('/me', isAuthenticated, listMyResults);
router.get('/tests/:id', isAuthenticated, requireRole('administrador'), getResultsByTest);

module.exports = router;
