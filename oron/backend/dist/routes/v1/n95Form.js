"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/attestation', [checkJwt_1.checkJwt], forms_1.addN95AttestationForm);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.addN95SignatureForm);
router.patch('/edit/attestation', [checkJwt_1.checkJwt], forms_1.editN95AttestationForm);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editN95SignatureForm);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveN95Form);
exports.default = router;
//# sourceMappingURL=n95Form.js.map