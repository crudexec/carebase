"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CJISForm_1 = require("controllers/forms/CJISForm");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/addEmployeeInformation', [checkJwt_1.checkJwt], CJISForm_1.addEmployeeInformation);
router.patch('/editEmployeeInformation', [checkJwt_1.checkJwt], CJISForm_1.editEmployeeInformation);
router.post('/addSignature', [checkJwt_1.checkJwt], CJISForm_1.addSignatureData);
router.patch('/editSignature', [checkJwt_1.checkJwt], CJISForm_1.editSignatureData);
router.post('/submitCJISForm', [checkJwt_1.checkJwt], CJISForm_1.submitCJISForm);
router.get('/retrieveCJISForm', [checkJwt_1.checkJwt], CJISForm_1.retrieveCJISForm);
router.post('/addPreRegistrationForm', [checkJwt_1.checkJwt], CJISForm_1.addCJISPreRegistrationForm);
exports.default = router;
//# sourceMappingURL=cjisForm.js.map