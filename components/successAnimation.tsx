// components/SuccessAnimation.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import CheckIcon from '@/components/svg/checkIcon';

interface SuccessAnimationProps {
  onAnimationComplete?: () => void;
  message?: string;
  isSuccess?: boolean;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  onAnimationComplete,
  message = "Success",
  isSuccess = true,
}) => {
  const translateY = useSharedValue(-40); // Initial position above view
  const animationDuration = 300;
  const holdDuration = 2000;

  useEffect(() => {
    translateY.value = withTiming(
      20,
      { duration: animationDuration, easing: Easing.ease },
      () => {
        // After slide down, hold for a second, and then animate out
        setTimeout(() => {
          translateY.value = withTiming(
            -40,
            { duration: animationDuration, easing: Easing.ease },
            () => {
              runOnJS(() => {
                if (onAnimationComplete) {
                  onAnimationComplete();
                }
              })();
            }
          );
        }, holdDuration);
      }
    );
  }, [translateY, animationDuration, holdDuration, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle} className="w-full z-30 absolute">
      <View
        className={`flex-row items-center justify-center gap-3 w-4/5 mx-auto bg-white rounded-lg p-3 border ${isSuccess ? 'border-color9' : 'border-red-500'}`}
        style={{ boxShadow: '0px 4px 10px 0px rgba(7, 170, 48, 0.25)' }}
      >
        <CheckIcon /> <Text className={`text-sm ${isSuccess ? 'text-[#018221]' : 'text-red-500'}`}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default SuccessAnimation;