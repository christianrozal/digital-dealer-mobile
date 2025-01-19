import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Link } from "expo-router";
import { Checkbox, RadioButton } from "react-native-paper";
import dayjs from "dayjs";
import CalendarModal from "@/components/calendarModal";

const PostAssignmentScreen = () => {
  const [isBuyingChecked, setBuyingChecked] = React.useState(false);
  const [isSellingChecked, setSellingChecked] = React.useState(false);
  const [isFinancingChecked, setFinancingChecked] = React.useState(false);
  const [isPurchasedChecked, setPurchasedChecked] = React.useState(false);
  const [value, setValue] = React.useState("hot");

  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDateTime(dayjs(date));
  };

  const handleOpenModal = () => {
    setDatePickerVisible(true);
  };

  const handleCloseModal = () => {
    setDatePickerVisible(false);
  };

  const getFormattedDateTime = () => {
    return selectedDateTime.format("DD MMM YYYY h:mm A");
  };

  return (
    <View className="bg-black">
      <View
        className={`pt-5 px-5 bg-white transition-all duration-300 ${
          isDatePickerVisible ? "opacity-50" : ""
        }`}
      >
        <View className="mt-12">
          <Text className="text-2xl font-semibold">Customer Log</Text>
        </View>

        {/* Customer Info */}
        <View className="bg-color8 rounded-md px-5 py-7 mt-4 flex-row gap-5">
          <Image
            source={require("@/assets/images/profile-mani.webp")}
            style={{ width: 56, height: 56 }}
          />
          <View className="gap-1">
            <Text className="text-white text-[10px]">
              Customer Name: <Text className="font-bold">Mani Prakash</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Contact Number:{" "}
              <Text className="font-bold">+61 (0)416499509</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Email: <Text className="font-bold">mani@loonalabs.com</Text>
            </Text>
          </View>
        </View>

        {/* Interest in checkbox group*/}
        <View className="mt-3">
          <Text className="text-[10px] text-gray-500">Interested In</Text>
          <View className="flex-row -ml-2">
            {/* Buying*/}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                setBuyingChecked(!isBuyingChecked);
              }}
            >
              <View className="scale-75">
                <Checkbox
                  status={isBuyingChecked ? "checked" : "unchecked"}
                  color="#3D12FA"
                />
              </View>
              <Text className="text-[10px] -ml-1">Buying</Text>
            </TouchableOpacity>
            {/* Selling*/}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                setSellingChecked(!isSellingChecked);
              }}
            >
              <View className="scale-75">
                <Checkbox
                  status={isSellingChecked ? "checked" : "unchecked"}
                  color="#3D12FA"
                />
              </View>
              <Text className="text-[10px] -ml-1">Selling</Text>
            </TouchableOpacity>
            {/* Financing*/}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                setFinancingChecked(!isFinancingChecked);
              }}
            >
              <View className="scale-75">
                <Checkbox
                  status={isFinancingChecked ? "checked" : "unchecked"}
                  color="#3D12FA"
                />
              </View>
              <Text className="text-[10px] -ml-1">Financing</Text>
            </TouchableOpacity>
            {/* Purchased*/}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                setPurchasedChecked(!isPurchasedChecked);
              }}
            >
              <View className="scale-75">
                <Checkbox
                  status={isPurchasedChecked ? "checked" : "unchecked"}
                  color="#3D12FA"
                />
              </View>
              <Text className="text-[10px] -ml-1">Purchased</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interest status radio group*/}
        <View className="mt-3">
          <Text className="text-[10px] text-gray-500">Interest Status</Text>
          <RadioButton.Group
            onValueChange={(newValue) => setValue(newValue)}
            value={value}
          >
            <View className="flex-row -ml-2">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setValue("hot")}
              >
                <View className="scale-50">
                  <RadioButton color="#3D12FA" value="hot" />
                </View>
                <Text
                  className={`text-[10px] -ml-2 ${
                    value === "hot" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Hot
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setValue("warm")}
              >
                <View className="scale-50">
                  <RadioButton color="#3D12FA" value="warm" />
                </View>
                <Text
                  className={`text-[10px] -ml-2 ${
                    value === "warm" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Warm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setValue("cold")}
              >
                <View className="scale-50">
                  <RadioButton color="#3D12FA" value="cold" />
                </View>
                <Text
                  className={`text-[10px] -ml-2 ${
                    value === "cold" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Cold
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setValue("not-interested")}
              >
                <View className="scale-50">
                  <RadioButton color="#3D12FA" value="not-interested" />
                </View>
                <Text
                  className={`text-[10px] -ml-2 ${
                    value === "not-interested" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Not Interested
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setValue("bought")} // Set "bought" when TouchableOpacity is pressed
              >
                <View className="scale-50">
                  <RadioButton color="#3D12FA" value="bought" />
                </View>
                <Text
                  className={`text-[10px] -ml-2 ${
                    value === "bought" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Bought
                </Text>
              </TouchableOpacity>
            </View>
          </RadioButton.Group>
        </View>

        {/* Follow up select date*/}
        <View className="mt-3">
          <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 5,
              padding: 10,
            }}
            onPress={handleOpenModal}
            className="mt-3"
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-xs">{getFormattedDateTime()}</Text>
              <Text>📅</Text>
            </View>
          </TouchableOpacity>

          <CalendarModal
            isVisible={isDatePickerVisible}
            onClose={handleCloseModal}
            onDateSelect={handleDateSelect}
          />
        </View>

        <View className="mt-10 flex-row gap-5">
          {/* Comments*/}
          <TouchableOpacity className="bg-color3 py-2 px-4 rounded-full">
            <Text className="text-black text-[10px] text-center font-semibold">
              Comments
            </Text>
          </TouchableOpacity>
          {/* Thread */}
          <TouchableOpacity className="py-2 px-4 rounded-full">
            <Text className="text-black text-[10px] text-center font-semibold">
              Thread
            </Text>
          </TouchableOpacity>
        </View>
        {/* Add Comment */}
        <TextInput
          placeholder="Add your comment"
          multiline={true}
          numberOfLines={4}
          className="placeholder:text-gray-400 placeholder:text-[10px] text-xs border border-color4 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
        />

        {/* Update button*/}
        <Link href="/home/qr-scanner/post-assignment-filled" className="w-full">
          <TouchableOpacity className="bg-color1 py-3 rounded-full w-full mt-5">
            <Text className="text-white text-center font-semibold text-sm">
              Update
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Back button*/}
        <Link href="/home/qr-scanner/post-assignment" className="w-full">
          <TouchableOpacity className="bg-color3 py-3 rounded-full w-full mt-3">
            <Text className="text-color1 text-center font-semibold text-sm">
              Back to Activities
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default PostAssignmentScreen;
