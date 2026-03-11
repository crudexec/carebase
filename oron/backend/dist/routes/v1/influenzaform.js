"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/personalInformation', [checkJwt_1.checkJwt], forms_1.addInfluenzaEmployeeForm);
router.post('/add/attestation', [checkJwt_1.checkJwt], forms_1.addInfluenzaAttestationForm);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.addInfluenzaSignatureForm);
router.patch('/edit/personalInformation', [checkJwt_1.checkJwt], forms_1.editInfluenzaEmployeeForm);
router.patch('/edit/attestation', [checkJwt_1.checkJwt], forms_1.editInfluenzaAttestationForm);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editInfluenzaSignatureForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveInfluenzaDeclinationFullForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitInfluenzaForm);
exports.default = router;
//# sourceMappingURL=influenzaform.js.map