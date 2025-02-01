import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import FilterIcon from "@/components/svg/filterIcon";
import { LineChart, PieChart } from "react-native-gifted-charts";

const data = [
  { value: 30 },
  { value: 50 },
  { value: 45 },
  { value: 85 },
  { value: 20 },
  { value: 35 },
  { value: 75 },
  { value: 60 },
  { value: 55 },
  { value: 70 },
];

const data2 = [
  { value: 23, color: '#8396FE' },
  { value: 55, color: '#B3A4F6' },
  { value: 19, color: '#8E72FF' },
  { value: 23, color: '#A0ABFF' },
];

const data3 = [
  { value: 2.3, color: '#8396FE' },
  { value: 5.5, color: '#B3A4F6' },
  { value: 19.2, color: '#8E72FF' },
  { value: 53, color: '#A0ABFF' },
];

const AnalyticsScreen = () => {
  return (
    <ScrollView className="px-5 pt-20 pb-28">
      <View className="flex-row justify-between items-center mt-5">
        <Text className="text-2xl font-semibold">Analytics</Text>
        <TouchableOpacity>
          <FilterIcon />
        </TouchableOpacity>
      </View>
        <View className="text-gray-600 mt-10 font-bold text-sm">#Scans</View>
      <View className="mt-5">
        <LineChart
            data={data}
            color="#3D12FA"
            hideDataPoints={true}
            noOfSections={3}
            stepValue={60}
            maxValue={120}
            spacing={30}
            width={250}
            height={150}
            rulesType="solid"
            rulesColor='#E5E7EB'
            xAxisColor={'#E5E7EB'}
            yAxisColor={'white'}
            yAxisTextStyle={{color: '#4b5563', fontSize: 12}}
            
        />
      </View>


      {/* Lead Status Distribution */}
      <View className="mt-10 items-center">
        <Text className="font-semibold">Lead Status Distribution</Text>
        <View className="mt-10 flex-row items-center gap-10">
          <PieChart 
            data={data2} 
            donut  
            radius={70}  
            innerRadius={57} 
            centerLabelComponent={() => {
              return <View> <Text className="font-bold text-2xl text-color1">150</Text><Text className="font-medium text-gray-500 text-sm text-center">Total</Text> </View>;
            }}
          />
          <View className="gap-3">
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#8396FE] rounded-full"/><Text className="text-xs text-gray-500">Buying <Text className="font-bold text-gray-600">23</Text></Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#B3A4F6] rounded-full"/><Text className="text-xs text-gray-500">Selling <Text className="font-bold text-gray-600">55</Text></Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#8E72FF] rounded-full"/><Text className="text-xs text-gray-500">Financing <Text className="font-bold text-gray-600">19</Text></Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#A0ABFF] rounded-full"/><Text className="text-xs text-gray-500">Purchased <Text className="font-bold text-gray-600">23</Text></Text>
            </View>
          </View>
        </View>
      </View>

      {/* Customer Interest Distribution */}
      <View className="mt-10 items-center">
        <Text className="font-semibold">Customer Interest Distribution</Text>
        <View className="mt-10 flex-row items-center gap-10">
          <PieChart 
            data={data3} 
            donut  
            radius={70}  
            innerRadius={57} 
            centerLabelComponent={() => {
              return <View> <Text className="font-bold text-2xl text-color1">80K</Text><Text className="font-medium text-gray-500 text-sm text-center">Total</Text> </View>;
            }}
          />
          <View className="gap-3">
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#8396FE] rounded-full"/><Text className="text-xs text-gray-500">Cold <Text className="font-bold text-gray-600">2.3K</Text></Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#B3A4F6] rounded-full"/><Text className="text-xs text-gray-500">Warm <Text className="font-bold text-gray-600">5.5K</Text></Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#8E72FF] rounded-full"/><Text className="text-xs text-gray-500">Hot <Text className="font-bold text-gray-600">19.2K</Text></Text>
            </View>
            <View className="flex-row gap-3 items-center">
              <View className="w-3 h-3 bg-[#A0ABFF] rounded-full"/><Text className="text-xs text-gray-500">Bought <Text className="font-bold text-gray-600">53K</Text></Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;