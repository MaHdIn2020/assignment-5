"use client";

// Global Error Boundary — catches uncaught React errors in the subtree.
// This is a Class Component because React error boundaries must use lifecycle
// methods (componentDidCatch) which are not yet available as hooks.

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console — in production you'd send this to a monitoring service
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="card-elevated p-8 max-w-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
            <p className="text-slate-400 text-sm">{this.state.message}</p>
            <button
              className="btn-primary"
              onClick={() => this.setState({ hasError: false, message: "" })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
