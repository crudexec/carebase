"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forms_1 = require("controllers/forms");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/vaccinationInformation', [checkJwt_1.checkJwt], forms_1.fillPneumococcalVaccinationInformation);
router.post('/add/employeeInformation', [checkJwt_1.checkJwt], forms_1.fillVaccinationEmployeeInformation);
router.post('/add/signature', [checkJwt_1.checkJwt], forms_1.fillPneumococcalSignature);
router.patch('/edit/vaccinationInformation', [checkJwt_1.checkJwt], forms_1.editPneumococcalVaccinationInformation);
router.patch('/edit/employeeInformation', [checkJwt_1.checkJwt], forms_1.editPneumococcalEmployeeInformation);
router.patch('/edit/signature', [checkJwt_1.checkJwt], forms_1.editPneumococcalSignature);
router.get('/retrieve', [checkJwt_1.checkJwt], forms_1.retrievePneumococcalVaccinationForm);
router.patch('/submit', [checkJwt_1.checkJwt], forms_1.submitPneumococcalForm);
exports.default = router;
//# sourceMappingURL=pneumococcalVaccineForm.js.map