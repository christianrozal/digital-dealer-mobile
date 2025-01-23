import { Slot } from "expo-router";
import "../global.css";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import store from "@/store/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
