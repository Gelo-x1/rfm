/**
 * Utility Functions
 * 
 * Helper functions for data formatting, calculations, and UI operations.
 */

import type { RiskLevel, TimeHorizon, RecommendationType } from '@/types';

/**
 * Format number with locale and decimal places
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  } = {}
): string {
  const { decimals = 0, prefix = '', suffix = '', compact = false } = options;

  if (compact && value >= 1000) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const suffixIndex = Math.floor(Math.log10(value) / 3);
    const scaledValue = value / Math.pow(1000, suffixIndex);
    return `${prefix}${scaledValue.toFixed(decimals)}${suffixes[suffixIndex]}${suffix}`;
  }

  return `${prefix}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  compact = false
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  });
  return formatter.format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Get color for segment
 */
export function getSegmentColor(segment: string): string {
  const colors: Record<string, string> = {
    'Champions': '#00FF88',
    'Loyal Customers': '#00D9FF',
    'Potential Loyalists': '#FFD93D',
    'New Customers': '#A855F7',
    'At-Risk Customers': '#FF6B6B',
    'Hibernating': '#F472B6',
  };
  return colors[segment] || '#00D9FF';
}

/**
 * Get risk level color class
 */
export function getRiskClass(risk: RiskLevel): string {
  const classes: Record<RiskLevel, string> = {
    low: 'risk-low',
    medium: 'risk-medium',
    high: 'risk-high',
  };
  return classes[risk];
}

/**
 * Get time horizon class
 */
export function getHorizonClass(horizon: TimeHorizon): string {
  const classes: Record<TimeHorizon, string> = {
    'short-term': 'horizon-short',
    'long-term': 'horizon-long',
  };
  return classes[horizon];
}

/**
 * Get recommendation type icon
 */
export function getRecommendationIcon(type: RecommendationType): string {
  const icons: Record<RecommendationType, string> = {
    buy: 'TrendingUp',
    sell: 'TrendingDown',
    hold: 'Minus',
    watch: 'Eye',
  };
  return icons[type];
}

/**
 * Calculate confidence ring CSS variable
 */
export function getConfidenceStyle(score: number): React.CSSProperties {
  const degrees = (score / 100) * 360;
  return { '--confidence-deg': `${degrees}deg` } as React.CSSProperties;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(prefix = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Calculate file hash for caching
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(elementId: string, offset = 80): void {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Get keyboard navigation handlers for accessibility
 */
export function getKeyboardHandlers(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void
): {
  onKeyDown: (e: React.KeyboardEvent) => void;
  role: string;
  tabIndex: number;
} {
  return {
    onKeyDown: (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          onEnter?.();
          break;
        case ' ':
          e.preventDefault();
          onSpace?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    },
    role: 'button',
    tabIndex: 0,
  };
}
