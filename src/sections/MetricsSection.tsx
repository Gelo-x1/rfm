/**
 * Metrics Section Component
 * 
 * Displays key analysis metrics with animated counters and clustering quality metrics.
 */

import { motion } from 'framer-motion';
import { Users, PieChart, Shield, Activity, BarChart2, Target } from 'lucide-react';
import type { RFMResponse } from '@/types';
import { formatNumber } from '@/utils/helpers';

interface MetricsSectionProps {
  data: RFMResponse;
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  delay: number;
}

function MetricCard({ icon: Icon, label, value, subtext, color, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold font-mono">{value}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export function MetricsSection({ data }: MetricsSectionProps) {
  const { total_customers, segments, data_quality, clustering_metrics } = data;
  const segmentCount = Object.keys(segments).length;
  const qualityScore = data_quality?.validation?.summary?.data_quality_score || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section 
      className="container mx-auto px-4 py-8"
      aria-labelledby="metrics-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity 
            className="w-5 h-5"
            style={{ color: 'var(--tech-accent-cyan)' }}
          />
          <h2 id="metrics-heading" className="text-xl font-bold">
            Analysis Overview
          </h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MetricCard
            icon={Users}
            label="Customers Analyzed"
            value={formatNumber(total_customers)}
            subtext="Total unique customers"
            color="var(--tech-accent-cyan)"
            delay={0}
          />
          <MetricCard
            icon={PieChart}
            label="Segments Identified"
            value={segmentCount}
            subtext="Distinct customer groups"
            color="var(--tech-accent-green)"
            delay={0.1}
          />
          <MetricCard
            icon={Shield}
            label="Data Quality Score"
            value={`${qualityScore}%`}
            subtext="Based on completeness"
            color={qualityScore >= 90 ? 'var(--tech-accent-green)' : qualityScore >= 70 ? 'var(--tech-accent-amber)' : 'var(--tech-accent-red)'}
            delay={0.2}
          />
        </motion.div>

        {clustering_metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border-t border-[var(--tech-border)] pt-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 
                className="w-4 h-4 text-muted-foreground"
              />
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Clustering Quality Metrics
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Silhouette Score</span>
                  <Target className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {clustering_metrics.silhouette_score?.toFixed(4) || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {clustering_metrics.interpretation?.silhouette || 'N/A'}
                </p>
                <div className="mt-3 h-1.5 bg-[var(--tech-bg-secondary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(clustering_metrics.silhouette_score || 0) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ 
                      background: clustering_metrics.silhouette_score > 0.5 
                        ? 'var(--tech-accent-green)' 
                        : clustering_metrics.silhouette_score > 0.25 
                          ? 'var(--tech-accent-amber)' 
                          : 'var(--tech-accent-red)' 
                    }}
                  />
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Calinski-Harabasz</span>
                  <BarChart2 className="w-4 h-4 text-[var(--tech-accent-purple)]" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {clustering_metrics.calinski_harabasz?.toFixed(2) || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {clustering_metrics.interpretation?.calinski_harabasz || 'N/A'}
                </p>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Davies-Bouldin</span>
                  <Activity className="w-4 h-4 text-[var(--tech-accent-amber)]" />
                </div>
                <p className="text-2xl font-bold font-mono">
                  {clustering_metrics.davies_bouldin?.toFixed(4) || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {clustering_metrics.interpretation?.davies_bouldin || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
