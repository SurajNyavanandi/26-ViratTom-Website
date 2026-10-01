import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { trackApiFailure } from './errorTracker';

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

const DEFAULT_WHATSAPP_NUMBER = '919666635009';

export function getWhatsAppUrl(customText = 'Hello ViratTom Team, I would like to discuss a project.'): string {
  const encoded = encodeURIComponent(customText);
  return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encoded}`;
}

export function getVerifiedWhatsAppUrl(lead: {
  name: string;
  email?: string;
  phone?: string;
  projectType: string;
  budget?: string | number;
  scope?: string;
}): string {
  let formattedBudget = 'To be discussed';
  if (typeof lead.budget === 'number') {
    formattedBudget = lead.budget > 0 ? `₹${lead.budget.toLocaleString('en-IN')}` : 'To be discussed';
  } else if (typeof lead.budget === 'string' && lead.budget.trim()) {
    formattedBudget = lead.budget.trim();
  }

  const lines = [
    `Hello ViratTom Team! 👋`,
    `I would like to discuss a project with you:`,
    `• Name: ${lead.name || 'Client'}`,
  ];
  if (lead.phone && lead.phone.trim()) {
    lines.push(`• Phone: ${lead.phone.trim()}`);
  }
  if (lead.email && lead.email.trim()) {
    lines.push(`• Email: ${lead.email.trim()}`);
  }
  lines.push(`• Project Type: ${lead.projectType}`);
  lines.push(`• Estimated Budget: ${formattedBudget}`);
  if (lead.scope && lead.scope.trim()) {
    lines.push(`• Details: ${lead.scope.trim()}`);
  }
  lines.push(``);
  lines.push(`Can we discuss the timeline and pricing?`);

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encoded}`;
}

export function triggerWhatsAppGate(noticeMessage = 'Please submit your project details first for instant WhatsApp routing.') {
  const contactEl = document.getElementById('contact');
  if (contactEl) {
    contactEl.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('whatsapp-gate-triggered', { detail: { message: noticeMessage } }));
  }
}

export const PROJECT_MIN_PRICES: Record<string, number> = {
  'Static Website': 4999,
  'Dynamic Website': 9999,
  'Online Store': 14999,
  'Online Store (E-Commerce)': 14999,
  'Mobile App': 25999,
  'Website + Mobile App': 32999,
};

export function getMinPrice(type: string): number {
  return PROJECT_MIN_PRICES[type] || 4999;
}

export function getApiBaseUrl(): string {
  const env = import.meta.env as Record<string, any>;
  const customUrl = (env.BACKEND_API_URL || env.VITE_API_URL || '').trim();
  return customUrl.replace(/\/+$/, '');
}

export function apiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number; context?: string }
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const timeoutMs = init?.timeoutMs ?? 15000; // Default 15s client timeout
  const context = init?.context;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = performance.now();
  const inputStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());

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
    const durationMs = Math.round(performance.now() - startTime);

    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      let errMessage = `Request failed with status ${res.status}`;
      let errData: any = null;
      if (contentType.includes('application/json')) {
        try {
          errData = await res.json();
          errMessage = errData.error || errData.message || errMessage;
        } catch {
          // ignore parsing error
        }
      }

      // Track failed API call in browser console
      trackApiFailure({
        endpoint: inputStr,
        status: res.status,
        response: errData,
        error: errMessage,
        context: context || `${init?.method || 'GET'} ${inputStr}`,
        durationMs,
      });

      return { ok: false, status: res.status, data: null, error: errMessage };
    }

    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: true, status: res.status, data };
    }

    const duration = Math.round(performance.now() - startTime);
    trackApiFailure({
      endpoint: inputStr,
      status: res.status,
      error: 'Unexpected non-JSON response from server',
      context: context || `${init?.method || 'GET'} ${inputStr}`,
      durationMs: duration,
    });

    return {
      ok: false,
      status: res.status,
      data: null,
      error: 'Unexpected non-JSON response from server',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const durationMs = Math.round(performance.now() - startTime);
    const isTimeout = err?.name === 'AbortError';
    const errMessage = isTimeout ? 'Request timed out. Please try again.' : (err?.message || 'Network request failed');

    trackApiFailure({
      endpoint: inputStr,
      status: 0,
      error: errMessage,
      context: context || `${init?.method || 'GET'} ${inputStr}`,
      durationMs,
    });

    return {
      ok: false,
      status: 0,
      data: null,
      error: errMessage,
    };
  }
}
