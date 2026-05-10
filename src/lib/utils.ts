import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(number: number) {
  if (Math.abs(number) >= 1e9) {
    return (number / 1e9).toFixed(2) + " tỷ";
  }
  if (Math.abs(number) >= 1e6) {
    return (number / 1e6).toFixed(1) + " tr";
  }
  return new Intl.NumberFormat("vi-VN").format(number);
}

export function formatBillion(amount: number) {
  return (amount / 1e9).toFixed(2) + "B";
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}
