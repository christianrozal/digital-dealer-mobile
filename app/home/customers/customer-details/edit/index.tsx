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
import { launchImageLibrary } from 'react-native-image-picker';
import { setUserData } from '@/lib/store/userSlice';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';
import { databaseId, customersId, projectId, bucketId } from '@/lib/appwrite';
import { ID } from 'appwrite';

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

  // Update customer information in database
  const handleUpdateCustomer = async () => {
    setLoading(true);
    try {
      const appwriteCustomer = customerData as AppwriteCustomer;

      // Check if customerData is valid
      if (!appwriteCustomer || !appwriteCustomer.$id) {
        Alert.alert('Error', 'No customer ID found');
        return;
      }

      // Log the currentScan to check its value
      console.log('Current Scan:', currentScan);

      // Check if currentScan is valid
      if (!currentScan || !currentScan.customers) {
        Alert.alert('Error', 'No current scan or customer data found');
        return;
      }

      // Ensure customers is valid before accessing its properties
      const scanCustomer = currentScan.customers as AppwriteCustomer;
      if (!scanCustomer || !scanCustomer.$id) {
        Alert.alert('Error', 'No customer ID found in current scan');
        return;
      }

      // Update Redux state first
      const updatedScans = userData?.scans?.map((scan) => {
        // Ensure scan.customers exists before accessing $id
        if (scan.customers && (scan.customers as AppwriteCustomer).$id === appwriteCustomer.$id) {
          return {
            ...scan,
            customers: {
              ...scan.customers,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              profileImage: appwriteCustomer.profileImage,
              profileImageId: appwriteCustomer.profileImageId
            }
          };
        }
        return scan;
      }) || [];

      // Update Redux store first
      if (userData) {
        dispatch(setUserData({
          ...userData,
          scans: updatedScans as Scan[],
        }));
      }

      // Then update database
      await databases.updateDocument(
        databaseId,
        customersId,
        appwriteCustomer.$id,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profileImage: appwriteCustomer.profileImage,
          profileImageId: appwriteCustomer.profileImageId
        }
      );

      Alert.alert('Success', 'Customer profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace("/home/customers/customer-details");
          }
        }
      ]);

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

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;

      if (result.assets && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop();
        const fileType = result.assets[0].type || 'image/jpeg';

        const appwriteCustomer = customerData as AppwriteCustomer;

        // Convert image to blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Delete old profile image if it exists
        if (appwriteCustomer.profileImageId) {
          try {
            await storage.deleteFile(bucketId, appwriteCustomer.profileImageId);
          } catch (error) {
            console.log('No previous image to delete or error deleting:', error);
          }
        }

        // Create an object that matches the expected type
        const fileData = {
          name: fileName || 'profile.jpg',
          type: fileType,
          size: blob.size,
          uri: uri // Use uri or another appropriate value for uri
        };

        // Upload new image
        const uploadResponse = await storage.createFile(
          bucketId,
          ID.unique(),
          fileData
        );

        // Get preview URL
        const previewUrl = storage.getFilePreview(
          bucketId,
          uploadResponse.$id,
          500,
          500
        );

        // Update Redux state first
        const updatedScans = userData?.scans?.map((scan) => {
          const scanCustomer = scan?.customers as AppwriteCustomer;
          if (scanCustomer?.$id === appwriteCustomer.$id) {
            return {
              ...scan,
              customers: {
                ...scanCustomer,
                profileImage: previewUrl.toString(),
                profileImageId: uploadResponse.$id
              }
            };
          }
          return scan;
        }) || [];

        // Update Redux first
        dispatch(setUserData({
          ...userData,
          scans: updatedScans
        }));
        dispatch(setCustomerUpdateSuccess(true));

        // Then update database
        await databases.updateDocument(
          databaseId,
          customersId,
          appwriteCustomer.$id,
          {
            profileImage: previewUrl.toString(),
            profileImageId: uploadResponse.$id
          }
        );

        Alert.alert('Success', 'Profile image updated successfully!');
        router.replace("/home/customers/customer-details");
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const renderProfileImage = () => {
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

        <View className=' px-4'>
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