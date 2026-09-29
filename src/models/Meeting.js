import mongoose from 'mongoose';
import { MEETING_STATUS } from '../config/constants.js';

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required (e.g. Lulu Mall)'],
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    radius: {
      type: Number,
      required: [true, 'Allowed radius in meters is required'],
      default: 100,
      min: [5, 'Radius must be at least 5 meters']
    },
    checkInEnabled: {
      type: Boolean,
      default: true
    },

    // Flexible Scheduling Properties
    scheduleType: {
      type: String,
      enum: ['SPECIFIC_DATE', 'EVERYDAY', 'WEEKLY'],
      default: 'SPECIFIC_DATE',
      required: true
    },
    recurringDays: {
      type: [Number],
      default: []
    },
    isTimeWindowOptional: {
      type: Boolean,
      default: false
    },
    // Developer/Admin Testing Mode to allow remote check-ins during testing
    allowRemoteTestCheckIn: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    date: {
      type: Date
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(MEETING_STATUS),
      default: MEETING_STATUS.ACTIVE
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

meetingSchema.index({ location: '2dsphere' });
meetingSchema.index({ date: 1, status: 1 });
meetingSchema.index({ scheduleType: 1, status: 1 });
meetingSchema.index({ createdBy: 1 });

export const Meeting = mongoose.model('Meeting', meetingSchema);
