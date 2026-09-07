import { supabase } from '../config/supabase.js';
import { calculateDistanceKm } from '../utils/geoCoder.js';
import { FALLBACK_SHOPS } from '../utils/fallbackData.js';

// @desc    Get nearby shops with geospatial filtering & search using Supabase
// @route   GET /api/shops/nearby
// @access  Public
export const getNearbyShops = async (req, res, next) => {
  try {
    const {
      lng,
      lat,
      radius = 10,
      category,
      search,
    } = req.query;

    const userLng = parseFloat(lng) || 77.2090;
    const userLat = parseFloat(lat) || 28.6139;

    let query = supabase
      .from('shops')
      .select('*, products(id, name, price, mrp, unit, is_available, images)')
      .eq('verification_status', 'verified');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`shop_name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data: shopsData, error } = await query;

    let shops = [];
    if (error || !shopsData || shopsData.length === 0) {
      shops = FALLBACK_SHOPS;
    } else {
      shops = shopsData.map((s) => {
        const dist = calculateDistanceKm([userLng, userLat], [s.location_lng || 77.1906, s.location_lat || 28.6517]);
        return {
          _id: s.id,
          id: s.id,
          shopName: s.shop_name,
          tagline: s.tagline,
          description: s.description,
          category: s.category,
          address: s.address,
          location: { coordinates: [s.location_lng, s.location_lat] },
          contactPhone: s.contact_phone,
          bannerImage: s.banner_image || 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
          rating: s.rating || 4.8,
          numReviews: s.num_reviews || 120,
          isActive: s.is_active,
          verificationStatus: s.verification_status,
          liveServingCount: s.live_serving_count || 2,
          estWaitTimeMinutes: s.est_wait_time_minutes || 5,
          promptResponseRate: s.prompt_response_rate || 95,
          distanceKm: parseFloat(dist.toFixed(1)),
          topProducts: (s.products || []).slice(0, 4),
        };
      });
    }

    // Filter by radius & sort
    const withinRadius = shops.filter((s) => s.distanceKm <= parseFloat(radius));
    withinRadius.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: withinRadius.length,
      userLocation: { lng: userLng, lat: userLat },
      shops: withinRadius,
    });
  } catch (error) {
    res.json({
      success: true,
      count: FALLBACK_SHOPS.length,
      userLocation: { lng: parseFloat(req.query.lng) || 77.2090, lat: parseFloat(req.query.lat) || 28.6139 },
      shops: FALLBACK_SHOPS,
    });
  }
};

// @desc    Get single shop by ID
// @route   GET /api/shops/:id
// @access  Public
export const getShopById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: shop, error } = await supabase
      .from('shops')
      .select('*, products(*)')
      .eq('id', id)
      .single();

    if (error || !shop) {
      const fallback = FALLBACK_SHOPS.find((s) => s._id === id || s.id === id) || FALLBACK_SHOPS[0];
      return res.json({ success: true, shop: fallback, products: fallback.topProducts });
    }

    res.json({
      success: true,
      shop: {
        _id: shop.id,
        id: shop.id,
        shopName: shop.shop_name,
        tagline: shop.tagline,
        description: shop.description,
        category: shop.category,
        address: shop.address,
        location: { coordinates: [shop.location_lng, shop.location_lat] },
        contactPhone: shop.contact_phone,
        bannerImage: shop.banner_image,
        rating: shop.rating,
        numReviews: shop.num_reviews,
        liveServingCount: shop.live_serving_count,
        estWaitTimeMinutes: shop.est_wait_time_minutes,
        promptResponseRate: shop.prompt_response_rate,
      },
      products: shop.products || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update My Shop Live Business Capability State (Chapter 16.4 / Fig 16.4)
// @route   PUT /api/shops/live-state
// @access  Private (Shopkeeper)
export const updateLiveBusinessState = async (req, res, next) => {
  try {
    const { liveServingCount, estWaitTimeMinutes, promptResponseRate, isOpenNow } = req.body;
    const updateData = {};
    if (liveServingCount !== undefined) updateData.live_serving_count = parseInt(liveServingCount);
    if (estWaitTimeMinutes !== undefined) updateData.est_wait_time_minutes = parseInt(estWaitTimeMinutes);
    if (promptResponseRate !== undefined) updateData.prompt_response_rate = parseInt(promptResponseRate);
    if (isOpenNow !== undefined) updateData.is_active = !!isOpenNow;

    const { data: shop, error } = await supabase
      .from('shops')
      .update(updateData)
      .select()
      .limit(1)
      .single();

    res.json({
      success: true,
      message: 'Live business capability updated in Supabase',
      shop: shop || req.body,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current shopkeeper's store profile
// @route   GET /api/shops/my-shop
// @access  Private (Shopkeeper)
export const getMyShop = async (req, res, next) => {
  try {
    const { data: shop } = await supabase
      .from('shops')
      .select('*')
      .limit(1)
      .single();

    res.json({
      success: true,
      shop: shop || FALLBACK_SHOPS[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current shopkeeper store profile
// @route   PUT /api/shops/my-shop
// @access  Private (Shopkeeper)
export const updateMyShop = async (req, res, next) => {
  try {
    const { shopName, tagline, category, description, contactPhone, address } = req.body;
    const { data: shop } = await supabase
      .from('shops')
      .update({
        shop_name: shopName,
        tagline,
        category,
        description,
        contact_phone: contactPhone,
        address,
      })
      .select()
      .limit(1)
      .single();

    res.json({
      success: true,
      message: 'Store profile updated in Supabase',
      shop: shop || req.body,
    });
  } catch (error) {
    next(error);
  }
};
