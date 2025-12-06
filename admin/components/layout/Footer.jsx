// admin/components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-slate-500">
        <div className="mb-2 sm:mb-0">
          © {new Date().getFullYear()} MypadiFood Admin Dashboard v1.0.0
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            System Status: Operational
          </span>
          <span>Last Updated: Just now</span>
        </div>
      </div>
    </footer>
  );
}