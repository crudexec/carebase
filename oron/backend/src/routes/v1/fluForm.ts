import { Router } from 'express';

import {
  addFluAttestationForm,
  addFluSignatureForm,
  addFluPersonalInformation,
  editFluPersonalInformation,
  editFluSignatureForm,
  editFluAttestationForm,
  retrieveFluFullForm,
  submitFluForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/personalInformation', [checkJwt], addFluPersonalInformation);
router.post('/add/signature', [checkJwt], addFluSignatureForm);
router.post('/add/attestation', [checkJwt], addFluAttestationForm);
router.patch('/edit/personalInformation', [checkJwt], editFluPersonalInformation);
router.patch('/edit/signature', [checkJwt], editFluSignatureForm);
router.patch('/edit/attestation', [checkJwt], editFluAttestationForm);
router.get('/retrieve', [checkJwt], retrieveFluFullForm);
router.patch('/submit', [checkJwt], submitFluForm);

export default router;
