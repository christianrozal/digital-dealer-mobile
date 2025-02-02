import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  hideActivitiesFilter,
  toggleActivitiesInterestedIn,
  toggleActivitiesInterestStatus,
  resetActivitiesInterestedIns,
  resetActivitiesInterestStatuses,
  resetAllActivitiesFilters,
  setActivitiesSortBy,
  resetActivitiesSortBy,
  setActivitiesFromDate,
  setActivitiesToDate,
  resetActivitiesDateRange,
} from "@/lib/store/uiSlice";
import CloseIcon from "./svg/closeIcon";
import ButtonComponent from "./button";
import ChevronDownIcon from "./svg/chevronDown";
import CalendarFilter from "./calendarFilter";
import Calendar2Icon from "./svg/calendar2";
import dayjs from "dayjs";

type SortOption = "a_to_z" | "z_to_a" | "scans_low_to_high" | "scans_high_to_low" | "last_scanned_newest_to_oldest" | "last_scanned_oldest_to_newest";

const ActivitiesFilter = () => {
  const dispatch = useDispatch();
  const {
    activitiesSelectedInterestedIns,
    activitiesSelectedInterestStatuses,
    activitiesSortBy,
    activitiesFromDate,
    activitiesToDate,
  } = useSelector((state: RootState) => state.ui);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");

    // Calculate the filter count using useMemo for optimization
    const filterCount = useMemo(() => {
      let count = 0;
      if (activitiesSelectedInterestedIns.length > 0) {
        count++;
      }
      if (activitiesSelectedInterestStatuses.length > 0) {
        count++;
      }
      if (activitiesSortBy) {
        count++;
      }
      if (activitiesFromDate || activitiesToDate) {
        count++;
      }
      return count;
    }, [activitiesSelectedInterestedIns, activitiesSelectedInterestStatuses, activitiesSortBy, activitiesFromDate, activitiesToDate]);


  // Console logs to check Redux state values
  console.log("ActivitiesFilter - useSelector values:");
  console.log("activitiesSelectedInterestedIns:", activitiesSelectedInterestedIns);
  console.log("activitiesSelectedInterestStatuses:", activitiesSelectedInterestStatuses);
  console.log("activitiesSortBy:", activitiesSortBy);
  console.log("activitiesFromDate:", activitiesFromDate ? dayjs(activitiesFromDate).format("YYYY-MM-DD") : activitiesFromDate);
  console.log("activitiesToDate:", activitiesToDate ? dayjs(activitiesToDate).format("YYYY-MM-DD") : activitiesToDate);


  const INTEREST_OPTIONS = [
    { value: "Buying", label: "Buying" },
    { value: "Selling", label: "Selling" },
    { value: "Financing", label: "Financing" },
    { value: "Bought", label: "Bought" },
  ];

  const INTEREST_STATUS_OPTIONS = [
    { value: "Hot", label: "Hot" },
    { value: "Warm", label: "Warm" },
    { value: "Cold", label: "Cold" },
    { value: "Purchased", label: "Purchased" },
  ];

    const SORT_OPTIONS: { value: SortOption; label: string }[] = [
        { value: "a_to_z", label: "A to Z" },
        { value: "z_to_a", label: "Z to A" },
        { value: "scans_low_to_high", label: "Number of scans (lowest to highest)" },
        { value: "scans_high_to_low", label: "Number of scans (highest to lowest)" },
        { value: "last_scanned_newest_to_oldest", label: "Last scanned date (newest to oldest)" },
        { value: "last_scanned_oldest_to_newest", label: "Last scanned date (oldest to newest)" },
    ];


  const getInterestOptionStyle = (value: string) => {
    const isSelected = activitiesSelectedInterestedIns.includes(value);
    switch (value) {
      case "Buying":
        return isSelected ? "border-green-400 bg-green-100" : "border-gray-200";
      case "Selling":
        return isSelected ? "border-blue-400 bg-blue-100" : "border-gray-200";
      case "Financing":
        return isSelected ? "border-pink-400 bg-pink-100" : "border-gray-200";
      case "Bought":
        return isSelected
          ? "border-violet-400 bg-violet-100"
          : "border-gray-200";
      default:
        return "border-gray-200";
    }
  };

  const getStatusOptionStyle = (value: string) => {
    const isSelected = activitiesSelectedInterestStatuses.includes(value);
    switch (value) {
      case "Hot":
        return isSelected ? "border-red-400 bg-red-100" : "border-gray-200";
      case "Warm":
        return isSelected
          ? "border-orange-400 bg-orange-100"
          : "border-gray-200";
      case "Cold":
        return isSelected ? "border-gray-400 bg-gray-100" : "border-gray-200";
      case "Purchased":
        return isSelected
          ? "border-violet-400 bg-violet-100"
          : "border-gray-200";
      default:
        return "border-gray-200";
    }
  };

  const getInterestTextStyle = (value: string) => {
    const isSelected = activitiesSelectedInterestedIns.includes(value);
    switch (value) {
      case "Buying":
        return isSelected ? "text-green-600" : "text-gray-400";
      case "Selling":
        return isSelected ? "text-blue-600" : "text-gray-400";
      case "Financing":
        return isSelected ? "text-pink-600" : "text-gray-400";
      case "Bought":
        return isSelected ? "text-violet-600" : "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusTextStyle = (value: string) => {
    const isSelected = activitiesSelectedInterestStatuses.includes(value);
    switch (value) {
      case "Hot":
        return isSelected ? "text-red-600" : "text-gray-400";
      case "Warm":
        return isSelected ? "text-orange-600" : "text-gray-400";
      case "Cold":
        return isSelected ? "text-gray-600" : "text-gray-400";
      case "Purchased":
        return isSelected ? "text-violet-600" : "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return showCalendar ? (
    // Calendar Screen
    <View className="flex-1 bg-white">
      <View className="h-full">
        <CalendarFilter
          onClose={(date) => {
            if (date) {
              const isoDate = date.toISOString();
              if (selectingFor === "from") {
                dispatch(setActivitiesFromDate(isoDate));
              } else {
                dispatch(setActivitiesToDate(isoDate));
              }
            }
            setShowCalendar(false);
          }}
          initialDate={selectingFor === "from" ? (activitiesFromDate ? dayjs(activitiesFromDate) : undefined) : (activitiesToDate ? dayjs(activitiesToDate) : undefined)}
          fromDate={activitiesFromDate ? dayjs(activitiesFromDate) : undefined}
          toDate={activitiesToDate ? dayjs(activitiesToDate) : undefined}
          selectingFor={selectingFor}
        />
      </View>
    </View>
  ) : (
    // Filter Screen
    <View className="bg-white">
      <View className="h-full gap-3 justify-between">
      <View>
      {/* Created On Filter */}
      <View>
        <View className="flex-row gap-2 justify-between">
          <Text className="text-sm font-semibold">Created On</Text>
          <TouchableOpacity
            onPress={() => {
              dispatch(resetActivitiesDateRange());
            }}
          >
            <Text className="text-color1 font-semibold text-sm">Reset</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-5 mt-4">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 font-medium">From</Text>
            <TouchableOpacity
              className="mt-3 border border-gray-200 rounded-md p-3 flex-row justify-between items-center"
              style={{ backgroundColor: "#FAFAFA" }}
              onPress={() => {
                setSelectingFor("from");
                setShowCalendar(true);
              }}
            >
              <Text className="text-gray-700 font-semibold text-xs">
                {activitiesFromDate ? dayjs(activitiesFromDate).format("DD-MM-YYYY") : "Select date"}
              </Text>
              <Calendar2Icon width={20} height={20} />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 font-medium">To</Text>
            <TouchableOpacity
              className="mt-3 border border-gray-200 rounded-md p-3 flex-row justify-between items-center"
              style={{ backgroundColor: "#FAFAFA" }}
              onPress={() => {
                setSelectingFor("to");
                setShowCalendar(true);
              }}
            >
              <Text className="text-gray-700 font-semibold text-xs">
                {activitiesToDate ? dayjs(activitiesToDate).format("DD-MM-YYYY") : "Select date"}
              </Text>
              <Calendar2Icon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort By Filter */}
        <View className="mt-4 relative z-10">
          <Text className="text-xs text-gray-600 font-medium">Sort By</Text>
          <TouchableOpacity
            className="mt-3 border border-gray-200 rounded-md p-3 flex-row justify-between items-center"
            style={{ backgroundColor: "#FAFAFA" }}
            onPress={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          >
            <Text
              className={`text-xs ${activitiesSortBy ? "text-gray-600" : "text-gray-400"}`}
            >
               {activitiesSortBy
                ? SORT_OPTIONS.find((o) => o.value === activitiesSortBy)?.label
                : "Select sort option"}
            </Text>

            <View
              className="transition-transform duration-300"
              style={{
                transform: [{ rotate: isSortDropdownOpen ? "180deg" : "0deg" }],
              }}
            >
              <ChevronDownIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
          {isSortDropdownOpen && (
            <ScrollView
              className="mt-1 bg-white border border-gray-200  rounded-md"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                height: 112,
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`rounded-md p-3 flex-row items-center justify-between ${
                    activitiesSortBy === option.value ? "bg-blue-50" : "bg-white"
                  }`}
                  onPress={() => {
                    dispatch(setActivitiesSortBy(option.value));
                    setIsSortDropdownOpen(false);
                  }}
                >
                  <Text
                    className={`text-xs ${
                      activitiesSortBy === option.value ? "text-color1" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {activitiesSortBy === option.value && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        dispatch(resetActivitiesSortBy());
                        setIsSortDropdownOpen((prev) => !prev);
                      }}
                    >
                      <CloseIcon width={16} height={16} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Interested In Filter */}
        <View className="mt-4">
          <Text className="text-xs text-gray-600 font-medium">Interested In</Text>
          <View
            className="flex-row justify-between gap-2 items-center"
            style={{ paddingRight: 12 }}
          >
            <View className="flex-row flex-wrap gap-2 mt-3">
              {INTEREST_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => dispatch(toggleActivitiesInterestedIn(option.value))}
                  className={`rounded-full border px-3 ${getInterestOptionStyle(
                    option.value
                  )}`}
                  style={{ paddingVertical: 6 }}
                >
                  <Text
                    className={`text-xs font-normal ${getInterestTextStyle(
                      option.value
                    )}`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {activitiesSelectedInterestedIns.length > 0 && (
              <TouchableOpacity onPress={() => dispatch(resetActivitiesInterestedIns())}>
                <CloseIcon width={16} height={16} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Interest Status Filter */}
        <View className="mt-4">
          <Text className="text-xs text-gray-600 font-medium">
            Interest Status
          </Text>
          <View
            className="flex-row justify-between gap-2 items-center"
            style={{ paddingRight: 12 }}
          >
            <View className="flex-row flex-wrap gap-2 mt-3">
              {INTEREST_STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => dispatch(toggleActivitiesInterestStatus(option.value))}
                  className={`rounded-full border px-3 ${getStatusOptionStyle(
                    option.value
                  )}`}
                  style={{ paddingVertical: 6 }}
                >
                  <Text
                    className={`text-xs font-normal ${getStatusTextStyle(
                      option.value
                    )}`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {activitiesSelectedInterestStatuses.length > 0 && (
              <TouchableOpacity onPress={() => dispatch(resetActivitiesInterestStatuses())}>
                <CloseIcon width={16} height={16} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        </View>

        
      </View>
      {/* Action Buttons */}
      <View className="flex-row gap-3 w-full">
          <ButtonComponent
            label="Reset All"
            var2
            className="flex-1"
            onPress={() => dispatch(resetAllActivitiesFilters())}
          />
          <ButtonComponent
            label={`Apply Filters (${filterCount})`}
            className="flex-1"
            onPress={() => dispatch(hideActivitiesFilter())}
          />
        </View>
      </View>
    </View>
  );
};

export default ActivitiesFilter;