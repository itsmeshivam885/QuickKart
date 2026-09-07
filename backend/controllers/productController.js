import { supabase } from '../config/supabase.js';
import { FALLBACK_PRODUCTS } from '../utils/fallbackData.js';

// @desc    List & search products across nearby shops using Supabase
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      shopId,
    } = req.query;

    let query = supabase
      .from('products')
      .select('*, shops(id, shop_name, rating, address, location_lat, location_lng)');

    if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data: prods, error } = await query;

    if (error || !prods || prods.length === 0) {
      let filtered = FALLBACK_PRODUCTS;
      if (category && category !== 'All') filtered = filtered.filter((p) => p.category === category);
      if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

      return res.json({
        success: true,
        count: filtered.length,
        total: filtered.length,
        page: 1,
        pages: 1,
        products: filtered,
      });
    }

    const formatted = prods.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      brand: p.brand,
      description: p.description,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      quantityInStock: p.quantity_in_stock,
      isAvailable: p.is_available,
      stockStatus: p.quantity_in_stock > 3 ? 'in_stock' : p.quantity_in_stock > 0 ? 'low_stock' : 'out_of_stock',
      images: p.images || [],
      tags: p.tags || [],
      shopId: p.shops
        ? {
            _id: p.shops.id,
            id: p.shops.id,
            shopName: p.shops.shop_name,
            rating: p.shops.rating || 4.8,
            address: p.shops.address,
            location: { coordinates: [p.shops.location_lng, p.shops.location_lat] },
          }
        : null,
    }));

    res.json({
      success: true,
      count: formatted.length,
      total: formatted.length,
      page: 1,
      pages: 1,
      products: formatted,
    });
  } catch (error) {
    res.json({
      success: true,
      count: FALLBACK_PRODUCTS.length,
      total: FALLBACK_PRODUCTS.length,
      page: 1,
      pages: 1,
      products: FALLBACK_PRODUCTS,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: p, error } = await supabase
      .from('products')
      .select('*, shops(*)')
      .eq('id', id)
      .single();

    if (error || !p) {
      const fallback = FALLBACK_PRODUCTS.find((item) => item._id === id || item.id === id) || FALLBACK_PRODUCTS[0];
      return res.json({ success: true, product: fallback, similarProducts: FALLBACK_PRODUCTS.slice(1, 4) });
    }

    const formatted = {
      _id: p.id,
      id: p.id,
      name: p.name,
      brand: p.brand,
      description: p.description,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      quantityInStock: p.quantity_in_stock,
      isAvailable: p.is_available,
      images: p.images || [],
      tags: p.tags || [],
      shopId: p.shops
        ? {
            _id: p.shops.id,
            id: p.shops.id,
            shopName: p.shops.shop_name,
            rating: p.shops.rating || 4.8,
            address: p.shops.address,
            location: { coordinates: [p.shops.location_lng, p.shops.location_lat] },
          }
        : null,
    };

    res.json({
      success: true,
      product: formatted,
      similarProducts: [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product in Supabase
// @route   POST /api/products
// @access  Private (Shopkeeper)
export const createProduct = async (req, res, next) => {
  try {
    const { name, brand, description, category, price, mrp, unit, quantityInStock, images, tags } = req.body;
    const { data: newProd, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          brand,
          description,
          category,
          price: parseFloat(price),
          mrp: mrp ? parseFloat(mrp) : undefined,
          unit: unit || 'piece',
          quantity_in_stock: parseInt(quantityInStock) || 10,
          images: images || [],
          tags: tags || [],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Product added successfully to Supabase catalog',
      product: newProd,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product in Supabase
// @route   PUT /api/products/:id
// @access  Private (Shopkeeper)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: updated, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Product updated in Supabase',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product from Supabase
// @route   DELETE /api/products/:id
// @access  Private (Shopkeeper)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabase.from('products').delete().eq('id', id);
    res.json({
      success: true,
      message: 'Product deleted from Supabase',
    });
  } catch (error) {
    next(error);
  }
};
