import Request from '../models/Request.js';
import RequestResponse from '../models/RequestResponse.js';
import Shop from '../models/Shop.js';
import Notification from '../models/Notification.js';
import { calculateDistanceKm } from '../utils/geoCoder.js';

// @desc    Broadcast a new customer product request
// @route   POST /api/requests
// @access  Private (Customer)
export const createRequest = async (req, res, next) => {
  try {
    const {
      productName,
      category,
      quantity,
      unit,
      budget,
      note,
      urgency,
      coordinates,
      addressText,
      searchRadiusKm,
    } = req.body;

    const coords = coordinates && coordinates.length === 2 ? coordinates : [77.2090, 28.6139];
    const radius = parseFloat(searchRadiusKm) || 5;

    // Set expiry: 2 hours for immediate, 8 hours for today, 24 hours for flexible
    let expiryHours = 2;
    if (urgency === 'today') expiryHours = 8;
    if (urgency === 'flexible') expiryHours = 24;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const request = await Request.create({
      customerId: req.user._id,
      productName,
      category,
      quantity: parseInt(quantity) || 1,
      unit: unit || 'piece',
      budget: parseFloat(budget) || 0,
      note: note || '',
      urgency: urgency || 'immediate',
      location: {
        type: 'Point',
        coordinates: coords,
        addressText: addressText || '',
      },
      searchRadiusKm: radius,
      expiresAt,
    });

    // Find nearby shops in this category to notify
    const allShops = await Shop.find({
      verificationStatus: 'verified',
      isAcceptingRequests: true,
    });

    const nearbyShops = allShops.filter((shop) => {
      // Category match or generic
      const categoryMatches = !category || category === 'All' || shop.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(shop.category.toLowerCase());
      if (!categoryMatches) return false;

      const dist = calculateDistanceKm(coords, shop.location.coordinates);
      return dist <= radius;
    });

    // Create notifications for shopkeepers
    const notifications = nearbyShops.map((shop) => ({
      userId: shop.ownerId,
      title: 'New Product Broadcast Request!',
      message: `A customer nearby is requesting "${productName}" (Qty: ${quantity}). Submit your price quote!`,
      type: 'request_alert',
      link: `/shop/requests`,
      metadata: { requestId: request._id, shopId: shop._id },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Socket alert via global io instance if available
    const io = req.app.get('io');
    if (io) {
      nearbyShops.forEach((shop) => {
        io.to(`shop_${shop._id}`).emit('new_broadcast_request', {
          requestId: request._id,
          productName: request.productName,
          category: request.category,
          quantity: request.quantity,
          urgency: request.urgency,
          note: request.note,
        });
      });
    }

    res.status(201).json({
      success: true,
      message: `Request broadcast to ${nearbyShops.length} nearby shops`,
      request,
      broadcastShopCount: nearbyShops.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer's requests
// @route   GET /api/requests/my
// @access  Private (Customer)
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ customerId: req.user._id })
      .sort({ createdAt: -1 });

    const requestsWithResponses = await Promise.all(
      requests.map(async (r) => {
        const responses = await RequestResponse.find({ requestId: r._id })
          .populate('shopId', 'shopName rating location address contactPhone');
        return {
          ...r.toObject(),
          responses,
        };
      })
    );

    res.json({
      success: true,
      requests: requestsWithResponses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get request details and side-by-side shop offers
// @route   GET /api/requests/:id
// @access  Public / Private
export const getRequestDetails = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('customerId', 'name profileImage');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    let responses = await RequestResponse.find({ requestId: request._id })
      .populate('shopId', 'shopName tagline rating reviewCount location address contactPhone liveState');

    // Attach distances from customer's request coordinates
    responses = responses.map((resItem) => {
      const itemObj = resItem.toObject();
      if (itemObj.shopId && itemObj.shopId.location) {
        itemObj.distanceKm = calculateDistanceKm(
          request.location.coordinates,
          itemObj.shopId.location.coordinates
        );
      } else {
        itemObj.distanceKm = 0;
      }
      return itemObj;
    });

    // Determine Best Value (lowest offered price among available items)
    let minPrice = Infinity;
    let bestValueId = null;

    responses.forEach((resp) => {
      if (resp.availabilityStatus === 'available' && resp.offeredPrice > 0 && resp.offeredPrice < minPrice) {
        minPrice = resp.offeredPrice;
        bestValueId = resp._id.toString();
      }
    });

    responses = responses.map((resp) => ({
      ...resp,
      isBestValue: resp._id.toString() === bestValueId,
    }));

    res.json({
      success: true,
      request,
      responses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming broadcast requests for a shopkeeper
// @route   GET /api/requests/shop
// @access  Private (Shopkeeper)
export const getShopRelevantRequests = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({ success: false, message: 'No shop found for your account' });
    }

    // Find active requests within radius
    const activeRequests = await Request.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    const relevantRequests = await Promise.all(
      activeRequests
        .filter((reqItem) => {
          const dist = calculateDistanceKm(shop.location.coordinates, reqItem.location.coordinates);
          return dist <= reqItem.searchRadiusKm;
        })
        .map(async (reqItem) => {
          const reqObj = reqItem.toObject();
          reqObj.distanceKm = calculateDistanceKm(shop.location.coordinates, reqItem.location.coordinates);
          
          // Check if this shop has already responded
          const myResponse = await RequestResponse.findOne({
            requestId: reqItem._id,
            shopId: shop._id,
          });

          reqObj.myResponse = myResponse;
          return reqObj;
        })
    );

    res.json({
      success: true,
      shopId: shop._id,
      requests: relevantRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Shopkeeper responds to a customer request
// @route   POST /api/requests/:id/respond
// @access  Private (Shopkeeper)
export const respondToRequest = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({ success: false, message: 'No shop found for your account' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'active' || request.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This request is no longer active' });
    }

    const {
      availabilityStatus,
      offeredPrice,
      preparationTimeMinutes,
      notes,
      alternativeProductName,
      alternativeDetails,
    } = req.body;

    let response = await RequestResponse.findOne({
      requestId: request._id,
      shopId: shop._id,
    });

    if (response) {
      response.availabilityStatus = availabilityStatus;
      response.offeredPrice = parseFloat(offeredPrice) || 0;
      response.preparationTimeMinutes = parseInt(preparationTimeMinutes) || 10;
      response.notes = notes || '';
      response.alternativeProductName = alternativeProductName || '';
      response.alternativeDetails = alternativeDetails || '';
      await response.save();
    } else {
      response = await RequestResponse.create({
        requestId: request._id,
        shopId: shop._id,
        shopkeeperId: req.user._id,
        availabilityStatus,
        offeredPrice: parseFloat(offeredPrice) || 0,
        preparationTimeMinutes: parseInt(preparationTimeMinutes) || 10,
        notes: notes || '',
        alternativeProductName: alternativeProductName || '',
        alternativeDetails: alternativeDetails || '',
      });

      request.responsesCount += 1;
      await request.save();
    }

    // Create notification for the customer
    await Notification.create({
      userId: request.customerId,
      title: `Offer Received: ${shop.shopName}`,
      message: `${shop.shopName} offered ₹${offeredPrice} for "${request.productName}". View & compare offers!`,
      type: 'request_response',
      link: `/customer/requests/${request._id}`,
      metadata: { requestId: request._id, responseId: response._id, shopId: shop._id },
    });

    // Real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.customerId}`).emit('request_response_received', {
        requestId: request._id,
        shopName: shop.shopName,
        offeredPrice,
        availabilityStatus,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      response,
    });
  } catch (error) {
    next(error);
  }
};
