import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export const TrendIndicator = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20";

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
    ? "text-green-400"
    : trendType === "negative"
      ? "text-red-400"
      : "text-gray-400";

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800/50 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            </div>
          </div>
          {trend !== undefined && <TrendIndicator value={trend} />}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-3">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
