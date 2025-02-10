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
import Select from "@/components/rnr/select";
import { setCurrentDealershipLevel2Id, setCurrentDealershipLevel3Id } from '@/lib/store/currentSlice';
import { setSelectedRooftopData } from '@/lib/store/rooftopSlice';
import { setUserData } from '@/lib/store/userSlice';
import { setCurrentDealershipLevel1Id } from '@/lib/store/currentSlice';
import { setCurrentUserId } from '@/lib/store/currentSlice';
import ButtonComponent from "@/components/button";
import SwitchIcon from "@/components/svg/switchIcon";
import { databases, databaseId, usersId, scansId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { setScans } from '@/lib/store/scanSlice';
import { setSwitchSuccess } from '@/lib/store/uiSlice';

interface DealershipLevel2 {
    $id: string;
    name: string;
    slug?: string;
}

interface DealershipLevel3 {
    $id: string;
    name: string;
    slug?: string;
    dealershipLevel2: DealershipLevel2;
}

interface Scan {
    $id: string;
    $createdAt: string;
    dealershipLevel2?: { $id: string };
    dealershipLevel3?: { $id: string };
    customers?: any;
    interestStatus?: string;
    interestedIn?: string;
    followUpDate?: string;
}

interface UserData {
    $id: string;
    name?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    slug?: string;
    dealershipLevel1?: {
        $id: string;
        name: string;
    }[];
    dealershipLevel2?: DealershipLevel2[];
    dealershipLevel3?: DealershipLevel3[];
    scans?: Scan[];
}

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
    const userData = useSelector((state: RootState) => state.user.data) as UserData;
    const currentDealershipLevel2Id = useSelector((state: RootState) => state.current.currentDealershipLevel2Id);
    const currentDealershipLevel3Id = useSelector((state: RootState) => state.current.currentDealershipLevel3Id);
    const [qrData, setQrData] = useState<string | null>(null);
    const [isDealershipDropdownOpen, setIsDealershipDropdownOpen] = useState(false);
    const [isRooftopDropdownOpen, setIsRooftopDropdownOpen] = useState(false);
    const [selectedDealership, setSelectedDealership] = useState<DealershipLevel2 | null>(null);
    const [selectedRooftop, setSelectedRooftop] = useState<DealershipLevel3 | null>(null);
    const [availableRooftops, setAvailableRooftops] = useState<DealershipLevel3[]>([]);
    const [isSwitching, setIsSwitching] = useState(false);

    // Set initial dealership and rooftop based on current selection
    useEffect(() => {
        if (userData && currentDealershipLevel2Id) {
            const dealership = userData.dealershipLevel2?.find(d => d.$id === currentDealershipLevel2Id);
            if (dealership) {
                setSelectedDealership(dealership);
                const rooftops = userData.dealershipLevel3?.filter(
                    rooftop => rooftop.dealershipLevel2.$id === dealership.$id
                ) || [];
                setAvailableRooftops(rooftops);

                if (currentDealershipLevel3Id) {
                    const rooftop = rooftops.find(r => r.$id === currentDealershipLevel3Id);
                    if (rooftop) {
                        setSelectedRooftop(rooftop);
                    }
                }
            }
        }
    }, [userData, currentDealershipLevel2Id, currentDealershipLevel3Id]);

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
            // Logs removed for production
        }
    };

    const handleProfilePress = () => {
        handleClose();
        router.push("/home/profile");
    };

    // Function to generate initials in the desired format
    const generateInitials = (name: string | undefined) => {
        if (!name) return "CU";
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts[1] || "";
        
        if (!firstName) return "CU";
        
        if (lastName) {
            return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
        }
        
        return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
    };

    const handleDealershipSelection = (dealership: DealershipLevel2) => {
        setSelectedDealership(dealership);
        setSelectedRooftop(null);
        setIsDealershipDropdownOpen(false);
        
        // Update available rooftops
        const rooftops = userData?.dealershipLevel3?.filter(
            rooftop => rooftop.dealershipLevel2.$id === dealership.$id
        ) || [];
        setAvailableRooftops(rooftops);
    };

    const handleRooftopSelection = (rooftop: DealershipLevel3) => {
        setSelectedRooftop(rooftop);
        setIsRooftopDropdownOpen(false);
    };

    const handleSwitchDealership = async () => {
        if (!selectedDealership || !userData) return;
        
        setIsSwitching(true);
        try {
            // 1. Fetch fresh user data
            const session = await account.get();
            const response = await databases.listDocuments(
                databaseId,
                usersId,
                [Query.equal('email', session.email)]
            );

            if (response.documents.length > 0) {
                const freshUserData = response.documents[0] as UserData;

                // 2. Update current states first
                const level1Id = freshUserData.dealershipLevel1?.[0]?.$id;
                if (level1Id) {
                    dispatch(setCurrentDealershipLevel1Id(level1Id));
                }

                if (selectedRooftop) {
                    dispatch(setCurrentDealershipLevel2Id(selectedRooftop.dealershipLevel2.$id));
                    dispatch(setCurrentDealershipLevel3Id(selectedRooftop.$id));
                    dispatch(setSelectedRooftopData(selectedRooftop));
                } else {
                    dispatch(setCurrentDealershipLevel2Id(selectedDealership.$id));
                    dispatch(setCurrentDealershipLevel3Id(null));
                }
                dispatch(setCurrentUserId(freshUserData.$id || null));

                // 3. Fetch scans for the selected dealership/rooftop from the scans collection
                try {
                    const scansResponse = await databases.listDocuments(
                        databaseId,
                        scansId,
                        [
                            selectedRooftop 
                                ? Query.equal('dealershipLevel3', selectedRooftop.$id)
                                : Query.equal('dealershipLevel2', selectedDealership.$id)
                        ]
                    );
                    console.log('Scans (sidepane switch):', scansResponse.documents);
                    dispatch(setScans(scansResponse.documents));
                } catch (error) {
                    console.error('Error fetching scans in sidepane:', error);
                }

                // 4. Filter scans based on selection from fresh user data (if needed)
                const filteredScans = (selectedRooftop
                    ? freshUserData.scans?.filter(scan => scan.dealershipLevel3?.$id === selectedRooftop.$id)
                    : freshUserData.scans?.filter(scan => 
                        scan.dealershipLevel2?.$id === selectedDealership.$id ||
                        availableRooftops.some(rooftop => scan.dealershipLevel3?.$id === rooftop.$id)
                    )) || [];

                // 5. Update Redux with the filtered scans as part of user data
                dispatch(setUserData({
                    ...freshUserData,
                    scans: filteredScans
                }));
                // Trigger success animation on the homescreen
                dispatch(setSwitchSuccess(true));
                // Call our animated close function that turns off the indicator after completing
                handleCloseWithCallback();
            }
        } catch (error) {
            console.error("Error switching dealership:", error);
            // If there is an error, stop the loading indicator immediately
            setIsSwitching(false);
        }
    };

    const handleCloseWithCallback = () => {
        translateX.value = withSpring(-SCREEN_WIDTH * 0.95, {}, (finished) => {
            if (finished) {
                // Once the sidepane is closed, stop the switching indicator
                runOnJS(setIsSwitching)(false);
            }
        });
    };

    const closeGesture = Gesture.Pan()
        .onStart((e) => {
            // Only allow gesture to start from the visible edge (5px from the right edge of the pane)
            const paneRightEdge = SCREEN_WIDTH * 0.85;  // Where the visible pane ends
            if (translateX.value === -SCREEN_WIDTH * 0.95 && e.x > paneRightEdge) {
                return;
            }
        })
        .onUpdate((e) => {
            // Only allow updates if started from the edge
            const paneRightEdge = SCREEN_WIDTH * 0.85;
            if (translateX.value === -SCREEN_WIDTH * 0.95 && e.x > paneRightEdge) {
                return;
            }
            
            const newTranslate = translateX.value + e.translationX;
            translateX.value = Math.min(
                0,
                Math.max(-SCREEN_WIDTH * 0.95, newTranslate)
            );
        })
        .onEnd((e) => {
            if (Math.abs(e.velocityX) > 500) {
                if (e.velocityX > 0) {
                    translateX.value = withSpring(0);
                } else {
                    translateX.value = withSpring(-SCREEN_WIDTH * 0.95);
                }
                return;
            }

            if (translateX.value > -SCREEN_WIDTH * 0.5) {
                translateX.value = withSpring(0);
            } else {
                translateX.value = withSpring(-SCREEN_WIDTH * 0.95);
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

            <Animated.View
                    style={[
                        {
                            position: "absolute",
                            left: "-15%",
                            top: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "white",
                            zIndex: 30,
                            paddingLeft: "15%",
                        },
                        animatedStyle,
                    ]}
                >
                    <View className="h-full relative" style={{ padding: 32 }}>
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
                        
                        <View className="h-full flex justify-between">
                            {/* Top Container: Profile, Dealership Selection, and QR */}
                            <View>
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
                                                {generateInitials(userData?.name)}
                                            </Text>
                                        )}
                                    </View>
                                    <View>
                                        <Text className="text-sm font-medium">{userData?.name || 'No Name'}</Text>
                                        <Text className="text-xs text-gray-500">Sales Consultant</Text>
                                    </View>
                                </View>

                                {/* Dealership Selection */}
                                <View className="mt-8" style={{ zIndex: 20 }}>
                                    <Select
                                        placeholder="Select Dealership"
                                        value={selectedDealership ? { id: selectedDealership.$id, label: selectedDealership.name } : null}
                                        options={userData?.dealershipLevel2?.map(d => ({ id: d.$id, label: d.name })) || []}
                                        isOpen={isDealershipDropdownOpen}
                                        onPress={() => {
                                            setIsDealershipDropdownOpen(!isDealershipDropdownOpen);
                                            setIsRooftopDropdownOpen(false);
                                        }}
                                        onSelect={(option) => {
                                            const dealership = userData?.dealershipLevel2?.find(d => d.$id === option.id);
                                            if (dealership) handleDealershipSelection(dealership);
                                        }}
                                    />
                                </View>

                                {selectedDealership && availableRooftops.length > 0 && (
                                    <View className="mt-3" style={{ zIndex: 10 }}>
                                        <Select
                                            placeholder="Select Rooftop"
                                            value={selectedRooftop ? { id: selectedRooftop.$id, label: selectedRooftop.name } : null}
                                            options={availableRooftops.map(r => ({ id: r.$id, label: r.name }))}
                                            isOpen={isRooftopDropdownOpen}
                                            onPress={() => {
                                                if (!selectedDealership) return;
                                                setIsRooftopDropdownOpen(!isRooftopDropdownOpen);
                                                setIsDealershipDropdownOpen(false);
                                            }}
                                            onSelect={(option) => {
                                                const rooftop = availableRooftops.find(r => r.$id === option.id);
                                                if (rooftop) handleRooftopSelection(rooftop);
                                            }}
                                        />
                                    </View>
                                )}

                                {/* Switch Dealership Button */}
                                {selectedDealership && selectedDealership.$id !== currentDealershipLevel2Id && (
                                    <View className="mt-5">
                                        <ButtonComponent
                                            label={isSwitching ? "Switching..." : "Switch to this Dealership"}
                                            onPress={handleSwitchDealership}
                                            disabled={!selectedDealership || (availableRooftops.length > 0 && !selectedRooftop) || isSwitching}
                                            loading={isSwitching}
                                            var2
                                        />
                                    </View>
                                )}

                                {/* QR Code */}
                                <View className="mt-7">
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
                                </View>
                            </View>

                            {/* Bottom Container: Profile and Logout */}
                            <View className="flex-row mx-auto gap-0">
                                <TouchableOpacity onPress={handleProfilePress} className="justify-center items-center" style={{ paddingVertical: 20, paddingHorizontal: 20 }}>
                                    <View className="flex-row gap-1 items-center">
                                        <ProfileIcon />
                                        <Text className="text-sm text-gray-600 font-medium">Profile</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleLogout} className="justify-center items-center" style={{ paddingVertical: 20, paddingHorizontal: 20 }}>
                                    <View className="flex-row gap-1 items-center">
                                        <LogoutIcon />
                                        <Text className="text-sm text-gray-600 font-medium">Logout</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
        </>
    );
};

export default SidePaneComponent;