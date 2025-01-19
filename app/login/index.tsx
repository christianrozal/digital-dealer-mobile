import ButtonComponent from "@/components/button";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, TextInput, View, TouchableOpacity } from "react-native";
import { Checkbox } from "react-native-paper";

const LoginScreen = () => {
  const [checked, setChecked] = React.useState(false);
  return (
    <View className="bg-white items-center pt-12 px-8">
      {/* Logo */}
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/images/alexium-logo.webp")}
          style={{ width: 63, height: 63 }}
        />
        <Text className="text-lg font-semibold mt-2">Digital Dealer</Text>
        <Text className="text-[8px] text-color2 mt-1">POWERED BY ALEXIUM</Text>
      </View>

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        className="placeholder:text-color2 border border-color4 rounded-md py-3 px-4 mt-4 w-full focus:outline-color1"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        className="placeholder:text-color2 border border-color4 rounded-md py-3 px-4 mt-4 w-full focus:outline-color1"
        secureTextEntry // Use for password inputs
      />

      {/* Checkbox with label */}
      <View className="flex-row items-center mt-2 w-full -translate-x-2">
        <View className="scale-75">
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => {
              setChecked(!checked);
            }}
            color="#3D12FA"
          />
        </View>
        <Text className="text-[10px] font-medium text-color2">
          I agree to Alexium&apos;s{" "}
          <Link href="/">
            <TouchableOpacity>
              <Text className="underline">Privacy Policy</Text>
            </TouchableOpacity>
          </Link>{" "}
          and
          <Link href="/">
            <TouchableOpacity>
              <Text className="underline"> Terms of Use.</Text>
            </TouchableOpacity>
          </Link>
        </Text>
      </View>

      {/* Login Button */}
      <Link href="/home" className="w-full mt-10">
        <ButtonComponent label="Login" />
      </Link>

      {/* Forgot Password Link */}
      <Link href="/login/forgot-password">
        <TouchableOpacity className="mt-4">
          <Text className="font-medium  text-color2 underline text-[10px]">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </Link>

      {/* OR Separator */}
      <Text className="my-6 text-color2">or</Text>

      {/* Request Access Button */}
      <Link href="/login/request-access" className="w-full">
        <ButtonComponent label="Request Access" var2 />
      </Link>
    </View>
  );
};

export default LoginScreen;
