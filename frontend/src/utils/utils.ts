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

export function getApiBaseUrl(): string {
  const customUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim();
  return customUrl.replace(/\/+$/, '');
}

export function apiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number }
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const timeoutMs = init?.timeoutMs ?? 15000; // Default 15s client timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let resolvedInput = input;
    if (typeof input === 'string') {
      resolvedInput = apiUrl(input);
    }

    const res = await fetch(resolvedInput, {
      ...init,
      signal: init?.signal || controller.signal,
    });
    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      data: null,
      error: isTimeout ? 'Request timed out. Please try again.' : (err?.message || 'Network request failed'),
    };
  }
}
