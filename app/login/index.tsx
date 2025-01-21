import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, View, TouchableOpacity } from "react-native";
import { Checkbox } from "react-native-paper";
import { Client, Account } from "react-native-appwrite";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";

// Initialize Appwrite client (make sure to set your actual endpoint and project ID)
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const account = new Account(client);

const LoginScreen = () => {
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Function to validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");
    setCheckboxError("");

    let isValid = true;
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    if (!checked) {
      setCheckboxError("You must agree to the Privacy Policy and Terms of Use");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      dispatch(setUser({ email: user.email, name: user.name })); // Dispatch action
      console.log("Successfully logged in!", user);
      router.push("/home"); // Redirect to the home screen
    } catch (error) {
      console.error("Login Error:", error);
      // Handle login errors here (e.g. display an alert)
      alert("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

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
        value={email}
        onChangeText={(text) => setEmail(text)}
        className={`placeholder:text-color2 border border-color4 rounded-md py-3 px-4 mt-4 w-full focus:outline-color1 ${
          emailError ? "border-red-500" : ""
        }`}
      />
      {emailError ? (
        <Text className="text-red-500 text-[10px] mt-1 w-full text-left">
          {emailError}
        </Text>
      ) : null}

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        className={`placeholder:text-color2 border border-color4 rounded-md py-3 px-4 mt-4 w-full focus:outline-color1 ${
          passwordError ? "border-red-500" : ""
        }`}
        secureTextEntry // Use for password inputs
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      {passwordError ? (
        <Text className="text-red-500 text-[10px] mt-1 w-full text-left">
          {passwordError}
        </Text>
      ) : null}

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
          I agree to Alexium's{" "}
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text className="underline text-[10px]">Privacy Policy</Text>
          </TouchableOpacity>{" "}
          and
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text className="underline text-[10px]"> Terms of Use.</Text>
          </TouchableOpacity>
        </Text>
      </View>
      {checkboxError ? (
        <Text className="text-red-500 text-[10px] mb-3 w-full text-left">
          {checkboxError}
        </Text>
      ) : null}

      {/* Login Button */}
      <ButtonComponent
        label="Login"
        onPress={handleLogin}
        disabled={loading}
        loading={loading}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/login/forgot-password")}
      >
        <Text className="font-medium  text-gray-500 underline text-[10px]">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* OR Separator */}
      <Text className="my-6 text-color2">or</Text>

      {/* Request Access Button */}
      <ButtonComponent
        label="Request Access"
        var2
        onPress={() => router.push("/login/request-access")}
      />
    </View>
  );
};

export default LoginScreen;
