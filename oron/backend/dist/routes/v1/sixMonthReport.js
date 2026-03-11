"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkJwt_1 = require("middleware/checkJwt");
const SixMonthReport_1 = require("controllers/SixMonthReport");
const router = (0, express_1.Router)();
router.post('/generate', [checkJwt_1.checkJwt], SixMonthReport_1.generateSixMonthReport);
router.get('/all', [checkJwt_1.checkJwt], SixMonthReport_1.retrieveAllReports);
router.get('/treatment-plan/:treatmentPlanId', [checkJwt_1.checkJwt], SixMonthReport_1.retrieveReportsByTreatmentPlan);
router.get('/:reportId', [checkJwt_1.checkJwt], SixMonthReport_1.retrieveSingleReport);
router.get('/:reportId/status', [checkJwt_1.checkJwt], SixMonthReport_1.getReportStatus);
router.get('/:reportId/export', [checkJwt_1.checkJwt], SixMonthReport_1.exportReportToPDF);
router.patch('/:reportId/finalize', [checkJwt_1.checkJwt], SixMonthReport_1.finalizeReport);
router.delete('/:reportId', [checkJwt_1.checkJwt], SixMonthReport_1.deleteReport);
exports.default = router;
//# sourceMappingURL=sixMonthReport.js.map