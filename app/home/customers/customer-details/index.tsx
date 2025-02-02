import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useCallback, useRef, useEffect, useState } from 'react';
import EmailIcon from '@/components/svg/emailIcon';
import PhoneIcon from '@/components/svg/phoneIcon';
import ButtonComponent from '@/components/button';
import BackArrowIcon from '@/components/svg/backArrow';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import dayjs from 'dayjs';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import EditIcon from '@/components/svg/editIcon';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';
import SuccessAnimation from '@/components/successAnimation'; // Assume this exists

interface Customer {
   id: string;
   name?: string;
   email?: string;
   phone?: string;
   profileImage?: string;
   interestStatus?: string;
   interestedIn?: string;
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

const SelectedCustomerScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const customerUpdateSuccess = useSelector((state: RootState) => state.ui.customerUpdateSuccess);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentCustomerId = useSelector((state: RootState) => state.current.currentCustomer);
  const currentScanId = useSelector((state: RootState) => state.current.currentScan);
  const userData = useSelector((state: RootState) => state.user.data);

  // Find the current scan and customer data from userSlice
  const currentScan = userData?.scans?.find(scan => scan.$id === currentScanId);
  const customerData = currentScan?.customers;

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    if (customerUpdateSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        dispatch(setCustomerUpdateSuccess(false));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [customerUpdateSuccess, dispatch]);

  useEffect(() => {
    console.log('Customer Details Screen Data:', {
      currentScanId,
      currentCustomerId,
      scan: currentScan ? {
        id: currentScan.$id,
        createdAt: currentScan.$createdAt,
        interestStatus: currentScan.interestStatus,
        interestedIn: currentScan.interestedIn,
        customer: currentScan.customers
      } : null
    });
  }, [currentScan, currentScanId, currentCustomerId]);

  if (!currentScan || !customerData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No customer data available.</Text>
      </View>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "Cu";
    const firstName = name.split(" ")[0];
    const cleaned = firstName.replace(/[^a-zA-Z]/g, "");
    return (cleaned.slice(0, 2) || "Cu")
      .split("")
      .map((c, i) => (i === 1 ? c.toLowerCase() : c.toUpperCase()))
      .join("");
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("D MMM YYYY h:mm A");
  };

  return (
    <>
      {showSuccess && <SuccessAnimation message='Customer Profile Updated' />}
      <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
        <View>
          {/* Header */}
          <View className="flex-row w-full justify-between items-center">
            <TouchableOpacity onPress={() => router.push("/home/customers")}>
              <BackArrowIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { router.push("/home") }}>
              <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
            </TouchableOpacity>
            <View className="w-[18px]" />
          </View>
          <View className="px-4">
            <TouchableOpacity 
              className="flex-row gap-1 ml-auto p-2 z-10 mt-8"
              onPress={() => { router.push("/home/customers/customer-details/edit") }}
            >
              <EditIcon /> <Text className="text-xs text-gray-300">Edit...</Text>
            </TouchableOpacity>
            <View
            className="bg-white rounded-md justify-center items-center"
             style={{
                                padding: 20,
                                shadowColor: "#9a9a9a",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 9.4,
                                elevation: 4,
                            }}>
              <View className="bg-color1 rounded-full items-center justify-center w-[100px] h-[100px]">
                {customerData.profileImage ? (
                  <Image
                    source={{ uri: customerData.profileImage }}
                    className="w-[100px] h-[100px] rounded-full"
                  />
                ) : (
                  <Text className="text-white font-bold text-[30px]">
                    {getInitials(customerData.name || '')}
                  </Text>
                )}
              </View>
              <Text className="text-2xl font-semibold mt-3">{customerData.name || 'Customer Name'}</Text>
              <View className="flex-row items-center mt-2 gap-[10px]">
                <Text className='text-xs text-gray-500'>#scans: {currentScan.scanCount || 1}</Text>
                <View className="flex-row gap-2">
                  <Text
                    className={`rounded-full text-[10px] border font-semibold px-2 py-0.5 ${
                      currentScan.interestStatus === "Hot"
                        ? "border-red-400 bg-red-100 text-red-600"
                        : currentScan.interestStatus === "Warm"
                          ? "border-orange-400 bg-orange-100 text-orange-600"
                          : "border-gray-400 bg-gray-100 text-gray-600"
                    }`}
                  >
                    {currentScan.interestStatus || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            <View className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md px-6">
              <EmailIcon stroke="#3D12FA" width={20} height={20} />
              <Text className="text-xs">{customerData.email || 'No email'}</Text>
            </View>
            <View className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md px-6">
              <PhoneIcon stroke="#3D12FA" width={20} height={20} />
              <Text className="text-xs">{customerData.phone || 'No phone number'}</Text>
            </View>
            <View className='flex-row justify-center mt-5'>
              <Text className='text-xs text-gray-500'>
                <Text className='font-bold'>Last scanned:</Text> {currentScan.$createdAt ? formatDate(currentScan.$createdAt) : 'No scan data'}
              </Text>
            </View>
          </View>
        </View>
        <View className='px-4'>
          <ButtonComponent
            label="Show Customer Log"
            var2
            onPress={() => router.push("/home/customers/customer-log")}
          />
        </View>
      </View>
    </>
  );
};

export default SelectedCustomerScreen;