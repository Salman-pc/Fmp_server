import { CheckIn } from '../models/CheckIn.js';
import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { CHECKIN_STATUS, ROLES } from '../config/constants.js';

export const getDashboardSummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalUsers, activeUsers, presentTodayCount, totalCheckIns, activeMeeting] = await Promise.all([
    User.countDocuments({ role: ROLES.USER }),
    User.countDocuments({ role: ROLES.USER, isActive: true }),
    CheckIn.countDocuments({
      status: CHECKIN_STATUS.PRESENT,
      checkedInAt: { $gte: today, $lt: tomorrow }
    }),
    CheckIn.countDocuments({ status: CHECKIN_STATUS.PRESENT }),
    Meeting.findOne({ status: 'ACTIVE' }).sort({ date: -1 }).lean()
  ]);

  const notCheckedInToday = Math.max(0, activeUsers - presentTodayCount);

  // Recent check-ins list
  const recentCheckIns = await CheckIn.find()
    .sort({ checkedInAt: -1 })
    .limit(10)
    .populate('user', 'name email avatar')
    .populate('meeting', 'title locationName radius')
    .lean();

  return {
    totalUsers,
    activeUsers,
    presentToday: presentTodayCount,
    notCheckedInToday,
    totalCheckIns,
    activeMeeting: activeMeeting || null,
    recentCheckIns
  };
};

export const getAttendanceReport = async ({ page = 1, limit = 15, meetingId, userId, status, startDate, endDate }) => {
  const query = {};

  if (meetingId) query.meeting = meetingId;
  if (userId) query.user = userId;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.checkedInAt = {};
    if (startDate) query.checkedInAt.$gte = new Date(startDate);
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      query.checkedInAt.$lte = eDate;
    }
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    CheckIn.find(query)
      .sort({ checkedInAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email avatar role')
      .populate('meeting', 'title locationName date startTime endTime radius')
      .lean(),
    CheckIn.countDocuments(query)
  ]);

  return {
    records,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

export const getUserAttendanceStats = async () => {
  const totalMeetings = await Meeting.countDocuments();
  const users = await User.find({ role: ROLES.USER, isActive: true }).select('name email avatar').lean();

  const userStats = await Promise.all(
    users.map(async (u) => {
      const presentCount = await CheckIn.countDocuments({
        user: u._id,
        status: CHECKIN_STATUS.PRESENT
      });

      const missedCount = Math.max(0, totalMeetings - presentCount);
      const percentage = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 0;

      return {
        user: u,
        totalMeetings,
        presentCount,
        missedCount,
        percentage
      };
    })
  );

  return userStats;
};
