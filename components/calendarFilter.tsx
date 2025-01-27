// components/calendarFilter.tsx
import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import ChevronLeft from "@/components/svg/chevronLeft";
import ButtonComponent from "./button";
import ChevronRight from "./svg/chevronRight";

dayjs.extend(isoWeek);

interface CalendarFilterProps {
  onClose: (date?: dayjs.Dayjs) => void;
  initialDate?: dayjs.Dayjs;
}

const CalendarFilter = ({ onClose, initialDate }: CalendarFilterProps) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? initialDate.startOf("month") : dayjs().startOf("month")
  );
  const [selectedDate, setSelectedDate] = useState(initialDate || dayjs());

  const generateCalendar = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const weeks = [];
    let currentDay = startOfMonth.startOf("isoWeek");

    while (currentDay.isBefore(endOfMonth.endOf("isoWeek"))) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push({
          date: currentDay.format("DD"),
          isCurrentMonth: currentDay.month() === currentMonth.month(),
          isoDate: currentDay.toISOString(),
        });
        currentDay = currentDay.add(1, "day");
      }
      weeks.push(week);
    }

    return weeks;
  };

  const calendarWeeks = generateCalendar();

  const handlePreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  return (
    <View className="bg-white flex-1">
      {/* Calendar Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity className="flex-row gap-3 items-center">
          <Text className="text-lg font-bold">
            {currentMonth.format("MMMM YYYY")}
          </Text>
          <ChevronRight width={12} height={12} color="#6b7280" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity onPress={handlePreviousMonth}>
            <ChevronLeft width={14} height={14} color="#3D12FA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth}>
            <ChevronRight width={14} height={14} color="#3D12FA" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Days Header */}
      <View
        className="flex-row justify-between"
        style={{ marginTop: 28, marginBottom: 12 }}
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <Text key={day} className="text-gray-500 text-xs w-8 text-center">
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      {calendarWeeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row justify-between mb-1">
          {week.map((day, dayIndex) => {
            const dayDate = dayjs(day.isoDate);
            const isSelected = selectedDate.isSame(dayDate, "day");

            return (
              <TouchableOpacity
                key={dayIndex}
                onPress={() => setSelectedDate(dayDate)}
                className={`w-8 h-8 items-center justify-center rounded-full ${
                  isSelected ? "bg-color1" : ""
                }`}
                disabled={!day.isCurrentMonth}
              >
                <Text
                  className={`text-xs ${
                    isSelected
                      ? "text-white"
                      : day.isCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-400" // Changed from gray-300 to gray-400
                  }`}
                >
                  {day.date} {/* Always show actual date */}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Calendar Footer */}
      <View className="flex-row gap-3 mt-10">
        <ButtonComponent label="Back" onPress={() => onClose()} var2 />
        <ButtonComponent label="Apply" onPress={() => onClose(selectedDate)} />
      </View>
    </View>
  );
};

export default CalendarFilter;
