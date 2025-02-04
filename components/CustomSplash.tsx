import { View, Image, Text } from 'react-native';
import React from 'react';
import * as SplashScreen from 'expo-splash-screen';

const CustomSplash = () => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Image
        source={require("@/assets/images/alexium-logo.webp")}
        style={{ width: 120, height: 120 }}
      />
      <Text className="text-2xl font-semibold mt-4">Digital Dealer</Text>
      <Text className="text-[12px] text-color2 mt-1">POWERED BY ALEXIUM</Text>
    </View>
  );
};

export default CustomSplash; 