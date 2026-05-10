import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useData } from './DataContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useData();

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.da_doc).length || 0);
    }
  }, [currentUser]);

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ da_doc: true })
      .eq('id', id);

    if (error) {
      toast.error("Không thể cập nhật trạng thái thông báo");
    } else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, da_doc: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('notifications')
      .update({ da_doc: true })
      .eq('user_id', currentUser.id)
      .eq('da_doc', false);

    if (error) {
      toast.error("Lỗi khi cập nhật tất cả thông báo");
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();

      // Realtime subscription
      const channel = supabase
        .channel(`public:notifications:user_id=eq.${currentUser.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}` 
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
          toast(payload.new.tieu_de, {
            icon: '🔔',
            duration: 4000,
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
