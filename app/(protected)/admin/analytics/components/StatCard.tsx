import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export const TrendIndicator = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "bg-green-500/10 text-theme-success-ink border-green-500/20" : "bg-red-500/10 text-theme-error-ink border-red-500/20";

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colorClass}`}>
      <TrendIcon className="w-3 h-3" />
      <span className="text-xs font-medium">
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
};

export const StatCard = ({
  icon,
  title,
  value,
  trend,
  description,
  trendType = "neutral"
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: number;
  description?: string;
  trendType?: "positive" | "negative" | "neutral";
}) => {
  const trendColor = trendType === "positive"
    ? "text-theme-success-ink"
    : trendType === "negative"
      ? "text-theme-error-ink"
      : "text-theme-muted";

  return (
    <Card className="bg-gradient-to-br from-theme-surface/50 to-black border-theme-ink/15 hover:border-theme-ink/15 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-theme-surface/50 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-2xl font-bold mt-1 text-theme-ink">{value}</p>
            </div>
          </div>
          {trend !== undefined && <TrendIndicator value={trend} />}
        </div>
        {description && (
          <p className="text-xs text-theme-muted mt-3">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
