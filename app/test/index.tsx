import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { databases, databaseId, scansId } from '@/lib/appwrite';
import { ID } from 'react-native-appwrite';
import { useSelector } from 'react-redux';

const TestScreen = () => {
  const currentUserId = useSelector((state: any) => state.user.currentUserId);
  const testUpdate = async () => {
    try {

      console.log('Updating test document...');

      // Update the test document with a new value
      const updatedDoc = await databases.updateDocument(
        databaseId,
        scansId,
        "67a874e0001055941013",
        {
          users: "679ed3c90009d669f8f0"
        }
      );
      console.log('Updated test document:', updatedDoc);
    } catch (error) {
      console.error('Error during test update:', error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={testUpdate} style={{ padding: 12, backgroundColor: '#3D12FA', borderRadius: 4 }}>
        <Text style={{ color: 'white' }}>Run Test Update</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestScreen;