import { supabase } from '../config/supabase.js';

export const startReservationExpiryWorker = (io) => {
  // Check every 30 seconds
  setInterval(async () => {
    if (!supabase) return;

    try {
      const now = new Date().toISOString();

      // 1. Auto-expire reservations whose hold duration has elapsed
      const { data: expiredReservations, error } = await supabase
        .from('reservations')
        .select('id, reservation_code, product_name, customer_id, shop_id')
        .in('status', ['PENDING', 'CONFIRMED'])
        .lt('expires_at', now);

      if (error) {
        console.error('[Worker] Error fetching expired reservations:', error.message);
        return;
      }

      if (expiredReservations && expiredReservations.length > 0) {
        for (const res of expiredReservations) {
          await supabase
            .from('reservations')
            .update({ status: 'EXPIRED', updated_at: now })
            .eq('id', res.id);

          console.log(`[Worker] Expired reservation: ${res.reservation_code} (${res.product_name})`);

          // Notify via socket if io is active
          if (io) {
            io.to(`user_${res.customer_id}`).emit('reservation_updated', {
              reservationId: res.id,
              reservationCode: res.reservation_code,
              status: 'EXPIRED',
            });
            io.to(`shop_${res.shop_id}`).emit('reservation_updated', {
              reservationId: res.id,
              reservationCode: res.reservation_code,
              status: 'EXPIRED',
            });
            io.emit('reservation_updated', {
              reservationId: res.id,
              reservationCode: res.reservation_code,
              status: 'EXPIRED',
            });
          }
        }
      }
    } catch (err) {
      console.error('[Worker] Expiry worker exception:', err.message);
    }
  }, 30000);
};
