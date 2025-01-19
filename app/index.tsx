import ButtonComponent from "@/components/button";
import { Link } from "expo-router";
import { Image, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="h-screen items-center justify-center">
      <View className="items-center mb-8">
        <Image
          source={require("@/assets/images/alexium-logo.webp")}
          style={{ width: 115, height: 115 }}
        />
        <Text className="text-xl font-semibold mt-2">Digital Dealer</Text>
        <Text className="text-[8px] text-color2 mt-1">POWERED BY ALEXIUM</Text>
        <Link href="/login" className="w-full mt-10">
          <ButtonComponent label="Login" />
        </Link>
      </View>
    </View>
  );
}
