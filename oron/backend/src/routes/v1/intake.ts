import { Router } from 'express';

import {
  addClientInformation,
  retrieveClientInformation,
  editClientInformation,
  addIntakeInformation,
  editIntakeInformation,
  addReferralInformation,
  editReferralInformation,
  retrieveIntakeInformation,
  retrieveReferalInformation,
  addMotherInformation,
  editMotherInformation,
  retrieveMotherInformation,
  addFatherInformation,
  editFatherInformation,
  retrieveFatherInformation,
  addEmergencyContactInformation,
  editEmergencyContactInformation,
  retrieveEmergencyContactInformation,
  addSchoolContactInformation,
  editSchoolContactInformation,
  retrieveSchoolContactInformation,
  addContactInformation,
  addMedicalInformation,
  editMedicalInformation,
  retrieveMedicalInformation,
  addAdmissionInformation,
  editAdmissionInformation,
  retrieveAdmissionInformation,
  addMoreAboutClient,
  editMoreAboutClient,
  retrieveMoreAboutClient,
  addServiceCoordinatorInformation,
  editServiceCoordinatorInformation,
  retrieveServiceCoordinatorInformation,
  editContactInformation,
  retrieveContactInformation,
  retrieveFullIntake,
  submitIntakeForm,
  retrieveSingleIntake,
  uploadProfilPictureForIntake,
  createGenericIntake,
  retrieveEmployeesFullIntake,
  deleteIntake,
} from 'controllers/intake';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.get('/retrieve/client-information', [checkJwt], retrieveClientInformation);
router.post('/add/client-information', [checkJwt], addClientInformation);
router.patch('/:form_id/edit/client-information', [checkJwt], editClientInformation);
router.post('/add/intake-information', [checkJwt], addIntakeInformation);
router.patch('/:form_id/edit/intake-information', [checkJwt], editIntakeInformation);
router.post('/add/referral-information', [checkJwt], addReferralInformation);
router.patch('/:form_id/edit/referral-information', [checkJwt], editReferralInformation);
router.get('/retrieve/intake-information', [checkJwt], retrieveIntakeInformation);
router.get('/retrieve/referral-information', [checkJwt], retrieveReferalInformation);
router.post('/add/mother-information', [checkJwt], addMotherInformation);
router.patch('/:form_id/edit/mother-information', [checkJwt], editMotherInformation);
router.get('/retrieve/mother-information', [checkJwt], retrieveMotherInformation);
router.post('/add/father-information', [checkJwt], addFatherInformation);
router.patch('/:form_id/edit/father-information', [checkJwt], editFatherInformation);
router.get('/retrieve/father-information', [checkJwt], retrieveFatherInformation);
router.post('/add/emergency-contact-information', [checkJwt], addEmergencyContactInformation);
router.patch('/:form_id/edit/emergency-contact-information', [checkJwt], editEmergencyContactInformation);
router.get('/retrieve/emergency-contact-information', [checkJwt], retrieveEmergencyContactInformation);
router.post('/add/school-contact-information', [checkJwt], addSchoolContactInformation);
router.patch('/:form_id/edit/school-contact-information', [checkJwt], editSchoolContactInformation);
router.get('/retrieve/school-contact-information', [checkJwt], retrieveSchoolContactInformation);
router.post('/add/general/contact-information', [checkJwt], addContactInformation);
router.patch('/:form_id/edit/general/contact-information', [checkJwt], editContactInformation);
router.get('/retrieve/general/contact-information', [checkJwt], retrieveContactInformation);
router.post('/add/medical-information', [checkJwt], addMedicalInformation);
router.patch('/:form_id/edit/medical-information', [checkJwt], editMedicalInformation);
router.get('/retrieve/medical-information', [checkJwt], retrieveMedicalInformation);
router.post('/add/admission-information', [checkJwt], addAdmissionInformation);
router.patch('/:form_id/edit/admission-information', [checkJwt], editAdmissionInformation);
router.get('/retrieve/admission-information', [checkJwt], retrieveAdmissionInformation);
router.post('/add/more-about-client', [checkJwt], addMoreAboutClient);
router.patch('/:form_id/edit/more-about-client', [checkJwt], editMoreAboutClient);
router.get('/retrieve/more-about-client', [checkJwt], retrieveMoreAboutClient);
router.post('/add/service-coordinator-information', [checkJwt], addServiceCoordinatorInformation);
router.patch('/:form_id/edit/service-coordinator-information', [checkJwt], editServiceCoordinatorInformation);
router.get('/retrieve/service-coordinator-information', [checkJwt], retrieveServiceCoordinatorInformation);
router.get('/retrieve/full-intake', [checkJwt], retrieveFullIntake);
router.post('/submit/intake', [checkJwt], submitIntakeForm);
router.get('/:form_id/retrieve/single/intake', [checkJwt], retrieveSingleIntake);
router.patch('/:intake_full_id/upload/profile-picture', [checkJwt], uploadProfilPictureForIntake);
router.post('/create/generic/intake', [checkJwt, checkRole('ADMINISTRATOR')], createGenericIntake);
router.get('/retrieve/employee/intake', [checkJwt], retrieveEmployeesFullIntake);
router.delete('/:intake_full_id/delete', [checkJwt, checkRole('ADMINISTRATOR')], deleteIntake);

export default router;
