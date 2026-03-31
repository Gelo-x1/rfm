/**
 * RFM Nexus - Main Application Component
 * 
 * Advanced Customer Intelligence Platform with:
 * - Dark/Light theme support
 * - File upload and RFM analysis
 * - 3D visualizations
 * - Enhanced recommendations
 * - Clean architecture with TypeScript
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/sections/Header';
import { UploadSection } from '@/sections/UploadSection';
import { MetricsSection } from '@/sections/MetricsSection';
import { ChartsSection } from '@/sections/ChartsSection';
import { RecommendationsSection } from '@/sections/RecommendationsSection';
import { SegmentsSection } from '@/sections/SegmentsSection';
import { FooterSection } from '@/sections/FooterSection';
import { uploadFile, APIError, checkApiHealth } from '@/services/api';
import { mockUploadFile } from '@/services/mockApi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { RFMResponse, LoadingState } from '@/types';

/**
 * Skip Link Component for Accessibility
 */
function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}

/**
 * Loading Overlay Component
 */
function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="glass-card p-8 flex flex-col items-center gap-4">
        <div className="tech-loader" />
        <p className="text-lg font-semibold">Analyzing your data...</p>
        <p className="text-sm text-muted-foreground">
          This may take a few moments
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Demo Mode Alert
 */
function DemoModeAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 pt-4"
    >
      <Alert className="glass-card border-amber-500/50 bg-amber-500/10">
        <Info className="w-5 h-5 text-amber-500" />
        <AlertTitle className="text-amber-500">Demo Mode Active</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            The backend server is not running. The app is using simulated data for demonstration.
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            To use real RFM analysis, run the Flask backend locally:
          </p>
          <code className="block p-3 bg-black/30 rounded-lg text-xs font-mono mb-3">
            cd api && pip install -r requirements.txt && python app.py
          </code>
          <Button onClick={onDismiss} variant="outline" size="sm" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

/**
 * Error Display Component
 */
function ErrorDisplay({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Alert variant="destructive" className="glass-card border-red-500/50">
        <AlertCircle className="w-5 h-5" />
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

/**
 * Main Application Content
 */
function AppContent() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RFMResponse | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoAlert, setShowDemoAlert] = useState(false);

  /**
   * Handle file upload and analysis
   */
  const handleFileSelect = useCallback(async (file: File) => {
    setLoadingState('loading');
    setError(null);
    setUploadProgress(0);

    try {
      // First, check if backend is available
      const isBackendAvailable = await checkApiHealth();
      
      let data: RFMResponse;
      
      if (isBackendAvailable) {
        // Use real API
        data = await uploadFile(file, setUploadProgress);
        setIsDemoMode(false);
      } else {
        // Use mock API for demo
        console.log('Backend not available, using mock data');
        data = await mockUploadFile(file, setUploadProgress);
        setIsDemoMode(true);
        setShowDemoAlert(true);
      }
      
      if (data.success) {
        setResults(data);
        setLoadingState('success');
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('main-content')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      // If real API fails, try mock API as fallback
      try {
        console.log('Falling back to mock API');
        const mockData = await mockUploadFile(file, setUploadProgress);
        setResults(mockData);
        setIsDemoMode(true);
        setShowDemoAlert(true);
        setLoadingState('success');
        
        setTimeout(() => {
          document.getElementById('main-content')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
        return;
      } catch {
        // Mock also failed, show error
        if (err instanceof APIError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        setLoadingState('error');
      }
    }
  }, []);

  /**
   * Reset and retry
   */
  const handleRetry = useCallback(() => {
    setLoadingState('idle');
    setError(null);
    setResults(null);
    setUploadProgress(0);
    setIsDemoMode(false);
    setShowDemoAlert(false);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern">
      <SkipLink />
      
      <Header />

      <main id="main-content" role="main">
        {/* Demo Mode Alert */}
        <AnimatePresence>
          {showDemoAlert && (
            <DemoModeAlert onDismiss={() => setShowDemoAlert(false)} />
          )}
        </AnimatePresence>

        {/* Upload Section - Always visible */}
        <UploadSection 
          onFileSelect={handleFileSelect}
          isLoading={loadingState === 'loading'}
          uploadProgress={uploadProgress}
        />

        {/* Loading Overlay */}
        <AnimatePresence>
          {loadingState === 'loading' && <LoadingOverlay />}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {loadingState === 'error' && error && (
            <ErrorDisplay error={error} onRetry={handleRetry} />
          )}
        </AnimatePresence>

        {/* Results Sections */}
        <AnimatePresence>
          {loadingState === 'success' && results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Analysis Overview */}
              <MetricsSection data={results} />

              {/* Visual Insights */}
              {isDemoMode ? (
                <section className="container mx-auto px-4 py-8">
                  <div className="glass-card p-6 text-center">
                    <Info className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                    <h3 className="text-xl font-bold mb-2">Charts Not Available in Demo Mode</h3>
                    <p className="text-muted-foreground mb-4">
                      2D charts are generated by the Python backend. Run the Flask server locally to see actual charts.
                    </p>
                    <code className="inline-block p-3 bg-black/30 rounded-lg text-xs font-mono">
                      cd api && python app.py
                    </code>
                  </div>
                </section>
              ) : (
                <ChartsSection data={results} />
              )}

              {/* Strategic Recommendations */}
              <RecommendationsSection data={results} />

              {/* Customer Segments */}
              <SegmentsSection data={results} />

              {/* Footer & Downloads */}
              <FooterSection data={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/**
 * Root Application Component
 */
function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
