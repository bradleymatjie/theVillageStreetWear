'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';

interface ChartData {
  date: string;
  users: number;
  pageViews?: number;
  sessions?: number;
}

interface UsersChartProps {
  data: ChartData[];
}

export function UsersChart({ data }: UsersChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${month}/${day}`;
    } catch {
      return dateStr;
    }
  };

  const formattedData = data.map(d => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-gray-300 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-400">{entry.dataKey}:</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#2A2A2A" 
            vertical={false}
          />
          <XAxis
            dataKey="formattedDate"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-sm text-gray-400">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            fill="url(#colorUsers)"
            strokeWidth={2}
            fillOpacity={0.1}
            name="Active Users"
          />
          <Line
            type="monotone"
            dataKey="pageViews"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Page Views"
          />
          <Line
            type="monotone"
            dataKey="sessions"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            name="Sessions"
          />
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}