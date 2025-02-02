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
import { Client, ID } from 'react-native-appwrite';
import * as ImagePicker from 'react-native-image-picker';
import { setUserData } from '@/lib/store/userSlice';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';
import { client, databases, storage, databaseId, usersId, bucketId } from '@/lib/appwrite';


const EditProfileScreen = () => {
    const userData = useSelector((state: RootState) => state.user.data);
    const dispatch = useDispatch();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        position: userData?.position || '',
        phone: userData?.phone || ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            if (!userData?.$id) {
                Alert.alert('Error', 'No user profile found');
                return;
            }

            const updatedDocument = await databases.updateDocument(
                databaseId,
                usersId,
                userData.$id,
                formData
            );

            dispatch(setUserData({
                ...userData,
                ...formData
            }));

            dispatch(setCustomerUpdateSuccess(true));
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
            if (!userData?.$id) {
                Alert.alert('Error', 'No user profile found');
                return;
            }

            const result = await ImagePicker.launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
            });

            if (result.didCancel) return;

            if (result.assets && result.assets[0].uri) {
                const uri = result.assets[0].uri;
                const fileName = uri.split('/').pop();
                const fileType = result.assets[0].type || 'image/jpeg';

                // Convert image to blob
                const response = await fetch(uri);
                const blob = await response.blob();

                // Delete previous image if exists - with error handling
                if (userData?.profileImageId) {
                    try {
                        await storage.deleteFile(bucketId, userData.profileImageId);
                    } catch (deleteError) {
                        console.log('Previous image not found, proceeding anyway:', deleteError);
                    }
                }

                // Upload new image
                const file = new File([blob], fileName || 'profile.jpg', { type: fileType });
                const uploadResponse = await storage.createFile(
                    bucketId,
                    ID.unique(),
                    file
                );

                // Get preview URL
                const previewUrl = storage.getFilePreview(
                    bucketId,
                    uploadResponse.$id,
                    500,
                    500
                );
                setProfileImage(previewUrl.toString());

                // Update Redux state first
                const newUserData = {
                    ...userData,
                    profileImage: previewUrl.toString(),
                    profileImageId: uploadResponse.$id
                };
                
                dispatch(setUserData(newUserData));
                dispatch(setCustomerUpdateSuccess(true));

                // Then update the database
                await databases.updateDocument(
                    databaseId,
                    usersId,
                    userData.$id,
                    {
                        profileImage: previewUrl.toString(),
                        profileImageId: uploadResponse.$id
                    }
                );

                Alert.alert('Success', 'Profile image updated successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace("/home/profile");
                        }
                    }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
            console.error('Image upload error:', error);
        }
    };

    return (
        <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
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

                <View className='px-4'>
                    <Text className="text-2xl font-semibold mt-10">Edit Profile</Text>
                    <TouchableOpacity className='mt-10 mx-auto' onPress={handleImageUpload}>
                        <View
                            className="bg-color1 rounded-full flex items-center justify-center"
                            style={{ width: 100, height: 100 }}
                        >
                            {(profileImage || userData?.profileImage) ? (
                                <Image
                                    source={{ uri: profileImage || userData?.profileImage || '' }}
                                    style={{ width: 100, height: 100, borderRadius: 50 }}
                                />
                            ) : (
                                <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                    {getInitials(userData?.name)}
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
                    loading={loading}
                />
            </View>
        </View>
    );
};

export default EditProfileScreen;