import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import Reservation from '../models/Reservation.js';
import { calculateDistanceKm, formatDistance } from '../utils/geoCoder.js';

// Predefined knowledge base for goal decomposition & multi-store planning
const GOAL_TEMPLATES = [
  {
    keywords: ['birthday', 'party', 'decoration', 'celebration'],
    decomposedItems: [
      { name: 'Classmate Art & Craft Color Sheets / Banner Paper', category: 'Stationery & Office', estimatedPrice: 150, quantity: 1, unit: 'pack' },
      { name: 'Philips 9W Cool Daylight LED Bulb (Pack of 2)', category: 'Electrical & Lighting', estimatedPrice: 170, quantity: 1, unit: 'pack' },
      { name: 'Parker Vector Matte Black Fountain Pen', category: 'Stationery & Office', estimatedPrice: 450, quantity: 1, unit: 'piece' },
      { name: 'Havells 4-Way Surge Protector Extension Board', category: 'Electrical & Lighting', estimatedPrice: 540, quantity: 1, unit: 'piece' },
    ],
  },
  {
    keywords: ['pipe', 'leak', 'plumbing', 'bathroom', 'sink', 'tap', 'water'],
    decomposedItems: [
      { name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)', category: 'Plumbing & Sanitary', estimatedPrice: 290, quantity: 1, unit: 'piece' },
      { name: 'Jaquar Brass Angle Valve with Flange', category: 'Plumbing & Sanitary', estimatedPrice: 480, quantity: 1, unit: 'piece' },
      { name: 'M-Seal Sanitary Epoxy Sealant Pack (100g)', category: 'Plumbing & Sanitary', estimatedPrice: 40, quantity: 2, unit: 'pack' },
      { name: 'Freemans 5 Meter Steel Measuring Tape', category: 'Hardware & Tools', estimatedPrice: 160, quantity: 1, unit: 'piece' },
    ],
  },
  {
    keywords: ['drill', 'painting', 'wall', 'repair', 'hardware', 'screw', 'tools'],
    decomposedItems: [
      { name: 'Bosch Professional 500W Impact Drill Kit', category: 'Hardware & Tools', estimatedPrice: 2850, quantity: 1, unit: 'kit' },
      { name: 'Taparia 8-Piece Magnetic Screwdriver Set', category: 'Hardware & Tools', estimatedPrice: 420, quantity: 1, unit: 'set' },
      { name: 'Freemans 5 Meter Steel Measuring Tape', category: 'Hardware & Tools', estimatedPrice: 160, quantity: 1, unit: 'piece' },
    ],
  },
  {
    keywords: ['wiring', 'switch', 'electrical', 'light', 'fan', 'bulb', 'cable'],
    decomposedItems: [
      { name: 'Philips 9W Cool Daylight LED Bulb (Pack of 2)', category: 'Electrical & Lighting', estimatedPrice: 170, quantity: 2, unit: 'pack' },
      { name: 'Polycab 2.5 sq mm FR Copper Wire (90 Meter Coil)', category: 'Electrical & Lighting', estimatedPrice: 2150, quantity: 1, unit: 'coil' },
      { name: 'Anchor Roma 6A Modular Switch (Box of 10)', category: 'Electrical & Lighting', estimatedPrice: 320, quantity: 1, unit: 'box' },
    ],
  },
];

// Diagnostic knowledge engine (Chapter 16.5)
const DIAGNOSTIC_DATABASE = [
  {
    pattern: /(leak|dripping|water|pipe crack|sink)/i,
    diagnosis: 'Plumbing Joint Seal Failure or Valve Gasket Wear',
    recommendedFix: 'Shut off the main inlet angle valve, replace worn washers/flange, and seal pipe joints with CPVC solvent and M-Seal epoxy.',
    neededParts: ['1-inch PVC / CPVC Pipe', 'Angle Valve', 'M-Seal Epoxy Sealant', 'Teflon Tape'],
    targetCategories: ['Plumbing & Sanitary', 'Hardware & Tools'],
  },
  {
    pattern: /(spark|switch|circuit|tripping|short circuit|wire burning)/i,
    diagnosis: 'Electrical Overload or Faulty Switch / Insulation Breakdown',
    recommendedFix: 'Isolate the main MCB breaker immediately. Inspect modular switch terminals for carbonization and rewire with FR copper wire.',
    neededParts: ['6A Modular Switch', 'FR Copper Wire 2.5 sq mm', 'Surge Protector', 'Tester / Screwdriver'],
    targetCategories: ['Electrical & Lighting', 'Hardware & Tools'],
  },
  {
    pattern: /(wall crack|drilling|hanging|fastener|screw loose|mount)/i,
    diagnosis: 'Wall Anchor Fastener Stress / Masonry Loose Fit',
    recommendedFix: 'Use a masonry impact drill with 6mm bit, insert nylon rawl plugs, and anchor heavy-duty galvanized screws.',
    neededParts: ['Impact Drill Machine', 'Magnetic Screwdriver Set', 'Measuring Tape', 'Wall Anchors & Screws'],
    targetCategories: ['Hardware & Tools'],
  },
  {
    pattern: /(exam|study|project report|drawing|sketch|drafting|print)/i,
    diagnosis: 'Academic / Technical Project Materials Requirement',
    recommendedFix: 'Gather standard 75 GSM A4 paper, spiral binding notebooks, calibrated scientific calculator, and archival pens.',
    neededParts: ['JK Copier A4 Paper', 'Classmate Spiral Notebook', 'Casio FX-991CW Calculator', 'Parker Vector Pen'],
    targetCategories: ['Stationery & Office'],
  },
];

