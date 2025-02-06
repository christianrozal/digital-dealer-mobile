import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  hideCustomersFilter,
  toggleCustomersInterestedIn,
  toggleCustomersInterestStatus,
  resetCustomersInterestedIns,
  resetCustomersInterestStatuses,
  resetAllCustomersFilters,
  setCustomersSortBy,
  resetCustomersSortBy,
  setCustomersFromDate,
  setCustomersToDate,
  resetCustomersDateRange,
} from "@/lib/store/uiSlice";
import CloseIcon from "./svg/closeIcon";
import ButtonComponent from "./button";
import ChevronDownIcon from "./svg/chevronDown";
import CalendarFilter from "./calendarFilter";
import Calendar2Icon from "./svg/calendar2";
import Select from "@/components/rnr/select";
import dayjs from "dayjs";

type SortOption = "a_to_z" | "z_to_a" | "scans_low_to_high" | "scans_high_to_low" | "last_scanned_newest_to_oldest" | "last_scanned_oldest_to_newest";

const CustomersFilter = () => {
  const dispatch = useDispatch();
  const {
    customersSelectedInterestedIns,
    customersSelectedInterestStatuses,
    customersSortBy,
    customersFromDate,
    customersToDate,
  } = useSelector((state: RootState) => state.ui);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");

  // Calculate the filter count using useMemo for optimization
  const filterCount = useMemo(() => {
    let count = 0;
    if (customersSelectedInterestedIns.length > 0) {
      count++;
    }
    if (customersSelectedInterestStatuses.length > 0) {
      count++;
    }
    if (customersSortBy) {
      count++;
    }
    if (customersFromDate || customersToDate) {
      count++;
    }
    return count;
  }, [customersSelectedInterestedIns, customersSelectedInterestStatuses, customersSortBy, customersFromDate, customersToDate]);

  // Console logs to check Redux state values
  console.log("CustomersFilter - useSelector values:");
  console.log("customersSelectedInterestedIns:", customersSelectedInterestedIns);
  console.log("customersSelectedInterestStatuses:", customersSelectedInterestStatuses);
  console.log("customersSortBy:", customersSortBy);
  console.log("customersFromDate:", customersFromDate ? dayjs(customersFromDate).format("YYYY-MM-DD") : customersFromDate);
  console.log("customersToDate:", customersToDate ? dayjs(customersToDate).format("YYYY-MM-DD") : customersToDate);

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
    { value: "last_scanned_newest_to_oldest", label: "Latest scans first" },
    { value: "last_scanned_oldest_to_newest", label: "Oldest scans first" },
    { value: "a_to_z", label: "A to Z" },
    { value: "z_to_a", label: "Z to A" },
    { value: "scans_low_to_high", label: "Number of scans (lowest to highest)" },
    { value: "scans_high_to_low", label: "Number of scans (highest to lowest)" }
  ];

  const getInterestOptionStyle = (value: string) => {
    const isSelected = customersSelectedInterestedIns.includes(value);
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
    const isSelected = customersSelectedInterestStatuses.includes(value);
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
    const isSelected = customersSelectedInterestedIns.includes(value);
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
    const isSelected = customersSelectedInterestStatuses.includes(value);
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
                dispatch(setCustomersFromDate(isoDate));
              } else {
                dispatch(setCustomersToDate(isoDate));
              }
            }
            setShowCalendar(false);
          }}
          initialDate={selectingFor === "from" ? (customersFromDate ? dayjs(customersFromDate) : undefined) : (customersToDate ? dayjs(customersToDate) : undefined)}
          fromDate={customersFromDate ? dayjs(customersFromDate) : undefined}
          toDate={customersToDate ? dayjs(customersToDate) : undefined}
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
              dispatch(resetCustomersDateRange());
            }}
          >
            <Text className="text-color1 font-semibold text-sm">Reset</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-5 mt-4">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 font-medium">From</Text>
            <TouchableOpacity
              className="mt-3 border border-gray-200 rounded-md px-3 py-2 flex-row justify-between items-center"
              onPress={() => {
                setSelectingFor("from");
                setShowCalendar(true);
              }}
            >
              <Text className="text-gray-700 font-semibold text-xs">
                {customersFromDate ? dayjs(customersFromDate).format("DD-MM-YYYY") : "Select date"}
              </Text>
              <Calendar2Icon width={20} height={20} />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 font-medium">To</Text>
            <TouchableOpacity
              className="mt-3 border border-gray-200 rounded-md px-3 py-2 flex-row justify-between items-center"
              onPress={() => {
                setSelectingFor("to");
                setShowCalendar(true);
              }}
            >
              <Text className="text-gray-700 font-semibold text-xs">
                {customersToDate ? dayjs(customersToDate).format("DD-MM-YYYY") : "Select date"}
              </Text>
              <Calendar2Icon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort By Filter */}
        <View className="mt-4 relative z-10">
          <Text className="text-xs text-gray-600 font-medium mb-2">Sort By</Text>
          <Select
            placeholder="Select sort option"

            value={customersSortBy ? { id: customersSortBy, label: SORT_OPTIONS.find((o) => o.value === customersSortBy)?.label || "" } : null}
            options={SORT_OPTIONS.map(option => ({ id: option.value, label: option.label }))}
            isOpen={isSortDropdownOpen}
            onPress={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            onSelect={(option) => {
              if (option === null) {
                dispatch(resetCustomersSortBy());
              } else {
                dispatch(setCustomersSortBy(option.id as SortOption));
              }
              setIsSortDropdownOpen(false);
            }}
          />
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
                  onPress={() => dispatch(toggleCustomersInterestedIn(option.value))}
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
            {customersSelectedInterestedIns.length > 0 && (
              <TouchableOpacity onPress={() => dispatch(resetCustomersInterestedIns())}>
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
                  onPress={() => dispatch(toggleCustomersInterestStatus(option.value))}
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
            {customersSelectedInterestStatuses.length > 0 && (
              <TouchableOpacity onPress={() => dispatch(resetCustomersInterestStatuses())}>
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
            onPress={() => dispatch(resetAllCustomersFilters())}
          />
          <ButtonComponent
            label={`Apply Filters (${filterCount})`}
            className="flex-1"
            onPress={() => dispatch(hideCustomersFilter())}
          />
        </View>
      </View>
    </View>
  );
};

export default CustomersFilter;