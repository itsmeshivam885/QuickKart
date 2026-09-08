import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { FALLBACK_SHOPS } from '../utils/fallbackData.js';

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

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Whitelist role to prevent unauthorized admin escalation
    const allowedRoles = ['customer', 'shopkeeper'];
    const safeRole = allowedRoles.includes(role) ? role : 'customer';
    const normalizedEmail = email.toLowerCase().trim();

    if (supabase) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            name: name.trim(),
            email: normalizedEmail,
            password_hash: passwordHash,
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

    // Fallback mode without database
    const fallbackId = 'a0000000-0000-0000-0000-000000000099';
    const token = generateToken(fallbackId, safeRole);
    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: fallbackId,
        id: fallbackId,
        name: name.trim(),
        email: normalizedEmail,
        role: safeRole,
        phone,
        address: address || {},
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

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
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

      const token = generateToken(user.id, user.role);

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

    // Fallback mode without database
    const isShopkeeper = normalizedEmail.includes('sharma') || normalizedEmail.includes('gupta');
    const isAdmin = normalizedEmail.includes('admin');
    const fallbackRole = isAdmin ? 'admin' : isShopkeeper ? 'shopkeeper' : 'customer';
    const fallbackId = isAdmin
      ? 'a0000000-0000-0000-0000-000000000004'
      : isShopkeeper
      ? 'a0000000-0000-0000-0000-000000000002'
      : 'a0000000-0000-0000-0000-000000000001';

    const token = generateToken(fallbackId, fallbackRole);
    return res.json({
      success: true,
      token,
      user: {
        _id: fallbackId,
        id: fallbackId,
        name: isShopkeeper ? 'Ramesh Sharma' : isAdmin ? 'QuickKart Admin' : 'Rahul Sharma',
        email: normalizedEmail,
        role: fallbackRole,
      },
      shop: isShopkeeper ? FALLBACK_SHOPS[0] : null,
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
