import express from 'express';
import { createReview, getShopReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createReview);
router.get('/shop/:shopId', getShopReviews);

export default router;
