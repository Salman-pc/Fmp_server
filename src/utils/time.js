/**
 * Parses a date string (YYYY-MM-DD) and time string (HH:MM) in a given timezone into a JavaScript Date object (UTC).
 */
export const parseDateTimeInTimezone = (dateStr, timeStr, timezone = 'Asia/Kolkata') => {
  const dateFormatted = typeof dateStr === 'string' ? dateStr.split('T')[0] : new Date(dateStr).toISOString().split('T')[0];
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const pad = (n) => String(n).padStart(2, '0');
  const targetLocalStr = `${dateFormatted}T${pad(hours)}:${pad(minutes)}:00`;

  const now = new Date();
  const options = { timeZone: timezone, timeZoneName: 'longOffset' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
  const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value;

  let offsetMinutes = 0;
  if (tzPart) {
    const match = tzPart.match(/GMT([+-]\d{2}):?(\d{2})?/);
    if (match) {
      const sign = match[1][0] === '+' ? 1 : -1;
      const h = parseInt(match[1].slice(1), 10);
      const m = match[2] ? parseInt(match[2], 10) : 0;
      offsetMinutes = sign * (h * 60 + m);
    }
  }

  const naiveDate = new Date(`${targetLocalStr}Z`);
  const utcTimestamp = naiveDate.getTime() - offsetMinutes * 60 * 1000;
  return new Date(utcTimestamp);
};

/**
 * Gets day of week (0 = Sun, 1 = Mon, ..., 6 = Sat) and current YYYY-MM-DD in given timezone.
 */
export const getCurrentDatePartsInTimezone = (currentTime = new Date(), timezone = 'Asia/Kolkata') => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });
  
  const parts = formatter.formatToParts(currentTime);
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });

  const year = map.year;
  const month = map.month;
  const day = map.day;
  const dateStr = `${year}-${month}-${day}`;

  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[map.weekday] ?? currentTime.getDay();

  return { dateStr, dayOfWeek };
};

/**
 * Validates whether current server time is within the meeting check-in window and schedule rules.
 */
export const validateCheckInTimeWindow = (meeting, currentTime = new Date()) => {
  const timezone = meeting.timezone || 'Asia/Kolkata';
  const { dateStr, dayOfWeek } = getCurrentDatePartsInTimezone(currentTime, timezone);

  // 1. Day / Frequency schedule validation
  const scheduleType = meeting.scheduleType || 'SPECIFIC_DATE';

  if (scheduleType === 'WEEKLY') {
    const allowedDays = meeting.recurringDays || [];
    if (!allowedDays.includes(dayOfWeek)) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const allowedDayNames = allowedDays.map((d) => dayNames[d]).join(', ');
      return {
        isValid: false,
        reason: 'NOT_SCHEDULED_DAY',
        message: `Today is not a scheduled check-in day. Allowed days: ${allowedDayNames || 'None'}.`
      };
    }
  } else if (scheduleType === 'SPECIFIC_DATE') {
    if (meeting.date) {
      const meetingDateFormatted = typeof meeting.date === 'string'
        ? meeting.date.split('T')[0]
        : new Date(meeting.date).toISOString().split('T')[0];

      if (dateStr !== meetingDateFormatted) {
        return {
          isValid: false,
          reason: 'NOT_SCHEDULED_DAY',
          message: `Check-in is only scheduled for ${meetingDateFormatted} (${timezone}).`
        };
      }
    }
  }
  // EVERYDAY needs no day restriction check

  // 2. Check-in time window optionality check
  if (meeting.isTimeWindowOptional || !meeting.startTime || !meeting.endTime) {
    return {
      isValid: true,
      isTimeWindowOptional: true,
      message: 'Check-in is open anytime today without time restrictions.'
    };
  }

  // 3. Time Window Validation
  const windowStart = parseDateTimeInTimezone(dateStr, meeting.startTime, timezone);
  const windowEnd = parseDateTimeInTimezone(dateStr, meeting.endTime, timezone);

  const currentMs = currentTime.getTime();
  const startMs = windowStart.getTime();
  const endMs = windowEnd.getTime();

  if (currentMs < startMs) {
    return {
      isValid: false,
      reason: 'BEFORE_WINDOW',
      message: `Check-in has not started yet. Window opens at ${meeting.startTime} (${timezone}).`,
      windowStart,
      windowEnd
    };
  }

  if (currentMs > endMs) {
    return {
      isValid: false,
      reason: 'EXPIRED_WINDOW',
      message: `Check-in window has expired. Window closed at ${meeting.endTime} (${timezone}).`,
      windowStart,
      windowEnd
    };
  }

  return {
    isValid: true,
    message: 'Check-in window is active.',
    windowStart,
    windowEnd
  };
};
