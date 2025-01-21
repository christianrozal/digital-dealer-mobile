import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as appwrite from "react-native-appwrite";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/store/userSlice"; // Adjust the path if needed
import { router } from "expo-router";

// Initialize Appwrite client (move this outside the component for better performance)
const client = new appwrite.Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("6780c774003170c68252"); // Replace with your project ID

const databases = new appwrite.Databases(client);
const DATABASE_ID = "67871d61002bf7e6bc9e"; // Replace with your database ID
const CUSTOMERS_COLLECTION_ID = "678724210037c2b3b179"; // Replace with your collection ID

export default function QrScanner() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!scannedData) {
      setScannedData(data);
      console.log("Scanned QR Code (Customer ID):", data);
      fetchCustomerData(data);
    }
  };

  const fetchCustomerData = async (customerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customerId
      );
      console.log("Customer Data:", response);
      dispatch(setCustomer(response)); // Dispatch the action to update Redux store
      router.push("/home/qr-scanner/customer-assignment"); // Navigate after successful fetch
    } catch (err: any) {
      console.error("Error fetching customer data:", err);
      setError("Failed to fetch customer data.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Fetching Customer Data...</Text>
        </View>
      )}

      {error && (
        <View style={styles.infoContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Scan Again" onPress={resetScanner} />
        </View>
      )}

      {scannedData && !isLoading && !error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Scanned Customer ID: {scannedData}
          </Text>
          <Text style={styles.infoText}>Fetching customer details...</Text>
          <Button title="Scan Again" onPress={resetScanner} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loadingText: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
  },
  infoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 8,
    color: "red",
    textAlign: "center",
  },
});
