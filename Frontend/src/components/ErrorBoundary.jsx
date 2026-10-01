import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary p-4">
          <div
            className="card border-0 shadow-lg rounded-4 p-4 p-md-5 text-center"
            style={{ maxWidth: 540, width: '100%' }}
          >
            <div className="mb-3">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center bg-danger-subtle text-danger"
                style={{ width: 64, height: 64 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h4 className="fw-bold mb-2 text-body-emphasis">Something went wrong</h4>
            <p className="text-secondary small mb-4">
              {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
            </p>
            <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-outline-secondary px-3 py-2 fw-semibold"
              >
                Reload Page
              </button>
              <Link
                to="/"
                onClick={this.handleReset}
                className="btn btn-primary px-4 py-2 fw-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
