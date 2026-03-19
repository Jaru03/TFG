const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin, getAdminMe } = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/adminAuth');

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', requireAdmin, getAdminMe);

module.exports = router;
