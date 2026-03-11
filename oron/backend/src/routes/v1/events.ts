import { Router } from 'express';

import {
  addEventSchedule,
  declineEventSchedule,
  deleteEventSchedule,
  fetchAllClientsIntake,
  fetchAllEmployeesForSchedule,
  filterCalendarEventsSchedule,
  rescheduleEventSchedule,
  retrieveAllEventsSchedule,
  retrieveSingleEventSchedule,
  editEventSchedule,
  retrieveEventsReSchedule,
  acceptEventReschedule,
  retrieveEmployeeSchedule,
} from 'controllers/events';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.get('/fetch-all-clients-intake', checkJwt, fetchAllClientsIntake);
router.get('/fetch-all-employees-for-schedule', checkJwt, fetchAllEmployeesForSchedule);
router.get('/retrieve-all-events-schedule', checkJwt, retrieveAllEventsSchedule);
router.get('/:id/retrieve-single-event-schedule', checkJwt, retrieveSingleEventSchedule);
router.post('/add-event-schedule', checkJwt, addEventSchedule);
router.post('/reschedule-event-schedule', checkJwt, rescheduleEventSchedule);
router.post('/decline-event-schedule', checkJwt, declineEventSchedule);
router.get('/filter-calendar-events-schedule', checkJwt, filterCalendarEventsSchedule);
router.delete('/delete-event-schedule', checkJwt, deleteEventSchedule);
router.patch('/edit-event-schedule', checkJwt, editEventSchedule);
router.get('/retrieve-event-reschedule', checkJwt, retrieveEventsReSchedule);
router.post('/accept-event-reschedule', checkJwt, acceptEventReschedule);
router.get('/retrieve-employee-schedule', checkJwt, retrieveEmployeeSchedule);

export default router;
