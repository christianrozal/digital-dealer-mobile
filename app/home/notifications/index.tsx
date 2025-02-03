import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { databases, databaseId, notificationsId } from "@/lib/appwrite";
import { Query, Models } from "appwrite";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { router } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notification extends Models.Document {
  type: 'first_assigned' | 'subsequent_assignment' | 'reassigned';
  users: string[];
  customers: { name: string; profileImage?: string }[];
  read: boolean;
  customerName?: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: RootState) => state.user.data);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments<Notification>(
        databaseId,
        notificationsId,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );

      setNotifications(response.documents);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationMessage = (type: string, customer: string) => {
    switch (type) {
      case 'first_assigned':
        return ['New customer ', customer, ' has been assigned to you'];
      case 'subsequent_assignment':
        return ['', customer, ' has been assigned to you again'];
      case 'reassigned':
        return ['', customer, ' has been reassigned to you'];
      default:
        return ['Customer ', customer, ' has been assigned'];
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return 'No date';
    }
    const now = dayjs();
    const commentDate = dayjs(date);
    const diffInHours = now.diff(commentDate, 'hour');
    const diffInDays = now.diff(commentDate, 'day');

    if (diffInHours < 24) {
      return commentDate.fromNow(); // This will show "2h ago", "30m ago", etc.
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`; // This will show "2d ago", "5d ago", etc.
    } else {
      return commentDate.format("D MMM YYYY"); // For older dates, show the full date
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "Cu";
    const firstName = name.split(" ")[0];
    const cleaned = firstName.replace(/[^a-zA-Z]/g, "");
    return (cleaned.slice(0, 2) || "Cu")
      .split("")
      .map((c, i) => (i === 1 ? c.toLowerCase() : c.toUpperCase()))
      .join("");
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(notification =>
            databases.updateDocument(
              databaseId,
              notificationsId,
              notification.$id,
              { read: true }
            )
          )
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const groupNotifications = (notifications: Notification[]) => {
    const today = dayjs().startOf('day');
    
    return notifications.reduce((groups, notification) => {
      const notificationDate = dayjs(notification.$createdAt);
      const isToday = notificationDate.isAfter(today);
      
      if (isToday) {
        groups.today.push(notification);
      } else {
        groups.older.push(notification);
      }
      
      return groups;
    }, { today: [] as Notification[], older: [] as Notification[] });
  };

  const renderNotification = (notification: Notification) => (
    <View 
      key={notification.$id}
      className={`p-3 ${notification.read ? 'bg-white' : 'bg-color3'} mt-3 rounded-md flex-row gap-3 items-center`}
    >
      {notification.customers[0].profileImage ? (
        <Image
          source={{ uri: notification.customers[0].profileImage }}
          className="w-9 h-9 rounded-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-9 h-9 bg-color1 rounded-full flex items-center justify-center">
          <Text className="text-white font-bold text-xs">
            {getInitials(notification.customers[0].name || '')}
          </Text>
        </View>
      )}
      <View className="flex-1 gap-1">
        <Text className="text-sm">
          {(() => {
            const [prefix, name, suffix] = getNotificationMessage(
              notification.type, 
              notification.customers[0].name || 'Unknown Customer'
            );
            return (
              <>
                {prefix}
                <Text className="font-bold text-color1 text-sm">{name}</Text>
                {suffix}
              </>
            );
          })()}
        </Text>
        <Text className="text-xs text-gray-500">
          {formatDate(notification.$createdAt)}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-20">
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Notifications</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("@/assets/images/x.svg")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center gap-3 mt-10"
          onPress={markAllAsRead}
        >
          <Text className="text-xs font-medium text-gray-400">Mark all as read</Text>
        </TouchableOpacity>

        {loading ? (
          <View className="mt-5">
            <Text>Loading notifications...</Text>
          </View>
        ) : (
          <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
            {notifications.length > 0 ? (
              (() => {
                const { today, older } = groupNotifications(notifications);
                return (
                  <>
                    {today.length > 0 && (
                      <View>
                        <Text className="text-base font-semibold mb-2">Today</Text>
                        {today.map(renderNotification)}
                      </View>
                    )}
                    
                    {older.length > 0 && (
                      <View className="mt-6">
                        <Text className="text-base font-semibold mb-2">Older</Text>
                        {older.map(renderNotification)}
                      </View>
                    )}
                  </>
                );
              })()
            ) : (
              <Text className="text-center mt-5 text-gray-500">
                No notifications yet
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default NotificationsScreen;
