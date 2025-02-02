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
import SearchIcon from "@/components/svg/searchIcon";
import FilterIcon from "@/components/svg/filterIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import CloseIcon from "@/components/svg/closeIcon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import dayjs from "dayjs";
import CustomersFilter from "@/components/customersFilter";
import { hideCustomersFilter, showCustomersFilter } from "@/lib/store/uiSlice";
import { router } from "expo-router";
import { setSelectedCustomer } from "@/lib/store/customerSlice";
import { setCurrentScan, setCurrentCustomer } from "@/lib/store/currentSlice";
import { useFocusEffect } from "@react-navigation/native";
import AddIcon from "@/components/svg/addIcon";

interface AppwriteCustomer {
  $id: string;
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  profileImageId?: string;
  lastScanned?: string;
  lastScanId?: string;
  scanCount?: number;
  interestStatus?: string;
  interestedIn?: string;
}

interface Scan {
  $id: string;
  $createdAt: string;
  customers: AppwriteCustomer;
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
  scanCount?: number;
}

const CustomersScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );
  
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.data);
  const loading = useSelector((state: RootState) => state.user.loading);
  
  const {
    isCustomersFilterVisible,
    customersSelectedInterestedIns,
    customersSelectedInterestStatuses,
    customersSortBy,
    customersFromDate,
    customersToDate,
  } = useSelector((state: RootState) => state.ui);

  const [groupedCustomers, setGroupedCustomers] = useState<{
    [key: string]: AppwriteCustomer[];
  }>({});
  const [flatCustomers, setFlatCustomers] = useState<AppwriteCustomer[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<AppwriteCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const hasActiveFilters =
    customersSelectedInterestedIns.length > 0 ||
    customersSelectedInterestStatuses.length > 0 ||
    !!customersSortBy || 
    (customersFromDate && dayjs(customersFromDate).isValid()) || 
    (customersToDate && dayjs(customersToDate).isValid());

  useEffect(() => {
    if (userData?.scans) {
      // Sort scans by creation date in ascending order (oldest first)
      const sortedScans = [...userData.scans].sort((a, b) =>
        dayjs(a.$createdAt || '').unix() - dayjs(b.$createdAt || '').unix()
      );

      const uniqueCustomers = new Set<string>();
      const customersMap = new Map<string, AppwriteCustomer>();

      // Process scans in chronological order
      sortedScans.forEach((scan) => {
        const customer = scan.customers as AppwriteCustomer;
        if (customer && !uniqueCustomers.has(customer.$id)) {
          uniqueCustomers.add(customer.$id);
          customersMap.set(customer.$id, {
            ...customer,
            lastScanned: scan.$createdAt || '',
            lastScanId: scan.$id,
            scanCount: 1,
            interestStatus: scan.interestStatus,
            interestedIn: scan.interestedIn,
          });
        } else if (customer) {
          const existing = customersMap.get(customer.$id);
          if (existing) {
            const currentScanDate = scan.$createdAt || '';
            const existingLastScanned = existing.lastScanned || '';

            // Determine if current scan is newer
            const isNewerScan = dayjs(currentScanDate).isAfter(existingLastScanned);

            // Update interest status only if current scan is newer
            customersMap.set(customer.$id, {
              ...existing,
              scanCount: (existing.scanCount || 0) + 1,
              lastScanned: isNewerScan ? currentScanDate : existingLastScanned,
              lastScanId: isNewerScan ? scan.$id : existing.lastScanId,
              interestStatus: isNewerScan ? scan.interestStatus : existing.interestStatus,
              interestedIn: isNewerScan ? scan.interestedIn : existing.interestedIn,
            });
          }
        }
      });

      // Convert map to array and filter based on search query
      let customersArray = Array.from(customersMap.values());

      // Date range filtering
      if ((customersFromDate && dayjs(customersFromDate).isValid()) || (customersToDate && dayjs(customersToDate).isValid())) {
        customersArray = customersArray.filter(customer => {
          const lastScannedDate = dayjs(customer.lastScanned);
          if (customersFromDate && dayjs(customersFromDate).isValid() && lastScannedDate.isBefore(dayjs(customersFromDate), 'day')) return false;
          if (customersToDate && dayjs(customersToDate).isValid() && lastScannedDate.isAfter(dayjs(customersToDate), 'day')) return false;
          return true;
        });
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        customersArray = customersArray.filter(customer => {
          const searchFields = [
            customer.name?.toLowerCase(),
            customer.phone?.toLowerCase(),
            customer.email?.toLowerCase(),
            customer.interestStatus?.toLowerCase(),
            customer.interestedIn?.toLowerCase(),
          ];
          return searchFields.some(field => field?.includes(query));
        });
      }
      customersArray = customersArray.filter(customer => {
        let include = true;
        if (
          customersSelectedInterestedIns.length > 0 &&
          (!customer.interestedIn || !customersSelectedInterestedIns.includes(customer.interestedIn))
        ) {
          include = false;
        }

        if (
          customersSelectedInterestStatuses.length > 0 &&
          (!customer.interestStatus || !customersSelectedInterestStatuses.includes(customer.interestStatus))
        ) {
          include = false;
        }
        return include;
      });
      const sortedCustomers = [...customersArray].sort((a, b) => {
        if (!customersSortBy) return 0;
        const safeDate = (date: string | null | undefined): number => {
          return date ? dayjs(date).valueOf() : 0;
        };

        switch (customersSortBy) {
          case "a_to_z": return (a.name || '').localeCompare(b.name || '');
          case "z_to_a": return (b.name || '').localeCompare(a.name || '');
          case "scans_low_to_high": return (a.scanCount || 0) - (b.scanCount || 0);
          case "scans_high_to_low": return (b.scanCount || 0) - (a.scanCount || 0);
          case "last_scanned_newest_to_oldest": return safeDate(b.lastScanned) - safeDate(a.lastScanned);
          case "last_scanned_oldest_to_newest": return safeDate(a.lastScanned) - safeDate(b.lastScanned);
          default: return 0;
        }
      });

      setFlatCustomers(sortedCustomers);

      if(!customersSortBy){
        // Group customers by first letter of name
        const grouped = customersArray.reduce((acc, customer) => {
          const firstLetter = customer.name?.[0]?.toUpperCase() || '#';
          if (!acc[firstLetter]) acc[firstLetter] = [];
          acc[firstLetter].push(customer);
          return acc;
        }, {} as { [key: string]: AppwriteCustomer[] });

        // Sort only the GROUP KEYS, not the items within groups
        const sortedGroups = Object.keys(grouped)
          .sort()
          .reduce((acc, key) => {
            acc[key] = grouped[key]; // ✅ Keep original order
            return acc;
          }, {} as { [key: string]: AppwriteCustomer[] });

        setGroupedCustomers(sortedGroups);
      }
      else{
        setGroupedCustomers({});
      }

      setTotalCustomers(customersArray.length);

      // Get recent customers (last 3 scanned)
      const sortedRecent = customersArray
        .sort((a, b) => dayjs(b.lastScanned).unix() - dayjs(a.lastScanned).unix())
        .slice(0, 3);
      setRecentCustomers(sortedRecent);
    }
  }, [userData, searchQuery, customersSelectedInterestedIns, customersSelectedInterestStatuses, customersSortBy, customersFromDate, customersToDate]);

  useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isSearching]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No date";
    return dayjs(dateString).format("D MMM YYYY h:mm A");
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "Cu";
    const firstName = name.split(" ")[0];
    const cleaned = firstName.replace(/[^a-zA-Z]/g, "");
    return (cleaned.slice(0, 2) || "Cu")
      .split("")
      .map((c, i) => (i === 1 ? c.toLowerCase() : c.toUpperCase()))
      .join("");
  };

  const getFormattedDateRange = () => {
    if (customersFromDate && customersToDate && dayjs(customersFromDate).isValid() && dayjs(customersToDate).isValid()) {
      return `(${dayjs(customersFromDate).format("DD MMM")} - ${dayjs(customersToDate).format("DD MMM")})`;
    }

    if (customersFromDate && dayjs(customersFromDate).isValid()) {
      return `(${dayjs(customersFromDate).format("DD MMM")})`;
    }
    if (customersToDate && dayjs(customersToDate).isValid()) {
      return `(${dayjs(customersToDate).format("DD MMM")})`;
    }

    return "";
  }

  if (loading) {
    return (
      <View className="h-screen z-10 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3D12FA" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Add Icon */}
      <TouchableOpacity 
        className="absolute bottom-20 right-5 z-10" 
        onPress={() => router.push("/home/customers/add")}
      >
        <AddIcon />
      </TouchableOpacity>

      <ScrollView 
        className="flex-1 bg-white px-5"
        ref={scrollViewRef}
        contentContainerStyle={{ 
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-5 min-h-10">
          <Text className="text-2xl font-semibold">My Customers</Text>
          <View className="flex-row gap-1 items-center">
            {isSearching && (
              <TextInput
                ref={inputRef}
                className="border border-color1 text-xs px-3 py-0 rounded-md w-32"
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
              onPress={() => dispatch(showCustomersFilter())}
              className="relative"
            >
              <FilterIcon showCircle={hasActiveFilters ? true : false} />
            </TouchableOpacity>
          </View>
        </View>

        {!hasActiveFilters && (
          <View>
            {/* Recent Customers Section */}
            <View className="mt-5">
              <View className="bg-color3 rounded-md p-3">
                <Text className="text-xs font-bold">Recent</Text>
              </View>
              {recentCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.$id}
                  className="p-3 mt-2 rounded-md flex-row justify-between items-center bg-white"
                  onPress={() => {
                    const customerForActivity = {
                      ...customer,
                      lastScanned: customer.lastScanned,
                      scanCount: customer.scanCount,
                      interestStatus: customer.interestStatus,
                      interestedIn: customer.interestedIn
                    };

                    dispatch(setSelectedCustomer(customerForActivity));
                    dispatch(setCurrentScan(customer.lastScanId || null));
                    dispatch(setCurrentCustomer(customer.$id));
                    
                    router.push("/home/customers/customer-details");
                  }}
                >
                  <View className="items-center flex-row gap-3">
                    <View className="w-9 h-9 bg-color1 rounded-full items-center justify-center">
                      {customer?.profileImage ? (
                        <Image
                          source={{ uri: customer.profileImage }}
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        <Text className="text-white font-bold text-xs">
                          {getInitials(customer.name)}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text className="font-bold text-sm">{customer.name}</Text>
                      <View className="flex-row gap-1 items-center mt-1">
                        <PhoneIcon width={14} height={14} />
                        <Text className="text-gray-500 text-xs">
                          {customer.phone || "No phone number"}
                        </Text>
                      </View>
                      <Text className="text-[10px] font-semibold text-gray-400">
                        Last scanned:{" "}
                        <Text className="font-normal">
                          {formatDate(customer.lastScanned)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <View className="gap-2">
                    <Text className="text-[10px] text-gray-500">
                      #scans: {customer.scanCount}
                    </Text>
                    <View className="flex-row gap-2">
                      <Text
                        className={`rounded-full text-[10px] border font-semibold px-2 py-0.5 ${
                          customer.interestStatus === "Hot"
                            ? "border-red-400 bg-red-100 text-red-600"
                            : customer.interestStatus === "Warm"
                              ? "border-orange-400 bg-orange-100 text-orange-600"
                              : "border-gray-400 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {customer.interestStatus}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Contacts Section */}
        <View className="mt-5">
          <View className="bg-color3 rounded-md p-3 flex-row justify-between">
            <Text className="text-xs font-bold">
              Contacts <Text className="font-normal">{getFormattedDateRange()}</Text>
            </Text>
            <Text className="text-xs font-bold">
              <Text className="font-normal">Total:</Text> {totalCustomers}
            </Text>
          </View>

          {/* Render sorted or grouped customers */}
          {customersSortBy ? (
            flatCustomers.map((customer) => (
              <CustomerCard 
                key={customer.$id} 
                customer={customer} 
                getInitials={getInitials}
                formatDate={formatDate}
              />
            ))
          ) : (
            Object.keys(groupedCustomers).map((letter) => (
              <View key={letter}>
                <View className="px-3 mt-3">
                  <Text className="font-bold text-lg">{letter}</Text>
                </View>
                {groupedCustomers[letter].map((customer) => (
                  <CustomerCard 
                    key={customer.$id} 
                    customer={customer} 
                    getInitials={getInitials}
                    formatDate={formatDate}
                  />
                ))}
              </View>
            ))
          )}
        </View>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isCustomersFilterVisible}
          onRequestClose={() => dispatch(hideCustomersFilter())}
        >
          <View className="flex-1 justify-end bg-transparent">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => dispatch(hideCustomersFilter())}
            >
              <View className="flex-1" />
            </TouchableOpacity>
            <View className=" bg-white rounded-t-3xl" style={{ height: "70%", padding: 28 }}>
              <CustomersFilter />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

// Helper component for customer card to reduce repetition
const CustomerCard = ({ 
  customer, 
  getInitials, 
  formatDate 
}: { 
  customer: AppwriteCustomer; 
  getInitials: (name: string | undefined) => string;
  formatDate: (date: string | undefined) => string;
}) => {
  const dispatch = useDispatch();
  
  return (
    <TouchableOpacity
      className="p-3 mt-2 rounded-md flex-row justify-between items-center bg-white"
      onPress={() => {
        const customerForActivity = {
          ...customer,
          lastScanned: customer.lastScanned,
          scanCount: customer.scanCount,
          interestStatus: customer.interestStatus,
          interestedIn: customer.interestedIn
        };

        dispatch(setSelectedCustomer(customerForActivity));
        dispatch(setCurrentScan(customer.lastScanId || null));
        dispatch(setCurrentCustomer(customer.$id));
        
        router.push("/home/customers/customer-details");
      }}
    >
      <View className="items-center flex-row gap-3">
        <View className="w-9 h-9 bg-color1 rounded-full items-center justify-center">
          {customer?.profileImage ? (
            <Image
              source={{ uri: customer.profileImage }}
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <Text className="text-white font-bold text-xs">
              {getInitials(customer.name)}
            </Text>
          )}
        </View>
        <View>
          <Text className="font-bold text-sm">{customer.name}</Text>
          <View className="flex-row gap-1 items-center mt-1">
            <PhoneIcon width={14} height={14} />
            <Text className="text-gray-500 text-xs">
              {customer.phone || "No phone number"}
            </Text>
          </View>
          <Text className="text-[10px] font-semibold text-gray-400">
            Last scanned:{" "}
            <Text className="font-normal">
              {formatDate(customer.lastScanned)}
            </Text>
          </Text>
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-[10px] text-gray-500">
          #scans: {customer.scanCount}
        </Text>
        <View className="flex-row gap-2">
          <Text
            className={`rounded-full text-[10px] border font-semibold px-2 py-0.5 ${
              customer.interestStatus === "Hot"
                ? "border-red-400 bg-red-100 text-red-600"
                : customer.interestStatus === "Warm"
                  ? "border-orange-400 bg-orange-100 text-orange-600"
                  : "border-gray-400 bg-gray-100 text-gray-600"
            }`}
          >
            {customer.interestStatus}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomersScreen;