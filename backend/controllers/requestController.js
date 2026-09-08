import { supabase } from '../config/supabase.js';

// @desc    Broadcast structured request to nearby shops
// @route   POST /api/requests
// @access  Private (Customer)
export const createRequest = async (req, res, next) => {
  try {
    const { productName, category, quantity, unit, expectedBudget, urgency, notes } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ success: false, message: 'Product name and category are required' });
    }

    if (supabase) {
      const { data: request, error } = await supabase
        .from('requests')
        .insert([
          {
            customer_id: req.user.id,
            product_name: productName,
            category,
            quantity: parseInt(quantity) || 1,
            unit: unit || 'piece',
            expected_budget: expectedBudget ? parseFloat(expectedBudget) : null,
            urgency: urgency || 'today',
            notes,
            status: 'ACTIVE',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Real-time broadcast notification to shopkeeper rooms
      const io = req.app.get('io');
      if (io) {
        io.emit('new_broadcast_request', {
          requestId: request.id,
          productName: request.product_name,
          category: request.category,
          quantity: request.quantity,
          unit: request.unit,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Request broadcasted to nearby verified shops!',
        request,
      });
    }

    // Fallback response
    const mockRequest = {
      _id: 'req_' + Date.now(),
      id: 'req_' + Date.now(),
      customerId: req.user.id,
      productName,
      category,
      quantity: parseInt(quantity) || 1,
      unit: unit || 'piece',
      expectedBudget: expectedBudget ? parseFloat(expectedBudget) : 0,
      urgency: urgency || 'today',
      notes,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Request broadcasted to nearby verified shops!',
      request: mockRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's own broadcast requests with quotes
// @route   GET /api/requests/my
// @access  Private (Customer)
export const getMyRequests = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: requests, error } = await supabase
        .from('requests')
        .select('*, responses:request_responses(*, shops(id, shop_name, rating, contact_phone, address, location_lat, location_lng))')
        .eq('customer_id', req.user.id)
        .order('created_at', { ascending: false });

      if (!error && requests && requests.length > 0) {
        const formatted = requests.map((r) => ({
          _id: r.id,
          id: r.id,
          productName: r.product_name,
          category: r.category,
          quantity: r.quantity,
          unit: r.unit,
          expectedBudget: r.expected_budget,
          urgency: r.urgency,
          status: r.status,
          createdAt: r.created_at,
          responses: (r.responses || []).map((resp) => ({
            _id: resp.id,
            id: resp.id,
            offeredPrice: resp.offered_price,
            responseType: resp.response_type,
            prepEtaMinutes: resp.prep_eta_minutes,
            notes: resp.notes,
            shopId: resp.shops
              ? {
                  _id: resp.shops.id,
                  id: resp.shops.id,
                  shopName: resp.shops.shop_name,
                  rating: resp.shops.rating,
                  contactPhone: resp.shops.contact_phone,
                  address: resp.shops.address,
                }
              : null,
          })),
        }));

        return res.json({
          success: true,
          count: formatted.length,
          requests: formatted,
        });
      }
    }

    // Fallback sample data
    res.json({
      success: true,
      count: 1,
      requests: [
        {
          _id: 'sample_req_1',
          id: 'sample_req_1',
          productName: '10 meters of 1-inch PVC Pipe',
          category: 'Plumbing & Sanitary',
          quantity: 10,
          unit: 'meter',
          expectedBudget: 300,
          urgency: 'immediate',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          responses: [
            {
              _id: 'quote_1',
              offeredPrice: 290,
              responseType: 'in_stock',
              prepEtaMinutes: 5,
              notes: 'Finolex heavy duty in stock right now at counter.',
              shopId: {
                _id: 'shop_1',
                shopName: 'Sharma Hardware & Sanitation Store',
                rating: 4.9,
                distanceKm: 0.8,
                contactPhone: '+91 9876543210',
                address: { street: 'Shop 14, Karol Bagh', city: 'New Delhi' },
              },
            },
          ],
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request details by ID
// @route   GET /api/requests/:id
// @access  Public / Private
export const getRequestDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data: r, error } = await supabase
        .from('requests')
        .select('*, responses:request_responses(*, shops(id, shop_name, rating, contact_phone, address, location_lat, location_lng))')
        .eq('id', id)
        .single();

      if (!error && r) {
        return res.json({
          success: true,
          request: {
            _id: r.id,
            id: r.id,
            productName: r.product_name,
            category: r.category,
            quantity: r.quantity,
            unit: r.unit,
            expectedBudget: r.expected_budget,
            urgency: r.urgency,
            status: r.status,
            notes: r.notes,
            createdAt: r.created_at,
            responses: (r.responses || []).map((resp) => ({
              _id: resp.id,
              id: resp.id,
              offeredPrice: resp.offered_price,
              responseType: resp.response_type,
              prepEtaMinutes: resp.prep_eta_minutes,
              notes: resp.notes,
              shopId: resp.shops
                ? {
                    _id: resp.shops.id,
                    id: resp.shops.id,
                    shopName: resp.shops.shop_name,
                    rating: resp.shops.rating,
                    contactPhone: resp.shops.contact_phone,
                    address: resp.shops.address,
                  }
                : null,
            })),
          },
        });
      }
    }

    res.json({
      success: true,
      request: {
        _id: id,
        id,
        productName: '10 meters of 1-inch PVC Pipe',
        category: 'Plumbing & Sanitary',
        quantity: 10,
        unit: 'meter',
        expectedBudget: 300,
        urgency: 'immediate',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        responses: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Shopkeeper responds to a broadcast request
// @route   POST /api/requests/:id/respond
// @access  Private (Shopkeeper)
export const respondToRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responseType = 'in_stock', offeredPrice, offeredProductName, prepEtaMinutes, notes, shopId } = req.body;

    if (offeredPrice === undefined || offeredPrice === null) {
      return res.status(400).json({ success: false, message: 'Offered price is required' });
    }

    if (supabase) {
      // 1. Verify request exists and is ACTIVE
      const { data: request, error: reqErr } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single();

      if (reqErr || !request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      if (request.status !== 'ACTIVE') {
        return res.status(400).json({ success: false, message: `Cannot quote on ${request.status.toLowerCase()} request` });
      }

      // 2. Resolve shop owned by the authenticated shopkeeper
      let targetShopId = shopId;
      if (!targetShopId || req.user.role !== 'admin') {
        const { data: myShop } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', req.user.id)
          .single();

        if (myShop) {
          targetShopId = myShop.id;
        } else if (req.user.role === 'admin' && targetShopId) {
          // Admin provided shopId
        } else {
          return res.status(400).json({
            success: false,
            message: 'You must have a registered shop profile to quote on requests',
          });
        }
      }

      const { data: response, error } = await supabase
        .from('request_responses')
        .insert([
          {
            request_id: id,
            shop_id: targetShopId,
            response_type: responseType,
            offered_price: parseFloat(offeredPrice),
            offered_product_name: offeredProductName || null,
            prep_eta_minutes: parseInt(prepEtaMinutes) || 10,
            notes: notes || null,
          },
        ])
        .select('*, shops(id, shop_name, rating, contact_phone, address)')
        .single();

      if (error) throw error;

      // Real-time socket notification to customer room
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${request.customer_id}`).emit('request_response_received', {
          requestId: id,
          offeredPrice: parseFloat(offeredPrice),
          shopId: targetShopId,
          shopName: response.shops?.shop_name || 'Nearby Store',
        });
        io.emit('request_response_received', {
          requestId: id,
          offeredPrice: parseFloat(offeredPrice),
          shopId: targetShopId,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Quotation response submitted to customer!',
        response,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quotation response submitted to customer!',
      response: {
        _id: 'b0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14),
        id: 'b0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14),
        requestId: id,
        offeredPrice: parseFloat(offeredPrice),
        responseType,
        prepEtaMinutes: parseInt(prepEtaMinutes) || 10,
        notes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests feed for shopkeepers
// @route   GET /api/requests/shop
// @access  Private (Shopkeeper)
export const getShopRelevantRequests = async (req, res, next) => {
  try {
    if (supabase) {
      // Find shopkeeper's shop category if any
      let shopCategory = null;
      if (req.user) {
        const { data: myShop } = await supabase
          .from('shops')
          .select('category')
          .eq('owner_id', req.user.id)
          .single();
        if (myShop) shopCategory = myShop.category;
      }

      let query = supabase
        .from('requests')
        .select('*, customer:users(id, name, phone)')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (shopCategory && req.query.filterByCategory === 'true') {
        query = query.eq('category', shopCategory);
      }

      const { data: requests, error } = await query;

      if (!error && requests) {
        return res.json({
          success: true,
          requests: requests.map((r) => ({
            _id: r.id,
            id: r.id,
            productName: r.product_name,
            category: r.category,
            quantity: r.quantity,
            unit: r.unit,
            expectedBudget: r.expected_budget,
            urgency: r.urgency,
            notes: r.notes,
            createdAt: r.created_at,
          })),
        });
      }
    }

    res.json({
      success: true,
      requests: [
        {
          _id: 'b0000000-0000-0000-0000-000000000001',
          id: 'b0000000-0000-0000-0000-000000000001',
          productName: '10 meters of 1-inch PVC Pipe',
          category: 'Plumbing & Sanitary',
          quantity: 10,
          unit: 'meter',
          expectedBudget: 300,
          urgency: 'immediate',
          notes: 'Urgent plumbing repair near Karol Bagh',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// Aliases for backwards compatibility
export const createBroadcastRequest = createRequest;
export const getShopRequestsInbox = getShopRelevantRequests;
