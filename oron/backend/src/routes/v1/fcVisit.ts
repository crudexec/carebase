import { Router } from 'express';
import {
  addFcOtherTraining,
  addFcSessionHighlights,
  addFcFamilyDiscussion,
  addFcSignature,
  addFcVisitGoal,
  editFcFamilyDiscussion,
  editFcSignature,
  editFcVisitGoal,
  editFcOtherTraining,
  editFcSessionHighlights,
  createFcVisitLog,
  retrieveAllVisitLogs,
  retrieveFcVisitLog,
  submitGenericVisit,
  deleteGenericVisit,
  filterFcVisitExport,
  filterClientFcVisitExport,
} from 'controllers/FcVisit';

import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/other-training', [checkJwt], addFcOtherTraining);
router.post('/add/session-highlights', [checkJwt], addFcSessionHighlights);
router.post('/add/family-discussion', [checkJwt], addFcFamilyDiscussion);
router.post('/add/signature', [checkJwt], addFcSignature);
router.post('/add/visit-goal', [checkJwt], addFcVisitGoal);
router.patch('/edit/family-discussion', [checkJwt], editFcFamilyDiscussion);
router.patch('/edit/session-highlights', [checkJwt], editFcSessionHighlights);
router.patch('/edit/signature', [checkJwt], editFcSignature);
router.patch('/edit/visit-goal', [checkJwt], editFcVisitGoal);
router.patch('/edit/other-training', [checkJwt], editFcOtherTraining);
router.post('/create', [checkJwt], createFcVisitLog);
router.get('/:visit_full_id/retrieve', [checkJwt], retrieveFcVisitLog);
router.get('/:intake_full_id/retrieve-all', [checkJwt], retrieveAllVisitLogs);
router.post('/submit', [checkJwt], submitGenericVisit);
router.delete('/delete', [checkJwt], deleteGenericVisit);
router.get('/:id/filter-export', [checkJwt], filterFcVisitExport);
router.get('/client/:clientId/filter-export', [checkJwt], filterClientFcVisitExport);

export default router;
