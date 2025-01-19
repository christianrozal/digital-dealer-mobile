import { Image, View } from "react-native";
import React from "react";
import { Slot } from "expo-router";

const ForgotPasswordLayout = () => {
  return (
    <View className="bg-white pt-10 px-8">
      {/* Logo */}
      <Image
        source={require("@/assets/images/alexium-logo-2.webp")}
        style={{ width: 79, height: 17 }}
        className="mx-auto"
      />
      <Slot />
    </View>
  );
};

export default ForgotPasswordLayout;
