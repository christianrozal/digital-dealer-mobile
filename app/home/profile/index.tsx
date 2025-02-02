import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import FacebookIcon from "@/components/svg/facebookIcon";
import InstagramIcon from "@/components/svg/instagramIcon";
import YouTubeIcon from "@/components/svg/youtubeIcon";
import LinkedInIcon from "@/components/svg/linkedinIcon";
import EmailIcon from "@/components/svg/emailIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import WebsiteIcon from "@/components/svg/websiteIcon";
import ButtonComponent from "@/components/button";
import BackArrowIcon from "@/components/svg/backArrow";
import { router } from "expo-router";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import EditIcon from "@/components/svg/editIcon";
import SuccessAnimation from '@/components/successAnimation';
import { setCustomerUpdateSuccess } from '@/lib/store/uiSlice';

const ProfileScreen = () => {
    const userData = useSelector((state: RootState) => state.user.data);
    const customerUpdateSuccess = useSelector((state: RootState) => state.ui.customerUpdateSuccess);
    const [showSuccess, setShowSuccess] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (customerUpdateSuccess) {
            setShowSuccess(true);
        }
    }, [customerUpdateSuccess]);

    const handleAnimationComplete = () => {
        setShowSuccess(false);
        dispatch(setCustomerUpdateSuccess(false));
    }

    const getInitials = (name: string | undefined): string => {
        if (!name) return "CU";
        const firstName = name.trim().split(" ")[0] || "";
        if (!firstName) return "CU"
        const firstLetter = firstName[0]?.toUpperCase() || "";
        const secondLetter = firstName[1]?.toLowerCase() || "";
        return `${firstLetter}${secondLetter}`
    };

    return (
        <>
            {showSuccess && <SuccessAnimation message='Profile Updated' onAnimationComplete={handleAnimationComplete} />}
            <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
                <View>
                    {/* Header */}
                    <View className="flex-row w-full justify-between items-center">
                        <TouchableOpacity onPress={() => router.push("/home")}>
                            <BackArrowIcon />
                        </TouchableOpacity>
                        {/* Logo */}
                        <TouchableOpacity onPress={() => router.push("/home")}>
                            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                        </TouchableOpacity>
                        <View style={{ width: 18 }}>
                            <Text> </Text>
                        </View>
                    </View>

                    <View className="px-4">
                        <TouchableOpacity className="flex-row gap-1 ml-auto bg-white p-2 z-10 mt-5" onPress={() => router.push("/home/profile/edit")}>
                            <EditIcon /> 
                            <Text className="text-xs text-gray-300">Edit...</Text>
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
                                {userData?.profileImage ? (
                                    <Image
                                        source={{ uri: userData.profileImage }}
                                        style={{ width: 100, height: 100, borderRadius: 50 }}
                                    />
                                ) : (
                                    <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                        {getInitials(userData?.name)}
                                    </Text>
                                )}
                            </View>
                            <Text className="text-2xl font-semibold mt-3">
                                {userData?.name || "No Name"}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {userData?.position || "No Position"}
                            </Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <EmailIcon stroke="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">{userData?.email || "No email"}</Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <PhoneIcon stroke="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">{userData?.phone || "No phone"}</Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <WebsiteIcon fill="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">www.alexium.com.au</Text>
                        </View>
                    </View>
                </View>
                <View className="px-4">
                    <ButtonComponent label="Share Profile" var2 />
                </View>
            </View>
        </>
    );
};

export default ProfileScreen;