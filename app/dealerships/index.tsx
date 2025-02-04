import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import ChevronDownIcon from "@/components/svg/chevronDown";
import ButtonComponent from "@/components/button";
import Select from "@/components/rnr/select";
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

      // Keep all dealerships in userData but update other data
      dispatch(setUserData({
        ...userData,
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
        scans: rooftopScans
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

  return (
    <View className="flex-1 bg-white">
      <View className="items-center justify-center h-screen w-full max-w-60 mx-auto">
        <AlexiumLogoIcon />
        <Text className="mt-10 font-light text-sm">Welcome to</Text>
        <Text className="text-xl font-semibold mt-3">{level1Name}</Text>

        <View className="w-full" style={{ marginTop: 100, zIndex: 20 }}>
          <Select
            placeholder="Select Dealership"
            value={selectedDealership ? { id: selectedDealership.$id, label: selectedDealership.name } : null}
            options={userData?.dealershipLevel2?.map(d => ({ id: d.$id, label: d.name })) || []}
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
              value={selectedRooftop ? { id: selectedRooftop.$id, label: selectedRooftop.name } : null}
              options={availableRooftops.map(r => ({ id: r.$id, label: r.name }))}
              isOpen={isRooftopDropdownOpen}
              onPress={toggleRooftopDropdown}
              onSelect={(option) => {
                const rooftop = availableRooftops.find(r => r.$id === option.id);
                if (rooftop) handleRooftopSelection(rooftop);
              }}
            />
          </View>
        )}

        <View className="mt-10 w-full">
          <ButtonComponent
            label="Continue"
            onPress={handleContinue}
            disabled={!selectedDealership || (availableRooftops.length > 0 && !selectedRooftop)}
            var2
          />
        </View>
      </View>
    </View>
  );
};

export default DealershipsScreen;