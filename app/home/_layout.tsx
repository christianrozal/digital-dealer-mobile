import { View, TouchableOpacity, Image, ScrollView, Text } from "react-native";
import React from "react";
import { router, Slot } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Avatar } from "react-native-paper";

const HomeLayout = () => {
  // Get user data from Redux
  const user = useSelector((state: RootState) => state.user);

  const getInitials = (name: string | null) => {
    if (!name) return "XD";
    return name.slice(0, 1).toUpperCase();
  };

  return (
    <ScrollView>
      {/* Header */}
      <View className="flex-row justify-between items-center py-5 px-5">
        {/* User Icon */}
        {user.isLoggedIn ? (
          <TouchableOpacity>
            <Avatar.Text
              size={30}
              label={getInitials(user.name)}
              style={{ backgroundColor: "#3D12FA" }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Image
              source={require("@/assets/images/profile.webp")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
        )}

        {/* Logo */}
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Image
            source={require("@/assets/images/alexium-logo-2.webp")}
            style={{ width: 64 * 1.3, height: 14 * 1.3 }}
          />
        </TouchableOpacity>

        <View className="flex-row gap-2">
          {/* Analytics */}
          <TouchableOpacity onPress={() => router.push("/home/analytics")}>
            <Image
              source={require("@/assets/images/analytics-icon.webp")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
          {/* Notifications */}
          <TouchableOpacity onPress={() => router.push("/home/notifications")}>
            <Image
              source={require("@/assets/images/notification-icon.webp")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Slot />

      {/* Bottom Navigation Bar */}
      <View className="fixed bottom-0 w-full flex-row justify-center gap-10 items-center py-2 mt-5 shadow-md">
        <TouchableOpacity className="flex items-center">
          <Image
            source={require("@/assets/images/activity-icon.webp")}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-[10px] text-gray-500 font-semibold mt-1">
            Activity
          </Text>
        </TouchableOpacity>
        {/* Qr Screen */}
        <TouchableOpacity onPress={() => router.push("/home/qr-scanner")}>
          <Image
            source={require("@/assets/images/scan-icon.webp")}
            style={{ width: 51, height: 51 }}
          />
        </TouchableOpacity>
        <TouchableOpacity className="flex items-center">
          <Image
            source={require("@/assets/images/customers-icon.webp")}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-[10px] text-gray-500 font-semibold mt-1">
            Customers
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeLayout;
