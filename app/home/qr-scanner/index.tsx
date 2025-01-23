import { useState, useEffect } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import { CameraView, Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/store/userSlice";
import * as appwrite from "react-native-appwrite";

// Appwrite client setup
const client = new appwrite.Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const databases = new appwrite.Databases(client);
const DATABASE_ID = "67871d61002bf7e6bc9e";
const CUSTOMERS_COLLECTION_ID = "678724210037c2b3b179";

const QrScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        data
      );
      dispatch(setCustomer(response));
      router.push("/home/qr-scanner/customer-assignment");
    } catch (err) {
      console.error("Error fetching customer data:", err);
      alert("Invalid QR code or customer not found");
    } finally {
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
        {/* Blur overlay with hole */}
        <View className="absolute top-0 left-0 right-0 bottom-0">
          {/* Top blur */}
          <View
            className="h-20 bg-black opacity-50" // Matches your mt-20
          />

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

        {/* Your original border elements */}
        <View className="mt-20">
          <View className="h-64 w-64 relative mx-auto">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-color1" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-color1" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-color1" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-color1" />
          </View>
        </View>

        {/* Your original upload button */}
        <TouchableOpacity onPress={handleImageUpload}>
          <Image
            source={require("@/assets/images/upload.svg")}
            style={{ width: 51, height: 51 }}
            className="mt-16 mx-auto"
          />
        </TouchableOpacity>
      </CameraView>
    </View>
  );
};

export default QrScannerScreen;
