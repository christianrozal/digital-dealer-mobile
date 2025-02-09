import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { databases, databaseId, usersId } from '@/lib/appwrite';
import { useSelector } from 'react-redux';

const TestScreen = () => {
  // Ensure that your Redux store has the current user's ID stored in "currentUserId".
  const currentUserId = useSelector((state: any) => state.user.currentUserId);

  const testUpdate = async () => {
    try {
      console.log('Fetching dealershipLevel1 document...');
      const dealershipLevel1 = await databases.getDocument(
        databaseId,
        "679ecb1b000c23a061e6",
        "679ed23c003be146c5c9"
      );
      console.log('DealershipLevel1 document:', dealershipLevel1);

      // Map out the IDs for dealershipLevel2 and dealershipLevel3 from dealershipLevel1.
      const level2IDs = Array.isArray(dealershipLevel1.dealershipLevel2)
        ? dealershipLevel1.dealershipLevel2.map((d: any) => d.$id)
        : [];
      const level3IDs = Array.isArray(dealershipLevel1.dealershipLevel3)
        ? dealershipLevel1.dealershipLevel3.map((d: any) => d.$id)
        : [];

      console.log('Level 2 IDs:', level2IDs);
      console.log('Level 3 IDs:', level3IDs);


      // Prepare payload with only the dealership relationship fields.
      const payload = {
        dealershipLevel2: level2IDs,
        dealershipLevel3: level3IDs
      };

      const updatedUser = await databases.updateDocument(
        databaseId,
        usersId,
        "67a035a6000e6bc6a2dd",
        payload
      );
      console.log('Updated user document:', updatedUser);
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity 
        onPress={testUpdate} 
        style={{ padding: 12, backgroundColor: '#3D12FA', borderRadius: 4 }}
      >
        <Text style={{ color: 'white' }}>Run Test Update</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestScreen;