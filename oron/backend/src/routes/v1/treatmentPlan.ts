import { Router } from 'express';

import {
  addTreatmentBasicInformation,
  editTreatmentBasicInformation,
  addTreatmentGoal,
  editTreatmentGoal,
  addTreatmentSchedule,
  editTreatmentSchedule,
  retrieveTreatmentPlan,
  deleteTreatmentGoal,
  completeTreatmentPlan,
  signTreatmentPlan,
  sendParentTreatmentPlan,
  signParentTreatmentPlan,
  retrieveTreatmentPlanForParent,
  addTreatmentDocument,
  editTreatmentDocument,
  deleteTreatmentDocument,
  createGenericTreatmentFullPlan,
  shareTreatmentPlan,
  deleteTreatmentPlan,
  markTreatmentPlanAsActive,
} from 'controllers/TreatmentPlan';
import { retrieveTreatmentPlanDocuments } from 'controllers/TreatmentPlan/retrieveTreatmentPlanDocuments';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.post(
  '/:intake_full_id/add/basic-information',
  [checkJwt, checkRole('ADMINISTRATOR')],
  addTreatmentBasicInformation,
);
router.patch('/:form_id/edit/basic-information', [checkJwt, checkRole('ADMINISTRATOR')], editTreatmentBasicInformation);
router.post('/:intake_full_id/add/treatment-goal', [checkJwt, checkRole('ADMINISTRATOR')], addTreatmentGoal);
router.patch('/:form_id/edit/treatment-goal', [checkJwt, checkRole('ADMINISTRATOR')], editTreatmentGoal);
router.post('/:intake_full_id/add/treatment-schedule', [checkJwt, checkRole('ADMINISTRATOR')], addTreatmentSchedule);
router.patch('/:form_id/edit/treatment-schedule', [checkJwt, checkRole('ADMINISTRATOR')], editTreatmentSchedule);
router.get('/:intake_full_id/retrieve', [checkJwt], retrieveTreatmentPlan);
router.get('/:intake_full_id/retrieve/documents', [checkJwt], retrieveTreatmentPlanDocuments);
router.delete('/:goal_id/delete', [checkJwt, checkRole('ADMINISTRATOR')], deleteTreatmentGoal);
router.patch('/complete', [checkJwt, checkRole('ADMINISTRATOR')], completeTreatmentPlan);
router.post('/sign', [checkJwt, checkRole('ADMINISTRATOR')], signTreatmentPlan);
router.post('/send-to-parent', [checkJwt, checkRole('ADMINISTRATOR')], sendParentTreatmentPlan);
router.post('/sign-parent', signParentTreatmentPlan);
router.get('/:treatment_full_id/parent/retrieve', retrieveTreatmentPlanForParent);
router.post('/:intake_full_id/add/document', [checkJwt, checkRole('ADMINISTRATOR')], addTreatmentDocument);
router.patch('/:intake_full_id/edit/document', [checkJwt, checkRole('ADMINISTRATOR')], editTreatmentDocument);
router.delete('/:intake_full_id/delete/document', [checkJwt, checkRole('ADMINISTRATOR')], deleteTreatmentDocument);
router.post('/create-generic', [checkJwt, checkRole('ADMINISTRATOR')], createGenericTreatmentFullPlan);
router.post('/share', [checkJwt, checkRole('ADMINISTRATOR')], shareTreatmentPlan);
router.delete('/delete', [checkJwt, checkRole('ADMINISTRATOR')], deleteTreatmentPlan);
router.patch('/mark-as-active', [checkJwt, checkRole('ADMINISTRATOR')], markTreatmentPlanAsActive);

export default router;
