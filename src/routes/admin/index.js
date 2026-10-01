import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

import * as adminUserController from '../../controllers/admin/user.controller.js';
import * as adminMeetingController from '../../controllers/admin/meeting.controller.js';
import * as adminReportController from '../../controllers/admin/report.controller.js';
import * as gameController from '../../controllers/game.controller.js';

import { registerSchema, updateUserSchema } from '../../validators/auth.validator.js';
import { createMeetingSchema, updateMeetingSchema } from '../../validators/meeting.validator.js';
import { createGameSchema } from '../../validators/game.validator.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

// Protect and Restrict ALL admin routes to ADMIN role only
router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

// --- ADMIN USER ROUTES ---
router.get('/users', adminUserController.getUsers);
router.post('/users', validate(registerSchema), adminUserController.createUser);
router.patch('/users/:id', validate(updateUserSchema), adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);

// --- ADMIN MEETING ROUTES ---
router.post('/meetings', validate(createMeetingSchema), adminMeetingController.createMeeting);
router.patch('/meetings/:id', validate(updateMeetingSchema), adminMeetingController.updateMeeting);
router.patch('/meetings/:id/toggle-checkin', adminMeetingController.toggleCheckInPermission);
router.get('/meetings/:id/present-users', adminMeetingController.getPresentUsers);
router.delete('/meetings/:id', adminMeetingController.deleteMeeting);

// --- ADMIN REPORT ROUTES ---
router.get('/reports/dashboard', adminReportController.getDashboardSummary);
router.get('/reports/attendance', adminReportController.getAttendanceReport);
router.get('/reports/users-stats', adminReportController.getUserAttendanceStats);

// --- ADMIN GAMES CONFIG ROUTES ---
router.post('/games', validate(createGameSchema), gameController.createGame);

export default router;
