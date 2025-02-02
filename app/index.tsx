import ButtonComponent from "@/components/button";
import LogoutIcon from "@/components/svg/logoutIcon";
import { account } from "@/lib/appwrite";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const handleLogout = async () => {
    try {
        await account.deleteSession("current");
        router.replace("/login");
    } catch (error) {
        console.log("Logout Error:", error);
    }
};
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
          onPress={() => router.push("/")}
          className="px-10 mt-10"
        />
        <ButtonComponent
          label="Test"
          var2
          onPress={() => router.push("/test")}
          className="px-10 mt-10"
        />

<TouchableOpacity className="mt-10" onPress={handleLogout}>
                                    <View className="flex-row gap-1 items-center">
                                        <LogoutIcon />
                                        <Text className="text-xs font-medium">Logout</Text>
                                    </View>
                                </TouchableOpacity>
      </View>
    </View>
  );
}
