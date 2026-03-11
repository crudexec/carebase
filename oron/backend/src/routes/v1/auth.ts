import { Router } from 'express';

import { registerAdmin } from 'controllers/admin';
import { login, register, changePassword, forgotPassword, resetPassword } from 'controllers/auth';
import { checkJwt } from 'middleware/checkJwt';
import { validatorLogin, validatorRegister, validatorChangePassword } from 'middleware/validation/auth';
import { countRequests } from 'middleware/metrics/index';

const router = Router();

router.post('/login', [countRequests, validatorLogin], login);
router.post('/register', [validatorRegister], register);
router.post('/admin/register', registerAdmin);
router.post('/change-password', [checkJwt, validatorChangePassword], changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
