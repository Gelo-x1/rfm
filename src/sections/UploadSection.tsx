/**
 * Upload Section Component
 * 
 * File upload area with:
 * - Drag and drop support
 * - File validation
 * - Progress indicator
 * - Error handling
 * - Accessibility features
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateFile } from '@/services/api';
import { formatBytes } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  uploadProgress: number;
}

export function UploadSection({ onFileSelect, isLoading, uploadProgress }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback((file: File) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <section 
      className="container mx-auto px-4 py-8"
      aria-labelledby="upload-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: Upload Area */}
          <div className="flex-1 w-full">
            <h2 
              id="upload-heading"
              className="text-2xl font-bold mb-2"
            >
              Customer Intelligence Dashboard
            </h2>
            <p className="text-muted-foreground mb-6">
              Upload your transaction data to unlock advanced segmentation, predictive insights, and personalized marketing strategies.
            </p>

            {/* Drop Zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="File upload area. Drop a CSV file or click to browse."
              onClick={openFileDialog}
              onKeyDown={(e) => e.key === 'Enter' && openFileDialog()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                transition-all duration-300 focus-ring
                ${isDragging 
                  ? 'border-[var(--tech-accent-cyan)] bg-[var(--tech-accent-cyan)]/10' 
                  : 'border-[var(--tech-border)] hover:border-[var(--tech-accent)] hover:bg-[var(--tech-hover-bg)]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                aria-hidden="true"
              />

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="tech-loader mx-auto" />
                    <p className="text-muted-foreground">Analyzing your data...</p>
                    <Progress 
                      value={uploadProgress} 
                      className="w-full max-w-xs mx-auto"
                    />
                    <p className="text-sm text-muted-foreground">
                      {uploadProgress}%
                    </p>
                  </motion.div>
                ) : selectedFile ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <CheckCircle className="w-8 h-8 text-[var(--tech-accent-green)]" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                      style={{ background: 'var(--tech-hover-bg)' }}
                    >
                      <Upload 
                        className="w-8 h-8"
                        style={{ color: 'var(--tech-accent-cyan)' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium mb-1">
                        Drop your CSV file here, or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Maximum file size: 100MB
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Data Requirements */}
          <motion.div 
            className="lg:w-80 w-full glass-card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText 
                className="w-5 h-5"
                style={{ color: 'var(--tech-accent-cyan)' }}
              />
              <h3 className="font-semibold">Data Requirements</h3>
            </div>
            
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: 'var(--tech-accent-green)' }}
                />
                <span className="text-muted-foreground">
                  CSV format with headers
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: 'var(--tech-accent-green)' }}
                />
                <span className="text-muted-foreground">
                  Minimum 50 transactions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: 'var(--tech-accent-green)' }}
                />
                <span className="text-muted-foreground">
                  No missing CustomerIDs
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: 'var(--tech-accent-green)' }}
                />
                <span className="text-muted-foreground">
                  Positive Quantity & UnitPrice
                </span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-[var(--tech-border)]">
              <p className="text-xs text-muted-foreground mb-2">
                Required columns:
              </p>
              <div className="flex flex-wrap gap-1">
                {['CustomerID', 'InvoiceDate', 'InvoiceNo', 'Quantity', 'UnitPrice'].map((col) => (
                  <code 
                    key={col}
                    className="px-2 py-0.5 text-xs rounded bg-[var(--tech-bg-secondary)] font-mono"
                  >
                    {col}
                  </code>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
