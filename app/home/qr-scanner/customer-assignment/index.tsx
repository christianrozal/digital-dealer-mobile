import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { Picker } from "@react-native-picker/picker";

const CustomerAssignmentScreen = () => {
  const [selectedName, setSelectedName] = useState(""); // Initialize with an empty string or a default name

  const consultantNames = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Williams",
    "Charlie Brown",
    // Add all consultants that would be in the dropdown list
  ];
  const renderNameOptions = () => {
    return consultantNames.map((name, index) => (
      <Picker.Item label={name} value={name} key={index} />
    ));
  };

  return (
    <View className="pt-5 px-5">
      <View className="mt-12">
        <Text className="text-2xl font-semibold">Customer Assignment</Text>
        <Text className="text-xs text-gray-400 mt-3">
          The below customer will be assigned to you. In case the customer was
          assigned to anyone else, we will send the notification to align
          everyone.
        </Text>
      </View>

      {/* Customer Info */}
      <View className="bg-color8 rounded-md px-5 py-7 mt-5 flex-row gap-5">
        <Image
          source={require("@/assets/images/profile-mani.webp")}
          style={{ width: 56, height: 56 }}
        />
        <View className="gap-1">
          <Text className="text-white text-[10px]">
            Customer Name: <Text className="font-bold">Mani Prakash</Text>
          </Text>
          <Text className="text-white text-[10px]">
            Contact Number: <Text className="font-bold">+61 (0)416499509</Text>
          </Text>
          <Text className="text-white text-[10px]">
            Email: <Text className="font-bold">mani@loonalabs.com</Text>
          </Text>
        </View>
      </View>

      {/* Consultant List*/}
      <View className="mt-6">
        <Text className="text-[10px] text-gray-500">
          Prior Sales Consultant(s)
        </Text>
        <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
          <Text className="text-xs">Alex, China</Text>
        </View>
      </View>

      {/* Name Select */}
      <View className="mt-3">
        <Text className="text-[10px] text-gray-500">Your Name</Text>
        <View className="rounded-md mt-1 w-full">
          <Picker
            selectedValue={selectedName}
            onValueChange={(itemValue) => setSelectedName(itemValue)}
            className="text-xs  focus:outline-color1 bg-color3 p-3 rounded-md"
          >
            <Picker.Item label="Select a name" value="" /> {renderNameOptions()}
          </Picker>
        </View>
      </View>

      {/* Assign Button */}
      <Link href="/home/qr-scanner/post-assignment" className="w-full">
        <TouchableOpacity className="bg-color1 py-3 rounded-full w-full mt-10">
          <Text className="text-white text-center font-semibold">Assign</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default CustomerAssignmentScreen;
