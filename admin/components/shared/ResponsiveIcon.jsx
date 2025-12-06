// admin/components/shared/ResponsiveIcon.jsx
import React from 'react';

// Import ALL possible icons we might need
import * as AllIcons from '@heroicons/react/24/outline';

export default function ResponsiveIcon({ 
  icon: Icon, 
  size = 'base',
  className = '',
  mobileSize,
  tabletSize,
  desktopSize,
  fallback = null,
  ...props
}) {
  // If Icon is undefined or null, show a clear error placeholder
  if (!Icon) {
    console.error('🚨 EMERGENCY: ResponsiveIcon received undefined icon!');
    console.error('Props received:', { size, mobileSize, tabletSize, desktopSize, className });
    
    // Return a clear error indicator
    return (
      <div 
        className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center animate-pulse"
        title="ERROR: Undefined icon"
      >
        <span className="text-white font-bold">?</span>
      </div>
    );
  }
  
  // If Icon is a string (icon name), try to get it from AllIcons
  if (typeof Icon === 'string') {
    const IconComponent = AllIcons[Icon];
    if (IconComponent) {
      console.warn(`⚠️  ResponsiveIcon received string "${Icon}", converted to component`);
      Icon = IconComponent;
    } else {
      console.error(`🚨 EMERGENCY: Icon string "${Icon}" not found in Heroicons`);
      return (
        <div 
          className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center"
          title={`Missing icon: ${Icon}`}
        >
          <span className="text-white text-xs">{Icon.charAt(0)}</span>
        </div>
      );
    }
  }
  
  // If Icon is still not a function, show error
  if (typeof Icon !== 'function') {
    console.error('🚨 EMERGENCY: Icon is not a function after processing:', Icon);
    return (
      <div 
        className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center"
        title="Invalid icon type"
      >
        <span className="text-white font-bold">!</span>
      </div>
    );
  }
  
  // Generate responsive classes
  const sizeClasses = {
    'xs': 'w-3 h-3',
    'sm': 'w-4 h-4',
    'base': 'w-5 h-5',
    'lg': 'w-6 h-6',
    'xl': 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  const getSizeClass = (sizeKey) => {
    return sizeClasses[sizeKey] || sizeClasses.base;
  };

  const getResponsiveClasses = () => {
    const classes = [];
    classes.push(getSizeClass(mobileSize || size));
    
    if (tabletSize || mobileSize) {
      classes.push(`sm:${getSizeClass(tabletSize || mobileSize || size)}`);
    }
    
    if (desktopSize || tabletSize || mobileSize) {
      classes.push(`md:${getSizeClass(desktopSize || tabletSize || mobileSize || size)}`);
    }
    
    classes.push(`lg:${getSizeClass(desktopSize || tabletSize || mobileSize || size)}`);
    
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };

  try {
    // Try to render the icon
    return React.createElement(Icon, {
      className: getResponsiveClasses(),
      ...props
    });
  } catch (error) {
    console.error('🚨 EMERGENCY: Failed to render icon:', error);
    console.error('Icon that failed:', Icon);
    
    return (
      <div 
        className={`${getResponsiveClasses()} bg-yellow-500 rounded flex items-center justify-center`}
        title="Failed to render icon"
      >
        <span className="text-white text-xs">X</span>
      </div>
    );
  }
}