import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Checkbox from "@/components/rnr/checkbox";
import TextInput from "@/components/rnr/textInput";
import { Client, Account } from "react-native-appwrite";
import { setUserData } from '@/lib/store/userSlice';
import { databases, databaseId, usersId, scansId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useDispatch } from 'react-redux';
import { setCurrentUserId } from '@/lib/store/currentSlice';  

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
  const dispatch = useDispatch();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await account.getSession("current");
        if (session) {
          router.replace("/home");
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

      // Fetch user data after successful login
      const response = await databases.listDocuments(
        databaseId,
        usersId,
        [Query.equal('email', email)]
      );

      if (response.documents.length > 0) {
        const userData = response.documents[0];
        dispatch(setUserData(userData));
        dispatch(setCurrentUserId(userData.$id));
        console.log("Current user ID:", userData?.$id);
        console.log("Current user data:", userData);
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

          // Fetch user data in case of session conflict
          const response = await databases.listDocuments(
            databaseId,
            usersId,
            [Query.equal('email', email)]
          );

          if (response.documents.length > 0) {
            const userData = response.documents[0];
            dispatch(setUserData(userData));
            dispatch(setCurrentUserId(userData.$id));
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
      <View className="mt-4 w-full">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"

          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View className="mt-4 w-full">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {/* Checkbox Section */}
      <View className="flex-row items-center mt-5 w-full">
        <Checkbox
          checked={checked}
          onPress={() => setChecked(!checked)}
          size={14}
        />
        <Text className="text-[10px] font-medium text-color2 ml-2">
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

      {/* Login Button */ }
      <View className="w-full mt-8">
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