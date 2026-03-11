"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/personalInformation', [checkJwt_1.checkJwt], forms_1.addFluPersonalInformation);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.addFluSignatureForm);
router.post('/add/attestation', [checkJwt_1.checkJwt], forms_1.addFluAttestationForm);
router.patch('/edit/personalInformation', [checkJwt_1.checkJwt], forms_1.editFluPersonalInformation);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editFluSignatureForm);
router.patch('/edit/attestation', [checkJwt_1.checkJwt], forms_1.editFluAttestationForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveFluFullForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitFluForm);
exports.default = router;
//# sourceMappingURL=fluForm.js.map