"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("controllers/admin");
const checkJwt_1 = require("middleware/checkJwt");
const checkRole_1 = require("middleware/checkRole");
const router = (0, express_1.Router)();
router.get('/metrics', [checkJwt_1.checkJwt, (0, checkRole_1.checkRole)('ADMINISTRATOR')], admin_1.fetchDashboardMetrics);
router.get('/pending-visits', [checkJwt_1.checkJwt, (0, checkRole_1.checkRole)('ADMINISTRATOR')], admin_1.fetchPendingVisits);
router.get('/visit/:id/details', [checkJwt_1.checkJwt, (0, checkRole_1.checkRole)('ADMINISTRATOR')], admin_1.fetchVisitDetails);
exports.default = router;
//# sourceMappingURL=dashboard.js.map