'use client'

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users,
  Eye,
  Clock,
  TrendingDown,
  Smartphone,
  Globe,
  BarChart3,
  Zap,
  UserPlus,
  Activity,
  PieChart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UsersChart } from "./components/UsersChart";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {StatCard, TrendIndicator} from "./components/StatCard";
import LoadingSkeleton from "./components/LoadingSkeleton";

interface AnalyticsData {
  summary: {
    activeUsers: number;
    screenPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    sessions: number;
    newUsers: number;
    engagedSessions: number;
  };
  trends: {
    activeUsers: number;
    screenPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    sessions: number;
    newUsers: number;
    engagedSessions: number;
  };
  dailyTrend: Array<{
    date: string;
    users: number;
    pageViews: number;
    sessions: number;
  }>;
  deviceCategory: Array<{
    device: string;
    users: number;
    percentage: number;
  }>;
  topPages: Array<{
    pageTitle: string;
    pageViews: number;
    users: number;
  }>;
  countryStats: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
  range: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};



function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analyticsData = await response.json();

        if (analyticsData.error) {
          throw new Error(analyticsData.error);
        }

        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(err instanceof Error ? err.message : "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);


  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time insights into your website performance</p>
          </div>
        </div>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Data</h3>
            <p className="text-gray-400 mb-4">{error || "Unknown error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time insights into your website performance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Live Data</span>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-400" />}
          title="Active Users"
          value={formatNumber(data.summary.activeUsers)}
          trend={data.trends.activeUsers}
          description="Users who visited your site"
          trendType={data.trends.activeUsers >= 0 ? "positive" : "negative"}
        />

        <StatCard
          icon={<Eye className="w-5 h-5 text-purple-400" />}
          title="Page Views"
          value={formatNumber(data.summary.screenPageViews)}
          trend={data.trends.screenPageViews}
          description="Total pages viewed"
          trendType={data.trends.screenPageViews >= 0 ? "positive" : "negative"}
        />

        <StatCard
          icon={<Clock className="w-5 h-5 text-green-400" />}
          title="Avg. Session"
          value={formatTime(data.summary.averageSessionDuration)}
          trend={data.trends.averageSessionDuration}
          description="Average session duration"
          trendType={data.trends.averageSessionDuration >= 0 ? "positive" : "negative"}
        />

        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-amber-400" />}
          title="Bounce Rate"
          value={`${data.summary.bounceRate.toFixed(1)}%`}
          trend={data.trends.bounceRate}
          description="Lower is better"
          trendType={data.trends.bounceRate <= 0 ? "positive" : "negative"}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatNumber(data.summary.sessions)}</p>
              </div>
              <div className="ml-auto">
                <TrendIndicator value={data.trends.sessions} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Total visits to your site</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatNumber(data.summary.newUsers)}</p>
              </div>
              <div className="ml-auto">
                <TrendIndicator value={data.trends.newUsers} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">First-time visitors</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatNumber(data.summary.engagedSessions)}</p>
              </div>
              <div className="ml-auto">
                <TrendIndicator value={data.trends.engagedSessions} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Sessions lasting 10+ seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">Overview</TabsTrigger>
          <TabsTrigger value="audience" className="data-[state=active]:bg-gray-800">Audience</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-gray-800">Content</TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-gray-800">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Trend Chart */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">User Activity Trend</CardTitle>
              <CardDescription className="text-gray-400">
                Daily performance over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersChart data={data.dailyTrend} />
            </CardContent>
          </Card>

          {/* Device & Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Category */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white">Device Category</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Distribution of users by device type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.deviceCategory.map((device, index) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' : 'bg-purple-500'
                            }`} />
                          <span className="text-sm font-medium text-gray-300">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-white">
                            {formatNumber(device.users)}
                          </span>
                          <span className="text-sm text-gray-400 w-12 text-right">
                            {device.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${device.percentage}%`,
                            backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-white">Top Pages</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Most visited pages on your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {page.pageTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {formatNumber(page.users)} users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">
                          {formatNumber(page.pageViews)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AUDIENCE TAB with Graphs */}
        <TabsContent value="audience" className="space-y-6">
          {/* Geographic Distribution Chart */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-white">Geographic Distribution</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Top countries by user count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.countryStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                    <XAxis
                      dataKey="country"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      formatter={(value) => [value, 'Users']}
                      labelFormatter={(label) => `Country: ${label}`}
                      contentStyle={{
                        backgroundColor: '#0D0D0D',
                        borderColor: '#333',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar
                      dataKey="users"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="Users"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Country List with Progress Bars */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Country Statistics</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed breakdown by country
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.countryStats.map((country, index) => (
                  <div key={country.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400 w-6">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-white">{country.country}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">
                          {formatNumber(country.users)}
                        </span>
                        <span className="text-sm text-gray-400 w-12 text-right">
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 bg-amber-500"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTENT TAB with Graphs */}
        <TabsContent value="content" className="space-y-6">
          {/* Page Views Bar Chart */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Pages Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Page views comparison across top pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topPages}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={true} vertical={false} />
                    <XAxis
                      type="number"
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis
                      type="category"
                      dataKey="pageTitle"
                      width={150}
                      stroke="#666"
                      fontSize={12}
                      tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                    />
                    <Tooltip
                      formatter={(value) => [value, 'Page Views']}
                      contentStyle={{
                        backgroundColor: '#0D0D0D',
                        borderColor: '#333',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="pageViews"
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                      name="Page Views"
                    />
                    <Bar
                      dataKey="users"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      name="Users"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Page Details List */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Content Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed page analytics and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPages.map((page, index) => {
                  const percentage = data.summary.activeUsers > 0
                    ? (page.users / data.summary.activeUsers) * 100
                    : 0;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{page.pageTitle}</h4>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">{formatNumber(page.pageViews)} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">{formatNumber(page.users)} users</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 bg-green-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEVICES TAB with Graphs */}
        <TabsContent value="devices" className="space-y-6">
          {/* Device Distribution Pie/Doughnut Chart */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Device Distribution</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Percentage breakdown by device type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => {
                        const deviceData = entry as any;
                        return `${deviceData.device}: ${deviceData.percentage}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="device"
                    >
                      {data.deviceCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0 ? '#3b82f6' :
                              index === 1 ? '#10b981' : '#8b5cf6'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: '#0D0D0D',
                        borderColor: '#333',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Category Details */}
          <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Device Category Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed breakdown by device type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.deviceCategory.map((device, index) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' : 'bg-purple-500'
                          }`} />
                        <span className="text-sm font-medium text-gray-300">{device.device}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">
                          {formatNumber(device.users)}
                        </span>
                        <span className="text-sm text-gray-400 w-12 text-right">
                          {device.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${device.percentage}%`,
                          backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.deviceCategory.map((device, index) => (
              <Card key={device.device} className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${index === 0 ? 'bg-blue-500/10' :
                        index === 1 ? 'bg-green-500/10' : 'bg-purple-500/10'
                      }`}>
                      <Smartphone className={`w-5 h-5 ${index === 0 ? 'text-blue-400' :
                          index === 1 ? 'text-green-400' : 'text-purple-400'
                        }`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{device.device}</p>
                      <p className="text-2xl font-bold mt-1">{formatNumber(device.users)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {device.percentage}% of total users
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-black border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Performance Summary</CardTitle>
          <CardDescription className="text-gray-400">
            Key metrics compared to previous period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Users", value: data.summary.activeUsers, trend: data.trends.activeUsers },
              { label: "Page Views", value: data.summary.screenPageViews, trend: data.trends.screenPageViews },
              { label: "Sessions", value: data.summary.sessions, trend: data.trends.sessions },
              { label: "New Users", value: data.summary.newUsers, trend: data.trends.newUsers },
            ].map((metric, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-800/30">
                <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-white">{formatNumber(metric.value)}</p>
                  <TrendIndicator value={metric.trend} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback="loading...">
      <AnalyticsPage />
    </Suspense>
  )
}