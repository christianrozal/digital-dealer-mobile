import { useState, useEffect } from "react";
import { Button, Image, Text, TouchableOpacity, View, StyleSheet, Alert, Modal, ActivityIndicator } from "react-native";
import { CameraView, Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import * as appwrite from "react-native-appwrite";
import CloseIcon from "@/components/svg/closeIcon";
import { setSelectedCustomer } from "@/lib/store/customerSlice";
import { setCurrentScan, setCurrentCustomer } from "@/lib/store/currentSlice";
import { databases, databaseId, customersId, scansId } from "@/lib/appwrite";
import UploadIcon from "@/components/svg/uploadIcon";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  [key: string]: any;
}

const QrScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.data);
  const currentDealershipLevel1 = useSelector((state: RootState) => state.current.currentDealershipLevel1);
  const currentDealershipLevel2 = useSelector((state: RootState) => state.current.currentDealershipLevel2);
  const currentDealershipLevel3 = useSelector((state: RootState) => state.current.currentDealershipLevel3);

  const excludeSystemProperties = (obj: any) => {
    const result: any = {}
    for (const key in obj) {
      if (!key.startsWith('$')) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      console.log("QR Code scanned data:", data);
      const customerId = data;
      const userId = userData?.$id;

      console.log("Current user ID:", userId);

      if (!userId) {
        throw new Error("User not found in Redux store");
      }

      // Fetch customer data
      console.log("Fetching customer with ID:", customerId);
      const customerResponse = await databases.getDocument(
        databaseId,
        customersId,
        customerId
      );

      console.log("Customer response from database:", customerResponse);

      if (!customerResponse) {
        throw new Error("Customer not found in database");
      }

      // Map Appwrite Document to Customer object
      const customer: Customer = {
        id: customerResponse.$id,
        ...excludeSystemProperties(customerResponse)
      };

      console.log("Mapped customer object:", customer);

      // Dispatch customer data to Redux store
      dispatch(setSelectedCustomer(customer));
      dispatch(setCurrentCustomer(customer.id));
      console.log("Customer data added to store:", customer);

      // Create new scan document
      console.log("Creating scan document with data:", {
        customers: customerId,
        users: userId,
        followUpDate: new Date().toISOString(),
        interestStatus: "Hot",
        interestedIn: "Buying",
        dealershipLevel1: currentDealershipLevel1,
        dealershipLevel2: currentDealershipLevel2,
        dealershipLevel3: currentDealershipLevel3,
      });

      const scanDocument = await databases.createDocument(
        databaseId,
        scansId,
        appwrite.ID.unique(),
        {
          customers: customerId,
          users: userId,
          followUpDate: new Date().toISOString(),
          interestStatus: "Hot",
          interestedIn: "Buying",
          dealershipLevel1: currentDealershipLevel1,
          dealershipLevel2: currentDealershipLevel2,
          dealershipLevel3: currentDealershipLevel3,
        }
      );

      console.log("Created scan document:", scanDocument);

      // Dispatch the new scan ID to currentSlice
      dispatch(setCurrentScan(scanDocument.$id));
      dispatch(setCurrentCustomer(customerId));
      console.log("Dispatched currentScan ID to store:", scanDocument.$id);
      console.log("Dispatched currentCustomer ID to store:", customerId);

      router.push("/home/customers/customer-assignment");
    } catch (err) {
      console.error("Error processing scan:", err);
      Alert.alert("Error", "Failed to process QR code. Please try again.");
    } finally {
      setIsProcessing(false);
      setScanned(false);
    }
  };

  const handleImageUpload = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access photos is required!");
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const uri = result.assets[0].uri;
        // Use expo-camera's scanFromURLAsync instead of expo-barcode-scanner
        const barcodes = await Camera.scanFromURLAsync(uri, ["qr", "pdf417"]);

        if (barcodes.length > 0) {
          handleBarcodeScanned({ data: barcodes[0].data });
        } else {
          alert("No QR code found in the selected image.");
          setScanned(false);
        }
      } catch (error) {
        console.error("Error scanning image:", error);
        alert("Error scanning QR code from image");
        setScanned(false);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View>
        <Text>Camera access is required</Text>
        <Button
          title="Grant Permission"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        />
      </View>
    );
  }

  return (
    <View className="bg-color1 h-screen relative">
      <CameraView
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        className="flex-1"
        style={{ height: "100%" }}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={() => router.push("/home")}
          className="absolute top-5 right-5 z-10 opacity-80">
          <CloseIcon stroke="white" width={30} height={30}/>
        </TouchableOpacity>

        {/* Blur overlay with hole */}
        <View className="absolute top-0 left-0 right-0 bottom-0">
          {/* Top blur */}
          <View
            className="h-[25vh] bg-black opacity-50" // Matches your mt-20
          >
          </View>

          {/* Middle section */}
          <View className="flex-row h-64">
            {" "}
            {/* Matches your scanning area height */}
            {/* Left blur */}
            <View className="flex-1 bg-black opacity-50" />
            {/* Clear area (matches your w-64) */}
            <View className="w-64" />
            {/* Right blur */}
            <View className="flex-1 bg-black opacity-50" />
          </View>

          {/* Bottom blur */}
          <View className="flex-1 bg-black opacity-50" />
        </View>

        {/* Border elements */}
        <View className="mt-[25vh]">
          <View className="h-64 w-64 relative mx-auto">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-color1" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-color1" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-color1" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-color1" />
          </View>
        </View>

        {/* Upload button */}
        <TouchableOpacity onPress={handleImageUpload} className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
          <View className="items-center justify-center">
            <UploadIcon width={51} height={51} />
            <Text className="text-white mx-auto mt-2 text-[10px]">UPLOAD QR</Text>
          </View>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={isProcessing}
          animationType="fade"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-lg items-center">
              <ActivityIndicator size="large" color="#3D12FA" />
              <Text className="mt-3 text-sm font-medium">Processing QR Code...</Text>
            </View>
          </View>
        </Modal>
      </CameraView>
    </View>
  );
};

export default QrScannerScreen;