import { CheckIn } from '../models/CheckIn.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';
import { CHECKIN_STATUS, REJECTION_REASONS } from '../config/constants.js';
import { validateCheckInTimeWindow } from '../utils/time.js';
import { verifyLocationPresence } from './location.service.js';

export const processUserCheckIn = async ({ userId, meetingId, latitude, longitude, accuracy, userNotes, userAgent }) => {
  // 1. Authenticated user check & 2. User active check
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }
  if (!user.isActive) {
    const error = new Error('User account is inactive.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Active meeting check
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    const error = new Error('Meeting not found.');
    error.statusCode = 404;
    throw error;
  }

  // 4. Check-in enabled check
  if (!meeting.checkInEnabled || meeting.status !== 'ACTIVE') {
    const checkInRecord = await CheckIn.create({
      user: userId,
      meeting: meetingId,
      status: CHECKIN_STATUS.REJECTED,
      checkedInAt: new Date(),
      location: { type: 'Point', coordinates: [longitude, latitude] },
      accuracy,
      distance: 0,
      rejectionReason: REJECTION_REASONS.MEETING_DISABLED,
      userNotes,
      userAgent
    });
    return {
      success: false,
      status: CHECKIN_STATUS.REJECTED,
      rejectionReason: REJECTION_REASONS.MEETING_DISABLED,
      message: 'Check-in is currently disabled for this meeting.',
      checkIn: checkInRecord
    };
  }

  // 9. Duplicate PRESENT check-in check
  const existingPresentCheckIn = await CheckIn.findOne({
    user: userId,
    meeting: meetingId,
    status: CHECKIN_STATUS.PRESENT
  });

  if (existingPresentCheckIn) {
    return {
      success: false,
      status: CHECKIN_STATUS.PRESENT,
      alreadyCheckedIn: true,
      rejectionReason: REJECTION_REASONS.DUPLICATE_CHECKIN,
      message: 'You have already marked PRESENT for this meeting.',
      checkIn: existingPresentCheckIn
    };
  }

  // 5. Check-in time window validation (Server time vs Meeting Timezone Window)
  const timeValidation = validateCheckInTimeWindow(meeting, new Date());
  if (!timeValidation.isValid) {
    const checkInRecord = await CheckIn.create({
      user: userId,
      meeting: meetingId,
      status: CHECKIN_STATUS.REJECTED,
      checkedInAt: new Date(),
      location: { type: 'Point', coordinates: [longitude, latitude] },
      accuracy,
      distance: 0,
      rejectionReason: timeValidation.reason,
      userNotes,
      userAgent
    });
    return {
      success: false,
      status: CHECKIN_STATUS.REJECTED,
      rejectionReason: timeValidation.reason,
      message: timeValidation.message,
      checkIn: checkInRecord
    };
  }

  // 6, 7, 8. Location Verification (Coordinates, Accuracy & Distance vs Radius)
  const locationValidation = verifyLocationPresence(latitude, longitude, accuracy, meeting);
  if (!locationValidation.isValid) {
    const checkInRecord = await CheckIn.create({
      user: userId,
      meeting: meetingId,
      status: CHECKIN_STATUS.REJECTED,
      checkedInAt: new Date(),
      location: { type: 'Point', coordinates: [longitude, latitude] },
      accuracy,
      distance: locationValidation.distance || 0,
      rejectionReason: locationValidation.rejectionReason,
      userNotes,
      userAgent
    });
    return {
      success: false,
      status: CHECKIN_STATUS.REJECTED,
      rejectionReason: locationValidation.rejectionReason,
      message: locationValidation.message,
      distance: locationValidation.distance,
      accuracy,
      allowedRadius: meeting.radius,
      checkIn: checkInRecord
    };
  }

  // All 9 checks passed! Record status = PRESENT
  const successfulCheckIn = await CheckIn.create({
    user: userId,
    meeting: meetingId,
    status: CHECKIN_STATUS.PRESENT,
    checkedInAt: new Date(),
    location: { type: 'Point', coordinates: [longitude, latitude] },
    accuracy,
    distance: locationValidation.distance,
    verificationMethod: 'GPS_HAVERSINE',
    rejectionReason: null,
    userNotes,
    userAgent
  });

  return {
    success: true,
    status: CHECKIN_STATUS.PRESENT,
    message: `Check-in successful! Marked PRESENT for ${meeting.title}. Distance: ${locationValidation.distance}m.`,
    distance: locationValidation.distance,
    accuracy,
    allowedRadius: meeting.radius,
    checkIn: successfulCheckIn
  };
};

export const getUserCheckInHistory = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [checkIns, total] = await Promise.all([
    CheckIn.find({ user: userId })
      .sort({ checkedInAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('meeting', 'title locationName date startTime endTime radius')
      .lean(),
    CheckIn.countDocuments({ user: userId })
  ]);

  return {
    checkIns,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

export const getMeetingCheckInStatusForUser = async (userId, meetingId) => {
  const checkIn = await CheckIn.findOne({
    user: userId,
    meeting: meetingId,
    status: CHECKIN_STATUS.PRESENT
  }).lean();

  return {
    hasCheckedIn: !!checkIn,
    checkIn: checkIn || null
  };
};

export const resetUserCheckInForMeeting = async (userId, meetingId) => {
  await CheckIn.deleteMany({ user: userId, meeting: meetingId });
  return { message: 'Check-in record cleared successfully for testing.' };
};
