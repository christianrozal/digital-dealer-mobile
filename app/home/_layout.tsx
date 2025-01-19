import { View, TouchableOpacity, Image, ScrollView } from "react-native";
import React from "react";
import { Link, Slot } from "expo-router";

const HomeLayout = () => {
  return (
    <ScrollView>
      {/* Header */}
      <View className="flex-row justify-between items-center py-5 px-5">
        <View className="flex-row gap-2">
          {/* Menu Icon */}
          <TouchableOpacity>
            <Image
              source={require("@/assets/images/menu-icon.webp")}
              style={{ width: 18, height: 18 }}
            />
          </TouchableOpacity>
          {/* User Icon */}
          <TouchableOpacity>
            <Image
              source={require("@/assets/images/profile.webp")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
        </View>
        {/* Logo */}
        <Link href="/home">
          <Image
            source={require("@/assets/images/alexium-logo-2.webp")}
            style={{ width: 64, height: 14 }}
          />
        </Link>

        <View className="flex-row gap-2">
          {/* Analytics */}
          <Link href="/home/analytics">
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/analytics-icon.webp")}
                style={{ width: 18, height: 18 }}
              />
            </TouchableOpacity>
          </Link>
          {/* Notifications */}
          <Link href="/home/notifications">
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/notification-icon.webp")}
                style={{ width: 18, height: 18 }}
              />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <Slot />
    </ScrollView>
  );
};

export default HomeLayout;
