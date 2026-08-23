import Shop from '../models/Shop.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Request from '../models/Request.js';
import Reservation from '../models/Reservation.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';

// @desc    Get aggregate platform metrics & activity
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalShopkeepers = await User.countDocuments({ role: 'shopkeeper' });
    
    const totalShops = await Shop.countDocuments();
    const verifiedShops = await Shop.countDocuments({ verificationStatus: 'verified' });
    const pendingShops = await Shop.countDocuments({ verificationStatus: 'pending' });

    const totalProducts = await Product.countDocuments();
    const totalRequests = await Request.countDocuments();
    const activeRequests = await Request.countDocuments({ status: 'active' });
    const totalReservations = await Reservation.countDocuments();
    const completedReservations = await Reservation.countDocuments({ status: 'COMPLETED' });

    // Recent activity
    const recentRequests = await Request.find().sort({ createdAt: -1 }).limit(5).populate('customerId', 'name');
    const recentReservations = await Reservation.find().sort({ createdAt: -1 }).limit(5).populate('shopId', 'shopName');

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, customers: totalCustomers, shopkeepers: totalShopkeepers },
        shops: { total: totalShops, verified: verifiedShops, pending: pendingShops },
        products: { total: totalProducts },
        requests: { total: totalRequests, active: activeRequests },
        reservations: { total: totalReservations, completed: completedReservations },
      },
      recentRequests,
      recentReservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shops for admin management
// @route   GET /api/admin/shops
// @access  Private (Admin)
export const getAllShops = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'ALL') {
      query.verificationStatus = status;
    }

    const shops = await Shop.find(query)
      .populate('ownerId', 'name email phone status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or reject a shop
// @route   PUT /api/admin/shops/:id/verify
// @access  Private (Admin)
export const verifyShop = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const shop = await Shop.findById(req.params.id).populate('ownerId');

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    shop.verificationStatus = status; // 'verified' or 'rejected'
    if (notes) shop.verificationNotes = notes;
    await shop.save();

    // Notify shopkeeper
    await Notification.create({
      userId: shop.ownerId._id,
      title: `Shop Verification: ${status.toUpperCase()}`,
      message: `Your shop "${shop.shopName}" has been ${status}. ${notes ? `Note: ${notes}` : ''}`,
      type: 'system',
      link: '/shop/dashboard',
    });

    res.json({
      success: true,
      message: `Shop has been ${status}`,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== 'ALL') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/suspended status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories & create new category
// @route   GET & POST /api/admin/categories
// @access  Private (Admin)
export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, popularKeywords } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name,
      slug,
      icon: icon || 'Tag',
      description: description || '',
      popularKeywords: popularKeywords || [],
    });

    res.status(201).json({
      success: true,
      message: 'Category created',
      category,
    });
  } catch (error) {
    next(error);
  }
};
