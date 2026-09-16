import express from 'express';
import {
  getStats,
  getAllShops,
  verifyShop,
  getAllUsers,
  toggleUserStatus,
  getAdminCategories,
  createCategory,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply admin guard across all /api/admin routes
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/shops', getAllShops);
router.put('/shops/:id/verify', verifyShop);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);

export default router;
