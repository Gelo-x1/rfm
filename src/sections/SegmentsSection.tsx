/**
 * Segments Section Component
 * 
 * Detailed segment cards with marketing strategies and download functionality.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Target,
  Download,
  Eye,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { RFMResponse, SegmentStats, SegmentInsight, SegmentRecommendation } from '@/types';
import { formatCurrency, getSegmentColor } from '@/utils/helpers';
import { downloadSegment, triggerDownload } from '@/services/api';

interface SegmentsSectionProps {
  data: RFMResponse;
}

interface SegmentCardProps {
  segment: string;
  stats: SegmentStats;
  insight: SegmentInsight;
  recommendation: SegmentRecommendation;
  rfmData: Array<Record<string, unknown>>;
}

function SegmentCard({ segment, stats, insight, recommendation, rfmData }: SegmentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const color = getSegmentColor(segment);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadSegment(segment, rfmData);
      triggerDownload(blob, `rfm_segment_${segment.replace(/\s/g, '_')}.csv`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden glow-border"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold" style={{ color }}>{segment}</h3>
              <Badge 
                variant="outline" 
                style={{ borderColor: color, color }}
              >
                {stats.percentage}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{stats.description}</p>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <Users className="w-6 h-6" style={{ color }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Recency</span>
            </div>
            <p className="font-mono font-bold">{Math.round(stats.Recency)}d</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Frequency</span>
            </div>
            <p className="font-mono font-bold">{stats.Frequency.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Monetary</span>
            </div>
            <p className="font-mono font-bold">{formatCurrency(stats.Monetary, 'USD', true)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
          <div>
            <p className="text-xs text-muted-foreground">Revenue Share</p>
            <p className="font-mono font-bold text-[var(--tech-accent-cyan)]">
              {insight.revenue_percentage}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Priority</p>
            <Badge 
              className={`
                ${insight.priority_level === 'High' ? 'bg-red-500/20 text-red-500' : ''}
                ${insight.priority_level === 'Medium' ? 'bg-amber-500/20 text-amber-500' : ''}
                ${insight.priority_level === 'Low' ? 'bg-green-500/20 text-green-500' : ''}
              `}
            >
              {insight.priority_level}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
            Top Strategies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendation.marketing_strategies.slice(0, 2).map((strategy, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg border border-[var(--tech-border)] hover:border-[var(--tech-accent-cyan)]/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3" style={{ color }} />
                  <span className="font-medium text-sm">{strategy.strategy}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {strategy.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {strategy.budget_allocation}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1"
                style={{ borderColor: color }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span style={{ color }}>{segment}</span>
                  <span className="text-muted-foreground">- Full Marketing Plan</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                    Characteristics
                  </h4>
                  <ul className="space-y-2">
                    {recommendation.characteristics.map((char, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[var(--tech-accent-green)] flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                    Marketing Strategies
                  </h4>
                  <div className="space-y-3">
                    {recommendation.marketing_strategies.map((strategy, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-lg border border-[var(--tech-border)]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{strategy.strategy}</span>
                          <Badge variant="secondary">{strategy.budget_allocation}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {strategy.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {strategy.channels.map((channel, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-[var(--tech-accent-green)] mt-2">
                          Expected: {strategy.expected_outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                    Key Performance Indicators
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(recommendation.kpis).map(([key, value], idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-lg bg-[var(--tech-bg-secondary)]"
                      >
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-mono font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {recommendation.risks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[var(--tech-accent-red)]" />
                      Risks & Mitigation
                    </h4>
                    <ul className="space-y-2">
                      {recommendation.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-[var(--tech-accent-red)] flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                    Implementation Timeline
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(recommendation.timeline).map(([period, task], idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-[var(--tech-bg-secondary)]"
                      >
                        <Badge 
                          variant="outline" 
                          className="flex-shrink-0 text-[var(--tech-accent-cyan)]"
                        >
                          {period.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label={`Download ${segment} data`}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function SegmentsSection({ data }: SegmentsSectionProps) {
  const { segment_stats, segment_insights, segment_recommendations, rfm_data } = data;

  return (
    <section 
      className="container mx-auto px-4 py-8"
      aria-labelledby="segments-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Users 
            className="w-5 h-5"
            style={{ color: 'var(--tech-accent-cyan)' }}
          />
          <h2 id="segments-heading" className="text-xl font-bold">
            Customer Segments
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(segment_stats).map(([segment, stats]) => (
            <SegmentCard
              key={segment}
              segment={segment}
              stats={stats}
              insight={segment_insights[segment]}
              recommendation={segment_recommendations[segment]}
              rfmData={rfm_data}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
