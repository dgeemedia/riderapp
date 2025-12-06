// rider-expo/context/TaskContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API } from '../utils/api';
import { SocketService } from '../services/socket';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      const socketInstance = SocketService.getInstance(token);
      setSocket(socketInstance);

      // Set up socket listeners
      socketInstance.on('task:assign', handleTaskAssign);
      socketInstance.on('task:update', handleTaskUpdate);
      socketInstance.on('ping', handlePing);

      // Load initial tasks
      loadTasks();

      return () => {
        socketInstance.off('task:assign', handleTaskAssign);
        socketInstance.off('task:update', handleTaskUpdate);
        socketInstance.off('ping', handlePing);
      };
    }
  }, [isAuthenticated, token]);

  const loadTasks = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await API.get('/riders/tasks', token);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAssign = (task) => {
    // Add notification/alert for new task
    setTasks(prev => [task, ...prev]);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    
    if (currentTask?.id === updatedTask.id) {
      setCurrentTask(updatedTask);
    }
  };

  const handlePing = (data) => {
    // Show notification to rider
    console.log('Ping received:', data);
  };

  const acceptTask = async (taskId) => {
    try {
      const response = await API.post(`/tasks/${taskId}/accept`, {}, token);
      
      if (socket) {
        socket.emit('task:accept', { taskId });
      }
      
      // Update task in state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'accepted' }
            : task
        )
      );
      
      setCurrentTask(prev => 
        prev?.id === taskId 
          ? { ...prev, status: 'accepted' }
          : prev
      );
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateTaskStatus = async (taskId, status, data = {}) => {
    try {
      const response = await API.put(
        `/tasks/${taskId}/status`,
        { status, ...data },
        token
      );
      
      // Update in state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status, ...data }
            : task
        )
      );
      
      if (currentTask?.id === taskId) {
        setCurrentTask(prev => ({ ...prev, status, ...data }));
      }
      
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        currentTask,
        loading,
        socket,
        loadTasks,
        acceptTask,
        updateTaskStatus,
        getTaskById,
        setCurrentTask,
        refreshTasks: loadTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};