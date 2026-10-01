import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group(
      `%c 🚨 [REACT COMPONENT ERROR] %c ${error.message} `,
      'background: #dc2626; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'background: #1f2937; color: #fca5a5; font-family: monospace; padding: 2px 6px;'
    );
    console.error('Error Object:', error);
    console.log('%cComponent Stack:\n', 'color: #9ca3af; font-family: monospace;', errorInfo.componentStack);
    console.groupEnd();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-apple-gray-50 text-apple-black">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-apple-gray-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-apple-gray-500 mb-6">
              A UI rendering error occurred. Detailed diagnostic info has been logged to the browser console.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-apple-black text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
