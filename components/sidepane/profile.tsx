import { View, Text } from "react-native";
import React from "react";
import FacebookIcon from "../svg/facebookIcon";
import InstagramIcon from "../svg/instagramIcon";
import YouTubeIcon from "../svg/youtubeIcon";
import LinkedInIcon from "../svg/linkedinIcon";
import EmailIcon from "../svg/emailIcon";
import PhoneIcon from "../svg/phoneIcon";
import WebsiteIcon from "../svg/websiteIcon";
import ButtonComponent from "../button";
import { useDispatch } from "react-redux";
import { setScreen } from "@/lib/store/sidePaneSlice";

const ProfileScreen = () => {
  const dispatch = useDispatch();
  return (
    <View className="mt-16">
      <View
        className="bg-white rounded-md justify-center items-center"
        style={{
          padding: 20,
          shadowColor: "#9a9a9a",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 9.4,
          elevation: 4,
        }}
      >
        <View
          className="bg-color1 rounded-full flex items-center justify-center"
          style={{ width: 100, height: 100 }}
        >
          <Text className="text-white font-bold" style={{ fontSize: 30 }}>
            Ab
          </Text>
        </View>
        <Text className="text-2xl font-semibold mt-3">Alex Bompane</Text>
        <Text className="text-xs text-gray-500">Sales Consultant</Text>
        <View className="flex-row items-center mt-4" style={{ gap: 10 }}>
          <FacebookIcon />
          <InstagramIcon />
          <YouTubeIcon />
          <LinkedInIcon />
        </View>
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
      <View
        className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
        style={{ paddingHorizontal: 24 }}
      >
        <WebsiteIcon fill="#3D12FA" width={20} height={20} />
        <Text className="text-xs">www.alexium.com.au</Text>
      </View>

      <ButtonComponent
        label="Edit Profile"
        var2
        className="mt-12"
        onPress={() => dispatch(setScreen("editProfile"))}
      />
    </View>
  );
};

export default ProfileScreen;
