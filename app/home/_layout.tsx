import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Dimensions,
} from "react-native";
import React from "react";
import { router, Slot, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import AnalyticsIcon from "@/components/svg/analyticsIcon";
import NotificationsIcon from "@/components/svg/notificationsIcon";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";
import SidePaneComponent from "@/components/sidepane/sidePane";
import ActivityIcon from "@/components/svg/activityIcon";
import CustomersIcon from "@/components/svg/customersIcon";
import ScannerIcon from "@/components/svg/scannerIcon";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeLayout = () => {
  const isActivitiesFilterVisible = useSelector(
    (state: RootState) => state.ui.isActivitiesFilterVisible
  );

  const consultant = useSelector((state: RootState) => state.consultant.data);
  const pathname = usePathname();
  const translateX = useSharedValue(-SCREEN_WIDTH * 0.95);

  const openGesture = Gesture.Pan()
    .hitSlop({ left: 0, width: 30 })
    .onBegin((e) => {
      if (translateX.value === -SCREEN_WIDTH * 0.95 && e.x < 30) {
        return;
      }
    })
    .onUpdate((e) => {
      const newTranslate = -SCREEN_WIDTH * 0.95 + e.translationX;
      translateX.value = Math.min(
        0,
        Math.max(-SCREEN_WIDTH * 0.95, newTranslate)
      );
    })
    .onEnd((e) => {
      if (e.translationX > SCREEN_WIDTH * 0.3 || e.velocityX > 500) {
        translateX.value = withSpring(0, { velocity: e.velocityX });
      } else {
        translateX.value = withSpring(-SCREEN_WIDTH * 0.95, {
          velocity: e.velocityX,
        });
      }
    });

  return (
    <GestureDetector gesture={openGesture}>
      <View className="flex-1 bg-white pb-20">
        <View
          className={`absolute top-0 left-0 z-50  w-screen h-screen bg-black backdrop-blur-lg pointer-events-none transition-opacity duration-300 ${
            isActivitiesFilterVisible ? "opacity-10" : "opacity-0"
          }`}
        />
        {/* Header */}
        <View className="flex-row justify-between items-center py-5 px-5 z-20 bg-white fixed top-0 w-full">
          {/* User Icon */}
          <TouchableOpacity
            onPress={() => {
              if (translateX.value === -SCREEN_WIDTH * 0.95) {
                translateX.value = withSpring(0);
              }
            }}
          >
            <View className="size-8 bg-color1 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-xs">
                {consultant?.name
                  ? consultant.name[0].toUpperCase() +
                    (consultant.name.length > 1
                      ? consultant.name[1].toLowerCase()
                      : "")
                  : ".."}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Logo */}
          <View>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </View>

          {/* Header Icons */}
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity onPress={() => router.push("/home/analytics")}>
              <AnalyticsIcon
                width={20}
                height={20}
                stroke={pathname === "/home/analytics" ? "#3D12FA" : "#9EA5AD"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/home/notifications")}
            >
              <NotificationsIcon
                width={20}
                height={20}
                stroke={
                  pathname === "/home/notifications" ? "#3D12FA" : "#9EA5AD"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Content */}
        <ScrollView className="flex-1">
          <Slot />
        </ScrollView>

        {/* Side Pane */}
        <SidePaneComponent translateX={translateX} />

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100 flex-row justify-center gap-10 items-center py-3">
          <TouchableOpacity
            className="flex items-center"
            onPress={() => router.push("/home")}
          >
            <ActivityIcon
              stroke={pathname === "/home" ? "#3D12FA" : "#BECAD6"}
            />
            <Text className="text-[10px] text-gray-500 font-semibold mt-1">
              Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/home/qr-scanner")}>
            <ScannerIcon
              fgColor={pathname === "/home/qr-scanner" ? "#3D12FA" : "#BECAD6"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex items-center"
            onPress={() => router.push("/home/customers")}
          >
            <CustomersIcon
              stroke={pathname === "/home/customers" ? "#3D12FA" : "#BECAD6"}
            />
            <Text className="text-[10px] text-gray-500 font-semibold mt-1">
              Customers
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureDetector>
  );
};

export default HomeLayout;
