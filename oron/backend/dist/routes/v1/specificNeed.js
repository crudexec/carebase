"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const specificNeeds_1 = require("controllers/specificNeeds");
const checkJwt_1 = require("middleware/checkJwt");
const router = (0, express_1.Router)();
router.post('/add/basic-information', [checkJwt_1.checkJwt], specificNeeds_1.addBasicInformation);
router.patch('/edit/basic-information', [checkJwt_1.checkJwt], specificNeeds_1.editBasicInformation);
router.post('/create-generic', [checkJwt_1.checkJwt], specificNeeds_1.createGenericSpecificNeeds);
router.post('/add/current-needs-and-support', [checkJwt_1.checkJwt], specificNeeds_1.addCurrentNeedsAndSupport);
router.patch('/edit/current-needs-and-support', [checkJwt_1.checkJwt], specificNeeds_1.editCurrentNeedsAndSupport);
router.post('/add/service-needs', [checkJwt_1.checkJwt], specificNeeds_1.addServiceNeeds);
router.patch('/edit/service-needs', [checkJwt_1.checkJwt], specificNeeds_1.editServiceNeeds);
router.post('/add/authorization', [checkJwt_1.checkJwt], specificNeeds_1.addAuthorization);
router.patch('/edit/authorization', [checkJwt_1.checkJwt], specificNeeds_1.editAuthorization);
router.delete('/delete', [checkJwt_1.checkJwt], specificNeeds_1.deleteSpecificNeeds);
router.get('/retrieve', [checkJwt_1.checkJwt], specificNeeds_1.retrieveGenericSpecificNeeds);
exports.default = router;
//# sourceMappingURL=specificNeed.js.map