// rider-expo/services/offline.js
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineService {
  constructor() {
    this.isConnected = true;
    this.pendingActions = [];
    this.init();
  }

  async init() {
    // Check network status
    NetInfo.addEventListener(state => {
      this.isConnected = state.isConnected;
      if (state.isConnected) {
        this.syncPendingActions();
      }
    });

    // Load pending actions
    const stored = await AsyncStorage.getItem('@pending_actions');
    if (stored) {
      this.pendingActions = JSON.parse(stored);
    }
  }

  async queueAction(action) {
    this.pendingActions.push({
      ...action,
      timestamp: Date.now(),
      retries: 0,
    });
    
    await this.savePendingActions();
    
    if (this.isConnected) {
      await this.syncPendingActions();
    }
  }

  async syncPendingActions() {
    if (this.pendingActions.length === 0) return;

    const successful = [];
    
    for (const action of this.pendingActions) {
      try {
        // Attempt to execute action
        const success = await this.executeAction(action);
        if (success) {
          successful.push(action);
        } else if (action.retries < 3) {
          action.retries++;
        } else {
          // Max retries reached, remove
          successful.push(action);
        }
      } catch (error) {
        console.error('Failed to execute pending action:', error);
      }
    }

    // Remove successful actions
    this.pendingActions = this.pendingActions.filter(
      action => !successful.includes(action)
    );
    
    await this.savePendingActions();
  }

  async executeAction(action) {
    // Implement action execution logic
    switch (action.type) {
      case 'UPDATE_LOCATION':
        // Call location update API
        return true;
      case 'UPDATE_TASK_STATUS':
        // Call task status update API
        return true;
      default:
        return false;
    }
  }

  async savePendingActions() {
    await AsyncStorage.setItem(
      '@pending_actions',
      JSON.stringify(this.pendingActions)
    );
  }

  getOfflineStatus() {
    return !this.isConnected;
  }

  getPendingCount() {
    return this.pendingActions.length;
  }
}

export default new OfflineService();