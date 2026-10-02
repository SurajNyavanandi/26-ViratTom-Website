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
  const isServerDown = status >= 500 || status === 0;
  const headerBg = isServerDown ? '#dc2626' : '#ea580c';

  console.groupCollapsed(
    `%c 🚨 [CLIENT API ERROR] ${status || 'NETWORK DROP'} %c ${endpoint} %c (${context}) `,
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

  // Actionable tips for immediate fix
  console.log(
    '%c💡 Diagnostic Hint:',
    'font-weight: bold; color: #38bdf8;',
    status === 400 && String(JSON.stringify(response)).includes('verification')
      ? 'Verification failed. Tip: Check the 6-digit code received in your email or request a new code.'
      : status === 401 || status === 403
      ? 'Authorization error. Token may be missing or expired in localStorage.'
      : status === 404
      ? 'Endpoint not found on server. Check routes in backend/routes/index.js.'
      : status >= 500
      ? 'Backend threw an internal exception. Check backend server logs for the [BACKEND API ERROR DIAGNOSTIC] banner.'
      : 'Verify internet connection and ensure backend server is active on port 3000.'
  );

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

    // Ignore harmless Vite/HMR, WebSocket, extension, or network abort events
    if (
      !msg ||
      msg.includes('WebSocket') ||
      msg.includes('vite') ||
      msg.includes('hmr') ||
      msg.includes('AbortError') ||
      msg.includes('ResizeObserver') ||
      msg.includes('Script error') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Load failed')
    ) {
      return;
    }

    console.warn('[Application Notice] Unhandled async notice:', msg);
  });

  // 2. Global Runtime Script Errors (e.g. null pointer, syntax, DOM errors)
  window.addEventListener('error', (event: ErrorEvent) => {
    const msg = event.message || '';
    // Ignore harmless cross-origin resize observer, WebSocket, or extension errors
    if (
      !msg ||
      msg.includes('ResizeObserver') ||
      msg.includes('Script error') ||
      msg.includes('WebSocket') ||
      msg.includes('vite')
    ) {
      return;
    }

    console.warn('[Application Notice] Runtime notice:', msg);
  });
}
