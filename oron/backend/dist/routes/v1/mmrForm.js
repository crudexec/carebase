"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/personalInformation', [checkJwt_1.checkJwt], forms_1.addMMRPersonalInformation);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.addMMRSignatureForm);
router.post('/add/attestation', [checkJwt_1.checkJwt], forms_1.addMMRAttestationForm);
router.patch('/edit/personalInformation', [checkJwt_1.checkJwt], forms_1.editMMRPersonalInformation);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editMMRSignatureForm);
router.patch('/edit/attestation', [checkJwt_1.checkJwt], forms_1.editMMRAttestationForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveMMRFullForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitMMRForm);
exports.default = router;
//# sourceMappingURL=mmrForm.js.map