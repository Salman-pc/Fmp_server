import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/attendance', reportController.getAttendanceReport);
router.get('/users-stats', reportController.getUserAttendanceStats);

export default router;
