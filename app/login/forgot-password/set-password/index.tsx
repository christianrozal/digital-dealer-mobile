import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Link } from "expo-router";
import ButtonComponent from "@/components/button";

const SetPasswordScreen = () => {
  return (
    <View>
      {/* Back Arrow */}
      <Link disabled href="/login/forgot-password" className="opacity-0">
        <Image
          source={require("@/assets/images/arrow-left.png")}
          style={{ width: 18, height: 13 }}
          className="mt-10"
        />
      </Link>
      <View className="mt-10">
        <Text className="text-xl font-semibold">Set New Password</Text>
        <Text className="text-xs text-gray-500 mt-5">
          Enter a new password below and confirm it to update your account.
        </Text>
      </View>

      {/* New Password Input */}
      <TextInput
        placeholder="Enter New Password"
        className="placeholder:text-gray-500 border border-gray-400 rounded-md py-3 px-4 mt-10 w-full focus:outline-color1"
      />
      {/* Re-enter Input */}
      <TextInput
        placeholder="Re-enter New Password"
        className="placeholder:text-gray-500 border border-gray-400 rounded-md py-3 px-4 mt-5 w-full focus:outline-color1"
      />
      {/* Continue Button */}
      <Link href="/login">
        <ButtonComponent label="Continue" className="mt-10" />
      </Link>
    </View>
  );
};

export default SetPasswordScreen;
