import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";

const NotificationsScreen = () => {
  return (
    <View className="px-5">
      <View className="flex-row justify-between items-center mt-5">
        <Text className="text-2xl font-semibold">Notifications</Text>
        <TouchableOpacity>
          <Image
            source={require("@/assets/images/x.svg")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-3 mt-10">
        <View className="w-4 h-4 border rounded border-gray-500" />
        <Text className="text-xs">Mark all as read</Text>
      </View>

      <View className="mt-5">
        <Text className="font-bold">Today</Text>
        <View className="p-3 bg-color3 mt-3 rounded-md flex-row gap-3 items-center">
          <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
            <Text className="text-white font-bold text-xs">Ma</Text>
          </View>
          <View className="gap-1">
            <Text className="text-color1 font-bold">
              Mani Prakash{" "}
              <Text className="text-black font-normal text-sm">
                has been assigned
              </Text>
            </Text>
            <Text className="text-xs">2:30 PM</Text>
          </View>
        </View>
      </View>
      <View className="mt-5">
        <Text className="font-bold">This week</Text>
        <View className="flex-row items-center mt-3">
          <View className="w-4 h-4 border rounded border-gray-500" />
          <View className="p-3 rounded-md flex-row gap-3 items-center">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Ma</Text>
            </View>
            <View className="gap-1">
              <Text className="">
                Mani Prakash{" "}
                <Text className="text-black font-normal text-sm">
                  has been reassigned
                </Text>
              </Text>
              <Text className="text-xs">2:30 PM</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center mt-3">
          <View className="w-4 h-4 border rounded border-gray-500" />
          <View className="p-3 rounded-md flex-row gap-3 items-center">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Ma</Text>
            </View>
            <View className="gap-1">
              <Text className="">
                Mani Prakash{" "}
                <Text className="text-black font-normal text-sm">
                  has been assigned
                </Text>
              </Text>
              <Text className="text-xs">2:30 PM</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NotificationsScreen;
