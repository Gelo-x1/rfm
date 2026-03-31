/**
 * Charts Section Component
 * 
 * Comprehensive visualization section with 2D charts and 3D visualizations.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Activity, TrendingUp, Box, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeColors } from '@/hooks/useTheme';
import { ScatterPlot3D } from '@/components/3d/ScatterPlot3D';
import { SurfacePlot3D } from '@/components/3d/SurfacePlot3D';
import type { RFMResponse } from '@/types';

interface ChartsSectionProps {
  data: RFMResponse;
}

interface ChartCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
  analysis?: string;
  stats?: { label: string; value: string }[];
}

function ChartCard({ title, description, icon: Icon, children, analysis, stats }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon 
          className="w-5 h-5"
          style={{ color: 'var(--tech-accent-cyan)' }}
        />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="mb-4">
        {children}
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-[var(--tech-bg-secondary)] rounded-lg">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-bold font-mono text-[var(--tech-accent-cyan)]">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {analysis && (
        <div className="p-3 bg-[var(--tech-bg-secondary)] rounded-lg border-l-2 border-[var(--tech-accent)]">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Analysis: </span>
            {analysis}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function ChartsSection({ data }: ChartsSectionProps) {
  const { isDark } = useThemeColors();
  const [active3DTab, setActive3DTab] = useState('scatter');

  const { charts, scatter_data, clustering_config, segment_stats, clustering_metrics, segments, total_customers } = data;

  const segmentCount = Object.keys(segment_stats).length;
  const totalRevenue = Object.values(segment_stats).reduce(
    (sum, stat) => sum + (stat.Monetary * stat.count), 
    0
  );
  const avgRecency = Object.values(segment_stats).reduce(
    (sum, stat) => sum + stat.Recency, 
    0
  ) / segmentCount;

  return (
    <section 
      className="container mx-auto px-4 py-8"
      aria-labelledby="charts-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 
              className="w-5 h-5"
              style={{ color: 'var(--tech-accent-cyan)' }}
            />
            <h2 id="charts-heading" className="text-xl font-bold">
              Visual Insights
            </h2>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Hover over charts for details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Segment Distribution"
            description="Customer proportion across segments"
            icon={PieChart}
            analysis="Champions and Loyal customers typically generate the highest revenue per customer. Focus retention efforts on these segments."
            stats={[
              { label: 'Segments', value: segmentCount.toString() },
              { label: 'Top Segment', value: Object.entries(segments)
                .sort((a, b) => b[1] - a[1])[0]?.[0].slice(0, 10) || 'N/A' },
              { label: 'Balance', value: `${(clustering_metrics?.cluster_balance || 0).toFixed(2)}` },
            ]}
          >
            <img 
              src={`data:image/png;base64,${isDark ? charts.segment_distribution_dark : charts.segment_distribution_light}`}
              alt="Segment Distribution Chart"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </ChartCard>

          <ChartCard
            title="RFM Comparison"
            description="Average Recency, Frequency, and Monetary by segment"
            icon={Activity}
            analysis="Lower recency (more recent purchases) combined with higher frequency and monetary values indicate healthier customer relationships."
            stats={[
              { label: 'Avg Recency', value: `${Math.round(avgRecency)}d` },
              { label: 'Best RFM', value: Object.entries(segment_stats)
                .sort((a, b) => b[1].Monetary - a[1].Monetary)[0]?.[0].slice(0, 10) || 'N/A' },
              { label: 'Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K` },
            ]}
          >
            <img 
              src={`data:image/png;base64,${isDark ? charts.rfm_comparison_dark : charts.rfm_comparison_light}`}
              alt="RFM Comparison Chart"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </ChartCard>

          <ChartCard
            title="Elbow Method"
            description="Optimal cluster count determination"
            icon={TrendingUp}
            analysis={`The elbow at K=${clustering_config?.optimal_k || 4} suggests this is the optimal number of segments, balancing complexity and variance explained.`}
            stats={[
              { label: 'Optimal K', value: (clustering_config?.optimal_k || 4).toString() },
              { label: 'Silhouette', value: (clustering_metrics?.silhouette_score || 0).toFixed(3) },
              { label: 'Inertia', value: `${(clustering_config?.wcss?.[clustering_config?.optimal_k - 2] || 0).toFixed(0)}` },
            ]}
          >
            <img 
              src={`data:image/png;base64,${isDark ? charts.elbow_method_dark : charts.elbow_method_light}`}
              alt="Elbow Method Chart"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </ChartCard>

          <ChartCard
            title="Revenue by Segment"
            description="Total revenue contribution per segment"
            icon={BarChart3}
            analysis="Focus marketing budgets on high-revenue segments while nurturing potential growth segments with targeted campaigns."
            stats={[
              { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K` },
              { label: 'Top Contributor', value: Object.entries(segment_stats)
                .sort((a, b) => (b[1].Monetary * b[1].count) - (a[1].Monetary * a[1].count))[0]?.[0].slice(0, 10) || 'N/A' },
              { label: 'Avg/Customer', value: `$${(totalRevenue / total_customers).toFixed(0)}` },
            ]}
          >
            <img 
              src={`data:image/png;base64,${isDark ? charts.revenue_by_segment_dark : charts.revenue_by_segment_light}`}
              alt="Revenue by Segment Chart"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </ChartCard>
        </div>

        <div className="border-t border-[var(--tech-border)] pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Box 
              className="w-5 h-5"
              style={{ color: 'var(--tech-accent-cyan)' }}
            />
            <h3 className="text-lg font-bold">3D Visualizations</h3>
          </div>

          <Tabs value={active3DTab} onValueChange={setActive3DTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="scatter" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Cluster Scatter
              </TabsTrigger>
              <TabsTrigger value="surface" className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                Correlation Surface
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scatter">
              <ChartCard
                title="3D Customer Clustering"
                description="Interactive 3D scatter plot of customer segments"
                icon={Layers}
                analysis="This 3D visualization shows how customers naturally cluster based on their RFM scores. Each point represents a customer, colored by segment. Rotate to explore the data from different angles."
                stats={[
                  { label: 'Points', value: Object.values(scatter_data).flat().length.toString() },
                  { label: 'Dimensions', value: '3' },
                  { label: 'Clusters', value: Object.keys(scatter_data).length.toString() },
                ]}
              >
                <ScatterPlot3D data={scatter_data} isDark={isDark} />
              </ChartCard>
            </TabsContent>

            <TabsContent value="surface">
              <ChartCard
                title="RFM Correlation Surface"
                description="3D surface showing RFM value relationships"
                icon={Box}
                analysis="The surface height represents monetary value across the recency-frequency plane. Peaks indicate high-value customer groups, valleys show areas for improvement."
                stats={[
                  { label: 'Resolution', value: '20x20' },
                  { label: 'Samples', value: Object.values(scatter_data).flat().slice(0, 500).length.toString() },
                  { label: 'Interp.', value: 'IDW' },
                ]}
              >
                <SurfacePlot3D data={scatter_data} isDark={isDark} />
              </ChartCard>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </section>
  );
}
