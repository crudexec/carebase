import { Router } from 'express';

import { fetchUserForms } from 'controllers/admin';
import { fetchUsers, fetchUserApprovedForms, fetchUserAwaitingForms, fetchUserNotFilledForms, createUser, resetUserPassword } from 'controllers/admin';
import {
  list,
  show,
  edit,
  destroy,
  uploadUserDocument,
  retrieveUserDocuments,
  editUserDocument,
  SignOfferLetter,
  RetrieveOfferLetter,
} from 'controllers/users';
import { updateUserStatus } from 'controllers/user/updateUserStatus';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorEdit } from 'middleware/validation/users';

const router = Router();

router.get('/', [checkJwt], show);
router.get('/all', [checkJwt], list);
router.patch('/', [checkJwt], edit);
router.delete('/', [checkJwt], destroy);
router.get('/all/users', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], fetchUsers);
router.post('/create', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], createUser);
router.post('/:user_id/reset-password', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], resetUserPassword);
router.patch('/:userId/status', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], updateUserStatus);
router.get('/:id/forms', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], fetchUserForms);
router.get('/:id/forms/awaiting-approval', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], fetchUserAwaitingForms);
router.get('/:id/forms/approved', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], fetchUserApprovedForms);
router.get('/:id/forms/not-filled', [checkJwt, checkRole('ADMINISTRATOR,EMPLOYEE_MANAGER')], fetchUserNotFilledForms);
router.post('/upload/document', [checkJwt], uploadUserDocument);
router.get('/retrieve/documents', [checkJwt], retrieveUserDocuments);
router.patch('/:document_id/edit/document', [checkJwt], editUserDocument);
router.patch('/sign/offer-letter', [checkJwt], SignOfferLetter);
router.get('/retrieve/offer-letter', [checkJwt], RetrieveOfferLetter);

export default router;
