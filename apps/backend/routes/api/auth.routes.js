import express from 'express';
import authController from '../../controllers/api/auth.controller.js';

const router = express.Router();
const { getMe } = authController;

router.get('/me', getMe);

export default router;
