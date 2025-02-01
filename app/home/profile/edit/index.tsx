// screens/EditProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import CameraIcon from '@/components/svg/cameraIcon';
import { Client, Storage, ID, Databases } from 'react-native-appwrite';
import * as ImagePicker from 'react-native-image-picker';
import { setConsultant } from '@/lib/store/consultantSlice';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';


// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6780c774003170c68252');

const storage = new Storage(client);
const databases = new Databases(client);
const BUCKET_ID = '679a6a24003b707de5c0';
const DATABASE_ID = "67871d61002bf7e6bc9e";
const COLLECTION_ID = "6787235d000989f46de3";

const EditProfileScreen = () => {
    const consultant = useSelector((state: RootState) => state.consultant.data);
    const dispatch = useDispatch();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: consultant?.name || '',
        position: consultant?.position || '',
        email: consultant?.email || '',
        phone: consultant?.phone || ''
    });
    const [loading, setLoading] = useState(false);



    // Handle text input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    // Update profile information in database
    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            if (!consultant?.$id) {
                Alert.alert('Error', 'No consultant profile found');
                return;
            }

            const updatedDocument = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                consultant.$id,
                {
                    name: formData.name,
                    position: formData.position,
                    email: formData.email,
                    phone: formData.phone
                }
            );

            // Update Redux store
            dispatch(setConsultant({
                ...consultant,
                ...formData
            }));

                dispatch(setCustomerUpdateSuccess(true));
            // Navigate to profile screen
            router.push("/home/profile");

        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
            console.error('Update error:', error);
           dispatch(setCustomerUpdateSuccess(false));

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
                const uri = result.assets[0].uri;
                const fileName = uri.split('/').pop();
                const fileType = result.assets[0].type || 'image/jpeg';
                const fileSize = result.assets[0].fileSize || 0;
            
                // Create the file object that Appwrite expects
                const file = {
                    name: fileName || 'profile.jpg',
                    type: fileType,
                    size: fileSize,
                    uri: uri
                }
            
                // Delete previous image if exists - with error handling
                if (consultant?.profileImageId) {
                try {
                  await storage.deleteFile(BUCKET_ID, consultant.profileImageId);
                } catch (deleteError) {
                    console.log('Previous image not found, proceeding anyway:', deleteError);
                    // Optional: Update state to remove missing image reference
                    dispatch(setConsultant({
                        ...consultant,
                        profileImageId: undefined
                    }));
                }
                }
            
                // Upload new image
                const uploadResponse = await storage.createFile(
                    BUCKET_ID,
                    ID.unique(),
                    file
                );
                // Get preview URL
                const previewUrl = storage.getFilePreview(
                    BUCKET_ID,
                    uploadResponse.$id,
                    500,
                    500
                );
                setProfileImage(previewUrl.toString());
            
            
                // Update the consultant document with both URL and image ID
                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        consultant.$id,
                        {
                            'profile-icon': previewUrl.toString(),
                            'profileImageId': uploadResponse.$id
                        }
                    );
            
            
                     // Dispatch the updated consultant data
                    dispatch(setConsultant({
                        ...consultant,
                        'profile-icon': previewUrl.toString(),
                        profileImageId: uploadResponse.$id
                    }));
                dispatch(setCustomerUpdateSuccess(true));
                router.push("/home/profile");
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
            console.error('Image upload error:', error);
           dispatch(setCustomerUpdateSuccess(false));
        }
    };


    return (
        <View className="pt-7 px-7 pb-7 h-screen justify-between gap-5">
            <View>
                {/* Header */}
                <View className="flex-row w-full justify-between items-center">
                    <TouchableOpacity onPress={() => router.push("/home/profile")}>
                        <BackArrowIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/home")}>
                        <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                    </TouchableOpacity>
                    <View style={{ width: 18 }} />
                </View>

                <View className=' px-4'>
                    <Text className="text-2xl font-semibold mt-10">Edit Profile</Text>
                    <TouchableOpacity className='mt-10 mx-auto' onPress={handleImageUpload}>
                        <View
                            className="bg-color1 rounded-full flex items-center justify-center"
                            style={{ width: 100, height: 100 }}
                        >
                            {(profileImage || consultant?.['profile-icon']) ? (
                                <Image
                                    source={{ uri: profileImage || consultant['profile-icon'] }}
                                    style={{ width: 100, height: 100, borderRadius: 50 }}
                                />
                            ) : (
                                    <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                        {getInitials(consultant?.name)}
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
                            placeholder="Position"
                            value={formData.position}
                            onChangeText={(text) => handleInputChange('position', text)}
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
                    label={loading ? "Updating..." : "Update Profile"}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                    loading={loading} // Pass loading prop for conditional rendering of the activity indicator in the button
                />
            </View>
        </View>
    );
};

export default EditProfileScreen;