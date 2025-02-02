import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Checkbox } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import dayjs from "dayjs";
import BackArrowIcon from "@/components/svg/backArrow";
import Calendar2Icon from "@/components/svg/calendar2";
import { useFocusEffect } from "@react-navigation/native";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ButtonComponent from "@/components/button";
import { setUserData } from "@/lib/store/userSlice";
import { databases, databaseId, commentsId, scansId, usersId } from "@/lib/appwrite";
import { Query, ID } from "react-native-appwrite";
import DotsIcon from "@/components/svg/dotsIcon";
import DeleteIcon from "@/components/svg/deleteIcon";
import EditIcon2 from "@/components/svg/editIcon2";

interface User {
  $id: string;
  name: string;
  [key: string]: any;
}

interface Scan {
  $id: string;
  $createdAt: string;
  users?: string;
  user?: User;
  customers: Customer;
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
  scanCount?: number;
  [key: string]: any;
}

interface CustomerData {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  interestStatus?: string;
  interestedIn?: string;
  scans?: Scan[];
  [key: string]: any;
}

interface Customer {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    interestStatus?: string;
    interestedIn?: string;
}

interface UserData {
    $id: string;
    scans?: Scan[];
}

interface Comment {
  $id: string;
  $createdAt: string;
  comment: string;
  customers: string;
  users: {
    name: string;
    email: string;
    $id: string;
    profileImage?: string;
  };
}

