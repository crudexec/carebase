"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/personalInformation', [checkJwt_1.checkJwt], forms_1.addVaricellaPersonalInformationForm);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.addVaricellaSignatureForm);
router.post('/add/attestation', [checkJwt_1.checkJwt], forms_1.fillVaricellaAttestationForm);
router.patch('/edit/personalInformation', [checkJwt_1.checkJwt], forms_1.editVaricellaPersonalInformationForm);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editVaricellaSignatureForm);
router.patch('/edit/attestation', [checkJwt_1.checkJwt], forms_1.editVaricellaAttestationForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveFullVaricellaForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitVaricellaForm);
exports.default = router;
//# sourceMappingURL=varicellaForm.js.map