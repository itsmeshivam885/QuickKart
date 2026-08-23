import express from 'express';
import {
  createReservation,
  getCustomerReservations,
  getShopReservations,
  updateReservationStatus,
} from '../controllers/reservationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createReservation);
router.get('/my', protect, authorize('customer'), getCustomerReservations);
router.get('/shop', protect, authorize('shopkeeper'), getShopReservations);
router.put('/:id/status', protect, updateReservationStatus);

export default router;
