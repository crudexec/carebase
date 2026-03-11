import { Router } from 'express';

import {
  fillTbRiskAssessmentForm,
  editTbRiskAssessmentForm,
  signTbSignatureForm,
  editTbSignatureForm,
  retrieveTuberculosisForm,
  editPPDAdministrationForm,
  fillPPDAdministrationForm,
  submitTuberculosisForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/riskAssessment', [checkJwt], fillTbRiskAssessmentForm);
router.patch('/edit/riskAssessment', [checkJwt], editTbRiskAssessmentForm);
router.post('/add/ppdAdministration', [checkJwt], fillPPDAdministrationForm);
router.patch('/edit/ppdAdministration', [checkJwt], editPPDAdministrationForm);
router.post('/add/signature', [checkJwt], signTbSignatureForm);
router.patch('/edit/signature', [checkJwt], editTbSignatureForm);
router.get('/retrieve', [checkJwt], retrieveTuberculosisForm);
router.patch('/submit', [checkJwt], submitTuberculosisForm);

export default router;
