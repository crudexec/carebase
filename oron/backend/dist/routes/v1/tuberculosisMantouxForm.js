"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/riskAssessment', [checkJwt_1.checkJwt], forms_1.fillTbRiskAssessmentForm);
router.patch('/edit/riskAssessment', [checkJwt_1.checkJwt], forms_1.editTbRiskAssessmentForm);
router.post('/add/ppdAdministration', [checkJwt_1.checkJwt], forms_1.fillPPDAdministrationForm);
router.patch('/edit/ppdAdministration', [checkJwt_1.checkJwt], forms_1.editPPDAdministrationForm);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.signTbSignatureForm);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editTbSignatureForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveTuberculosisForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitTuberculosisForm);
exports.default = router;
//# sourceMappingURL=tuberculosisMantouxForm.js.map