import { Router } from 'express';

import {
  addMMRAttestationForm,
  addMMRSignatureForm,
  addMMRPersonalInformation,
  editMMRPersonalInformation,
  editMMRSignatureForm,
  editMMRAttestationForm,
  retrieveMMRFullForm,
  submitMMRForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/personalInformation', [checkJwt], addMMRPersonalInformation);
router.post('/add/signature', [checkJwt], addMMRSignatureForm);
router.post('/add/attestation', [checkJwt], addMMRAttestationForm);
router.patch('/edit/personalInformation', [checkJwt], editMMRPersonalInformation);
router.patch('/edit/signature', [checkJwt], editMMRSignatureForm);
router.patch('/edit/attestation', [checkJwt], editMMRAttestationForm);
router.get('/retrieve', [checkJwt], retrieveMMRFullForm);
router.patch('/submit', [checkJwt], submitMMRForm);

export default router;
