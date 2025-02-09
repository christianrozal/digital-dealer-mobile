import { View, Text, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import ButtonComponent from "@/components/button";
import Select from "@/components/rnr/select";
import { router } from "expo-router";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRooftopData } from '@/lib/store/rooftopSlice';
import { setCurrentDealershipLevel1Id, setCurrentDealershipLevel2Id, setCurrentDealershipLevel3Id, setCurrentUserId } from '@/lib/store/currentSlice';
import { setUserData, setLoading, setError } from '@/lib/store/userSlice';
import { setScans, setScanLoading, setScanError } from '@/lib/store/scanSlice';
import { RootState } from "@/lib/store/store";
import { databases, databaseId, dealershipLevel2Id, dealershipLevel3Id, scansId } from "@/lib/appwrite";
import { setDealershipUsers } from "@/lib/store/dealershipUsersSlice";
import { Query } from "react-native-appwrite";

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
  phone?: string;
  email?: string;
  position?: string;
  role?: string;
  profileImage?: string;
  profileImageId?: string;
  dealershipLevel1?: {
    $id: string;
    name: string;
  }[];
  dealershipLevel2?: DealershipLevel2[];
  dealershipLevel3?: DealershipLevel3[];
  scans?: Scan[];
  slug?: string;
  customers?: string[];
}

const DealershipsScreen = () => {
  const [isDealershipDropdownOpen, setIsDealershipDropdownOpen] = useState(false);
  const [isRooftopDropdownOpen, setIsRooftopDropdownOpen] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<DealershipLevel2 | null>(null);
  const [selectedRooftop, setSelectedRooftop] = useState<DealershipLevel3 | null>(null);
  const [availableRooftops, setAvailableRooftops] = useState<DealershipLevel3[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.data) as UserData;

  const level1Name = userData?.dealershipLevel1?.[0]?.name || "No dealership assigned";

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
    dispatch(setCurrentDealershipLevel2Id(dealership.$id));
    // Reset dealership level 3 when selecting a new level 2
    dispatch(setCurrentDealershipLevel3Id(null));

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
        scans: dealershipScans
      }));
    }
  };

  const handleRooftopSelection = (rooftop: DealershipLevel3) => {
    setSelectedRooftop(rooftop);
    setIsRooftopDropdownOpen(false);
    
    // Update current dealership level 3
    dispatch(setCurrentDealershipLevel3Id(rooftop.$id));
    
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
        scans: rooftopScans
      }));
    }
    dispatch(setSelectedRooftopData(rooftop));
  };

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      if (!selectedDealership || !userData) return;
      
      // If there are level3s available, require one to be selected
      if (availableRooftops.length > 0 && !selectedRooftop) return;

      // Determine which dealership level to fetch users from
      let collectionId: string;
      let dealershipId: string;
      
      if (selectedRooftop) {
        collectionId = dealershipLevel3Id;
        dealershipId = selectedRooftop.$id;
      } else {
        collectionId = dealershipLevel2Id;
        dealershipId = selectedDealership.$id;
      }

      // Fetch dealership document with users
      const dealershipResponse = await databases.getDocument(
        databaseId,
        collectionId,
        dealershipId
      );

      // Get the users from the dealership document and include current user
      const allDealershipUsers = dealershipResponse.users || [];
      

      console.log('Dealership Users:', allDealershipUsers);

      // Store dealership users in Redux
      dispatch(setDealershipUsers(allDealershipUsers));

      // Fetch all scans for the dealership
      dispatch(setScanLoading(true));
      try {
        const scansResponse = await databases.listDocuments(
          databaseId,
          scansId,
          [
            selectedRooftop 
              ? Query.equal('dealershipLevel3', selectedRooftop.$id)
              : Query.equal('dealershipLevel2', selectedDealership.$id)
          ]
        );
        console.log('Scans:', scansResponse.documents);
        dispatch(setScans(scansResponse.documents));
      } catch (error) {
        console.error('Error fetching scans:', error);
        dispatch(setScanError('Failed to fetch scans'));
      } finally {
        dispatch(setScanLoading(false));
      }

      // Get level 1 ID from user data
      const level1Id = userData.dealershipLevel1?.[0]?.$id;
      if (level1Id) {
        dispatch(setCurrentDealershipLevel1Id(level1Id));
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
        dispatch(setCurrentDealershipLevel3Id(selectedRooftop.$id));
      } else {
        dispatch(setCurrentDealershipLevel2Id(selectedDealership.$id));
      }
      dispatch(setCurrentUserId(userData.$id || null));
      
      router.push("/home");
    } catch (error) {
      console.error('Error in handleContinue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="items-center justify-center h-screen w-full max-w-60 mx-auto">
        <AlexiumLogoIcon />
        <Text className="mt-10 font-light text-sm">Welcome to</Text>
        <Text className="text-xl font-semibold mt-3">{level1Name}</Text>

        <View className="w-full" style={{ marginTop: 64, zIndex: 20 }}>
          <Select
            placeholder="Select Dealership"
            value={
              selectedDealership
                ? { id: selectedDealership.$id, label: selectedDealership.name }
                : null
            }
            options={
              userData?.dealershipLevel2?.map(d => ({
                id: d.$id,
                label: d.name,
              })) || []
            }
            isOpen={isDealershipDropdownOpen}
            onPress={toggleDealershipDropdown}
            onSelect={(option) => {
              const dealership = userData?.dealershipLevel2?.find(d => d.$id === option.id);
              if (dealership) handleDealershipSelection(dealership);
            }}
          />
        </View>

        {selectedDealership && availableRooftops.length > 0 && (
          <View className="mt-5 w-full" style={{ zIndex: 10 }}>
            <Select
              placeholder="Select Rooftop"
              value={
                selectedRooftop
                  ? { id: selectedRooftop.$id, label: selectedRooftop.name }
                  : null
              }
              options={availableRooftops.map(r => ({
                id: r.$id,
                label: r.name,
              }))}
              isOpen={isRooftopDropdownOpen}
              onPress={toggleRooftopDropdown}
              onSelect={(option) => {
                const rooftop = availableRooftops.find(r => r.$id === option.id);
                if (rooftop) handleRooftopSelection(rooftop);
              }}
            />
          </View>
        )}

        <View className="mt-7 w-full">
          <ButtonComponent
            label="Continue"
            onPress={handleContinue}
            disabled={!selectedDealership || (availableRooftops.length > 0 && !selectedRooftop)}
            var2
          />
        </View>
      </View>

      {/* Overlay ActivityIndicator when loading */}
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

export default DealershipsScreen;
