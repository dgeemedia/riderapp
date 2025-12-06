// rider-expo/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useLocation } from '../context/LocationContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDistance, format } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const { profile, logout } = useAuth();
  const { tasks, currentTask, loading, refreshTasks } = useTasks();
  const { location, isTracking } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      isOnline ? 'Go Offline?' : 'Go Online?',
      isOnline 
        ? 'You won\'t receive new tasks while offline'
        : 'You will start receiving new tasks',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isOnline ? 'Go Offline' : 'Go Online',
          onPress: () => {
            // In production, call API to update online status
            Alert.alert(
              'Success',
              `You are now ${isOnline ? 'offline' : 'online'}`
            );
          }
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout',
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const activeTasks = tasks.filter(task => 
    ['pending', 'assigned', 'accepted', 'picked_up'].includes(task.status)
  );

  const completedTasks = tasks.filter(task => 
    ['delivered', 'cancelled'].includes(task.status)
  ).slice(0, 5); // Show only recent 5

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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10b981"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.name || 'Rider'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleOnlineStatus}>
            <Text style={styles.toggleText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₦{profile?.wallet_balance || 0}
            </Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
        </View>
      </View>

      {/* Location Status */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={20} color="#10b981" />
          <Text style={styles.locationTitle}>Location</Text>
        </View>
        <Text style={styles.locationStatus}>
          {isTracking ? 'Tracking active' : 'Tracking paused'}
        </Text>
        {location && (
          <Text style={styles.locationCoords}>
            {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {activeTasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskCard}
              onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { taskId: task.id } })}
            >
              <View style={styles.taskHeader}>
                <View style={[
                  styles.taskStatusBadge,
                  { backgroundColor: getStatusColor(task.status) + '20' }
                ]}>
                  <Text style={[
                    styles.taskStatusText,
                    { color: getStatusColor(task.status) }
                  ]}>
                    {getStatusText(task.status)}
                  </Text>
                </View>
                <Text style={styles.taskPrice}>
                  ₦{task.price_bigint ? (task.price_bigint / 100) : '--'}
                </Text>
              </View>
              
              <View style={styles.taskLocations}>
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {task.pickup?.address || 'Pickup location'}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {task.dropoff?.address || 'Dropoff location'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.taskTime}>
                {format(new Date(task.created_at), 'HH:mm')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="call-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="wallet-outline" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Wallet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
              <Ionicons name="person-outline" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Completed Tasks */}
      {completedTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Deliveries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {completedTasks.map(task => (
            <View key={task.id} style={styles.completedTaskCard}>
              <View style={styles.completedTaskInfo}>
                <Text style={styles.completedTaskFromTo}>
                  {task.pickup?.area || 'Pickup'} → {task.dropoff?.area || 'Dropoff'}
                </Text>
                <Text style={styles.completedTaskTime}>
                  {format(new Date(task.updated_at), 'MMM d, HH:mm')}
                </Text>
              </View>
              <Text style={styles.completedTaskAmount}>
                +₦{task.price_bigint ? (task.price_bigint / 100) : '--'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  locationCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 15,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationStatus: {
    color: '#10b981',
    fontSize: 14,
    marginBottom: 4,
  },
  locationCoords: {
    color: '#94a3b8',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskLocations: {
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
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
  taskTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  completedTaskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
  },
  completedTaskInfo: {
    flex: 1,
  },
  completedTaskFromTo: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedTaskTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  completedTaskAmount: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
});