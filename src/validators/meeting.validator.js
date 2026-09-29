import { z } from 'zod';
import { MEETING_STATUS } from '../config/constants.js';

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    description: z.string().max(1000).optional(),
    locationName: z.string().min(2, 'Location name is required'),
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    radius: z.number().min(5, 'Radius must be at least 5 meters').default(100),
    checkInEnabled: z.boolean().default(true),

    scheduleType: z.enum(['SPECIFIC_DATE', 'EVERYDAY', 'WEEKLY']).default('SPECIFIC_DATE'),
    recurringDays: z.array(z.number().min(0).max(6)).optional().default([]),
    isTimeWindowOptional: z.boolean().default(false),
    allowRemoteTestCheckIn: z.boolean().default(false),

    startTime: z.string().optional(),
    endTime: z.string().optional(),
    date: z.string().optional(),
    timezone: z.string().default('Asia/Kolkata')
  })
});

export const updateMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().max(1000).optional(),
    locationName: z.string().min(2).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radius: z.number().min(5).optional(),
    checkInEnabled: z.boolean().optional(),

    scheduleType: z.enum(['SPECIFIC_DATE', 'EVERYDAY', 'WEEKLY']).optional(),
    recurringDays: z.array(z.number().min(0).max(6)).optional(),
    isTimeWindowOptional: z.boolean().optional(),
    allowRemoteTestCheckIn: z.boolean().optional(),

    startTime: z.string().optional(),
    endTime: z.string().optional(),
    date: z.string().optional(),
    timezone: z.string().optional(),
    status: z.enum(Object.values(MEETING_STATUS)).optional()
  })
});
