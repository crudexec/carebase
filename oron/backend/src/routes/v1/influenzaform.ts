import { Router } from 'express';

import {
  addInfluenzaAttestationForm,
  addInfluenzaEmployeeForm,
  addInfluenzaSignatureForm,
  editInfluenzaAttestationForm,
  editInfluenzaEmployeeForm,
  editInfluenzaSignatureForm,
  retrieveInfluenzaDeclinationFullForm,
  submitInfluenzaForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/personalInformation', [checkJwt], addInfluenzaEmployeeForm);
router.post('/add/attestation', [checkJwt], addInfluenzaAttestationForm);
router.post('/add/signature', [checkJwt], addInfluenzaSignatureForm);
router.patch('/edit/personalInformation', [checkJwt], editInfluenzaEmployeeForm);
router.patch('/edit/attestation', [checkJwt], editInfluenzaAttestationForm);
router.patch('/edit/signature', [checkJwt], editInfluenzaSignatureForm);
router.get('/retrieve', [checkJwt], retrieveInfluenzaDeclinationFullForm);
router.patch('/submit', [checkJwt], submitInfluenzaForm);

export default router;
