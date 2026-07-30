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
          <div className="glass-card p-8 max-w-md text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
            <p className="text-slate-400 text-sm">{this.state.message}</p>
            <button
              className="btn-gradient"
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
