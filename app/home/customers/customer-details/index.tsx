import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useCallback, useRef, useEffect, useState } from 'react';
import EmailIcon from '@/components/svg/emailIcon';
import PhoneIcon from '@/components/svg/phoneIcon';
import ButtonComponent from '@/components/button';
import BackArrowIcon from '@/components/svg/backArrow';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import dayjs from 'dayjs';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import EditIcon from '@/components/svg/editIcon';
import { setCustomerUpdateSuccess } from '@/store/uiSlice';
import SuccessAnimation from '@/components/successAnimation'; // Assume this exists


const SelectedCustomerScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const customerUpdateSuccess = useSelector((state: RootState) => state.ui.customerUpdateSuccess);
  const [showSuccess, setShowSuccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Reset scroll position when the screen comes into focus
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

   const { data: consultantData} = useSelector(
    (state: RootState) => state.consultant
  );
 const [selectedCustomer, setSelectedCustomer] = useState<any>(null);


 const customerId = useSelector(
    (state: RootState) => state.customer.selectedCustomer?.$id
  );

    useEffect(() => {
         if (consultantData?.scans && customerId) {
           const customerFromConsultant = consultantData.scans.find(scan => scan.customers?.$id === customerId)?.customers;
           if (customerFromConsultant){
             const updatedCustomer = {
                ...customerFromConsultant,
                lastScanned: consultantData.scans.find(scan => scan.customers?.$id === customerId)?.$createdAt,
                scanCount: consultantData.scans.filter(scan => scan.customers?.$id === customerId).length,
                interestStatus: consultantData.scans.find(scan => scan.customers?.$id === customerId)?.interest_status,
                interestedIn: consultantData.scans.find(scan => scan.customers?.$id === customerId)?.interested_in,
               }
                setSelectedCustomer(updatedCustomer)
           }
         }
       }, [consultantData, customerId]);


    useEffect(() => {
        if (customerUpdateSuccess) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
                dispatch(setCustomerUpdateSuccess(false));
            }, 2000); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [customerUpdateSuccess, dispatch]);


  if (!selectedCustomer) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No customer selected.</Text>
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
    <View className="pt-7 px-7 pb-7 h-screen justify-between gap-5">
          
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.push("/home/customers")}>
            <BackArrowIcon />
          </TouchableOpacity>
          {/* Logo */}
          <TouchableOpacity onPress={() => { router.push("/home") }}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View style={{ width: 18 }} />
        </View>
        <View className="px-4">
           <TouchableOpacity 
              className="flex-row gap-1 ml-auto bg-white p-2 z-10 translate-y-4 mt-5"
              onPress={() => { router.push("/home/customers/customer-details/edit") }} // Changed this line
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
            }}
          >
            <View
              className="bg-color1 rounded-full flex items-center justify-center"
              style={{ width: 100, height: 100 }}
            >
                {selectedCustomer?.['profile-icon'] ? (
                    <Image
                        source={{ uri: selectedCustomer['profile-icon'] }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                ) : (
                    <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                        {getInitials(selectedCustomer.name)}
                    </Text>
                  )}
            </View>
            <Text className="text-2xl font-semibold mt-3">{selectedCustomer.name || 'Customer Name'}</Text>
            <View className="flex-row items-center mt-2" style={{ gap: 10 }}>
              <Text className='text-xs text-gray-500'>#scans: {selectedCustomer.scanCount || 0}</Text>
              <View className="flex-row gap-2">
                <Text
                  className={`rounded-full text-[10px] border font-semibold px-2 py-0.5 ${
                    selectedCustomer.interestStatus === "Hot"
                      ? "border-red-400 bg-red-100 text-red-600"
                      : selectedCustomer.interestStatus === "Warm"
                        ? "border-orange-400 bg-orange-100 text-orange-600"
                        : "border-gray-400 bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedCustomer.interestStatus || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
          <View
            className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md"
            style={{ paddingHorizontal: 24 }}
          >
            <EmailIcon stroke="#3D12FA" width={20} height={20} />
            <Text className="text-xs">{selectedCustomer.email || 'No email'}</Text>
          </View>
          <View
            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
            style={{ paddingHorizontal: 24 }}
          >
            <PhoneIcon stroke="#3D12FA" width={20} height={20} />
            <Text className="text-xs">{selectedCustomer.phone || 'No phone number'}</Text>
          </View>
          <View className='flex-row justify-center mt-5'>
            <Text className='text-xs text-gray-500'>
              <Text className='font-bold'>Last scanned:</Text> {selectedCustomer.lastScanned ? formatDate(selectedCustomer.lastScanned) : 'No scan data'}
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