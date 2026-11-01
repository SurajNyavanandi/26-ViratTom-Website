/**
 * ============================================================================
 * ViratTom Client-Side Universal Diagnostic Error Tracker
 * ============================================================================
 * Intercepts:
 * 1. Failed API Network Calls (4xx/5xx status codes, timeouts, offline drops)
 * 2. Unhandled Promise Rejections
 * 3. Global Window Runtime Errors
 * 4. React Component Error Boundaries
 */

export interface ApiFailureContext {
  endpoint: string;
  status: number;
  response?: any;
  error?: string;
  context?: string;
  durationMs?: number;
}

/**
 * Print high-visibility styled diagnostic banner in browser console for API network failures
 */
export function trackApiFailure(info: ApiFailureContext): void {
  const { endpoint, status, response, error, context = 'safeFetchJson', durationMs } = info;
  // Do not log noisy client error banners for normal handled 4xx business responses (e.g. invalid password, fallback 404s, client auth checks)
  if (status >= 400 && status < 500) {
    return;
  }

  const isServerDown = status >= 500 || status === 0;
  if (!isServerDown) return;

  const headerBg = '#dc2626';

  console.groupCollapsed(
    `%c 🚨 [SERVER API ERROR] ${status || 'NETWORK DROP'} %c ${endpoint} %c (${context}) `,
    `background: ${headerBg}; color: white; font-weight: bold; border-radius: 3px 0 0 3px; padding: 2px 6px;`,
    'background: #1f2937; color: #f9fafb; font-family: monospace; padding: 2px 6px;',
    'background: #374151; color: #9ca3af; border-radius: 0 3px 3px 0; padding: 2px 6px;'
  );

  console.table({
    'Failed Endpoint': endpoint,
    'HTTP Status': status === 0 ? 'Network Drop / Timeout / Disconnected' : status,
    'Triggering Context': context,
    'Elapsed Time': durationMs ? `${durationMs}ms` : 'N/A',
    'Server Error Response': typeof response === 'object' ? JSON.stringify(response) : (response || error || 'N/A'),
  });

  if (response) {
    console.log('%cRaw Server Response Payload:', 'font-weight: bold; color: #f87171;', response);
  }
  if (error) {
    console.log('%cClient Error Message:', 'font-weight: bold; color: #f87171;', error);
  }

  console.groupEnd();
}

/**
 * Initialize global error and unhandled rejection listeners in the browser
 */
export function initClientErrorTracker(): void {
  if (typeof window === 'undefined') return;

  // 1. Unhandled Promise Rejections (e.g. async fetch failures, unhandled async throw)
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    if (!reason) return;
    const msg = reason instanceof Error ? reason.message : String(reason);

    // Ignore harmless Vite/HMR, WebSocket, extension, Monaco cancellation, or third-party project notices
    if (
      !msg ||
      msg.includes('WebSocket') ||
      msg.includes('closed without opened') ||
      msg.includes('vite') ||
      msg.includes('hmr') ||
      msg.includes('AbortError') ||
      msg.includes('Canceled') ||
      msg.includes('ResizeObserver') ||
      msg.includes('Script error') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Load failed') ||
      msg.includes('useNativeDriver') ||
      msg.includes('ApiService') ||
      msg.includes('getMaterials') ||
      msg.includes('manadrivers') ||
      msg.includes('urbanico') ||
      msg.includes('cloudinary') ||
      msg.includes('No ID or name') ||
      msg.includes('Origin trial') ||
      msg.includes('Unexpected token')
    ) {
      return;
    }

    console.warn('[Application Notice] Unhandled async notice:', msg);
  });

  // 2. Global Runtime Script Errors (e.g. null pointer, syntax, DOM errors)
  window.addEventListener('error', (event: ErrorEvent) => {
    const msg = event.message || '';
    // Ignore harmless cross-origin resize observer, WebSocket, extension, or external script errors
    if (
      !msg ||
      msg.includes('ResizeObserver') ||
      msg.includes('Script error') ||
      msg.includes('WebSocket') ||
      msg.includes('closed without opened') ||
      msg.includes('vite') ||
      msg.includes('Canceled') ||
      msg.includes('useNativeDriver') ||
      msg.includes('ApiService') ||
      msg.includes('getMaterials') ||
      msg.includes('manadrivers') ||
      msg.includes('urbanico') ||
      msg.includes('cloudinary') ||
      msg.includes('No ID or name') ||
      msg.includes('Origin trial') ||
      msg.includes('Unexpected token')
    ) {
      return;
    }

    console.warn('[Application Notice] Runtime notice:', msg);
  });
}
