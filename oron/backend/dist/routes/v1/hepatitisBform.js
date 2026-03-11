"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/personalInformation', [checkJwt_1.checkJwt], forms_1.addHepatitisBPersonalInformation);
router.post('/add/attestation', [checkJwt_1.checkJwt], forms_1.addHepatitisAttestation);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.signHepatitisBSignatureForm);
router.patch('/edit/personalInformation', [checkJwt_1.checkJwt], forms_1.editHepatitisBPersonalInformation);
router.patch('/edit/attestation', [checkJwt_1.checkJwt], forms_1.editHepatitisAttestation);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editHepatitisBSignatureForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveHepatitisBForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitHepatitisForm);
exports.default = router;
//# sourceMappingURL=hepatitisBform.js.map