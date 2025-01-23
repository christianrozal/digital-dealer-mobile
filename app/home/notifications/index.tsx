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
    </View>
  );
};

export default NotificationsScreen;
