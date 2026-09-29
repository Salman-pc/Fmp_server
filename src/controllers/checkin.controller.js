import * as checkInService from '../services/checkin.service.js';

export const submitCheckIn = async (req, res, next) => {
  try {
    const { meetingId, latitude, longitude, accuracy, userNotes } = req.body;
    const userAgent = req.headers['user-agent'];

    const result = await checkInService.processUserCheckIn({
      userId: req.user._id,
      meetingId,
      latitude,
      longitude,
      accuracy,
      userNotes,
      userAgent
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        code: result.rejectionReason,
        data: result
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCheckIns = async (req, res, next) => {
  try {
    const data = await checkInService.getUserCheckInHistory(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getCheckInStatus = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const result = await checkInService.getMeetingCheckInStatusForUser(req.user._id, meetingId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const resetCheckIn = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const result = await checkInService.resetUserCheckInForMeeting(req.user._id, meetingId);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};
