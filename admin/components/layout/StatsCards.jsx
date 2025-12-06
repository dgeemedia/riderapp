// admin/components/layout/StatsCards.jsx
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    title: 'Active Riders',
    value: '24',
    change: '+12% from last week',
    icon: UsersIcon,
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-400',
  },
  {
    title: 'Active Tasks',
    value: '18',
    change: '3 pending assignment',
    icon: ClipboardDocumentListIcon,
    color: 'from-orange-500 to-pink-600',
    textColor: 'text-yellow-400',
  },
  {
    title: 'Avg. Response',
    value: '4.2m',
    change: '↓ 0.5m improvement',
    icon: ChartBarIcon,
    color: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-400',
  },
  {
    title: 'Success Rate',
    value: '98.7%',
    change: 'Consistent performance',
    icon: Cog6ToothIcon,
    color: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-400',
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass-card rounded-lg sm:rounded-xl hover-card"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 mb-1 truncate">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className={`text-xs ${stat.textColor} hidden sm:block truncate`}>
                  {stat.change}
                </p>
              </div>
              
              <div className={`ml-3 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            
            {/* Mobile change text */}
            <p className={`text-xs ${stat.textColor} sm:hidden mt-2`}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}