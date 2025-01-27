import React, { FC } from "react";
import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";

interface ButtonComponentProps {
  var2?: boolean;
  label: string;
  className?: string;
  onPress?: (e: GestureResponderEvent) => void;
}

const ButtonComponent: FC<ButtonComponentProps> = ({
  var2 = false,
  label,
  className,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${className} ${
        var2 ? "bg-color3" : "bg-color1 "
      } py-3 rounded-full flex-1`}
    >
      <Text
        className={`${
          var2 ? "text-color1" : "text-white"
        } text-center font-semibold`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
