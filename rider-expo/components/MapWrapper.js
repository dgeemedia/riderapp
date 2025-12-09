// rider-expo/components/MapWrapper.js
import React, { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function MapWrapper(props) {
  const [MapModule, setMapModule] = useState(null);

  useEffect(() => {
    let mounted = true;
    // do nothing on web — avoid bundling native-only modules
    if (Platform.OS === 'web') return;

    (async () => {
      try {
        const mod = await import('react-native-maps');
        if (!mounted) return;
        const MapView = mod.default || mod;
        setMapModule({
          MapView,
          Marker: mod.Marker,
          Polyline: mod.Polyline,
          PROVIDER_GOOGLE: mod.PROVIDER_GOOGLE,
        });
      } catch (err) {
        console.warn('Failed to load react-native-maps:', err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (Platform.OS === 'web') {
    // Provide a simple fallback for web
    return (
      <View style={[styles.webFallback, props.style]}>
        <Text>Map unavailable on web</Text>
      </View>
    );
  }

  if (!MapModule) {
    return (
      <View style={[styles.loader, props.style]}>
        <ActivityIndicator />
      </View>
    );
  }

  const { MapView } = MapModule;
  return (
    <MapView style={[{ flex: 1 }, props.style]} {...props}>
      {props.children}
    </MapView>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    height: 300,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
