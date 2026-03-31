/**
 * Market Recommendations Section
 * 
 * Enhanced recommendation section with:
 * - Top 5 recommendations with confidence scores
 * - Risk indicators (low/medium/high)
 * - Time horizon badges (short-term/long-term)
 * - Key drivers with impact indicators
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { 
  RFMResponse, 
  MarketRecommendation, 
  RiskLevel, 
  TimeHorizon,
  RecommendationType,
  KeyDriver
} from '@/types';
import { getRiskClass, getHorizonClass, formatPercentage } from '@/utils/helpers';

interface RecommendationsSectionProps {
  data: RFMResponse;
}

function generateRecommendations(data: RFMResponse): MarketRecommendation[] {
  const { segment_stats, segment_insights, segment_recommendations } = data;
  const recommendations: MarketRecommendation[] = [];

  Object.entries(segment_stats).forEach(([segment, stats], index) => {
    const insight = segment_insights[segment];
    const rec = segment_recommendations[segment];
    
    if (!insight || !rec) return;

    let type: RecommendationType = 'watch';
    if (segment === 'Champions' || segment === 'Loyal Customers') {
      type = 'hold';
    } else if (segment === 'Potential Loyalists' || segment === 'New Customers') {
      type = 'buy';
    } else if (segment === 'At-Risk Customers' || segment === 'Hibernating') {
      type = 'sell';
    }

    const confidenceScore = Math.min(95, Math.round(
      (stats.percentage * 0.3) + 
      (insight.revenue_percentage * 0.4) + 
      (data.data_quality?.validation?.summary?.data_quality_score * 0.3)
    ));

    let riskLevel: RiskLevel = 'medium';
    if (segment === 'Champions' || segment === 'Loyal Customers') {
      riskLevel = 'low';
    } else if (segment === 'At-Risk Customers' || segment === 'Hibernating') {
      riskLevel = 'high';
    }

    const timeHorizon: TimeHorizon = 
      segment === 'New Customers' || segment === 'At-Risk Customers' 
        ? 'short-term' 
        : 'long-term';

    const keyDrivers: KeyDriver[] = [
      {
        name: 'Revenue Contribution',
        impact: insight.revenue_percentage > 30 ? 'positive' : insight.revenue_percentage > 15 ? 'neutral' : 'negative',
        description: `${formatPercentage(insight.revenue_percentage)} of total revenue`
      },
      {
        name: 'Purchase Recency',
        impact: stats.Recency < 30 ? 'positive' : stats.Recency < 90 ? 'neutral' : 'negative',
        description: `Avg ${Math.round(stats.Recency)} days since last purchase`
      },
      {
        name: 'Customer Lifetime Value',
        impact: insight.estimated_clv > 1000 ? 'positive' : insight.estimated_clv > 500 ? 'neutral' : 'negative',
        description: `Estimated $${insight.estimated_clv.toFixed(0)} CLV`
      }
    ];

    recommendations.push({
      id: `rec-${index}`,
      rank: index + 1,
      segment,
      type,
      confidence_score: confidenceScore,
      risk_level: riskLevel,
      time_horizon: timeHorizon,
      rationale: rec.description,
      key_drivers: keyDrivers,
      expected_outcome: rec.marketing_strategies[0]?.expected_outcome || 'Improve engagement',
      potential_roi: `${(insight.revenue_percentage * 0.5).toFixed(1)}% - ${(insight.revenue_percentage * 1.2).toFixed(1)}%`,
      action_steps: rec.action_items.slice(0, 3)
    });
  });

  return recommendations
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 5);
}

function getRecommendationIcon(type: RecommendationType) {
  const icons = {
    buy: TrendingUp,
    sell: TrendingDown,
    hold: Minus,
    watch: Eye,
  };
  return icons[type];
}

function getRecommendationColor(type: RecommendationType): string {
  const colors = {
    buy: 'var(--tech-accent-green)',
    sell: 'var(--tech-accent-red)',
    hold: 'var(--tech-accent-cyan)',
    watch: 'var(--tech-accent-amber)',
  };
  return colors[type];
}

function getImpactIcon(impact: 'positive' | 'negative' | 'neutral') {
  switch (impact) {
    case 'positive':
      return <TrendingUp className="w-4 h-4 text-[var(--tech-accent-green)]" />;
    case 'negative':
      return <TrendingDown className="w-4 h-4 text-[var(--tech-accent-red)]" />;
    default:
      return <Minus className="w-4 h-4 text-[var(--tech-accent-amber)]" />;
  }
}

interface RecommendationCardProps {
  recommendation: MarketRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
}

function RecommendationCard({ recommendation, isExpanded, onToggle }: RecommendationCardProps) {
  const Icon = getRecommendationIcon(recommendation.type);
  const color = getRecommendationColor(recommendation.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer hover:bg-[var(--tech-hover-bg)] transition-colors"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
            style={{ background: `${color}20`, color }}
          >
            #{recommendation.rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{recommendation.segment}</h3>
              <Badge 
                variant="outline" 
                className="flex items-center gap-1"
                style={{ borderColor: color, color }}
              >
                <Icon className="w-3 h-3" />
                {recommendation.type.toUpperCase()}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {recommendation.rationale}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={getRiskClass(recommendation.risk_level)}>
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {recommendation.risk_level} risk
              </span>
              <span className={getHorizonClass(recommendation.time_horizon)}>
                <Clock className="w-3 h-3 inline mr-1" />
                {recommendation.time_horizon}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--tech-accent-purple)]/20 text-[var(--tech-accent-purple)]">
                <Target className="w-3 h-3 inline mr-1" />
                ROI: {recommendation.potential_roi}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-center hidden sm:block">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center border-4"
              style={{ 
                borderColor: `${color}`,
                background: `${color}10`
              }}
            >
              <span className="font-bold text-sm">{recommendation.confidence_score}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confidence</p>
          </div>

          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--tech-border)]"
          >
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                  Key Drivers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendation.key_drivers.map((driver, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-[var(--tech-bg-secondary)]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getImpactIcon(driver.impact)}
                        <span className="font-medium text-sm">{driver.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {driver.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--tech-accent-green)]/10 border border-[var(--tech-accent-green)]/30">
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-2 text-[var(--tech-accent-green)]">
                  <Lightbulb className="w-4 h-4" />
                  Expected Outcome
                </h4>
                <p className="text-sm">{recommendation.expected_outcome}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--tech-accent-cyan)]" />
                  Recommended Actions
                </h4>
                <ul className="space-y-2">
                  {recommendation.action_steps.map((step, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                        style={{ background: `${color}20`, color }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RecommendationsSection({ data }: RecommendationsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const recommendations = useMemo(() => generateRecommendations(data), [data]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section 
      className="container mx-auto px-4 py-8"
      aria-labelledby="recommendations-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb 
              className="w-5 h-5"
              style={{ color: 'var(--tech-accent-cyan)' }}
            />
            <h2 id="recommendations-heading" className="text-xl font-bold">
              Strategic Recommendations
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Based on the RFM analysis, here are the top 5 strategic recommendations 
            for optimizing your customer segments. Each recommendation includes 
            confidence scores, risk assessments, and actionable steps.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
              <p className="text-2xl font-bold font-mono text-[var(--tech-accent-cyan)]">
                {recommendations.length}
              </p>
              <p className="text-xs text-muted-foreground">Recommendations</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
              <p className="text-2xl font-bold font-mono text-[var(--tech-accent-green)]">
                {Math.round(recommendations.reduce((acc, r) => acc + r.confidence_score, 0) / recommendations.length)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
              <p className="text-2xl font-bold font-mono text-[var(--tech-accent-amber)]">
                {recommendations.filter(r => r.risk_level === 'high').length}
              </p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--tech-bg-secondary)]">
              <p className="text-2xl font-bold font-mono text-[var(--tech-accent-purple)]">
                {recommendations.filter(r => r.time_horizon === 'short-term').length}
              </p>
              <p className="text-xs text-muted-foreground">Short-term</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              isExpanded={expandedId === rec.id}
              onToggle={() => toggleExpanded(rec.id)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
