import { format, parseISO, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';

export function formatDate(dateString: string, formatStr: string = 'PPP'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'PPP p');
  } catch {
    return dateString;
  }
}

export function formatShiftTime(startTime: string, endTime: string): string {
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  } catch {
    return `${startTime} - ${endTime}`;
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return 'Today';
    }
    if (isTomorrow(date)) {
      return 'Tomorrow';
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }

    return format(date, 'EEE, MMM d');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function getShiftDateLabel(startTime: string): string {
  try {
    const date = parseISO(startTime);

    if (isToday(date)) {
      return 'Today';
    }
    if (isTomorrow(date)) {
      return 'Tomorrow';
    }

    return format(date, 'EEEE, MMMM d');
  } catch {
    return startTime;
  }
}
