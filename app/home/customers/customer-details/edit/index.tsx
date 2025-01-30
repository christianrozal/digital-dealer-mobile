import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import CameraIcon from '@/components/svg/cameraIcon';
import { Client, Storage, ID, Databases } from 'react-native-appwrite';
import * as ImagePicker from 'react-native-image-picker';
import { setConsultant } from '@/store/consultantSlice';
import { setCustomerUpdateSuccess } from '@/store/uiSlice';


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

const EditCustomerScreen = () => {
    const customerId = useSelector((state: RootState) => state.customer.selectedCustomer?.$id);
     const { data: allConsultantData} = useSelector(
        (state: RootState) => state.consultant
    );
    const dispatch = useDispatch();
      const [customer, setCustomer] = useState<any>(null);
     const [profileImage, setProfileImage] = useState<string | null>(null);
     const [formData, setFormData] = useState({
          name: customer?.name || '',
         email: customer?.email || '',
          phone: customer?.phone || ''
    });
     const [loading, setLoading] = useState(false);

    useEffect(() => {
         if (allConsultantData?.scans && customerId) {
           const customerFromConsultant = allConsultantData.scans.find(scan => scan.customers?.$id === customerId)?.customers;
           if (customerFromConsultant){
           
              setCustomer(customerFromConsultant)
               setFormData({
                  name: customerFromConsultant?.name || '',
                   email: customerFromConsultant?.email || '',
                    phone: customerFromConsultant?.phone || ''
               })
           }
         }
       }, [allConsultantData, customerId]);


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
             if (!customer?.$id) {
                Alert.alert('Error', 'No customer profile found');
                return;
            }

              // Upload new image if changed
              let imageId = customer.profileImageId;
              let previewUrlString = customer['profile-icon'];

                if (profileImage) {
                  const fileName = profileImage.split('/').pop();
                    const fileType = 'image/jpeg';
                  const response = await fetch(profileImage);
                  const blob = await response.blob();
                   const file = new File([blob], fileName || 'profile.jpg', { type: fileType });
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
               
             // Update the customer record
            const updatedDocument = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                customer.$id,
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    'profile-icon': previewUrlString,
                    'profileImageId': imageId,
                }
            );


             // Find the scan with the current customer id to update it
            const updatedScans = allConsultantData?.scans?.map((scan) => {
                 if (scan.customers?.$id === customer.$id) {
                  return {
                     ...scan,
                      customers: {
                        ...scan.customers,
                        ...updatedDocument,
                      },
                  };
                }
              return scan;
          })

             // Update Redux store
             dispatch(setConsultant({
                ...allConsultantData,
                 scans: updatedScans,
            }));
            dispatch(setCustomerUpdateSuccess(true)); // Trigger success state
            Alert.alert('Success', 'Customer profile updated successfully!');
              router.push('/home/customers/customer-details');
        } catch (error) {
            dispatch(setCustomerUpdateSuccess(false)); // Trigger error state
            Alert.alert('Error', 'Failed to update customer profile');
            console.error('Update error:', error);
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



    return (
       <>
        
        <View className="pt-7 px-7 pb-7 h-screen justify-between gap-5">
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
                                className="bg-color1 rounded-full flex items-center justify-center"
                                style={{ width: 100, height: 100 }}
                            >
                                {(profileImage || customer?.['profile-icon']) ? (
                                    <Image
                                        source={{ uri: profileImage || customer['profile-icon'] }}
                                        style={{ width: 100, height: 100, borderRadius: 50 }}
                                    />
                                ) : (
                                        <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                          {getInitials(customer?.name)}
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
                    label={loading ? "Updating..." : "Update Customer Profile"}
                    onPress={handleUpdateCustomer}
                    disabled={loading}
                  loading={loading} // Pass loading prop for conditional rendering of the activity indicator in the button
                />
            </View>
        </View>
     </>
    );
};

export default EditCustomerScreen;