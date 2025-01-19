import { Slot } from "expo-router";
import "../global.css";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
