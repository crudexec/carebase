import { Router } from 'express';

import { fillBioData, editBioData, retrieveBioData } from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';
import { validatorCreateBioData } from 'middleware/validation/forms/validatorCreateBioData';

const router = Router();

router.post('/add', [checkJwt, validatorCreateBioData], fillBioData);
router.patch('/update', [checkJwt], editBioData);
router.get('/retrieve', [checkJwt], retrieveBioData);

export default router;
