import * as meetingService from '../services/meeting.service.js';

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

export const getMeetings = async (req, res, next) => {
  try {
    const data = await meetingService.getMeetingsPaginated(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id);
    res.status(200).json({
      success: true,
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentActiveMeeting = async (req, res, next) => {
  try {
    const meeting = await meetingService.getCurrentActiveMeeting();
    res.status(200).json({
      success: true,
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
