import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, updateUserSchema } from '../validators/auth.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

router.get('/', userController.getUsers);
router.post('/', validate(registerSchema), userController.createUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
