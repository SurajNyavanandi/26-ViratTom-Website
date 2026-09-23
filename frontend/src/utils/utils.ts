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

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      let errMessage = `Request failed with status ${res.status}`;
      if (contentType.includes('application/json')) {
        try {
          const errData = await res.json();
          errMessage = errData.error || errData.message || errMessage;
        } catch {
          // ignore parsing error
        }
      }
      return { ok: false, status: res.status, data: null, error: errMessage };
    }

    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: true, status: res.status, data };
    }

    return {
      ok: false,
      status: res.status,
      data: null,
      error: 'Unexpected non-JSON response from server',
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || 'Network request failed',
    };
  }
}
