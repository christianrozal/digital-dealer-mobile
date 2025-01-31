import CalendarIcon from "@/components/svg/calendar";
import EmailIcon from "@/components/svg/emailIcon";
import FilterIcon from "@/components/svg/filterIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import SearchIcon from "@/components/svg/searchIcon";
import CloseIcon from "@/components/svg/closeIcon";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image
} from "react-native";
import { Client, Account, Databases, Query } from "react-native-appwrite";
import { useDispatch, useSelector } from "react-redux";
import { setConsultant, setError, setLoading } from "@/store/consultantSlice";
import ActivitiesFilter from "@/components/activitiesFilter";
import { RootState } from "@/store/store";
import {
  hideActivitiesFilter,
  showActivitiesFilter,
} from "@/store/uiSlice";
import dayjs from "dayjs";
import { useFocusEffect } from "@react-navigation/native";
import { setSelectedCustomer } from "@/store/customerSlice"; // Changed import


const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const account = new Account(client);
const databases = new Databases(client);

const HomeScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
    useFocusEffect(
      useCallback(() => {
        // Reset scroll position when the screen comes into focus
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, [])
    );
  const inputRef = useRef<TextInput>(null);
  const dispatch = useDispatch();
  const {
    isActivitiesFilterVisible,
    activitiesSelectedInterestedIns,
    activitiesSelectedInterestStatuses,
    activitiesSortBy,
    activitiesFromDate,
    activitiesToDate,
  } = useSelector((state: RootState) => state.ui);
  const {
    data: consultantData,
    status,
    error,
  } = useSelector((state: RootState) => state.consultant);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Helper function to check if date is today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    if (consultantData) {
      console.log("Consultant Data:", JSON.stringify(consultantData, null, 2));
    }
  }, [consultantData]);

  useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isSearching]);

  useEffect(() => {
    const checkCurrentSessionAndFetchData = async () => {
      try {
        dispatch(setLoading());
        const user = await account.get();

        const response = await databases.listDocuments(
          "67871d61002bf7e6bc9e",
          "6787235d000989f46de3",
          [Query.equal("email", user.email)]
        );

        if (!response.documents.length) {
          await account.deleteSession("current");
          router.replace("/login");
          return;
        }

        dispatch(setConsultant(response.documents[0]));
      } catch (error) {
        if (error instanceof Error) {
            dispatch(setError(error.message));
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            dispatch(setError(String(error.message)));
        } else {
             dispatch(setError(String(error)));
        }
        try {
          await account.deleteSession("current");
        } finally {
          router.replace("/login");
        }
      }
    };

    checkCurrentSessionAndFetchData();
  }, [dispatch]);

  const formatDate = (
    dateString: string,
    isLastScanned: boolean = false
  ): string => {
    if (!dateString) return "No date";
    const date = new Date(dateString);

    if (isLastScanned) {
      return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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

    const filteredScans = consultantData?.scans
        ?.filter((scan: any) => {
        const scanDate = dayjs(scan.$createdAt);
        const hasDateFilter = activitiesFromDate?.isValid() || activitiesToDate?.isValid();

        // Date range filtering
        if (hasDateFilter) {
            if (activitiesFromDate?.isValid() && scanDate.isBefore(activitiesFromDate, 'day')) return false;
            if (activitiesToDate?.isValid() && scanDate.isAfter(activitiesToDate, 'day')) return false;
        } else {
            // Default to today's scans if no date filter is applied
            if (!isToday(scan.$createdAt)) return false;
        }

            // Rest of the filter conditions...
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchFields = [
                    scan.customers?.name?.toLowerCase(),
                    scan.customers?.phone?.toLowerCase(),
                    scan.customers?.email?.toLowerCase(),
                    scan.interest_status?.toLowerCase(),
                    scan.interested_in?.toLowerCase(),
                ];
                if (!searchFields.some((field) => field?.includes(query))) {
                    return false;
                }
            }
            if (
                activitiesSelectedInterestedIns.length > 0 &&
                !activitiesSelectedInterestedIns.includes(scan.interested_in)
            ) {
                return false;
            }

            if (
                activitiesSelectedInterestStatuses.length > 0 &&
                !activitiesSelectedInterestStatuses.includes(scan.interest_status)
            ) {
                return false;
            }

            return true;
        })
        // Sorting the filtered scans
        .sort((a: any, b: any) => {
             if (!activitiesSortBy) {
                const safeDate = (date: string | null | undefined): number => {
                    return date ? new Date(date).getTime() : 0;
                };
                return safeDate(b.$createdAt) - safeDate(a.$createdAt)
            };

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
                    return a.scan_count - b.scan_count;
                case "scans_high_to_low":
                    return b.scan_count - a.scan_count;
                case "last_scanned_newest_to_oldest":
                    return safeDate(b.$createdAt) - safeDate(a.$createdAt);
                case "last_scanned_oldest_to_newest":
                    return safeDate(a.$createdAt) - safeDate(b.$createdAt);
                default:
                    return 0;
            }
        });

  const hasActiveFilters =
    activitiesSelectedInterestedIns.length > 0 ||
    activitiesSelectedInterestStatuses.length > 0 ||
    !!activitiesSortBy || activitiesFromDate?.isValid() || activitiesToDate?.isValid();


  if (status === "loading") {
    return (
      <View className="h-screen z-10 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3D12FA" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 text-xs bg-white px-5 pt-20 pb-20" ref={scrollViewRef}>
      {/* Header Section */}
      <View className="flex-row justify-between items-center mt-5 min-h-10">
        <Text className="text-2xl font-semibold">Activities</Text>

        <View className="flex-row gap-1 items-center">
          {isSearching && (
            <TextInput
              ref={inputRef}
              className="focus:outline-color1 border-2 border-color1 text-xs px-3 py-2 rounded-md"
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
              {activitiesFromDate && activitiesFromDate.isValid() || activitiesToDate && activitiesToDate.isValid() ? "Date Range" : "Today"}{" "}
            <Text className="text-[10px] font-normal">
                {activitiesFromDate && activitiesFromDate.isValid() || activitiesToDate && activitiesToDate.isValid() ? (
                    <>
                    ({activitiesFromDate && activitiesFromDate.isValid() ? activitiesFromDate.format("DD MMM") : ""}
                        {activitiesToDate && activitiesToDate.isValid() ? ` - ${activitiesToDate.format("DD MMM YYYY")}` : ""})
                    </>
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

      {/* Scans List */}
      {filteredScans?.length === 0 ? (
        <View className="mt-5 items-center">
          <Text className="text-gray-500">No scans found for today</Text>
        </View>
      ) : (
        filteredScans?.map((scan: any, index: number) => (
          <TouchableOpacity key={index} className="mt-7" onPress={() => {
             // Construct a new customer object with the combined data
              const customerForActivity = {
                 ...scan.customers,
                lastScanned: scan.$createdAt,
                scanCount: 1,
                interestStatus: scan.interest_status,
                interestedIn: scan.interested_in
              };
             dispatch(setSelectedCustomer(customerForActivity)); // Dispatch the new object
              console.log("Customer selected from Activity:", customerForActivity);
            router.push("/home/customers/customer-details");
           }}>
            {/* Customer Card */}
            <View className="p-3 rounded-t-md bg-white border-t border-x border-gray-200">
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-2 items-center">
                    <View className="size-7 bg-color1 rounded-full flex items-center justify-center">
                          {scan.customers?.['profile-icon'] ? (
                            <Image
                                source={{ uri: scan.customers['profile-icon'] }}
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

                <View className="flex-row gap-2 items-center">
                  <View className="flex-row gap-1">
                    <Text
                      className={`rounded-full text-[10px] border font-medium px-2 py-0.5 ${
                        scan.interest_status === "Hot"
                          ? "border-red-400 bg-red-100 text-red-600"
                          : scan.interest_status === "Warm"
                          ? "border-orange-400 bg-orange-100 text-orange-600"
                          : scan.interest_status === "Cold"
                          ? "border-gray-400 bg-gray-100 text-gray-600"
                           : "border-violet-400 bg-violet-100 text-violet-600"
                      }`}
                    >
                      {scan.interest_status}
                    </Text>

                    <Text
                      className={`rounded-full text-[10px] border font-medium px-2 py-0.5 ${
                        scan.interested_in === "Buying"
                          ? "border-green-400 bg-green-100 text-green-600"
                          : scan.interested_in === "Selling"
                          ? "border-blue-400 bg-blue-100 text-blue-600"
                          : scan.interested_in === "Financing"
                          ? "border-pink-400 bg-pink-100 text-pink-600"
                           : scan.interested_in === "Bought"
                           ? "border-violet-400 bg-violet-100 text-violet-600"
                          : "border-gray-400 bg-gray-100 text-gray-600"
                      }`}
                    >
                      {scan.interested_in}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contact Info */}
              <View className="flex-row items-center mt-3 gap-1.5">
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

            {/* Follow-up Section */}
            <View className="py-2 flex-row gap-3 justify-between border border-gray-200 rounded-b-md px-3 bg-color3 flex-wrap">
              <View className="flex-row gap-2 items-center">
                <Text className="font-bold text-gray-500 text-[10px]">
                  Follow Up:
                </Text>
                <View className="flex-row gap-1 items-center bg-color11 rounded py-0.5 px-1.5">
                  <CalendarIcon width={15} height={15} stroke="white" />
                  <Text className="text-[10px] text-white">
                    {formatDate(scan.follow_up_date)}
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
        ))
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
          <View className="h-2/3 bg-white rounded-t-3xl p-5">
            <ActivitiesFilter />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;