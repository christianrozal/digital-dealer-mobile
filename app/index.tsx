import ButtonComponent from "@/components/button";
import { router } from "expo-router";
import { Image, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="h-screen items-center justify-center px-8">
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/images/alexium-logo.webp")}
          style={{ width: 115, height: 115 }}
        />
        <Text className="text-xl font-semibold mt-2">Digital Dealer</Text>
        <Text className="text-[8px] text-color2 mt-1">POWERED BY ALEXIUM</Text>

        <ButtonComponent
          label="Login"
          var2
          onPress={() => router.push("/login")}
          className="px-10 mt-10"
        />
        <ButtonComponent
          label="Home"
          var2
          onPress={() => router.push("/home")}
          className="px-10 mt-10"
        />
      </View>
    </View>
  );
}
