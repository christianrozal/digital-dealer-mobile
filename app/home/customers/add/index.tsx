import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import CameraIcon from '@/components/svg/cameraIcon';
import * as ImagePicker from 'expo-image-picker';
import { ID } from 'react-native-appwrite';
import { 
  storage, 
  databases, 
  databaseId, 
  customersId, 
  bucketId, 
  scansId,
  dealershipLevel1Id,
  dealershipLevel2Id,
  dealershipLevel3Id
} from '@/lib/appwrite';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';
import { setUserData } from '@/lib/store/userSlice';

const AddCustomerScreen = () => {
  // Use user data from state
  const user = useSelector((state: RootState) => state.user.data);
  const dealershipLevel2Id = useSelector((state: RootState) => state.current.currentDealershipLevel2Id);
  const dealershipLevel1Id = useSelector((state: RootState) => state.current.currentDealershipLevel1Id);
  const dealershipLevel3Id = useSelector((state: RootState) => state.current.currentDealershipLevel3Id || null);
  
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create new customer document and related scan document in the database
  const handleCreateCustomer = async () => {
    if (!user || !user.$id) {
      console.log('User data not found. Please try again.');
      return;
    }
    setLoading(true);
    try {
      let imageId;
      let previewUrlString;

      // Upload new image if available
      if (profileImage) {
        const fileName = profileImage.split('/').pop();
        const fileType = 'image/jpeg';
        const response = await fetch(profileImage);
        const blob = await response.blob();

        // Create file object for Appwrite upload
        const file = {
          name: fileName || 'profile.jpg',
          type: fileType,
          size: blob.size,
          uri: profileImage,
        };

        const uploadResponse = await storage.createFile(
          bucketId,
          ID.unique(),
          file
        );
        // Get preview URL for the uploaded image
        previewUrlString = storage
          .getFilePreview(bucketId, uploadResponse.$id, 500, 500)
          .toString();
        imageId = uploadResponse.$id;
      }

      // Create a new customer document; field names remain as originally intended.
      const newCustomerDocument = await databases.createDocument(
        databaseId,
        customersId,
        ID.unique(),
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profileImage: previewUrlString,
          profileImageId: imageId,
        }
      );

      // Create a new scan document including dealership information.
      const newScanDocument = await databases.createDocument(
        databaseId,
        scansId,
        ID.unique(),
        {
          users: user.$id,
          customers: newCustomerDocument.$id,
          interestStatus: 'Hot',
          interestedIn: 'Buying',
          dealershipLevel2: dealershipLevel2Id,
          dealershipLevel1: dealershipLevel1Id,
          dealershipLevel3: dealershipLevel3Id,
        }
      );

      // Update the user slice with the new scan record (which links the new customer)
      dispatch(
        setUserData({
          ...user,
          scans: [newScanDocument, ...(user.scans ?? [])],
        })
      );

      // Dispatch the UI flag so that SuccessAnimation is shown in the Customers screen.
      dispatch(setCustomerUpdateSuccess(true));
      console.log('New customer created successfully!');
      router.back();

    } catch (error) {
      console.log('Failed to create new customer', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return 'Us';
    const firstName = name.trim().split(' ')[0] || '';
    if (!firstName) return 'Us';
    const firstLetter = firstName[0]?.toUpperCase() || '';
    const secondLetter = firstName[1]?.toLowerCase() || '';
    return `${firstLetter}${secondLetter}`;
  };

  const handleImageUpload = async () => {
    try {
      // Request media library permissions using Expo ImagePicker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access media library is required!');
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) return;
      
      if (result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Failed to pick an image', error);
    }
  };

  return (
    <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <BackArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/home')}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View style={{ width: 18 }} />
        </View>

        <View className="px-4">
          <Text className="text-2xl font-semibold mt-10">Add New Customer</Text>
          <TouchableOpacity className="mt-10 mx-auto" onPress={handleImageUpload}>
            <View className="bg-color1 rounded-full flex items-center justify-center" style={{ width: 100, height: 100 }}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                  {getInitials(formData.name)}
                </Text>
              )}
            </View>
            <View className="ml-auto -mt-5">
              <CameraIcon />
            </View>
          </TouchableOpacity>
          <View className="gap-3 mt-10">
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
      <View className="px-4">
        <ButtonComponent
          label={loading ? 'Creating...' : 'Create New Customer'}
          onPress={handleCreateCustomer}
          disabled={loading}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default AddCustomerScreen;