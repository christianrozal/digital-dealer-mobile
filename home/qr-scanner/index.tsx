import { useState, useEffect } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import { CameraView, Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { setConsultant } from "@/store/consultantSlice";
import * as appwrite from "react-native-appwrite";
import CloseIcon from "@/components/svg/closeIcon";
import { setSelectedCustomer } from "@/lib/store/customerSlice"; // Import setSelectedCustomer
import { setCurrentScan } from "@/lib/store/currentSlice"; // Import setCurrentScan action

// Appwrite client setup
const client = new appwrite.Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const databases = new appwrite.Databases(client);
const DATABASE_ID = "67871d61002bf7e6bc9e";
const SCANS_COLLECTION_ID = "67960db00004d6153713";
const CUSTOMERS_COLLECTION_ID = "678724210037c2b3b179"; // Add Customers collection ID

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
  const dispatch = useDispatch(); // Initialize dispatch
  const consultant = useSelector((state: any) => state.consultant.data);

    const excludeSystemProperties = (obj: any) => {
        const result:any = {}
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
    setScanned(true);
    try {
      const customerId = data;
      const consultantId = consultant?.$id;

      if (!consultantId) {
        throw new Error("Consultant not found in Redux store");
      }

      // Fetch customer data
      const customerResponse = await databases.getDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customerId
      );

      if (!customerResponse) {
        throw new Error("Customer not found in database");
      }

       // Map Appwrite Document to Customer object
      const customer: Customer = {
        id: customerResponse.$id,
        ...excludeSystemProperties(customerResponse)
      };


      // Dispatch customer data to Redux store
      dispatch(setSelectedCustomer(customer));
      console.log("Customer data added to store:", customer); // ADDED CONSOLE LOG

      // Create new scan document
      const scanDocument = await databases.createDocument(
        DATABASE_ID,
        SCANS_COLLECTION_ID,
        appwrite.ID.unique(),
        {
          customers: customerId,
          consultants: consultantId,
          follow_up_date: new Date().toISOString(),
          interest_status: "Hot",
          interested_in: "Buying",
        }
      );

      // Dispatch the new scan ID to currentSlice
      dispatch(setCurrentScan(scanDocument.$id)); // Dispatch setCurrentScan with the new scan ID
      console.log("Dispatched currentScan ID to store:", scanDocument.$id); // ADDED CONSOLE LOG

      // Update consultant in Redux store
      const updatedConsultant = {
        ...consultant,
        scans: consultant.scans ? [...consultant.scans, scanDocument] : [scanDocument] // Add the new scanDocument to the array
      };
      dispatch(setConsultant(updatedConsultant));

      console.log("Updated consultant data:", updatedConsultant);
      router.push("/home/customers/customer-assignment");
    } catch (err) {
      console.error("Error processing scan:", err);
      alert("Failed to process QR code");
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

        {/* Upload button */}
        <View className="absolute top-16 left-1/2 -translate-x-1/2 z-10"><Text className="text-white text-xl">QR Scanner</Text></View>

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
        <TouchableOpacity onPress={handleImageUpload}>
          <Image
            source={require("@/assets/images/upload.svg")}
            style={{ width: 51, height: 51 }}
            className="mt-16 mx-auto"
          />
        </TouchableOpacity>
        <Text className="text-white mx-auto mt-2 text-[10px]">UPLOAD QR</Text>
      </CameraView>
    </View>
  );
};

export default QrScannerScreen;