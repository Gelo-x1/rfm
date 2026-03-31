/**
 * API Service Layer
 * 
 * Handles all HTTP communication with the Flask backend.
 */

import type { RFMResponse, DownloadResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  statusCode?: number;
  responseData?: unknown;
  
  constructor(
    message: string,
    statusCode?: number,
    responseData?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

/**
 * Upload CSV file for RFM analysis
 */
export async function uploadFile(file: File, onProgress?: (progress: number) => void): Promise<RFMResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    if (onProgress) {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 90) {
          onProgress(progress);
        }
      }, 200);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      onProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.error || `Upload failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new APIError(data.error || 'Analysis failed', undefined, data);
      }

      return data as RFMResponse;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `Upload failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new APIError(data.error || 'Analysis failed', undefined, data);
    }

    return data as RFMResponse;

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Download full RFM analysis data as CSV
 */
export async function downloadFullData(rfmData: Array<Record<string, unknown>>): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfm_data: rfmData }),
    });

    if (!response.ok) {
      throw new APIError(`Download failed with status ${response.status}`, response.status);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Download failed');
  }
}

/**
 * Download specific segment data as CSV
 */
export async function downloadSegment(
  segment: string,
  rfmData: Array<Record<string, unknown>>
): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/download_segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment, rfm_data: rfmData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `Segment download failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Segment download failed');
  }
}

/**
 * Generate and download comprehensive HTML report
 */
export async function generateReport(results: RFMResponse): Promise<DownloadResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/download_report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results }),
    });

    if (!response.ok) {
      throw new APIError(`Report generation failed with status ${response.status}`, response.status);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new APIError(data.error || 'Report generation failed', undefined, data);
    }

    return data as DownloadResponse;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Report generation failed');
  }
}

/**
 * Trigger file download from blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { valid: false, error: 'Please upload a CSV file' };
  }

  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 100MB limit' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true };
}

/**
 * Health check for API availability
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
