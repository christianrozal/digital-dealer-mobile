import { useState, useEffect } from "react";
import { Button, Text, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from "react-native";
import { CameraView, Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import * as appwrite from "react-native-appwrite";
import CloseIcon from "@/components/svg/closeIcon";
import { setCurrentScanId, setCurrentCustomerId } from '@/lib/store/currentSlice';
import { databases, databaseId, scansId } from '@/lib/appwrite';
import UploadIcon from "@/components/svg/uploadIcon";
import { addUserScan } from '@/lib/store/userSlice';
import { addScan } from "@/lib/store/scanSlice";

const QrScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.data);
  const currentDealershipLevel1Id = useSelector((state: RootState) => state.current.currentDealershipLevel1Id);
  const currentDealershipLevel2Id = useSelector((state: RootState) => state.current.currentDealershipLevel2Id);
  const currentDealershipLevel3Id = useSelector((state: RootState) => state.current.currentDealershipLevel3Id);
  const currentUserId = useSelector((state: RootState) => state.current.currentUserId);

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
      const customerId = data;

      if (!currentUserId) {
        throw new Error("User not found in Redux store");
      }

      // Create new scan document with specified attributes
      const scanDocument = await databases.createDocument(
        databaseId,
        scansId,
        appwrite.ID.unique(),
        {
          users: currentUserId,
          customers: customerId,
          interestStatus: "Hot",
          interestedIn: "Buying",
          followUpDate: null,
          dealershipLevel1: currentDealershipLevel1Id,
          dealershipLevel2: currentDealershipLevel2Id,
          dealershipLevel3: currentDealershipLevel3Id,
        }
      );

      // Add the new scan to userSlice
      dispatch(addUserScan(scanDocument));
      console.log("Added scan to userSlice:", scanDocument);

      // Add the new scan to scanSlice
      dispatch(addScan(scanDocument));
      console.log("Added scan to scanSlice:", scanDocument);

      // Update current states
      dispatch(setCurrentScanId(scanDocument.$id));
      dispatch(setCurrentCustomerId(customerId));
      console.log("Current Scan ID:", scanDocument.$id);
      console.log("Current Customer ID:", customerId);

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const barcodes = await Camera.scanFromURLAsync(result.assets[0].uri, ["qr", "pdf417"]);

        if (barcodes.length > 0) {
          handleBarcodeScanned({ data: barcodes[0].data });
        } else {
          Alert.alert("Error", "No QR code found in the selected image.");
          setScanned(false);
        }
      } catch (error) {
        console.error("Error scanning image:", error);
        Alert.alert("Error", "Failed to scan QR code from image");
        setScanned(false);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="mb-4">Camera access is required</Text>
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
        style={{ height: '100%' }}
      >
        <TouchableOpacity
          onPress={() => router.push("/home")}
          className="absolute top-5 right-5 z-10 opacity-50">
          <CloseIcon stroke="white" width={30} height={30}/>
        </TouchableOpacity>

        <View className="absolute top-0 left-0 right-0 bottom-0">
          <View className="h-[25vh] bg-black opacity-50" />
          <View className="flex-row h-64">
            <View className="flex-1 bg-black opacity-50" />
            <View className="w-64" />
            <View className="flex-1 bg-black opacity-50" />
          </View>
          <View className="flex-1 bg-black opacity-50" />
        </View>

        <View className="mt-[25vh]">
          <View className="h-64 w-64 relative mx-auto">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-color1" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-color1" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-color1" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-color1" />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleImageUpload} 
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10"
        >
          <View className="items-center justify-center">
            <UploadIcon width={51} height={51} />
            <Text className="text-white mx-auto mt-2 text-[10px]">UPLOAD QR</Text>
          </View>
        </TouchableOpacity>
      </CameraView>
      {/* Overlay ActivityIndicator when processing */}
      {isProcessing && (
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

export default QrScannerScreen;