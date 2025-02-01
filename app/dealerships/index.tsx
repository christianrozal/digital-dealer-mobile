import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import ChevronDownIcon from "@/components/svg/chevronDown";
import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRooftopData } from '@/lib/store/rooftopSlice';
import { setCurrentRooftop, setCurrentConsultant } from '@/lib/store/currentSlice';
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

const DealershipsScreen = () => {
  const [isDealershipDropdownOpen, setIsDealershipDropdownOpen] = useState(false);
  const [isRooftopDropdownOpen, setIsRooftopDropdownOpen] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<DealershipLevel2 | null>(null);
  const [selectedRooftop, setSelectedRooftop] = useState<DealershipLevel3 | null>(null);
  const [availableRooftops, setAvailableRooftops] = useState<DealershipLevel3[]>([]);
  
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.data);

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
          const userData = response.documents[0];
          dispatch(setUserData(userData));
          console.log('User Data:', userData);
        } else {
          dispatch(setError('User not found'));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch user data'));
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
  };

  const handleRooftopSelection = (rooftop: DealershipLevel3) => {
    setSelectedRooftop(rooftop);
    dispatch(setSelectedRooftopData(rooftop));
    setIsRooftopDropdownOpen(false);
  };

  const handleContinue = () => {
    if (!selectedDealership || !userData) return;
    
    // If there are rooftops available, require one to be selected
    if (availableRooftops.length > 0 && !selectedRooftop) return;
    
    dispatch(setCurrentRooftop(selectedRooftop?.$id || selectedDealership.$id));
    dispatch(setCurrentConsultant(userData.$id || null));
    router.push("/");
  };

  const level1Name = userData?.dealershipLevel1?.name || "Loading...";

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