import { Meeting } from '../models/Meeting.js';
import { MEETING_STATUS } from '../config/constants.js';

export const createMeeting = async (meetingData, adminId) => {
  const { latitude, longitude, ...rest } = meetingData;

  const meeting = await Meeting.create({
    ...rest,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude] // GeoJSON standard: [lon, lat]
    },
    createdBy: adminId
  });

  return meeting;
};

export const updateMeeting = async (meetingId, updateData) => {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    const error = new Error('Meeting not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
    meeting.location = {
      type: 'Point',
      coordinates: [updateData.longitude, updateData.latitude]
    };
  }

  Object.assign(meeting, updateData);
  await meeting.save();
  return meeting;
};

export const getMeetingById = async (meetingId) => {
  const meeting = await Meeting.findById(meetingId).populate('createdBy', 'name email');
  if (!meeting) {
    const error = new Error('Meeting not found');
    error.statusCode = 404;
    throw error;
  }
  return meeting;
};

export const getCurrentActiveMeeting = async () => {
  // Find meeting with status ACTIVE or date matching today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meeting = await Meeting.findOne({
    status: MEETING_STATUS.ACTIVE,
    date: { $gte: today, $lt: tomorrow }
  })
    .sort({ date: 1, startTime: 1 })
    .lean();

  if (!meeting) {
    // Fallback to any latest active meeting
    return await Meeting.findOne({ status: MEETING_STATUS.ACTIVE }).sort({ createdAt: -1 }).lean();
  }

  return meeting;
};

export const getMeetingsPaginated = async ({ page = 1, limit = 10, search = '', status }) => {
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { locationName: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [meetings, total] = await Promise.all([
    Meeting.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean(),
    Meeting.countDocuments(query)
  ]);

  return {
    meetings,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

export const deleteMeeting = async (meetingId) => {
  const meeting = await Meeting.findByIdAndDelete(meetingId);
  if (!meeting) {
    const error = new Error('Meeting not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Meeting deleted successfully' };
};
