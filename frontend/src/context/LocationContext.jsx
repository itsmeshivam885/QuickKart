import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const PRESET_AREAS = [
  { name: 'Connaught Place, New Delhi', coords: [77.2167, 28.6315] },
  { name: 'Karol Bagh, New Delhi', coords: [77.1906, 28.6517] },
  { name: 'Lajpat Nagar, New Delhi', coords: [77.2433, 28.5700] },
  { name: 'Noida Sector 62, UP', coords: [77.3639, 28.6256] },
  { name: 'Cyber Hub, Gurugram', coords: [77.0888, 28.4950] },
  { name: 'Bandra West, Mumbai', coords: [72.8335, 19.0596] },
  { name: 'Indiranagar, Bengaluru', coords: [77.6412, 12.9784] },
];

export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(() => {
    const saved = localStorage.getItem('quickkart_coords');
    return saved ? JSON.parse(saved) : [77.1906, 28.6517]; // Default Karol Bagh for demo alignment
  });

  const [addressText, setAddressText] = useState(() => {
    return localStorage.getItem('quickkart_address') || 'Karol Bagh, New Delhi';
  });

  const [radiusKm, setRadiusKm] = useState(5);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    localStorage.setItem('quickkart_coords', JSON.stringify(coordinates));
    localStorage.setItem('quickkart_address', addressText);
  }, [coordinates, addressText]);

  const selectPreset = (preset) => {
    setCoordinates(preset.coords);
    setAddressText(preset.name);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        setCoordinates(coords);
        setAddressText('My Current GPS Location');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation access denied or timed out:', error.message);
        setIsLocating(false);
        // Retain preset
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        lng: coordinates[0],
        lat: coordinates[1],
        addressText,
        radiusKm,
        setRadiusKm,
        setCoordinates,
        setAddressText,
        selectPreset,
        detectCurrentLocation,
        isLocating,
        presetAreas: PRESET_AREAS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
