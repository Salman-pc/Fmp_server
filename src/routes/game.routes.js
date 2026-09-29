import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createGameSchema } from '../validators/game.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router.get('/', gameController.getGames);
router.post('/:id/join', gameController.joinGameSession);
router.post('/score', gameController.submitScore);
router.get('/leaderboard', gameController.getLeaderboard);

// Admin route to add game
router.post('/', restrictTo(ROLES.ADMIN), validate(createGameSchema), gameController.createGame);

export default router;
