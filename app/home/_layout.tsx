import {
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    Image
} from "react-native";
import React, { useEffect } from "react";
import { router, usePathname, Slot } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
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
import { databases, databaseId, usersId } from "@/lib/appwrite";
import { setUserData } from "@/lib/store/userSlice";
import SuccessAnimation from "@/components/successAnimation";
import { setCustomerUpdateSuccess, setSwitchSuccess, setCustomerAddSuccess } from "@/lib/store/uiSlice";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeLayout = () => {
    const dispatch = useDispatch();
    const isActivitiesFilterVisible = useSelector(
        (state: RootState) => state.ui.isActivitiesFilterVisible
    );
    const isCustomersFilterVisible = useSelector(
        (state: RootState) => state.ui.isCustomersFilterVisible
    );
    const isAnalyticsFilterVisible = useSelector(
        (state: RootState) => state.ui.isAnalyticsFilterVisible
    );
    const customerUpdateSuccess = useSelector((state: RootState) => state.ui.customerUpdateSuccess);
    const userData = useSelector((state: RootState) => state.user.data);
    const pathname = usePathname();
    const translateX = useSharedValue(-SCREEN_WIDTH * 0.95);

    // Assume notifications are stored in state.notifications.documents
    const notifications = useSelector((state: RootState) => state.notifications.documents);
    const hasUnreadNotifications = notifications ? notifications.some((n: any) => !n.read) : false;
    const switchSuccess = useSelector((state: RootState) => state.ui.switchSuccess);
    const customerAddSuccess = useSelector((state: RootState) => state.ui.customerAddSuccess);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (userData?.$id) {
                    const response = await databases.getDocument(
                        databaseId,
                        usersId,
                        userData.$id
                    );
                    dispatch(setUserData(response));
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const validPaths = [
        "/home",
        "/home/customers",
        "/home/analytics",
        "/home/notifications",
    ];

    const shouldRenderLayout = validPaths.includes(pathname);

    const getInitials = (name: string) => {
        if (!name) return "CU";
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts[1] || "";
        
        if (!firstName) return "CU";
        
        if (lastName) {
          return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
        }
        
        return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
      };

    return (
        <View className="flex-1 bg-white">
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
                        opacity: isActivitiesFilterVisible || isCustomersFilterVisible || isAnalyticsFilterVisible ? 0.1 : 0,
                        pointerEvents: isActivitiesFilterVisible || isCustomersFilterVisible || isAnalyticsFilterVisible ? 'auto' : 'none',
                    }}
                />
                {/* Header */}
                <View className="absolute top-0 left-0 right-0 h-[60px] flex-row justify-between items-center px-5 z-20 bg-white">
                    {/* User Icon */}
                    <TouchableOpacity className="justify-center items-center h-[60px] px-4 -translate-x-4"
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
                            {userData?.profileImage ? (
                                <Image
                                    source={{ uri: userData.profileImage }}
                                    style={{ width: 32, height: 32, borderRadius: 16 }}
                                />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                                    {getInitials(userData?.name || '')}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Logo */}
                    <View style={{ transform: [{ translateX: 16 }] }}>
                        <AlexiumLogo2 width={64 * 1.2} height={14 * 1.2} />
                    </View>

                    {/* Header Icons */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateX: 4 }] }}>
                        <TouchableOpacity className="justify-center items-center h-[60px] pl-5 pr-1" onPress={() => router.push("/home/analytics")}>
                            <AnalyticsIcon
                                width={24}
                                height={24}
                                stroke={pathname === "/home/analytics" ? "#3D12FA" : "#9EA5AD"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity className="justify-center items-center h-[60px] px-1" onPress={() => router.push("/home/notifications")}>
                            <NotificationsIcon
                                width={27}
                                height={27}
                                stroke={pathname === "/home/notifications" ? "#3D12FA" : "#9EA5AD"}
                                hasUnread={hasUnreadNotifications}
                            />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Side Pane */}
                <SidePaneComponent translateX={translateX} />


                   {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 h-[70px] flex-row justify-center items-center bg-white border-t border-gray-100 z-10">
                    <TouchableOpacity className="justify-center items-center h-[70px] px-5"
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

                    <TouchableOpacity className="justify-center items-center h-[70px] px-5" onPress={() => router.push("/home/qr-scanner")}>
                        <ScannerIcon
                            fgColor={pathname === "/home/qr-scanner" ? "#3D12FA" : "#BECAD6"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity className="justify-center items-center h-[70px] px-5"
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
                {switchSuccess && <SuccessAnimation message="Switched Dealership Successfully" isSuccess={true} onAnimationComplete={() => dispatch(setSwitchSuccess(false))} />}
                {customerAddSuccess && <SuccessAnimation message="Customer Created Successfully" isSuccess={true} onAnimationComplete={() => dispatch(setCustomerAddSuccess(false))} />}
                </>
            ) : (
                <Slot />
            )}
        </View>
    );
};

export default HomeLayout;