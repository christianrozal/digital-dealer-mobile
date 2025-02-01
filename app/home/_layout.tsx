import {
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    Image
} from "react-native";
import React from "react";
import { router, Slot, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import AnalyticsIcon from "@/components/svg/analyticsIcon";
import NotificationsIcon from "@/components/svg/notificationsIcon";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";
import SidePaneComponent from "@/components/sidepane/sidePane";
import ActivityIcon from "@/components/svg/activityIcon";
import CustomersIcon from "@/components/svg/customersIcon";
import ScannerIcon from "@/components/svg/scannerIcon";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeLayout = () => {
    const isActivitiesFilterVisible = useSelector(
        (state: RootState) => state.ui.isActivitiesFilterVisible
    );
    const isCustomersFilterVisible = useSelector(
        (state: RootState) => state.ui.isCustomersFilterVisible
    );

    const consultant = useSelector((state: RootState) => state.consultant.data);
    const pathname = usePathname();
    const translateX = useSharedValue(-SCREEN_WIDTH * 0.95);

    const openGesture = Gesture.Pan()
        .hitSlop({ left: 0, width: 30 })
        .onBegin((e) => {
            if (translateX.value === -SCREEN_WIDTH * 0.95 && e.x < 30) {
                return;
            }
        })
        .onUpdate((e) => {
            const newTranslate = -SCREEN_WIDTH * 0.95 + e.translationX;
            translateX.value = Math.min(
                0,
                Math.max(-SCREEN_WIDTH * 0.95, newTranslate)
            );
        })
        .onEnd((e) => {
            if (e.translationX > SCREEN_WIDTH * 0.3 || e.velocityX > 500) {
                translateX.value = withSpring(0, { velocity: e.velocityX });
            } else {
                translateX.value = withSpring(-SCREEN_WIDTH * 0.95, {
                    velocity: e.velocityX,
                });
            }
        });

    const validPaths = [
        "/home",
        "/home/customers",
        "/home/analytics",
        "/home/notifications",
    ];

    const shouldRenderLayout = validPaths.includes(pathname);

    const getInitials = (name: string | undefined): string => {
        if (!name) return "CU";
        const firstName = name.trim().split(" ")[0] || "";
        if (!firstName) return "CU"
        const firstLetter = firstName[0]?.toUpperCase() || "";
        const secondLetter = firstName[1]?.toLowerCase() || "";
        return `${firstLetter}${secondLetter}`
    };

    return (
        <GestureDetector gesture={openGesture}>
            <View style={{ flex: 1 }}>
            {shouldRenderLayout ? (
                <>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 50,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'black',
                        opacity: isActivitiesFilterVisible || isCustomersFilterVisible ? 0.1 : 0,
                        pointerEvents: 'none',
                    }}
                />
                {/* Header */}
                <View className="absolute top-0 left-0 right-0 h-[60px] flex-row justify-between items-center px-5 z-20 bg-white">
                    {/* User Icon */}
                    <TouchableOpacity
                        onPress={() => {
                            if (translateX.value === -SCREEN_WIDTH * 0.95) {
                                translateX.value = withSpring(0);
                            }
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: '#3D12FA', // color1
                                borderRadius: 9999,
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32
                            }}
                        >
                            {consultant?.['profile-icon'] ? (
                                <Image
                                    source={{ uri: consultant['profile-icon'] }}
                                    style={{ width: 32, height: 32, borderRadius: 16 }}
                                />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                                    {getInitials(consultant?.name)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Logo */}
                    <View>
                        <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                    </View>

                    {/* Header Icons */}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => router.push("/home/analytics")}>
                            <AnalyticsIcon
                                width={20}
                                height={20}
                                stroke={pathname === "/home/analytics" ? "#3D12FA" : "#9EA5AD"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push("/home/notifications")}
                        >
                            <NotificationsIcon
                                width={20}
                                height={20}
                                stroke={
                                    pathname === "/home/notifications" ? "#3D12FA" : "#9EA5AD"
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Side Pane */}
                <SidePaneComponent translateX={translateX} />


                   {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 h-[70px] flex-row justify-center items-center gap-10 bg-white border-t border-gray-100 z-10">
                    <TouchableOpacity
            style={{ alignItems: 'center' }}
                        onPress={() => router.push("/home")}
                    >
                        <ActivityIcon
                            stroke={pathname === "/home" ? "#3D12FA" : "#BECAD6"}
                        />
            <Text style={{ 
                fontSize: 10,
                color: '#6b7280',
                fontWeight: '600',
                marginTop: 4
            }}>
                            Activity
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push("/home/qr-scanner")}>
                        <ScannerIcon
                            fgColor={pathname === "/home/qr-scanner" ? "#3D12FA" : "#BECAD6"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
            style={{ alignItems: 'center' }}
                        onPress={() => router.push("/home/customers")}
                    >
                        <CustomersIcon
                            stroke={pathname === "/home/customers" ? "#3D12FA" : "#BECAD6"}
                        />
            <Text style={{ 
                fontSize: 10,
                color: '#6b7280',
                fontWeight: '600',
                marginTop: 4
            }}>
                            Customers
                        </Text>
                    </TouchableOpacity>
                </View>
                <Slot />
                </>
            ) : (
                <Slot />
            )}
            </View>
        </GestureDetector>
    );
};

export default HomeLayout;