import React from "react";
import Svg, { Path } from "react-native-svg";

interface FilterIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const FilterIcon: React.FC<FilterIconProps> = ({
  width = 22,
  height = 22,
  stroke = "black",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
      <Path
        d="M5.79592 11.1826H15.7145M3.5918 6.70547H17.9186M9.10211 15.6597H12.4083"
        stroke={stroke}
        strokeWidth="1.79085"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default FilterIcon;
