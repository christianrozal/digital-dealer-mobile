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

const ForgotPasswordScreen = () => {
  return (
    <View>
      {/* Back Arrow */}
      <Link href="/login">
        <Image
          source={require("@/assets/images/arrow-left.png")}
          style={{ width: 18, height: 13 }}
          className="mt-10"
        />
      </Link>

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
      <Link href="/login/forgot-password/enter-otp" className="w-full mt-10">
        <ButtonComponent label="Send Email" />
      </Link>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({});
