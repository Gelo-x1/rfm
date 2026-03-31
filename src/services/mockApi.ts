/**
 * Mock API Service for Demo
 * 
 * This provides simulated RFM analysis results for the deployed demo
 * when the Flask backend is not running.
 */

import type { RFMResponse } from '@/types';

// Generate mock scatter data
function generateScatterData(_segment: string, count: number) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      x: Math.random() * 200 + 10,
      y: Math.random() * 50 + 1,
      z: Math.random() * 5000 + 100,
      customer_id: `CUST${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
  }
  return data;
}

// Generate mock customer data
function generateCustomerData(segment: string, count: number) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      customer_id: `CUST${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      recency: Math.random() * 200 + 5,
      frequency: Math.random() * 50 + 1,
      monetary: Math.random() * 5000 + 100,
      Segment: segment,
      Cluster: Math.floor(Math.random() * 6)
    });
  }
  return data;
}

// Mock analysis response
export function generateMockAnalysis(): RFMResponse {
  const segments = {
    'Champions': 245,
    'Loyal Customers': 512,
    'Potential Loyalists': 389,
    'New Customers': 156,
    'At-Risk Customers': 203,
    'Hibernating': 95
  };

  const totalCustomers = Object.values(segments).reduce((a, b) => a + b, 0);

  const segmentStats = {
    'Champions': {
      count: 245,
      percentage: 14.5,
      Recency: 12.5,
      Frequency: 28.3,
      Monetary: 2456.80,
      description: 'Your most valuable customers - recent, frequent, high spenders'
    },
    'Loyal Customers': {
      count: 512,
      percentage: 30.3,
      Recency: 35.2,
      Frequency: 15.7,
      Monetary: 1289.50,
      description: 'Regular customers with good spending habits'
    },
    'Potential Loyalists': {
      count: 389,
      percentage: 23.0,
      Recency: 28.4,
      Frequency: 8.2,
      Monetary: 678.90,
      description: 'Engaged customers with growth potential'
    },
    'New Customers': {
      count: 156,
      percentage: 9.2,
      Recency: 8.3,
      Frequency: 2.1,
      Monetary: 234.50,
      description: 'Recent customers with potential for growth'
    },
    'At-Risk Customers': {
      count: 203,
      percentage: 12.0,
      Recency: 95.6,
      Frequency: 5.4,
      Monetary: 445.30,
      description: 'Customers who haven\'t purchased recently - need re-engagement'
    },
    'Hibernating': {
      count: 95,
      percentage: 5.6,
      Recency: 185.3,
      Frequency: 3.2,
      Monetary: 198.70,
      description: 'Customers who made purchases long ago but have been inactive'
    }
  };

  const segmentInsights: Record<string, any> = {};
  Object.entries(segmentStats).forEach(([segment, stats]) => {
    const revenue = stats.Monetary * stats.count;
    segmentInsights[segment] = {
      customer_count: stats.count,
      total_revenue: revenue,
      revenue_percentage: parseFloat(((revenue / (totalCustomers * 800)) * 100).toFixed(1)),
      revenue_status: stats.percentage > 20 ? 'High Value' : stats.percentage > 10 ? 'Medium Value' : 'Low Value',
      average_order_value: stats.Monetary,
      estimated_clv: stats.Monetary * stats.Frequency * 2,
      recency_days: stats.Recency,
      purchase_frequency: stats.Frequency,
      priority_level: stats.percentage > 20 ? 'High' : stats.percentage > 10 ? 'Medium' : 'Low',
      recommended_budget_allocation: `${Math.max(5, Math.min(30, Math.round(stats.percentage / 2)))}%`
    };
  });

  const scatterData: Record<string, any[]> = {};
  Object.entries(segments).forEach(([segment, count]) => {
    scatterData[segment] = generateScatterData(segment, Math.min(100, count));
  });

  const rfmData: any[] = [];
  Object.entries(segments).forEach(([segment, count]) => {
    rfmData.push(...generateCustomerData(segment, count));
  });

  const segmentCustomers: Record<string, any[]> = {};
  Object.entries(segments).forEach(([segment, count]) => {
    segmentCustomers[segment] = generateCustomerData(segment, Math.min(50, count));
  });

  return {
    success: true,
    total_customers: totalCustomers,
    data_quality: {
      validation: {
        is_valid: true,
        warnings: [],
        errors: [],
        summary: {
          total_records: totalCustomers + 50,
          null_customers: 0,
          null_dates: 3,
          data_quality_score: 98.5
        }
      },
      cleaning_stats: {
        original_records: totalCustomers + 50,
        after_cleaning: totalCustomers,
        records_removed: 50,
        cleaning_efficiency: 97.1
      },
      outlier_stats: {
        before_outlier_removal: totalCustomers + 15,
        after_outlier_removal: totalCustomers,
        outliers_removed: 15
      }
    },
    clustering_metrics: {
      silhouette_score: 0.68,
      calinski_harabasz: 425.3,
      davies_bouldin: 0.42,
      cluster_sizes: { 0: 245, 1: 512, 2: 389, 3: 156, 4: 203, 5: 95 },
      cluster_balance: 0.35,
      interpretation: {
        silhouette: 'Good',
        calinski_harabasz: 'Good',
        davies_bouldin: 'Good'
      }
    },
    clustering_config: {
      optimal_k: 6,
      k_range: [2, 3, 4, 5, 6, 7, 8],
      wcss: [8500, 6200, 4800, 3500, 2800, 2400, 2200],
      silhouette_scores: [0.45, 0.52, 0.61, 0.65, 0.68, 0.67, 0.66]
    },
    segments,
    segment_stats: segmentStats,
    segment_descriptions: {
      0: 'Your most valuable customers - recent, frequent, high spenders',
      1: 'Regular customers with good spending habits',
      2: 'Engaged customers with growth potential',
      3: 'Recent customers with potential for growth',
      4: 'Customers who haven\'t purchased recently - need re-engagement',
      5: 'Customers who made purchases long ago but have been inactive'
    },
    segment_insights: segmentInsights,
    segment_recommendations: {
      'Champions': {
        description: 'Your most valuable customers - recent, frequent, high spenders',
        characteristics: [
          'Purchase frequently and recently',
          'Generate highest revenue per customer',
          'Strong brand loyalty and engagement'
        ],
        marketing_strategies: [
          {
            strategy: 'VIP Treatment Program',
            description: 'Offer exclusive early access to new products and sales',
            expected_outcome: 'Increase retention by 25-30%',
            channels: ['Email', 'SMS', 'Personal calls'],
            budget_allocation: '25% of marketing budget'
          },
          {
            strategy: 'Loyalty Rewards',
            description: 'Implement tiered rewards with premium benefits',
            expected_outcome: 'Boost average order value by 15-20%',
            channels: ['Mobile app', 'Website', 'Email'],
            budget_allocation: '20% of marketing budget'
          },
          {
            strategy: 'Referral Program',
            description: 'Encourage word-of-mouth with attractive incentives',
            expected_outcome: 'Acquire 15-20% new customers through referrals',
            channels: ['Social media', 'Email', 'In-app'],
            budget_allocation: '15% of marketing budget'
          }
        ],
        action_items: [
          'Send personalized thank-you notes from CEO',
          'Provide dedicated customer service line',
          'Offer exclusive product previews',
          'Create VIP events and experiences',
          'Implement surprise and delight campaigns'
        ],
        kpis: {
          'retention_rate': 'Target: 90%+',
          'average_order_value': 'Target: Increase by 20%',
          'purchase_frequency': 'Target: Maintain or increase',
          'customer_lifetime_value': 'Target: $5,000+'
        },
        risks: [
          'Competitors may target with aggressive offers',
          'Expectations for premium service increase'
        ],
        timeline: {
          'immediate': 'Set up VIP communication channels',
          '1_week': 'Launch exclusive product preview program',
          '1_month': 'Implement tiered loyalty rewards',
          '3_months': 'Host first VIP customer event'
        }
      },
      'Loyal Customers': {
        description: 'Regular customers with good spending habits',
        characteristics: [
          'Consistent purchase patterns',
          'Moderate to high frequency',
          'Good engagement with brand'
        ],
        marketing_strategies: [
          {
            strategy: 'Cross-Selling Campaigns',
            description: 'Recommend complementary products based on purchase history',
            expected_outcome: 'Increase basket size by 20-25%',
            channels: ['Email', 'Website recommendations', 'SMS'],
            budget_allocation: '20% of marketing budget'
          },
          {
            strategy: 'Frequency Rewards',
            description: 'Reward regular purchases with cumulative benefits',
            expected_outcome: 'Increase purchase frequency by 15%',
            channels: ['Email', 'Push notifications', 'In-store'],
            budget_allocation: '15% of marketing budget'
          }
        ],
        action_items: [
          'Create personalized product recommendations',
          'Send regular newsletters with relevant content',
          'Offer bundle discounts on frequently bought items'
        ],
        kpis: {
          'retention_rate': 'Target: 80-85%',
          'average_order_value': 'Target: Increase by 15%',
          'cross_sell_rate': 'Target: 30% of customers'
        },
        risks: [
          'May churn if not properly engaged',
          'Could be tempted by competitor offers'
        ],
        timeline: {
          'immediate': 'Set up automated recommendation engine',
          '1_week': 'Launch cross-selling email campaign',
          '2_weeks': 'Implement points-based loyalty program'
        }
      },
      'Potential Loyalists': {
        description: 'Engaged customers with growth potential',
        characteristics: [
          'Recent customers with moderate activity',
          'Show interest but need nurturing',
          'Price-conscious but value-oriented'
        ],
        marketing_strategies: [
          {
            strategy: 'Onboarding Sequence',
            description: 'Welcome series to educate about brand and products',
            expected_outcome: 'Increase second purchase rate by 40%',
            channels: ['Email automation', 'SMS', 'Push notifications'],
            budget_allocation: '15% of marketing budget'
          }
        ],
        action_items: [
          'Send welcome email series (5 emails over 2 weeks)',
          'Provide educational content about products',
          'Offer first-purchase discount for next order'
        ],
        kpis: {
          'conversion_rate': 'Target: 40% to loyal segment',
          'engagement_rate': 'Target: 50% email open rate'
        },
        risks: [
          'May lose interest quickly without engagement',
          'Price sensitivity may limit profitability'
        ],
        timeline: {
          'immediate': 'Set up welcome email automation',
          '3_days': 'Send first educational content',
          '1_week': 'Launch engagement campaign'
        }
      },
      'New Customers': {
        description: 'Recent customers with potential for growth',
        characteristics: [
          'Recently made first or second purchase',
          'Still evaluating the brand',
          'Need reassurance and guidance'
        ],
        marketing_strategies: [
          {
            strategy: 'Welcome Program',
            description: 'Comprehensive onboarding to build relationship',
            expected_outcome: 'Increase retention by 35%',
            channels: ['Email', 'SMS', 'In-app messages'],
            budget_allocation: '12% of marketing budget'
          }
        ],
        action_items: [
          'Send immediate order confirmation and thank you',
          'Provide getting-started guide',
          'Share customer success stories'
        ],
        kpis: {
          'retention_rate': 'Target: 60% after 90 days',
          'second_purchase_rate': 'Target: 50% within 30 days'
        },
        risks: [
          'High churn risk without proper onboarding',
          'May have unrealistic expectations'
        ],
        timeline: {
          'immediate': 'Send welcome email with getting-started guide',
          '3_days': 'Share product tips and best practices',
          '1_week': 'Offer exclusive new customer discount'
        }
      },
      'At-Risk Customers': {
        description: 'Customers who haven\'t purchased recently and spend less',
        characteristics: [
          'Haven\'t purchased in extended period',
          'Previously showed engagement',
          'May be considering competitors'
        ],
        marketing_strategies: [
          {
            strategy: 'Win-Back Campaign',
            description: 'Targeted offers to re-engage dormant customers',
            expected_outcome: 'Reactivate 15-20% of at-risk customers',
            channels: ['Email', 'SMS', 'Retargeting ads'],
            budget_allocation: '15% of marketing budget'
          }
        ],
        action_items: [
          'Send \'We miss you\' email with special offer',
          'Conduct exit survey to understand reasons',
          'Provide significant discount (20-30%)'
        ],
        kpis: {
          'reactivation_rate': 'Target: 15-20%',
          'campaign_response_rate': 'Target: 8-10%'
        },
        risks: [
          'May have already switched to competitors',
          'High discount expectations'
        ],
        timeline: {
          'immediate': 'Launch win-back email campaign',
          '3_days': 'Send follow-up with increased offer',
          '1_week': 'Conduct phone outreach for high-value customers'
        }
      },
      'Hibernating': {
        description: 'Customers who made purchases long ago but have been inactive',
        characteristics: [
          'Very long time since last purchase',
          'Previously engaged customers',
          'Low probability of reactivation'
        ],
        marketing_strategies: [
          {
            strategy: 'Reactivation Campaign',
            description: 'Aggressive offers to wake up dormant customers',
            expected_outcome: 'Reactivate 5-10% of hibernating customers',
            channels: ['Email', 'Social ads', 'SMS'],
            budget_allocation: '8% of marketing budget'
          }
        ],
        action_items: [
          'Send \'What\'s new\' email with major updates',
          'Offer significant comeback discount (30%+)',
          'Highlight product improvements and new features'
        ],
        kpis: {
          'reactivation_rate': 'Target: 5-10%',
          'email_open_rate': 'Target: 10-15%'
        },
        risks: [
          'Very low probability of reactivation',
          'May damage brand reputation with excessive emails'
        ],
        timeline: {
          'immediate': 'Send reactivation email',
          '1_week': 'Follow up with enhanced offer',
          '2_weeks': 'Final attempt with best offer'
        }
      }
    },
    segment_customers: segmentCustomers,
    scatter_data: scatterData,
    rfm_data: rfmData,
    charts: {
      segment_distribution_dark: '',
      segment_distribution_light: '',
      rfm_comparison_dark: '',
      rfm_comparison_light: '',
      elbow_method_dark: '',
      elbow_method_light: '',
      scatter_plot_dark: '',
      scatter_plot_light: '',
      revenue_by_segment_dark: '',
      revenue_by_segment_light: ''
    },
    analysis_timestamp: new Date().toISOString()
  };
}

// Simulate file upload with delay
export async function mockUploadFile(_file: File, onProgress?: (progress: number) => void): Promise<RFMResponse> {
  return new Promise((resolve) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) {
        onProgress(progress);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          resolve(generateMockAnalysis());
        }, 500);
      }
    }, 200);
  });
}
