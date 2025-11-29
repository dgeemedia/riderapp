// rider-expo/App.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import io from 'socket.io-client';

const BACKEND = process.env.EXPO_PUBLIC_BACKEND || 'http://localhost:4000';

export default function App() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(null);
  const [rider, setRider] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    }
  }, []);

  const sendOtp = async () => {
    await fetch(BACKEND + '/api/auth/otp', { method: 'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ phone })});
    Alert.alert('OTP sent (starter logs code to backend).');
  };

  const verify = async () => {
    const r = await fetch(BACKEND + '/api/auth/verify', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ phone, code }) });
    const j = await r.json();
    if (!r.ok) return Alert.alert('Error', j.error || 'verify failed');
    setToken(j.token);
    setRider(j.rider);
    connectSocket(j.token);
    startLocationLoop(j.token);
  };

  const connectSocket = (tk) => {
    const socket = io(BACKEND, { auth: { token: tk }});
    socket.on('connect', () => console.log('socket connected'));
    socket.on('ping', (m) => Alert.alert('Ping', m.message || 'Ping from dispatch'));
    socketRef.current = socket;
  };

  const startLocationLoop = async (tk) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied');
      return;
    }
    Location.watchPositionAsync({ distanceInterval: 10, timeInterval: 15000 }, async (loc) => {
      const { latitude: lat, longitude: lng, accuracy } = loc.coords;
      await fetch(BACKEND + '/api/riders/location', { method:'POST', headers:{ 'content-type':'application/json', Authorization: 'Bearer ' + tk }, body: JSON.stringify({ lat, lng, accuracy }) });
    });
  };

  if (!token) {
    return (
      <View style={{ padding: 20, marginTop: 40 }}>
        <Text style={{ marginBottom: 8 }}>Phone (include country code, e.g. +234...)</Text>
        <TextInput placeholder="+234..." value={phone} onChangeText={setPhone} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
        <Button title="Send OTP" onPress={sendOtp} />
        <View style={{ height: 20 }} />
        <Text>Enter code</Text>
        <TextInput value={code} onChangeText={setCode} style={{ borderWidth:1, padding:8, marginBottom:12 }} />
        <Button title="Verify" onPress={verify} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20, marginTop: 40 }}>
      <Text>Signed in as: {rider?.phone}</Text>
      <Text>App will send background location updates (starter behavior depends on Expo environment).</Text>
      <Button title="Send test accept (emit task:accept)" onPress={() => socketRef.current?.emit('task:accept', { taskId: 'demo-1' })} />
    </View>
  );
}
