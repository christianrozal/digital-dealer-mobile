import {
  View,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React from "react";
import BackArrowIcon from "../svg/backArrow";
import QrScreen from "./qr";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { resetScreen, setScreen } from "@/store/sidePaneSlice";
import ProfileScreen from "./profile";
import EditProfileScreen from "./editProfile";

const SCREEN_WIDTH = Dimensions.get("window").width;

const SidePaneComponent = ({
  translateX,
}: {
  translateX: Animated.SharedValue<number>;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentScreen = useSelector(
    (state: RootState) => state.sidePane.currentScreen
  );

  // Reset to main screen when pane opens
  useAnimatedReaction(
    () => translateX.value,
    (currentValue, previousValue) => {
      if (previousValue === -SCREEN_WIDTH * 0.95 && currentValue === 0) {
        runOnJS(dispatch)(resetScreen());
      }
    }
  );

  const handleClose = () => {
    translateX.value = withSpring(-SCREEN_WIDTH * 0.95);
  };

  const handleBackPress = () => {
    if (currentScreen === "main") {
      handleClose();
    } else {
      dispatch(setScreen("main"));
    }
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
              <TouchableOpacity onPress={handleBackPress}>
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

            {/* Content Area */}
            {currentScreen === "main" && <QrScreen />}
            {currentScreen === "profile" && <ProfileScreen />}
            {currentScreen === "editProfile" && <EditProfileScreen />}
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export default SidePaneComponent;
