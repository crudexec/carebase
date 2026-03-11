import { Router } from 'express';

import {
  addEmergencyContactInformation,
  addPersonalInformation,
  editEmergencyContactInformation,
  editPersonalInformationForm,
  retrieveEmployeeDemographicForm,
  submitEmployeeDemographicForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/personalInformation', [checkJwt], addPersonalInformation);
router.post('/add/emergencyContactInformation', [checkJwt], addEmergencyContactInformation);
router.patch('/edit/personalInformation', [checkJwt], editPersonalInformationForm);
router.patch('/edit/emergencyContactInformation', [checkJwt], editEmergencyContactInformation);
router.get('/retrieve', [checkJwt], retrieveEmployeeDemographicForm);
router.patch('/submit', [checkJwt], submitEmployeeDemographicForm);

export default router;
