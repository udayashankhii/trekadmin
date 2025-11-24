import React from 'react';
import { BarChart3 } from 'lucide-react';
import Card from '../components/ui/Card';

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-12 text-slate-500">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>Analytics dashboard coming soon</p>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
