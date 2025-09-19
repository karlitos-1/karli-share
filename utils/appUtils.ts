
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface AppInfo {
  packageName: string;
  appName: string;
  versionName?: string;
  versionCode?: number;
  iconUrl?: string;
  apkSize?: number;
  apkUrl?: string;
}

export const getInstalledApps = async (): Promise<AppInfo[]> => {
  try {
    // Note: On iOS and Android, we can't actually get a list of installed apps
    // due to privacy restrictions. This is a mock implementation.
    // In a real app, you'd need native modules or special permissions.
    
    console.log('Getting installed apps...');
    
    // Mock data for demonstration
    const mockApps: AppInfo[] = [
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        versionName: '2.23.24.14',
        versionCode: 232414,
        iconUrl: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=100&h=100&fit=crop',
        apkSize: 45000000, // 45MB
      },
      {
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        versionName: '302.0.0.23.108',
        versionCode: 302000023,
        iconUrl: 'https://images.unsplash.com/photo-1611262588019-db6cc2032da3?w=100&h=100&fit=crop',
        apkSize: 38000000, // 38MB
      },
      {
        packageName: 'com.spotify.music',
        appName: 'Spotify',
        versionName: '8.8.52.488',
        versionCode: 88520488,
        iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop',
        apkSize: 32000000, // 32MB
      },
      {
        packageName: 'com.google.android.youtube',
        appName: 'YouTube',
        versionName: '18.43.45',
        versionCode: 1843450,
        iconUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
        apkSize: 42000000, // 42MB
      },
      {
        packageName: 'com.twitter.android',
        appName: 'X (Twitter)',
        versionName: '10.21.0',
        versionCode: 102100,
        iconUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=100&h=100&fit=crop',
        apkSize: 28000000, // 28MB
      },
      {
        packageName: 'com.facebook.katana',
        appName: 'Facebook',
        versionName: '441.0.0.33.113',
        versionCode: 441000033,
        iconUrl: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=100&h=100&fit=crop',
        apkSize: 55000000, // 55MB
      },
    ];

    return mockApps;
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};

export const getCurrentAppInfo = async (): Promise<AppInfo | null> => {
  try {
    const appName = Application.applicationName || 'Karli\'Share';
    const packageName = Application.applicationId || 'com.karli.share';
    const versionName = Application.nativeApplicationVersion || '1.0.0';
    const versionCode = Application.nativeBuildVersion ? parseInt(Application.nativeBuildVersion) : 1;

    return {
      packageName,
      appName,
      versionName,
      versionCode,
      iconUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop',
      apkSize: 25000000, // 25MB estimated
    };
  } catch (error) {
    console.error('Error getting current app info:', error);
    return null;
  }
};

export const getDeviceInfo = async () => {
  try {
    return {
      deviceName: Device.deviceName || 'Unknown Device',
      modelName: Device.modelName || 'Unknown Model',
      osName: Device.osName || Platform.OS,
      osVersion: Device.osVersion || 'Unknown',
      platform: Platform.OS,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      deviceName: 'Unknown Device',
      modelName: 'Unknown Model',
      osName: Platform.OS,
      osVersion: 'Unknown',
      platform: Platform.OS,
    };
  }
};

export const formatAppSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const generateAppTransferData = (app: AppInfo, deviceId: string) => {
  return {
    type: 'application',
    app,
    deviceId,
    timestamp: Date.now(),
  };
};
