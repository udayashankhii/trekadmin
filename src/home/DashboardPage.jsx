import React from 'react';
import { Plus, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import Card from '../components/ui/Card';

const DashboardPage = () => {
  const stats = [
    {
      label: 'Total Treks',
      value: '3',
      change: '+12.5%',
      icon: '🏔️',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Active Bookings',
      value: '2',
      change: '+8.2%',
      icon: '📅',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Users',
      value: '3',
      change: '+23.1%',
      icon: '👥',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Revenue',
      value: 'NPR 4.8M',
      change: '+15.3%',
      icon: '💰',
      bgColor: 'bg-orange-50'
    }
  ];

  const activities = [
    { type: 'New Booking', desc: 'Rajesh Kumar • Everest Base Camp', time: '2 hours ago' },
    { type: 'Trek Created', desc: 'Admin • Langtang Valley', time: '5 hours ago' },
    { type: 'User Signup', desc: 'Priya Singh New member joined', time: '1 day ago' }
  ];

  const quickActions = [
    { icon: <Plus size={40} className="text-purple-500" />, title: 'Add New Trek', desc: 'Create a new trek package' },
    { icon: <BarChart3 size={40} className="text-green-500" />, title: 'View Reports', desc: 'Analytics and insights' },
    { icon: <SettingsIcon size={40} className="text-slate-500" />, title: 'Settings', desc: 'Configure your panel' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1 font-medium">{stat.change}</p>
              </div>
              <div className={`${stat.bgColor} w-14 h-14 rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Card title="Recent Activity">
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{activity.type}</p>
                <p className="text-sm text-slate-600 mt-1">{activity.desc}</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all text-center group"
          >
            <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h3>
            <p className="text-sm text-slate-600">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
