// admin/components/layout/MobileMenu.jsx
import {
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function MobileMenu({ isOpen, onClose, navItems }) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-0 right-0 w-64 h-full glass-card shadow-xl">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Menu</h3>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors mb-1"
                onClick={onClose}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{item.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}