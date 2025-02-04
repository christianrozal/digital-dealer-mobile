import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Checkbox } from "react-native-paper";
import { Client, Account } from "react-native-appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const account = new Account(client);

interface AppwriteError extends Error {
    code?: number
}
const LoginScreen = () => {
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await account.getSession("current");
        if (session) {
          router.replace("/dealerships");
        }
      } catch (error) {
         console.log("No existing session:", (error as AppwriteError).message);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
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

    if (!isValid) return;

    setLoading(true);
    try {
      // First create the session
      const session = await account.createEmailPasswordSession(email, password);
      
      // Then get the user's account info to check labels
      const accountInfo = await account.get();
      
      // Check if user has any of the allowed roles
      const allowedRoles = ['consultant', 'manager', 'admin'];
      const hasAllowedRole = accountInfo.labels?.some(label => allowedRoles.includes(label));
      
      if (!hasAllowedRole) {
        // If user doesn't have any allowed role, delete the session and show error
        await account.deleteSession(session.$id);
        alert('Access denied. You do not have permission to access this application.');
        return;
      }

      // If we get here, user has an allowed role
      router.replace("/dealerships");
    } catch (error) {
      console.error("Login Error:", error);
      if ((error as AppwriteError).code === 409) {
        // Session conflict error - still need to verify if user has allowed role
        try {
          const accountInfo = await account.get();
          const allowedRoles = ['consultant', 'manager', 'admin'];
          const hasAllowedRole = accountInfo.labels?.some(label => allowedRoles.includes(label));
          
          if (!hasAllowedRole) {
            alert('Access denied. You do not have permission to access this application.');
            await account.deleteSession('current');
            return;
          }
          router.replace("/dealerships");
        } catch (innerError) {
          console.error("Verification Error:", innerError);
          alert("An error occurred while verifying your access.");
        }
        return;
      }
      alert((error as AppwriteError).message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3D12FA" />
        <Text className="mt-4 text-gray-600">
          Checking for existing session...
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white items-center justify-center px-8 flex-1">
      {/* Logo Section */}
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
        onChangeText={setEmail}
        className={`placeholder:text-color2 border border-color4 rounded-md py-3 px-4 mt-4 w-full focus:outline-color1 ${
          emailError ? "border-red-500" : ""
        }`}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError && (
        <Text className="text-red-500 text-[10px] mt-1 w-full text-left">
          {emailError}
        </Text>
      )}

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        className={`placeholder:text-color2 border border-color4 rounded-md py-3 px-4 mt-4 w-full focus:outline-color1 ${
          passwordError ? "border-red-500" : ""
        }`}
        secureTextEntry
        autoCapitalize="none"
      />
      {passwordError && (
        <Text className="text-red-500 text-[10px] mt-1 w-full text-left">
          {passwordError}
        </Text>
      )}

      {/* Checkbox Section */}
      <View className="flex-row items-center mt-2 w-full -translate-x-2">
        <View className="scale-75">
          <Checkbox
            status={checked ? "checked" : "unchecked"}

            onPress={() => setChecked(!checked)}
            color="#3D12FA"
          />
        </View>
        <Text className="text-[10px] font-medium text-color2">
          I agree to Alexium's{" "}
          <Text 
            onPress={() => router.push("https://www.alexium.com.au/privacy-policy")} 
            className="underline font-medium text-color2 text-[10px] active:opacity-50"
          >
            Privacy Policy
          </Text>
          {" "}and{" "}
          <Text 
            onPress={() => router.push("https://www.alexium.com.au/terms-of-use")} 
            className="underline text-[10px] font-medium text-color2 active:opacity-50"
          >
            Terms of Use
          </Text>
        </Text>
      </View>
      {checkboxError && (
        <Text className="text-red-500 text-[10px] mb-3 w-full text-left">
          {checkboxError}
        </Text>
      )}

      {/* Login Button */}
      <View className="w-full mt-5">
        <ButtonComponent
          label="Login"
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
        />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/login/forgot-password")}
      >
        <Text className="font-medium text-gray-500 underline text-[10px]">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Separator */}
      <Text className="my-6 text-color2">or</Text>

      {/* Request Access Button */}
      <View className="w-full">
        <ButtonComponent
          label="Request Access"
          var2
          onPress={() => router.push("/login/request-access")}
        />
      </View>
    </View>
  );
};

export default LoginScreen;