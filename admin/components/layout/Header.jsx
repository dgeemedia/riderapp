// admin/components/layout/Header.jsx
import {
  MapPinIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function Header({ admin, onMenuClick, onLogout }) {
  return (
    <nav className="glass-card border-b border-slate-700/50 sticky top-0 z-50">
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onMenuClick}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-800/50 transition-colors touch-target"
            >
              <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center">
                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gradient leading-tight">
                  MypadiFood
                </h1>
                <p className="text-xxs sm:text-xs text-slate-400 hidden sm:block">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center: Search (Desktop only) */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              <input
                type="search"
                placeholder="Search riders, tasks..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors touch-target">
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Profile */}
            {admin && (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">
                    {admin.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-[120px]">
                    {admin.email}
                  </p>
                </div>
                
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base font-semibold">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors touch-target"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 hover:text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}