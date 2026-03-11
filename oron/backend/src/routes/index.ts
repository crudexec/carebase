import { Router } from 'express';

import page404 from './pages/404';
import pageRoot from './pages/root';
import v1 from './v1';

import { httpRequestsTotal, register } from 'metrics';

const router = Router();

router.use('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end;
  }
});

router.use(`/v1`, v1);

router.use(pageRoot);
router.use(page404);

export default router;
