"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const validatorCreateBioData_1 = require("middleware/validation/forms/validatorCreateBioData");
const router = (0, express_1.Router)();
router.post('/add', [checkJwt_1.checkJwt, validatorCreateBioData_1.validatorCreateBioData], forms_1.fillBioData);
router.patch('/update', [checkJwt_1.checkJwt], forms_1.editBioData);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveBioData);
exports.default = router;
//# sourceMappingURL=biodata.js.map