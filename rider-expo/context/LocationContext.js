// rider-expo/context/LocationContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { API } from '../utils/api';
import { useAuth } from './AuthContext';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchSubscription = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isAuthenticated]);

  const startLocationTracking = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation);

      // Start watching for location updates
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50, // Update every 50 meters
          timeInterval: 30000, // Update every 30 seconds
        },
        async (newLocation) => {
          setLocation(newLocation);
          
          // Send location to server
          if (token) {
            try {
              await API.post(
                '/riders/location',
                {
                  lat: newLocation.coords.latitude,
                  lng: newLocation.coords.longitude,
                  accuracy: newLocation.coords.accuracy,
                },
                token
              );
            } catch (error) {
              console.warn('Failed to send location:', error);
            }
          }
        }
      );

      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg(error.message);
    }
  };

  const stopLocationTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        errorMsg,
        isTracking,
        getCurrentLocation,
        startLocationTracking,
        stopLocationTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};