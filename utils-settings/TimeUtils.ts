import { AvailabilityHours } from '@/app/models/onboarding/rooftop-onboarding';

export interface TimeValue {
  hour: string;
  minute: string;
  period: string;
}

export interface TimeSlot {
  from: string;
  to: string;
}

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  timeSlot: TimeSlot;
}

export const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export class TimeUtils {
  static getHHMMSSFormattedTime(
    timeInMilliseconds: number,
    showHoursIfZero: boolean = true,
    showMinutesIfZero: boolean = true,
    showSeconds = true
  ) {
    const timeInSeconds = timeInMilliseconds / 1000;
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    let formattedTime = '';

    const addWithColon = (value: string) => {
      if (formattedTime) formattedTime += ':';
      formattedTime += value;
    };

    if (showHoursIfZero || hours > 0) {
      formattedTime += `${hours.toString().padStart(2, '0')}`;
    }

    if (showMinutesIfZero || minutes > 0) {
      addWithColon(minutes.toString().padStart(2, '0'));
    }

    if (showSeconds) {
      addWithColon(seconds.toString().padStart(2, '0'));
    }

    return formattedTime;
  }

  static formatDateToLongFormat(
    date: Date | string,
    trimMonth: boolean = false
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return date.toString();
    }

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = dateObj.getDate();
    let month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    if (trimMonth) {
      month = month.slice(0, 3) + '‘';
    }

    return `${day} ${month} ${year}`;
  }
  static convertTo12HourFormat(time24: string): TimeValue {
    if (!time24) {
      return {
        hour: '12',
        minute: '00',
        period: 'AM',
      };
    }

    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const result = {
      hour: hour12.toString().padStart(2, '0'),
      minute: minutes || '00',
      period,
    };
    return result;
  }

  static convertTo24HourFormat(timeValue: TimeValue): string {
    let hour = parseInt(timeValue.hour);
    if (timeValue.period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (timeValue.period === 'AM' && hour === 12) {
      hour = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${timeValue.minute}`;
  }

  // Helper function to convert 12-hour time string to 24-hour format string
  static convertTo24HourString(time12h: string): string {
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (period === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  // Helper function to convert 24-hour time string to 12-hour format string
  static convertTo12HourString(time24h: string): string {
    const [hours, minutes] = time24h.split(':');
    const hour = Number(hours);

    if (hour === 0) {
      return `12:${minutes} AM`;
    } else if (hour < 12) {
      return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hour - 12}:${minutes} PM`;
    }
  }

  // Utility function to convert TimeValue to minutes for comparison
  static timeToMinutes(time: TimeValue): number {
    const hour24 =
      time.period === 'AM'
        ? time.hour === '12'
          ? 0
          : parseInt(time.hour)
        : time.hour === '12'
          ? 12
          : parseInt(time.hour) + 12;
    return hour24 * 60 + parseInt(time.minute);
  }

  // Utility function to validate time range
  static isValidTimeRange(startTime: TimeValue, endTime: TimeValue): boolean {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    return startMinutes < endMinutes;
  }

  // Utility function to get time validation error message
  static getTimeValidationError(
    startTime: TimeValue,
    endTime: TimeValue
  ): string | null {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (startMinutes === endMinutes) {
      return 'Start time and end time cannot be the same';
    } else if (startMinutes >= endMinutes) {
      return 'Start time must be before end time';
    }

    return null;
  }
  static getTimeSince = (
    dateInput: string | Date | null | undefined
  ): string => {
    if (!dateInput) {
      return 'Unknown';
    }

    const date = new Date(dateInput);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();

    // Handle future dates
    if (diffInMs < 0) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes === 0) {
      return 'Just now';
    } else if (diffInMinutes <= 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours <= 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  static formatDateHeader(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // For other dates, return a formatted date
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleDateString('en-US', options);
  }

  static formatDateShort(
    dateString: string,
    showYear: boolean = true,
    useOrdinal: boolean = false
  ): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (useOrdinal) {
      const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      };

      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = showYear ? ` ${date.getFullYear()}` : '';

      return `${day}${getOrdinalSuffix(day)} ${month}${year}`;
    }

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: showYear ? 'numeric' : undefined,
    });
  }

  static formatTime12h(dateInput: string | Date): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  static formatDateWithOrdinalAndTime(
    dateInput: string | Date | null | undefined
  ): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = TimeUtils.formatTime12h(date);

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}, ${time}`;
  }

  static formatAppointmentDate(
    dateString: string | Date | null | undefined
  ): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return `${date.getDate()} ${months[date.getMonth()]}, ${date.toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    )}`;
  }

  // Helper function to convert from DaySchedule[] to AvailabilityHours
  static convertToAvailabilityHours(
    schedule: DaySchedule[]
  ): AvailabilityHours {
    const result: any = {};
    schedule.forEach((day) => {
      const dayKey = day.day.toLowerCase();
      // Convert from "09:00 AM" format to "09:00" 24-hour format
      const startTime = TimeUtils.convertTo24HourString(day.timeSlot.from);
      const endTime = TimeUtils.convertTo24HourString(day.timeSlot.to);

      result[dayKey] = {
        isAvailable: day.isOpen,
        startTime,
        endTime,
      };
    });
    return result as AvailabilityHours;
  }

  // Helper function to convert from AvailabilityHours to DaySchedule[]
  static convertToDaySchedule(hours: AvailabilityHours): DaySchedule[] {
    return weekDays.map((day) => {
      const dayKey = day.toLowerCase();
      const dayData = hours[dayKey as keyof AvailabilityHours] as any;

      return {
        day,
        isOpen: dayData?.isAvailable ?? false,
        timeSlot: {
          from: TimeUtils.convertTo12HourString(dayData?.startTime ?? '09:00'),
          to: TimeUtils.convertTo12HourString(dayData?.endTime ?? '17:00'),
        },
      };
    });
  }
}
