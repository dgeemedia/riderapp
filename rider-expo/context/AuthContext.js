// rider-expo/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('rider_token');
      const storedUser = await AsyncStorage.getItem('rider_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Fetch fresh profile
        try {
          const response = await API.get('/riders/profile', storedToken);
          setProfile(response);
        } catch (error) {
          console.warn('Failed to fetch fresh profile:', error);
          setProfile(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, code) => {
    try {
      const response = await API.post('/auth/verify', { phone, code });
      
      if (response.token && response.rider) {
        await AsyncStorage.setItem('rider_token', response.token);
        await AsyncStorage.setItem('rider_user', JSON.stringify(response.rider));
        
        setToken(response.token);
        setUser(response.rider);
        setProfile(response.rider);
        
        return { success: true, data: response.rider };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const sendOtp = async (phone) => {
    try {
      await API.post('/auth/otp', { phone });
      return { success: true };
    } catch (error) {
      console.error('OTP error:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await API.put('/riders/profile', data, token);
      setProfile(response);
      setUser(response);
      await AsyncStorage.setItem('rider_user', JSON.stringify(response));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('rider_token');
      await AsyncStorage.removeItem('rider_user');
      setToken(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        sendOtp,
        updateProfile,
        logout,
        refreshProfile: loadStoredAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};