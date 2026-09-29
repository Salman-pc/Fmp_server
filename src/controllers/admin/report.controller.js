import * as reportService from '../../services/report.service.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getDashboardSummary();
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceReport = async (req, res, next) => {
  try {
    const data = await reportService.getAttendanceReport(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAttendanceStats = async (req, res, next) => {
  try {
    const stats = await reportService.getUserAttendanceStats();
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};
