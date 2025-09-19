
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  deviceId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    try {
      // Check if device ID already exists
      let storedDeviceId = await AsyncStorage.getItem('device_id');
      
      if (!storedDeviceId) {
        // Generate a new device ID
        storedDeviceId = generateDeviceId();
        await AsyncStorage.setItem('device_id', storedDeviceId);
        console.log('Generated new device ID:', storedDeviceId);
      } else {
        console.log('Using existing device ID:', storedDeviceId);
      }
      
      setDeviceId(storedDeviceId);
    } catch (error) {
      console.error('Error initializing device:', error);
      // Fallback to a temporary device ID
      setDeviceId(generateDeviceId());
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceId = (): string => {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const value = {
    deviceId,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
