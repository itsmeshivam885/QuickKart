import Reservation from '../models/Reservation.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

// Helper to generate readable short reservation code
const generateReservationCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'QK-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a product hold / reservation
// @route   POST /api/reservations
// @access  Private (Customer)
export const createReservation = async (req, res, next) => {
  try {
    const {
      shopId,
      productId,
      requestId,
      productName,
      quantity = 1,
      unit = 'piece',
      agreedPrice,
      customerNote,
      holdDurationMinutes = 60,
    } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const price = parseFloat(agreedPrice);
    const qty = parseInt(quantity);
    const totalAmount = price * qty;
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);
    const reservationCode = generateReservationCode();

    const reservation = await Reservation.create({
      reservationCode,
      customerId: req.user._id,
      shopId,
      productId: productId || null,
      requestId: requestId || null,
      productName,
      quantity: qty,
      unit,
      agreedPrice: price,
      totalAmount,
      status: 'PENDING',
      holdDurationMinutes,
      expiresAt,
      customerNote: customerNote || '',
      timeline: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: 'Reservation requested by customer',
        },
      ],
    });

    // Notify shopkeeper
    await Notification.create({
      userId: shop.ownerId,
      title: 'New Product Reservation!',
      message: `Reservation ${reservationCode} received for "${productName}" (${qty} ${unit}). Please confirm and hold item.`,
      type: 'reservation_status',
      link: '/shop/reservations',
      metadata: { reservationId: reservation._id, code: reservationCode },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`shop_${shop._id}`).emit('new_reservation', {
        reservationId: reservation._id,
        reservationCode,
        productName,
        quantity: qty,
        customerName: req.user.name,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer's reservations
// @route   GET /api/reservations/my
// @access  Private (Customer)
export const getCustomerReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customerId: req.user._id })
      .populate('shopId', 'shopName tagline location address contactPhone contactEmail')
      .populate('productId', 'images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reservations for shopkeeper's shop
// @route   GET /api/reservations/shop
// @access  Private (Shopkeeper)
export const getShopReservations = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop not found' });
    }

    const { status } = req.query;
    let query = { shopId: shop._id };
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('customerId', 'name email phone profileImage')
      .populate('productId', 'images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (State Machine)
// @route   PUT /api/reservations/:id/status
// @access  Private (Customer or Shopkeeper)
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, note, cancellationReason } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate('shopId', 'ownerId shopName')
      .populate('customerId', 'name email');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    reservation.status = status;
    if (cancellationReason) {
      reservation.cancellationReason = cancellationReason;
    }

    reservation.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    // If marked completed and linked to a product, decrement stock
    if (status === 'COMPLETED' && reservation.productId) {
      await Product.findByIdAndUpdate(reservation.productId, {
        $inc: { quantityInStock: -reservation.quantity },
      });
    }

    await reservation.save();

    // Create appropriate notification
    const recipientUserId =
      req.user.role === 'customer'
        ? reservation.shopId.ownerId
        : reservation.customerId._id;

    await Notification.create({
      userId: recipientUserId,
      title: `Reservation ${reservation.reservationCode}: ${status}`,
      message: `Reservation for "${reservation.productName}" is now marked as ${status}.`,
      type: 'reservation_status',
      link: req.user.role === 'customer' ? '/shop/reservations' : '/customer/reservations',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${reservation.customerId._id}`).emit('reservation_updated', {
        reservationId: reservation._id,
        status,
        code: reservation.reservationCode,
      });
      io.to(`shop_${reservation.shopId._id}`).emit('reservation_updated', {
        reservationId: reservation._id,
        status,
        code: reservation.reservationCode,
      });
    }

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
