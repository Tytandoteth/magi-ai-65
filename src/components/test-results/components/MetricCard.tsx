import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, trend }) => {
  const getTrendColor = () => {
    if (!trend) return 'text-foreground';
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-3 bg-background rounded-lg border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className={`font-medium flex items-center gap-1 ${getTrendColor()}`}>
        {value}
        {trend && (
          trend === 'up' ? 
            <ArrowUp className="h-4 w-4" /> : 
            <ArrowDown className="h-4 w-4" />
        )}
      </div>
    </div>
  );
};