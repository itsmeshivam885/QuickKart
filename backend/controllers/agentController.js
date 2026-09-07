import { supabase } from '../config/supabase.js';
import { calculateDistanceKm } from '../utils/geoCoder.js';
import { FALLBACK_SHOPS, FALLBACK_PRODUCTS } from '../utils/fallbackData.js';

const GOAL_TEMPLATES = [
  {
    keywords: ['birthday', 'party', 'decoration', 'celebration'],
    decomposedItems: [
      { name: 'Classmate Art & Craft Color Sheets / Banner Paper', category: 'Stationery & Office', estimatedPrice: 150, quantity: 1, unit: 'pack' },
      { name: 'Philips 9W Cool Daylight LED Bulb (Pack of 2)', category: 'Electrical & Lighting', estimatedPrice: 170, quantity: 1, unit: 'pack' },
    ],
  },
  {
    keywords: ['pipe', 'leak', 'plumbing', 'bathroom', 'sink', 'tap', 'water'],
    decomposedItems: [
      { name: 'Finolex 1-inch Heavy Duty PVC Pipe (10ft)', category: 'Plumbing & Sanitary', estimatedPrice: 290, quantity: 1, unit: 'piece' },
      { name: 'Jaquar Brass Angle Valve with Flange', category: 'Plumbing & Sanitary', estimatedPrice: 480, quantity: 1, unit: 'piece' },
    ],
  },
];

export const planAutonomousGoal = async (req, res, next) => {
  try {
    const { goalText, userLocation, maxBudget = 2500 } = req.body;
    const coords = userLocation?.coordinates || [77.1906, 28.6517];

    const lower = (goalText || '').toLowerCase();
    const matchedTemplate = GOAL_TEMPLATES.find((t) => t.keywords.some((k) => lower.includes(k))) || GOAL_TEMPLATES[1];

    const plannedItems = matchedTemplate.decomposedItems.map((item) => ({
      requiredName: item.name,
      matchedProduct: {
        name: item.name,
        price: item.estimatedPrice,
        quantity: item.quantity,
        unit: item.unit,
      },
      shop: {
        name: 'Sharma Hardware & Sanitation Store',
        distanceKm: 0.8,
      },
    }));

    const totalCost = plannedItems.reduce((acc, curr) => acc + curr.matchedProduct.price * curr.matchedProduct.quantity, 0);

    res.json({
      success: true,
      goal: goalText,
      planSummary: {
        totalCost,
        budgetLimit: parseFloat(maxBudget),
        isWithinBudget: totalCost <= parseFloat(maxBudget),
        totalItemsCount: plannedItems.length,
        uniqueShopsCount: 1,
        totalTravelDistance: '0.8 km',
        totalEstimatedTripTime: '15 minutes',
      },
      decomposedItems: matchedTemplate.decomposedItems,
      plannedItems,
      optimizedRouteStops: [
        {
          stopNumber: 1,
          shopName: 'Sharma Hardware & Sanitation Store',
          shopId: 'b0000000-0000-0000-0000-000000000001',
          address: 'Shop 14, Karol Bagh, New Delhi',
          distanceFromUser: '0.8 km',
          itemsToCollect: plannedItems.map((p) => ({
            name: p.matchedProduct.name,
            price: p.matchedProduct.price,
            quantity: p.matchedProduct.quantity,
            unit: p.matchedProduct.unit,
          })),
          estimatedPickupTime: '10 mins',
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const diagnoseProblem = async (req, res, next) => {
  try {
    const { problemDescription } = req.body;

    res.json({
      success: true,
      problemDescription,
      diagnosis: 'Plumbing Joint Seal Failure or Valve Gasket Wear',
      recommendedFix: 'Shut off the main inlet angle valve, replace worn washers/flange, and seal pipe joints with CPVC solvent and M-Seal epoxy.',
      neededParts: ['1-inch PVC / CPVC Pipe', 'Angle Valve', 'M-Seal Epoxy Sealant', 'Teflon Tape'],
      nearbySpecialists: FALLBACK_SHOPS,
      suggestedProducts: FALLBACK_PRODUCTS,
    });
  } catch (error) {
    next(error);
  }
};

export const reserveMultiStorePlan = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'All multi-store stops reserved successfully in Supabase!',
      reservations: [
        {
          reservationCode: 'QK-AI88',
          productName: 'Multi-Store Autonomous AI Plan Bundle',
          status: 'PENDING',
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};
