// rider-expo/screens/TaskScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { format, formatDistance } from 'date-fns';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function TaskScreen({ navigation }) {
  const { tasks, loading, refreshTasks, acceptTask, updateTaskStatus } = useTasks();
  const { profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [modalVisible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'assigned', 'accepted', 'picked_up'].includes(task.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(task.status);
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      assigned: '#3B82F6',
      accepted: '#8B5CF6',
      picked_up: '#EC4899',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleAccept = async (taskId) => {
    Alert.alert(
      'Accept Task',
      'Do you want to accept this delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const result = await acceptTask(taskId);
            if (result.success) {
              Alert.alert('Success', 'Task accepted successfully');
              setModalVisible(false);
            } else {
              Alert.alert('Error', result.error || 'Failed to accept task');
            }
          },
        },
      ]
    );
  };

  const handleStatusUpdate = async (taskId, status) => {
    const result = await updateTaskStatus(taskId, status);
    if (result.success) {
      Alert.alert('Success', `Task marked as ${status.replace('_', ' ')}`);
      setModalVisible(false);
    } else {
      Alert.alert('Error', result.error || 'Failed to update task');
    }
  };

  const renderTaskCard = ({ item }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => handleTaskPress(item)}>
      <View style={styles.taskHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.taskPrice}>₦{(item.price_bigint || 0) / 100}</Text>
      </View>

      <View style={styles.taskLocations}>
        <View style={styles.locationRow}>
          <Icon name="location" size={16} color="#10B981" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickup?.address || 'Pickup location'}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Icon name="location" size={16} color="#EF4444" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.dropoff?.address || 'Dropoff location'}
          </Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <Text style={styles.taskTime}>
          {format(new Date(item.created_at), 'MMM d, h:mm a')}
        </Text>
        <Icon name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const TaskDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          {selectedTask && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Task Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Status & Price */}
                <View style={styles.modalStatusRow}>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedTask.status) + '20' }]}>
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedTask.status) }]}>
                      {getStatusText(selectedTask.status)}
                    </Text>
                  </View>
                  <Text style={styles.modalPrice}>₦{(selectedTask.price_bigint || 0) / 100}</Text>
                </View>

                {/* Pickup & Dropoff */}
                <View style={styles.locationSection}>
                  <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                      <Icon name="location" size={20} color="#10B981" />
                      <Text style={styles.locationTitle}>Pickup</Text>
                    </View>
                    <Text style={styles.locationAddress}>
                      {selectedTask.pickup?.address || 'No address'}
                    </Text>
                    {selectedTask.pickup?.instructions && (
                      <Text style={styles.instructions}>
                        📝 {selectedTask.pickup.instructions}
                      </Text>
                    )}
                  </View>

                  <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                      <Icon name="location" size={20} color="#EF4444" />
                      <Text style={styles.locationTitle}>Dropoff</Text>
                    </View>
                    <Text style={styles.locationAddress}>
                      {selectedTask.dropoff?.address || 'No address'}
                    </Text>
                    {selectedTask.dropoff?.instructions && (
                      <Text style={styles.instructions}>
                        📝 {selectedTask.dropoff.instructions}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Task Info */}
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Task ID:</Text>
                    <Text style={styles.infoValue}>#{selectedTask.id?.slice(0, 8)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Created:</Text>
                    <Text style={styles.infoValue}>
                      {format(new Date(selectedTask.created_at), 'MMM d, yyyy h:mm a')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Distance:</Text>
                    <Text style={styles.infoValue}>
                      {selectedTask.distance ? `${selectedTask.distance} km` : 'Calculating...'}
                    </Text>
                  </View>
                </View>

                {/* Customer Info */}
                {selectedTask.customer && (
                  <View style={styles.customerCard}>
                    <Text style={styles.customerTitle}>Customer</Text>
                    <View style={styles.customerInfo}>
                      <Icon name="person" size={20} color="#6B7280" />
                      <Text style={styles.customerName}>
                        {selectedTask.customer.name || 'Customer'}
                      </Text>
                    </View>
                    {selectedTask.customer.phone && (
                      <TouchableOpacity style={styles.phoneButton}>
                        <Icon name="call" size={20} color="#3B82F6" />
                        <Text style={styles.phoneText}>{selectedTask.customer.phone}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {selectedTask.status === 'assigned' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(selectedTask.id)}>
                    <Icon name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Accept Task</Text>
                  </TouchableOpacity>
                )}

                {selectedTask.status === 'accepted' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.pickupButton]}
                    onPress={() => handleStatusUpdate(selectedTask.id, 'picked_up')}>
                    <Icon name="cube" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Mark as Picked Up</Text>
                  </TouchableOpacity>
                )}

                {selectedTask.status === 'picked_up' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deliverButton]}
                    onPress={() => handleStatusUpdate(selectedTask.id, 'delivered')}>
                    <Icon name="checkmark-done" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                  </TouchableOpacity>
                )}

                {(selectedTask.status === 'assigned' || selectedTask.status === 'accepted') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      Alert.alert(
                        'Cancel Task',
                        'Are you sure you want to cancel this task?',
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Yes',
                            style: 'destructive',
                            onPress: () => handleStatusUpdate(selectedTask.id, 'cancelled'),
                          },
                        ]
                      );
                    }}>
                    <Icon name="close-circle" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Cancel Task</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.mapButton]}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Navigation', { task: selectedTask });
                  }}>
                  <Icon name="navigate" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Start Navigation</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <View style={styles.filterContainer}>
          {['all', 'active', 'completed'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="list" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No tasks found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'all' 
                ? "You don't have any tasks yet"
                : `No ${filter} tasks`
              }
            </Text>
          </View>
        }
      />

      <TaskDetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  taskLocations: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  locationSection: {
    marginBottom: 24,
  },
  locationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  customerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  customerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  pickupButton: {
    backgroundColor: '#EC4899',
  },
  deliverButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  mapButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});