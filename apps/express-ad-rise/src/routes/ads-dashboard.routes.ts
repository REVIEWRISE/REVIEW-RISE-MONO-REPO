import { Router } from 'express';
import { adsDashboardController } from '../controllers/ads-dashboard.controller';

const router = Router();

router.get('/summary', adsDashboardController.getSummary.bind(adsDashboardController));
router.post('/copywriter', adsDashboardController.generateCopy.bind(adsDashboardController));
router.post('/alerts/:alertId/apply', adsDashboardController.applyAlert.bind(adsDashboardController));

export default router;
