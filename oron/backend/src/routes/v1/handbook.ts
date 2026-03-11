import { Router } from 'express';

import { agreeHandbook, retrieveHandbookAgreement } from 'controllers/employeeHandbook';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/agree', [checkJwt], agreeHandbook);
router.get('/retrieve', [checkJwt], retrieveHandbookAgreement);

export default router;
