// rider-expo/screens/IncomingCallScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND = process.env.EXPO_PUBLIC_BACKEND || 'http://localhost:4000';

export default function IncomingCallScreen() {
  const [incoming, setIncoming] = useState(null); // { callId, channel, caller_type, caller_id }
  const [tokenData, setTokenData] = useState(null); // { appId, token, channel, uid }
  const socketRef = useRef(null);

  useEffect(() => {
    (async () => {
      const tk = await AsyncStorage.getItem('rider_token');
      if (!tk) return Alert.alert('Not signed in');

      const socket = io(BACKEND, { auth: { token: tk } });
      socket.on('connect', () => console.log('socket connected'));
      socket.on('incoming_call', async (payload) => {
        console.log('incoming_call', payload);
        setIncoming(payload);
      });
      socketRef.current = socket;
    })();

    return () => socketRef.current?.disconnect();
  }, []);

  async function acceptCall() {
    try {
      const tk = await AsyncStorage.getItem('rider_token');
      if (!tk) return Alert.alert('Missing token');

      // Request token for the provided channel
      const res = await fetch(BACKEND + '/api/call/agora/token', {
        method: 'POST',
        headers: { 'content-type':'application/json', Authorization: 'Bearer ' + tk },
        body: JSON.stringify({ channel: incoming.channel })
      });
      const j = await res.json();
      if (!res.ok) return Alert.alert('Token error', j.error || 'token failed');
      setTokenData(j);
    } catch (err) {
      Alert.alert('Accept error', err.message || err);
    }
  }

  // When tokenData exists, open the WebView to the server-served client
  const clientUrl = tokenData ? `${BACKEND}/api/call/client?appId=${encodeURIComponent(tokenData.appId)}&token=${encodeURIComponent(tokenData.token)}&channel=${encodeURIComponent(tokenData.channel)}&uid=${tokenData.uid}` : null;

  return (
    <View style={{ flex: 1 }}>
      {!tokenData && incoming && (
        <View style={{ padding: 16 }}>
          <Text>Incoming call from {incoming.caller_type}</Text>
          <Button title="Accept" onPress={acceptCall} />
          <Button title="Reject" onPress={() => setIncoming(null)} />
        </View>
      )}
      {tokenData && clientUrl && (
        <WebView source={{ uri: clientUrl }} style={{ flex: 1 }} />
      )}
      {!incoming && !tokenData && (
        <View style={{ padding: 16 }}><Text>Waiting for calls...</Text></View>
      )}
    </View>
  );
}
