/**
 * Calculates distance between two [lng, lat] coordinates in kilometers using Haversine formula
 */
export const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 0;
  
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place
};

/**
 * Format distance in meters or km
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

/**
 * Popular Indian locality coordinate lookup
 */
export const PRESET_LOCATIONS = {
  'Connaught Place, New Delhi': [77.2167, 28.6315],
  'Karol Bagh, New Delhi': [77.1906, 28.6517],
  'Lajpat Nagar, New Delhi': [77.2433, 28.5700],
  'Noida Sector 62, UP': [77.3639, 28.6256],
  'Indirapuram, Ghaziabad': [77.3712, 28.6415],
  'Cyber Hub, Gurugram': [77.0888, 28.4950],
  'Bandra West, Mumbai': [72.8335, 19.0596],
  'Indiranagar, Bengaluru': [77.6412, 12.9784],
  'Kothrud, Pune': [73.8143, 18.5074],
  'Hazratganj, Lucknow': [80.9462, 26.8467],
};

export const geocodeAddress = (query) => {
  if (!query) return [77.2090, 28.6139]; // Default New Delhi
  
  const matchedKey = Object.keys(PRESET_LOCATIONS).find(k => 
    k.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(k.toLowerCase())
  );
  
  if (matchedKey) {
    return PRESET_LOCATIONS[matchedKey];
  }

  // Generate deterministic jitter within ~2km of central Delhi for custom queries
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
  }
  const jitterLat = ((hash % 100) / 5000);
  const jitterLng = (((hash >> 2) % 100) / 5000);

  return [77.2090 + jitterLng, 28.6139 + jitterLat];
};
