import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import FilterIcon from "@/components/svg/filterIcon";

const AnalyticsScreen = () => {
  return (
    <View className="px-5">
      <View className="flex-row justify-between items-center mt-5">
        <Text className="text-2xl font-semibold">Analytics</Text>
        <TouchableOpacity>
          <FilterIcon />
        </TouchableOpacity>
      </View>

      {/* Chart test */}
    </View>
  );
};

export default AnalyticsScreen;
