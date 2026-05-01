import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextRequest, NextResponse } from "next/server";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

function getDateRange(range: string) {
  const ranges: { [key: string]: { startDate: string; endDate: string } } = {
    'today': { startDate: 'today', endDate: 'today' },
    'yesterday': { startDate: 'yesterday', endDate: 'yesterday' },
    '7days': { startDate: '7daysAgo', endDate: 'today' },
    '30days': { startDate: '30daysAgo', endDate: 'today' },
    '90days': { startDate: '90daysAgo', endDate: 'today' },
  };
  return ranges[range] || ranges['7days'];
}

function getComparisonDateRange(range: string) {
  const ranges: { [key: string]: { startDate: string; endDate: string } } = {
    'today': { startDate: 'yesterday', endDate: 'yesterday' },
    'yesterday': { startDate: '2daysAgo', endDate: '2daysAgo' },
    '7days': { startDate: '14daysAgo', endDate: '8daysAgo' },
    '30days': { startDate: '60daysAgo', endDate: '31daysAgo' },
    '90days': { startDate: '180daysAgo', endDate: '91daysAgo' },
  };
  return ranges[range] || ranges['7days'];
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const parseValue = (row: any, index: number, type: 'int' | 'float' = 'int') => {
  const value = row?.metricValues?.[index]?.value || "0";
  return type === 'int' ? parseInt(value) : parseFloat(value);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '7days';
    const { startDate, endDate } = getDateRange(range);
    const comparisonRange = getComparisonDateRange(range);

    // Fetch current period data
    const [currentSummary] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "engagedSessions" },
      ],
    });

    // Fetch previous period data for comparison
    const [previousSummary] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{
        startDate: comparisonRange.startDate,
        endDate: comparisonRange.endDate
      }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "engagedSessions" },
      ],
    });

    const current = currentSummary.rows?.[0];
    const previous = previousSummary.rows?.[0];

    const data = {
      activeUsers: parseValue(current, 0),
      screenPageViews: parseValue(current, 1),
      averageSessionDuration: parseValue(current, 2, 'float'),
      bounceRate: parseValue(current, 3, 'float'),
      sessions: parseValue(current, 4),
      newUsers: parseValue(current, 5),
      engagedSessions: parseValue(current, 6),
    };

    const previousData = {
      activeUsers: parseValue(previous, 0),
      screenPageViews: parseValue(previous, 1),
      averageSessionDuration: parseValue(previous, 2, 'float'),
      bounceRate: parseValue(previous, 3, 'float'),
      sessions: parseValue(previous, 4),
      newUsers: parseValue(previous, 5),
      engagedSessions: parseValue(previous, 6),
    };

    // Calculate trends
    const trends = {
      activeUsers: calculateTrend(data.activeUsers, previousData.activeUsers),
      screenPageViews: calculateTrend(data.screenPageViews, previousData.screenPageViews),
      averageSessionDuration: calculateTrend(data.averageSessionDuration, previousData.averageSessionDuration),
      bounceRate: calculateTrend(data.bounceRate, previousData.bounceRate),
      sessions: calculateTrend(data.sessions, previousData.sessions),
      newUsers: calculateTrend(data.newUsers, previousData.newUsers),
      engagedSessions: calculateTrend(data.engagedSessions, previousData.engagedSessions),
    };

    // Fetch daily trend
    const [dailyTrend] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "sessions" },
      ],
    });

    // Fetch device category
    const [deviceCategory] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
    });

    // Fetch top pages
    const [topPages] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: "pageTitle" },
      ],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
      ],
      limit: 5,
      orderBys: [
        { metric: { metricName: "screenPageViews" }, desc: true }
      ],
    });

    // Fetch country stats
    const [countryStats] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      limit: 5,
      orderBys: [
        { metric: { metricName: "activeUsers" }, desc: true }
      ],
    });

    // Format daily trend
    const formattedDailyTrend = dailyTrend.rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value || '',
      users: parseValue(row, 0),
      pageViews: parseValue(row, 1),
      sessions: parseValue(row, 2),
    })) || [];

    // Format device category
    const formattedDeviceCategory = deviceCategory.rows?.map(row => ({
      device: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseValue(row, 0),
    })) || [];

    const totalDeviceUsers = formattedDeviceCategory.reduce((sum, device) => sum + device.users, 0);
    const formattedDevicesWithPercentage = formattedDeviceCategory.map(device => ({
      ...device,
      percentage: totalDeviceUsers > 0 ? Math.round((device.users / totalDeviceUsers) * 100) : 0,
    }));

    // Format top pages
    const formattedTopPages = topPages.rows?.map(row => ({
      pageTitle: row.dimensionValues?.[0]?.value || 'Untitled Page',
      pageViews: parseValue(row, 0),
      users: parseValue(row, 1),
    })) || [];

    // Format country stats
    const formattedCountryStats = countryStats.rows?.map(row => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseValue(row, 0),
    })) || [];

    const totalCountryUsers = formattedCountryStats.reduce((sum, country) => sum + country.users, 0);
    const formattedCountriesWithPercentage = formattedCountryStats.map(country => ({
      ...country,
      percentage: totalCountryUsers > 0 ? Math.round((country.users / totalCountryUsers) * 100) : 0,
    }));

    return NextResponse.json({
      summary: data,
      trends,
      dailyTrend: formattedDailyTrend,
      deviceCategory: formattedDevicesWithPercentage,
      topPages: formattedTopPages,
      countryStats: formattedCountriesWithPercentage,
      range,
    });
    
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}