import { Router } from 'express';

import {
  submitCJISForm,
  addEmployeeInformation,
  editEmployeeInformation,
  addSignatureData,
  editSignatureData,
  retrieveCJISForm,
  addCJISPreRegistrationForm,
} from 'controllers/forms/CJISForm';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/addEmployeeInformation', [checkJwt], addEmployeeInformation);
router.patch('/editEmployeeInformation', [checkJwt], editEmployeeInformation);
router.post('/addSignature', [checkJwt], addSignatureData);
router.patch('/editSignature', [checkJwt], editSignatureData);
router.post('/submitCJISForm', [checkJwt], submitCJISForm);
router.get('/retrieveCJISForm', [checkJwt], retrieveCJISForm);
router.post('/addPreRegistrationForm', [checkJwt], addCJISPreRegistrationForm);

export default router;
