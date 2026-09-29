import { calculateHaversineDistance, isValidCoordinates } from '../utils/distance.js';
import { config } from '../config/env.js';
import { REJECTION_REASONS } from '../config/constants.js';

export const verifyLocationPresence = (userLat, userLon, accuracy, meeting) => {
  // 1. Coordinates range check
  if (!isValidCoordinates(userLat, userLon)) {
    return {
      isValid: false,
      rejectionReason: REJECTION_REASONS.INVALID_COORDINATES,
      message: 'Invalid latitude or longitude values provided.',
      distance: null
    };
  }

  // 2. GPS Accuracy threshold check
  if (accuracy > config.maxAllowedAccuracy) {
    return {
      isValid: false,
      rejectionReason: REJECTION_REASONS.POOR_ACCURACY,
      message: `GPS accuracy (${Math.round(accuracy)}m) is lower than allowed threshold (${config.maxAllowedAccuracy}m). Please move to an open area with better GPS signal.`,
      distance: null
    };
  }

  // Extract target coordinates from GeoJSON [longitude, latitude]
  const [targetLon, targetLat] = meeting.location.coordinates;

  // 3. Calculate server-side Haversine distance in meters
  const distance = calculateHaversineDistance(userLat, userLon, targetLat, targetLon);

  // 4. Verify distance against allowed meeting radius
  if (distance > meeting.radius) {
    return {
      isValid: false,
      rejectionReason: REJECTION_REASONS.OUTSIDE_RADIUS,
      message: `You are ${distance}m away from ${meeting.locationName}. Move within ${meeting.radius}m to check in.`,
      distance
    };
  }

  return {
    isValid: true,
    rejectionReason: null,
    message: `Location verified. You are ${distance}m from ${meeting.locationName} (within ${meeting.radius}m limit).`,
    distance
  };
};
