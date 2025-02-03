import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  setAnalyticsFromDate,
  setAnalyticsToDate,
  resetAnalyticsDateRange,
  resetAllAnalyticsFilters,
} from "@/lib/store/uiSlice";
import CloseIcon from "./svg/closeIcon";
import ButtonComponent from "./button";
import CalendarFilter from "./calendarFilter";
import Calendar2Icon from "./svg/calendar2";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

interface AnalyticsFilterProps {
  onClose: () => void;
}

interface QuickFilterButton {
  label: string;
  getDateRange: () => { from: string; to: string };
}

const AnalyticsFilter = ({ onClose }: AnalyticsFilterProps) => {
  const dispatch = useDispatch();
  const { analyticsFromDate, analyticsToDate } = useSelector((state: RootState) => state.ui);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");

  const quickFilters: QuickFilterButton[] = [
    {
      label: "Last 7 Days",
      getDateRange: () => ({
        from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
      })
    },
    {
      label: "Last 30 Days",
      getDateRange: () => ({
        from: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
      })
    },
    {
      label: "This Week",
      getDateRange: () => ({
        from: dayjs().startOf('week').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
      })
    },
    {
      label: "This Month",
      getDateRange: () => ({
        from: dayjs().startOf('month').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
      })
    },
    {
      label: "Last Month",
      getDateRange: () => ({
        from: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        to: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      })
    },
    {
      label: "This Year",
      getDateRange: () => ({
        from: dayjs().startOf('year').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
      })
    }
  ];

  const handleQuickFilter = (filter: QuickFilterButton) => {
    try {
      const { from, to } = filter.getDateRange();
      dispatch(setAnalyticsFromDate(from));
      dispatch(setAnalyticsToDate(to));
    } catch (error) {
      console.error('Error applying quick filter:', error);
    }
  };

  const isFilterSelected = (filter: QuickFilterButton) => {
    if (!analyticsFromDate || !analyticsToDate) return false;
    const { from, to } = filter.getDateRange();
    const selectedFrom = dayjs(analyticsFromDate);
    const selectedTo = dayjs(analyticsToDate);
    const filterFrom = dayjs(from);
    const filterTo = dayjs(to);
    
    return selectedFrom.isSame(filterFrom, 'day') && selectedTo.isSame(filterTo, 'day');
  };

  // Calculate the filter count using useMemo for optimization
  const filterCount = useMemo(() => {
    let count = 0;
    if (analyticsFromDate || analyticsToDate) {
      count++;
    }
    return count;
  }, [analyticsFromDate, analyticsToDate]);

  return showCalendar ? (
    // Calendar Screen
    <View className="flex-1 bg-white">
      <View className="h-full">
        <CalendarFilter
          onClose={(date) => {
            if (date) {
              const isoDate = date.toISOString();
              if (selectingFor === "from") {
                dispatch(setAnalyticsFromDate(isoDate));
              } else {
                dispatch(setAnalyticsToDate(isoDate));
              }
            }
            setShowCalendar(false);
          }}
          initialDate={selectingFor === "from" ? (analyticsFromDate ? dayjs(analyticsFromDate) : undefined) : (analyticsToDate ? dayjs(analyticsToDate) : undefined)}
          fromDate={analyticsFromDate ? dayjs(analyticsFromDate) : undefined}
          toDate={analyticsToDate ? dayjs(analyticsToDate) : undefined}
          selectingFor={selectingFor}
        />
      </View>
    </View>
  ) : (
    // Filter Screen
    <View className="bg-white">
      <View className="h-full gap-3 justify-between">
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-semibold">Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Quick Filters */}
          <View className="mt-5">
            <Text className="text-sm font-semibold">Quick Filters</Text>
            <View className="flex-row mt-4" style={{ gap: 8, flexWrap: 'wrap' }}>
              {quickFilters.map((filter, index) => {
                const isSelected = isFilterSelected(filter);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickFilter(filter)}
                    style={{ width: '31%', marginBottom: 8 }}
                    className={`border rounded-full p-2 items-center justify-center ${
                      isSelected ? 'bg-color1 border-color1' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'} text-center`}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Custom Date Range */}
          <View>
            <View className="flex-row gap-2 justify-between mt-8">
              <Text className="text-sm font-semibold">Custom Date Range</Text>
              <TouchableOpacity
                onPress={() => {
                  dispatch(resetAnalyticsDateRange());
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
                  <Text className={`font-semibold text-xs ${analyticsFromDate ? 'text-color1' : 'text-gray-400'}`}>
                    {analyticsFromDate ? dayjs(analyticsFromDate).format("DD-MM-YYYY") : "Select date"}
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
                  <Text className={`font-semibold text-xs ${analyticsToDate ? 'text-color1' : 'text-gray-400'}`}>
                    {analyticsToDate ? dayjs(analyticsToDate).format("DD-MM-YYYY") : "Select date"}
                  </Text>
                  <Calendar2Icon width={20} height={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 w-full mt-5">
          <ButtonComponent
            label="Reset All"
            var2
            className="flex-1"
            onPress={() => {
              dispatch(resetAllAnalyticsFilters());
              onClose();
            }}
          />
          <ButtonComponent
            label={`Apply Filters (${filterCount})`}
            className="flex-1"
            onPress={onClose}
          />
        </View>
      </View>
    </View>
  );
};

export default AnalyticsFilter;