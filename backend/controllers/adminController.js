import { supabase } from '../config/supabase.js';

// @desc    Get Admin platform KPI metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    let usersCount = 4;
    let shopsCount = 2;
    let productsCount = 5;
    let requestsCount = 1;
    let reservationsCount = 1;

    if (supabase) {
      const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('shops').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: reqCount } = await supabase.from('requests').select('*', { count: 'exact', head: true });
      const { count: resCount } = await supabase.from('reservations').select('*', { count: 'exact', head: true });

      if (uCount !== null && uCount !== undefined) usersCount = uCount;
      if (sCount !== null && sCount !== undefined) shopsCount = sCount;
      if (pCount !== null && pCount !== undefined) productsCount = pCount;
      if (reqCount !== null && reqCount !== undefined) requestsCount = reqCount;
      if (resCount !== null && resCount !== undefined) reservationsCount = resCount;
    }

    res.json({
      success: true,
      stats: {
        users: { total: usersCount, customers: Math.max(1, usersCount - 2), shopkeepers: 2 },
        shops: { total: shopsCount, verified: shopsCount, pending: 0 },
        products: { total: productsCount },
        requests: { total: requestsCount, active: requestsCount },
        reservations: { total: reservationsCount, completed: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shops for moderation
// @route   GET /api/admin/shops
// @access  Private (Admin)
export const getAllShops = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: shops, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && shops) {
        return res.json({
          success: true,
          shops: shops.map((s) => ({
            _id: s.id,
            id: s.id,
            shopName: s.shop_name,
            category: s.category,
            address: s.address,
            contactPhone: s.contact_phone,
            verificationStatus: s.verification_status,
            bannerImage: s.banner_image,
          })),
        });
      }
    }

    res.json({
      success: true,
      shops: [
        {
          _id: 'b0000000-0000-0000-0000-000000000001',
          id: 'b0000000-0000-0000-0000-000000000001',
          shopName: 'Sharma Hardware & Sanitation Store',
          category: 'Hardware & Tools',
          address: { street: 'Shop 14, Karol Bagh', city: 'New Delhi' },
          contactPhone: '+91 9876543210',
          verificationStatus: 'verified',
        },
      ],
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
    const { status = 'verified' } = req.body;

    if (supabase) {
      const { data: updated, error } = await supabase
        .from('shops')
        .update({ verification_status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        message: `Shop marked as ${status}`,
        shop: updated,
      });
    }

    res.json({
      success: true,
      message: `Shop marked as ${status}`,
      shop: { id, verificationStatus: status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, role, phone, status, created_at')
        .order('created_at', { ascending: false });

      if (!error && users) {
        return res.json({
          success: true,
          users: users.map((u) => ({
            _id: u.id,
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            status: u.status || 'active',
          })),
        });
      }
    }

    res.json({
      success: true,
      users: [
        {
          _id: 'a0000000-0000-0000-0000-000000000001',
          id: 'a0000000-0000-0000-0000-000000000001',
          name: 'Rahul Sharma',
          email: 'customer@quickkart.com',
          role: 'customer',
          status: 'active',
        },
      ],
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

      if (error) throw error;

      return res.json({
        success: true,
        message: `User status changed to ${status}`,
        user,
      });
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
      categories: [
        { id: '1', name: 'Hardware & Tools', slug: 'hardware-tools', icon: 'Hammer' },
        { id: '2', name: 'Plumbing & Sanitary', slug: 'plumbing-sanitary', icon: 'Droplets' },
        { id: '3', name: 'Electrical & Lighting', slug: 'electrical-lighting', icon: 'Zap' },
        { id: '4', name: 'Stationery & Office', slug: 'stationery-office', icon: 'BookOpen' },
      ],
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

      if (error) throw error;

      return res.status(201).json({
        success: true,
        category,
      });
    }

    res.status(201).json({
      success: true,
      category: {
        id: 'cat_' + Date.now(),
        name,
        slug,
        icon,
        description,
      },
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
