"""
Chart Service

Generates matplotlib charts for RFM analysis visualization.
Supports both dark and light themes.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import io
import base64
from typing import Dict, Any, List


class ChartService:
    """Service for generating visualization charts."""
    
    # Theme configurations
    THEMES = {
        'dark': {
            'bg_color': '#0F172A',
            'text_color': '#E2E8F0',
            'grid_color': '#1E293B',
            'colors': ['#00D9FF', '#00FF88', '#FF6B6B', '#FFD93D', '#A855F7', '#F472B6']
        },
        'light': {
            'bg_color': '#FFFFFF',
            'text_color': '#0F172A',
            'grid_color': '#E2E8F0',
            'colors': ['#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899']
        }
    }
    
    # Segment colors
    SEGMENT_COLORS = {
        'Champions': '#00FF88',
        'Loyal Customers': '#00D9FF',
        'Potential Loyalists': '#FFD93D',
        'New Customers': '#A855F7',
        'At-Risk Customers': '#FF6B6B',
        'Hibernating': '#F472B6'
    }
    
    def generate_charts(self, data: Dict[str, Any], theme: str = 'dark') -> Dict[str, str]:
        """
        Generate all charts for the given theme.
        
        Args:
            data: Analysis results
            theme: 'dark' or 'light'
            
        Returns:
            Dictionary of base64-encoded chart images
        """
        theme_config = self.THEMES.get(theme, self.THEMES['dark'])
        
        charts = {}
        
        # Generate each chart type
        charts['segment_distribution'] = self._generate_segment_distribution(
            data['segments'], theme_config
        )
        charts['rfm_comparison'] = self._generate_rfm_comparison(
            data['segment_stats'], theme_config
        )
        charts['elbow_method'] = self._generate_elbow_method(
            data['clustering_config'], theme_config
        )
        charts['scatter_plot'] = self._generate_scatter_plot(
            data['scatter_data'], theme_config
        )
        charts['revenue_by_segment'] = self._generate_revenue_chart(
            data['segment_stats'], data['segment_insights'], theme_config
        )
        
        return charts
    
    def _fig_to_base64(self, fig: plt.Figure) -> str:
        """Convert matplotlib figure to base64 string."""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=120, bbox_inches='tight', 
                   facecolor=fig.get_facecolor())
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        return img_base64
    
    def _generate_segment_distribution(self, segments: Dict[str, int], 
                                       theme: Dict[str, str]) -> str:
        """Generate pie chart for segment distribution."""
        fig, ax = plt.subplots(figsize=(10, 8), facecolor=theme['bg_color'])
        ax.set_facecolor(theme['bg_color'])
        
        colors = [self.SEGMENT_COLORS.get(seg, theme['colors'][0]) for seg in segments.keys()]
        
        wedges, texts, autotexts = ax.pie(
            list(segments.values()),
            labels=list(segments.keys()),
            autopct='%1.1f%%',
            colors=colors,
            startangle=90,
            textprops={'color': theme['text_color'], 'fontsize': 11}
        )
        
        ax.set_title('Customer Segment Distribution', 
                    fontsize=16, fontweight='bold', 
                    color=theme['text_color'], pad=20)
        
        return self._fig_to_base64(fig)
    
    def _generate_rfm_comparison(self, segment_stats: Dict[str, Dict], 
                                  theme: Dict[str, str]) -> str:
        """Generate bar chart for RFM comparison."""
        fig, ax = plt.subplots(figsize=(12, 7), facecolor=theme['bg_color'])
        ax.set_facecolor(theme['bg_color'])
        
        segments = list(segment_stats.keys())
        recency = [segment_stats[s]['Recency'] for s in segments]
        frequency = [segment_stats[s]['Frequency'] for s in segments]
        monetary = [segment_stats[s]['Monetary'] / 100 for s in segments]
        
        x = np.arange(len(segments))
        width = 0.25
        
        bars1 = ax.bar(x - width, recency, width, label='Recency (days)', 
                      color=theme['colors'][0], alpha=0.9)
        bars2 = ax.bar(x, frequency, width, label='Frequency', 
                      color=theme['colors'][1], alpha=0.9)
        bars3 = ax.bar(x + width, monetary, width, label='Monetary ($/100)', 
                      color=theme['colors'][2], alpha=0.9)
        
        ax.set_xlabel('Customer Segments', fontsize=12, 
                     color=theme['text_color'], fontweight='bold')
        ax.set_ylabel('Values', fontsize=12, 
                     color=theme['text_color'], fontweight='bold')
        ax.set_title('Average RFM Values by Segment', 
                    fontsize=16, fontweight='bold', 
                    color=theme['text_color'], pad=20)
        ax.set_xticks(x)
        ax.set_xticklabels(segments, rotation=30, ha='right', 
                          color=theme['text_color'], fontsize=10)
        ax.tick_params(colors=theme['text_color'])
        ax.legend(facecolor=theme['bg_color'], edgecolor=theme['grid_color'],
                 labelcolor=theme['text_color'], fontsize=10)
        ax.grid(True, alpha=0.2, color=theme['grid_color'])
        
        for spine in ['top', 'right']:
            ax.spines[spine].set_visible(False)
        for spine in ['bottom', 'left']:
            ax.spines[spine].set_color(theme['grid_color'])
        
        return self._fig_to_base64(fig)
    
    def _generate_elbow_method(self, config: Dict[str, Any], 
                               theme: Dict[str, str]) -> str:
        """Generate elbow method chart."""
        fig, ax1 = plt.subplots(figsize=(12, 7), facecolor=theme['bg_color'])
        ax1.set_facecolor(theme['bg_color'])
        
        k_range = config['k_range']
        wcss = config['wcss']
        silhouette_scores = config['silhouette_scores']
        optimal_k = config['optimal_k']
        
        color1 = theme['colors'][0]
        ax1.set_xlabel('Number of Clusters (K)', fontsize=12, 
                      color=theme['text_color'], fontweight='bold')
        ax1.set_ylabel('WCSS (Inertia)', color=color1, 
                      fontsize=12, fontweight='bold')
        ax1.plot(k_range, wcss[:len(k_range)], 'o-', 
                color=color1, linewidth=2.5, markersize=10)
        ax1.tick_params(axis='y', labelcolor=color1)
        ax1.tick_params(axis='x', colors=theme['text_color'])
        ax1.axvline(x=optimal_k, color=theme['colors'][2], 
                   linestyle='--', linewidth=2, label=f'Optimal K={optimal_k}')
        
        if silhouette_scores:
            ax2 = ax1.twinx()
            ax2.set_facecolor(theme['bg_color'])
            color2 = theme['colors'][1]
            ax2.set_ylabel('Silhouette Score', color=color2, 
                          fontsize=12, fontweight='bold')
            ax2.plot(k_range[1:] if len(k_range) > len(silhouette_scores) else k_range,
                    silhouette_scores, 's-', color=color2, 
                    linewidth=2.5, markersize=10)
            ax2.tick_params(axis='y', labelcolor=color2)
        
        ax1.set_title('Elbow Method for Optimal K Selection', 
                     fontsize=16, fontweight='bold', 
                     color=theme['text_color'], pad=20)
        ax1.grid(True, alpha=0.2, color=theme['grid_color'])
        
        for spine in ['top']:
            ax1.spines[spine].set_visible(False)
        ax1.spines['bottom'].set_color(theme['grid_color'])
        ax1.spines['left'].set_color(color1)
        
        fig.tight_layout()
        return self._fig_to_base64(fig)
    
    def _generate_scatter_plot(self, scatter_data: Dict[str, List[Dict]], 
                               theme: Dict[str, str]) -> str:
        """Generate scatter plot for segments."""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor=theme['bg_color'])
        ax.set_facecolor(theme['bg_color'])
        
        for segment, points in scatter_data.items():
            color = self.SEGMENT_COLORS.get(segment, theme['colors'][0])
            x_vals = [p['y'] for p in points]  # Frequency
            y_vals = [p['z'] for p in points]  # Monetary
            
            ax.scatter(x_vals, y_vals, c=color, label=segment, 
                      alpha=0.7, s=60, edgecolors='white', linewidth=0.5)
        
        ax.set_xlabel('Frequency (Number of Purchases)', 
                     fontsize=12, color=theme['text_color'], fontweight='bold')
        ax.set_ylabel('Monetary Value ($)', 
                     fontsize=12, color=theme['text_color'], fontweight='bold')
        ax.set_title('Customer Segments: Frequency vs Monetary Value', 
                    fontsize=16, fontweight='bold', 
                    color=theme['text_color'], pad=20)
        ax.legend(facecolor=theme['bg_color'], edgecolor=theme['grid_color'],
                 labelcolor=theme['text_color'], fontsize=10,
                 bbox_to_anchor=(1.05, 1), loc='upper left')
        ax.tick_params(colors=theme['text_color'])
        ax.grid(True, alpha=0.2, color=theme['grid_color'])
        
        for spine in ['top', 'right']:
            ax.spines[spine].set_visible(False)
        for spine in ['bottom', 'left']:
            ax.spines[spine].set_color(theme['grid_color'])
        
        return self._fig_to_base64(fig)
    
    def _generate_revenue_chart(self, segment_stats: Dict[str, Dict],
                                segment_insights: Dict[str, Dict],
                                theme: Dict[str, str]) -> str:
        """Generate revenue by segment bar chart."""
        fig, ax = plt.subplots(figsize=(12, 7), facecolor=theme['bg_color'])
        ax.set_facecolor(theme['bg_color'])
        
        # Calculate revenue for each segment
        segments = list(segment_stats.keys())
        revenues = []
        for segment in segments:
            stats = segment_stats[segment]
            revenue = stats['Monetary'] * stats['count']
            revenues.append(revenue)
        
        # Sort by revenue
        sorted_data = sorted(zip(segments, revenues), key=lambda x: x[1], reverse=True)
        segments, revenues = zip(*sorted_data)
        
        colors = [self.SEGMENT_COLORS.get(seg, theme['colors'][0]) for seg in segments]
        
        bars = ax.bar(range(len(segments)), revenues, color=colors, 
                     alpha=0.9, edgecolor='white', linewidth=0.5)
        
        ax.set_xlabel('Customer Segments', fontsize=12, 
                     color=theme['text_color'], fontweight='bold')
        ax.set_ylabel('Total Revenue ($)', fontsize=12, 
                     color=theme['text_color'], fontweight='bold')
        ax.set_title('Total Revenue by Customer Segment', 
                    fontsize=16, fontweight='bold', 
                    color=theme['text_color'], pad=20)
        ax.set_xticks(range(len(segments)))
        ax.set_xticklabels(segments, rotation=30, ha='right', 
                          color=theme['text_color'], fontsize=10)
        ax.tick_params(colors=theme['text_color'])
        ax.grid(True, alpha=0.2, color=theme['grid_color'], axis='y')
        
        for spine in ['top', 'right']:
            ax.spines[spine].set_visible(False)
        for spine in ['bottom', 'left']:
            ax.spines[spine].set_color(theme['grid_color'])
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'${height:,.0f}',
                   ha='center', va='bottom', fontsize=9,
                   color=theme['text_color'], fontweight='bold')
        
        return self._fig_to_base64(fig)
