import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link } from "expo-router";

const DoneScreen = () => {
  return (
    <View>
      <Text>All Done</Text>

      <View className="flex-row gap-5 mt-5">
        {/* Update button*/}
        <Link href="/home/qr-scanner/post-assignment-filled" className="w-full">
          <TouchableOpacity className="bg-color3 py-3 rounded-full w-full">
            <Text className="text-color1 text-center font-semibold text-sm">
              Activities
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Back button*/}
        <Link href="/home" className="w-full">
          <TouchableOpacity className="bg-color1 py-3 rounded-full w-full">
            <Text className="text-white text-center font-semibold text-sm">
              Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default DoneScreen;
