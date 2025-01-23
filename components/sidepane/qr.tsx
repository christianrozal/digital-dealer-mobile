// components/sidepane/qr.tsx

import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import EmailIcon from "../svg/emailIcon";
import PhoneIcon from "../svg/phoneIcon";
import ProfileIcon from "../svg/profileIcon";
import NotificationsIcon from "../svg/notificationsIcon";
import { useDispatch } from "react-redux";
import { setScreen } from "@/store/sidePaneSlice";

const QrScreen = () => {
  const dispatch = useDispatch();
  return (
    <View className="mt-16">
      <View className="bg-color3 rounded-md" style={{ padding: 20 }}>
        <Image
          source={require("@/assets/images/sample_qr.png")}
          style={{ width: 229, height: 208 }}
          className="mx-auto"
        />
      </View>

      <View
        className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md"
        style={{ paddingHorizontal: 24 }}
      >
        <EmailIcon stroke="#3D12FA" width={20} height={20} />
        <Text className="text-xs">abompane@alexium.com.au</Text>
      </View>
      <View
        className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
        style={{ paddingHorizontal: 24 }}
      >
        <PhoneIcon stroke="#3D12FA" width={20} height={20} />
        <Text className="text-xs">&#40;03&#41; 9847 7927</Text>
      </View>

      <View className="flex-row mx-auto gap-10" style={{ marginTop: 64 }}>
        <TouchableOpacity onPress={() => dispatch(setScreen("profile"))}>
          <View className="flex-row gap-1 items-center">
            <ProfileIcon />
            <Text className="text-xs font-medium">Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View className="flex-row gap-1 items-center">
            <NotificationsIcon />
            <Text className="text-xs font-medium">Notifications</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QrScreen;
