// rider-expo/components/TaskCard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TaskCard({ task, onPress }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      assigned: '#3b82f6',
      accepted: '#8b5cf6',
      picked_up: '#ec4899',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(task.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(task.status) }
          ]}>
            {getStatusText(task.status)}
          </Text>
        </View>
        <Text style={styles.price}>
          ₦{task.price_bigint ? (task.price_bigint / 100) : '--'}
        </Text>
      </View>

      <View style={styles.locations}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {task.pickup?.address || 'Pickup location'}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {task.dropoff?.address || 'Dropoff location'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.time}>
          {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locations: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    color: '#94a3b8',
    fontSize: 12,
  },
});