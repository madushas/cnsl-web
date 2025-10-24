"use client"

import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, route to your logger here
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', { error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            <button
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
