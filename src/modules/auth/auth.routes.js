import { Router } from 'express';
import { handleSignup, handleLogin, handleRefresh } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { signupSchema, loginSchema, refreshSchema } from './auth.schema.js';

const router = Router();

router.post('/signup', validate(signupSchema), handleSignup);
router.post('/login', validate(loginSchema), handleLogin);
router.post('/refresh', validate(refreshSchema), handleRefresh);

export default router;
