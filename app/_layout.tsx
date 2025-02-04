import { Stack } from "expo-router";
import { useEffect } from "react";
import { Provider } from "react-redux";
import store from "@/lib/store/store";
import * as SplashScreen from 'expo-splash-screen';
import CustomSplash from "@/components/CustomSplash";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a delay
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
