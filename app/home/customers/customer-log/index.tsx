import React, { useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { Checkbox } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import dayjs from "dayjs";
import BackArrowIcon from "@/components/svg/backArrow";
import Calendar2Icon from "@/components/svg/calendar2";
import { useFocusEffect } from "@react-navigation/native";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ButtonComponent from "@/components/button";


const CustomerLogScreen = () => {
    const selectedCustomer = useSelector(
        (state: RootState) => state.customer.customersTabSelectedCustomer
    );

    const [value, setValue] = useState<string | null>(
        selectedCustomer?.interestStatus || null
    );
    const [interestedIn, setInterestedIn] = useState<string[]>(selectedCustomer?.interestedIn ? [selectedCustomer.interestedIn] : []);
    const scrollViewRef = useRef<ScrollView>(null);


    useFocusEffect(
        useCallback(() => {
          // Reset scroll position when the screen comes into focus
          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }, [])
      );


    if (!selectedCustomer) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white">No customer selected.</Text>
            </View>
        );
    }

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("D MMM YYYY h:mm A");
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


    const handleUpdate = () => {
 
       console.log("Update customer log");
    }

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
                style={{ width: 12, height: 12}}
            >
                {isSelected && <View className="-translate-x-1/2 left-1/2 -translate-y-1/2 top-1/2" style={{position: 'absolute', width: 6, height: 6, backgroundColor: '#3D12FA', borderRadius: 100 }} />}
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

    return (
        <ScrollView ref={scrollViewRef} className='pt-7 px-7 pb-12'>
             {/* Header */}
             <View className='flex-row w-full justify-between items-center'>
                <TouchableOpacity onPress={() => { router.push("/home/customers/customer-details") }}>
                    <BackArrowIcon />
                </TouchableOpacity>
                {/* Logo */}
                <TouchableOpacity onPress={() => { router.push("/home") }}>
                    <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                </TouchableOpacity>
                <View  style={{width: 18}} />
            </View>
            <View className="mt-10"></View>
               <Text className="text-2xl font-semibold">Customer Log</Text>
            <View>


                {/* Customer Info */}
                <View className="bg-color8 rounded-md px-5 py-7 mt-10 flex-row gap-5">
                    <View
                        className="bg-color1 rounded-full flex items-center justify-center"
                        style={{ width: 56, height: 56 }}
                    >
                        <Text className="text-white font-bold text-sm">
                            {selectedCustomer?.name?.slice(0, 2).toUpperCase() || "CU"}
                        </Text>
                    </View>
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
                        {customRadioButton("Hot", "hot")}
                        {customRadioButton("Warm", "warm")}
                        {customRadioButton("Cold", "cold")}
                        {customRadioButton("Not Interested", "not-interested")}
                        {customRadioButton("Bought", "bought")}
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
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs">
                                {selectedCustomer.lastScanned ? formatDate(selectedCustomer.lastScanned) : 'No scan data'}
                            </Text>
                            <Calendar2Icon width={16} height={16} />
                        </View>
                    </TouchableOpacity>
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
                    className="placeholder:text-gray-400 placeholder:text-[10px] text-xs border border-color4 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
                />

                {/* Update button*/}
                <ButtonComponent label="Update" onPress={() => handleUpdate()} className="mt-5" />

                {/* Back to activities button*/}
                <ButtonComponent var2 label="Back to Activities" onPress={() =>router.push("/home")} className="mt-5" />
            </View>
        </ScrollView>
    );
};

export default CustomerLogScreen;