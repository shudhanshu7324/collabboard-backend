import { Router } from 'express';
import { handleSignup, handleLogin, handleRefresh } from './auth.controller.js';

const router = Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);
router.post('/refresh', handleRefresh);

export default router;