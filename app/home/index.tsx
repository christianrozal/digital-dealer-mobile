import ButtonComponent from "@/components/button";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Client, Account } from "react-native-appwrite";

// Initialize Appwrite client (make sure to set your actual endpoint and project ID)
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const account = new Account(client);

const HomeScreen = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setLoggedInUser(null);
      console.log("Successfully logged out!");
      router.replace("/login"); // Redirect to the login screen
    } catch (error) {
      console.error("Logout Error:", error);
      // Handle logout errors here
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      <ScrollView className="flex-1 text-xs bg-white px-5 ">
        {/* Home Title */}
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Home</Text>
          <TouchableOpacity>
            <Image
              source={require("@/assets/images/filter-icon.webp")}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>

        {/* Graph */}
        <Image
          source={require("@//assets/images/graph-placeholder.webp")}
          style={{ width: "100%", height: 150 }}
          className="mt-5"
        />

        {/* Recent Activities */}
        <View className="mt-10">
          <Text className="text-xs text-gray-500 font-medium">
            Recent Activities
          </Text>
          {/* Today's Scans */}
          <View className="flex-row justify-between mt-3 bg-color3 p-3 rounded-md">
            <Text className="text-xs font-bold">Today (3 Dec 2024)</Text>
            <Text className="text-xs">
              #scans: <Text className="font-bold">3</Text>
            </Text>
          </View>
        </View>

        {/* Activity List */}
        <View>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs mr-5 text-gray-500">11:24 AM</Text>
            <Text className="flex-1 text-xs">Mani Prakash</Text>
            <View className="bg-color5 px-2 py-1 rounded-md w-12 mr-2">
              <Text className="text-white text-xs text-center">Hot</Text>
            </View>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/triple-dot.webp")}
                style={{ width: 21, height: 20 }}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs mr-5 text-gray-500">10:24 AM</Text>
            <Text className="flex-1 text-xs">Alex Bompane</Text>
            <View className="bg-color6 px-2 py-1 rounded-md w-12 mr-2">
              <Text className="text-white text-xs text-center">Warm</Text>
            </View>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/triple-dot.webp")}
                style={{ width: 21, height: 20 }}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs mr-5 text-gray-500">09:24 AM</Text>
            <Text className="flex-1 text-xs">Shey</Text>
            <View className="bg-color7 px-2 py-1 rounded-md w-12 mr-2">
              <Text className="text-black text-xs text-center">Cold</Text>
            </View>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/triple-dot.webp")}
                style={{ width: 21, height: 20 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 mt-5">
        <ButtonComponent label="Logout" var2 onPress={handleLogout} />
      </View>
    </>
  );
};

export default HomeScreen;
