import { Router } from 'express';

import {
  addHepatitisBPersonalInformation,
  addHepatitisAttestation,
  signHepatitisBSignatureForm,
  editHepatitisBPersonalInformation,
  editHepatitisAttestation,
  editHepatitisBSignatureForm,
  retrieveHepatitisBForm,
  submitHepatitisForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/personalInformation', [checkJwt], addHepatitisBPersonalInformation);
router.post('/add/attestation', [checkJwt], addHepatitisAttestation);
router.post('/add/signature', [checkJwt], signHepatitisBSignatureForm);
router.patch('/edit/personalInformation', [checkJwt], editHepatitisBPersonalInformation);
router.patch('/edit/attestation', [checkJwt], editHepatitisAttestation);
router.patch('/edit/signature', [checkJwt], editHepatitisBSignatureForm);
router.get('/retrieve', [checkJwt], retrieveHepatitisBForm);
router.patch('/submit', [checkJwt], submitHepatitisForm);

export default router;
