export const FALLBACK_SHOPS = [
  {
    _id: '64a000000000000000000001',
    shopName: 'Sharma Hardware & Sanitation Store',
    tagline: 'Authorized Finolex, Astral & Jaquar Dealer',
    description: 'Trusted neighborhood hardware and sanitation supplier serving Karol Bagh for 22+ years. Genuine pipes, valves, tools, and construction supplies.',
    category: 'Hardware & Tools',
    address: {
      street: 'Shop 14, Block 8, Ajmal Khan Road',
      area: 'Karol Bagh',
      city: 'New Delhi',
      pincode: '110005',
    },
    location: {
      type: 'Point',
      coordinates: [77.1906, 28.6517],
    },
    contactPhone: '+91 9876543210',
    bannerImage: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    numReviews: 142,
    isActive: true,
    verificationStatus: 'verified',
    liveServingCount: 2,
    estWaitTimeMinutes: 4,
    promptResponseRate: 98,
    distanceKm: 0.8,
    openingHours: { open: '08:30 AM', close: '09:00 PM', isOpenNow: true },
    topProducts: [
      { name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)', price: 290, mrp: 350, unit: 'piece', stockStatus: 'in_stock', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'] },
      { name: 'Astral CPVC Pro Pipe 1 inch (3 Meter)', price: 390, mrp: 460, unit: 'piece', stockStatus: 'in_stock', images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'] },
      { name: 'Bosch Professional 500W Impact Drill Kit', price: 2850, mrp: 3499, unit: 'kit', stockStatus: 'in_stock', images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'] }
    ]
  },
  {
    _id: '64a000000000000000000002',
    shopName: 'Gupta Building Materials & Hardware',
    tagline: 'Complete Cement, Pipes & Sanitary Solutions',
    description: 'Wholesale and retail supplier of top plumbing, CPVC fittings, and building materials.',
    category: 'Hardware & Tools',
    address: {
      street: 'Plot 22, Connaught Circus',
      area: 'Connaught Place',
      city: 'New Delhi',
      pincode: '110001',
    },
    location: {
      type: 'Point',
      coordinates: [77.2177, 28.6304],
    },
    contactPhone: '+91 9876543211',
    bannerImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    numReviews: 98,
    isActive: true,
    verificationStatus: 'verified',
    liveServingCount: 4,
    estWaitTimeMinutes: 8,
    promptResponseRate: 92,
    distanceKm: 2.3,
    openingHours: { open: '09:00 AM', close: '08:30 PM', isOpenNow: true },
    topProducts: [
      { name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)', price: 295, mrp: 350, unit: 'piece', stockStatus: 'in_stock', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'] },
      { name: 'Jaquar Brass Angle Valve with Flange', price: 480, mrp: 575, unit: 'piece', stockStatus: 'in_stock', images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'] }
    ]
  },
  {
    _id: '64a000000000000000000003',
    shopName: 'City Plumbing Supplies & Fittings',
    tagline: 'Direct CPVC, UPVC, Valves & Drain Systems',
    description: 'Specialized plumbing merchant stocking Astral, Supreme, and Prince pipes with instant counter collection.',
    category: 'Plumbing & Sanitary',
    address: {
      street: 'Shop 5, Central Market, Lajpat Nagar II',
      area: 'Lajpat Nagar',
      city: 'New Delhi',
      pincode: '110024',
    },
    location: {
      type: 'Point',
      coordinates: [77.2433, 28.5700],
    },
    contactPhone: '+91 9876543212',
    bannerImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    numReviews: 64,
    isActive: true,
    verificationStatus: 'verified',
    liveServingCount: 1,
    estWaitTimeMinutes: 3,
    promptResponseRate: 96,
    distanceKm: 3.1,
    openingHours: { open: '09:30 AM', close: '09:00 PM', isOpenNow: true },
    topProducts: [
      { name: 'Supreme 1-inch Schedule 40 PVC Pipe (10ft)', price: 310, mrp: 375, unit: 'piece', stockStatus: 'in_stock', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'] }
    ]
  }
];

export const FALLBACK_PRODUCTS = [
  {
    _id: '64b000000000000000000001',
    name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)',
    brand: 'Finolex',
    description: 'High pressure heavy-duty PVC pipe for residential plumbing lines and drainage.',
    category: 'Plumbing & Sanitary',
    price: 290,
    mrp: 350,
    unit: 'piece',
    quantityInStock: 45,
    isAvailable: true,
    stockStatus: 'in_stock',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80'],
    tags: ['pipe', 'pvc', 'plumbing', 'finolex'],
    shopId: {
      _id: '64a000000000000000000001',
      shopName: 'Sharma Hardware & Sanitation Store',
      rating: 4.9,
      address: { street: 'Shop 14, Block 8, Ajmal Khan Road', area: 'Karol Bagh', city: 'New Delhi' },
      location: { coordinates: [77.1906, 28.6517] }
    }
  },
  {
    _id: '64b000000000000000000002',
    name: 'Astral CPVC Pro Pipe 1 inch (3 Meter)',
    brand: 'Astral',
    description: 'Lead-free hot and cold potable water plumbing pipe certified to ASTM standards.',
    category: 'Plumbing & Sanitary',
    price: 390,
    mrp: 460,
    unit: 'piece',
    quantityInStock: 30,
    isAvailable: true,
    stockStatus: 'in_stock',
    images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'],
    tags: ['pipe', 'cpvc', 'astral', 'hot water'],
    shopId: {
      _id: '64a000000000000000000001',
      shopName: 'Sharma Hardware & Sanitation Store',
      rating: 4.9,
      address: { street: 'Shop 14, Block 8, Ajmal Khan Road', area: 'Karol Bagh', city: 'New Delhi' },
      location: { coordinates: [77.1906, 28.6517] }
    }
  },
  {
    _id: '64b000000000000000000003',
    name: 'Bosch Professional 500W Impact Drill Kit',
    brand: 'Bosch',
    description: 'Heavy duty multi-speed reversible impact drill machine with 10 drill bits and case.',
    category: 'Hardware & Tools',
    price: 2850,
    mrp: 3499,
    unit: 'kit',
    quantityInStock: 8,
    isAvailable: true,
    stockStatus: 'in_stock',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'],
    tags: ['drill', 'bosch', 'tools', 'hardware'],
    shopId: {
      _id: '64a000000000000000000001',
      shopName: 'Sharma Hardware & Sanitation Store',
      rating: 4.9,
      address: { street: 'Shop 14, Block 8, Ajmal Khan Road', area: 'Karol Bagh', city: 'New Delhi' },
      location: { coordinates: [77.1906, 28.6517] }
    }
  },
  {
    _id: '64b000000000000000000004',
    name: 'Jaquar Brass Angle Valve with Flange',
    brand: 'Jaquar',
    description: 'Quarter turn high-durability chrome plated brass angle stop cock valve.',
    category: 'Plumbing & Sanitary',
    price: 480,
    mrp: 575,
    unit: 'piece',
    quantityInStock: 25,
    isAvailable: true,
    stockStatus: 'in_stock',
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
    tags: ['valve', 'jaquar', 'bathroom'],
    shopId: {
      _id: '64a000000000000000000002',
      shopName: 'Gupta Building Materials & Hardware',
      rating: 4.7,
      address: { street: 'Plot 22, Connaught Circus', area: 'Connaught Place', city: 'New Delhi' },
      location: { coordinates: [77.2177, 28.6304] }
    }
  }
];
