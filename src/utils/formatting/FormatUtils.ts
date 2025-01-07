export class FormatUtils {
  static number(value: number, options: {
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}): string {
    const {
      style = 'decimal',
      currency = 'USD',
      minimumFractionDigits = 0,
      maximumFractionDigits = 2
    } = options;

    return new Intl.NumberFormat('en-US', {
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(style === 'percent' ? value / 100 : value);
  }

  static formatMetrics(metrics: BaseMetric[]): string {
    return metrics.map(metric => {
      const valueStr = typeof metric.value === 'number' 
        ? this.number(metric.value, { 
            style: metric.name.toLowerCase().includes('percent') ? 'percent' : 'decimal'
          })
        : metric.value;
        
      const trendIndicator = metric.trend 
        ? ` (${metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}${
            metric.changePercent 
              ? ' ' + this.number(metric.changePercent, { style: 'percent' })
              : ''
          })`
        : '';

      return `- ${metric.name}: ${valueStr}${trendIndicator}`;
    }).join('\n');
  }
}