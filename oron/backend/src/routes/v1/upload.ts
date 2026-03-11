import { Router } from 'express';

import { uploadDocument } from 'controllers/upload/upload';
//import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.post('/', uploadDocument);

export default router;
