import { Router } from 'express';

import {
  addReferenceForm,
  editReferenceForm,
  retrieveReferenceForm,
  submitReferenceForm,
} from 'controllers/forms/referenceForm';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add', [checkJwt], addReferenceForm);
router.patch('/edit', [checkJwt], editReferenceForm);
router.get('/retrieve', [checkJwt], retrieveReferenceForm);
router.patch('/submit', [checkJwt], submitReferenceForm);

export default router;