/**
 * @desc   Autonomous Goal-to-Plan Multi-Shop AI Agent (Chapter 16.1 / Fig 16.1)
 * @route  POST /api/agent/plan-goal
 * @access Public / Customer
 */
export const planAutonomousGoal = async (req, res, next) => {
  try {
    const { goalText, userLocation, maxBudget, maxRadiusKm = 5 } = req.body;
    const coords = userLocation?.coordinates || [77.1906, 28.6517]; // default Karol Bagh
    const budget = parseFloat(maxBudget) || 3500;
    const radius = parseFloat(maxRadiusKm) || 5;

    if (!goalText || !goalText.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your goal description' });
    }

    const lowerGoal = goalText.toLowerCase();

    // 1. Decompose Goal into concrete product items
    let matchedTemplate = GOAL_TEMPLATES.find((t) =>
      t.keywords.some((k) => lowerGoal.includes(k))
    );

    if (!matchedTemplate) {
      matchedTemplate = GOAL_TEMPLATES[0]; // fallback to generalized template
    }

    const requiredItems = matchedTemplate.decomposedItems;

    // 2. Search Live Local Inventory across nearby shops
    const allShops = await Shop.find({ verificationStatus: 'verified' });
    const nearbyShops = allShops
      .map((s) => {
        const sObj = s.toObject();
        sObj.distanceKm = calculateDistanceKm(coords, s.location.coordinates);
        return sObj;
      })
      .filter((s) => s.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const plannedItems = [];
    const shopsInvolvedMap = new Map();
    let totalPlanCost = 0;

    for (const reqItem of requiredItems) {
      // Find actual matching product in nearby shops
      const matchingProducts = await Product.find({
        isAvailable: true,
        $or: [
          { name: { $regex: reqItem.name.split(' ')[0], $options: 'i' } },
          { category: reqItem.category },
          { tags: { $in: reqItem.category.toLowerCase().split(' ') } },
        ],
      }).populate('shopId', 'shopName rating location address contactPhone');

      // Filter products by nearby shops only
      const availableNearby = matchingProducts.filter((p) => {
        if (!p.shopId) return false;
        const dist = calculateDistanceKm(coords, p.shopId.location.coordinates);
        return dist <= radius;
      });

      if (availableNearby.length > 0) {
        // Pick best price / closest option
        availableNearby.sort((a, b) => a.price - b.price);
        const bestPick = availableNearby[0];
        const itemDist = calculateDistanceKm(coords, bestPick.shopId.location.coordinates);

        const subtotal = bestPick.price * (reqItem.quantity || 1);
        totalPlanCost += subtotal;

        const shopIdStr = bestPick.shopId._id.toString();
        if (!shopsInvolvedMap.has(shopIdStr)) {
          shopsInvolvedMap.set(shopIdStr, {
            shopId: bestPick.shopId._id,
            shopName: bestPick.shopId.shopName,
            address: bestPick.shopId.address,
            distanceKm: itemDist,
            items: [],
          });
        }
        shopsInvolvedMap.get(shopIdStr).items.push({
          productId: bestPick._id,
          name: bestPick.name,
          price: bestPick.price,
          quantity: reqItem.quantity || 1,
          unit: bestPick.unit,
        });

        plannedItems.push({
          requiredName: reqItem.name,
          matchedProduct: {
            _id: bestPick._id,
            name: bestPick.name,
            brand: bestPick.brand,
            price: bestPick.price,
            quantity: reqItem.quantity || 1,
            unit: bestPick.unit,
            image: bestPick.images?.[0],
          },
          shop: {
            _id: bestPick.shopId._id,
            name: bestPick.shopId.shopName,
            address: bestPick.shopId.address?.street,
            distanceKm: itemDist,
          },
        });
      } else {
        // Fallback placeholder item
        totalPlanCost += reqItem.estimatedPrice;
        plannedItems.push({
          requiredName: reqItem.name,
          matchedProduct: {
            name: reqItem.name,
            price: reqItem.estimatedPrice,
            quantity: reqItem.quantity,
            unit: reqItem.unit,
          },
          shop: {
            name: 'Nearest Neighborhood Vendor',
            distanceKm: 1.5,
          },
        });
      }
    }

    // 3. Optimize Pickup Route across unique shops (Traveling Salesman Heuristic)
    const uniqueShops = Array.from(shopsInvolvedMap.values()).sort(
      (a, b) => a.distanceKm - b.distanceKm
    );

    let totalTravelDistanceKm = 0;
    let lastPoint = coords;
    const optimizedRouteStops = uniqueShops.map((shopItem, index) => {
      totalTravelDistanceKm += shopItem.distanceKm;
      return {
        stopNumber: index + 1,
        shopName: shopItem.shopName,
        shopId: shopItem.shopId,
        address: `${shopItem.address?.street}, ${shopItem.address?.area || ''}`,
        distanceFromUser: `${shopItem.distanceKm.toFixed(1)} km`,
        itemsToCollect: shopItem.items,
        estimatedPickupTime: `${10 + index * 12} mins`,
      };
    });

    const isWithinBudget = totalPlanCost <= budget;

    res.json({
      success: true,
      goal: goalText,
      planSummary: {
        totalCost: totalPlanCost,
        budgetLimit: budget,
        isWithinBudget,
        savingsOrDeficit: Math.abs(budget - totalPlanCost),
        totalItemsCount: plannedItems.length,
        uniqueShopsCount: uniqueShops.length,
        totalTravelDistance: `${totalTravelDistanceKm.toFixed(1)} km`,
        totalEstimatedTripTime: `${20 + uniqueShops.length * 15} minutes`,
      },
      decomposedItems: requiredItems,
      plannedItems,
      optimizedRouteStops,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Symptom-Based / Diagnostic Problem Search (Chapter 16.5)
 * @route  POST /api/agent/diagnose-problem
 * @access Public / Customer
 */
export const diagnoseProblem = async (req, res, next) => {
  try {
    const { problemDescription, userLocation } = req.body;
    const coords = userLocation?.coordinates || [77.1906, 28.6517];

    if (!problemDescription || !problemDescription.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe the problem or symptom' });
    }

    // Match symptom against diagnostic engine
    let matchedDiag = DIAGNOSTIC_DATABASE.find((d) => d.pattern.test(problemDescription));
    if (!matchedDiag) {
      matchedDiag = DIAGNOSTIC_DATABASE[0];
    }

    // Find nearby specialist shops matching categories
    const matchingShops = await Shop.find({
      verificationStatus: 'verified',
      category: { $in: matchedDiag.targetCategories },
    });

    const nearbySpecialists = matchingShops
      .map((s) => {
        const sObj = s.toObject();
        sObj.distanceKm = calculateDistanceKm(coords, s.location.coordinates);
        return sObj;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 4);

    // Find in-stock products addressing symptom
    const suggestedParts = await Product.find({
      category: { $in: matchedDiag.targetCategories },
      isAvailable: true,
    })
      .populate('shopId', 'shopName rating location')
      .limit(6);

    res.json({
      success: true,
      problemDescription,
      diagnosis: matchedDiag.diagnosis,
      recommendedFix: matchedDiag.recommendedFix,
      neededParts: matchedDiag.neededParts,
      nearbySpecialists,
      suggestedProducts: suggestedParts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Reserve Entire Multi-Store Autonomous Plan in 1 Click (Chapter 16.1 step 8)
 * @route  POST /api/agent/reserve-multi-plan
 * @access Private (Customer)
 */
export const reserveMultiStorePlan = async (req, res, next) => {
  try {
    const { routeStops } = req.body;
    if (!routeStops || !routeStops.length) {
      return res.status(400).json({ success: false, message: 'No route stops provided' });
    }

    const createdReservations = [];

    for (const stop of routeStops) {
      if (!stop.shopId || !stop.itemsToCollect?.length) continue;

      const randomCode = 'QK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const firstItem = stop.itemsToCollect[0];
      const subtotal = stop.itemsToCollect.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

      const reservation = await Reservation.create({
        reservationCode: randomCode,
        customerId: req.user._id,
        shopId: stop.shopId,
        productId: firstItem.productId || null,
        productName: stop.itemsToCollect.map((i) => `${i.name} (x${i.quantity})`).join(' + '),
        quantity: stop.itemsToCollect.length,
        unit: 'bundle',
        agreedPrice: subtotal,
        totalAmount: subtotal,
        status: 'PENDING',
        holdDurationMinutes: 90,
        expiresAt: new Date(Date.now() + 90 * 60 * 1000),
        customerNote: 'Multi-Store Autonomous AI Plan pickup route',
        timeline: [
          {
            status: 'PENDING',
            timestamp: new Date(),
            note: 'Multi-stop AI Agent pickup hold initiated',
          },
        ],
      });

      createdReservations.push(reservation);
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdReservations.length} reservations across optimal route!`,
      reservations: createdReservations,
    });
  } catch (error) {
    next(error);
  }
};
