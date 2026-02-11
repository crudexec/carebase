import { format, formatDistanceToNow } from "date-fns";

export function formatCurrency(
  amount: number | string,
  currency: string = "NGN"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function formatDate(date: Date | string, formatStr: string = "MMM d, yyyy"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NG").format(num);
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function formatPhone(phone: string): string {
  // Format Nigerian phone numbers
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
