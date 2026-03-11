import { Router } from 'express';

import {
  ApproveBioDataForm,
  ApproveI9Form,
  ApproveDemographicForm,
  ApproveFluForm,
  ApproveHepatitisForm,
  ApproveInfluenzaForm,
  ApproveMMRForm,
  ApproveTbForm,
  ApproveVaricellaForm,
  ApprovePneumococcalForm,
  ApproveN95Form,
  ReviewBioDataForm,
  ReviewI9Form,
  ReviewDemographicForm,
  ReviewFluForm,
  ReviewHepatitisForm,
  ReviewInfluenzaForm,
  ReviewMMRForm,
  ReviewTbForm,
  ReviewVaricellaForm,
  ReviewPneumococcalForm,
  ApproveCJISForm,
  ReviewReferenceForm,
  ReviewCJISForm,
  ApproveReferenceForm,
  SendOfferLetter,
  SearchUser,
  RetrieveUserOfferLetter,
  fetchUserDocuments,
  ApproveUserDocument,
  ReviewUserDocument,
} from 'controllers/admin';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.patch('/:id/i9form', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveI9Form);
router.patch('/:id/biodata', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveBioDataForm);
router.patch('/:id/demographic', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveDemographicForm);
router.patch('/:id/flu', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveFluForm);
router.patch('/:id/hepatitis', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveHepatitisForm);
router.patch('/:id/influenza', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveInfluenzaForm);
router.patch('/:id/mmr', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveMMRForm);
router.patch('/:id/tb', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveTbForm);
router.patch('/:id/varicella', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveVaricellaForm);
router.patch('/:id/pneumococcal', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApprovePneumococcalForm);
router.patch('/:id/n95', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveN95Form);
router.patch('/:id/review/biodata', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewBioDataForm);
router.patch('/:id/review/i9form', [checkJwt], ReviewI9Form);
router.patch('/:id/review/demographic', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewDemographicForm);
router.patch('/:id/review/flu', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewFluForm);
router.patch('/:id/review/hepatitis', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewHepatitisForm);
router.patch('/:id/review/influenza', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewInfluenzaForm);
router.patch('/:id/review/mmr', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewMMRForm);
router.patch('/:id/review/tb', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewTbForm);
router.patch('/:id/review/varicella', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewVaricellaForm);
router.patch('/:id/review/pneumococcal', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewPneumococcalForm);
router.patch('/:id/review/reference', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewReferenceForm);
router.patch('/:id/review/cjis', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewCJISForm);
router.patch('/:id/cjis', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveCJISForm);
router.patch('/:id/reference', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveReferenceForm);
router.post('/:user_id/send-offer-letter', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], SendOfferLetter);
router.get('/search', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], SearchUser);
router.get('/:user_id/retrieve/offer-letter', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], RetrieveUserOfferLetter);
router.get('/:user_id/retrieve/user/documents', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], fetchUserDocuments);
router.patch('/:id/user/document', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ApproveUserDocument);
router.patch('/:id/user/review/document', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], ReviewUserDocument);

export default router;
