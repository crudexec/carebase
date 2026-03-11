import { Router } from 'express';

import {
  fillPneumococcalVaccinationInformation,
  fillVaccinationEmployeeInformation,
  fillPneumococcalSignature,
  editPneumococcalEmployeeInformation,
  editPneumococcalVaccinationInformation,
  editPneumococcalSignature,
  retrievePneumococcalVaccinationForm,
  submitPneumococcalForm,
} from 'controllers/forms';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/vaccinationInformation', [checkJwt], fillPneumococcalVaccinationInformation);
router.post('/add/employeeInformation', [checkJwt], fillVaccinationEmployeeInformation);
router.post('/add/signature', [checkJwt], fillPneumococcalSignature);
router.patch('/edit/vaccinationInformation', [checkJwt], editPneumococcalVaccinationInformation);
router.patch('/edit/employeeInformation', [checkJwt], editPneumococcalEmployeeInformation);
router.patch('/edit/signature', [checkJwt], editPneumococcalSignature);
router.get('/retrieve', [checkJwt], retrievePneumococcalVaccinationForm);
router.patch('/submit', [checkJwt], submitPneumococcalForm);

export default router;
