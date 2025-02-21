import { View, Image, Text } from 'react-native';
import React from 'react';

const CustomSplash = () => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Image
        source={require("@/assets/images/alexium-logo.webp")}
        style={{ width: 120, height: 120 }}
      />
      <Text className="text-xl font-semibold mt-4">Digital Dealer</Text>
      <Text className="text-[9px] text-color2 mt-1">POWERED BY ALEXIUM</Text>
    </View>
  );
};

export default CustomSplash; 