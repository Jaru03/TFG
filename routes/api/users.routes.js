const express = require('express');
const router = express.Router();

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const { listUsers, changeUserRole, deleteUser } = require('../../controllers/api/users.controller');

router.get('/', isAuthenticated, requireRole('administrador'), listUsers);
router.put('/:id', isAuthenticated, requireRole('administrador'), changeUserRole);
router.delete('/:id', isAuthenticated, requireRole('administrador'), deleteUser);

module.exports = router;
