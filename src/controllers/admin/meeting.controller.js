import * as meetingService from '../../services/meeting.service.js';

export const createMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.createMeeting(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.updateMeeting(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeeting = async (req, res, next) => {
  try {
    const result = await meetingService.deleteMeeting(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCheckInPermission = async (req, res, next) => {
  try {
    const { checkInEnabled } = req.body;
    const meeting = await meetingService.toggleCheckInPermission(req.params.id, checkInEnabled);
    res.status(200).json({
      success: true,
      message: `Check-in permission ${meeting.checkInEnabled ? 'enabled' : 'disabled'} for meeting.`,
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const getPresentUsers = async (req, res, next) => {
  try {
    const result = await meetingService.getPresentUsersForMeeting(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
