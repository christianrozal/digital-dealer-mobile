import {
  View,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React from "react";
import BackArrowIcon from "./svg/backArrow";
import EmailIcon from "./svg/emailIcon";
import PhoneIcon from "./svg/phoneIcon";
import ProfileIcon from "./svg/profileIcon";
import NotificationsIcon from "./svg/notificationsIcon";

const SCREEN_WIDTH = Dimensions.get("window").width;

const SidePaneComponent = ({
  translateX,
}: {
  translateX: Animated.SharedValue<number>;
}) => {
  const handleClose = () => {
    translateX.value = withSpring(-SCREEN_WIDTH * 0.95);
  };

  const closeGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newTranslate = translateX.value + e.translationX;
      translateX.value = Math.min(
        0,
        Math.max(-SCREEN_WIDTH * 0.95, newTranslate)
      );
    })
    .onEnd((e) => {
      if (translateX.value < -SCREEN_WIDTH * 0.45 || e.velocityX < -500) {
        translateX.value = withSpring(-SCREEN_WIDTH * 0.95, {
          velocity: e.velocityX,
        });
      } else {
        translateX.value = withSpring(0, { velocity: e.velocityX });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SCREEN_WIDTH * 0.95, 0], [0, 0.7]),
    pointerEvents: translateX.value > -SCREEN_WIDTH * 0.95 ? "auto" : "none",
    backgroundColor: "black",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
  }));

  return (
    <>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={overlayStyle}
          needsOffscreenAlphaCompositing={true}
        />
      </TouchableWithoutFeedback>

      <GestureDetector gesture={closeGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: "-15%",
              top: 0,
              width: "110%",
              height: "100%",
              backgroundColor: "white",
              zIndex: 30,
              paddingLeft: "15%",
            },
            animatedStyle,
          ]}
        >
          <View className="h-screen relative" style={{ padding: 32 }}>
            <View
              style={{
                height: 28,
                width: 3,
                position: "absolute",
                right: 3,
                top: "50%",
                transform: [{ translateY: "-50%" }],
                backgroundColor: "#D1D5DC",
                borderRadius: 3,
              }}
            />
            <View className="flex-row items-center" style={{ gap: 16 }}>
              <TouchableOpacity onPress={handleClose}>
                <BackArrowIcon />
              </TouchableOpacity>
              <View
                className="bg-color1 rounded-full flex items-center justify-center"
                style={{ width: 40, height: 40 }}
              >
                <Text className="text-white font-bold text-sm">Ab</Text>
              </View>
              <View>
                <Text className="text-sm font-medium">Alex Bompane</Text>
                <Text className="text-xs text-gray-500">Sales Consultant</Text>
              </View>
            </View>

            <View
              className="bg-color3 rounded-md mt-10"
              style={{ padding: 20 }}
            >
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

            <View
              className="absolute flex-row justify-between"
              style={{
                bottom: 40,
                paddingHorizontal: 64,
                width: "100%",
                marginHorizontal: -32,
              }}
            >
              <TouchableOpacity>
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
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export default SidePaneComponent;
