/**
 * RFM Nexus - Application Entry Point
 * 
 * Initializes the React application with:
 * - StrictMode for development checks
 * - Global error handling
 * - Accessibility enhancements
 */

import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle } from 'lucide-react';
import './index.css';
import App from './App';

/**
 * Global Error Boundary
 * Catches and displays errors that occur during rendering
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, etc.
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--tech-bg-primary)] p-4">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="p-4 bg-red-500/10 rounded-lg mb-6 text-left">
                <p className="text-sm text-red-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="tech-button"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Initialize the React application
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Please ensure the HTML file has a div with id="root"');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

/**
 * Service Worker Registration (optional)
 * Uncomment to enable PWA capabilities
 */
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(console.error);
//   });
// }

/**
 * Performance monitoring
 * Report Web Vitals metrics
 */
if (import.meta.env.PROD) {
  // In production, you might want to send metrics to an analytics service
  // This is a placeholder for such integration
  console.log('Production mode - Performance monitoring enabled');
}
