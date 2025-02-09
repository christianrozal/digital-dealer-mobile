import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import ButtonComponent from "@/components/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import BackArrowIcon from "@/components/svg/backArrow";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ChevronDownIcon from "@/components/svg/chevronDown";
import { databases, databaseId, notificationsId, scansId } from "@/lib/appwrite";
import { ID } from "appwrite";
import { updateUserScan } from "@/lib/store/userSlice";
import { updateScan } from "@/lib/store/scanSlice";

// Define interfaces at the top of the file
interface User {
  $id: string;
  name: string;
  profileImage?: string;
  [key: string]: any;
}

const CustomerAssignmentScreen = () => {
  // Hooks at the top-level of the component
  const userData = useSelector((state: RootState) => state.user.data);
  const scanData = useSelector((state: RootState) => state.scan);
  const dealershipUsers = useSelector((state: RootState) => state.dealershipUsers.data);
  const currentScanId = useSelector((state: RootState) => state.current.currentScanId);
  const currentUserId = useSelector((state: RootState) => state.current.currentUserId);

  const [selectedName, setSelectedName] = useState<string | null>(
    userData?.name || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const dispatch = useDispatch();

  // Find the current scan and its customer data from userData
  const currentScan = userData?.scans?.find(scan => scan.$id === currentScanId);
  const customer = currentScan?.customers || null;

  const getInitials = (name: string) => {
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

  const renderNameOptions = () => {
    // Always show all users in the dropdown
    return dealershipUsers.map((user) => (
      <TouchableOpacity
        key={user.$id}
        className={`px-5 py-3 bg-white ${selectedName === user.name ? 'bg-gray-100' : ''}`}
        onPress={() => handleNameSelection(user.name)}
      >
        <View className="flex-row items-center gap-2">
          {user.profileImage && user.profileImage !== 'black' ? (
            <Image
              source={{ uri: user.profileImage }}
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
          ) : (
            <View
              className="bg-color1 rounded-full flex items-center justify-center"
              style={{ width: 24, height: 24 }}
            >
              <Text className="text-white text-[10px] font-bold">
                {getInitials(user.name)}
              </Text>
            </View>
          )}
          <Text className={`text-sm ${selectedName === user.name ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
            {user.name}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const handleAssign = async () => {
    try {
      setIsAssigning(true);
      if (!selectedName || !customer) {
        console.error("No name selected or no customer data");
        return;
      }

      // Find the selected user's full data from dealershipUsers
      const selectedUser = dealershipUsers.find(user => user.name === selectedName);
      if (!selectedUser) {
        console.error("Selected user not found in users list");
        return;
      }

      // Now that currentScanId is defined at the top level, we can use it here safely.
      if (!currentScanId) {
        Alert.alert('Error', 'No scan ID found');
        return;
      }

      // Update scan document in Appwrite
      await databases.updateDocument(
        databaseId,
        scansId,
        currentScanId,
        {
          users: selectedUser.$id
        }
      );

      // Update User scans in userSlice
      dispatch(updateUserScan({
        id: currentScanId,
        data: {
          users: selectedUser.$id,
        }
      }));
      console.log("Updated user scan userSlice:", currentScanId);

      // Update scans in scanSlice
      dispatch(updateScan({
        id: currentScanId,
        data: {
          users: selectedUser.$id,
        }
      }))
      console.log("Updated scan scanSlice:", currentScanId);

      try {
        // Create notification only if this is a reassignment to a different consultant
        const previousScan = userData?.scans?.find(scan => scan.$id !== currentScanId); // Get the second most recent scan (if it exists)
        const previousUserId = typeof previousScan?.users === 'string' ? previousScan.users : previousScan?.users?.$id;
        
        // Only create notification if there was a previous user and it's different from the current selection
        if (previousUserId && previousUserId !== selectedUser.$id) {
          const customerId = currentUserId;
          console.log("Attempting to create notification:", {
            previousUserId,
            selectedUserId: selectedUser.$id,
            customerId
          });

          await databases.createDocument(
            databaseId,
            notificationsId,
            ID.unique(),
            {
              type: 'reassignment',
              read: false,
              users: previousUserId,
              customers: [customerId]
            }
          );
        }
      } catch (error) {
        console.error("Error creating notification:", error);
      }

      router.push("/home/customers/customer-log");
    } catch (error) {
      console.error("Error assigning customer:", error);
      Alert.alert('Error', 'Failed to assign customer. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const renderPriorUsers = () => {
    if (!dealershipUsers || dealershipUsers.length === 0) {
      return null;
    }
  
    const currentUserId = userData?.$id;
  
    // Extract unique consultant IDs from scanData (using the `users` field)
    const priorUserIds = [
      ...new Set(
        scanData?.data?.length
          ? scanData.data
              .map(scan =>
                typeof scan.users === "string" ? scan.users : scan.users?.$id
              )
              .filter(userId => userId && userId !== currentUserId)
          : []
      ),
    ];
  
    // Map IDs to full user objects and filter out any undefined values
    const priorUsers = priorUserIds
      .map((userId) => dealershipUsers.find((u) => u.$id === userId))
      .filter((user): user is User => Boolean(user));
  
    if (priorUsers.length === 0) {
      return null;
    }
  
    // Join the names of the prior consultants, comma separated
    const priorUserNames = priorUsers.map((user) => user.name).join(", ");
  
    return (
      <View className="mt-4">
        <Text className="text-gray-500 text-[10px] mb-2">Prior Consultants</Text>
        <View>
          <Text className="text-sm text-gray-700">{priorUserNames}</Text>
        </View>
      </View>
    );
  };
  

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNameSelection = (name: string) => {
    setSelectedName(name);
    setIsDropdownOpen(false);
  };

  return (
    <View className="pt-7 px-7 pb-7 h-screen justify-between gap-5">
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.push("/home/customers")}>
            <BackArrowIcon />
          </TouchableOpacity>
          {/* Logo */}
          <TouchableOpacity onPress={() => { router.push("/home") }}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View style={{ width: 18 }} />
        </View>
        <View className="mt-12">
          <Text className="text-2xl font-semibold">Customer Assignment</Text>
          <Text className="text-xs text-gray-400 mt-3">
            The below customer will be assigned to you. In case the customer was
            assigned to anyone else, we will send the notification to align
            everyone.
          </Text>
        </View>
        
        {/* Customer Info */}
        <View className="bg-color8 rounded-md px-5 py-7 mt-5 flex-row gap-5">
          {customer ? (
            <View>
              {customer.profileImage && customer.profileImage !== 'black' ? (
                <Image
                  source={{ uri: customer.profileImage }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              ) : (
                <View
                  className="bg-color1 rounded-full flex items-center justify-center"
                  style={{ width: 64, height: 64 }}
                >
                  <Text className="text-white font-bold" style={{ fontSize: 20 }}>
                    {getInitials(customer.name || '')}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View
              className="bg-color1 rounded-full flex items-center justify-center"
              style={{ width: 64, height: 64 }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 20 }}>
                Cu
              </Text>
            </View>
          )}
          <View className="gap-1">
            <Text className="text-white text-[10px]">
              Customer Name: <Text className="font-bold">{customer?.name || "N/A"}</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Contact Number: <Text className="font-bold">{customer?.phone || "N/A"}</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Email: <Text className="font-bold">{customer?.email || "N/A"}</Text>
            </Text>
          </View>
        </View>

        {/* Prior Consultants */}
        <View className="mt-6">
          {renderPriorUsers()}
        </View>

        {/* Name Select */}
        <View className="mt-5 relative z-10 w-full">
          <Text className="text-[10px] text-gray-500">Your Name</Text>
          <TouchableOpacity
            className="rounded-md bg-color3 px-5 py-3 mt-1 flex-row items-center justify-between"
            onPress={toggleDropdown}
          >
            <View className="flex-row items-center gap-2">
              {selectedName && (
                <>
                  {dealershipUsers.find(u => u.name === selectedName)?.profileImage && 
                   dealershipUsers.find(u => u.name === selectedName)?.profileImage !== 'black' ? (
                    <Image
                      source={{ uri: dealershipUsers.find(u => u.name === selectedName)?.profileImage }}
                      style={{ width: 24, height: 24, borderRadius: 12 }}
                    />
                  ) : (
                    <View
                      className="bg-color1 rounded-full flex items-center justify-center"
                      style={{ width: 24, height: 24 }}
                    >
                      <Text className="text-white text-[10px] font-bold">
                        {getInitials(selectedName)}
                      </Text>
                    </View>
                  )}
                </>
              )}
              <Text
                className={`text-sm ${selectedName ? "text-gray-600" : "text-gray-400"}`}
              >
                {selectedName || "Select a name"}
              </Text>
            </View>
            <View
              className="transition-transform duration-300"
              style={{
                transform: [{ rotate: isDropdownOpen ? "180deg" : "0deg" }],
              }}
            >
              <ChevronDownIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
          {isDropdownOpen && (
            <ScrollView
              className="mt-1 bg-white border border-gray-200 rounded-md"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 112,
              }}
            >
              {renderNameOptions()}
            </ScrollView>
          )}
        </View>

        <View className='mt-7'>
          <ButtonComponent
            label={isAssigning ? "Assigning..." : "Apply"}
            onPress={handleAssign}
            disabled={isAssigning || !selectedName}
            loading={isAssigning}
          />
        </View>
      </View>
    </View>
  );
};

export default CustomerAssignmentScreen;
