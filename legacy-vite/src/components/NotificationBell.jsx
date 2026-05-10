import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Clock, Info, AlertTriangle, UserPlus } from 'lucide-react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'new_lead': return <UserPlus size={16} className="text-blue-400" />;
      case 'lead_response': return <Info size={16} className="text-green-400" />;
      case 'kpi_alert': return <AlertTriangle size={16} className="text-yellow-400" />;
      default: return <Bell size={16} />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button 
        className={`nav-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-mark-all">
                <Check size={14} /> Đọc tất cả
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={32} className="opacity-20 mb-2" />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`notification-item ${!n.da_doc ? 'unread' : ''}`}
                  onClick={() => !n.da_doc && markAsRead(n.id)}
                >
                  <div className="notification-icon">
                    {getIcon(n.loai)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{n.tieu_de}</div>
                    <div className="notification-text">{n.noi_dung}</div>
                    <div className="notification-time">
                      <Clock size={10} /> {formatTime(n.created_at)}
                    </div>
                  </div>
                  {!n.da_doc && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
          
          <div className="dropdown-footer">
            <button className="btn-view-all">Xem tất cả</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
