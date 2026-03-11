"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeHandbook_1 = require("controllers/employeeHandbook");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/agree', [checkJwt_1.checkJwt], employeeHandbook_1.agreeHandbook);
router.get('/retrieve', [checkJwt_1.checkJwt], employeeHandbook_1.retrieveHandbookAgreement);
exports.default = router;
//# sourceMappingURL=handbook.js.map