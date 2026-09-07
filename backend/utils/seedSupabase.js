import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export const seedSupabaseData = async () => {
  try {
    console.log('[Supabase Seed] Checking existing data...');
    const { data: existingShops } = await supabase.from('shops').select('id').limit(1);

    if (existingShops && existingShops.length > 0) {
      console.log('[Supabase Seed] Data already present in Supabase tables.');
      return;
    }

    console.log('[Supabase Seed] Inserting initial users, categories, shops & products...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Insert Users
    const { data: users, error: userErr } = await supabase.from('users').upsert([
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        name: 'Rahul Sharma',
        email: 'customer@quickkart.com',
        password_hash: passwordHash,
        role: 'customer',
        phone: '+91 9811223344',
        address: { street: 'Flat 402, Karol Bagh', city: 'New Delhi', pincode: '110005' },
        status: 'active',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        name: 'Ramesh Sharma',
        email: 'sharma@quickkart.com',
        password_hash: passwordHash,
        role: 'shopkeeper',
        phone: '+91 9876543210',
        address: { street: 'Shop 14, Main Market, Karol Bagh', city: 'New Delhi', pincode: '110005' },
        status: 'active',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        name: 'Manoj Gupta',
        email: 'gupta@quickkart.com',
        password_hash: passwordHash,
        role: 'shopkeeper',
        phone: '+91 9876543211',
        address: { street: 'Shop 8, Connaught Place Outer Circle', city: 'New Delhi', pincode: '110001' },
        status: 'active',
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        name: 'QuickKart Admin',
        email: 'admin@quickkart.com',
        password_hash: passwordHash,
        role: 'admin',
        phone: '+91 9999988888',
        address: { street: 'Tech HQ, Barakhamba Road', city: 'New Delhi', pincode: '110001' },
        status: 'active',
      },
    ]).select();

    if (userErr) console.warn('User seed warning:', userErr.message);

    // 2. Insert Categories
    await supabase.from('categories').upsert([
      { name: 'Hardware & Tools', slug: 'hardware-tools', icon: 'Hammer', description: 'Fasteners, power drills, screwdrivers, locks, hinges', popular_keywords: ['drill', 'screw', 'hammer', 'tape', 'lock', 'tools'] },
      { name: 'Plumbing & Sanitary', slug: 'plumbing-sanitary', icon: 'Droplets', description: 'PVC pipes, valves, CPVC fittings, taps, epoxy sealants', popular_keywords: ['pipe', 'pvc', 'cpvc', 'valve', 'tap', 'leak', 'sealant'] },
      { name: 'Electrical & Lighting', slug: 'electrical-lighting', icon: 'Zap', description: 'LED bulbs, copper cables, modular switches, MCBs', popular_keywords: ['bulb', 'wire', 'switch', 'led', 'cable', 'mcb', 'extension'] },
      { name: 'Stationery & Office', slug: 'stationery-office', icon: 'BookOpen', description: 'Paper, notebooks, drafting pens, technical calculators', popular_keywords: ['notebook', 'paper', 'calculator', 'pen', 'print', 'stationery'] },
    ]);

    // 3. Insert Verified Shops
    const { error: shopErr } = await supabase.from('shops').upsert([
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        owner_id: 'a0000000-0000-0000-0000-000000000002',
        shop_name: 'Sharma Hardware & Sanitation Store',
        tagline: 'Authorized Finolex, Astral & Jaquar Dealer',
        description: 'Trusted neighborhood hardware and sanitation supplier serving Karol Bagh for 22+ years.',
        category: 'Hardware & Tools',
        address: { street: 'Shop 14, Block 8, Ajmal Khan Road', area: 'Karol Bagh', city: 'New Delhi', pincode: '110005' },
        location_lat: 28.6517,
        location_lng: 77.1906,
        contact_phone: '+91 9876543210',
        banner_image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        num_reviews: 142,
        is_active: true,
        verification_status: 'verified',
        live_serving_count: 2,
        est_wait_time_minutes: 4,
        prompt_response_rate: 98,
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        owner_id: 'a0000000-0000-0000-0000-000000000003',
        shop_name: 'Gupta Building Materials & Hardware',
        tagline: 'Complete Cement, Pipes & Sanitary Solutions',
        description: 'Wholesale and retail supplier of top plumbing, CPVC fittings, and building materials.',
        category: 'Hardware & Tools',
        address: { street: 'Plot 22, Connaught Circus', area: 'Connaught Place', city: 'New Delhi', pincode: '110001' },
        location_lat: 28.6304,
        location_lng: 77.2177,
        contact_phone: '+91 9876543211',
        banner_image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        num_reviews: 98,
        is_active: true,
        verification_status: 'verified',
        live_serving_count: 4,
        est_wait_time_minutes: 8,
        prompt_response_rate: 92,
      },
    ]);

    if (shopErr) console.warn('Shop seed warning:', shopErr.message);

    // 4. Insert Products
    const { error: prodErr } = await supabase.from('products').upsert([
      {
        shop_id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)',
        brand: 'Finolex',
        description: 'High pressure heavy-duty PVC pipe for residential plumbing lines and drainage.',
        category: 'Plumbing & Sanitary',
        price: 290,
        mrp: 350,
        unit: 'piece',
        quantity_in_stock: 45,
        is_available: true,
        images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'],
        tags: ['pipe', 'pvc', 'plumbing', 'finolex', 'sanitary'],
      },
      {
        shop_id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Astral CPVC Pro Pipe 1 inch (3 Meter)',
        brand: 'Astral',
        description: 'Lead-free hot and cold potable water plumbing pipe certified to ASTM standards.',
        category: 'Plumbing & Sanitary',
        price: 390,
        mrp: 460,
        unit: 'piece',
        quantity_in_stock: 30,
        is_available: true,
        images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'],
        tags: ['pipe', 'cpvc', 'astral', 'hot water'],
      },
      {
        shop_id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Bosch Professional 500W Impact Drill Kit',
        brand: 'Bosch',
        description: 'Heavy duty multi-speed reversible impact drill machine with 10 drill bits and case.',
        category: 'Hardware & Tools',
        price: 2850,
        mrp: 3499,
        unit: 'kit',
        quantity_in_stock: 8,
        is_available: true,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'],
        tags: ['drill', 'bosch', 'tools', 'hardware', 'power tools'],
      },
      {
        shop_id: 'b0000000-0000-0000-0000-000000000002',
        name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)',
        brand: 'Finolex',
        description: 'Genuine Finolex heavy duty pipe with leak-proof jointing compatibility.',
        category: 'Plumbing & Sanitary',
        price: 295,
        mrp: 350,
        unit: 'piece',
        quantity_in_stock: 60,
        is_available: true,
        images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'],
        tags: ['pipe', 'pvc', 'finolex'],
      },
      {
        shop_id: 'b0000000-0000-0000-0000-000000000002',
        name: 'Jaquar Brass Angle Valve with Flange',
        brand: 'Jaquar',
        description: 'Quarter turn high-durability chrome plated brass angle stop cock valve.',
        category: 'Plumbing & Sanitary',
        price: 480,
        mrp: 575,
        unit: 'piece',
        quantity_in_stock: 25,
        is_available: true,
        images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
        tags: ['valve', 'jaquar', 'bathroom', 'sanitary', 'angle valve'],
      },
    ]);

    if (prodErr) console.warn('Product seed warning:', prodErr.message);

    console.log('[Supabase Seed] ✅ Initial QuickKart records successfully populated in Supabase!');
  } catch (err) {
    console.error('[Supabase Seed Error]', err.message);
  }
};