const CustomerLogScreen = () => {
    const currentCustomerId = useSelector((state: RootState) => state.current.currentCustomer);
    const currentScanId = useSelector((state: RootState) => state.current.currentScan);
    const userData = useSelector((state: RootState) => state.user.data);

    // Find the current scan and customer data from userSlice
    const currentScan = userData?.scans?.find(scan => scan.$id === currentScanId);
    const customerData = currentScan?.customers;

    const [comments, setComments] = useState<Comment[]>([]);
    const [comment, setComment] = useState('');
    const [value, setValue] = useState<string | null>(null);
    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<'comments' | 'thread'>('comments');
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        console.log('Debug Data:', {
            currentScanId,
            currentCustomerId,
            userData,
            currentScan,
            customerData
        });
    }, [currentScanId, currentCustomerId, userData, currentScan, customerData]);

    useFocusEffect(
        useCallback(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }, [])
    );

    useEffect(() => {
        if (currentScan) {
            setValue(currentScan.interestStatus || null);
            setInterestedIn(currentScan.interestedIn ? [currentScan.interestedIn] : []);

            console.log('Customer Log Screen Data:', {
                currentScanId,
                currentCustomerId,
                scan: {
                    id: currentScan.$id,
                    interestStatus: currentScan.interestStatus,
                    interestedIn: currentScan.interestedIn,
                    customer: currentScan.customers
                }
            });
        }
    }, [currentScan, currentScanId, currentCustomerId]);

    // Fetch comments when screen loads
    useEffect(() => {
        const fetchComments = async () => {
            if (!currentCustomerId) {
                console.log("No customer ID available for fetching comments");
                return;
            }

            try {
                console.log("Fetching comments for customer:", currentCustomerId);
                
                const response = await databases.listDocuments(
                    databaseId,
                    commentsId,
                    [
                        Query.equal('customers', currentCustomerId),
                        Query.orderDesc('$createdAt')
                    ]
                );

                console.log("Fetched customer comments:", response.documents);
                setComments(response.documents as unknown as Comment[]);
            } catch (error) {
                console.error("Error fetching comments:", error);
                Alert.alert("Error", "Failed to fetch comments");
            }
        };

        fetchComments();
    }, [currentCustomerId, userData?.dealershipLevel1]);

    // Add debugging for tab changes
    useEffect(() => {
        console.log("Active tab changed to:", activeTab);
        console.log("Current comments:", comments);
    }, [activeTab, comments]);

    const refreshComments = async () => {
        if (!currentCustomerId || isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            console.log("Refreshing comments for customer:", currentCustomerId);
            
            const response = await databases.listDocuments(
                databaseId,
                commentsId,
                [
                    Query.equal('customers', currentCustomerId),
                    Query.orderDesc('$createdAt')
                ]
            );

            console.log("Fetched customer comments:", response.documents);
            setComments(response.documents as unknown as Comment[]);
        } catch (error) {
            console.error("Error refreshing comments:", error);
            Alert.alert("Error", "Failed to refresh comments");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Refresh comments when switching to thread tab
    useEffect(() => {
        if (activeTab === 'thread') {
            refreshComments();
        }
    }, [activeTab]);

    const handleTabChange = (tab: 'comments' | 'thread') => {
        console.log("Switching to tab:", tab);
        setActiveTab(tab);
    };

    if (!currentScan || !customerData) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white">No customer data available.</Text>
            </View>
        );
    }

    const formatDate = (date: Date | null) => {
        if(!date) {
            return 'No scan data'
        }
        return dayjs(date).format("D MMM YYYY h:mm A");
    };


    const handleCheckboxChange = (interestType: "Buying" | "Selling" | "Financing" | "Purchased") => {

        const newInterestedIn = [...interestedIn];

        if (newInterestedIn.includes(interestType)) {
            const index = newInterestedIn.indexOf(interestType);
            newInterestedIn.splice(index, 1);
        } else {
            newInterestedIn.push(interestType);
        }

        setInterestedIn(newInterestedIn)


    };

    const handleInterestStatusChange = (interestStatus: string) => {
        setValue(interestStatus);

    };


    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            if (!currentScan || !currentScan.$id) {
                console.error("No current scan found");
                return;
            }

            // Update the scan document in Appwrite
            const updatedScan = await databases.updateDocument(
                databaseId,
                scansId,
                currentScan.$id,
                {
                    interestStatus: value || undefined,
                    interestedIn: interestedIn.join(',')
                }
            );

            // Create comment if there's text
            if (comment.trim() && currentCustomerId && userData?.$id) {
                await databases.createDocument(
                    databaseId,
                    commentsId,
                    ID.unique(),
                    {
                        comment: comment.trim(),
                        customers: currentCustomerId,
                        users: userData.$id,
                    }
                );

                setComment(''); // Clear input
                await refreshComments(); // Refresh comments after adding new one
            }

            // Update the scan in userData.scans
            if (userData?.scans) {
                const updatedScans = userData.scans.map(scan => 
                    scan.$id === currentScan.$id ? {
                        ...scan,
                        ...updatedScan
                    } : scan
                );

                dispatch(setUserData({
                    ...userData,
                    scans: updatedScans
                }));
            }

            // Switch to threads tab
            setActiveTab('thread');
        } catch (error) {
            console.error("Error updating:", error);
            Alert.alert("Error", "Failed to update");
        } finally {
            setIsUpdating(false);
        }
    };

    const customRadioButton = (label: string, valueToSet: string) => {
        const isSelected = value === valueToSet;
        return (
            <TouchableOpacity
                className="flex-row items-center"
                onPress={() => handleInterestStatusChange(valueToSet)}
            >
                <View
                    className={`border mr-1 rounded-full  ${isSelected ? "border-color1" : "border-color4"
                        }`}
                    style={{ width: 12, height: 12 }}
                >
                    {isSelected && <View className="-translate-x-1/2 left-1/2 -translate-y-1/2 top-1/2" style={{ position: 'absolute', width: 6, height: 6, backgroundColor: '#3D12FA', borderRadius: 100 }} />}
                </View>
                <Text
                    className={`text-[10px] ${isSelected ? "text-black" : "text-gray-500"
                        }`}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Function to generate initials in the desired format
    const generateInitials = (name: string | undefined) => {
        if (!name) return "Us";

        const nameParts = name.trim().split(" ");

        const firstName = nameParts[0] || "";

        if (firstName.length === 0) {
            return "Us"
        }

        const firstInitial = firstName[0]?.toUpperCase() || "";
        const secondInitial = firstName[1]?.toLowerCase() || "";


        return `${firstInitial}${secondInitial}`
    };

    const renderProfileIcon = () => {
        if (!customerData) return null;
        
        // Use type assertion to handle the profileImage property
        const profileImage = customerData.profileImage;

        if (profileImage && profileImage !== 'black') {
            return (
                <Image
                    source={{ uri: profileImage }}
                    style={{ width: 56, height: 56, borderRadius: 28}}
                />
            );
        } else {
            return (
                <View
                    className="bg-color1 rounded-full flex items-center justify-center"
                    style={{ width: 56, height: 56 }}
                >
                    <Text className="text-white font-bold text-sm">
                        {generateInitials(customerData.name)}
                    </Text>
                </View>
            );
        }
    };

    const handleCommentOptions = (commentId: string) => {
        if (showOptions === commentId) {
            setShowOptions(null);
        } else {
            setShowOptions(commentId);
        }
    };

    const handleEditComment = (commentId: string, currentComment: string) => {
        setEditingCommentId(commentId);
        setEditedComment(currentComment);
        setShowOptions(null);
    };

    const handleSaveEdit = async (commentId: string) => {
        setIsSaving(true);
        try {
            await databases.updateDocument(
                databaseId,
                commentsId,
                commentId,
                {
                    comment: editedComment
                }
            );
            
            // Update the comment in local state
            setComments(prevComments => 
                prevComments.map(comment => 
                    comment.$id === commentId 
                        ? { ...comment, comment: editedComment }
                        : comment
                )
            );
            setEditingCommentId(null);
            setEditedComment('');
        } catch (error) {
            console.error("Error updating comment:", error);
            Alert.alert("Error", "Failed to update comment");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await databases.deleteDocument(
                databaseId,
                commentsId,
                commentId
            );
            
            setComments(prevComments => 
                prevComments.filter(comment => comment.$id !== commentId)
            );
            setShowOptions(null);
        } catch (error) {
            console.error("Error deleting comment:", error);
            Alert.alert("Error", "Failed to delete comment");
        }
    };

    // Add this helper function near the top with other functions
    const renderUserIcon = (name: string | undefined, profileImage?: string) => {
        if (profileImage && profileImage !== 'black') {
            return (
                <Image
                    source={{ uri: profileImage }}
                    style={{ width: 28, height: 28, borderRadius: 14 }}
                />
            );
        } else {
            return (
                <View
                    className="bg-color1 rounded-full flex items-center justify-center"
                    style={{ width: 28, height: 28 }}
                >
                    <Text className="text-white text-[10px] font-bold">
                        {generateInitials(name)}
                    </Text>
                </View>
            );
        }
    };

    return (
        <ScrollView ref={scrollViewRef} className='pt-7 px-7 pb-12'>
            {/* Header */}
            <View className='flex-row w-full justify-between items-center'>
                <TouchableOpacity onPress={() => { router.back() }}>
                    <BackArrowIcon />
                </TouchableOpacity>
                {/* Logo */}
                <TouchableOpacity onPress={() => { router.push("/home") }}>
                    <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                </TouchableOpacity>
                <View style={{ width: 18 }} />
            </View>
            <View className="mt-10"></View>
            <Text className="text-2xl font-semibold">Customer Log</Text>
            <View>


                {/* Customer Info */}
                <View className="bg-color8 rounded-md px-5 py-7 mt-10 flex-row gap-5">
                  {renderProfileIcon()}
                    <View className="gap-1">
                        <Text className="text-white text-[10px]">
                            Customer Name: <Text className="font-bold">{customerData.name || "No name"}</Text>
                        </Text>
                        <Text className="text-white text-[10px]">
                            Contact Number:{" "}
                            <Text className="font-bold">{customerData.phone || "No phone"}</Text>
                        </Text>
                        <Text className="text-white text-[10px]">
                            Email: <Text className="font-bold">{customerData.email || "No email"}</Text>
                        </Text>
                        {/* Add assigned consultant info if available */}
                        {(customerData as any).scans?.[0]?.user?.name && (
                          <Text className="text-white text-[10px]">
                              Assigned Consultant:{" "}
                              <Text className="font-bold">{(customerData as any).scans[0].user.name}</Text>
                          </Text>
                        )}
                    </View>
                </View>
                {/* Interest in checkbox group*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Interested In</Text>
                    <View className="flex-row -ml-2">
                        {/* Buying*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Buying")}
                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Buying") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Buying</Text>
                        </TouchableOpacity>
                        {/* Selling*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Selling")}

                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Selling") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Selling</Text>
                        </TouchableOpacity>
                        {/* Financing*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Financing")}
                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Financing") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Financing</Text>
                        </TouchableOpacity>
                        {/* Purchased*/}
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleCheckboxChange("Purchased")}
                        >
                            <View className="scale-75">
                                <Checkbox
                                    status={interestedIn.includes("Purchased") ? "checked" : "unchecked"}
                                    color="#3D12FA"
                                />
                            </View>
                            <Text className="text-[10px] -ml-1">Purchased</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Interest status radio group*/}
                <View className="mt-3">
                    <Text className="text-[10px] text-gray-500">Interest Status</Text>
                    <View className="flex-row gap-3 mt-3">
                        {customRadioButton("Hot", "Hot")}
                        {customRadioButton("Warm", "Warm")}
                        {customRadioButton("Cold", "Cold")}
                        {customRadioButton("Not Interested", "Not Interested")}
                        {customRadioButton("Bought", "Bought")}
                    </View>
                </View>

                {/* Follow up select date*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            borderColor: "gray",
                            borderRadius: 5,
                            padding: 10,
                        }}
                        className="mt-3"
                        // onPress={showDatePicker} // Removed onPress
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs">
                            {formatDate(currentScan?.followUpDate ? new Date(currentScan.followUpDate) : null)}
                            </Text>
                            <Calendar2Icon width={16} height={16} />
                        </View>
                    </TouchableOpacity>
                      {/* <DateTimePickerModal // Removed
                           isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        /> */}
                </View>

                {/* Comments and Thread Section */}
                <View className="mt-10">
                    {/* Tab Buttons */}
                    <View className="flex-row gap-5">
                        <TouchableOpacity 
                            className={`py-2 px-4 rounded-full ${activeTab === 'comments' ? 'bg-color3' : ''}`}
                            onPress={() => handleTabChange('comments')}
                        >
                            <Text className={`text-black text-[10px] text-center font-semibold`}>
                                Comments
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className={`py-2 px-4 rounded-full ${activeTab === 'thread' ? 'bg-color3' : ''}`}
                            onPress={() => handleTabChange('thread')}
                        >
                            <Text className={`text-black text-[10px] text-center font-semibold`}>
                                Thread
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    {activeTab === 'comments' ? (
                        <View className="mt-3">
                            <TextInput
                                placeholder="Add your comment"
                                multiline={true}
                                numberOfLines={4}
                                value={comment}
                                onChangeText={setComment}
                                className="placeholder:text-gray-400 placeholder:text-[10px] text-xs border border-color4 rounded-md py-3 px-4 w-full focus:outline-color1"
                            />
                        </View>
                    ) : (
                        <View className="mt-3">
                            {comments.length === 0 ? (
                                <View className="bg-color3 rounded-md p-4">
                                    <Text className="text-gray-500 text-xs">No comments yet</Text>
                                </View>
                            ) : (
                                <View className="gap-2">
                                    {comments.map((comment) => (
                                        <View key={comment.$id}>
                                            <View 
                                                className={`${showOptions === comment.$id ? 'bg-color3' : 'bg-white'} rounded-md p-4`}
                                            >
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-row items-center gap-2">
                                                        {renderUserIcon(comment.users?.name, comment.users?.profileImage)}
                                                        <View>
                                                            <Text className="text-xs font-medium">
                                                                {comment.users?.name || 'Unknown User'}
                                                            </Text>
                                                            <Text className="text-[10px] font-light text-gray-500">
                                                                {formatDate(new Date(comment.$createdAt))}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {/* Only show dots menu for user's own comments */}
                                                    {comment.users?.$id === userData?.$id && (
                                                        <TouchableOpacity 
                                                            onPress={() => handleCommentOptions(comment.$id)}
                                                        >
                                                            <DotsIcon 
                                                                width={16} 
                                                                height={16} 
                                                                fill={showOptions === comment.$id ? '#3D12FA' : '#000000'}
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <View>
                                                    {/* Only allow editing for user's own comments */}
                                                    {editingCommentId === comment.$id && comment.users?.$id === userData?.$id ? (
                                                        <View className="mt-2">
                                                            <TextInput
                                                                value={editedComment}
                                                                onChangeText={setEditedComment}
                                                                className="border border-color4 rounded-md p-2 text-xs"
                                                                multiline
                                                                numberOfLines={4}
                                                            />
                                                            <View className="flex-row justify-end gap-2 mt-2">
                                                                <TouchableOpacity 
                                                                    onPress={() => {
                                                                        setEditingCommentId(null);
                                                                        setEditedComment('');
                                                                    }}
                                                                    className="px-3 py-1 rounded-md bg-gray-100"
                                                                >
                                                                    <Text className="text-xs">Cancel</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity 
                                                                    onPress={() => handleSaveEdit(comment.$id)}
                                                                    className="px-3 py-1 rounded-md bg-color1"
                                                                    disabled={isSaving}
                                                                    style={{ minWidth: 50, justifyContent: 'center', alignItems: 'center' }}
                                                                >
                                                                    {isSaving ? (
                                                                        <ActivityIndicator size="small" color="white" />
                                                                    ) : (
                                                                        <Text className="text-xs text-white">Save</Text>
                                                                    )}
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ) : (
                                                        <Text className="text-sm mt-2">{comment.comment}</Text>
                                                    )}
                                                </View>
                                            </View>
                                            {/* Only show options menu for user's own comments */}
                                            {showOptions === comment.$id && comment.users?.$id === userData?.$id && (
                                                <>
                                                    <TouchableOpacity 
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            zIndex: 1000
                                                        }}
                                                        onPress={() => setShowOptions(null)}
                                                    />
                                                    <View 
                                                        className="absolute right-4 top-10 bg-white rounded-md shadow-md p-2"
                                                        style={{ 
                                                            zIndex: 1001,
                                                            elevation: 5,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.25,
                                                            shadowRadius: 3.84,
                                                        }}
                                                    >
                                                        <TouchableOpacity 
                                                            className="flex-row items-center gap-2 p-2"
                                                            onPress={() => handleEditComment(comment.$id, comment.comment)}
                                                        >
                                                            <EditIcon2 width={12} height={12} />
                                                            <Text className="text-xs">Edit</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity 
                                                            className="flex-row items-center gap-2 p-2"
                                                            onPress={() => handleDeleteComment(comment.$id)}
                                                        >
                                                            <DeleteIcon width={12} height={12} />
                                                            <Text className="text-xs">Delete</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Update button */}
                <ButtonComponent 
                    label={isUpdating ? "Updating..." : "Update"} 
                    onPress={handleUpdate} 
                    className="mt-10"
                    loading={isUpdating}
                    disabled={isUpdating}
                />

                {/* Back to activities button*/}
                <ButtonComponent var2 label="Back to Activities" onPress={() => router.push("/home")} className="mt-5" />
            </View>
        </ScrollView>
    );
};

export default CustomerLogScreen;