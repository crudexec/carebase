"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referenceForm_1 = require("controllers/forms/referenceForm");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add', [checkJwt_1.checkJwt], referenceForm_1.addReferenceForm);
router.patch('/edit', [checkJwt_1.checkJwt], referenceForm_1.editReferenceForm);
router.get('/retrieve', [checkJwt_1.checkJwt], referenceForm_1.retrieveReferenceForm);
router.patch('/submit', [checkJwt_1.checkJwt], referenceForm_1.submitReferenceForm);
exports.default = router;
//# sourceMappingURL=referenceform.js.map