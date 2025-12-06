import {
  MapPinIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ClockIcon,
  TrashIcon,
  XMarkIcon,
  // Add more icons as needed
} from '@heroicons/react/24/outline';

// Icon dictionary for easy access
export const icons = {
  MapPin: MapPinIcon,
  Users: UsersIcon,
  ClipboardDocumentList: ClipboardDocumentListIcon,
  Phone: PhoneIcon,
  ChartBar: ChartBarIcon,
  Cog6Tooth: Cog6ToothIcon,
  ArrowRightOnRectangle: ArrowRightOnRectangleIcon,
  Bell: BellIcon,
  MagnifyingGlass: MagnifyingGlassIcon,
  UserGroup: UserGroupIcon,
  Clock: ClockIcon,
  Trash: TrashIcon,
  XMark: XMarkIcon,
};

// Helper function to get icon by name
export const getIcon = (iconName) => {
  return icons[iconName] || null;
};

// Pre-defined icon sets for different parts of the app
export const iconSets = {
  navigation: {
    dashboard: ChartBarIcon,
    riders: UsersIcon,
    tasks: ClipboardDocumentListIcon,
    calls: PhoneIcon,
    analytics: ChartBarIcon,
    settings: Cog6ToothIcon,
  },
  actions: {
    logout: ArrowRightOnRectangleIcon,
    search: MagnifyingGlassIcon,
    notify: BellIcon,
    close: XMarkIcon,
    delete: TrashIcon,
    time: ClockIcon,
  },
  stats: {
    riders: UsersIcon,
    tasks: ClipboardDocumentListIcon,
    response: ChartBarIcon,
    success: Cog6ToothIcon,
  },
};

export default icons;