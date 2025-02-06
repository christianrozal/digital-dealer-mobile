import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "@/lib/store/store";
import * as SplashScreen from 'expo-splash-screen';
import CustomSplash from "@/components/CustomSplash";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { account } from "@/lib/appwrite";
import { router } from "expo-router";
import "../global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSessionAndHideSplash = async () => {
      try {
        // Check for existing session
        await account.getSession("current");
        // If we get here, session exists, route to home
        router.replace("/home");
      } catch (error) {
        // No session exists, stay on current route (login)
        console.log("No existing session:", error);
      } finally {
        // Hide splash screen after checking session
        await new Promise(resolve => setTimeout(resolve, 2000));
        await SplashScreen.hideAsync();
        setIsLoading(false);
      }
    };

    checkSessionAndHideSplash();
  }, []);

  const getInitials = (name: string | undefined): string => {
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

  if (isLoading) {
    return <CustomSplash />;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1">
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 200,
            }}
          />
        </View>
      </GestureHandlerRootView>
    </Provider>
  );
}
