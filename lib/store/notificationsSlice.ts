import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for your notification object.
interface Notification {
  id: string;
  title: string;
  message?: string;
  read: boolean;
  timestamp: string;
}

// Define the state type for notifications.
interface NotificationsState {
  documents: Notification[];
}

// Define the initial state using that type.
const initialState: NotificationsState = {
  documents: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Set the notifications list (e.g., when fetching notifications from an API).
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.documents = action.payload;
    },
    // Add a new notification.
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.documents.push(action.payload);
    },
    // Mark a specific notification as read.
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.documents.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    // Mark all notifications as read.
    markAllAsRead: (state) => {
      state.documents.forEach(notification => {
        notification.read = true;
      });
    },
    // Remove a notification by id.
    removeNotification: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(n => n.id !== action.payload);
    }
  },
});

export const { setNotifications, addNotification, markNotificationAsRead, markAllAsRead, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer; 