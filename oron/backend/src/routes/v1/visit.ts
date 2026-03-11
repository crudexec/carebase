import { Router } from 'express';

import {
  addBehaviorManagement,
  addCommunication,
  addConcernAndChallenges,
  addSelfManagement,
  addSessionHighlights,
  editBehaviorManagement,
  editCommunication,
  editSelfManagement,
  editSessionHighlights,
  editConcernAndChallenges,
  retrieveVisitLog,
  createVisitLog,
  addSnackMealTime,
  editSnackMealTime,
  addDomesticSkillTraining,
  editDomesticSkillTraining,
  addPlayLeisure,
  editPlayLeisure,
  addPersonalWorkReading,
  editPersonalWorkReading,
  addPersonalCareBowelControl,
  editPersonalCareBowelControl,
  addSensoryNeedsAndMotorDevelopment,
  editSensoryNeedsAndMotorDevelopment,
  addSocialization,
  editSocialization,
  addSafetySurvivalSkills,
  editSafetySurvivalSkills,
  addUtilizationOfMoney,
  editUtilizationOfMoney,
  addVisitGoal,
  editVisitGoal,
  retrieveTreatmentGoalsForVisitLog,
  retrieveAllVisitLogs,
  submitGenericVisit,
  deleteGenericVisit,
  filterVisitExport,
  filterClientVisitExport,
  addTransportationTypeAndObjectives,
  editTransportationTypeAndObjectives,
  fetchUserVisits,
} from 'controllers/visit';
import { ApproveVisit, ReviewVisit } from 'controllers/admin';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.post('/add/behavior-management', [checkJwt], addBehaviorManagement);
router.post('/add/communication', [checkJwt], addCommunication);
router.post('/add/concern-challenges', [checkJwt], addConcernAndChallenges);
router.post('/add/self-management', [checkJwt], addSelfManagement);
router.post('/add/session-highlights', [checkJwt], addSessionHighlights);
router.patch('/edit/behavior-management', [checkJwt], editBehaviorManagement);
router.patch('/edit/communication', [checkJwt], editCommunication);
router.patch('/edit/self-management', [checkJwt], editSelfManagement);
router.patch('/edit/session-highlights', [checkJwt], editSessionHighlights);
router.patch('/edit/concern-challenges', [checkJwt], editConcernAndChallenges);
router.get('/:visit_full_id/retrieve', [checkJwt], retrieveVisitLog);
router.post('/create', [checkJwt], createVisitLog);
router.post('/add/snack-meal-time', [checkJwt], addSnackMealTime);
router.patch('/edit/snack-meal-time', [checkJwt], editSnackMealTime);
router.post('/add/domestic-skill-training', [checkJwt], addDomesticSkillTraining);
router.patch('/edit/domestic-skill-training', [checkJwt], editDomesticSkillTraining);
router.post('/add/play-leisure', [checkJwt], addPlayLeisure);
router.patch('/edit/play-leisure', [checkJwt], editPlayLeisure);
router.post('/add/personal-work-reading', [checkJwt], addPersonalWorkReading);
router.patch('/edit/personal-work-reading', [checkJwt], editPersonalWorkReading);
router.post('/add/personal-care-bowel-control', [checkJwt], addPersonalCareBowelControl);
router.patch('/edit/personal-care-bowel-control', [checkJwt], editPersonalCareBowelControl);
router.post('/add/sensory-needs-development', [checkJwt], addSensoryNeedsAndMotorDevelopment);
router.patch('/edit/sensory-needs-development', [checkJwt], editSensoryNeedsAndMotorDevelopment);
router.post('/add/socialization', [checkJwt], addSocialization);
router.patch('/edit/socialization', [checkJwt], editSocialization);
router.post('/add/safety-survival-skills', [checkJwt], addSafetySurvivalSkills);
router.patch('/edit/safety-survival-skills', [checkJwt], editSafetySurvivalSkills);
router.post('/add/utilization-of-money', [checkJwt], addUtilizationOfMoney);
router.patch('/edit/utilization-of-money', [checkJwt], editUtilizationOfMoney);
router.post('/add/visit-goal', [checkJwt], addVisitGoal);
router.patch('/edit/visit-goal', [checkJwt], editVisitGoal);
router.get('/:intake_full_id/retrieve-treatment-goals', [checkJwt], retrieveTreatmentGoalsForVisitLog);
router.get('/:intake_full_id/retrieve-all', [checkJwt], retrieveAllVisitLogs);
router.post('/submit-generic-visit', [checkJwt], submitGenericVisit);
router.delete('/generic/delete', [checkJwt], deleteGenericVisit);
router.get('/:id/export', [checkJwt], filterVisitExport);
router.get('/client/:clientId/export', [checkJwt], filterClientVisitExport);
router.post('/add/transportation-type-and-objectives', [checkJwt], addTransportationTypeAndObjectives);
router.patch('/edit/transportation-type-and-objectives', [checkJwt], editTransportationTypeAndObjectives);

// Approval routes (Admin only)
router.patch('/:id/approve', [checkJwt, checkRole('ADMINISTRATOR')], ApproveVisit);
router.patch('/:id/review', [checkJwt, checkRole('ADMINISTRATOR')], ReviewVisit);

// Fetch user visits (all authenticated users)
router.get('/user/all', [checkJwt], fetchUserVisits);

export default router;
