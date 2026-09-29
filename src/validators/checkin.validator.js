import { z } from 'zod';

export const submitCheckInSchema = z.object({
  body: z.object({
    meetingId: z.string().min(1, 'Meeting ID is required'),
    latitude: z.number({ required_error: 'Latitude is required' }).min(-90).max(90),
    longitude: z.number({ required_error: 'Longitude is required' }).min(-180).max(180),
    accuracy: z.number({ required_error: 'GPS Accuracy is required' }).min(0, 'Accuracy cannot be negative'),
    userNotes: z.string().max(200).optional()
  })
});
