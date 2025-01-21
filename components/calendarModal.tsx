import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import dayjs from "dayjs";

const CalendarModal = ({
  isVisible,
  onClose,
  onDateSelect,
}: {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState<{
    day: number;
    month: "previous" | "current" | "next";
  } | null>(null);

  const [selectedHour, setSelectedHour] = useState(
    String(selectedDate.hour() % 12 || 12).padStart(2, "0")
  );
  const [selectedMinute, setSelectedMinute] = useState(
    String(selectedDate.minute()).padStart(2, "0")
  );
  const [isAM, setIsAM] = useState(selectedDate.hour() < 12);
  const [isHourDropdownVisible, setIsHourDropdownVisible] = useState(false);
  const [isMinuteDropdownVisible, setIsMinuteDropdownVisible] = useState(false);

  const hourDropdownRef = useRef<View>(null);
  const minuteDropdownRef = useRef<View>(null);
  const modalContentRef = useRef<View>(null);

  const daysInMonth = selectedDate.daysInMonth();
  const firstDayOfMonth = selectedDate.startOf("month");
  const firstDayOfWeek = firstDayOfMonth.day();

  const prevMonth = selectedDate.subtract(1, "month");
  const daysInPrevMonth = prevMonth.daysInMonth();

  const nextMonth = selectedDate.add(1, "month");

  const daysArray: { day: number; month: "previous" | "current" | "next" }[][] =
    [[]];
  let currentWeekIndex = 0;

  // Add previous month's days
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray[currentWeekIndex].push({
      day: daysInPrevMonth - firstDayOfWeek + i + 1,
      month: "previous",
    });
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    if (daysArray[currentWeekIndex].length === 7) {
      daysArray.push([]);
      currentWeekIndex++;
    }
    daysArray[currentWeekIndex].push({ day, month: "current" });
  }

  // Add next month's days
  if (daysArray[daysArray.length - 1].length < 7) {
    for (let i = 1; daysArray[daysArray.length - 1].length < 7; i++) {
      daysArray[daysArray.length - 1].push({ day: i, month: "next" });
    }
  }

  const handlePrevMonth = () => {
    setSelectedDate((prevDate) => prevDate.subtract(1, "month"));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setSelectedDate((prevDate) => prevDate.add(1, "month"));
    setSelectedDay(null);
  };

  const handleDaySelect = (
    day: number,
    month: "previous" | "current" | "next"
  ) => {
    let newDate = selectedDate;

    if (month === "previous") {
      newDate = selectedDate.subtract(1, "month").date(day);
    } else if (month === "next") {
      newDate = selectedDate.add(1, "month").date(day);
    } else {
      newDate = selectedDate.date(day);
    }

    setSelectedDate(newDate);
    setSelectedDay({ day, month });
  };

  const clearSelection = () => {
    setSelectedDay(null);
    setSelectedDate(dayjs());
    setSelectedHour(String(dayjs().hour() % 12 || 12).padStart(2, "0"));
    setSelectedMinute(String(dayjs().minute()).padStart(2, "0"));
    setIsAM(dayjs().hour() < 12);
    onDateSelect(new Date());
    onClose();
  };

  const handleClose = () => {
    if (selectedDay) {
      const hour = parseInt(selectedHour, 10);
      const minute = parseInt(selectedMinute, 10);
      let newDate = selectedDate
        .hour(isAM ? hour % 12 : (hour % 12) + 12)
        .minute(minute);
      onDateSelect(newDate.toDate());
    }
    onClose();
  };

  const toggleAMPM = () => {
    setIsAM(!isAM);
  };

  const getFormattedMonth = () => selectedDate.format("MMM YYYY");

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    setIsHourDropdownVisible(false);
  };

  const toggleHourDropdown = () => {
    setIsHourDropdownVisible(!isHourDropdownVisible);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    setIsMinuteDropdownVisible(false);
  };

  const toggleMinuteDropdown = () => {
    setIsMinuteDropdownVisible(!isMinuteDropdownVisible);
  };

  const renderHourOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );
    return (
      <View
        ref={hourDropdownRef}
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          backgroundColor: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(3px)",
          borderRadius: 5,
          borderColor: "transparent",
          borderWidth: 1,
          zIndex: 10,
        }}
      >
        <ScrollView
          style={{
            maxHeight: 80,
          }}
          showsVerticalScrollIndicator={false}
        >
          {hours.map((hour) => (
            <TouchableOpacity
              key={hour}
              onPress={() => handleHourSelect(hour)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12 }}>{hour}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMinuteOptions = () => {
    const minutes = Array.from({ length: 60 }, (_, i) =>
      String(i).padStart(2, "0")
    );
    return (
      <View
        ref={minuteDropdownRef}
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          backgroundColor: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(3px)",
          borderRadius: 5,
          borderColor: "#e5e7eb",
          zIndex: 10,
        }}
      >
        <ScrollView
          style={{
            maxHeight: 80,
          }}
          showsVerticalScrollIndicator={false}
        >
          {minutes.map((minute) => (
            <TouchableOpacity
              key={minute}
              onPress={() => handleMinuteSelect(minute)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12 }}>{minute}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsHourDropdownVisible(false);
          setIsMinuteDropdownVisible(false);
        }}
      >
        <View className="flex-1 justify-center items-center">
          <View
            ref={modalContentRef}
            className="bg-white rounded-lg p-5"
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              width: "80%",
            }}
          >
            {/* Calendar Section */}
            <View>
              <View className="flex-row items-center">
                <Text className="flex-1 text-lg font-bold">
                  {getFormattedMonth()}
                </Text>
                <View className="flex-row gap-5">
                  <TouchableOpacity onPress={handlePrevMonth}>
                    <Text className="text-gray-500">{"<"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextMonth}>
                    <Text className="text-gray-500">{">"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                className="flex-row"
                style={{ paddingTop: 12, paddingBottom: 8 }}
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <Text
                      key={day}
                      className="flex-1 text-center text-xs text-gray-400"
                    >
                      {day}
                    </Text>
                  )
                )}
              </View>
              <View>
                {daysArray.map((week, weekIndex) => (
                  <View className="flex-row" key={weekIndex}>
                    {week.map(({ day, month }, dayIndex) => (
                      <TouchableOpacity
                        key={dayIndex}
                        disabled={month !== "current"}
                        style={{
                          width: "14.2857%",
                          aspectRatio: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        className={`rounded-full ${
                          selectedDay?.day === day &&
                          selectedDay.month === month
                            ? "bg-color1"
                            : ""
                        } ${month !== "current" ? "opacity-50" : ""}`}
                        onPress={() => handleDaySelect(day, month)}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color:
                              selectedDay?.day === day &&
                              selectedDay.month === month
                                ? "white"
                                : month === "current"
                                ? "black"
                                : "gray",
                          }}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Time Selection Section */}
            <View
              className="mt-3 flex-row items-center"
              style={{ gap: 12, zIndex: 10 }}
            >
              <Text className="text-xs">Select Time</Text>
              <View
                className="flex-row items-center border rounded-md flex-1"
                style={{ borderColor: "#e5e7eb" }}
              >
                {/* Hour */}
                <View className="items-center py-1 pl-2">
                  <TouchableOpacity onPress={toggleHourDropdown}>
                    <Text
                      style={{
                        fontSize: 12,
                        textAlign: "center",
                        width: 25,
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {selectedHour}
                    </Text>
                  </TouchableOpacity>
                  {isHourDropdownVisible && renderHourOptions()}
                </View>
                {/* Colon */}
                <Text className="text-xs">:</Text>
                {/* Minute */}
                <View className="items-center py-1 pl-2">
                  <TouchableOpacity onPress={toggleMinuteDropdown}>
                    <Text
                      style={{
                        fontSize: 12,
                        textAlign: "center",
                        width: 25,
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {selectedMinute}
                    </Text>
                  </TouchableOpacity>
                  {isMinuteDropdownVisible && renderMinuteOptions()}
                </View>
                {/* AM/PM Toggle */}
                <View className="items-center py-1">
                  <TouchableOpacity onPress={toggleAMPM}>
                    <Text className="text-xs">{isAM ? "AM" : "PM"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex flex-row mt-5" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={clearSelection}
                className="flex-1 py-2 bg-color3 rounded-full"
              >
                <Text className="text-center text-xs text-color1 font-semibold">
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 py-2 bg-color1 rounded-full"
              >
                <Text className="text-center text-xs text-white font-semibold">
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CalendarModal;
