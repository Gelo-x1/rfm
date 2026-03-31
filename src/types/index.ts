/**
 * RFM Nexus - TypeScript Type Definitions
 * 
 * This file contains all type interfaces for the RFM Analysis application,
 * ensuring type safety across the entire codebase.
 */

// ============================================================================
// Theme Types
// ============================================================================

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// ============================================================================
// Data Quality Types
// ============================================================================

export interface DataQualityValidation {
  is_valid: boolean;
  warnings: string[];
  errors: string[];
  summary: {
    total_records: number;
    null_customers: number;
    null_dates: number;
    data_quality_score: number;
  };
}

export interface CleaningStats {
  original_records: number;
  after_cleaning: number;
  records_removed: number;
  cleaning_efficiency: number;
}

export interface OutlierStats {
  before_outlier_removal: number;
  after_outlier_removal: number;
  outliers_removed: number;
}

// ============================================================================
// Clustering Types
// ============================================================================

export interface ClusteringMetrics {
  silhouette_score: number;
  calinski_harabasz: number;
  davies_bouldin: number;
  cluster_sizes: Record<number, number>;
  cluster_balance: number;
  interpretation: {
    silhouette: string;
    calinski_harabasz: string;
    davies_bouldin: string;
  };
}

export interface ClusteringConfig {
  optimal_k: number;
  k_range: number[];
  wcss: number[];
  silhouette_scores: number[];
}

// ============================================================================
// Segment Types
// ============================================================================

export interface SegmentStats {
  count: number;
  percentage: number;
  Recency: number;
  Frequency: number;
  Monetary: number;
  description: string;
}

export interface SegmentInsight {
  customer_count: number;
  total_revenue: number;
  revenue_percentage: number;
  revenue_status: string;
  average_order_value: number;
  estimated_clv: number;
  recency_days: number;
  purchase_frequency: number;
  priority_level: 'High' | 'Medium' | 'Low';
  recommended_budget_allocation: string;
}

export interface MarketingStrategy {
  strategy: string;
  description: string;
  expected_outcome: string;
  channels: string[];
  budget_allocation: string;
}

export interface SegmentRecommendation {
  description: string;
  characteristics: string[];
  marketing_strategies: MarketingStrategy[];
  action_items: string[];
  kpis: Record<string, string>;
  risks: string[];
  timeline: Record<string, string>;
}

export interface CustomerData {
  customer_id: string;
  recency: number;
  frequency: number;
  monetary: number;
}

export interface ScatterPoint {
  x: number;
  y: number;
  z: number;
  customer_id: string;
}

// ============================================================================
// Market Recommendation Types (Enhanced)
// ============================================================================

export type RiskLevel = 'low' | 'medium' | 'high';
export type TimeHorizon = 'short-term' | 'long-term';
export type RecommendationType = 'buy' | 'sell' | 'hold' | 'watch';

export interface KeyDriver {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface MarketRecommendation {
  id: string;
  rank: number;
  segment: string;
  type: RecommendationType;
  confidence_score: number;
  risk_level: RiskLevel;
  time_horizon: TimeHorizon;
  rationale: string;
  key_drivers: KeyDriver[];
  expected_outcome: string;
  potential_roi: string;
  action_steps: string[];
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartData {
  segment_distribution_dark: string;
  segment_distribution_light: string;
  rfm_comparison_dark: string;
  rfm_comparison_light: string;
  elbow_method_dark: string;
  elbow_method_light: string;
  scatter_plot_dark: string;
  scatter_plot_light: string;
  revenue_by_segment_dark: string;
  revenue_by_segment_light: string;
}

export interface ChartThemeColors {
  bg: string;
  text: string;
  grid: string;
  colors: string[];
}

// ============================================================================
// 3D Visualization Types
// ============================================================================

export interface Point3D {
  x: number;
  y: number;
  z: number;
  segment: string;
  customerId: string;
}

export interface SurfaceData3D {
  x: number[];
  y: number[];
  z: number[][];
}

export interface VisualizationConfig {
  cameraPosition: [number, number, number];
  showGrid: boolean;
  showAxes: boolean;
  pointSize: number;
  rotationSpeed: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface RFMResponse {
  success: boolean;
  error?: string;
  total_customers: number;
  data_quality: {
    validation: DataQualityValidation;
    cleaning_stats: CleaningStats;
    outlier_stats: OutlierStats;
  };
  clustering_metrics: ClusteringMetrics;
  clustering_config: ClusteringConfig;
  segments: Record<string, number>;
  segment_stats: Record<string, SegmentStats>;
  segment_descriptions: Record<number, string>;
  segment_insights: Record<string, SegmentInsight>;
  segment_recommendations: Record<string, SegmentRecommendation>;
  segment_customers: Record<string, CustomerData[]>;
  scatter_data: Record<string, ScatterPoint[]>;
  rfm_data: Array<Record<string, unknown>>;
  charts: ChartData;
  analysis_timestamp: string;
}

export interface DownloadResponse {
  success: boolean;
  error?: string;
  report_html?: string;
  filename?: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  loadingState: LoadingState;
  error: string | null;
  results: RFMResponse | null;
  selectedSegment: string | null;
  activeModal: 'marketing' | 'segment' | null;
}

export interface UploadState {
  isDragging: boolean;
  file: File | null;
  progress: number;
}

// ============================================================================
// Accessibility Types
// ============================================================================

export interface AriaLabels {
  [key: string]: string;
}

export interface KeyboardNavigation {
  onKeyDown: (event: React.KeyboardEvent) => void;
  tabIndex: number;
  role: string;
}
