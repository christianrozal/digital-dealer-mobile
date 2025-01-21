import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import ButtonComponent from "@/components/button";
import { useSelector } from "react-redux";
import { Avatar } from "react-native-paper";
import * as appwrite from "react-native-appwrite";
import { RootState } from "@/store/store";

// Initialize Appwrite client (moved outside the component for better performance)
const client = new appwrite.Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("6780c774003170c68252"); // Replace with your project ID

const databases = new appwrite.Databases(client);
const DATABASE_ID = "67871d61002bf7e6bc9e"; // Replace with your database ID
const CONSULTANTS_COLLECTION_ID = "6787235d000989f46de3";
const CUSTOMERS_COLLECTION_ID = "678724210037c2b3b179";

const CustomerAssignmentScreen = () => {
  const loggedInConsultantName = useSelector(
    (state: RootState) => state.user.name
  );
  const [selectedName, setSelectedName] = useState(
    loggedInConsultantName || ""
  ); // Initialize with logged-in name
  const customer = useSelector((state: RootState) => state.user.customer);
  const [priorConsultants, setPriorConsultants] = useState<any[]>([]);
  const [allConsultants, setAllConsultants] = useState<any[]>([]);

  const fetchRelatedConsultants = () => {
    if (!customer || !customer.consultants) {
      console.log("fetchRelatedConsultants: No customer or consultants found");
      return;
    }

    const priorConsultantsData = customer.consultants.map(
      (consultant: any) => ({
        name: consultant.name,
        ...consultant, // Include other properties if needed
      })
    );

    console.log(
      "fetchRelatedConsultants: Fetched prior consultants:",
      priorConsultantsData
    );
    setPriorConsultants(priorConsultantsData);
  };

  const fetchAllConsultants = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CONSULTANTS_COLLECTION_ID
      );

      if (response?.documents) {
        setAllConsultants(response.documents);
      }
    } catch (error) {
      console.error("Error fetching all consultants", error);
    }
  };

  useEffect(() => {
    fetchAllConsultants();
    fetchRelatedConsultants();
  }, [customer]);

  const getInitials = (name: string) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[
      nameParts.length - 1
    ]
      .charAt(0)
      .toUpperCase()}`;
  };

  const renderNameOptions = () => {
    return allConsultants.map((consultant) => (
      <Picker.Item
        label={consultant.name}
        value={consultant.name}
        key={consultant.$id}
      />
    ));
  };

  const handleAssign = async () => {
    try {
      // Find the consultant by name
      const consultantResponse = await databases.listDocuments(
        DATABASE_ID,
        CONSULTANTS_COLLECTION_ID,
        [appwrite.Query.equal("name", selectedName)]
      );

      if (
        consultantResponse?.documents &&
        consultantResponse.documents.length > 0
      ) {
        const consultantId = consultantResponse.documents[0].$id;

        if (customer && consultantId) {
          // Check if the consultant is already related to the customer
          if (
            customer.consultants &&
            customer.consultants.includes(consultantId)
          ) {
            console.log("This consultant is already related to the customer.");
            return; // Do nothing if the consultant is already related
          }

          // If consultant is not already related, update customer record
          const updatedConsultants = [
            ...(customer.consultants || []),
            consultantId,
          ];

          // Update customer with the new consultant
          const response = await databases.updateDocument(
            DATABASE_ID,
            CUSTOMERS_COLLECTION_ID,
            customer.$id,
            {
              consultants: updatedConsultants, // Add the new consultant
            }
          );

          console.log("Customer Updated:", response);
          router.push("/home/qr-scanner/post-assignment");
        } else {
          console.error("Error: Missing customer or consultantId");
        }
      } else {
        console.error(
          "Error: Could not find consultant with name: " + selectedName
        );
      }
    } catch (error) {
      console.error("Error creating the relationship", error);
      // handle error
    }
  };

  return (
    <View className="pt-5 px-5">
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
            <Avatar.Text
              size={64}
              label={getInitials(customer.name)}
              style={{ backgroundColor: "#3D12FA" }}
            />
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
        {priorConsultants.length > 0 ? (
          priorConsultants.map((consultant, index) => (
            <View
              key={index}
              className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full"
            >
              <Text className="text-xs">{consultant.name}</Text>
            </View>
          ))
        ) : (
          <View className="placeholder:text-gray-500 bg-color3 rounded-md py-3 px-4 mt-1 w-full">
            <Text className="text-xs">No prior consultants</Text>
          </View>
        )}
      </View>

      {/* Name Select */}
      <View className="mt-3">
        <Text className="text-[10px] text-gray-500">Your Name</Text>
        <View className="rounded-md mt-1 w-full">
          <Picker
            selectedValue={selectedName}
            onValueChange={(itemValue) => setSelectedName(itemValue)}
            className="text-xs focus:outline-color1 bg-color3 p-3 rounded-md"
          >
            <Picker.Item label="Select a name" value="" />
            {renderNameOptions()}
          </Picker>
        </View>
      </View>

      <ButtonComponent
        label="Assign"
        onPress={handleAssign}
        className="mt-10"
      />
    </View>
  );
};

export default CustomerAssignmentScreen;
