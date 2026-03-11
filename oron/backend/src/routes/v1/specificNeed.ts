import { Router } from 'express';

import {
  addBasicInformation,
  editBasicInformation,
  createGenericSpecificNeeds,
  addCurrentNeedsAndSupport,
  editCurrentNeedsAndSupport,
  addServiceNeeds,
  editServiceNeeds,
  addAuthorization,
  editAuthorization,
  deleteSpecificNeeds,
  retrieveGenericSpecificNeeds,
} from 'controllers/specificNeeds';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/add/basic-information', [checkJwt], addBasicInformation);
router.patch('/edit/basic-information', [checkJwt], editBasicInformation);
router.post('/create-generic', [checkJwt], createGenericSpecificNeeds);
router.post('/add/current-needs-and-support', [checkJwt], addCurrentNeedsAndSupport);
router.patch('/edit/current-needs-and-support', [checkJwt], editCurrentNeedsAndSupport);
router.post('/add/service-needs', [checkJwt], addServiceNeeds);
router.patch('/edit/service-needs', [checkJwt], editServiceNeeds);
router.post('/add/authorization', [checkJwt], addAuthorization);
router.patch('/edit/authorization', [checkJwt], editAuthorization);
router.delete('/delete', [checkJwt], deleteSpecificNeeds);
router.get('/retrieve', [checkJwt], retrieveGenericSpecificNeeds);

export default router;
