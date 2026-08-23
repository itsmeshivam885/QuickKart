import express from 'express';
import {
  createRequest,
  getMyRequests,
  getRequestDetails,
  getShopRelevantRequests,
  respondToRequest,
} from '../controllers/requestController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createRequest);
router.get('/my', protect, authorize('customer'), getMyRequests);
router.get('/shop', protect, authorize('shopkeeper'), getShopRelevantRequests);
router.post('/:id/respond', protect, authorize('shopkeeper'), respondToRequest);
router.get('/:id', getRequestDetails);

export default router;
