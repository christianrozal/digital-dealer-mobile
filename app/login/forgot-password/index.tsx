import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Link, router } from "expo-router";
import ButtonComponent from "@/components/button";

const ForgotPasswordScreen = () => {
  return (
    <View>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Image
          source={require("@/assets/images/arrow-left.png")}
          style={{ width: 18, height: 13 }}
          className="mt-10"
        />
      </TouchableOpacity>

      <View>
        <Text className="text-xl font-semibold mt-10">Forgot Password</Text>
        <Text className="text-xs text-gray-500 mt-5">
          Enter the email address associated with your account and we will send
          you an OTP to reset your password.
        </Text>
      </View>

      {/* Email Input */}
      <TextInput
        placeholder="Enter your email"
        className="placeholder:text-gray-500 border border-gray-400 rounded-md py-3 px-4 mt-5 w-full focus:outline-color1"
      />
      {/* Send Email Button */}
      <ButtonComponent
        label="Send Email"
        className="mt-10 w-full"
        onPress={() => router.push("/login/forgot-password/enter-otp")}
      />
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({});
