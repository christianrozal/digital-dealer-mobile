// screens/EditProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import * as ImagePicker from 'expo-image-picker';
import CameraIcon from '@/components/svg/cameraIcon';
import { ID } from 'react-native-appwrite';
import { setUserData } from '@/lib/store/userSlice';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';
import { databases, storage, databaseId, usersId, bucketId } from '@/lib/appwrite';

const EditProfileScreen = () => {
    const userData = useSelector((state: RootState) => state.user.data);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: userData?.name || ''
    });
    const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);
    const [pendingProfileImage, setPendingProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
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

            let payload: any = {
                name: String(formData.name),
            };

            if (pendingProfileImage) {
                const { uri } = pendingProfileImage;
                const fileName = uri.split('/').pop() || 'profile.jpg';
                const fileType = 'image/jpeg';
                const response = await fetch(uri);
                const blob = await response.blob();

                if (userData?.profileImageId) {
                    try {
                        await storage.deleteFile(bucketId, userData.profileImageId);
                    } catch (deleteError) {
                        console.log('Error deleting previous image:', deleteError);
                    }
                }

                const fileData = {
                    name: fileName,
                    type: fileType,
                    size: blob.size,
                    uri: uri,
                };

                const uploadResponse = await storage.createFile(
                    bucketId,
                    ID.unique(),
                    fileData
                );

                const previewUrl = storage.getFilePreview(
                    bucketId,
                    uploadResponse.$id,
                    500,
                    500
                );

                payload.profileImage = previewUrl.toString();
                payload.profileImageId = uploadResponse.$id;
            }

            await databases.updateDocument(
                databaseId,
                usersId,
                userData.$id,
                payload
            );

            dispatch(setUserData({ ...userData, ...payload }));
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
        const parts = name.trim().split(" ");
        const initials = parts.map(part => part[0]).join("");
        return initials.toUpperCase().slice(0, 2);
    };

    const handleImageUpload = async () => {
        try {
            if (!userData?.$id) {
                Alert.alert('Error', 'No user profile found');
                return;
            }

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
                setLocalProfileImage(asset.uri);
                setPendingProfileImage(asset);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select image');
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
                            {(localProfileImage || userData?.profileImage) ? (
                                <Image
                                    source={{ uri: localProfileImage || userData?.profileImage || '' }}
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