import { Router } from 'express';

import {
  addVaricellaPersonalInformationForm,
  addVaricellaSignatureForm,
  fillVaricellaAttestationForm,
  editVaricellaPersonalInformationForm,
  editVaricellaSignatureForm,
  editVaricellaAttestationForm,
  retrieveFullVaricellaForm,
  submitVaricellaForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/personalInformation', [checkJwt], addVaricellaPersonalInformationForm);
router.post('/add/signature', [checkJwt], addVaricellaSignatureForm);
router.post('/add/attestation', [checkJwt], fillVaricellaAttestationForm);
router.patch('/edit/personalInformation', [checkJwt], editVaricellaPersonalInformationForm);
router.patch('/edit/signature', [checkJwt], editVaricellaSignatureForm);
router.patch('/edit/attestation', [checkJwt], editVaricellaAttestationForm);
router.get('/retrieve', [checkJwt], retrieveFullVaricellaForm);
router.patch('/submit', [checkJwt], submitVaricellaForm);

export default router;
