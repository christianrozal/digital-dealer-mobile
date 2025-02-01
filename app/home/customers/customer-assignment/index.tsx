import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import ButtonComponent from "@/components/button";
import { useSelector } from "react-redux";
import { Avatar } from "react-native-paper";
import * as appwrite from "react-native-appwrite";
import { RootState } from "@/lib/store/store";
import BackArrowIcon from "@/components/svg/backArrow";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ChevronDownIcon from "@/components/svg/chevronDown";

// Define a specific interface for the scan object
interface Scan {
    consultants?: {
        name?: string;
    } | null;
  [key: string]: any; // Allows other properties not explicitly declared
}

const CustomerAssignmentScreen = () => {
  const loggedInConsultantName = useSelector(
    (state: RootState) => state.user.name
  );
  const loggedInConsultantData = useSelector( // Get full consultant data
    (state: RootState) => state.consultant.data
  );
  const [selectedName, setSelectedName] = useState<string | null>(
    loggedInConsultantName || null
  ); // Initialize with logged-in name
  const customer = useSelector((state: RootState) => state.customer.selectedCustomer); // Access customer from customerSlice
  const selectedRooftopData = useSelector((state: RootState) => state.rooftop.selectedRooftopData); // Access rooftop data
  const [allConsultants, setAllConsultants] = useState<any[]>([]); // State to hold consultant list
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedRooftopData?.consultants) {
      setAllConsultants(selectedRooftopData.consultants); // Set consultants from rooftop data
    } else {
      // Fallback in case rooftop data or consultants are not available.
      // You might want to handle this case differently, e.g., fetch consultants separately.
      setAllConsultants([
        { name: "Alice Johnson", id: "3" },
        { name: "Bob Williams", id: "4" },
        { name: "Charlie Brown", id: "5" },
        { name: "David Davis", id: "6" },
      ]);
    }
  }, [selectedRooftopData]);


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
    return allConsultants.map((consultant) => (
      <TouchableOpacity
        key={consultant.id || consultant.$id} // Use consultant.id if available, otherwise fallback to consultant.$id
        className={`px-5 py-3 bg-white`} // Removed conditional background
        onPress={() => handleNameSelection(consultant.name)}
      >
        <Text
          className={`text-sm text-gray-700`} // Removed conditional text color
        >
          {consultant.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  const handleAssign = async () => {
    console.log("Assigning consultant:", selectedName, "to customer:", customer);
    router.push("/home/customers/customer-log");
  };

  const renderPriorConsultants = () => {
    if (customer?.scans && customer.scans.length > 0) {
      const priorConsultantNames = new Set<string>(); // Use Set to avoid duplicates

      customer.scans.forEach((scan: Scan) => {
        const consultantName = scan.consultants?.name;
        if (consultantName && consultantName !== loggedInConsultantName) { // Exclude current consultant
          priorConsultantNames.add(consultantName);
        }
      });

      const uniquePriorConsultantNames = Array.from(priorConsultantNames);

      if (uniquePriorConsultantNames.length > 0) {
        return (
          <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
            <Text className="text-xs">{uniquePriorConsultantNames.join(", ")}</Text>
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
            <TouchableOpacity>
              <View
                className="bg-color1 rounded-full flex items-center justify-center"
                style={{ width: 64, height: 64 }}
              >
                <Text className="text-white font-bold" style={{ fontSize: 20 }}>
                  {getInitials(customer.name)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/profile.webp")}
                style={{ width: 56, height: 56 }}
              />
            </TouchableOpacity>
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

        {/* Consultant List*/}
        <View className="mt-6">
          <Text className="text-[10px] text-gray-500">
            Prior Sales Consultant(s)
          </Text>
          {renderPriorConsultants()}
        </View>

        {/* Name Select */}
        <View className="mt-3 relative z-10 w-full">
          <Text className="text-[10px] text-gray-500">Your Name</Text>
          <TouchableOpacity
            className="rounded-md bg-color3 px-5 py-3 mt-1 flex-row items-center justify-between"
            onPress={toggleDropdown}
          >
            <Text
              className={`text-sm ${selectedName ? "text-gray-600" : "text-gray-400"}`}
            >
              {selectedName || "Select a name"}
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
              {renderNameOptions()}
            </ScrollView>
          )}
        </View>

        <ButtonComponent
          label="Assign"
          onPress={handleAssign}
          className="mt-10"
        />
      </View>
    </View>
  );
};

export default CustomerAssignmentScreen;