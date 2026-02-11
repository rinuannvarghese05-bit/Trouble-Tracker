// frontend/services/notificationService.ts
import axios from 'axios';

// NOTE: We use the base API URL without the specific '/notifications' segment
// because the system notification route lives under '/complaints'.
const API_BASE_URL = 'http://localhost:5000/api';
const NOTIFICATION_API_URL = `${API_BASE_URL}/notifications`;
const COMPLAINT_API_URL = `${API_BASE_URL}/complaints`; // Added for system notifications

const NotificationService = {
  // Existing: Get notifications for a single user
  getNotificationsByUser: async (userId: string) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const res = await axios.get(`${NOTIFICATION_API_URL}/${userId}`, config);
    return res.data;
  },

  // Existing: Send to a single user (for internal use, not used by AdminDashboard)
  send: async (notification: any) => {
    if (!notification.userId) throw new Error('userId is required to send a notification');
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const res = await axios.post(NOTIFICATION_API_URL, notification, config);
    return res.data;
  },

  // Existing: Send to multiple users at once (old, generic method)
  sendToUsers: async (notification: any, userIds: string[]) => {
    if (!userIds || userIds.length === 0) throw new Error('At least one userId is required');
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const res = await axios.post(`${NOTIFICATION_API_URL}/send-multiple`, { notification, userIds }, config);
    return res.data;
  },

  // ⭐ NEW/FIXED: Bulk System Notification (Used by SystemNotificationModal)
  // This function implements the logic required by AdminDashboard and SystemNotificationModal.
  sendSystemNotificationBulk: async (notificationPayload: { 
        type: string; 
        title: string; 
        message: string; 
        recipients: string[] 
    }) => {
    if (!notificationPayload.recipients || notificationPayload.recipients.length === 0) 
        throw new Error('Recipients array is required for bulk system notification.');

    const token = localStorage.getItem('token');
    const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
    
    // ⭐ IMPORTANT: Target the correct backend endpoint under the complaints route
    const res = await axios.post(
      `${COMPLAINT_API_URL}/notifications/send-system`, 
      notificationPayload,
      config
    );
    return res.data;
  },

  // Mark a single notification as read. (Added token)
  markAsRead: async (id: string) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const res = await axios.put(`${NOTIFICATION_API_URL}/${id}/mark-read`, {}, config);
    return res.data;
  },

  // Mark all notifications as read for a user (Added token)
  markAllAsRead: async (userId: string) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const res = await axios.put(`${NOTIFICATION_API_URL}/mark-all-read`, { userId }, config);
    return res.data;
  },

  // Delete a single notification. (Added token)
  delete: async (id: string) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const res = await axios.delete(`${NOTIFICATION_API_URL}/${id}`, config);
    return res.data;
  },
};

// Named exports
export const getNotificationsByUser = NotificationService.getNotificationsByUser;
// ⭐ FIX: Export the correct bulk function name for use in SystemNotificationModal
export const sendSystemNotification = NotificationService.sendSystemNotificationBulk; 
export const sendSystemNotificationToUsers = NotificationService.sendToUsers; // Keeping the old export
export const markNotificationAsRead = NotificationService.markAsRead;
export const markAllNotificationsAsRead = NotificationService.markAllAsRead;
export const removeNotification = NotificationService.delete;

export default NotificationService;