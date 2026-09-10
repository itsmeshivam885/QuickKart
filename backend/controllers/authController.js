import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { FALLBACK_SHOPS, FALLBACK_USERS } from '../utils/fallbackData.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'quickkart_jwt_secret_key_2026_super_secure';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: '30d',
  });
};

// @desc    Register a new user in Supabase
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer', phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const safeRole = ['customer', 'shopkeeper', 'admin'].includes(role) ? role : 'customer';

    if (supabase) {
      // 1. Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      // 2. Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Create user in Supabase
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: safeRole,
            phone: phone || null,
            address: address || {},
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const token = generateToken(user.id, user.role);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
        },
      });
    }

    // Fallback mode with in-memory sync
    const existing = FALLBACK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const fallbackId = 'a0000000-0000-0000-0000-' + Math.random().toString(36).substring(2, 14);
    const newUser = {
      _id: fallbackId,
      id: fallbackId,
      name: name.trim(),
      email: normalizedEmail,
      role: safeRole,
      phone: phone || '+91 9811000000',
      address: address || { street: 'Main Market', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005' },
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };
    FALLBACK_USERS.unshift(newUser);

    const token = generateToken(fallbackId, safeRole);
    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: fallbackId,
        id: fallbackId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user in Supabase
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (error || !user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Account has been suspended by administration' });
      }

      // Verify bcrypt password (supports both password and password_hash column names)
      const storedHash = user.password || user.password_hash || '';
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user.id, user.role);

      // Fetch store profile if shopkeeper
      let shop = null;
      if (user.role === 'shopkeeper') {
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single();
        shop = shopData;
      }

      return res.json({
        success: true,
        token,
        user: {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
        },
        shop: shop || (user.role === 'shopkeeper' ? FALLBACK_SHOPS[0] : null),
      });
    }

    // Fallback mode with in-memory sync
    const foundUser = FALLBACK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
    if (foundUser && foundUser.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account has been suspended by administration' });
    }

    const isShopkeeper = foundUser ? foundUser.role === 'shopkeeper' : (normalizedEmail.includes('sharma') || normalizedEmail.includes('gupta') || normalizedEmail.includes('mart') || normalizedEmail.includes('hardware'));
    const isAdmin = foundUser ? foundUser.role === 'admin' : normalizedEmail.includes('admin');
    const fallbackRole = isAdmin ? 'admin' : isShopkeeper ? 'shopkeeper' : 'customer';

    const fallbackId = foundUser ? (foundUser.id || foundUser._id) : (
      isAdmin
        ? 'a0000000-0000-0000-0000-000000000004'
        : isShopkeeper
        ? 'a0000000-0000-0000-0000-000000000002'
        : 'a0000000-0000-0000-0000-000000000001'
    );

    const userName = foundUser ? foundUser.name : (isShopkeeper ? 'Ramesh Sharma' : isAdmin ? 'QuickKart Admin' : 'Rahul Sharma');
    const matchingShop = isShopkeeper ? (FALLBACK_SHOPS.find(s => s.owner_id === fallbackId) || FALLBACK_SHOPS[0]) : null;

    const token = generateToken(fallbackId, fallbackRole);
    return res.json({
      success: true,
      token,
      user: {
        _id: fallbackId,
        id: fallbackId,
        name: userName,
        email: normalizedEmail,
        role: fallbackRole,
        status: (foundUser && foundUser.status) || 'active',
        phone: (foundUser && foundUser.phone) || '+91 9876543210',
        address: (foundUser && foundUser.address) || {},
      },
      shop: matchingShop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, phone, address, status')
        .eq('id', req.user.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      let shop = null;
      if (user.role === 'shopkeeper') {
        const { data: userShop } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single();
        if (userShop) shop = userShop;
      }

      return res.json({
        success: true,
        user: {
          _id: user.id,
          id: user.id,
          ...user,
        },
        shop: shop || (user.role === 'shopkeeper' ? FALLBACK_SHOPS[0] : null),
      });
    }

    const isShopkeeper = req.user.role === 'shopkeeper';

    return res.json({
      success: true,
      user: {
        _id: req.user.id,
        id: req.user.id,
        name: req.user.name || 'QuickKart User',
        email: req.user.email || 'user@quickkart.com',
        role: req.user.role || 'customer',
        phone: req.user.phone,
        address: req.user.address,
      },
      shop: isShopkeeper ? FALLBACK_SHOPS[0] : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, profileImage, profile_image } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profileImage !== undefined || profile_image !== undefined) {
      updateData.profile_image = profileImage || profile_image;
    }
    updateData.updated_at = new Date().toISOString();

    if (supabase) {
      const { data: updated, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', req.user.id)
        .select('id, name, email, role, phone, address, profile_image, status')
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: updated.id,
          id: updated.id,
          ...updated,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: req.user.id,
        id: req.user.id,
        name: name || req.user.name,
        phone: phone !== undefined ? phone : req.user.phone,
        address: address !== undefined ? address : req.user.address,
        role: req.user.role,
        email: req.user.email,
        profileImage: profileImage || profile_image || req.user.profile_image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Aliases for backwards compatibility
export const registerUser = register;
export const loginUser = login;
