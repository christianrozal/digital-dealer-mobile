// components/ActivitiesFilter.tsx
import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  hideActivitiesFilter,
  toggleInterestedIn,
  toggleInterestStatus,
  resetInterestedIns,
  resetInterestStatuses,
  resetAllFilters,
  setSortBy,
  resetSortBy,
} from "@/store/uiSlice";
import CloseIcon from "./svg/closeIcon";
import ButtonComponent from "./button";
import ChevronDownIcon from "./svg/chevronDown";
import ChevronUpIcon from "./svg/chevronUp";

const ActivitiesFilter = () => {
  const dispatch = useDispatch();
  const { selectedInterestedIns, selectedInterestStatuses, sortBy } =
    useSelector((state: RootState) => state.ui);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

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

  const SORT_OPTIONS = [
    { value: "follow_up_date", label: "Follow Up Date" },
    { value: "last_scanned", label: "Last Scanned" },
  ];

  // Style functions remain the same as before
  const getInterestOptionStyle = (value: string) => {
    const isSelected = selectedInterestedIns.includes(value);
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
    const isSelected = selectedInterestStatuses.includes(value);
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
    const isSelected = selectedInterestedIns.includes(value);
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
    const isSelected = selectedInterestStatuses.includes(value);
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

  return (
    <View className="flex-1 bg-white">
      {/* Sort By Filter */}
      <View className="mt-4 relative z-10">
        {" "}
        {/* Add relative positioning container */}
        <Text className="text-xs text-gray-600 font-medium">Sort By</Text>
        <TouchableOpacity
          className="mt-3 border border-gray-200 rounded-md p-3 flex-row justify-between items-center"
          style={{ backgroundColor: "#FAFAFA" }}
          onPress={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
        >
          <Text
            className={`text-xs ${sortBy ? "text-gray-600" : "text-gray-400"}`}
          >
            {sortBy
              ? SORT_OPTIONS.find((o) => o.value === sortBy)?.label
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
          <View
            className="mt-1 bg-white border border-gray-200  rounded-md"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`rounded-md p-3 flex-row items-center justify-between ${
                  sortBy === option.value ? "bg-blue-50" : "bg-white"
                }`}
                onPress={() => {
                  dispatch(setSortBy(option.value));
                  setIsSortDropdownOpen(false);
                }}
              >
                <Text
                  className={`text-xs ${
                    sortBy === option.value ? "text-color1" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      dispatch(resetSortBy());
                      setIsSortDropdownOpen((prev) => !prev);
                    }}
                  >
                    <CloseIcon width={16} height={16} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
                onPress={() => dispatch(toggleInterestedIn(option.value))}
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
          {selectedInterestedIns.length > 0 && (
            <TouchableOpacity onPress={() => dispatch(resetInterestedIns())}>
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
                onPress={() => dispatch(toggleInterestStatus(option.value))}
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
          {selectedInterestStatuses.length > 0 && (
            <TouchableOpacity onPress={() => dispatch(resetInterestStatuses())}>
              <CloseIcon width={16} height={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row mt-5 gap-3 w-full">
        <ButtonComponent
          label="Reset All"
          var2
          className="flex-1"
          onPress={() => dispatch(resetAllFilters())}
        />
        <ButtonComponent
          label={`Apply Filters (${
            Number(selectedInterestedIns.length > 0) +
            Number(selectedInterestStatuses.length > 0) +
            Number(!!sortBy)
          })`}
          className="flex-1"
          onPress={() => dispatch(hideActivitiesFilter())}
        />
      </View>
    </View>
  );
};

export default ActivitiesFilter;
