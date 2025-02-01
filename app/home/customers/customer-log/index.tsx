import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { Checkbox } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import dayjs from "dayjs";
import BackArrowIcon from "@/components/svg/backArrow";
import Calendar2Icon from "@/components/svg/calendar2";
import { useFocusEffect } from "@react-navigation/native";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ButtonComponent from "@/components/button";
import { setSelectedCustomer } from "@/lib/store/customerSlice";
import { setUserData } from "@/lib/store/userSlice";
import { Client, Databases, ID } from "react-native-appwrite";


const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6780c774003170c68252");

const databases = new Databases(client);

interface Scan {
    $id: string;
    $createdAt: string;
    customers?: {
        id: string;
        name?: string;
        phone?: string;
        email?: string;
        'profile-icon'?: string;
        interestStatus?: string;
        interestedIn?: string;
    };
    interest_status?: string;
    interested_in?: string;
    follow_up_date?: string;
}

interface UserData {
    $id: string;
    scans?: Scan[];
}

const CustomerLogScreen = () => {

    const DATABASE_ID = '67871d61002bf7e6bc9e';
    const COMMENTS_COLLECTION_ID = '6799d2430037c51dc502';

    const selectedCustomer = useSelector(
        (state: RootState) => state.customer.selectedCustomer
    );
    const userData = useSelector((state: RootState) => state.user.data);

    const [comment, setComment] = useState('');
    const [value, setValue] = useState<string | null>(null);
    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const dispatch = useDispatch();

    useFocusEffect(
        useCallback(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }, [])
    );

    useEffect(() => {
        if (selectedCustomer) {
            setValue(selectedCustomer?.interestStatus || null);
            setInterestedIn(selectedCustomer?.interestedIn ? selectedCustomer.interestedIn.split(',') : []);
        }
    }, [selectedCustomer]);

    if (!selectedCustomer) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white">No customer selected.</Text>
            </View>
        );
    }

    const formatDate = (date: Date | null) => {
        if(!date) {
            return 'No scan data'
        }
        return dayjs(date).format("D MMM YYYY h:mm A");
    };


    const handleCheckboxChange = (interestType: "Buying" | "Selling" | "Financing" | "Purchased") => {

        const newInterestedIn = [...interestedIn];

        if (newInterestedIn.includes(interestType)) {
            const index = newInterestedIn.indexOf(interestType);
            newInterestedIn.splice(index, 1);
        } else {
            newInterestedIn.push(interestType);
        }

        setInterestedIn(newInterestedIn)


    };

    const handleInterestStatusChange = (interestStatus: string) => {
        setValue(interestStatus);

    };


    const handleUpdate = async () => {
        if (!userData || !selectedCustomer) return;

        // Find the scan in userData.scans that matches this customer
        const updatedScans = userData.scans?.map((scan: Scan) => {
            if (scan.customers?.id === selectedCustomer.id) {
                return {
                    ...scan,
                    interest_status: value || undefined,
                    interested_in: interestedIn.join(','),
                    customers: {
                        ...scan.customers,
                        interestStatus: value || undefined,
                        interestedIn: interestedIn.join(',')
                    }
                };
            }
            return scan;
        }) || [];

        // Update the Redux store with new scan data
        dispatch(setUserData({
            ...userData,
            scans: updatedScans
        }));

        // Update the selected customer in Redux
        const updatedCustomer = {
            ...selectedCustomer,
            interestStatus: value,
            interestedIn: interestedIn.join(',')
        };
        dispatch(setSelectedCustomer(updatedCustomer));

        // Submit comment to Appwrite if provided
        if (comment.trim() && selectedCustomer?.id) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COMMENTS_COLLECTION_ID,
                    ID.unique(),
                    {
                        customerId: selectedCustomer.id,
                        text: comment,
                        timestamp: new Date().toISOString()
                    }
                );
                setComment('');
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }

        router.push("/home/customers/customer-details");
    };

    const customRadioButton = (label: string, valueToSet: string) => {
        const isSelected = value === valueToSet;
        return (
            <TouchableOpacity
                className="flex-row items-center"
                onPress={() => handleInterestStatusChange(valueToSet)}
            >
                <View
                    className={`border mr-1 rounded-full  ${isSelected ? "border-color1" : "border-color4"
                        }`}
                    style={{ width: 12, height: 12 }}
                >
                    {isSelected && <View className="-translate-x-1/2 left-1/2 -translate-y-1/2 top-1/2" style={{ position: 'absolute', width: 6, height: 6, backgroundColor: '#3D12FA', borderRadius: 100 }} />}
                </View>
                <Text
                    className={`text-[10px] ${isSelected ? "text-black" : "text-gray-500"
                        }`}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Function to generate initials in the desired format
    const generateInitials = (name: string | undefined) => {
        if (!name) return "Us";

        const nameParts = name.trim().split(" ");

        const firstName = nameParts[0] || "";

        if (firstName.length === 0) {
            return "Us"
        }

        const firstInitial = firstName[0]?.toUpperCase() || "";
        const secondInitial = firstName[1]?.toLowerCase() || "";


        return `${firstInitial}${secondInitial}`
    };

    const renderProfileIcon = () => {
        const profileIconUrl = selectedCustomer?.['profile-icon'];

        if (profileIconUrl && profileIconUrl !== 'black') { // Use the URL if it exists and is not black
            return (
                <Image
                    source={{ uri: profileIconUrl }}
                    style={{ width: 56, height: 56, borderRadius: 28}}
                />
            );
        } else { // Fallback to initials
           return (
            <View
                className="bg-color1 rounded-full flex items-center justify-center"
                style={{ width: 56, height: 56 }}
            >
                <Text className="text-white font-bold text-sm">
                    {generateInitials(selectedCustomer?.name)}
                </Text>
            </View>
           )
        }
    };


    return (
        <ScrollView ref={scrollViewRef} className='pt-7 px-7 pb-12'>
            {/* Header */}
            <View className='flex-row w-full justify-between items-center'>
                <TouchableOpacity onPress={() => { router.back() }}>
                    <BackArrowIcon />
                </TouchableOpacity>
                {/* Logo */}
                <TouchableOpacity onPress={() => { router.push("/home") }}>
                    <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                </TouchableOpacity>
                <View style={{ width: 18 }} />
            </View>
            <View className="mt-10"></View>
            <Text className="text-2xl font-semibold">Customer Log</Text>
            <View>


                {/* Customer Info */}
                <View className="bg-color8 rounded-md px-5 py-7 mt-10 flex-row gap-5">
                  {renderProfileIcon()}
                    <View className="gap-1">
                        <Text className="text-white text-[10px]">
                            Customer Name: <Text className="font-bold">{selectedCustomer.name || "No name"}</Text>
                        </Text>
                        <Text className="text-white text-[10px]">
                            Contact Number:{" "}
                            <Text className="font-bold">{selectedCustomer.phone || "No phone"}</Text>
                        </Text>
                        <Text className="text-white text-[10px]">
                            Email: <Text className="font-bold">{selectedCustomer.email || "No email"}</Text>
                        </Text>
                    </View>
                </View>

                {/* Interest in checkbox group*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Interested In</Text>
                    <View className="flex-row -ml-2">
                        {/* Buying*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Buying")}
                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Buying") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Buying</Text>
                        </TouchableOpacity>
                        {/* Selling*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Selling")}

                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Selling") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Selling</Text>
                        </TouchableOpacity>
                        {/* Financing*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Financing")}
                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Financing") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Financing</Text>
                        </TouchableOpacity>
                        {/* Purchased*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Purchased")}
                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Purchased") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Purchased</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Interest status radio group*/}
                <View className="mt-3">
                    <Text className="text-[10px] text-gray-500">Interest Status</Text>
                    <View className="flex-row gap-3 mt-3">
                        {customRadioButton("Hot", "Hot")}
                        {customRadioButton("Warm", "Warm")}
                        {customRadioButton("Cold", "Cold")}
                        {customRadioButton("Not Interested", "Not Interested")}
                        {customRadioButton("Bought", "Bought")}
                    </View>
                </View>

                {/* Follow up select date*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            borderColor: "gray",
                            borderRadius: 5,
                            padding: 10,
                        }}
                        className="mt-3"
                        // onPress={showDatePicker} // Removed onPress
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs">
                            No scan data
                            </Text>
                            <Calendar2Icon width={16} height={16} />
                        </View>
                    </TouchableOpacity>
                      {/* <DateTimePickerModal // Removed
                           isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        /> */}
                </View>

                <View className="mt-10 flex-row gap-5">
                    {/* Comments*/}
                    <TouchableOpacity className="bg-color3 py-2 px-4 rounded-full">
                        <Text className="text-black text-[10px] text-center font-semibold">
                            Comments
                        </Text>
                    </TouchableOpacity>
                    {/* Thread */}
                    <TouchableOpacity className="py-2 px-4 rounded-full">
                        <Text className="text-black text-[10px] text-center font-semibold">
                            Thread
                        </Text>
                    </TouchableOpacity>
                </View>
                {/* Add Comment */}
                <TextInput
                    placeholder="Add your comment"
                    multiline={true}
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                    className="placeholder:text-gray-400 placeholder:text-[10px] text-xs border border-color4 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
                />

                {/* Update button*/}
                <ButtonComponent label="Update" onPress={() => handleUpdate()} className="mt-5" />

                {/* Back to activities button*/}
                <ButtonComponent var2 label="Back to Activities" onPress={() => router.push("/home")} className="mt-5" />
            </View>
        </ScrollView>
    );
};

export default CustomerLogScreen;