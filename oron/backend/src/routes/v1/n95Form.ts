import { Router } from 'express';

import {
  addN95AttestationForm,
  addN95SignatureForm,
  editN95AttestationForm,
  editN95SignatureForm,
  retrieveN95Form,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/attestation', [checkJwt], addN95AttestationForm);
router.post('/add/signature', [checkJwt], addN95SignatureForm);
router.patch('/edit/attestation', [checkJwt], editN95AttestationForm);
router.patch('/edit/signature', [checkJwt], editN95SignatureForm);
router.get('/retrieve', [checkJwt], retrieveN95Form);

export default router;
