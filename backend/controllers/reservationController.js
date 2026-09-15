import { supabase } from '../config/supabase.js';
import { FALLBACK_RESERVATIONS, FALLBACK_SHOPS } from '../utils/fallbackData.js';

// @desc    Create In-Store Hold & Reservation Ticket (Chapter 5.4 / Fig 5.4)
// @route   POST /api/reservations
// @access  Private (Customer)
export const createReservation = async (req, res, next) => {
  try {
    const { shopId, productId, productName, quantity = 1, agreedPrice, customerNote, holdDurationMinutes = 60 } = req.body;

    if (!productName || agreedPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and agreed price are required' });
    }

    const reservationCode = 'QK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const expiresAt = new Date(Date.now() + (parseInt(holdDurationMinutes) || 60) * 60 * 1000).toISOString();
    const totalAmount = parseFloat(agreedPrice) * (parseInt(quantity) || 1);

    if (supabase) {
      let targetShopId = shopId;
      if (!targetShopId) {
        const { data: firstShop } = await supabase.from('shops').select('id').limit(1).single();
        if (firstShop) targetShopId = firstShop.id;
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([
          {
            reservation_code: reservationCode,
            customer_id: req.user.id,
            shop_id: targetShopId,
            product_id: productId || null,
            product_name: productName,
            quantity: parseInt(quantity) || 1,
            agreed_price: parseFloat(agreedPrice),
            total_amount: totalAmount,
            status: 'CONFIRMED',
            expires_at: expiresAt,
            customer_note: customerNote || null,
          },
        ])
        .select('*, shops(id, shop_name, contact_phone, address)')
        .single();

      if (error) throw error;

      // Real-time notification to shop room
      const io = req.app.get('io');
      if (io && reservation) {
        io.to(`shop_${reservation.shop_id}`).emit('new_reservation_hold', {
          reservationId: reservation.id,
          reservationCode: reservation.reservation_code,
          productName: reservation.product_name,
          quantity: reservation.quantity,
          agreedPrice: reservation.agreed_price,
          totalAmount: reservation.total_amount,
          status: reservation.status,
          customerName: req.user.name,
          customerPhone: req.user.phone,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'In-store hold ticket created successfully!',
        reservation: {
          _id: reservation.id,
          id: reservation.id,
          reservationCode: reservation.reservation_code,
          productName: reservation.product_name,
          quantity: reservation.quantity,
          agreedPrice: reservation.agreed_price,
          totalAmount: reservation.total_amount,
          status: reservation.status,
          expiresAt: reservation.expires_at,
          shopId: reservation.shops
            ? {
              _id: reservation.shops.id,
              id: reservation.shops.id,
              shopName: reservation.shops.shop_name,
              contactPhone: reservation.shops.contact_phone,
              address: reservation.shops.address,
            }
            : null,
        },
      });
    }

    // Fallback mode with synchronized in-memory persistence
    const targetShop = FALLBACK_SHOPS.find(s => s.id === shopId || s._id === shopId) || FALLBACK_SHOPS[0];
    const newReservation = {
      _id: 'res_' + Date.now(),
      id: 'res_' + Date.now(),
      reservationCode,
      customer_id: req.user.id,
      shop_id: targetShop.id,
      product_name: productName,
      productName,
      quantity: parseInt(quantity) || 1,
      unit: 'piece',
      agreed_price: parseFloat(agreedPrice),
      agreedPrice: parseFloat(agreedPrice),
      total_amount: totalAmount,
      totalAmount,
      status: 'CONFIRMED',
      customerNote: customerNote || '',
      expires_at: expiresAt,
      expiresAt,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      customer: {
        name: req.user.name || 'Rahul Sharma',
        phone: req.user.phone || '+91 9811223344',
      },
      shop: {
        id: targetShop.id,
        shopName: targetShop.shopName,
        contactPhone: targetShop.contactPhone,
        address: targetShop.address,
      },
      shopId: {
        _id: targetShop.id,
        id: targetShop.id,
        shopName: targetShop.shopName,
        contactPhone: targetShop.contactPhone,
        address: targetShop.address,
      },
    };
    FALLBACK_RESERVATIONS.unshift(newReservation);

    res.status(201).json({
      success: true,
      message: 'In-store hold ticket created successfully!',
      reservation: newReservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's hold reservations
// @route   GET /api/reservations/my
// @access  Private (Customer)
export const getCustomerReservations = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*, shops(id, shop_name, contact_phone, address)')
        .eq('customer_id', req.user.id)
        .order('created_at', { ascending: false });

      if (!error && reservations && reservations.length > 0) {
        const formatted = reservations.map((r) => ({
          _id: r.id,
          id: r.id,
          reservationCode: r.reservation_code,
          productName: r.product_name,
          quantity: r.quantity,
          unit: r.unit,
          agreedPrice: r.agreed_price,
          totalAmount: r.total_amount,
          status: r.status,
          expiresAt: r.expires_at,
          createdAt: r.created_at,
          shopId: r.shops
            ? {
              _id: r.shops.id,
              id: r.shops.id,
              shopName: r.shops.shop_name,
              contactPhone: r.shops.contact_phone,
              address: r.shops.address,
            }
            : null,
        }));

        return res.json({
          success: true,
          count: formatted.length,
          reservations: formatted,
        });
      }
    }

    const myRes = FALLBACK_RESERVATIONS.filter(r => r.customer_id === req.user.id || !r.customer_id);
    res.json({
      success: true,
      count: myRes.length,
      reservations: myRes.length > 0 ? myRes : FALLBACK_RESERVATIONS.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation order status (Finite State Machine Fig 5.4)
// @route   PUT /api/reservations/:id/status
// @access  Private (Shopkeeper / Customer)
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const normalizedStatus = status.toUpperCase();
    const validStatuses = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    if (supabase) {
      // 1. Fetch reservation and shop info to verify ownership
      const { data: resv, error: fetchErr } = await supabase
        .from('reservations')
        .select('*, shops(id, owner_id)')
        .eq('id', id)
        .single();

      if (fetchErr || !resv) {
        return res.status(404).json({ success: false, message: 'Reservation ticket not found' });
      }

      // 2. Ownership verification:
      // - Customer can only cancel their own reservation
      // - Shopkeeper must own the shop
      // - Admin can perform any transition
      const isCustomerOwner = resv.customer_id === req.user.id;
      const isShopOwner = resv.shops?.owner_id === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isAdmin) {
        if (isCustomerOwner) {
          if (normalizedStatus !== 'CANCELLED') {
            return res.status(403).json({
              success: false,
              message: 'Customers can only cancel pending reservations',
            });
          }
        } else if (!isShopOwner) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not authorized to update this reservation ticket',
          });
        }
      }

      const { data: updated, error } = await supabase
        .from('reservations')
        .update({ status: normalizedStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, shops(id, shop_name, contact_phone, address)')
        .single();

      if (error) throw error;

      // Real-time socket notification to customer and shop rooms
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${resv.customer_id}`).emit('reservation_updated', {
          reservationId: id,
          reservationCode: resv.reservation_code,
          status: normalizedStatus,
        });
        io.to(`shop_${resv.shop_id}`).emit('reservation_updated', {
          reservationId: id,
          reservationCode: resv.reservation_code,
          status: normalizedStatus,
        });
        io.emit('reservation_updated', {
          id,
          status: normalizedStatus,
        });
      }

      return res.json({
        success: true,
        message: `Reservation moved to ${normalizedStatus}`,
        reservation: {
          _id: updated.id,
          id: updated.id,
          reservationCode: updated.reservation_code,
          productName: updated.product_name,
          quantity: updated.quantity,
          agreedPrice: updated.agreed_price,
          totalAmount: updated.total_amount,
          status: updated.status,
          expiresAt: updated.expires_at,
          shopId: updated.shops
            ? {
              _id: updated.shops.id,
              id: updated.shops.id,
              shopName: updated.shops.shop_name,
              contactPhone: updated.shops.contact_phone,
              address: updated.shops.address,
            }
            : null,
        },
      });
    }

    // Fallback mode with in-memory persistence
    const targetResv = FALLBACK_RESERVATIONS.find((r) => r.id === id || r._id === id);
    if (targetResv) {
      targetResv.status = normalizedStatus;
      targetResv.updated_at = new Date().toISOString();
    }

    // Socket notification
    const io = req.app.get('io');
    if (io) {
      io.emit('reservation_updated', {
        id,
        status: normalizedStatus,
      });
    }

    res.json({
      success: true,
      message: `Reservation moved to ${normalizedStatus}`,
      reservation: targetResv || {
        id,
        status: normalizedStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reservation orders for shopkeeper
// @route   GET /api/reservations/shop
// @access  Private (Shopkeeper)
export const getShopReservations = async (req, res, next) => {
  try {
    if (supabase) {
      // Find shop owned by shopkeeper
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', req.user.id)
        .single();

      if (!shop && req.user.role !== 'admin') {
        return res.json({
          success: true,
          count: 0,
          reservations: [],
        });
      }

      let query = supabase.from('reservations').select('*, customer:users(id, name, phone, email)');
      if (shop) {
        query = query.eq('shop_id', shop.id);
      }

      const { data: reservations, error } = await query.order('created_at', { ascending: false });

      if (!error && reservations) {
        return res.json({
          success: true,
          count: reservations.length,
          reservations: reservations.map((r) => ({
            _id: r.id,
            id: r.id,
            reservationCode: r.reservation_code,
            productName: r.product_name,
            quantity: r.quantity,
            unit: r.unit,
            agreedPrice: r.agreed_price,
            totalAmount: r.total_amount,
            status: r.status,
            expiresAt: r.expires_at,
            customerNote: r.customer_note,
            customer: r.customer ? { name: r.customer.name, phone: r.customer.phone } : null,
            createdAt: r.created_at,
          })),
        });
      }
    }

    // In fallback mode, filter by shopkeeper or return all for admin
    const myShop = FALLBACK_SHOPS.find(s => s.owner_id === req.user?.id) || FALLBACK_SHOPS[0];
    const shopReservations = req.user?.role === 'admin'
      ? FALLBACK_RESERVATIONS
      : FALLBACK_RESERVATIONS.filter(r => r.shop_id === myShop.id || r.shop_id === myShop._id);

    res.json({
      success: true,
      count: shopReservations.length,
      reservations: shopReservations.length > 0 ? shopReservations : FALLBACK_RESERVATIONS,
    });
  } catch (error) {
    next(error);
  }
};


// Aliases for backwards compatibility
export const getMyReservations = getCustomerReservations;
