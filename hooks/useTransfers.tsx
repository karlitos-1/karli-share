
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../app/integrations/supabase/client';
import { Tables } from '../app/integrations/supabase/types';
import { useAuth } from './useAuth';
import { fileTransferService, FileTransferProgress } from '../utils/fileTransferService';

type Transfer = Tables<'transfers'>;

export function useTransfers() {
  const { deviceId } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferProgress, setTransferProgress] = useState<Map<string, FileTransferProgress>>(new Map());

  const fetchTransfers = useCallback(async () => {
    if (!deviceId) {
      setTransfers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .or(`sender_device_id.eq.${deviceId},receiver_device_id.eq.${deviceId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transfers:', error);
        return;
      }

      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const subscribeToTransfers = useCallback(() => {
    if (!deviceId) return;

    const subscription = supabase
      .channel('transfers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transfers',
        },
        (payload) => {
          console.log('Transfer update:', payload);
          fetchTransfers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [deviceId, fetchTransfers]);

  useEffect(() => {
    fetchTransfers();
    const unsubscribe = subscribeToTransfers();
    return unsubscribe;
  }, [fetchTransfers, subscribeToTransfers]);

  const createTransfer = async (transferData: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>) => {
    if (!deviceId) return null;

    try {
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          ...transferData,
          sender_device_id: deviceId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating transfer:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      return null;
    }
  };

  const updateTransfer = async (id: string, updates: Partial<Transfer>) => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transfer:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating transfer:', error);
      return null;
    }
  };

  const uploadFile = async (transferId: string, fileUri: string): Promise<boolean> => {
    if (!deviceId) return false;

    // Set up progress tracking
    fileTransferService.onProgress(transferId, (progress) => {
      setTransferProgress(prev => new Map(prev.set(transferId, progress)));
    });

    const success = await fileTransferService.uploadFile(transferId, fileUri, deviceId);
    
    // Clean up progress tracking
    fileTransferService.offProgress(transferId);
    setTransferProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(transferId);
      return newMap;
    });

    if (success) {
      fetchTransfers(); // Refresh transfers list
    }

    return success;
  };

  const downloadFile = async (transferId: string, fileName: string): Promise<string | null> => {
    if (!deviceId) return null;

    // Set up progress tracking
    fileTransferService.onProgress(transferId, (progress) => {
      setTransferProgress(prev => new Map(prev.set(transferId, progress)));
    });

    const filePath = await fileTransferService.downloadFile(transferId, deviceId, fileName);
    
    // Clean up progress tracking
    fileTransferService.offProgress(transferId);
    setTransferProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(transferId);
      return newMap;
    });

    if (filePath) {
      fetchTransfers(); // Refresh transfers list
    }

    return filePath;
  };

  const processQRCode = async (qrData: string): Promise<boolean> => {
    if (!deviceId) return false;
    return await fileTransferService.processQRCodeData(qrData, deviceId);
  };

  return {
    transfers,
    loading,
    transferProgress,
    createTransfer,
    updateTransfer,
    uploadFile,
    downloadFile,
    processQRCode,
    refetch: fetchTransfers,
  };
}
