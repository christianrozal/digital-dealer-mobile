import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import FilterIcon from "@/components/svg/filterIcon";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from "victory-native";

// Hardcoded sample data
const chartData = [
  { x: 1, y: 35 },
  { x: 2, y: 45 },
  { x: 3, y: 40 },
  { x: 4, y: 55 },
  { x: 5, y: 50 },
  { x: 6, y: 65 },
  { x: 7, y: 70 },
  { x: 8, y: 60 },
  { x: 9, y: 75 },
  { x: 10, y: 80 },
  { x: 11, y: 85 },
  { x: 12, y: 90 },
];

const AnalyticsScreen = () => {
  return (
    <View className="px-5 pt-20 flex-1">
      <View className="flex-row justify-between items-center mt-5">
        <Text className="text-2xl font-semibold">Analytics</Text>
        <TouchableOpacity>
          <FilterIcon />
        </TouchableOpacity>
      </View>

      {/* Chart Container */}
      <View className="mt-8" style={{ height: 400 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={400}
          padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        >
          <VictoryAxis
            tickValues={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            tickFormat={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
            style={{
              axis: { stroke: "#64748b" },
              tickLabels: { fill: "#64748b" }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: "#64748b" },
              tickLabels: { fill: "#64748b" }
            }}
          />
          <VictoryLine
            data={chartData}
            interpolation="natural"
            style={{
              data: { stroke: "#3b82f6", strokeWidth: 3 }
            }}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

export default AnalyticsScreen;