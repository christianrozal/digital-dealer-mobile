import {
    View,
    Text,
    Dimensions,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    Linking
} from "react-native";
import Animated, {
    useAnimatedStyle,
    interpolate,
    withSpring,
    runOnJS,
    useAnimatedReaction,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { resetScreen } from "@/lib/store/sidePaneSlice";
import EmailIcon from "../svg/emailIcon";
import PhoneIcon from "../svg/phoneIcon";
import { router } from "expo-router";
import QRCode from 'react-native-qrcode-svg';
import LogoutIcon from "../svg/logoutIcon";
import { Account, Client } from "react-native-appwrite";
import ProfileIcon from "../svg/profileIcon";

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("6780c774003170c68252");

const account = new Account(client);

const SCREEN_WIDTH = Dimensions.get("window").width;

const SidePaneComponent = ({
    translateX,
}: {
    translateX: Animated.SharedValue<number>;
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const userData = useSelector((state: RootState) => state.user.data);
    const [qrData, setQrData] = useState<string | null>(null);

    useEffect(() => {
        if (userData && userData.slug) {
            const url = `https://digital-dealer.vercel.app/consultant/${userData.slug}`;
            setQrData(url);
        }
    }, [userData]);

    // Reset to main screen when pane opens
    useAnimatedReaction(
        () => translateX.value,
        (currentValue, previousValue) => {
            if (previousValue === -SCREEN_WIDTH * 0.95 && currentValue === 0) {
                runOnJS(dispatch)(resetScreen());
            }
        }
    );

    const handleClose = () => {
        translateX.value = withSpring(-SCREEN_WIDTH * 0.95);
    };

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            router.replace("/login");
        } catch (error) {
            console.log("Logout Error:", error);
        }
    };

    const handleProfilePress = () => {
        handleClose();
        router.push("/home/profile");
    };

    const formatInitials = (name: string | undefined): string => {
        if (!name) return "CU";
        const firstName = name.trim().split(" ")[0] || "";
        if (!firstName) return "CU";

        const firstLetter = firstName[0]?.toUpperCase() || "";
        const secondLetter = firstName[1]?.toLowerCase() || "";

        return `${firstLetter}${secondLetter}`;
    };

    const closeGesture = Gesture.Pan()
        .onUpdate((e) => {
            const newTranslate = translateX.value + e.translationX;
            translateX.value = Math.min(
                0,
                Math.max(-SCREEN_WIDTH * 0.95, newTranslate)
            );
        })
        .onEnd((e) => {
            if (translateX.value < -SCREEN_WIDTH * 0.45 || e.velocityX < -500) {
                translateX.value = withSpring(-SCREEN_WIDTH * 0.95, {
                    velocity: e.velocityX,
                });
            } else {
                translateX.value = withSpring(0, { velocity: e.velocityX });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SCREEN_WIDTH * 0.95, 0], [0, 0.2]),
        pointerEvents: translateX.value > -SCREEN_WIDTH * 0.95 ? "auto" : "none",
        backgroundColor: "black",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 25,
    }));

    return (
        <>
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View
                    style={overlayStyle}
                    needsOffscreenAlphaCompositing={true}
                />
            </TouchableWithoutFeedback>

            <GestureDetector gesture={closeGesture}>
                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            left: "-15%",
                            top: 0,
                            width: "110%",
                            height: "100%",
                            backgroundColor: "white",
                            zIndex: 30,
                            paddingLeft: "15%",
                        },
                        animatedStyle,
                    ]}
                >
                    <View className="h-screen relative" style={{ padding: 32 }}>
                        <View
                            style={{
                                height: 28,
                                width: 3,
                                position: "absolute",
                                right: 3,
                                top: "50%",
                                transform: [{ translateY: "-50%" }],
                                backgroundColor: "#D1D5DC",
                                borderRadius: 3,
                            }}
                        />
                        <View className="flex-row items-center" style={{ gap: 16 }}>
                            <View
                                className="bg-color1 rounded-full flex items-center justify-center"
                                style={{ width: 40, height: 40 }}
                            >
                                {userData?.profileImage ? (
                                    <Image
                                        source={{ uri: userData.profileImage }}
                                        style={{ width: 40, height: 40, borderRadius: 20 }}
                                    />
                                ) : (
                                    <Text className="text-white font-bold text-sm">
                                        {formatInitials(userData?.name)}
                                    </Text>
                                )}
                            </View>
                            <View>
                                <Text className="text-sm font-medium">{userData?.name || 'No Name'}</Text>
                                <Text className="text-xs text-gray-500">Sales Consultant</Text>
                            </View>
                        </View>

                        {/* Content Area (formerly QrScreen) */}
                        <View className="mt-16">
                            <View className="bg-color3 rounded-md" style={{ padding: 20 }}>
                                {qrData ? (
                                    <View>
                                        <TouchableOpacity onPress={() => Linking.openURL(qrData)} className="flex-row items-center justify-center">
                                            <QRCode
                                                value={qrData}
                                                size={200}
                                                backgroundColor="#F4F8FC"
                                                color="#3D12FA"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View className="flex items-center justify-center">
                                        <Text className="text-center">Loading QR Code</Text>
                                    </View>
                                )}
                            </View>

                            {userData && (
                                <>
                                    <View
                                        className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md"
                                        style={{ paddingHorizontal: 24 }}
                                    >
                                        <EmailIcon stroke="#3D12FA" width={20} height={20} />
                                        <Text className="text-xs">{userData?.email}</Text>
                                    </View>
                                    <View
                                        className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                                        style={{ paddingHorizontal: 24 }}
                                    >
                                        <PhoneIcon stroke="#3D12FA" width={20} height={20} />
                                        <Text className="text-xs">{userData?.phone}</Text>
                                    </View>
                                </>
                            )}

                            <View className="flex-row mx-auto gap-10" style={{ marginTop: 64 }}>
                                <TouchableOpacity onPress={handleProfilePress}>
                                    <View className="flex-row gap-1 items-center">
                                        <ProfileIcon />
                                        <Text className="text-xs font-medium">Profile</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleLogout}>
                                    <View className="flex-row gap-1 items-center">
                                        <LogoutIcon />
                                        <Text className="text-xs font-medium">Logout</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </>
    );
};

export default SidePaneComponent;