import { View, Text, TextInput } from "react-native";
import React from "react";
import ProfileIcon from "../svg/profileIcon";
import EmailIcon from "../svg/emailIcon";
import PhoneIcon from "../svg/phoneIcon";
import CompanyIcon from "../svg/companyIcon";
import JobTitleIcon from "../svg/jobTitleIcon";
import ButtonComponent from "../button";

const EditProfileScreen = () => {
  return (
    <View className="mt-10">
      {/* Name Input */}
      <View className="mt-2">
        <Text className="text-sm text-gray-600">Full Name</Text>
        <View
          className="flex-row items-center border rounded-md px-4 mt-1"
          style={{ borderColor: "#D1D5DC" }}
        >
          <View style={{ marginRight: 12 }}>
            <ProfileIcon width={18} height={18} />
          </View>
          <TextInput
            placeholder="Enter your full name"
            className="py-3 placeholder:text-gray-400 w-full"
          />
        </View>
      </View>

      {/* Email Input */}
      <View className="mt-2">
        <Text className="text-sm text-gray-600">Email</Text>
        <View
          className="flex-row items-center border rounded-md px-4 mt-1"
          style={{ borderColor: "#D1D5DC" }}
        >
          <View style={{ marginRight: 12 }}>
            <EmailIcon width={18} height={18} />
          </View>
          <TextInput
            placeholder="Enter your email"
            className="py-3 placeholder:text-gray-400 w-full"
          />
        </View>
      </View>

      {/* Contact Input */}
      <View className="mt-2">
        <Text className="text-sm text-gray-600">Contact</Text>
        <View
          className="flex-row items-center border rounded-md px-4 mt-1"
          style={{ borderColor: "#D1D5DC" }}
        >
          <View style={{ marginRight: 12 }}>
            <PhoneIcon width={18} height={18} />
          </View>
          <TextInput
            placeholder="Enter your number"
            className="py-3 placeholder:text-gray-400 w-full"
          />
        </View>
      </View>

      {/* Company Input */}
      <View className="mt-2">
        <Text className="text-sm text-gray-600">Company</Text>
        <View
          className="flex-row items-center border rounded-md px-4 mt-1"
          style={{ borderColor: "#D1D5DC" }}
        >
          <View style={{ marginRight: 12 }}>
            <CompanyIcon width={18} height={18} />
          </View>
          <TextInput
            placeholder="Enter your company name"
            className="py-3 placeholder:text-gray-400 w-full"
          />
        </View>
      </View>

      {/* Job Title Input */}
      <View className="mt-2">
        <Text className="text-sm text-gray-600">Job Title</Text>
        <View
          className="flex-row items-center border rounded-md px-4 mt-1"
          style={{ borderColor: "#D1D5DC" }}
        >
          <View style={{ marginRight: 12 }}>
            <JobTitleIcon width={18} height={18} />
          </View>
          <TextInput
            placeholder="Enter your job title"
            className="py-3 placeholder:text-gray-400 w-full"
          />
        </View>
      </View>

      <ButtonComponent label="Update Profile" className="mt-20" />
    </View>
  );
};

export default EditProfileScreen;
