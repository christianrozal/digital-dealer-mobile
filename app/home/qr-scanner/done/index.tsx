import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link, router } from "expo-router";

const DoneScreen = () => {
  return (
    <View className="py-5 px-5">
      <Text>All Done</Text>

      <View className="flex-row gap-5 mt-5">
        {/* Update button*/}
        <TouchableOpacity
          className="bg-color3 py-3 rounded-full flex-1"
          onPress={() => router.push("/home")}
        >
          <Text className="text-color1 text-center font-semibold text-sm">
            Activities
          </Text>
        </TouchableOpacity>

        {/* Home button*/}
        <TouchableOpacity
          className="bg-color1 py-3 rounded-full flex-1"
          onPress={() => router.push("/home")}
        >
          <Text className="text-white text-center font-semibold text-sm">
            Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoneScreen;
