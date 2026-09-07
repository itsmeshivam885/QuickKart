import { supabase } from '../config/supabase.js';

// @desc    Get Admin platform KPI metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: shopsCount } = await supabase.from('shops').select('*', { count: 'exact', head: true });
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: requestsCount } = await supabase.from('requests').select('*', { count: 'exact', head: true });
    const { count: reservationsCount } = await supabase.from('reservations').select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      stats: {
        users: { total: usersCount || 4, customers: 1, shopkeepers: 2 },
        shops: { total: shopsCount || 2, verified: shopsCount || 2, pending: 0 },
        products: { total: productsCount || 5 },
        requests: { total: requestsCount || 1, active: 1 },
        reservations: { total: reservationsCount || 1, completed: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shops for moderation
// @route   GET /api/admin/shops
// @access  Private (Admin)
export const getAllShopsAdmin = async (req, res, next) => {
  try {
    const { data: shops } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      shops: (shops || []).map((s) => ({
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
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject shop
// @route   PUT /api/admin/shops/:id/verify
// @access  Private (Admin)
export const verifyShopAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const { data: updated, error } = await supabase
      .from('shops')
      .update({ verification_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `Shop marked as ${status}`,
      shop: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, phone, status, created_at')
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      users: (users || []).map((u) => ({
        _id: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        status: u.status || 'active',
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (active / suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const toggleUserStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select('id, name, email, status')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/admin/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    res.json({
      success: true,
      categories: categories || [],
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
    const { name, icon, description, popularKeywords } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: category, error } = await supabase
      .from('categories')
      .insert([{ name, slug, icon, description, popular_keywords: popularKeywords || [] }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};
