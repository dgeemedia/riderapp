// Quick test to see which icons are breaking
import React from 'react';
import * as AllIcons from '@heroicons/react/24/outline';

console.log('🔍 Testing all icon imports...');

const iconNames = Object.keys(AllIcons);
console.log(`Total icons available: ${iconNames.length}`);

// Test a few common ones
const testIcons = [
  'MapPinIcon',
  'UsersIcon', 
  'ClipboardDocumentListIcon',
  'PhoneIcon',
  'ChartBarIcon',
  'Cog6ToothIcon',
  'ArrowRightOnRectangleIcon',
  'BellIcon',
  'MagnifyingGlassIcon',
  'UserGroupIcon',
  'ClockIcon',
  'TrashIcon',
  'XMarkIcon'
];

console.log('\n🧪 Testing specific icons:');
testIcons.forEach(iconName => {
  const Icon = AllIcons[iconName];
  if (!Icon) {
    console.error(`❌ MISSING: ${iconName}`);
  } else if (typeof Icon !== 'function') {
    console.error(`❌ NOT A FUNCTION: ${iconName} (type: ${typeof Icon})`);
  } else {
    console.log(`✅ OK: ${iconName}`);
  }
});

export default function TestIcons() {
  return (
    <div style={{ padding: 20, background: '#f0f0f0' }}>
      <h2>Icon Test</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {testIcons.map(iconName => {
          const Icon = AllIcons[iconName];
          return Icon ? (
            <div key={iconName} style={{ textAlign: 'center', padding: 10, background: 'white', borderRadius: 5 }}>
              <Icon style={{ width: 24, height: 24 }} />
              <div style={{ fontSize: 10, marginTop: 5 }}>{iconName}</div>
            </div>
          ) : (
            <div key={iconName} style={{ textAlign: 'center', padding: 10, background: 'red', color: 'white', borderRadius: 5 }}>
              ❌ {iconName}
            </div>
          );
        })}
      </div>
    </div>
  );
}