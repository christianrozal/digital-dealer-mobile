import { Slot } from "expo-router";
import "../global.css";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import store from "@/store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </Provider>
  );
}
