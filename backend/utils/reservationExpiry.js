import Reservation from '../models/Reservation.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';

export const startReservationExpiryWorker = (io) => {
  // Check every 30 seconds
  setInterval(async () => {
    try {
      const now = new Date();

      // 1. Auto-expire reservations whose hold duration has elapsed
      const expiredReservations = await Reservation.find({
        status: { $in: ['PENDING', 'CONFIRMED'] },
        expiresAt: { $lt: now },
      });

      for (const res of expiredReservations) {
        res.status = 'EXPIRED';
        res.timeline.push({
          status: 'EXPIRED',
          timestamp: now,
          note: 'Reservation hold window expired automatically',
        });
        await res.save();

        // Notify customer
        await Notification.create({
          userId: res.customerId,
          title: 'Reservation Expired',
          message: `Your reservation for "${res.productName}" (Code: ${res.reservationCode}) has expired.`,
          type: 'reservation_status',
          link: '/customer/reservations',
        });

        // Notify via socket
        if (io) {
          io.to(`user_${res.customerId}`).emit('reservation_updated', {
            reservationId: res._id,
            status: 'EXPIRED',
          });
          io.to(`shop_${res.shopId}`).emit('reservation_updated', {
            reservationId: res._id,
            status: 'EXPIRED',
          });
        }
      }

      // 2. Auto-expire old requests
      await Request.updateMany(
        {
          status: 'active',
          expiresAt: { $lt: now },
        },
        {
          $set: { status: 'expired' },
        }
      );
    } catch (err) {
      console.error('[Worker] Expiry check error:', err.message);
    }
  }, 30000);
};
