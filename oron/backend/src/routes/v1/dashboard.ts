import { Router } from 'express';

import { fetchDashboardMetrics, fetchPendingVisits, fetchVisitDetails } from 'controllers/admin';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.get('/metrics', [checkJwt, checkRole('ADMINISTRATOR')], fetchDashboardMetrics);
router.get('/pending-visits', [checkJwt, checkRole('ADMINISTRATOR')], fetchPendingVisits);
router.get('/visit/:id/details', [checkJwt, checkRole('ADMINISTRATOR')], fetchVisitDetails);

export default router;
