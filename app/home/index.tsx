import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Modal, RefreshControl } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
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
import { router } from "expo-router";
import { setCurrentScanId, setCurrentCustomerId } from '@/lib/store/currentSlice';
import ActivitiesFilter from "@/components/activitiesFilter";
import { databases, databaseId, usersId, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import { setUserData } from "@/lib/store/userSlice";
import ButtonComponent from "@/components/button";

interface DealershipLevel2 {
  $id: string;
  name: string;
  slug?: string;
}

interface DealershipLevel3 {
  $id: string;
  name: string;
  slug?: string;
  dealershipLevel2: DealershipLevel2;
}

interface Scan {
  $id: string;
  $createdAt: string;
  users: string | { $id: string; name?: string; profileImage?: string; [key: string]: any };
  user?: {
      $id: string;
      name: string;
      profileImage?: string;
      [key: string]: any;
  };
  customers?: {
      $id: string;
      name?: string;
      phone?: string;
      email?: string;
      profileImage?: string;
      interestStatus?: string;
      interestedIn?: string;
  };
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
  scanCount?: number;
  dealershipLevel2?: { $id: string };
  dealershipLevel3?: { $id: string };
}

interface UserData {
  $id: string;
  name?: string;
  dealershipLevel1?: {
    $id: string;
    name: string;
  }[];
  dealershipLevel2?: DealershipLevel2[];
  dealershipLevel3?: DealershipLevel3[];
  scans?: Scan[];
}

const HomeScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const userData = useSelector((state: RootState) => state.user.data) as UserData;
  const currentDealershipLevel2Id = useSelector((state: RootState) => state.current.currentDealershipLevel2Id);
  const currentDealershipLevel3Id = useSelector((state: RootState) => state.current.currentDealershipLevel3Id);
  const {
    isActivitiesFilterVisible,
    activitiesSelectedInterestedIns,
    activitiesSelectedInterestStatuses,
    activitiesSortBy,
    activitiesFromDate,
    activitiesToDate,
  } = useSelector((state: RootState) => state.ui);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
    if (!name) return "CU";
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[1] || "";
    
    if (!firstName) return "CU";
    
    if (lastName) {
      return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
    }
    
    return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
  };

  const today = dayjs().format("dddd, D MMMM");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const session = await account.get();
      const response = await databases.listDocuments(
        databaseId,
        usersId,
        [Query.equal('email', session.email)]
      );

      if (response.documents.length > 0) {
        const freshUserData = response.documents[0] as UserData;
        
        if (currentDealershipLevel3Id) {
          // If rooftop is selected, filter by rooftop
          const filteredScans = freshUserData.scans?.filter((scan: Scan) => 
            scan.dealershipLevel3?.$id === currentDealershipLevel3Id
          ) || [];
          dispatch(setUserData({ ...freshUserData, scans: filteredScans }));
        } else if (currentDealershipLevel2Id) {
          // If only dealership is selected, filter by dealership and its rooftops
          const dealership = freshUserData.dealershipLevel2?.find((d: DealershipLevel2) => d.$id === currentDealershipLevel2Id);
          if (dealership) {
            const rooftops = freshUserData.dealershipLevel3?.filter(
              (rooftop: DealershipLevel3) => rooftop.dealershipLevel2.$id === dealership.$id
            ) || [];
            const filteredScans = freshUserData.scans?.filter((scan: Scan) => 
              scan.dealershipLevel2?.$id === currentDealershipLevel2Id ||
              rooftops.some((rooftop: DealershipLevel3) => scan.dealershipLevel3?.$id === rooftop.$id)
            ) || [];
            dispatch(setUserData({ ...freshUserData, scans: filteredScans }));
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, currentDealershipLevel2Id, currentDealershipLevel3Id]);

  const getFormattedDateRange = () => {
    if (activitiesFromDate && dayjs(activitiesFromDate).isValid() && activitiesToDate && dayjs(activitiesToDate).isValid()) {
      return `${dayjs(activitiesFromDate).format("DD MMM")} - ${dayjs(activitiesToDate).format("DD MMM YYYY")}`;
    } else if (activitiesFromDate && dayjs(activitiesFromDate).isValid()) {
      return dayjs(activitiesFromDate).format("DD MMM");
    } else if (activitiesToDate && dayjs(activitiesToDate).isValid()) {
      return dayjs(activitiesToDate).format("DD MMM YYYY");
    } else {
      return new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const totalActivities = filteredScans.length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        className="flex-1 bg-white px-5 pt-16"
        ref={scrollViewRef}
        style={{marginBottom: 80}}
        contentInset={{ top: 80 }}
        contentOffset={{ x: 0, y: -80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3D12FA"]}
            tintColor="#3D12FA"
            progressViewOffset={40}
          />
        }
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-5 min-h-10">
          <Text className="text-2xl font-semibold">Activities</Text>
          <View className="flex-row gap-1 items-center">
            <TouchableOpacity
              onPress={() => dispatch(showActivitiesFilter())}
              className="relative"
            >
              <FilterIcon showCircle={hasActiveFilters ? true : false} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View className={`mt-4 flex-row items-center rounded-md border ${isFocused ? 'border-color1' : 'border-gray-200'}`}>
          <View className="px-3">
            <SearchIcon width={24} height={24} stroke={isFocused ? "#3D12FA" : "black"} />
          </View>
          <TextInput
            ref={inputRef}
            className="flex-1 py-2 text-sm"
            placeholder="Search scans..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity className="px-3" onPress={() => setSearchQuery("")}>
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Today's Summary */}
        <View className="flex-row justify-between rounded-md bg-color3 p-3 mt-5">
          <Text className="text-xs font-bold">
            {(activitiesFromDate && dayjs(activitiesFromDate).isValid()) || (activitiesToDate && dayjs(activitiesToDate).isValid()) ? "Date Range" : "Today"}{" "}
            <Text className="font-normal">{getFormattedDateRange()}</Text>
          </Text>
          <Text className="text-xs font-bold">
            <Text className="font-normal">Total:</Text> {totalActivities}
          </Text>
        </View>

        

        {/* Empty State */}
        {filteredScans.length === 0 ? (
          <View className="mt-5 items-center">
            <Text className="text-gray-500">No scans found</Text>
          </View>
        ) : (
          <View className="gap-4 mt-5">
            {filteredScans.map((scan) => (
              <TouchableOpacity 
                key={scan.$id} 
                className="bg-white rounded-lg border border-gray-200"
                onPress={() => {
                  // Find the latest scan for this customer
                  const customerScans = scans.filter(s => s.customers?.$id === scan.customers?.$id);
                  const latestScan = customerScans.reduce<Scan | null>((latest, current) => {
                    if (!latest) return current;
                    return new Date(current.$createdAt) > new Date(latest.$createdAt) ? current : latest;
                  }, null);

                  console.log('Selected from Home Screen:', {
                    scan: {
                      id: latestScan?.$id || scan.$id,
                      createdAt: latestScan?.$createdAt || scan.$createdAt,
                      interestStatus: latestScan?.interestStatus || scan.interestStatus,
                      interestedIn: latestScan?.interestedIn || scan.interestedIn
                    },
                    customer: {
                      id: scan.customers?.$id,
                      data: scan.customers
                    }
                  });

                  dispatch(setCurrentScanId(latestScan?.$id || scan.$id));
                  dispatch(setCurrentCustomerId(scan.customers?.$id || null));
                  
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
                            {getInitials(scan.customers?.name || '')}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text className="font-bold text-sm">
                          {scan.customers?.name || "Unknown Customer"}
                        </Text>
                      </View>
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
        <View className="mb-40">
          <ButtonComponent label="Test" onPress={() => router.push("/test")} />
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;