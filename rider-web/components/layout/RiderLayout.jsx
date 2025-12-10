// rider-web/components/layout/RiderLayout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BottomNav from './BottomNav';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

export default function RiderLayout({ children }) {
  const [location, setLocation] = useState(null);
  const { rider, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!rider) {
      router.push('/auth/login');
    }
  }, [rider]);

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  useEffect(() => {
    // Update location every 30 seconds
    updateLocation();
    const interval = setInterval(updateLocation, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!rider) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header rider={rider} location={location} />
      {children}
      <BottomNav />
    </div>
  );
}