import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import CameraIcon from '@/components/svg/cameraIcon';
import { storage, databases } from '@/lib/appwrite';
import * as ImagePicker from 'expo-image-picker';
import { setUserData } from '@/lib/store/userSlice';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';
import { databaseId, customersId, bucketId } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';

interface AppwriteCustomer {
  $id: string;
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  profileImageId?: string;
}

interface Customer {
  id: string;
  $id: string;
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  interestStatus?: string;
  interestedIn?: string;
  $collectionId?: string;
  $databaseId?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
}

interface Scan {
  $id: string;
  $createdAt: string;
  customers: Customer;
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
  scanCount?: number;
}

const EditCustomerScreen = () => {
  const currentCustomerId = useSelector((state: RootState) => state.current.currentCustomerId);
  const currentScanId = useSelector((state: RootState) => state.current.currentScanId);
  const userData = useSelector((state: RootState) => state.user.data);

  // Find the current scan and customer data from userSlice
  const currentScan = userData?.scans?.find(scan => scan.$id === currentScanId);
  const customerData = currentScan?.customers;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [newImage, setNewImage] = useState<{ uri: string } | null>(null);

  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || ''
      });

      console.log('Edit Screen Data:', {
        currentScanId,
        currentCustomerId,
        customerData
      });
    }
  }, [customerData, currentScanId, currentCustomerId]);

  if (!currentScan || !customerData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No customer data available.</Text>
      </View>
    );
  }

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Modified handleImageUpload: Only pick the image and store its URI.
  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Store the image URI to state for later update.
        setNewImage({ uri: asset.uri });
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Modified handleUpdateCustomer: Upload the image if one has been selected.
  const handleUpdateCustomer = async () => {
    setLoading(true);
    try {
      const appwriteCustomer = customerData as AppwriteCustomer;

      if (!appwriteCustomer || !appwriteCustomer.$id) {
        Alert.alert('Error', 'No customer ID found');
        return;
      }

      let updatedProfileImage = appwriteCustomer.profileImage;
      let updatedProfileImageId = appwriteCustomer.profileImageId;

      // If a new image was picked, process its upload.
      if (newImage) {
        const uri = newImage.uri;
        const fileName = uri.split('/').pop() || 'profile.jpg';
        const fileType = 'image/jpeg';
        const response = await fetch(uri);
        const blob = await response.blob();

        // Optionally delete the previous image if it exists.
        if (appwriteCustomer.profileImageId) {
          try {
            await storage.deleteFile(bucketId, appwriteCustomer.profileImageId);
          } catch (error) {
            console.log('No previous image to delete or error deleting:', error);
          }
        }

        const fileData = { name: fileName, type: fileType, size: blob.size, uri: uri };
        const uploadResponse = await storage.createFile(bucketId, ID.unique(), fileData);
        const previewUrl = storage.getFilePreview(bucketId, uploadResponse.$id, 500, 500);

        updatedProfileImage = previewUrl.toString();
        updatedProfileImageId = uploadResponse.$id;
      }

      // Update Redux state for the customer image in scans
      const updatedScans = userData?.scans?.map((scan) => {
        if (scan.customers && (scan.customers as AppwriteCustomer).$id === appwriteCustomer.$id) {
          return {
            ...scan,
            customers: {
              ...(scan.customers as AppwriteCustomer),
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              profileImage: updatedProfileImage,
              profileImageId: updatedProfileImageId,
            },
          };
        }
        return scan;
      }) || [];

      if (userData) {
        dispatch(setUserData({
          ...userData,
          scans: updatedScans as Scan[],
        }));
      }

      // Update the customer document in the database, including image updates.
      await databases.updateDocument(
        databaseId,
        customersId,
        appwriteCustomer.$id,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profileImage: updatedProfileImage,
          profileImageId: updatedProfileImageId,
        }
      );
      
      dispatch(setCustomerUpdateSuccess(true));
      router.replace("/home/customers/customer-details");
      
      // Clear the pending new image after update.
      setNewImage(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      Alert.alert('Error', 'Failed to update customer profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "CU";
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[1] || "";
    
    if (!firstName) return "CU";
    
    if (lastName) {
      return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
    }
    
    return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
  };

  // Update renderProfileImage to show the new image if present.
  const renderProfileImage = () => {
    // Show the new image if selected.
    if (newImage) {
      return (
        <Image
          source={{ uri: newImage.uri }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      );
    }
    const profileImage = (customerData as AppwriteCustomer).profileImage;
    if (profileImage && profileImage !== 'black') {
      return (
        <Image
          source={{ uri: profileImage }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      );
    }
    return (
      <Text className="text-white font-bold" style={{ fontSize: 30 }}>
        {getInitials(customerData.name || '')}
      </Text>
    );
  };

  return (
    <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.push("/home/customers/customer-details")}>
            <BackArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View style={{ width: 18 }} />
        </View>

        <View className='px-4'>
          <Text className="text-2xl font-semibold mt-10">Edit Customer Profile</Text>
          <TouchableOpacity className='mt-10 mx-auto' onPress={handleImageUpload}>
            <View
              className="bg-color1 rounded-full items-center justify-center"
              style={{ width: 100, height: 100 }}
            >
              {renderProfileImage()}
            </View>
            <View className='ml-auto -mt-5'>
              <CameraIcon />
            </View>
          </TouchableOpacity>
          <View className='gap-3 mt-10'>
            <TextInput
              className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            <TextInput
              className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>
      <View>
        <ButtonComponent
          label={loading ? "Updating..." : "Update Customer"}
          onPress={handleUpdateCustomer}
          disabled={loading}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default EditCustomerScreen;