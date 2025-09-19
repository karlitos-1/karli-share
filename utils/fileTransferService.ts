
import { supabase } from '../app/integrations/supabase/client';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface FileTransferProgress {
  transferId: string;
  progress: number;
  status: 'uploading' | 'downloading' | 'completed' | 'failed';
  message?: string;
}

export class FileTransferService {
  private static instance: FileTransferService;
  private progressCallbacks: Map<string, (progress: FileTransferProgress) => void> = new Map();

  static getInstance(): FileTransferService {
    if (!FileTransferService.instance) {
      FileTransferService.instance = new FileTransferService();
    }
    return FileTransferService.instance;
  }

  onProgress(transferId: string, callback: (progress: FileTransferProgress) => void) {
    this.progressCallbacks.set(transferId, callback);
  }

  offProgress(transferId: string) {
    this.progressCallbacks.delete(transferId);
  }

  private notifyProgress(progress: FileTransferProgress) {
    const callback = this.progressCallbacks.get(progress.transferId);
    if (callback) {
      callback(progress);
    }
  }

  async uploadFile(transferId: string, fileUri: string, deviceId: string): Promise<boolean> {
    try {
      this.notifyProgress({
        transferId,
        progress: 0,
        status: 'uploading',
        message: 'Préparation du fichier...'
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Read file as base64
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Convert base64 to blob
      const response = await fetch(`data:application/octet-stream;base64,${fileContent}`);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('transferId', transferId);
      formData.append('deviceId', deviceId);
      formData.append('chunkSize', '1048576'); // 1MB chunks

      this.notifyProgress({
        transferId,
        progress: 25,
        status: 'uploading',
        message: 'Envoi du fichier...'
      });

      // Get project URL for edge function
      const { data: { project } } = await supabase.auth.getSession();
      const projectUrl = supabase.supabaseUrl;
      const functionUrl = `${projectUrl}/functions/v1/upload-file`;

      // Upload file using edge function
      const uploadResponse = await fetch(functionUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await uploadResponse.json();

      this.notifyProgress({
        transferId,
        progress: 100,
        status: 'completed',
        message: 'Fichier envoyé avec succès!'
      });

      return true;

    } catch (error) {
      console.error('Upload error:', error);
      this.notifyProgress({
        transferId,
        progress: 0,
        status: 'failed',
        message: `Erreur d'envoi: ${error.message}`
      });
      return false;
    }
  }

  async downloadFile(transferId: string, deviceId: string, fileName: string): Promise<string | null> {
    try {
      this.notifyProgress({
        transferId,
        progress: 0,
        status: 'downloading',
        message: 'Téléchargement en cours...'
      });

      // Get project URL for edge function
      const projectUrl = supabase.supabaseUrl;
      const functionUrl = `${projectUrl}/functions/v1/download-file?transferId=${transferId}&deviceId=${deviceId}`;

      // Download file using edge function
      const downloadResponse = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
      });

      if (!downloadResponse.ok) {
        const errorData = await downloadResponse.json();
        throw new Error(errorData.error || 'Download failed');
      }

      this.notifyProgress({
        transferId,
        progress: 50,
        status: 'downloading',
        message: 'Sauvegarde du fichier...'
      });

      // Get file data as blob
      const blob = await downloadResponse.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Save file to device
      const downloadDir = (FileSystem.documentDirectory || '') + 'Downloads/';
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      
      const filePath = downloadDir + fileName;
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: 'base64',
      });

      this.notifyProgress({
        transferId,
        progress: 100,
        status: 'completed',
        message: 'Fichier téléchargé avec succès!'
      });

      return filePath;

    } catch (error) {
      console.error('Download error:', error);
      this.notifyProgress({
        transferId,
        progress: 0,
        status: 'failed',
        message: `Erreur de téléchargement: ${error.message}`
      });
      return null;
    }
  }

  async processQRCodeData(qrData: string, deviceId: string): Promise<boolean> {
    try {
      const transferData = JSON.parse(qrData);
      
      if (transferData.type === 'session') {
        // Handle session-based transfer
        return this.handleSessionTransfer(transferData, deviceId);
      } else if (transferData.type === 'file' || transferData.type === 'application') {
        // Handle direct file transfer
        return this.handleDirectTransfer(transferData, deviceId);
      }
      
      return false;
    } catch (error) {
      console.error('Error processing QR code:', error);
      return false;
    }
  }

  private async handleSessionTransfer(sessionData: any, deviceId: string): Promise<boolean> {
    try {
      // Find active session
      const { data: session, error } = await supabase
        .from('transfer_sessions')
        .select('*')
        .eq('session_code', sessionData.sessionCode)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        Alert.alert('Erreur', 'Session non trouvée ou expirée');
        return false;
      }

      // Update session with receiver device ID
      await supabase
        .from('transfer_sessions')
        .update({ is_active: false })
        .eq('id', session.id);

      Alert.alert(
        'Session trouvée',
        'Vous êtes maintenant connecté pour recevoir des fichiers.',
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('Session transfer error:', error);
      return false;
    }
  }

  private async handleDirectTransfer(transferData: any, deviceId: string): Promise<boolean> {
    try {
      // Find the transfer
      const { data: transfers, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('sender_device_id', transferData.deviceId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !transfers || transfers.length === 0) {
        Alert.alert('Erreur', 'Transfert non trouvé');
        return false;
      }

      const transfer = transfers[0];

      // Show confirmation dialog
      const isApplication = transferData.type === 'application';
      const itemName = isApplication ? transferData.app.name : transferData.file.name;
      const itemSize = isApplication ? transferData.app.size : transferData.file.size;

      Alert.alert(
        `${isApplication ? 'Application' : 'Fichier'} reçu`,
        `Voulez-vous recevoir "${itemName}" (${this.formatBytes(itemSize)}) ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Recevoir', 
            onPress: async () => {
              // Update transfer with receiver device ID
              await supabase
                .from('transfers')
                .update({ 
                  receiver_device_id: deviceId,
                  status: 'in_progress'
                })
                .eq('id', transfer.id);

              // Start download
              const filePath = await this.downloadFile(transfer.id, deviceId, transfer.file_name);
              
              if (filePath) {
                Alert.alert(
                  'Téléchargement terminé',
                  `Le fichier a été sauvegardé dans: ${filePath}`,
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );

      return true;
    } catch (error) {
      console.error('Direct transfer error:', error);
      return false;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileTransferService = FileTransferService.getInstance();
