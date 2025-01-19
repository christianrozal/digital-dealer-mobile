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

const EnterOtpScreen = () => {
  return (
    <View>
      {/* Back Arrow */}
      <Link href="/login/forgot-password">
        <Image
          source={require("@/assets/images/arrow-left.png")}
          style={{ width: 18, height: 13 }}
          className="mt-10"
        />
      </Link>

      <View className="mt-10">
        <Text className="text-xl font-semibold">Verify the OTP</Text>
        <Text className="text-xs text-gray-500 mt-5">
          Enter the OTP sent to your email.
        </Text>
      </View>

      {/* OTP Input */}
      <TextInput
        placeholder="OTP"
        className="placeholder:text-gray-500 border border-gray-400 rounded-md py-3 px-4 mt-16 w-full focus:outline-color1"
      />
      {/* Resend OTP Button */}
      <ButtonComponent label="Resend OTP" var2 className="mt-5" />

      {/* Continue Button */}
      <Link href="/login/forgot-password/set-password" className="mt-8">
        <ButtonComponent label="Continue" />
      </Link>
    </View>
  );
};

export default EnterOtpScreen;

const styles = StyleSheet.create({});
