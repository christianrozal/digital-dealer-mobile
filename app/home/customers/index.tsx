import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import SearchIcon from "@/components/svg/searchIcon";
import FilterIcon from "@/components/svg/filterIcon";
import PhoneIcon from "@/components/svg/phoneIcon";

const CustomersScreen = () => {
  return (
    <View className="px-5">
      <View className="flex-row justify-between items-center mt-5">
        <Text className="text-2xl font-semibold">Customers</Text>
        <View className="flex-row gap-1 items-center">
          <TouchableOpacity>
            <SearchIcon width={28} height={28} stroke="#9EA5AD" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FilterIcon stroke="#9EA5AD" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-5">
        <View className="bg-color3 rounded-md p-3">
          <Text className="text-xs font-bold">Recent</Text>
        </View>
        <View className="p-3 mt-2 rounded-md flex-row justify-between items-center">
          <View className="items-center flex-row gap-3">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Ar</Text>
            </View>
            <View>
              <Text className="font-bold text-sm">Archer Williams</Text>
              <View className="flex-row gap-1 items-center mt-1">
                <PhoneIcon width={14} height={14} />
                <Text className="text-gray-500 text-xs">+0416499509</Text>
              </View>
              <Text className="text-[10px] font-semibold text-gray-400">
                Last scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-[10px] text-gray-500">#scans: 3</Text>
            <View className="flex-row gap-2">
              <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                Warm
              </Text>
            </View>
          </View>
        </View>
        <View className="p-3 mt-2 rounded-md flex-row justify-between items-center">
          <View className="items-center flex-row gap-3">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Be</Text>
            </View>
            <View>
              <Text className="font-bold text-sm">Benjamin Clark</Text>
              <View className="flex-row gap-1 items-center mt-1">
                <PhoneIcon width={14} height={14} />
                <Text className="text-gray-500 text-xs">+0416499509</Text>
              </View>
              <Text className="text-[10px] font-semibold text-gray-400">
                Last scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-[10px] text-gray-500">#scans: 3</Text>
            <View className="flex-row gap-2">
              <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                Warm
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-5">
        <View className="bg-color3 rounded-md p-3">
          <Text className="text-xs font-bold">Contacts</Text>
        </View>
        <View className="px-3 mt-3">
          <Text className="font-bold text-lg">A</Text>
        </View>

        <View className="p-3 rounded-md flex-row justify-between items-center">
          <View className="items-center flex-row gap-3">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Ad</Text>
            </View>
            <View>
              <Text className="font-bold text-sm">Adam Parker</Text>
              <View className="flex-row gap-1 items-center mt-1">
                <PhoneIcon width={14} height={14} />
                <Text className="text-gray-500 text-xs">+0416499509</Text>
              </View>
              <Text className="text-[10px] font-semibold text-gray-400">
                Last scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-[10px] text-gray-500">#scans: 3</Text>
            <View className="flex-row gap-2">
              <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                Warm
              </Text>
            </View>
          </View>
        </View>
        <View className="p-3 mt-2 rounded-md flex-row justify-between items-center">
          <View className="items-center flex-row gap-3">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Ar</Text>
            </View>
            <View>
              <Text className="font-bold text-sm">Archer Williams</Text>
              <View className="flex-row gap-1 items-center mt-1">
                <PhoneIcon width={14} height={14} />
                <Text className="text-gray-500 text-xs">+0416499509</Text>
              </View>
              <Text className="text-[10px] font-semibold text-gray-400">
                Last scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-[10px] text-gray-500">#scans: 3</Text>
            <View className="flex-row gap-2">
              <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                Warm
              </Text>
            </View>
          </View>
        </View>

        <View className="px-3 mt-3">
          <Text className="font-bold text-lg">B</Text>
        </View>

        <View className="p-3 rounded-md flex-row justify-between items-center">
          <View className="items-center flex-row gap-3">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Ba</Text>
            </View>
            <View>
              <Text className="font-bold text-sm">Bailey Taylor</Text>
              <View className="flex-row gap-1 items-center mt-1">
                <PhoneIcon width={14} height={14} />
                <Text className="text-gray-500 text-xs">+0416499509</Text>
              </View>
              <Text className="text-[10px] font-semibold text-gray-400">
                Last scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-[10px] text-gray-500">#scans: 3</Text>
            <View className="flex-row gap-2">
              <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                Warm
              </Text>
            </View>
          </View>
        </View>
        <View className="p-3 mt-2 rounded-md flex-row justify-between items-center">
          <View className="items-center flex-row gap-3">
            <View className="size-9 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">Be</Text>
            </View>
            <View>
              <Text className="font-bold text-sm">Benjamin Clark</Text>
              <View className="flex-row gap-1 items-center mt-1">
                <PhoneIcon width={14} height={14} />
                <Text className="text-gray-500 text-xs">+0416499509</Text>
              </View>
              <Text className="text-[10px] font-semibold text-gray-400">
                Last scanned:{" "}
                <Text className="font-normal">17 Jan 2025 8:31 PM</Text>
              </Text>
            </View>
          </View>
          <View className="gap-2">
            <Text className="text-[10px] text-gray-500">#scans: 3</Text>
            <View className="flex-row gap-2">
              <Text className="rounded-full text-[10px] border border-orange-400 bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 ">
                Warm
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CustomersScreen;
