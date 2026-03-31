/**
 * Footer Section Component
 * 
 * Download options and footer with:
 * - Full data download
 * - Report generation
 * - GitHub link
 * - Copyright
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Github, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadFullData, generateReport, triggerDownload } from '@/services/api';
import type { RFMResponse } from '@/types';

interface FooterSectionProps {
  data: RFMResponse;
}

export function FooterSection({ data }: FooterSectionProps) {
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleDownloadData = async () => {
    setIsDownloadingData(true);
    try {
      const blob = await downloadFullData(data.rfm_data);
      triggerDownload(blob, `rfm_full_data_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloadingData(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const result = await generateReport(data);
      if (result.report_html && result.filename) {
        const blob = new Blob([result.report_html], { type: 'text/html' });
        triggerDownload(blob, result.filename);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <footer className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Download Section */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Export Your Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Download the complete RFM data or generate a comprehensive HTML report.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadData}
                disabled={isDownloadingData}
                className="tech-button"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloadingData ? 'Downloading...' : 'Download Full Data'}
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                variant="outline"
                className="border-[var(--tech-accent-cyan)] text-[var(--tech-accent-cyan)] hover:bg-[var(--tech-accent-cyan)]/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-[var(--tech-border)]">
          <div className="flex items-center justify-center gap-2 mb-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors hover:bg-[var(--tech-hover-bg)] focus-ring"
              aria-label="View source on GitHub"
            >
              <Github className="w-5 h-5 text-muted-foreground hover:text-[var(--tech-accent-cyan)] transition-colors" />
            </a>
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            RFM Nexus | Powered by Machine Learning | Made with 
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} RFM Nexus. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
