import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import ChevronDownIcon from "@/components/svg/chevronDown";
import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRooftopData } from '@/lib/store/rooftopSlice';
import { setCurrentDealershipLevel1, setCurrentDealershipLevel2, setCurrentDealershipLevel3, setCurrentConsultant } from '@/lib/store/currentSlice';
import { databases, account, usersId, databaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { setUserData, setLoading, setError } from '@/lib/store/userSlice';
import { RootState } from "@/lib/store/store";

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
  dealershipLevel2?: { $id: string };
  dealershipLevel3?: { $id: string };
  customers?: any;
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
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

const DealershipsScreen = () => {
  const [isDealershipDropdownOpen, setIsDealershipDropdownOpen] = useState(false);
  const [isRooftopDropdownOpen, setIsRooftopDropdownOpen] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<DealershipLevel2 | null>(null);
  const [selectedRooftop, setSelectedRooftop] = useState<DealershipLevel3 | null>(null);
  const [availableRooftops, setAvailableRooftops] = useState<DealershipLevel3[]>([]);
  
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.data) as UserData;
  const loading = useSelector((state: RootState) => state.user.loading);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        dispatch(setLoading(true));
        const session = await account.get();
        const response = await databases.listDocuments(
          databaseId,
          usersId,
          [Query.equal('email', session.email)]
        );

        if (response.documents.length > 0) {
          // Map the raw data from Appwrite to our expected format
          const rawUserData = response.documents[0];
          console.log('Raw User Data from Appwrite:', {
            dealershipLevel1: rawUserData.dealershipLevel1,
            dealershipLevel2: rawUserData.dealershipLevel2,
            dealershipLevel3: rawUserData.dealershipLevel3
          });

          const userData = {
            ...rawUserData,
            dealershipLevel1: rawUserData.dealershipLevel1 || [],
            dealershipLevel2: rawUserData.dealershipLevel2 || [],
            dealershipLevel3: rawUserData.dealershipLevel3 || []
          } as unknown as UserData;
          
          console.log('Mapped User Data:', {
            dealershipLevel1: userData.dealershipLevel1,
            dealershipLevel2: userData.dealershipLevel2,
            dealershipLevel3: userData.dealershipLevel3
          });
          
          dispatch(setUserData(userData));
        } else {
          dispatch(setError('User not found'));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch user data'));
      } finally {
        dispatch(setLoading(false));  // Make sure to set loading to false
      }
    };

    fetchUserData();
  }, [dispatch]);

  const toggleDealershipDropdown = () => {
    setIsDealershipDropdownOpen(!isDealershipDropdownOpen);
    setIsRooftopDropdownOpen(false);
  };

  const toggleRooftopDropdown = () => {
    if (!selectedDealership) return;
    setIsRooftopDropdownOpen(!isRooftopDropdownOpen);
    setIsDealershipDropdownOpen(false);
  };

  const handleDealershipSelection = (dealership: DealershipLevel2) => {
    setSelectedDealership(dealership);
    setSelectedRooftop(null);
    setIsDealershipDropdownOpen(false);
    
    // Update available rooftops
    const rooftops = userData?.dealershipLevel3?.filter(
      rooftop => rooftop.dealershipLevel2.$id === dealership.$id
    ) || [];
    setAvailableRooftops(rooftops);

    // Update current dealership level 2
    dispatch(setCurrentDealershipLevel2(dealership.$id));
    // Reset dealership level 3 when selecting a new level 2
    dispatch(setCurrentDealershipLevel3(null));

    console.log('Selected Dealership Level 2:', {
      id: dealership.$id,
      name: dealership.name,
      level3: null // Reset when selecting new level 2
    });

    // Update Redux with filtered data
    if (userData) {
      // Filter scans for this dealership
      const dealershipScans = userData.scans?.filter(scan => 
        scan.dealershipLevel2?.$id === dealership.$id ||
        rooftops.some(rooftop => scan.dealershipLevel3?.$id === rooftop.$id)
      ) || [];

      dispatch(setUserData({
        ...userData,
        dealershipLevel2: [dealership],
        dealershipLevel3: rooftops,
        scans: dealershipScans  // Update scans in Redux
      }));
    }
  };

  const handleRooftopSelection = (rooftop: DealershipLevel3) => {
    setSelectedRooftop(rooftop);
    setIsRooftopDropdownOpen(false);
    
    // Update current dealership level 3
    dispatch(setCurrentDealershipLevel3(rooftop.$id));
    
    console.log('Selected Dealership Level 3:', {
      id: rooftop.$id,
      name: rooftop.name,
      level2: {
        id: selectedDealership?.$id,
        name: selectedDealership?.name
      }
    });

    // Update Redux with filtered data
    if (userData && selectedDealership) {
      // Filter scans for this rooftop
      const rooftopScans = userData.scans?.filter(scan => 
        scan.dealershipLevel3?.$id === rooftop.$id
      ) || [];

      dispatch(setUserData({
        ...userData,
        dealershipLevel2: [selectedDealership],
        dealershipLevel3: [rooftop],
        scans: rooftopScans  // Update scans in Redux
      }));
    }
    dispatch(setSelectedRooftopData(rooftop));
  };

  const handleContinue = () => {
    if (!selectedDealership || !userData) return;
    
    // If there are level3s available, require one to be selected
    if (availableRooftops.length > 0 && !selectedRooftop) return;

    // Get level 1 ID from user data
    const level1Id = userData.dealershipLevel1?.[0]?.$id;
    if (level1Id) {
      dispatch(setCurrentDealershipLevel1(level1Id));
    }

    // Filter scans based on selection
    const filteredScans = selectedRooftop
      ? userData.scans?.filter(scan => scan.dealershipLevel3?.$id === selectedRooftop.$id)
      : userData.scans?.filter(scan => 
          scan.dealershipLevel2?.$id === selectedDealership.$id ||
          availableRooftops.some(rooftop => scan.dealershipLevel3?.$id === rooftop.$id)
        ) || [];

    // Update Redux with filtered scans only, keep other data intact
    dispatch(setUserData({
      ...userData,
      scans: filteredScans
    }));
    
    // Update current states
    if (selectedRooftop) {
      dispatch(setCurrentDealershipLevel3(selectedRooftop.$id));
    } else {
      dispatch(setCurrentDealershipLevel2(selectedDealership.$id));
    }
    dispatch(setCurrentConsultant(userData.$id || null));
    
    console.log('Final Selected State:', {
      dealershipLevel1: {
        id: level1Id,
        name: userData.dealershipLevel1?.[0]?.name
      },
      dealershipLevel2: {
        id: selectedDealership.$id,
        name: selectedDealership.name
      },
      dealershipLevel3: selectedRooftop ? {
        id: selectedRooftop.$id,
        name: selectedRooftop.name
      } : null,
      consultant: {
        id: userData.$id,
        name: userData.name
      }
    });
    
    router.push("/home");
  };

  const level1Name = loading 
    ? "Loading..." 
    : userData?.dealershipLevel1?.[0]?.name || "No dealership assigned";

  return (
    <View className="items-center justify-center h-screen w-full max-w-60 mx-auto">
      <AlexiumLogoIcon />
      <Text className="mt-5 font-light text-sm">Welcome to</Text>
      <Text className="text-xl font-semibold">{level1Name}</Text>

      <View className="mt-10 relative z-20 w-full">
        <TouchableOpacity
          className="border rounded-md border-gray-300 px-5 py-3 flex-row items-center justify-between"
          style={{ backgroundColor: "#FAFAFA" }}
          onPress={toggleDealershipDropdown}
        >
          <Text
            className={`text-sm ${selectedDealership ? "text-gray-600" : "text-gray-400"}`}
          >
            {selectedDealership?.name || "Select Dealership"}
          </Text>
          <View
            className="transition-transform duration-300"
            style={{
              transform: [{ rotate: isDealershipDropdownOpen ? "180deg" : "0deg" }],
            }}
          >
            <ChevronDownIcon width={16} height={16} />
          </View>
        </TouchableOpacity>
        {isDealershipDropdownOpen && userData?.dealershipLevel2 && (
          <ScrollView
            className="mt-1 bg-white border border-gray-200 rounded-md"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 20,
              maxHeight: 112,
            }}
          >
            {userData.dealershipLevel2.map((dealership) => (
              <TouchableOpacity
                key={dealership.$id}
                className={`px-5 py-3 ${
                  selectedDealership?.$id === dealership.$id ? "bg-color3" : "bg-white"
                }`}
                onPress={() => handleDealershipSelection(dealership)}
              >
                <Text
                  className={`text-sm ${
                    selectedDealership?.$id === dealership.$id ? "text-color1" : "text-gray-700"
                  }`}
                >
                  {dealership.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {selectedDealership && availableRooftops.length > 0 && (
        <View className="mt-5 relative z-10 w-full">
          <TouchableOpacity
            className="border rounded-md border-gray-300 px-5 py-3 flex-row items-center justify-between"
            style={{ backgroundColor: "#FAFAFA" }}
            onPress={toggleRooftopDropdown}
          >
            <Text
              className={`text-sm ${selectedRooftop ? "text-gray-600" : "text-gray-400"}`}
            >
              {selectedRooftop?.name || "Select Rooftop"}
            </Text>
            <View
              className="transition-transform duration-300"
              style={{
                transform: [{ rotate: isRooftopDropdownOpen ? "180deg" : "0deg" }],
              }}
            >
              <ChevronDownIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
          {isRooftopDropdownOpen && (
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
              {availableRooftops.map((rooftop) => (
                <TouchableOpacity
                  key={rooftop.$id}
                  className={`px-5 py-3 ${
                    selectedRooftop?.$id === rooftop.$id ? "bg-color3" : "bg-white"
                  }`}
                  onPress={() => handleRooftopSelection(rooftop)}
                >
                  <Text
                    className={`text-sm ${
                      selectedRooftop?.$id === rooftop.$id ? "text-color1" : "text-gray-700"
                    }`}
                  >
                    {rooftop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View className={`mt-10 w-full`}>
        <ButtonComponent
          label="Continue"
          onPress={handleContinue}
          disabled={!selectedDealership || (availableRooftops.length > 0 && !selectedRooftop)}
          var2
        />
      </View>
    </View>
  );
};

export default DealershipsScreen;