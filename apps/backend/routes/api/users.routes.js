import express from 'express';
import { isAuthenticated, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { changeRoleSchema } from '../../validators/schemas.js';
import usersController from '../../controllers/api/users.controller.js';

const router = express.Router();
const { listUsers, changeUserRole, deleteUser } = usersController;

router.get('/', isAuthenticated, requireRole('administrador'), listUsers);
router.put('/:id', isAuthenticated, requireRole('administrador'), validateBody(changeRoleSchema), changeUserRole);
router.delete('/:id', isAuthenticated, requireRole('administrador'), deleteUser);

export default router;
