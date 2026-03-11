import { Router } from 'express';

import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import {
  generateSixMonthReport,
  retrieveSingleReport,
  retrieveReportsByTreatmentPlan,
  retrieveAllReports,
  getReportStatus,
  finalizeReport,
  deleteReport,
  exportReportToPDF,
} from 'controllers/SixMonthReport';

const router = Router();

// Generate a new six-month report
router.post('/generate', [checkJwt], generateSixMonthReport);

// Get all reports (with filters)
router.get('/all', [checkJwt], retrieveAllReports);

// Get reports for a specific treatment plan
router.get('/treatment-plan/:treatmentPlanId', [checkJwt], retrieveReportsByTreatmentPlan);

// Get a single report by ID
router.get('/:reportId', [checkJwt], retrieveSingleReport);

// Get report generation status
router.get('/:reportId/status', [checkJwt], getReportStatus);

// Export report to PDF
router.get('/:reportId/export', [checkJwt], exportReportToPDF);

// Finalize a report (mark as final, add supervisor comments)
router.patch('/:reportId/finalize', [checkJwt], finalizeReport);

// Delete a report (soft delete)
router.delete('/:reportId', [checkJwt], deleteReport);

export default router;