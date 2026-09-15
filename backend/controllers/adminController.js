import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import {
  FALLBACK_SHOPS,
  FALLBACK_PRODUCTS,
  FALLBACK_RESERVATIONS,
  FALLBACK_CUSTOMER_REQUESTS,
} from '../utils/fallbackData.js';

// Default platform persona test accounts matching README.md exactly (2 shopkeepers, 1 customer, 1 admin)
export let DEFAULT_ADMIN_USERS = [
  {
    _id: 'a0000000-0000-0000-0000-000000000001',
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Rahul Sharma',
    email: 'customer@quickkart.com',
    role: 'customer',
    phone: '+91 9811223344',
    address: { street: 'Flat 402, Block 8', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' },
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-10T10:30:00.000Z',
  },
  {
    _id: 'a0000000-0000-0000-0000-000000000002',
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Sharma Hardware Store',
    email: 'sharma@quickkart.com',
    role: 'shopkeeper',
    phone: '+91 9876543210',
    address: { street: 'Shop 14, Block 8, Ajmal Khan Road', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' },
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-05T08:00:00.000Z',
    shopId: 'b0000000-0000-0000-0000-000000000001',
    shopName: 'Sharma Hardware & Daily Essentials Store',
  },
  {
    _id: 'a0000000-0000-0000-0000-000000000003',
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Gupta Building Materials',
    email: 'gupta@quickkart.com',
    role: 'shopkeeper',
    phone: '+91 9876543211',
    address: { street: 'Plot 22, Connaught Circus', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-06T09:30:00.000Z',
    shopId: 'b0000000-0000-0000-0000-000000000002',
    shopName: 'Gupta Building Materials & Hardware',
  },
  {
    _id: 'a0000000-0000-0000-0000-000000000004',
    id: 'a0000000-0000-0000-0000-000000000004',
    name: 'QuickKart Admin',
    email: 'admin@quickkart.com',
    role: 'admin',
    phone: '+91 9800000000',
    address: { street: 'Platform Operations HQ', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    status: 'active',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const DEFAULT_TRAFFIC_STATS = {
  dailyVisitors: 1420,
  searchRequestsToday: 3240,
  pageViewsToday: 8650,
  conversionRate: 12.8,
  growthPercentage: 17.3,
};


// @desc    Get Admin platform KPI metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    let usersList = DEFAULT_ADMIN_USERS;
    let shopsList = FALLBACK_SHOPS;
    let productsList = FALLBACK_PRODUCTS;
    let reservationsList = FALLBACK_RESERVATIONS;
    let requestsList = FALLBACK_CUSTOMER_REQUESTS;

    if (supabase) {
      try {
        const { data: dbUsers } = await supabase.from('users').select('*');
        const { data: dbShops } = await supabase.from('shops').select('*');
        const { data: dbProducts } = await supabase.from('products').select('*');
        const { data: dbRes } = await supabase.from('reservations').select('*');
        const { data: dbReq } = await supabase.from('requests').select('*');

        if (dbUsers && dbUsers.length > 0) {
          usersList = dbUsers.map(u => ({ ...u, _id: u.id, status: u.status || 'active' }));
        }
        if (dbShops && dbShops.length > 0) {
          shopsList = dbShops.map(s => ({
            ...s,
            _id: s.id,
            shopName: s.shop_name,
            isActive: s.is_active !== undefined ? s.is_active : true,
            verificationStatus: s.verification_status || 'verified',
            address: s.address || { area: 'Delhi NCR', state: 'Delhi' },
            location: { coordinates: [s.location_lng || 77.1906, s.location_lat || 28.6517] },
          }));
        }
        if (dbProducts && dbProducts.length > 0) {
          productsList = dbProducts.map(p => ({
            ...p,
            _id: p.id,
            price: p.price || 0,
            quantityInStock: p.quantity_in_stock || 0,
            stockStatus: (p.quantity_in_stock || 0) > 3 ? 'in_stock' : (p.quantity_in_stock || 0) > 0 ? 'low_stock' : 'out_of_stock',
          }));
        }
        if (dbRes && dbRes.length > 0) {
          reservationsList = dbRes.map(r => ({
            ...r,
            _id: r.id,
            totalAmount: r.total_amount || 0,
            status: r.status || 'COMPLETED',
          }));
        }
        if (dbReq && dbReq.length > 0) {
          requestsList = dbReq.map(rq => ({ ...rq, _id: rq.id, status: rq.status || 'ACTIVE' }));
        }
      } catch (dbErr) {
        console.warn('[Admin Stats DB Query] Falling back to memory store:', dbErr.message);
      }
    }

    // Calculations
    const customersCount = usersList.filter(u => u.role === 'customer').length;
    const shopkeepersCount = usersList.filter(u => u.role === 'shopkeeper').length;
    const adminsCount = usersList.filter(u => u.role === 'admin').length;
    const activeUsersCount = usersList.filter(u => u.status === 'active').length;
    const suspendedUsersCount = usersList.filter(u => u.status === 'suspended').length;

    const totalShops = shopsList.length;
    const activeShops = shopsList.filter(s => s.isActive !== false).length;
    const inactiveShops = totalShops - activeShops;
    const verifiedShops = shopsList.filter(s => s.verificationStatus === 'verified').length;
    const pendingShops = shopsList.filter(s => s.verificationStatus === 'pending').length;

    const totalProducts = productsList.length;
    const inStockProducts = productsList.filter(p => (p.quantityInStock || p.quantity_in_stock || 0) > 3).length;
    const lowStockProducts = productsList.filter(p => {
      const q = p.quantityInStock || p.quantity_in_stock || 0;
      return q > 0 && q <= 3;
    }).length;
    const outOfStockProducts = productsList.filter(p => (p.quantityInStock || p.quantity_in_stock || 0) === 0).length;
    const totalInventoryValue = productsList.reduce((sum, p) => {
      const q = p.quantityInStock || p.quantity_in_stock || 0;
      const pr = p.price || 0;
      return sum + (q * pr);
    }, 0);

    const totalReservations = reservationsList.length;
    const completedReservations = reservationsList.filter(r => r.status === 'COMPLETED').length;
    const totalSalesRevenue = reservationsList
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.total_amount || r.totalAmount || 0), 0);
    const avgTicketValue = completedReservations > 0 ? Math.round(totalSalesRevenue / completedReservations) : 0;

    const activeRequests = requestsList.filter(rq => rq.status === 'ACTIVE' || rq.status === 'active' || rq.status === 'PENDING').length;

    res.json({
      success: true,
      stats: {
        users: {
          total: usersList.length,
          customers: customersCount,
          shopkeepers: shopkeepersCount,
          admins: adminsCount,
          active: activeUsersCount,
          suspended: suspendedUsersCount,
        },
        shops: {
          total: totalShops,
          active: activeShops,
          inactive: inactiveShops,
          verified: verifiedShops,
          pending: pendingShops,
        },
        products: {
          total: totalProducts,
          inStock: inStockProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          totalInventoryValue,
        },
        sales: {
          totalRevenue: totalSalesRevenue,
          completedOrders: completedReservations,
          totalOrders: totalReservations,
          avgTicketValue,
        },
        requests: {
          total: requestsList.length,
          active: activeRequests,
        },
        traffic: DEFAULT_TRAFFIC_STATS,
      },
      recentUsers: usersList.slice(0, 5),
      recentRequests: requestsList.slice(0, 5),
      recentReservations: reservationsList.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with role & shopkeeper connections
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    let users = DEFAULT_ADMIN_USERS;

    if (supabase) {
      try {
        let query = supabase
          .from('users')
          .select('id, name, email, role, phone, status, address, profile_image, created_at')
          .order('created_at', { ascending: false });

        if (role && role !== 'ALL') {
          query = query.eq('role', role);
        }
        if (status && status !== 'ALL') {
          query = query.eq('status', status);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data: dbUsers, error } = await query;
        if (!error && dbUsers && dbUsers.length > 0) {
          // Fetch shops to attach connected shop info to shopkeepers
          const { data: dbShops } = await supabase.from('shops').select('id, owner_id, shop_name, address');
          const shopMap = {};
          if (dbShops) {
            dbShops.forEach(s => {
              if (s.owner_id) shopMap[s.owner_id] = s;
            });
          }

          return res.json({
            success: true,
            users: dbUsers.map(u => ({
              _id: u.id,
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              phone: u.phone,
              status: u.status || 'active',
              address: u.address,
              profileImage: u.profile_image,
              createdAt: u.created_at,
              shop: shopMap[u.id] ? {
                id: shopMap[u.id].id,
                shopName: shopMap[u.id].shop_name,
                area: shopMap[u.id].address?.area,
                city: shopMap[u.id].address?.city,
              } : null,
            })),
          });
        }
      } catch (err) {
        console.warn('[Admin getAllUsers DB Query] Using fallback:', err.message);
      }
    }

    // In-memory fallback filtering
    let filtered = [...users];

    if (role && role !== 'ALL') {
      filtered = filtered.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(u => (u.status || 'active').toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.shopName && u.shopName.toLowerCase().includes(q))
      );
    }

    // Attach shop details for shopkeepers in fallback data
    const enhanced = filtered.map(u => {
      let shop = null;
      if (u.role === 'shopkeeper') {
        const matchingShop = FALLBACK_SHOPS.find(s => s.owner_id === u.id || s.owner_id === u._id);
        if (matchingShop) {
          shop = {
            id: matchingShop.id || matchingShop._id,
            shopName: matchingShop.shopName,
            area: matchingShop.address?.area,
            city: matchingShop.address?.city,
            state: matchingShop.address?.state,
          };
        } else if (u.shopName) {
          shop = {
            id: u.shopId || 'shop_unknown',
            shopName: u.shopName,
            area: u.address?.area,
            city: u.address?.city,
            state: u.address?.state,
          };
        }
      }
      return {
        ...u,
        shop,
      };
    });

    res.json({
      success: true,
      users: enhanced,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (active / suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, name, email, status')
        .single();

      if (!error && user) {
        return res.json({
          success: true,
          message: `User status changed to ${status}`,
          user,
        });
      }
    }

    // Update in-memory fallback list
    const found = DEFAULT_ADMIN_USERS.find(u => u.id === id || u._id === id);
    if (found) {
      found.status = status;
    }

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      user: { id, status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shops with status, owner info, and metrics
// @route   GET /api/admin/shops
// @access  Private (Admin)
export const getAllShops = async (req, res, next) => {
  try {
    const { status, active, state, area, search } = req.query;
    let shops = FALLBACK_SHOPS;

    if (supabase) {
      try {
        let query = supabase
          .from('shops')
          .select('*')
          .order('created_at', { ascending: false });

        if (status && status !== 'ALL') {
          query = query.eq('verification_status', status);
        }
        if (active !== undefined && active !== 'ALL') {
          query = query.eq('is_active', active === 'true' || active === true);
        }

        const { data: dbShops, error } = await query;
        if (!error && dbShops && dbShops.length > 0) {
          const { data: dbUsers } = await supabase.from('users').select('id, name, email, phone');
          const userMap = {};
          if (dbUsers) {
            dbUsers.forEach(u => { userMap[u.id] = u; });
          }

          return res.json({
            success: true,
            shops: dbShops.map(s => {
              const owner = userMap[s.owner_id];
              return {
                _id: s.id,
                id: s.id,
                shopName: s.shop_name,
                category: s.category,
                tagline: s.tagline,
                description: s.description,
                address: s.address || {},
                location: { coordinates: [s.location_lng || 77.1906, s.location_lat || 28.6517] },
                contactPhone: s.contact_phone,
                verificationStatus: s.verification_status,
                isActive: s.is_active !== undefined ? s.is_active : true,
                rating: s.rating || 4.5,
                numReviews: s.num_reviews || 0,
                bannerImage: s.banner_image,
                ownerId: owner ? {
                  _id: owner.id,
                  name: owner.name,
                  email: owner.email,
                  phone: owner.phone,
                } : null,
                liveServingCount: s.live_serving_count || 0,
                estWaitTimeMinutes: s.est_wait_time_minutes || 0,
              };
            }),
          });
        }
      } catch (err) {
        console.warn('[Admin getAllShops DB Query] Using fallback:', err.message);
      }
    }

    // In-memory fallback filtering
    let filtered = [...shops];

    if (status && status !== 'ALL') {
      filtered = filtered.filter(s => s.verificationStatus.toLowerCase() === status.toLowerCase());
    }

    if (active !== undefined && active !== 'ALL') {
      const isAct = active === 'true' || active === true;
      filtered = filtered.filter(s => (s.isActive !== false) === isAct);
    }

    if (state && state !== 'ALL') {
      filtered = filtered.filter(s => (s.address?.state || '').toLowerCase() === state.toLowerCase());
    }

    if (area && area !== 'ALL') {
      filtered = filtered.filter(s => (s.address?.area || '').toLowerCase().includes(area.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.shopName.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.address?.area && s.address.area.toLowerCase().includes(q)) ||
        (s.address?.city && s.address.city.toLowerCase().includes(q)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(q))
      );
    }

    // Attach owner details
    const enhanced = filtered.map(s => {
      const owner = DEFAULT_ADMIN_USERS.find(u => u.id === s.owner_id || u._id === s.owner_id);
      return {
        ...s,
        ownerId: owner ? {
          _id: owner.id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
        } : {
          name: s.ownerName || 'Store Owner',
          email: 'owner@quickkart.com',
          phone: s.contactPhone,
        },
      };
    });

    res.json({
      success: true,
      shops: enhanced,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject shop
// @route   PUT /api/admin/shops/:id/verify
// @access  Private (Admin)
export const verifyShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'verified', notes = '' } = req.body;

    if (supabase) {
      const { data: updated, error } = await supabase
        .from('shops')
        .update({ verification_status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        return res.json({
          success: true,
          message: `Shop marked as ${status}`,
          shop: updated,
        });
      }
    }

    const shop = FALLBACK_SHOPS.find(s => s.id === id || s._id === id);
    if (shop) {
      shop.verificationStatus = status;
      shop.verificationNotes = notes;
      if (status === 'verified') shop.isActive = true;
    }

    res.json({
      success: true,
      message: `Shop marked as ${status}`,
      shop: shop || { id, verificationStatus: status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle shop active / inactive operational status
// @route   PUT /api/admin/shops/:id/status
// @access  Private (Admin)
export const toggleShopStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (supabase) {
      const { data: updated, error } = await supabase
        .from('shops')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        return res.json({
          success: true,
          message: `Shop is now ${isActive ? 'Active' : 'Inactive'}`,
          shop: updated,
        });
      }
    }

    const shop = FALLBACK_SHOPS.find(s => s.id === id || s._id === id);
    if (shop) {
      shop.isActive = isActive;
    }

    res.json({
      success: true,
      message: `Shop is now ${isActive ? 'Active' : 'Inactive'}`,
      shop: shop || { id, isActive },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered products across stores for Admin Catalog
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAdminProducts = async (req, res, next) => {
  try {
    const { search, shopId, category, stockStatus } = req.query;
    let products = FALLBACK_PRODUCTS;

    if (supabase) {
      try {
        let query = supabase
          .from('products')
          .select('*, shops(id, shop_name, address, rating)');

        if (shopId && shopId !== 'ALL') {
          query = query.eq('shop_id', shopId);
        }
        if (category && category !== 'ALL') {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: dbProducts, error } = await query;
        if (!error && dbProducts && dbProducts.length > 0) {
          let formatted = dbProducts.map(p => {
            const qty = p.quantity_in_stock || 0;
            const status = qty > 3 ? 'in_stock' : qty > 0 ? 'low_stock' : 'out_of_stock';
            return {
              _id: p.id,
              id: p.id,
              name: p.name,
              brand: p.brand,
              description: p.description,
              category: p.category,
              price: p.price,
              mrp: p.mrp,
              unit: p.unit || 'piece',
              quantityInStock: qty,
              isAvailable: p.is_available,
              stockStatus: status,
              images: p.images || [],
              tags: p.tags || [],
              shopId: p.shops ? {
                _id: p.shops.id,
                id: p.shops.id,
                shopName: p.shops.shop_name,
                address: p.shops.address,
                rating: p.shops.rating,
              } : null,
            };
          });

          if (stockStatus && stockStatus !== 'ALL') {
            formatted = formatted.filter(p => p.stockStatus === stockStatus);
          }

          const totalValuation = formatted.reduce((acc, p) => acc + (p.price * (p.quantityInStock || 0)), 0);
          const totalStockUnits = formatted.reduce((acc, p) => acc + (p.quantityInStock || 0), 0);

          return res.json({
            success: true,
            totalCount: formatted.length,
            totalValuation,
            totalStockUnits,
            products: formatted,
          });
        }
      } catch (err) {
        console.warn('[Admin getAdminProducts DB Query] Using fallback:', err.message);
      }
    }

    // In-memory fallback
    let filtered = [...products];

    if (shopId && shopId !== 'ALL') {
      filtered = filtered.filter(p => (p.shopId?._id === shopId || p.shopId?.id === shopId));
    }

    if (category && category !== 'ALL') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (stockStatus && stockStatus !== 'ALL') {
      filtered = filtered.filter(p => p.stockStatus === stockStatus);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.shopId?.shopName && p.shopId.shopName.toLowerCase().includes(q))
      );
    }

    const totalValuation = filtered.reduce((acc, p) => acc + (p.price * (p.quantityInStock || 0)), 0);
    const totalStockUnits = filtered.reduce((acc, p) => acc + (p.quantityInStock || 0), 0);

    res.json({
      success: true,
      totalCount: filtered.length,
      totalValuation,
      totalStockUnits,
      products: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sales Reports (Overall, State-wise, Area-wise)
// @route   GET /api/admin/reports/sales
// @access  Private (Admin)
export const getSalesReport = async (req, res, next) => {
  try {
    const { range = 'all' } = req.query; // 7d, 30d, 90d, all
    let shops = FALLBACK_SHOPS;
    let reservations = FALLBACK_RESERVATIONS;

    if (supabase) {
      try {
        const { data: dbShops } = await supabase.from('shops').select('*');
        const { data: dbRes } = await supabase.from('reservations').select('*');
        if (dbShops && dbShops.length > 0) {
          shops = dbShops.map(s => ({
            ...s,
            _id: s.id,
            shopName: s.shop_name,
            isActive: s.is_active !== undefined ? s.is_active : true,
            address: s.address || { area: 'Delhi NCR', state: 'Delhi' },
            location: { coordinates: [s.location_lng || 77.1906, s.location_lat || 28.6517] },
          }));
        }
        if (dbRes && dbRes.length > 0) {
          reservations = dbRes.map(r => ({
            ...r,
            _id: r.id,
            totalAmount: r.total_amount || 0,
            status: r.status || 'COMPLETED',
            created_at: r.created_at || r.createdAt,
          }));
        }
      } catch (dbErr) {
        console.warn('[Admin Sales Report DB Query] Using fallback store:', dbErr.message);
      }
    }

    // Filter reservations by range if needed
    const now = Date.now();
    const daysLimit = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const thresholdDate = new Date(now - (daysLimit * 24 * 60 * 60 * 1000));

    const completed = reservations.filter(r => {
      const d = new Date(r.created_at || r.createdAt);
      return (r.status === 'COMPLETED') && d >= thresholdDate;
    });

    const totalRevenue = completed.reduce((sum, r) => sum + (r.total_amount || r.totalAmount || 0), 0);
    const totalOrders = completed.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Area-wise map
    const areaStatsMap = {};
    const stateStatsMap = {};

    shops.forEach(s => {
      const area = s.address?.area || 'Central Area';
      const state = s.address?.state || 'Delhi';

      if (!areaStatsMap[area]) {
        areaStatsMap[area] = {
          area,
          state,
          activeShopsCount: 0,
          totalOrders: 0,
          revenue: 0,
          coordinates: s.location?.coordinates || [77.1906, 28.6517],
          topSellingProduct: 'PVC Pipe & Fittings',
        };
      }
      if (s.isActive !== false) {
        areaStatsMap[area].activeShopsCount += 1;
      }

      if (!stateStatsMap[state]) {
        stateStatsMap[state] = {
          state,
          activeShopsCount: 0,
          totalOrders: 0,
          revenue: 0,
        };
      }
      if (s.isActive !== false) {
        stateStatsMap[state].activeShopsCount += 1;
      }
    });

    // Populate sales from reservations
    completed.forEach(r => {
      const shop = shops.find(s => s.id === r.shop_id || s._id === r.shop_id);
      const area = shop?.address?.area || 'Karol Bagh';
      const state = shop?.address?.state || 'Delhi';
      const amt = r.total_amount || r.totalAmount || 0;

      if (areaStatsMap[area]) {
        areaStatsMap[area].totalOrders += 1;
        areaStatsMap[area].revenue += amt;
        if (r.product_name) areaStatsMap[area].topSellingProduct = r.product_name;
      }
      if (stateStatsMap[state]) {
        stateStatsMap[state].totalOrders += 1;
        stateStatsMap[state].revenue += amt;
      }
    });

    const areaWise = Object.values(areaStatsMap).sort((a, b) => b.revenue - a.revenue);
    const stateWise = Object.values(stateStatsMap).map(s => ({
      ...s,
      percentageShare: totalRevenue > 0 ? Math.round((s.revenue / totalRevenue) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      range,
      overall: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        pickupSuccessRate: 93.4,
        avgQuoteTimeMinutes: 4.2,
      },
      stateWise,
      areaWise,
      recentCompletedOrders: completed.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform Traffic & Engagement Analytics
// @route   GET /api/admin/reports/traffic
// @access  Private (Admin)
export const getTrafficAnalytics = async (req, res, next) => {
  try {
    res.json({
      success: true,
      traffic: DEFAULT_TRAFFIC_STATS,
      deviceBreakdown: {
        mobile: 68.4,
        desktop: 28.2,
        tablet: 3.4,
      },
      retentionRate: 74.2,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Geospatial Distribution Data for State & Area Maps
// @route   GET /api/admin/geo-map
// @access  Private (Admin)
export const getGeoMapData = async (req, res, next) => {
  try {
    let shops = FALLBACK_SHOPS;
    let users = DEFAULT_ADMIN_USERS;

    if (supabase) {
      try {
        const { data: dbShops } = await supabase.from('shops').select('*');
        const { data: dbUsers } = await supabase.from('users').select('*');
        if (dbShops && dbShops.length > 0) {
          shops = dbShops.map(s => ({
            ...s,
            _id: s.id,
            shopName: s.shop_name,
            isActive: s.is_active !== undefined ? s.is_active : true,
            verificationStatus: s.verification_status || 'verified',
            address: s.address || { area: 'Delhi NCR', state: 'Delhi' },
            location: { coordinates: [s.location_lng || 77.1906, s.location_lat || 28.6517] },
            contactPhone: s.contact_phone,
            rating: s.rating || 4.8,
            category: s.category || 'Store',
            totalSalesVolume: s.total_sales_volume || 0,
          }));
        }
        if (dbUsers && dbUsers.length > 0) {
          users = dbUsers.map(u => ({ ...u, _id: u.id, status: u.status || 'active' }));
        }
      } catch (dbErr) {
        console.warn('[Admin GeoMap DB Query] Using fallback store:', dbErr.message);
      }
    }

    // States list with default center lat/lng
    const states = [
      { id: 'delhi', name: 'Delhi', center: [28.6139, 77.2090], zoom: 12 },
      { id: 'uttar-pradesh', name: 'Uttar Pradesh', center: [28.6256, 77.3639], zoom: 12 },
      { id: 'haryana', name: 'Haryana', center: [28.4950, 77.0888], zoom: 13 },
      { id: 'maharashtra', name: 'Maharashtra', center: [19.0596, 72.8335], zoom: 12 },
      { id: 'karnataka', name: 'Karnataka', center: [12.9784, 77.6412], zoom: 13 },
    ];

    // Areas list with coordinates and pre-computed sales
    const areas = [
      {
        id: 'karol-bagh',
        name: 'Karol Bagh',
        state: 'Delhi',
        center: [28.6517, 77.1906],
        zoom: 14,
        description: 'Prime central wholesale and retail market for hardware, tools, sanitary and daily groceries.',
      },
      {
        id: 'connaught-place',
        name: 'Connaught Place',
        state: 'Delhi',
        center: [28.6304, 77.2177],
        zoom: 14,
        description: 'Heritage commercial circle with high density building materials, hardware and provisions.',
      },
      {
        id: 'lajpat-nagar',
        name: 'Lajpat Nagar',
        state: 'Delhi',
        center: [28.5700, 77.2433],
        zoom: 14,
        description: 'Dense South Delhi market specializing in plumbing supplies, pipes, and electricals.',
      },
      {
        id: 'noida',
        name: 'Noida',
        state: 'Uttar Pradesh',
        center: [28.6256, 77.3639],
        zoom: 14,
        description: 'Industrial and residential hub covering Sector 62 and electronic city hardware hubs.',
      },
      {
        id: 'cyber-hub',
        name: 'Cyber Hub',
        state: 'Haryana',
        center: [28.4950, 77.0888],
        zoom: 15,
        description: 'Corporate and modern tech residential corridor with smart switches and electrical gear.',
      },
      {
        id: 'bandra',
        name: 'Bandra',
        state: 'Maharashtra',
        center: [19.0596, 72.8335],
        zoom: 14,
        description: 'Western Mumbai suburban retail center with luxury hardware, smart locks, and provisions.',
      },
      {
        id: 'indiranagar',
        name: 'Indiranagar',
        state: 'Karnataka',
        center: [12.9784, 77.6412],
        zoom: 14,
        description: 'Eastern Bengaluru tech cluster with premium toolkits, power tools, and hardware essentials.',
      },
    ];

    // Calculate metrics for each area
    const enrichedAreas = areas.map(a => {
      const areaShops = shops.filter(s =>
        (s.address?.area || '').toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes((s.address?.area || '').toLowerCase())
      );
      const areaCustomers = users.filter(u =>
        u.role === 'customer' &&
        ((u.address?.area || '').toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes((u.address?.area || '').toLowerCase()))
      );
      const activeShops = areaShops.filter(s => s.isActive !== false);

      const areaSales = areaShops.reduce((sum, s) => sum + (s.totalSalesVolume || 0), 0);

      return {
        ...a,
        totalShopsCount: areaShops.length,
        activeShopsCount: activeShops.length,
        customersCount: areaCustomers.length,
        totalRevenue: areaSales,
        shops: areaShops.map(s => ({
          id: s.id || s._id,
          shopName: s.shopName,
          category: s.category,
          isActive: s.isActive !== false,
          verificationStatus: s.verificationStatus,
          coordinates: s.location?.coordinates || [a.center[1], a.center[0]], // [lng, lat]
          lat: (s.location?.coordinates && s.location.coordinates[1]) || a.center[0],
          lng: (s.location?.coordinates && s.location.coordinates[0]) || a.center[1],
          contactPhone: s.contactPhone,
          rating: s.rating,
          address: s.address,
        })),
      };
    });

    res.json({
      success: true,
      states,
      areas: enrichedAreas,
      totalActiveShops: shops.filter(s => s.isActive !== false).length,
      allShops: shops.map(s => ({
        id: s.id || s._id,
        shopName: s.shopName,
        category: s.category,
        isActive: s.isActive !== false,
        verificationStatus: s.verificationStatus,
        coordinates: s.location?.coordinates || [77.1906, 28.6517],
        lat: s.location?.coordinates ? s.location.coordinates[1] : 28.6517,
        lng: s.location?.coordinates ? s.location.coordinates[0] : 77.1906,
        rating: s.rating,
        contactPhone: s.contactPhone,
        address: s.address,
        totalSalesVolume: s.totalSalesVolume || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Category in-memory state
let FALLBACK_CATEGORIES = [
  { id: '1', _id: '1', name: 'Hardware & Tools', slug: 'hardware-tools', icon: 'Hammer', description: 'Power tools, hand tools, fasteners, safety gear', popularKeywords: ['bosch', 'drill', 'tools', 'hammer'] },
  { id: '2', _id: '2', name: 'Plumbing & Sanitary', slug: 'plumbing-sanitary', icon: 'Droplets', description: 'PVC pipes, bathroom fittings, water tanks, valves', popularKeywords: ['astral', 'finolex', 'cpvc', 'pipe'] },
  { id: '3', _id: '3', name: 'Electrical & Lighting', slug: 'electrical-lighting', icon: 'Zap', description: 'Cables, modular switches, LED bulbs, circuit breakers', popularKeywords: ['havells', 'wire', 'switch', 'mcb'] },
  { id: '4', _id: '4', name: 'Groceries & Daily Essentials', slug: 'groceries-daily-essentials', icon: 'ShoppingBag', description: 'Grains, dairy, personal care, packaged goods', popularKeywords: ['atta', 'milk', 'amul', 'oil'] },
  { id: '5', _id: '5', name: 'Stationery & Office', slug: 'stationery-office', icon: 'BookOpen', description: 'Notebooks, pens, printing paper, calculators', popularKeywords: ['paper', 'pen', 'notebook'] },
];

// @desc    Get categories
// @route   GET /api/admin/categories
// @access  Public
export const getAdminCategories = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (!error && categories && categories.length > 0) {
        return res.json({
          success: true,
          categories,
        });
      }
    }

    res.json({
      success: true,
      categories: FALLBACK_CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private (Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, icon = 'Tag', description, popularKeywords } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (supabase) {
      const { data: category, error } = await supabase
        .from('categories')
        .insert([{ name, slug, icon, description, popular_keywords: popularKeywords || [] }])
        .select()
        .single();

      if (!error && category) {
        return res.status(201).json({
          success: true,
          category,
        });
      }
    }

    const newCat = {
      id: 'cat_' + Date.now(),
      _id: 'cat_' + Date.now(),
      name: name.trim(),
      slug,
      icon,
      description: description || 'Trade category',
      popularKeywords: Array.isArray(popularKeywords) ? popularKeywords : [],
    };
    FALLBACK_CATEGORIES.unshift(newCat);

    res.status(201).json({
      success: true,
      category: newCat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      await supabase.from('categories').delete().eq('id', id);
    }
    const idx = FALLBACK_CATEGORIES.findIndex(c => c.id === id || c._id === id || c.slug === id);
    if (idx !== -1) {
      FALLBACK_CATEGORIES.splice(idx, 1);
    }
    res.json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create new user / merchant
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password = 'password123', role = 'customer', phone, address, shopName } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (supabase) {
      try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password || 'password123', salt);
        const { data: user, error } = await supabase
          .from('users')
          .insert([{
            name: name.trim(),
            email: normalizedEmail,
            password_hash,
            role,
            phone: phone || null,
            address: address || {},
            status: 'active',
          }])
          .select()
          .single();

        if (!error && user) {
          if (role === 'shopkeeper') {
            const { data: shop } = await supabase
              .from('shops')
              .insert([{
                owner_id: user.id,
                shop_name: shopName || `${name.trim()}'s Local Store`,
                tagline: 'Authorized Neighborhood Merchant',
                description: `Verified store profile managed by ${user.name}.`,
                category: 'Hardware & Tools',
                address: user.address || {},
                location_lat: 28.6517,
                location_lng: 77.1906,
                contact_phone: user.phone,
                rating: 5.0,
                is_active: true,
                verification_status: 'verified',
              }])
              .select()
              .single();
            user.shop = shop;
          }
          return res.status(201).json({ success: true, message: 'User created successfully in database', user });
        }
      } catch (dbErr) {
        console.warn('[Admin Create User DB] Falling back to memory:', dbErr.message);
      }
    }

    const newId = 'a0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14);
    const newUser = {
      _id: newId,
      id: newId,
      name: name.trim(),
      email: normalizedEmail,
      role,
      phone: phone || '+91 9811000000',
      address: address || { street: 'Main Hub', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' },
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
      shopName: shopName || (role === 'shopkeeper' ? `${name.trim()}'s Mart` : null),
    };

    DEFAULT_ADMIN_USERS.unshift(newUser);

    if (role === 'shopkeeper') {
      const shopId = 'b0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14);
      const newShop = {
        _id: shopId,
        id: shopId,
        owner_id: newId,
        ownerName: newUser.name,
        shopName: shopName || `${name.trim()}'s Local Store`,
        tagline: 'Authorized Neighborhood Merchant',
        description: `Verified store profile managed by ${newUser.name}.`,
        category: 'Hardware & Tools',
        address: newUser.address,
        location: { coordinates: [77.1906, 28.6517] },
        contactPhone: newUser.phone,
        bannerImage: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
        rating: 5.0,
        numReviews: 0,
        isActive: true,
        verificationStatus: 'verified',
        totalProductsCount: 0,
        totalSalesVolume: 0,
        createdAt: new Date().toISOString(),
      };
      FALLBACK_SHOPS.unshift(newShop);
      newUser.shopId = shopId;
      newUser.shop = {
        id: shopId,
        shopName: newShop.shopName,
        area: newShop.address?.area,
        city: newShop.address?.city,
      };
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      await supabase.from('users').delete().eq('id', id);
    }
    const idx = DEFAULT_ADMIN_USERS.findIndex(u => u.id === id || u._id === id);
    if (idx !== -1) {
      DEFAULT_ADMIN_USERS.splice(idx, 1);
    }
    res.json({
      success: true,
      message: 'User account removed from platform',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin onboard/create store
// @route   POST /api/admin/shops
// @access  Private (Admin)
export const createAdminShop = async (req, res, next) => {
  try {
    const { shopName, category, ownerName, contactPhone, address, coordinates, bannerImage } = req.body;
    if (!shopName || !category) {
      return res.status(400).json({ success: false, message: 'Store name and category are required' });
    }

    if (supabase) {
      try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('password123', salt);
        const ownerEmail = `${shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}@quickkart.com`;

        const { data: user } = await supabase
          .from('users')
          .insert([{
            name: ownerName || 'Store Merchant',
            email: ownerEmail,
            password_hash,
            role: 'shopkeeper',
            phone: contactPhone || null,
            address: address || {},
            status: 'active',
          }])
          .select()
          .single();

        if (user) {
          const coords = coordinates && coordinates.length === 2 ? coordinates : [77.1906, 28.6517];
          const { data: shop, error: shopErr } = await supabase
            .from('shops')
            .insert([{
              owner_id: user.id,
              shop_name: shopName.trim(),
              tagline: 'Authorized Partner Store',
              description: 'Hyperlocal store verified and activated by platform administration.',
              category,
              address: address || {},
              location_lng: coords[0],
              location_lat: coords[1],
              contact_phone: contactPhone || null,
              banner_image: bannerImage || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
              rating: 5.0,
              is_active: true,
              verification_status: 'verified',
            }])
            .select()
            .single();

          if (!shopErr && shop) {
            return res.status(201).json({
              success: true,
              message: 'Store registered and activated in database',
              shop: {
                ...shop,
                _id: shop.id,
                shopName: shop.shop_name,
                ownerName: user.name,
                contactPhone: shop.contact_phone,
                bannerImage: shop.banner_image,
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn('[Admin Create Shop DB] Falling back to memory:', dbErr.message);
      }
    }

    const shopId = 'b0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14);
    const ownerId = 'a0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14);
    const coords = coordinates && coordinates.length === 2 ? coordinates : [77.1906, 28.6517];

    const newShop = {
      _id: shopId,
      id: shopId,
      owner_id: ownerId,
      ownerName: ownerName || 'Store Merchant',
      shopName: shopName.trim(),
      tagline: 'Authorized Partner Store',
      description: `Hyperlocal store verified and activated by platform administration.`,
      category,
      address: address || { street: 'Main Commercial Hub', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' },
      location: { coordinates: coords },
      contactPhone: contactPhone || '+91 9876543210',
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      numReviews: 0,
      isActive: true,
      verificationStatus: 'verified',
      totalProductsCount: 0,
      totalSalesVolume: 0,
      createdAt: new Date().toISOString(),
    };

    FALLBACK_SHOPS.unshift(newShop);

    DEFAULT_ADMIN_USERS.unshift({
      _id: ownerId,
      id: ownerId,
      name: newShop.ownerName,
      email: `${newShop.shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}@quickkart.com`,
      role: 'shopkeeper',
      phone: newShop.contactPhone,
      address: newShop.address,
      status: 'active',
      shopId: shopId,
      shopName: newShop.shopName,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Store registered and activated successfully',
      shop: newShop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete store
// @route   DELETE /api/admin/shops/:id
// @access  Private (Admin)
export const deleteAdminShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      await supabase.from('shops').delete().eq('id', id);
    }
    const idx = FALLBACK_SHOPS.findIndex(s => s.id === id || s._id === id);
    if (idx !== -1) {
      FALLBACK_SHOPS.splice(idx, 1);
    }
    res.json({
      success: true,
      message: 'Store deregistered from platform',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create product
// @route   POST /api/admin/products
// @access  Private (Admin)
export const createAdminProduct = async (req, res, next) => {
  try {
    const { name, brand, description, category, price, mrp, unit = 'piece', quantityInStock = 10, shopId, images } = req.body;
    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    if (supabase) {
      try {
        const { data: product, error } = await supabase
          .from('products')
          .insert([{
            shop_id: shopId,
            name: name.trim(),
            brand: brand || null,
            description: description || null,
            category,
            price: parseFloat(price),
            mrp: mrp ? parseFloat(mrp) : parseFloat(price) * 1.15,
            unit: unit || 'piece',
            quantity_in_stock: parseInt(quantityInStock) || 10,
            is_available: true,
            images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'],
          }])
          .select('*, shops(id, shop_name, rating, address)')
          .single();

        if (!error && product) {
          return res.status(201).json({
            success: true,
            message: 'Product registered successfully in database',
            product: {
              ...product,
              _id: product.id,
              quantityInStock: product.quantity_in_stock,
              isAvailable: product.is_available,
              shopId: product.shops ? { _id: product.shops.id, id: product.shops.id, shopName: product.shops.shop_name } : product.shop_id,
            },
          });
        }
      } catch (dbErr) {
        console.warn('[Admin Create Product DB] Falling back to memory:', dbErr.message);
      }
    }

    const targetShop = FALLBACK_SHOPS.find(s => s.id === shopId || s._id === shopId) || FALLBACK_SHOPS[0];
    const newId = 'b0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14);
    const qty = parseInt(quantityInStock) || 10;
    const parsedPrice = parseFloat(price);
    const parsedMrp = mrp ? parseFloat(mrp) : parsedPrice * 1.15;

    const newProd = {
      _id: newId,
      id: newId,
      name: name.trim(),
      brand: brand || 'Generic Brand',
      description: description || '',
      category,
      price: parsedPrice,
      mrp: parsedMrp,
      unit,
      quantityInStock: qty,
      stockStatus: qty > 3 ? 'in_stock' : qty > 0 ? 'low_stock' : 'out_of_stock',
      isAvailable: true,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'],
      tags: [],
      shopId: {
        _id: targetShop.id,
        id: targetShop.id,
        shopName: targetShop.shopName,
        rating: targetShop.rating || 4.8,
        address: targetShop.address,
      },
    };

    FALLBACK_PRODUCTS.unshift(newProd);

    res.status(201).json({
      success: true,
      message: 'Product registered successfully across catalog',
      product: newProd,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
export const updateAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      try {
        const updatePayload = { updated_at: new Date().toISOString() };
        if (req.body.name !== undefined) updatePayload.name = req.body.name.trim();
        if (req.body.brand !== undefined) updatePayload.brand = req.body.brand;
        if (req.body.category !== undefined) updatePayload.category = req.body.category;
        if (req.body.price !== undefined) updatePayload.price = parseFloat(req.body.price);
        if (req.body.mrp !== undefined) updatePayload.mrp = parseFloat(req.body.mrp);
        if (req.body.quantityInStock !== undefined) updatePayload.quantity_in_stock = parseInt(req.body.quantityInStock);
        if (req.body.isAvailable !== undefined) updatePayload.is_available = !!req.body.isAvailable;
        if (req.body.unit !== undefined) updatePayload.unit = req.body.unit;

        const { data: updated, error } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', id)
          .select('*, shops(id, shop_name)')
          .single();

        if (!error && updated) {
          return res.json({
            success: true,
            message: 'Product updated successfully in database',
            product: {
              ...updated,
              _id: updated.id,
              quantityInStock: updated.quantity_in_stock,
              isAvailable: updated.is_available,
              shopId: updated.shops ? { _id: updated.shops.id, id: updated.shops.id, shopName: updated.shops.shop_name } : updated.shop_id,
            },
          });
        }
      } catch (dbErr) {
        console.warn('[Admin Update Product DB] Falling back to memory:', dbErr.message);
      }
    }
    const item = FALLBACK_PRODUCTS.find(p => p.id === id || p._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found in catalog' });
    }

    if (req.body.name !== undefined) item.name = req.body.name.trim();
    if (req.body.brand !== undefined) item.brand = req.body.brand;
    if (req.body.category !== undefined) item.category = req.body.category;
    if (req.body.price !== undefined) item.price = parseFloat(req.body.price);
    if (req.body.mrp !== undefined) item.mrp = parseFloat(req.body.mrp);
    if (req.body.quantityInStock !== undefined) item.quantityInStock = parseInt(req.body.quantityInStock);
    if (req.body.isAvailable !== undefined) item.isAvailable = !!req.body.isAvailable;
    if (req.body.unit !== undefined) item.unit = req.body.unit;

    if (item.quantityInStock > 3) {
      item.stockStatus = 'in_stock';
      item.isAvailable = true;
    } else if (item.quantityInStock > 0) {
      item.stockStatus = 'low_stock';
      item.isAvailable = true;
    } else {
      item.stockStatus = 'out_of_stock';
      item.isAvailable = false;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
export const deleteAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    const idx = FALLBACK_PRODUCTS.findIndex(p => p.id === id || p._id === id);
    if (idx !== -1) {
      FALLBACK_PRODUCTS.splice(idx, 1);
    }
    res.json({
      success: true,
      message: 'Product removed from catalog',
    });
  } catch (error) {
    next(error);
  }
};

// Aliases for backwards compatibility
export const getAdminStats = getStats;
export const getAllShopsAdmin = getAllShops;
export const verifyShopAdmin = verifyShop;
export const getAllUsersAdmin = getAllUsers;
export const toggleUserStatusAdmin = toggleUserStatus;
export const getCategories = getAdminCategories;

