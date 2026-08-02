/**
 * geoUtils.js — Geolocation distance & location helpers for Sehat-Sathi
 */

// Haversine formula to calculate distance in km between two (lat, lng) points
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  
  const p1 = Number(lat1);
  const p2 = Number(lon1);
  const q1 = Number(lat2);
  const q2 = Number(lon2);
  
  if (isNaN(p1) || isNaN(p2) || isNaN(q1) || isNaN(q2)) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = (q1 - p1) * (Math.PI / 180);
  const dLon = (q2 - p2) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1 * (Math.PI / 180)) *
      Math.cos(q1 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Default fallback coordinates for major Indian cities if GPS is unavailable
export const MAJOR_CITIES_COORDS = {
  "Mumbai":     { lat: 19.0760, lng: 72.8777 },
  "Delhi":      { lat: 28.6139, lng: 77.2090 },
  "Bengaluru":  { lat: 12.9716, lng: 77.5946 },
  "Hyderabad":  { lat: 17.3850, lng: 78.4867 },
  "Ahmedabad":  { lat: 23.0225, lng: 72.5714 },
  "Chennai":    { lat: 13.0827, lng: 80.2707 },
  "Kolkata":    { lat: 22.5726, lng: 88.3639 },
  "Pune":       { lat: 18.5204, lng: 73.8567 },
  "Jaipur":     { lat: 26.9124, lng: 75.7873 },
  "Lucknow":    { lat: 26.8467, lng: 80.9462 },
  "Surat":      { lat: 21.1702, lng: 72.8311 },
  "Nagpur":     { lat: 21.1458, lng: 79.0882 },
  "Indore":     { lat: 22.7196, lng: 75.8577 },
  "Bhopal":     { lat: 23.2599, lng: 77.4126 }
};
