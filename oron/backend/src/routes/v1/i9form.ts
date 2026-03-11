import { Router } from 'express';

import {
  fillCitizenshipInformation,
  fillPersonalInformation,
  fillDocument,
  fillSignature,
  retrieveI9Form,
  editCitizenshipInformation,
  editDocument,
  editPersonalInformation,
  editSignature,
  submitI9Form,
  uploadFilledI9Document,
  editFilledI9Document,
  retrieveFilledI9Document,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';
import { validatorAddDocument } from 'middleware/validation/forms/i9Form/validateAddDocument';
import { validatorAddSignature } from 'middleware/validation/forms/i9Form/validateAddSignature';
import { validatorCreateCitizenship } from 'middleware/validation/forms/i9Form/validateCitizenshipForm';
import { validatorCreatePersonalInformation } from 'middleware/validation/forms/i9Form/validatePersonalInformation';

const router = Router();

router.post('/add/personalInformation', [checkJwt, validatorCreatePersonalInformation], fillPersonalInformation);
router.post('/add/citizenshipInformation', [checkJwt, validatorCreateCitizenship], fillCitizenshipInformation);
router.post('/add/document', [checkJwt, validatorAddDocument], fillDocument);
router.post('/add/signature', [checkJwt, validatorAddSignature], fillSignature);
router.patch('/edit/personalInformation', [checkJwt], editPersonalInformation);
router.patch('/edit/citizenshipInformation', [checkJwt], editCitizenshipInformation);
router.patch('/edit/document', [checkJwt], editDocument);
router.patch('/edit/signature', [checkJwt], editSignature);
router.get('/retrieve', [checkJwt], retrieveI9Form);
router.patch('/submit', [checkJwt], submitI9Form);
router.post('/upload/pdf', [checkJwt], uploadFilledI9Document);
router.patch('/edit/pdf', [checkJwt], editFilledI9Document);
router.get('/retrieveFilled/pdf', [checkJwt], retrieveFilledI9Document);

export default router;
