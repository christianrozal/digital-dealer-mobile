import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Link } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

const PostAssignmentFilledScreen = () => {
  return (
    <ScrollView>
      <View className="pt-5 px-8">
        <View
          className="border border-color9 rounded-md w-full py-3 flex-row justify-center mt-10"
          style={{ boxShadow: "0px 4px 10px 0px rgba(7, 170, 48, 0.25)" }}
        >
          <Text className="text-xs text-color10">
            Customer Assigned Successfully
          </Text>
        </View>

        <View className="mt-6">
          <Text className="text-2xl font-semibold">Customer Log</Text>
        </View>

        {/* Customer Info */}
        <View className="bg-color8 rounded-md px-5 py-7 mt-4 flex-row gap-5">
          <Image
            source={require("@/assets/images/profile-mani.webp")}
            style={{ width: 56, height: 56 }}
          />
          <View className="gap-1">
            <Text className="text-white text-[10px]">
              Customer Name: <Text className="font-bold">Mani Prakash</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Contact Number:{" "}
              <Text className="font-bold">+61 (0)416499509</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Email: <Text className="font-bold">mani@loonalabs.com</Text>
            </Text>
          </View>
        </View>

        {/* Interst in checkbox group*/}
        <View className="mt-3">
          <Text className="text-[10px] text-gray-500">Interested In</Text>
        </View>

        {/* Interest status radio group*/}
        <View className="mt-3">
          <Text className="text-[10px] text-gray-500">Interested In</Text>
        </View>

        {/* Follow up select date*/}
        <View className="mt-3">
          <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
        </View>

        <View className="mt-10 flex-row gap-5">
          {/* Comments*/}
          <TouchableOpacity className="bg-color3 py-2 px-4 rounded-full">
            <Text className="text-black text-[10px] text-center font-semibold">
              Comments
            </Text>
          </TouchableOpacity>
          {/* Thread */}
          <TouchableOpacity className="py-2 px-4 rounded-full">
            <Text className="text-black text-[10px] text-center font-semibold">
              Thread
            </Text>
          </TouchableOpacity>
        </View>
        {/* Add Comment */}
        <TextInput
          placeholder="Add your comment"
          multiline={true}
          numberOfLines={4}
          className="placeholder:text-gray-400 placeholder:text-[10px] text-xs border border-color4 rounded-md py-3 px-4 mt-3 w-full focus:outline-color1"
        />

        {/* Update button*/}
        <Link href="/home/qr-scanner/done" className="w-full">
          <TouchableOpacity className="bg-color1 py-3 rounded-full w-full mt-5">
            <Text className="text-white text-center font-semibold text-sm">
              Update
            </Text>
          </TouchableOpacity>
        </Link>

        {/* Back button*/}
        <Link href="/home/qr-scanner/post-assignment" className="w-full">
          <TouchableOpacity className="bg-color3 py-3 rounded-full w-full mt-3">
            <Text className="text-color1 text-center font-semibold text-sm">
              Back to Activities
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
};

export default PostAssignmentFilledScreen;
