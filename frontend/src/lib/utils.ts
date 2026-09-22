import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function getWhatsAppUrl(customText = 'Hello ViratTom Team, I would like to discuss a project.'): string {
  const rawWaNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(customText);
  return rawWaNumber ? `https://wa.me/${rawWaNumber}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export const PROJECT_MIN_PRICES: Record<string, number> = {
  'Static Website': 4999,
  'Dynamic Website': 14999,
  'Online Store': 25999,
  'Online Store (E-Commerce)': 25999,
  'Mobile App': 39000,
  'Website + Mobile App': 49000,
};

export function getMinPrice(type: string): number {
  return PROJECT_MIN_PRICES[type] || 4999;
}
