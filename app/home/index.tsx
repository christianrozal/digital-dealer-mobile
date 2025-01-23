import ButtonComponent from "@/components/button";
import CalendarIcon from "@/components/svg/calendar";
import EmailIcon from "@/components/svg/emailIcon";
import FilterIcon from "@/components/svg/filterIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import SearchIcon from "@/components/svg/searchIcon";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
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
    <View className="flex-1 text-xs bg-white px-5 pb-32">
      {/* Home Title */}
      <View className="flex-row justify-between items-center mt-5">
        <Text className="text-2xl font-semibold">Activities</Text>
        <View className="flex-row gap-1 items-center">
          <TouchableOpacity>
            <SearchIcon width={28} height={28} />
          </TouchableOpacity>
          <TouchableOpacity>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-3">
        <Text className="text-xs text-gray-500">
          Below shows the list of scans done.
        </Text>
      </View>

      <View className="flex-row justify-between rounded-md bg-color3 p-3 mt-5">
        <Text className="text-xs font-bold">
          Today{" "}
          <Text className="text-[10px] font-normal">&#40;3 Dec 2024&#41;</Text>
        </Text>
        <Text className="text-[10px]">
          #scans: <Text className="text-xs font-bold">12</Text>
        </Text>
      </View>

      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} className="mt-7">
          <View className="p-3 rounded-t-md bg-white border-t border-x border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-row gap-2 items-center">
                <View className="size-7 bg-color1 rounded-full flex items-center justify-center ">
                  <Text className="text-white font-bold text-xs">Ja</Text>
                </View>
                <Text className="font-bold text-sm">Jane Doe</Text>
              </View>
              <Text className="text-gray-500 text-[10px]">#scans: 4</Text>
            </View>
            <View className="flex-row items-center mt-3 gap-1.5">
              <PhoneIcon width={15} height={15} />
              <Text className="text-[10px] text-gray-500">+0416499509</Text>
            </View>
            <View className="flex-row items-center mt-2 gap-2">
              <EmailIcon width={15} height={15} />
              <Text className="text-[10px] text-gray-500">
                anastasia.chekhov@gmail.com
              </Text>
            </View>

            <View className="mt-5 flex-row gap-2 justify-between flex-wrap">
              <View className="flex-row gap-2  items-center">
                <Text className="text-[10px] text-gray-500">
                  Interested In:
                </Text>
                <View className="flex-row gap-1">
                  <Text className="rounded-full text-[10px] border border-green-400 bg-green-100 text-green-500 font-semibold px-2 py-0.5 ">
                    Buying
                  </Text>
                  <Text className="rounded-full text-[10px] border border-amber-400 bg-amber-100 text-amber-500 font-semibold px-2 py-0.5 ">
                    Selling
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-2 items-center">
                <Text className="text-[10px] text-gray-500">
                  Interest Status:
                </Text>
                <View className="flex-row gap-2">
                  <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                    Warm
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="py-2 flex-row gap-3 justify-between border border-gray-200 rounded-b-md px-3 bg-color3 flex-wrap">
            <View className="flex-row gap-1 items-center">
              <Text className="font-bold text-gray-500 text-[10px]">
                Follow Up:
              </Text>
              <CalendarIcon width={15} height={15} />
              <Text className="text-gray-500 text-[10px]">Fri, Jan 17</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-[10px] font-bold">
                Last Scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
        </View>
      ))}

      <View className="px-5 mt-5">
        <ButtonComponent label="Logout" var2 onPress={handleLogout} />
      </View>
    </View>
  );
};

export default HomeScreen;
