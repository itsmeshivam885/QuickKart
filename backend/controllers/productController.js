import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import { calculateDistanceKm } from '../utils/geoCoder.js';

// @desc    List & search products across nearby shops
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
      lng,
      lat,
      radius = 10,
      shopId,
      page = 1,
      limit = 24,
    } = req.query;

    const query = { isAvailable: true };

    if (shopId) {
      query.shopId = shopId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (inStockOnly === 'true') {
      query.stockStatus = { $in: ['in_stock', 'low_stock'] };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const products = await Product.find(query)
      .populate('shopId', 'shopName rating location address contactPhone verificationStatus openingHours')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    const userLng = parseFloat(lng) || 77.2090;
    const userLat = parseFloat(lat) || 28.6139;

    const enrichedProducts = products.map((prod) => {
      const prodObj = prod.toObject();
      if (prodObj.shopId && prodObj.shopId.location) {
        prodObj.distanceKm = calculateDistanceKm(
          [userLng, userLat],
          prodObj.shopId.location.coordinates
        );
      } else {
        prodObj.distanceKm = 0;
      }
      return prodObj;
    });

    if (sort === 'distance') {
      enrichedProducts.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json({
      success: true,
      count: enrichedProducts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      products: enrichedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product detail
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { lng, lat } = req.query;
    const product = await Product.findById(req.params.id).populate('shopId');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prodObj = product.toObject();
    if (lng && lat && prodObj.shopId && prodObj.shopId.location) {
      prodObj.distanceKm = calculateDistanceKm(
        [parseFloat(lng), parseFloat(lat)],
        prodObj.shopId.location.coordinates
      );
    }

    // Similar products from same category or same shop
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .populate('shopId', 'shopName rating');

    res.json({
      success: true,
      product: prodObj,
      similarProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product in shop (Shopkeeper)
// @route   POST /api/products
// @access  Private (Shopkeeper)
export const createProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({ success: false, message: 'You need to register a shop first' });
    }

    const {
      name,
      brand,
      category,
      description,
      price,
      mrp,
      unit,
      quantityInStock,
      lowStockThreshold,
      images,
      tags,
    } = req.body;

    const product = await Product.create({
      shopId: shop._id,
      name,
      brand: brand || 'Generic',
      category: category || shop.category,
      description: description || '',
      price: parseFloat(price),
      mrp: mrp ? parseFloat(mrp) : parseFloat(price),
      unit: unit || 'piece',
      quantityInStock: parseInt(quantityInStock) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'],
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Shopkeeper)
// @route   PUT /api/products/:id
// @access  Private (Shopkeeper)
export const updateProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop not found' });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.shopId.toString() !== shop._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
    }

    const {
      name,
      brand,
      category,
      description,
      price,
      mrp,
      unit,
      quantityInStock,
      lowStockThreshold,
      images,
      tags,
      isAvailable,
    } = req.body;

    if (name) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (mrp !== undefined) product.mrp = parseFloat(mrp);
    if (unit) product.unit = unit;
    if (quantityInStock !== undefined) product.quantityInStock = parseInt(quantityInStock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = parseInt(lowStockThreshold);
    if (images) product.images = images;
    if (tags) product.tags = tags;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Shopkeeper)
// @route   DELETE /api/products/:id
// @access  Private (Shopkeeper)
export const deleteProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(400).json({ success: false, message: 'Shop not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.shopId.toString() !== shop._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product removed from catalog',
    });
  } catch (error) {
    next(error);
  }
};
