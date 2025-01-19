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

const RequestAccess = () => {
  return (
    <View className="bg-white items-center pt-12 px-8">
      {/* Logo */}
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/images/alexium-logo.webp")}
          style={{ width: 63, height: 63 }}
        />
        <Text className="text-lg font-semibold mt-2">Digital Dealer</Text>
        <Text className="text-[8px] text-gray-500 mt-1">
          POWERED BY ALEXIUM
        </Text>
      </View>

      <View className="mt-5">
        <Text className="text-xl font-semibold">Request Access</Text>
        <Text className="text-xs text-gray-500 mt-3">
          Please fill out the details below to request access. A team member
          will review your request.
        </Text>
      </View>

      {/* Name Input */}
      <TextInput
        placeholder="Name"
        className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
      />
      {/* Email Input */}
      <TextInput
        placeholder="Email"
        className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
      />
      {/* Reason for Access Input */}
      <TextInput
        placeholder="Reason for Access"
        multiline={true}
        numberOfLines={4}
        className="placeholder:text-gray-500 border border-color4 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
      />
      {/* Checkbox with label */}
      <View className="flex-row items-center mt-4 w-full">
        <View className="border border-color4 w-3 h-3 mr-2 rounded-sm"></View>
        <Text className="text-[10px] font-medium text-gray-500">
          I agree to Alexium&apos;s{" "}
          <Link href="/login">
            <Text className="underline">Privacy Policy</Text>
          </Link>{" "}
          and
          <Link href="/login">
            <Text className="underline"> Terms of Use.</Text>
          </Link>
        </Text>
      </View>
      {/* Submit Request Button */}
      <Link href="/login" className="w-full mt-10">
        <ButtonComponent label="Submit Request" />
      </Link>
    </View>
  );
};

export default RequestAccess;

const styles = StyleSheet.create({});
