import express from 'express';
import {
  getStats,
  getAllShops,
  verifyShop,
  toggleShopStatus,
  createAdminShop,
  deleteAdminShop,
  getAllUsers,
  toggleUserStatus,
  createAdminUser,
  deleteAdminUser,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getSalesReport,
  getTrafficAnalytics,
  getGeoMapData,
  getAdminCategories,
  createCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply admin guard across all /api/admin routes
router.use(protect, authorize('admin'));

// Platform KPIs & Overview
router.get('/stats', getStats);

// Store Management & Verification
router.get('/shops', getAllShops);
router.post('/shops', createAdminShop);
router.put('/shops/:id/verify', verifyShop);
router.put('/shops/:id/status', toggleShopStatus);
router.delete('/shops/:id', deleteAdminShop);

// User & Role Management (Customers & Shopkeepers)
router.get('/users', getAllUsers);
router.post('/users', createAdminUser);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteAdminUser);

// Registered Products Catalog Management
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// Sales & Traffic Reports (Overall, State-wise, Area-wise)
router.get('/reports/sales', getSalesReport);
router.get('/reports/traffic', getTrafficAnalytics);

// Interactive Geospatial & Map Distribution (support both hyphen and no-hyphen)
router.get('/geo-map', getGeoMapData);
router.get('/geomap', getGeoMapData);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;

