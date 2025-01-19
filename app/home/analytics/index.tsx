import { View, Text } from "react-native";
import React from "react";
import ButtonComponent from "@/components/button";
import { Link } from "expo-router";

const AnalyticsScreen = () => {
  return (
    <View>
      <Link href="/home">
        <ButtonComponent label="Back" />
      </Link>
      <Text>AnalyticsScreen</Text>
    </View>
  );
};

export default AnalyticsScreen;
