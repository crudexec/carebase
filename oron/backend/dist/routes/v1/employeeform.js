"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/personalInformation', [checkJwt_1.checkJwt], forms_1.addPersonalInformation);
router.post('/add/emergencyContactInformation', [checkJwt_1.checkJwt], forms_1.addEmergencyContactInformation);
router.patch('/edit/personalInformation', [checkJwt_1.checkJwt], forms_1.editPersonalInformationForm);
router.patch('/edit/emergencyContactInformation', [checkJwt_1.checkJwt], forms_1.editEmergencyContactInformation);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrieveEmployeeDemographicForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitEmployeeDemographicForm);
exports.default = router;
//# sourceMappingURL=employeeform.js.map