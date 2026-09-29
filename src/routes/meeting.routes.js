import { Router } from 'express';
import * as meetingController from '../controllers/meeting.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createMeetingSchema, updateMeetingSchema } from '../validators/meeting.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router.get('/current', meetingController.getCurrentActiveMeeting);
router.get('/', meetingController.getMeetings);
router.get('/:id', meetingController.getMeetingById);

// Admin-only endpoints
router.post('/', restrictTo(ROLES.ADMIN), validate(createMeetingSchema), meetingController.createMeeting);
router.patch('/:id', restrictTo(ROLES.ADMIN), validate(updateMeetingSchema), meetingController.updateMeeting);
router.delete('/:id', restrictTo(ROLES.ADMIN), meetingController.deleteMeeting);

export default router;
