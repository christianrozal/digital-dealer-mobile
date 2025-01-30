import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import ChevronDownIcon from "@/components/svg/chevronDown";
import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import { Client, Databases, Account, Query } from 'react-native-appwrite'; // Added Account import
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRooftopData } from '@/store/rooftopSlice';
import { setCurrentRooftop, setCurrentConsultant } from '@/store/currentSlice'; // Import setCurrentConsultant

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const DATABASE_ID = "67871d61002bf7e6bc9e";
const ROOFTOPS_COLLECTION_ID = "6787245c001ae86f7902";
const CONSULTANTS_COLLECTION_ID = "6787235d000989f46de3"; // Added Consultants Collection ID

const RooftopScreen = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rooftops, setRooftops] = useState<any[]>([]);
  const [loadingRooftops, setLoadingRooftops] = useState(true);
  const [consultants, setConsultants] = useState<any[]>([]); // State for consultants data
  const [loadingConsultants, setLoadingConsultants] = useState(true); // Loading state for consultants

  const dispatch = useDispatch();
  const selectedRooftopData = useSelector((state: any) => state.rooftop.selectedRooftopData);
  const currentRooftopId = useSelector((state: any) => state.current.currentRooftop);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRooftopSelection = (rooftop: any) => {
    dispatch(setSelectedRooftopData(rooftop));
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const fetchRooftops = async () => {
      setLoadingRooftops(true);
      try {
        const databases = new Databases(client);
        const response = await databases.listDocuments(
          DATABASE_ID,
          ROOFTOPS_COLLECTION_ID
        );
        setRooftops(response.documents);
      } catch (error) {
        console.error("Error fetching rooftops:", error);
        // Handle error appropriately, maybe show an error message to the user
      } finally {
        setLoadingRooftops(false);
      }
    };
    if (selectedRooftopData) { // Fetch consultants only when a rooftop is selected
      const fetchConsultants = async () => {
        setLoadingConsultants(true);
        try {
          const databases = new Databases(client);
          const response = await databases.listDocuments(DATABASE_ID, CONSULTANTS_COLLECTION_ID);
      
          // Filter consultants based on the selected rooftop ID
          const filteredConsultants = response.documents.filter(
            (consultant: any) =>
              consultant.rooftops.some((rooftop: any) => rooftop.$id === selectedRooftopData.$id)
          );
      
          setConsultants(filteredConsultants);
          console.log(`Filtered Consultants for rooftop ID: ${selectedRooftopData.$id}`, filteredConsultants);
        } catch (error) {
          console.error("Error fetching consultants:", error);
        } finally {
          setLoadingConsultants(false);
        }
      };          
        fetchConsultants();
    } else {
      setConsultants([]); // Clear consultants if no rooftop is selected
    }


    fetchRooftops();
  }, [selectedRooftopData]); // Refetch consultants when selectedRooftopData changes

  const handleContinue = async () => {
    if (!selectedRooftopData) {
      console.log("No Rooftop Selected");
      return;
    }

    try {
      // Get current user session
      const account = new Account(client);
      const currentUser = await account.get();
      const userIdentifier = currentUser.email; // Using email as identifier

      // Find matching consultant in selected rooftop
      const matchedConsultant = selectedRooftopData.consultants.find(
        (consultant: any) => consultant.email === userIdentifier // Matching consultant by email
      );

      if (!matchedConsultant) {
        console.error("No consultant found for current user email");
        // Handle error (e.g., show alert to the user)
        alert("No matching consultant found for your email in the selected rooftop.");
        return;
      }

      // Update Redux store
      dispatch(setCurrentRooftop(selectedRooftopData.$id));
      dispatch(setCurrentConsultant(matchedConsultant.$id)); // Assuming consultant object has an $id

      console.log("Current Rooftop:", (selectedRooftopData.$id));
      console.log("Current Consultant:", (matchedConsultant.$id));

      // Navigate to home
      router.push("/home");
    } catch (error) {
      console.error("Error during continue process:", error);
      // Handle error (e.g., show alert to the user)
      alert("Error during continue process. Please try again.");
    }
  };


  return (
    <View className="items-center justify-center h-screen w-full max-w-60 mx-auto">
      <AlexiumLogoIcon />

      <View className="mt-10 relative z-10 w-full">
        <TouchableOpacity
          className="border rounded-md border-gray-300 px-5 py-3 flex-row items-center justify-between"
          style={{ backgroundColor: "#FAFAFA" }}
          onPress={toggleDropdown}
        >
          <Text
            className={`text-sm ${selectedRooftopData ? "text-gray-600" : "text-gray-400"}`}
          >
            {selectedRooftopData?.name || "Choose Rooftop"}
          </Text>
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
            {loadingRooftops ? (
              <Text className="px-5 py-3 text-sm text-gray-700">Loading rooftops...</Text>
            ) : (
              rooftops.map((rooftop) => (
                <TouchableOpacity
                  key={rooftop.$id}
                  className={`px-5 py-3 ${
                    selectedRooftopData?.$id === rooftop.$id ? "bg-color3" : "bg-white"
                  }`}
                  onPress={() => handleRooftopSelection(rooftop)}
                >
                  <Text
                    className={`text-sm ${
                      selectedRooftopData?.$id === rooftop.$id ? "text-color1" : "text-gray-700"
                    }`}
                  >
                    {rooftop.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>

        <View className={`mt-10 w-full`}>
         <ButtonComponent
            label="Continue"
            onPress={handleContinue}
            disabled={!selectedRooftopData}
            var2
          />
        </View>

    </View>
  );
};

export default RooftopScreen;