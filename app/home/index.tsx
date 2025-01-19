import { Link } from "expo-router";
import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";

const HomeScreen = () => {
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
            <Text className="text-xs font-bold">
              Today &#40;3 Dec 2024&#41;
            </Text>
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

      {/* Bottom Navigation Bar */}
      <View className="fixed bottom-0 w-full flex-row justify-center gap-10 items-center py-2 mt-5 shadow-md">
        <TouchableOpacity className="flex items-center">
          <Image
            source={require("@/assets/images/activity-icon.webp")}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-[10px] text-gray-500 font-semibold mt-1">
            Activity
          </Text>
        </TouchableOpacity>
        {/* Qr Screen */}
        <Link href="./home/qr-scanner/customer-assignment/">
          <TouchableOpacity>
            <Image
              source={require("@/assets/images/scan-icon.webp")}
              style={{ width: 51, height: 51 }}
            />
          </TouchableOpacity>
        </Link>
        <TouchableOpacity className="flex items-center">
          <Image
            source={require("@/assets/images/customers-icon.webp")}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-[10px] text-gray-500 font-semibold mt-1">
            Customers
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default HomeScreen;
