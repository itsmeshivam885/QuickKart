import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Request from '../models/Request.js';
import RequestResponse from '../models/RequestResponse.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Initializing seed data for QuickKart...');

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Hardware & Tools', slug: 'hardware', icon: 'Hammer', description: 'Tools, fasteners, building essentials & hardware fittings', popularKeywords: ['pipe', 'drill', 'screws', 'hammer', 'tape', 'nails'] },
      { name: 'Plumbing & Sanitary', slug: 'plumbing', icon: 'Wrench', description: 'Pipes, taps, fittings, water tanks, sealants & bathroom supplies', popularKeywords: ['pvc pipe', 'tap', 'valve', 'fitting', 'solvent', 'cpvc'] },
      { name: 'Electrical & Lighting', slug: 'electrical', icon: 'Zap', description: 'Wires, switches, LED lights, extension cords & circuit breakers', popularKeywords: ['wire', 'led bulb', 'switch', 'mcb', 'extension cord', 'plug'] },
      { name: 'Stationery & Office', slug: 'stationery', icon: 'BookOpen', description: 'Notebooks, pens, art supplies, printers, papers & office stationery', popularKeywords: ['notebook', 'pen', 'paper', 'marker', 'files', 'stapler'] },
      { name: 'Groceries & Daily Essentials', slug: 'groceries', icon: 'ShoppingBag', description: 'Grains, oils, spices, snacks, household cleaning & pantry items', popularKeywords: ['rice', 'oil', 'flour', 'sugar', 'spices', 'tea'] },
      { name: 'Electronics & Mobiles', slug: 'electronics', icon: 'Smartphone', description: 'Cables, chargers, earphones, accessories & repair parts', popularKeywords: ['charger', 'cable', 'headphones', 'battery', 'adapter'] },
    ]);

    // 2. Seed Users
    const admin = await User.create({
      name: 'QuickKart Admin',
      email: 'admin@quickkart.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 9876543210',
      address: { street: 'HQ Connaught Place', city: 'New Delhi', pincode: '110001', coordinates: [77.2167, 28.6315] },
    });

    const customer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@quickkart.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 9811223344',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      address: { street: 'Flat 402, Green Park Main', city: 'New Delhi', pincode: '110016', coordinates: [77.2060, 28.5600] },
    });

    const customer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@quickkart.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 9822334455',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      address: { street: 'B-12, Karol Bagh', city: 'New Delhi', pincode: '110005', coordinates: [77.1906, 28.6517] },
    });

    // Shopkeeper Users
    const shopkeeper1 = await User.create({
      name: 'Ramesh Sharma',
      email: 'sharma@quickkart.com',
      password: 'password123',
      role: 'shopkeeper',
      phone: '+91 9871100001',
      address: { street: 'Shop 14, Main Market, Karol Bagh', city: 'New Delhi', pincode: '110005', coordinates: [77.1900, 28.6510] },
    });

    const shopkeeper2 = await User.create({
      name: 'Vikas Gupta',
      email: 'gupta@quickkart.com',
      password: 'password123',
      role: 'shopkeeper',
      phone: '+91 9871100002',
      address: { street: 'Plot 88, Pusa Road', city: 'New Delhi', pincode: '110005', coordinates: [77.1850, 28.6470] },
    });

    const shopkeeper3 = await User.create({
      name: 'Amit Verma',
      email: 'cityplumbing@quickkart.com',
      password: 'password123',
      role: 'shopkeeper',
      phone: '+91 9871100003',
      address: { street: 'Shop 5, Shankar Market, CP', city: 'New Delhi', pincode: '110001', coordinates: [77.2200, 28.6330] },
    });

    const shopkeeper4 = await User.create({
      name: 'Manoj Kumar',
      email: 'krishna@quickkart.com',
      password: 'password123',
      role: 'shopkeeper',
      phone: '+91 9871100004',
      address: { street: 'Shop 22, Bhagirath Palace, Chandni Chowk', city: 'New Delhi', pincode: '110006', coordinates: [77.2310, 28.6560] },
    });

    const shopkeeper5 = await User.create({
      name: 'Sunil Jain',
      email: 'apex@quickkart.com',
      password: 'password123',
      role: 'shopkeeper',
      phone: '+91 9871100005',
      address: { street: 'Shop 4, Regal Building, CP', city: 'New Delhi', pincode: '110001', coordinates: [77.2180, 28.6290] },
    });

    // 3. Seed Shops
    const shop1 = await Shop.create({
      ownerId: shopkeeper1._id,
      shopName: 'Sharma Hardware & Sanitation Store',
      tagline: 'Premium Tools, CPVC Pipes & Hardware Essentials',
      category: 'Hardware & Tools',
      description: 'Serving Karol Bagh for 25+ years with genuine Astral, Finolex, and Bosch supplies at wholesale rates.',
      contactPhone: '+91 9871100001',
      contactEmail: 'sharma.hardware@quickkart.com',
      address: { street: 'Shop 14, Main Market', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005', landmark: 'Near Metro Pillar 112' },
      location: { type: 'Point', coordinates: [77.1900, 28.6510] },
      openingHours: { open: '08:30 AM', close: '09:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], isOpenNow: true },
      images: ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80'],
      bannerImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
      verificationStatus: 'verified',
      rating: 4.8,
      reviewCount: 42,
      isAcceptingRequests: true,
      liveState: { currentlyServing: 2, queueTimeMinutes: 5, responseRatePercent: 98, lastActiveMinutesAgo: 2, isAvailableNow: true },
    });

    const shop2 = await Shop.create({
      ownerId: shopkeeper2._id,
      shopName: 'Gupta Building Materials & Hardware',
      tagline: 'Complete Construction, Plumbing & Paint Supplies',
      category: 'Hardware & Tools',
      description: 'Authorized dealer of Supreme Pipes, Asian Paints, cement, sand, fasteners, and heavy power tools.',
      contactPhone: '+91 9871100002',
      contactEmail: 'guptabuilding@quickkart.com',
      address: { street: 'Plot 88, Pusa Road', area: 'Karol Bagh / Rajendra Place', city: 'New Delhi', state: 'Delhi', pincode: '110005', landmark: 'Opposite Metro Gate 3' },
      location: { type: 'Point', coordinates: [77.1850, 28.6470] },
      openingHours: { open: '09:00 AM', close: '08:30 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], isOpenNow: true },
      images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
      bannerImage: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=80',
      verificationStatus: 'verified',
      rating: 4.5,
      reviewCount: 28,
      isAcceptingRequests: true,
      liveState: { currentlyServing: 3, queueTimeMinutes: 7, responseRatePercent: 94, lastActiveMinutesAgo: 4, isAvailableNow: true },
    });

    const shop3 = await Shop.create({
      ownerId: shopkeeper3._id,
      shopName: 'City Plumbing Supplies & Fittings',
      tagline: 'Finolex Pipes, Jaquar Taps & Bathroom Hardware',
      category: 'Plumbing & Sanitary',
      description: 'Your one-stop destination in Central Delhi for pipes, GI fittings, sanitaryware, water tanks, and leak repair materials.',
      contactPhone: '+91 9871100003',
      contactEmail: 'cityplumbing@quickkart.com',
      address: { street: 'Shop 5, Shankar Market', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', landmark: 'Near Barakhamba Road' },
      location: { type: 'Point', coordinates: [77.2200, 28.6330] },
      openingHours: { open: '09:30 AM', close: '08:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], isOpenNow: true },
      images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'],
      bannerImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
      verificationStatus: 'verified',
      rating: 4.6,
      reviewCount: 35,
      isAcceptingRequests: true,
      liveState: { currentlyServing: 1, queueTimeMinutes: 3, responseRatePercent: 99, lastActiveMinutesAgo: 1, isAvailableNow: true },
    });

    const shop4 = await Shop.create({
      ownerId: shopkeeper4._id,
      shopName: 'Krishna Electricals & LED World',
      tagline: 'Havells, Polycab, Philips & Anchor Lighting',
      category: 'Electrical & Lighting',
      description: 'Specialists in house wiring, decorative lighting, MCBs, smart switches and industrial electrical gear.',
      contactPhone: '+91 9871100004',
      contactEmail: 'krishnaelec@quickkart.com',
      address: { street: 'Shop 22, Bhagirath Palace', area: 'Chandni Chowk', city: 'New Delhi', state: 'Delhi', pincode: '110006', landmark: 'Electrical Market' },
      location: { type: 'Point', coordinates: [77.2310, 28.6560] },
      openingHours: { open: '10:00 AM', close: '08:30 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], isOpenNow: true },
      images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'],
      bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      verificationStatus: 'verified',
      rating: 4.7,
      reviewCount: 51,
      isAcceptingRequests: true,
      liveState: { currentlyServing: 4, queueTimeMinutes: 10, responseRatePercent: 95, lastActiveMinutesAgo: 6, isAvailableNow: true },
    });

    const shop5 = await Shop.create({
      ownerId: shopkeeper5._id,
      shopName: 'Apex Stationery & Office Hub',
      tagline: 'Art, School, College & Corporate Stationery',
      category: 'Stationery & Office',
      description: 'Complete stationery inventory: Classmate notebooks, Parker & Pilot pens, Casio calculators, printing paper and art supplies.',
      contactPhone: '+91 9871100005',
      contactEmail: 'apexstationery@quickkart.com',
      address: { street: 'Shop 4, Regal Building', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', landmark: 'Outer Circle CP' },
      location: { type: 'Point', coordinates: [77.2180, 28.6290] },
      openingHours: { open: '09:00 AM', close: '09:30 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], isOpenNow: true },
      images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'],
      bannerImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
      verificationStatus: 'verified',
      rating: 4.9,
      reviewCount: 64,
      isAcceptingRequests: true,
      liveState: { currentlyServing: 1, queueTimeMinutes: 2, responseRatePercent: 100, lastActiveMinutesAgo: 1, isAvailableNow: true },
    });

    // 4. Seed Products
    await Product.insertMany([
      // Hardware & Plumbing
      { shopId: shop1._id, name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)', brand: 'Finolex', category: 'Plumbing & Sanitary', price: 290, mrp: 340, unit: 'piece', quantityInStock: 25, lowStockThreshold: 5, images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'], tags: ['pipe', 'pvc', 'plumbing', 'finolex'] },
      { shopId: shop1._id, name: 'Astral CPVC Pro Pipe 1 inch (3 Meter)', brand: 'Astral', category: 'Plumbing & Sanitary', price: 390, mrp: 450, unit: 'piece', quantityInStock: 30, lowStockThreshold: 5, images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'], tags: ['pipe', 'cpvc', 'astral'] },
      { shopId: shop1._id, name: 'Bosch Professional 500W Impact Drill Kit', brand: 'Bosch', category: 'Hardware & Tools', price: 2850, mrp: 3500, unit: 'kit', quantityInStock: 8, lowStockThreshold: 2, images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'], tags: ['drill', 'bosch', 'tools'] },
      { shopId: shop1._id, name: 'Taparia 8-Piece Magnetic Screwdriver Set', brand: 'Taparia', category: 'Hardware & Tools', price: 420, mrp: 500, unit: 'set', quantityInStock: 18, lowStockThreshold: 4, images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80'], tags: ['screwdriver', 'taparia', 'tools'] },

      { shopId: shop2._id, name: 'Supreme 1-inch Schedule 40 PVC Pipe (10ft)', brand: 'Supreme', category: 'Plumbing & Sanitary', price: 310, mrp: 360, unit: 'piece', quantityInStock: 40, lowStockThreshold: 8, images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'], tags: ['pipe', 'pvc', 'supreme'] },
      { shopId: shop2._id, name: 'Asian Paints Apex Ultima White (4 Litre)', brand: 'Asian Paints', category: 'Hardware & Tools', price: 1450, mrp: 1650, unit: 'bucket', quantityInStock: 12, lowStockThreshold: 3, images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'], tags: ['paint', 'asian paints', 'white'] },
      { shopId: shop2._id, name: 'Freemans 5 Meter Steel Measuring Tape', brand: 'Freemans', category: 'Hardware & Tools', price: 160, mrp: 200, unit: 'piece', quantityInStock: 50, lowStockThreshold: 10, images: ['https://images.unsplash.com/photo-1586864387789-628af9feed72?auto=format&fit=crop&w=600&q=80'], tags: ['tape', 'measure', 'freemans'] },

      { shopId: shop3._id, name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)', brand: 'Finolex', category: 'Plumbing & Sanitary', price: 295, mrp: 340, unit: 'piece', quantityInStock: 15, lowStockThreshold: 3, images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'], tags: ['pipe', 'pvc', 'finolex'] },
      { shopId: shop3._id, name: 'Jaquar Brass Angle Valve with Flange', brand: 'Jaquar', category: 'Plumbing & Sanitary', price: 480, mrp: 550, unit: 'piece', quantityInStock: 22, lowStockThreshold: 5, images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'], tags: ['valve', 'tap', 'jaquar'] },
      { shopId: shop3._id, name: 'M-Seal Sanitary Epoxy Sealant Pack (100g)', brand: 'Pidilite', category: 'Plumbing & Sanitary', price: 40, mrp: 45, unit: 'pack', quantityInStock: 80, lowStockThreshold: 15, images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'], tags: ['mseal', 'sealant', 'pidilite'] },

      // Electrical & Lighting
      { shopId: shop4._id, name: 'Philips 9W Cool Daylight LED Bulb (Pack of 2)', brand: 'Philips', category: 'Electrical & Lighting', price: 170, mrp: 220, unit: 'pack', quantityInStock: 45, lowStockThreshold: 10, images: ['https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=600&q=80'], tags: ['led', 'bulb', 'philips', 'light'] },
      { shopId: shop4._id, name: 'Polycab 2.5 sq mm FR Copper Wire (90 Meter Coil)', brand: 'Polycab', category: 'Electrical & Lighting', price: 2150, mrp: 2600, unit: 'coil', quantityInStock: 10, lowStockThreshold: 2, images: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80'], tags: ['wire', 'polycab', 'cable'] },
      { shopId: shop4._id, name: 'Anchor Roma 6A Modular Switch (Box of 10)', brand: 'Anchor', category: 'Electrical & Lighting', price: 320, mrp: 380, unit: 'box', quantityInStock: 25, lowStockThreshold: 5, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80'], tags: ['switch', 'anchor', 'roma'] },
      { shopId: shop4._id, name: 'Havells 4-Way Surge Protector Extension Board', brand: 'Havells', category: 'Electrical & Lighting', price: 540, mrp: 699, unit: 'piece', quantityInStock: 14, lowStockThreshold: 3, images: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80'], tags: ['extension', 'havells', 'board'] },

      // Stationery & Office
      { shopId: shop5._id, name: 'Classmate Spiral Long Notebook 300 Pages (Pack of 3)', brand: 'Classmate', category: 'Stationery & Office', price: 270, mrp: 330, unit: 'pack', quantityInStock: 35, lowStockThreshold: 10, images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'], tags: ['notebook', 'classmate', 'stationery'] },
      { shopId: shop5._id, name: 'Parker Vector Matte Black Fountain Pen', brand: 'Parker', category: 'Stationery & Office', price: 450, mrp: 550, unit: 'piece', quantityInStock: 16, lowStockThreshold: 4, images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80'], tags: ['pen', 'parker', 'fountain pen'] },
      { shopId: shop5._id, name: 'JK Copier A4 Paper 75 GSM (500 Sheets Ream)', brand: 'JK Paper', category: 'Stationery & Office', price: 290, mrp: 360, unit: 'ream', quantityInStock: 60, lowStockThreshold: 15, images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'], tags: ['paper', 'a4', 'jk paper'] },
      { shopId: shop5._id, name: 'Casio FX-991CW Scientific Calculator', brand: 'Casio', category: 'Stationery & Office', price: 1290, mrp: 1495, unit: 'piece', quantityInStock: 9, lowStockThreshold: 2, images: ['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=600&q=80'], tags: ['calculator', 'casio', 'engineering'] },
    ]);

    // 5. Seed a Sample Broadcast Request & Shopkeeper Responses (as depicted in Chapter 10.3 of PDF!)
    const sampleRequest = await Request.create({
      customerId: customer1._id,
      productName: '10 meters of 1-inch PVC Pipe',
      category: 'Plumbing & Sanitary',
      quantity: 1,
      unit: 'bundle (10m)',
      budget: 900,
      note: 'Need urgent heavy-duty PVC pipe for bathroom fitting today',
      urgency: 'immediate',
      location: { type: 'Point', coordinates: [77.1950, 28.6500], addressText: 'Karol Bagh Metro Station' },
      searchRadiusKm: 5,
      status: 'active',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      responsesCount: 3,
    });

    // Responses from Shop 1, Shop 2, and Shop 3 matching Fig 10.2 in PDF
    await RequestResponse.insertMany([
      {
        requestId: sampleRequest._id,
        shopId: shop1._id,
        shopkeeperId: shopkeeper1._id,
        availabilityStatus: 'available',
        offeredPrice: 790,
        preparationTimeMinutes: 10,
        notes: 'Finolex heavy duty in stock. Can pack and keep ready in 10 mins.',
        isBestValue: true,
      },
      {
        requestId: sampleRequest._id,
        shopId: shop2._id,
        shopkeeperId: shopkeeper2._id,
        availabilityStatus: 'available',
        offeredPrice: 850,
        preparationTimeMinutes: 15,
        notes: 'Supreme brand available, high quality Schedule 40 grade.',
        isBestValue: false,
      },
      {
        requestId: sampleRequest._id,
        shopId: shop3._id,
        shopkeeperId: shopkeeper3._id,
        availabilityStatus: 'available',
        offeredPrice: 820,
        preparationTimeMinutes: 12,
        notes: 'Finolex 1-inch pipe in stock, includes joint connector.',
        isBestValue: false,
      },
    ]);

    // 6. Seed a sample reservation
    await Reservation.create({
      reservationCode: 'QK-8421',
      customerId: customer1._id,
      shopId: shop1._id,
      productName: '10 meters of 1-inch PVC Pipe',
      quantity: 1,
      unit: 'bundle',
      agreedPrice: 790,
      totalAmount: 790,
      status: 'CONFIRMED',
      holdDurationMinutes: 60,
      expiresAt: new Date(Date.now() + 45 * 60 * 1000),
      customerNote: 'Coming in 20 minutes on scooter',
      shopkeeperNote: 'Packed and kept at counter 1',
      timeline: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 15 * 60 * 1000), note: 'Customer initiated hold' },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 10 * 60 * 1000), note: 'Shopkeeper confirmed and set item aside' },
      ],
    });

    // 7. Seed sample reviews
    await Review.create({
      customerId: customer2._id,
      shopId: shop1._id,
      rating: 5,
      comment: 'Super fast response! Reserved PVC pipes and collected within 15 minutes. Great price compared to other places.',
      tags: ['Fast Service', 'Exact Match', 'Fair Price'],
    });

    await Review.create({
      customerId: customer1._id,
      shopId: shop5._id,
      rating: 5,
      comment: 'Best stationery shop in CP. Had the Casio calculator in stock when no one else did.',
      tags: ['Great Stock', 'Friendly Owner'],
    });

    console.log('[Seed] Database successfully seeded with QuickKart users, shops, products, and sample requests!');
  } catch (error) {
    console.error('[Seed Error]', error);
  }
};
