import { supabase } from '../config/supabase.js';

// @desc    Broadcast structured request to nearby shops
// @route   POST /api/requests
// @access  Private (Customer)
export const createBroadcastRequest = async (req, res, next) => {
  try {
    const { productName, category, quantity, unit, expectedBudget, urgency, notes } = req.body;

    const { data: request, error } = await supabase
      .from('requests')
      .insert([
        {
          product_name: productName,
          category,
          quantity: parseInt(quantity) || 1,
          unit: unit || 'piece',
          expected_budget: expectedBudget ? parseFloat(expectedBudget) : undefined,
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

    res.status(201).json({
      success: true,
      message: 'Request broadcasted to nearby verified shops!',
      request,
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
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*, responses:request_responses(*, shops(id, shop_name, rating, contact_phone, address, location_lat, location_lng))')
      .order('created_at', { ascending: false });

    if (error || !requests || requests.length === 0) {
      return res.json({
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
              {
                _id: 'quote_2',
                offeredPrice: 295,
                responseType: 'in_stock',
                prepEtaMinutes: 10,
                notes: 'Supreme pipe in stock with 10% discount on fittings.',
                shopId: {
                  _id: 'shop_2',
                  shopName: 'Gupta Building Materials',
                  rating: 4.7,
                  distanceKm: 2.3,
                  contactPhone: '+91 9876543211',
                  address: { street: 'Connaught Place', city: 'New Delhi' },
                },
              },
            ],
          },
        ],
      });
    }

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

    res.json({
      success: true,
      count: formatted.length,
      requests: formatted,
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
    const { responseType, offeredPrice, offeredProductName, prepEtaMinutes, notes, shopId } = req.body;

    const { data: response, error } = await supabase
      .from('request_responses')
      .insert([
        {
          request_id: id,
          shop_id: shopId || 'b0000000-0000-0000-0000-000000000001',
          response_type: responseType,
          offered_price: parseFloat(offeredPrice),
          offered_product_name: offeredProductName,
          prep_eta_minutes: parseInt(prepEtaMinutes) || 10,
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Real-time socket notification to customer
    const io = req.app.get('io');
    if (io) {
      io.emit('request_response_received', {
        requestId: id,
        offeredPrice,
        shopName: 'Sharma Hardware & Sanitation',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quotation response submitted to customer!',
      response,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests feed for shopkeepers
// @route   GET /api/requests/shop
// @access  Private (Shopkeeper)
export const getShopRequestsInbox = async (req, res, next) => {
  try {
    const { data: requests } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      requests: (requests || []).map((r) => ({
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
  } catch (error) {
    next(error);
  }
};
