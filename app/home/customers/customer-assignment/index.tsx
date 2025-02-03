import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import ButtonComponent from "@/components/button";
import { useSelector, useDispatch } from "react-redux";
import * as appwrite from "react-native-appwrite";
import { RootState } from "@/lib/store/store";
import BackArrowIcon from "@/components/svg/backArrow";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ChevronDownIcon from "@/components/svg/chevronDown";
import { databases, databaseId, usersId, dealershipLevel2Id, dealershipLevel3Id, scansId, notificationsId } from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import { setSelectedCustomer } from "@/lib/store/customerSlice";
import { setCurrentScan, setCurrentCustomer } from "@/lib/store/currentSlice";
import { Alert } from "react-native";

// Define interfaces at the top of the file
interface User {
  $id: string;
  name: string;
  profileImage?: string;
  [key: string]: any;
}

interface Scan {
    $id: string;
    users: string | { $id: string; name?: string; [key: string]: any };
    $createdAt: string;
    user?: {
      $id: string;
      name: string;
      [key: string]: any;
    };
    [key: string]: any;
}

const CustomerAssignmentScreen = () => {
  const userData = useSelector((state: RootState) => state.user.data);
  const currentDealershipLevel2 = useSelector((state: RootState) => state.current.currentDealershipLevel2);
  const currentDealershipLevel3 = useSelector((state: RootState) => state.current.currentDealershipLevel3);
  const [selectedName, setSelectedName] = useState<string | null>(
    userData?.name || null
  );
  const customer = useSelector((state: RootState) => state.customer.selectedCustomer);
  const [allUsers, setAllUsers] = useState<any[]>([]); // State to hold users list
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDealershipUsers = async () => {
      setIsLoading(true);
      try {
        if (!userData || !userData.$id) {
          console.error("No user data or user ID available");
          return;
        }

        console.log("Current user data:", userData);
        console.log("Current dealership levels:", { currentDealershipLevel2, currentDealershipLevel3 });
        
        // Determine which dealership level to fetch
        let collectionId: string;
        let dealershipId: string | null;

        if (currentDealershipLevel3) {
          collectionId = dealershipLevel3Id;
          dealershipId = currentDealershipLevel3;
        } else if (currentDealershipLevel2) {
          collectionId = dealershipLevel2Id;
          dealershipId = currentDealershipLevel2;
        } else {
          console.error("No dealership level found");
          return;
        }

        console.log(`Fetching dealership from collection ${collectionId}:`, dealershipId);

        // First, fetch the dealership document
        const dealershipResponse = await databases.getDocument(
          databaseId,
          collectionId,
          dealershipId
        );

        console.log("Fetched dealership:", dealershipResponse);

        // Get the users from the dealership document and include current user
        const dealershipUsers = dealershipResponse.users || [];
        const currentUser = {
          $id: userData.$id,
          name: userData.name,
          profileImage: userData.profileImage
        };
        
        // Include current user and other users
        const allDealershipUsers = [
          currentUser, 
          ...dealershipUsers.filter((user: User) => user.$id !== userData.$id)
            .map((user: User) => ({
              $id: user.$id,
              name: user.name,
              profileImage: user.profileImage
            }))
        ];
        
        console.log("All dealership users (including current):", allDealershipUsers);
        setAllUsers(allDealershipUsers);
      } catch (error) {
        console.error("Error fetching dealership users:", error);
        setAllUsers([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealershipUsers();
  }, [userData, currentDealershipLevel2, currentDealershipLevel3]);

  const getInitials = (name: string) => {
    if (!name) return "Cu";
    const firstName = name.split(" ")[0];
    const cleaned = firstName.replace(/[^a-zA-Z]/g, "");
    return (cleaned.slice(0, 2) || "Cu")
      .split("")
      .map((c, i) => (i === 1 ? c.toLowerCase() : c.toUpperCase()))
      .join("");
  };

  const renderNameOptions = () => {
    // Always show all users in the dropdown
    return allUsers.map((user) => (
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

      // Debug customer object structure
      console.log("Customer object structure:", {
        customer,
        id: customer.id,
        $id: customer.$id,
        fullCustomer: JSON.stringify(customer)
      });

      // Find the selected user's full data from allUsers
      const selectedUser = allUsers.find(user => user.name === selectedName);
      if (!selectedUser) {
        console.error("Selected user not found in users list");
        return;
      }

      console.log("Starting assignment process:", {
        selectedUser,
        customer,
        currentScans: customer.scans
      });

      // Get the latest scan (assuming it's the first one in the array)
      const latestScan = customer.scans?.[0];
      if (!latestScan) {
        console.error("No scan found for this customer");
        return;
      }

      try {
        // Update the scan with the selected user
        const updatedScan = await databases.updateDocument(
          databaseId,
          scansId,
          latestScan.$id,
          {
            users: selectedUser.$id // Update the users field with the selected user's ID
          }
        );
        console.log("Successfully updated scan:", updatedScan);
      } catch (error) {
        console.error("Error updating scan document:", error);
        throw error;
      }

      try {
        // Determine notification type and create notification
        const notificationType = customer.scans?.length > 1 ? 'reassigned' : 'first_assigned';
        const customerId = customer.id || customer.$id; // Try both possible ID fields
        
        if (!customerId) {
          console.error("Could not find customer ID:", customer);
          throw new Error("Customer ID is missing");
        }

        console.log("Creating notification:", {
          type: notificationType,
          userId: selectedUser.$id,
          customerId
        });

        // Create notification with proper relationship format
        const notification = await databases.createDocument(
          databaseId,
          notificationsId,
          ID.unique(),
          {
            type: notificationType,
            read: false,
            users: [selectedUser.$id],  // Keep as array since that's the correct format
            customers: [customerId]     // Use the found customer ID
          }
        );
        console.log("Successfully created notification:", notification);
      } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
      }

      // Update Redux store with current scan and customer IDs
      const customerIdForRedux = customer.id || customer.$id;
      console.log("Updating Redux store:", {
        scanId: latestScan.$id,
        customerId: customerIdForRedux
      });
      
      dispatch(setCurrentScan(latestScan.$id));
      dispatch(setCurrentCustomer(customerIdForRedux));

      // Add a small delay to ensure Redux state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Navigation to customer log starting...");
      router.push("/home/customers/customer-log");

    } catch (error) {
      console.error("Error in assignment process:", error);
      Alert.alert(
        "Error",
        "Failed to complete the assignment process. Please try again."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const renderPriorUsers = () => {
    if (isLoading) {
      return (
        <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
          <Text className="text-xs">Loading prior consultants...</Text>
        </View>
      );
    }

    console.log('Rendering prior users with data:', {
      customerScans: customer?.scans,
      currentUserName: userData?.name,
      allUsers
    });

    if (customer?.scans && customer.scans.length > 0) {
      const priorUserNames = new Set<string>(); // Use Set to avoid duplicates

      customer.scans.forEach((scan: Scan) => {
        // Get the user ID - handle both string and object cases
        const userId = typeof scan.users === 'string' ? scan.users : scan.users?.$id;
        
        console.log('Processing scan:', {
          scanId: scan.$id,
          scanUser: scan.user,
          scanUserId: userId,
          scanUsersRaw: scan.users,
          foundUser: userId ? allUsers.find(u => u.$id === userId) : null
        });

        // Check both expanded user data and user ID
        if (scan.user?.name && scan.user.name !== userData?.name) {
          console.log('Adding user from scan.user:', scan.user.name);
          priorUserNames.add(scan.user.name);
        } else if (userId) {
          // Find user in allUsers list by ID
          const user = allUsers.find(u => u.$id === userId);
          if (user && user.name !== userData?.name) {
            console.log('Adding user from allUsers:', user.name);
            priorUserNames.add(user.name);
          }
        }
      });
      

      const uniquePriorUserNames = Array.from(priorUserNames);
      console.log('Final prior user names:', uniquePriorUserNames);

      if (uniquePriorUserNames.length > 0) {
        return (
          <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
            <Text className="text-xs">{uniquePriorUserNames.join(", ")}</Text>
          </View>
        );
      } else {
        return (
          <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
            <Text className="text-xs">No prior consultants (excluding you)</Text>
          </View>
        );
      }
    } else {
      return (
        <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
          <Text className="text-xs">No prior consultants</Text>
        </View>
      );
    }
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
                    {getInitials(customer.name)}
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
              Customer Name:{" "}
              <Text className="font-bold">{customer?.name || "N/A"}</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Contact Number:{" "}
              <Text className="font-bold">{customer?.phone || "N/A"}</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Email: <Text className="font-bold">{customer?.email || "N/A"}</Text>
            </Text>
          </View>
        </View>

        {/* User List*/}
        <View className="mt-6">
          <Text className="text-[10px] text-gray-500">
            Prior Sales Consultant(s)
          </Text>
          {renderPriorUsers()}
        </View>

        {/* Name Select */}
        <View className="mt-3 relative z-10 w-full">
          <Text className="text-[10px] text-gray-500">Your Name</Text>
          <TouchableOpacity
            className="rounded-md bg-color3 px-5 py-3 mt-1 flex-row items-center justify-between"
            onPress={toggleDropdown}
          >
            <View className="flex-row items-center gap-2">
              {selectedName && (
                <>
                  {allUsers.find(u => u.name === selectedName)?.profileImage && 
                   allUsers.find(u => u.name === selectedName)?.profileImage !== 'black' ? (
                    <Image
                      source={{ uri: allUsers.find(u => u.name === selectedName)?.profileImage }}
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
            disabled={isAssigning || isLoading || !selectedName}
            loading={isAssigning}
          />
        </View>
      </View>
    </View>
  );
};

export default CustomerAssignmentScreen;