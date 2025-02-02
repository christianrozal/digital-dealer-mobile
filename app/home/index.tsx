import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Modal } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import dayjs from "dayjs";
import SearchIcon from "@/components/svg/searchIcon";
import CloseIcon from "@/components/svg/closeIcon";
import FilterIcon from "@/components/svg/filterIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import EmailIcon from "@/components/svg/emailIcon";
import CalendarIcon from "@/components/svg/calendar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { showActivitiesFilter, hideActivitiesFilter } from "@/lib/store/uiSlice";
import { setSelectedCustomer } from "@/lib/store/customerSlice";
import { router } from "expo-router";
import { setCurrentScan, setCurrentCustomer } from '@/lib/store/currentSlice';
import ActivitiesFilter from "@/components/activitiesFilter";

interface Scan {
  $id: string;
  $createdAt: string;
  customers?: any;
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
  scanCount?: number;
}

interface UserData {
  $id: string;
  scans?: Scan[];
}

const HomeScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const userData = useSelector((state: RootState) => state.user.data) as UserData;
  const {
    isActivitiesFilterVisible,
    activitiesSelectedInterestedIns,
    activitiesSelectedInterestStatuses,
    activitiesSortBy,
    activitiesFromDate,
    activitiesToDate,
  } = useSelector((state: RootState) => state.ui);

  const scans = userData?.scans || [];

  // Helper function to check if date is today
  const isToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isSearching]);

  const filteredScans = scans
    ?.filter((scan) => {
      const scanDate = dayjs(scan.$createdAt || '');
      const hasDateFilter = (activitiesFromDate && dayjs(activitiesFromDate).isValid()) || (activitiesToDate && dayjs(activitiesToDate).isValid());

      // Date range filtering
      if (hasDateFilter) {
        if (activitiesFromDate && scanDate.isBefore(dayjs(activitiesFromDate), 'day')) return false;
        if (activitiesToDate && scanDate.isAfter(dayjs(activitiesToDate), 'day')) return false;
      } else {
        // Default to today's scans if no date filter is applied
        if (!scan.$createdAt || !isToday(scan.$createdAt)) return false;
      }

      // Search query filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          scan.customers?.name?.toLowerCase(),
          scan.customers?.phone?.toLowerCase(),
          scan.customers?.email?.toLowerCase(),
          scan.interestStatus?.toLowerCase(),
          scan.interestedIn?.toLowerCase(),
        ];
        if (!searchFields.some((field) => field?.includes(query))) {
          return false;
        }
      }

      // Interest filters
      if (
        activitiesSelectedInterestedIns.length > 0 &&
        !activitiesSelectedInterestedIns.includes(scan.interestedIn || '')
      ) {
        return false;
      }

      if (
        activitiesSelectedInterestStatuses.length > 0 &&
        !activitiesSelectedInterestStatuses.includes(scan.interestStatus || '')
      ) {
        return false;
      }

      return true;
    })
    // Sorting the filtered scans
    .sort((a, b) => {
      if (!activitiesSortBy) {
        const safeDate = (date: string | null | undefined): number => {
          return date ? new Date(date).getTime() : 0;
        };
        return safeDate(b.$createdAt) - safeDate(a.$createdAt);
      }

      // Helper function to handle null or undefined values for sorting dates
      const safeDate = (date: string | null | undefined): number => {
        return date ? new Date(date).getTime() : 0;
      };

      switch (activitiesSortBy) {
        case "a_to_z":
          return (a.customers?.name || '').localeCompare(b.customers?.name || '');
        case "z_to_a":
          return (b.customers?.name || '').localeCompare(a.customers?.name || '');
        case "scans_low_to_high":
          return (a.scanCount || 0) - (b.scanCount || 0);
        case "scans_high_to_low":
          return (b.scanCount || 0) - (a.scanCount || 0);
        case "last_scanned_newest_to_oldest":
          return safeDate(b.$createdAt) - safeDate(a.$createdAt);
        case "last_scanned_oldest_to_newest":
          return safeDate(a.$createdAt) - safeDate(b.$createdAt);
        default:
          return 0;
      }
    }) || [];

  const hasActiveFilters = 
    activitiesSelectedInterestedIns.length > 0 ||
    activitiesSelectedInterestStatuses.length > 0 ||
    !!activitiesSortBy || 
    (activitiesFromDate && dayjs(activitiesFromDate).isValid()) || 
    (activitiesToDate && dayjs(activitiesToDate).isValid());

  const formatDate = (dateString: string | undefined, isLastScanned: boolean = false): string => {
    if (!dateString) return "No date";
    const date = dayjs(dateString);

    if (isLastScanned) {
      return date.format("D MMM YYYY, h:mm A");
    }

    return date.format("ddd, MMM D");
  };

  const getInitials = (name: string): string => {
    if (!name) return "Cu";
    const firstName = name.split(" ")[0];
    const cleaned = firstName.replace(/[^a-zA-Z]/g, "");
    return (cleaned.slice(0, 2) || "Cu")
      .split("")
      .map((c, i) => (i === 1 ? c.toLowerCase() : c.toUpperCase()))
      .join("");
  };

  const today = dayjs().format("dddd, D MMMM");

  return (
    <ScrollView className="flex-1 text-xs bg-white px-5 pt-20 pb-20" ref={scrollViewRef}>
      {/* Header Section */}
      <View className="flex-row justify-between items-center mt-5 min-h-10">
        <Text className="text-2xl font-semibold">Activities</Text>

        <View className="flex-row gap-1 items-center">
          {isSearching && (
            <TextInput
              ref={inputRef}
              className="focus:outline-color1 border border-color1 text-xs px-3 py-2 rounded-md"
              style={{ width: 128 }}
              placeholder="Search customers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
          )}
          <TouchableOpacity
            onPress={() => {
              if (isSearching) setSearchQuery("");
              setIsSearching(!isSearching);
            }}
          >
            {isSearching ? (
              <CloseIcon width={28} height={28} />
            ) : (
              <SearchIcon width={28} height={28} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch(showActivitiesFilter())}
            className="relative"
          >
            <FilterIcon showCircle={hasActiveFilters ? true : false} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-3">
        <Text className="text-xs text-gray-500">
          Below shows the list of scans done today.
        </Text>
      </View>

      {/* Today's Summary */}
      <View className="flex-row justify-between rounded-md bg-color3 p-3 mt-5">
        <Text className="text-xs font-bold">
          {(activitiesFromDate && dayjs(activitiesFromDate).isValid()) || (activitiesToDate && dayjs(activitiesToDate).isValid()) ? "Date Range" : "Today"}{" "}
          <Text className="text-[10px] font-normal">
            {(activitiesFromDate && dayjs(activitiesFromDate).isValid()) || (activitiesToDate && dayjs(activitiesToDate).isValid()) ? (
              <Text>
                ({activitiesFromDate && dayjs(activitiesFromDate).isValid() ? dayjs(activitiesFromDate).format("DD MMM") : ""}
                {activitiesToDate && dayjs(activitiesToDate).isValid() ? ` - ${dayjs(activitiesToDate).format("DD MMM YYYY")}` : ""})
              </Text>
            ) : (
              `(${new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })})`
            )}
          </Text>
        </Text>
        <Text className="text-[10px]">
          #scans:{" "}
          <Text className="text-xs font-bold">
            {filteredScans?.length || 0}
          </Text>
        </Text>
      </View>

      {/* Empty State */}
      {filteredScans.length === 0 ? (
        <View className="mt-5 items-center">
          <Text className="text-gray-500">No scans found for today</Text>
        </View>
      ) : (
        <View className="space-y-4 mt-5">
          {filteredScans.map((scan) => (
            <TouchableOpacity 
              key={scan.$id} 
              className="bg-white rounded-lg border border-gray-200"
              onPress={() => {
                const customerForActivity = {
                  ...scan.customers,
                  lastScanned: scan.$createdAt,
                  scanCount: 1,
                  interestStatus: scan.interestStatus,
                  interestedIn: scan.interestedIn
                };

                console.log('Selected from Home Screen:', {
                  scan: {
                    id: scan.$id,
                    createdAt: scan.$createdAt,
                    interestStatus: scan.interestStatus,
                    interestedIn: scan.interestedIn
                  },
                  customer: {
                    id: scan.customers?.$id,
                    data: scan.customers
                  }
                });

                dispatch(setSelectedCustomer(customerForActivity));
                dispatch(setCurrentScan(scan.$id));
                dispatch(setCurrentCustomer(scan.customers?.$id));
                
                router.push("/home/customers/customer-details");
              }}
            >
              <View className="p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row gap-2 items-center">
                    <View className="size-7 bg-color1 rounded-full flex items-center justify-center">
                      {scan.customers?.profileImage ? (
                        <Image
                          source={{ uri: scan.customers.profileImage }}
                          style={{ width: 28, height: 28, borderRadius: 14 }}
                        />
                      ) : (
                        <Text className="text-white font-bold text-xs">
                          {getInitials(scan.customers?.name)}
                        </Text>
                      )}
                    </View>
                    <Text className="font-bold text-sm">
                      {scan.customers?.name || "Unknown Customer"}
                    </Text>
                  </View>
                  <View className="flex-row gap-1">
                    <Text
                      className={`rounded-full text-[10px] border font-medium px-2 py-0.5 ${
                        scan.interestStatus === "Hot"
                          ? "border-red-400 bg-red-100 text-red-600"
                          : scan.interestStatus === "Warm"
                          ? "border-orange-400 bg-orange-100 text-orange-600"
                          : scan.interestStatus === "Cold"
                          ? "border-gray-400 bg-gray-100 text-gray-600"
                          : "border-violet-400 bg-violet-100 text-violet-600"
                      }`}
                    >
                      {scan.interestStatus}
                    </Text>
                    <Text
                      className={`rounded-full text-[10px] border font-medium px-2 py-0.5 ${
                        scan.interestedIn === "Buying"
                          ? "border-green-400 bg-green-100 text-green-600"
                          : scan.interestedIn === "Selling"
                          ? "border-blue-400 bg-blue-100 text-blue-600"
                          : scan.interestedIn === "Financing"
                          ? "border-pink-400 bg-pink-100 text-pink-600"
                          : scan.interestedIn === "Bought"
                          ? "border-violet-400 bg-violet-100 text-violet-600"
                          : "border-gray-400 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {scan.interestedIn}
                    </Text>
                  </View>
                </View>

                <View className="mt-3">
                  <View className="flex-row items-center gap-1.5">
                    <PhoneIcon width={15} height={15} />
                    <Text className="text-[10px] text-gray-500">
                      {scan.customers?.phone || "No phone number"}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-2 gap-2">
                    <EmailIcon width={15} height={15} />
                    <Text className="text-[10px] text-gray-500">
                      {scan.customers?.email || "No email"}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="py-2 flex-row gap-3 justify-between border-t border-gray-200 px-4 bg-color3">
                <View className="flex-row gap-2 items-center">
                  <Text className="font-bold text-gray-500 text-[10px]">
                    Follow Up:
                  </Text>
                  <View className="flex-row gap-1 items-center bg-color11 rounded py-0.5 px-1.5">
                    <CalendarIcon width={15} height={15} stroke="white" />
                    <Text className="text-[10px] text-white">
                      {formatDate(scan.followUpDate)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-[10px] font-bold">
                    Last Scanned:{" "}
                    <Text className="font-normal">
                      {formatDate(scan.$createdAt, true)}
                    </Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isActivitiesFilterVisible}
        onRequestClose={() => dispatch(hideActivitiesFilter())}
      >
        <View className="flex-1 justify-end bg-transparent">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => dispatch(hideActivitiesFilter())}
          >
            <View className="flex-1" />
          </TouchableOpacity>
          <View className="bg-white rounded-t-3xl" style={{ padding:28, height: "70%" }}>
            <ActivitiesFilter />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;