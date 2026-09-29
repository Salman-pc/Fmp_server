/**
 * Validates if coordinates are within standard geographical bounds.
 */
export const isValidCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }
  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }
  if (lat < -90 || lat > 90) {
    return false;
  }
  if (lon < -180 || lon > 180) {
    return false;
  }
  return true;
};

/**
 * Calculates Great-Circle Distance between two coordinates in meters using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in meters (rounded to nearest meter)
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  const R = 6371000; // Earth radius in meters
  const toRad = (degree) => (degree * Math.PI) / 180;

  const dLat = toRad(nLat2 - nLat1);
  const dLon = toRad(nLon2 - nLon1);
  const phi1 = toRad(nLat1);
  const phi2 = toRad(nLat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
};
