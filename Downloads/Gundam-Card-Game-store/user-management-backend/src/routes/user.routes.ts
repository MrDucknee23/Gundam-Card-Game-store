import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// User CRUD routes
router.get('/', authMiddleware, userController.getUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.post('/', adminMiddleware, userController.createUser);
router.put('/:id', adminMiddleware, userController.updateUser);
router.delete('/:id', adminMiddleware, userController.deleteUser);

// User actions
router.patch('/:id/block', adminMiddleware, userController.blockUser);
router.patch('/:id/unblock', adminMiddleware, userController.unblockUser);

// Stats route
router.get('/stats', authMiddleware, userController.getUserStats);

export default router;