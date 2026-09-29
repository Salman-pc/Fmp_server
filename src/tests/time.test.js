import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCheckInTimeWindow, parseDateTimeInTimezone } from '../utils/time.js';

test('Time Utility - parseDateTimeInTimezone', () => {
  const dateStr = '2026-09-27';
  const timeStr = '18:00';
  const tz = 'Asia/Kolkata';

  const parsed = parseDateTimeInTimezone(dateStr, timeStr, tz);
  assert.ok(parsed instanceof Date);
  assert.equal(isNaN(parsed.getTime()), false);
});

test('Time Utility - SPECIFIC_DATE inside window', () => {
  const meeting = {
    scheduleType: 'SPECIFIC_DATE',
    date: '2026-09-27',
    startTime: '18:00',
    endTime: '18:30',
    timezone: 'Asia/Kolkata',
    isTimeWindowOptional: false
  };

  const testCurrentTime = parseDateTimeInTimezone('2026-09-27', '18:15', 'Asia/Kolkata');
  const result = validateCheckInTimeWindow(meeting, testCurrentTime);

  assert.equal(result.isValid, true);
});

test('Time Utility - Optional Time Window allows anytime', () => {
  const meeting = {
    scheduleType: 'EVERYDAY',
    isTimeWindowOptional: true,
    timezone: 'Asia/Kolkata'
  };

  const testCurrentTime = parseDateTimeInTimezone('2026-09-27', '23:59', 'Asia/Kolkata');
  const result = validateCheckInTimeWindow(meeting, testCurrentTime);

  assert.equal(result.isValid, true);
  assert.equal(result.isTimeWindowOptional, true);
});

test('Time Utility - WEEKLY allowed day', () => {
  // 2026-09-27 is Sunday (0)
  const meeting = {
    scheduleType: 'WEEKLY',
    recurringDays: [0, 6], // Sunday & Saturday
    isTimeWindowOptional: true,
    timezone: 'Asia/Kolkata'
  };

  const testCurrentTime = parseDateTimeInTimezone('2026-09-27', '12:00', 'Asia/Kolkata');
  const result = validateCheckInTimeWindow(meeting, testCurrentTime);

  assert.equal(result.isValid, true);
});

test('Time Utility - WEEKLY non-scheduled day rejected', () => {
  // 2026-09-27 is Sunday (0). Recurring days only Monday (1) & Wednesday (3)
  const meeting = {
    scheduleType: 'WEEKLY',
    recurringDays: [1, 3],
    isTimeWindowOptional: true,
    timezone: 'Asia/Kolkata'
  };

  const testCurrentTime = parseDateTimeInTimezone('2026-09-27', '12:00', 'Asia/Kolkata');
  const result = validateCheckInTimeWindow(meeting, testCurrentTime);

  assert.equal(result.isValid, false);
  assert.equal(result.reason, 'NOT_SCHEDULED_DAY');
});

test('Time Utility - EVERYDAY schedule with time window expired', () => {
  const meeting = {
    scheduleType: 'EVERYDAY',
    startTime: '09:00',
    endTime: '10:00',
    isTimeWindowOptional: false,
    timezone: 'Asia/Kolkata'
  };

  const testCurrentTime = parseDateTimeInTimezone('2026-09-27', '11:00', 'Asia/Kolkata');
  const result = validateCheckInTimeWindow(meeting, testCurrentTime);

  assert.equal(result.isValid, false);
  assert.equal(result.reason, 'EXPIRED_WINDOW');
});
