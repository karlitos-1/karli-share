
import { useEffect, useState } from 'react';
import { supabase } from '../app/integrations/supabase/client';
import { Tables } from '../app/integrations/supabase/types';
import { useAuth } from './useAuth';

type Transfer = Tables<'transfers'>;

export function useTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransfers([]);
      setLoading(false);
      return;
    }

    fetchTransfers();
    subscribeToTransfers();
  }, [user]);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
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
  };

  const subscribeToTransfers = () => {
    if (!user) return;

    const subscription = supabase
      .channel('transfers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transfers',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
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
  };

  const createTransfer = async (transferData: Omit<Tables<'transfers'>['Insert'], 'sender_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          ...transferData,
          sender_id: user.id,
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

  return {
    transfers,
    loading,
    createTransfer,
    updateTransfer,
    refetch: fetchTransfers,
  };
}
