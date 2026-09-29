import { Router } from 'express';
import * as checkInController from '../controllers/checkin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { checkInLimiter } from '../middleware/rateLimit.middleware.js';
import { submitCheckInSchema } from '../validators/checkin.validator.js';

const router = Router();

router.use(protect);

router.post('/', checkInLimiter, validate(submitCheckInSchema), checkInController.submitCheckIn);
router.get('/me', checkInController.getMyCheckIns);
router.get('/status/:meetingId', checkInController.getCheckInStatus);
router.delete('/reset/:meetingId', checkInController.resetCheckIn);

export default router;
