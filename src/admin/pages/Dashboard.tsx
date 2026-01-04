import React from 'react';

const StatCard = ({ title, value, change }: { title: string, value: string, change?: string }) => (
  <div className="bg-[#111111] p-6 rounded-xl border border-white/10">
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-white">{value}</span>
      {change && <span className="text-sm text-[#D6B25E]">{change}</span>}
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value="12" change="+2 this month" />
        <StatCard title="Active Inquiries" value="24" change="5 new" />
        <StatCard title="Pending Quotes" value="8" />
        <StatCard title="Total Reviews" value="156" change="4.9 avg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] p-6 rounded-xl border border-white/10 h-80">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="flex items-center justify-center h-full text-gray-500">
             Chart Placeholder
          </div>
        </div>
        <div className="bg-[#111111] p-6 rounded-xl border border-white/10 h-80">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Inquiries</h3>
          <div className="space-y-4">
             {/* Mock list */}
             {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                        <div className="text-white text-sm font-medium">John Doe</div>
                        <div className="text-gray-500 text-xs">Interested in Luxury Villa</div>
                    </div>
                    <span className="text-xs text-gray-400">2h ago</span>
                 </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
