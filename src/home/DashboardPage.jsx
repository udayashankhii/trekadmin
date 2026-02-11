import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { fetchDashboardStats, fetchBookingStats, fetchTreksList } from '../components/api/adminDashboard';

const ICON_MAP = {
  treks: '🏔️',
  bookings: '📅',
  users: '👥',
  revenue: '💰',
};

const BG_MAP = {
  treks: 'bg-green-50',
  bookings: 'bg-blue-50',
  users: 'bg-purple-50',
  revenue: 'bg-orange-50',
};

const TREND_COLOR = {
  up: 'text-green-600',
  down: 'text-red-600',
};

const DashboardPage = () => {
  const [summaryCards, setSummaryCards] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [topTreks, setTopTreks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // fetch all data concurrently
        const [dashboardData, bookingData, treksData] = await Promise.all([
          fetchDashboardStats(),
          fetchBookingStats(),
          fetchTreksList()
        ]);

        // Dashboard stats
        setSummaryCards(dashboardData?.summary_cards || []);
        setRecentActivity(dashboardData?.recent_activity || []);
        setTopTreks(dashboardData?.top_treks || []);

        // Booking stats
        setBookingStats(bookingData || null);

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-slate-500 py-20 text-center">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((stat) => (
          <Card key={stat.key} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 font-medium ${TREND_COLOR[stat.trend]}`}>
                  {stat.change}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.detail}</p>
              </div>
              <div className={`${BG_MAP[stat.key]} w-14 h-14 rounded-xl flex items-center justify-center text-2xl`}>
                {ICON_MAP[stat.key]}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Booking Stats */}
      {bookingStats && (
        <Card title="Booking Stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Bookings</p>
              <p className="text-xl font-bold text-slate-900">{bookingStats.total_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Paid Bookings</p>
              <p className="text-xl font-bold text-slate-900">{bookingStats.paid_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Bookings</p>
              <p className="text-xl font-bold text-slate-900">{bookingStats.pending_count}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Total Revenue: {bookingStats.total_revenue}
          </div>
        </Card>
      )}

      {/* Top Treks */}
      {topTreks.length > 0 && (
        <Card title="Top Treks">
          <Table
            columns={[
              { header: 'Trek', key: 'title' },
              { header: 'Bookings', key: 'bookings' }
            ]}
            data={topTreks.map((trek) => ({
              title: trek.title,
              bookings: trek.bookings
            }))}
          />
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{activity.subtitle}</p>
                  {activity.status && (
                    <Badge
                      variant={
                        activity.status === 'paid'
                          ? 'success'
                          : activity.status === 'pending_payment'
                          ? 'warning'
                          : 'default'
                      }
                      className="mt-1"
                    >
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
