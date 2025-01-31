import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import CameraIcon from '@/components/svg/cameraIcon';
import { Client, Storage, ID, Databases } from 'react-native-appwrite';
import * as ImagePicker from 'react-native-image-picker';
import { setConsultant } from '@/store/consultantSlice';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import CheckIcon from '@/components/svg/checkIcon';

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6780c774003170c68252');

const storage = new Storage(client);
const databases = new Databases(client);
const BUCKET_ID = '679a6a24003b707de5c0';
const DATABASE_ID = "67871d61002bf7e6bc9e";
const COLLECTION_ID = "678724210037c2b3b179";
const SCANS_COLLECTION_ID = "67960db00004d6153713";

const AddCustomerScreen = () => {
    const consultant = useSelector((state: RootState) => state.consultant.data);
     const { data: allConsultantData } = useSelector((state: RootState) => state.consultant);

    const dispatch = useDispatch();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
      const [showSuccessMessage, setShowSuccessMessage] = useState(false);
        const translateY = useSharedValue(-40); // Initial position above view
    const animationDuration = 300;
    const holdDuration = 2000;

    // Handle text input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Create new customer information in database
    const handleCreateCustomer = async () => {
         if (!consultant || !consultant.$id) {
             Alert.alert('Error', 'Consultant data not found. Please try again.');
            return;
        }
        setLoading(true);
        try {
            // Upload new image
            let imageId;
 let previewUrlString;

 if (profileImage) {
    const fileName = profileImage.split('/').pop();
    const fileType = 'image/jpeg';
    const response = await fetch(profileImage);
    const blob = await response.blob();

    // Create the file object that Appwrite expects
    const file = {
    name: fileName || 'profile.jpg',
        type: fileType,
        size: blob.size,
        uri: profileImage
        }

        const uploadResponse = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
        );
        // Get preview URL
        previewUrlString = storage.getFilePreview(
            BUCKET_ID,
            uploadResponse.$id,
            500,
            500
        ).toString();
          imageId = uploadResponse.$id
    }   

            // Create a new customer document
            const newCustomerDocument = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                     'profile-icon': previewUrlString,
                      'profileImageId': imageId
                }
            );


            // Create a new scan document
           const newScanDocument = await databases.createDocument(
                DATABASE_ID,
                SCANS_COLLECTION_ID,
                ID.unique(),
                {
                     'consultants': consultant.$id,
                     'customers': newCustomerDocument.$id,
                     'interest_status': 'Cold',
                      'interested_in': 'Buying',
                      'rooftops': 'Lennock Volkswagen',
                    
                }
            );
         
              const updatedScans = [...(allConsultantData?.scans || []), newScanDocument];
                 // Dispatch the new consultant data
               dispatch(setConsultant({
                ...allConsultantData,
                scans: updatedScans,
              }));

            // Show success message and animation
             setShowSuccessMessage(true);
             translateY.value = withTiming(20, { duration: animationDuration, easing: Easing.ease }, () => {
                // After slide down, hold for a second, and then animate out
                setTimeout(() => {
                  translateY.value = withTiming(-40, { duration: animationDuration, easing: Easing.ease }, () => {
                      runOnJS(() => setShowSuccessMessage(false))();
                 });
                }, holdDuration);
            });

            Alert.alert('Success', 'New customer created successfully!');
              router.back();

        } catch (error) {
            Alert.alert('Error', 'Failed to create new customer');
            console.error('Create error:', error);
        } finally {
               setLoading(false);
        }
    };

    const getInitials = (name: string | undefined): string => {
        if (!name) return "Us";
        const firstName = name.trim().split(" ")[0] || "";
        if (!firstName) return "Us"
        const firstLetter = firstName[0]?.toUpperCase() || "";
        const secondLetter = firstName[1]?.toLowerCase() || "";
        return `${firstLetter}${secondLetter}`;
    };

    const handleImageUpload = async () => {
        try {
            const result = await ImagePicker.launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
            });

            if (result.didCancel) return;

            if (result.assets && result.assets[0].uri) {
               setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
            console.error('Image upload error:', error);
        }
    };

        const animatedStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateY: translateY.value }]
        }
      })

    return (
     <>
          {showSuccessMessage && (
            <Animated.View style={animatedStyle} className="w-full z-30 absolute">
                <View className="flex-row items-center justify-center gap-3  w-4/5 mx-auto bg-white rounded-lg p-3 border border-color9" style={{ boxShadow: "0px 4px 10px 0px rgba(7, 170, 48, 0.25)"}}>
                    <CheckIcon /> <Text className='text-[#018221] text-sm'>Customer Created</Text>
                </View>
          </Animated.View>
         )}
         <View className="pt-7 px-7 pb-7 h-screen justify-between gap-5">
            <View>
                {/* Header */}
                <View className="flex-row w-full justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <BackArrowIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/home")}>
                        <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                    </TouchableOpacity>
                    <View style={{ width: 18 }} />
                </View>

                <View className=' px-4'>
                    <Text className="text-2xl font-semibold mt-10">Add New Customer</Text>
                    <TouchableOpacity className='mt-10 mx-auto' onPress={handleImageUpload}>
                        <View
                            className="bg-color1 rounded-full flex items-center justify-center"
                            style={{ width: 100, height: 100 }}
                        >
                             {(profileImage) ? (
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
                    label={loading ? "Creating..." : "Create New Customer"}
                    onPress={handleCreateCustomer}
                    disabled={loading}
                    loading={loading} // Pass loading prop for conditional rendering of the activity indicator in the button
                />
            </View>
        </View>
    </>
    );
};

export default AddCustomerScreen;