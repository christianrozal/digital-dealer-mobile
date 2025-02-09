import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator, Modal } from "react-native";
import { router } from "expo-router";
import Checkbox from "@/components/rnr/checkbox";
import Radio from "@/components/rnr/radio";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import dayjs from "dayjs";
import BackArrowIcon from "@/components/svg/backArrow";
import Calendar2Icon from "@/components/svg/calendar2";
import { useFocusEffect } from "@react-navigation/native";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ButtonComponent from "@/components/button";
import { databases, databaseId, commentsId, scansId, usersId, notificationsId } from "@/lib/appwrite";
import { Query, ID } from "react-native-appwrite";
import DotsIcon from "@/components/svg/dotsIcon";
import DeleteIcon from "@/components/svg/deleteIcon";
import EditIcon2 from "@/components/svg/editIcon2";
import relativeTime from "dayjs/plugin/relativeTime";
import CalendarModal from "@/components/calendarModal";
import { addComment } from "@/lib/store/commentSlice";
import { updateScan } from "@/lib/store/scanSlice";
import { updateUserScan } from "@/lib/store/userSlice";
import SuccessAnimation from '@/components/successAnimation';

dayjs.extend(relativeTime);

interface Scan {
  $id: string;
  $createdAt: string;
  users: string | { $id: string; name?: string; profileImage?: string; [key: string]: any };
  customers: CustomerData;
  interestStatus?: string;
  interestedIn?: string;
  followUpDate?: string;
  scanCount?: number;
  [key: string]: any;
}

interface CustomerData {
  $id: string;
  name?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  interestStatus?: string;
  interestedIn?: string;
  scans?: Scan[];
  [key: string]: any;
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

interface AssignmentHistory {
    date: string;
    userId: string;
    userName: string;
    profileImage?: string;
}

function getUserId(user: string | { $id: string; name?: string; email?: string; profileImage?: string } | undefined): string {
  if (!user) return '';
  return typeof user === 'string' ? user : user.$id;
}

function getUserDetails(user: string | { $id: string; name?: string; email?: string; profileImage?: string } | undefined): { $id: string; name: string; email: string; profileImage?: string } {
  if (!user || typeof user === 'string') {
    return { $id: typeof user === 'string' ? user : '', name: '', email: '', profileImage: undefined };
  }
  return { $id: user.$id, name: user.name || '', email: user.email || '', profileImage: user.profileImage };
}

// New SkeletonLoader component
function SkeletonLoader() {
  return (
    <View className="gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} className="p-4 bg-white rounded-md animate-pulse">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-color3" />
              <View className="gap-1">
                <View className="w-24 h-4 bg-color3 rounded" />
                <View className="w-16 h-4 bg-color3 rounded" />
              </View>
            </View>
            <View className="w-6 h-6 bg-color3 rounded" />
          </View>
          <View className="mt-2 gap-2">
            <View className="h-4 bg-color3 rounded" />
            <View className="h-4 bg-color3 rounded w-5/6" />
            <View className="h-4 bg-color3 rounded w-4/6" />
          </View>
        </View>
      ))}
    </View>
  );
}

const CustomerLogScreen = () => {
    const currentCustomerId = useSelector((state: RootState) => state.current.currentCustomerId);
    const currentScanId = useSelector((state: RootState) => state.current.currentScanId);
    const userData = useSelector((state: RootState) => state.user.data);
    const scanData = useSelector((state: RootState) => state.scan.data);
    const commentData = useSelector((state: RootState) => state.comment.data);

    // Find the current scan and customer data from userSlice
    const currentScan = userData?.scans?.find(scan => scan.$id === currentScanId);
    const customerData = currentScan?.customers;

    // Get filtered comments
    const [comments, setComments] = useState<Comment[]>(() => 
        commentData?.filter(comment => 
            comment.customers === currentCustomerId
        ) || []
    );

    // Assignment history from scan data
    const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>(() => {
        if (!scanData) return [];
        // Filter scans for the current customer
        const customerScans = scanData.filter(scan =>
            typeof scan.customers === 'string'
                ? scan.customers === currentCustomerId
                : scan.customers?.$id === currentCustomerId
        );

        // Sort the scans chronologically (earliest first)
        const sortedScans = customerScans.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());

        const reassignments: AssignmentHistory[] = [];
        // Include the first assignment and any change in assigned consultant
        sortedScans.forEach(scan => {
            const userId = typeof scan.users === 'string' ? scan.users : scan.users?.$id || '';
            const userName = typeof scan.users === 'string' ? '' : scan.users?.name || '';
            const profileImage = typeof scan.users === 'string' ? undefined : scan.users?.profileImage;
            if (reassignments.length === 0 || reassignments[reassignments.length - 1].userId !== userId) {
                reassignments.push({ date: scan.$createdAt, userId, userName, profileImage });
            }
        });

        // Return the reassignments with the latest at the top
        return reassignments.reverse();
    });

    const [comment, setComment] = useState('');
    const [value, setValue] = useState<string | null>(null);
    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<'comments' | 'thread' | 'history'>('comments');
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingThread, setIsLoadingThread] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>();
    const [localFollowUpDate, setLocalFollowUpDate] = useState<string | undefined>(
        currentScan?.followUpDate
    );
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCommentSuccess, setShowCommentSuccess] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

    useFocusEffect(
        useCallback(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }, [])
    );

    useEffect(() => {
        if (currentScan) {
            setValue(currentScan.interestStatus || null);
            setInterestedIn(currentScan.interestedIn ? [currentScan.interestedIn] : []);
            setLocalFollowUpDate(currentScan.followUpDate);
        }
    }, [currentScan, currentScanId, currentCustomerId]);

    useEffect(() => {
        if (activeTab === 'thread' && currentCustomerId) {
            const fetchComments = async () => {
                setIsLoadingThread(true);
                try {
                    const response = await databases.listDocuments(databaseId, commentsId, [Query.equal('customers', currentCustomerId)]);
                    const fetchedComments: Comment[] = response.documents.map((doc: any) => ({
                        $id: doc.$id,
                        $createdAt: doc.$createdAt,
                        comment: doc.comment,
                        customers: doc.customers,
                        users: doc.users
                    }));
                    setComments(fetchedComments);
                } catch (error) {
                    console.error('Error fetching thread comments', error);
                } finally {
                    setIsLoadingThread(false);
                }
            };
            fetchComments();
        }
    }, [activeTab, currentCustomerId]);

    const handleTabChange = (tab: 'comments' | 'thread' | 'history') => {
        setActiveTab(tab);
    };

    if (!currentScan || !customerData) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white">No customer data available.</Text>
            </View>
        );
    }

    const formatDate = (date: Date | string | null) => {
        if (!date) {
            return 'No date';
        }
        const now = dayjs();
        const commentDate = dayjs(date);
        const diffInHours = now.diff(commentDate, 'hour');
        const diffInDays = now.diff(commentDate, 'day');

        if (diffInHours < 24) {
            return commentDate.fromNow(); // This will show "2h ago", "30m ago", etc.
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`; // This will show "2d ago", "5d ago", etc.
        } else {
            return commentDate.format("D MMM YYYY"); // For older dates, show the full date
        }
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
        if (isUpdating || !currentScanId) return;
        console.log("handleUpdate called");
        setIsUpdating(true);

        try {
            const updateData = {
                interestStatus: value || "Hot",
                interestedIn: interestedIn[0] || "Buying",
                followUpDate: localFollowUpDate || dayjs().format('YYYY-MM-DDTHH:mm:ss'),
                users: getUserId(userData?.scans?.find(scan => scan.$id === currentScanId)?.users),
            };
            console.log("handleUpdate: updateData prepared:", updateData);

            const response = await databases.updateDocument(
                databaseId,
                scansId,
                currentScanId,
                updateData
            );
            console.log("handleUpdate: updateDocument response:", response);

            if (userData?.scans) {
                userData.scans.forEach(scan => {
                    if (scan.$id === currentScanId) {
                        dispatch(updateScan({ id: scan.$id, data: updateData }));
                        dispatch(updateUserScan({ id: scan.$id, data: updateData }));
                        console.log("handleUpdate: Updated scan in Redux for scan id:", scan.$id);
                    }
                });
            }

            if (comment.trim()) {
                console.log("handleUpdate: Adding comment with text:", comment.trim());
                const newComment = await databases.createDocument(
                    databaseId,
                    commentsId,
                    ID.unique(),
                    {
                        comment: comment.trim(),
                        customers: currentCustomerId,
                        users: getUserId(userData?.scans?.find(scan => scan.$id === currentScanId)?.users),
                    }
                );

                const transformedComment: Comment = {
                    $id: newComment.$id,
                    $createdAt: newComment.$createdAt,
                    comment: newComment.comment,
                    customers: newComment.customers,
                    users: getUserDetails(userData?.scans?.find(scan => scan.$id === currentScanId)?.users)
                };
                console.log("handleUpdate: New comment created:", transformedComment);
                dispatch(addComment(transformedComment));
            }

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
            }, 2000); // Hide after 2 seconds

        } catch (error) {
            console.error('Error updating scan:', error);
            if (error instanceof Error) {
                if (error.message.includes('CORS')) {
                    Alert.alert('Error', 'Network connection issue. Please try again.');
                } else if (error.message.includes('Failed to fetch')) {
                    Alert.alert('Error', 'Connection failed. Please check your internet connection.');
                } else {
                    Alert.alert('Error', 'Failed to update customer log. Please try again.');
                }
            } else {
                Alert.alert('Error', 'Failed to update customer log');
            }
        } finally {
            setIsUpdating(false);
            console.log("handleUpdate: Finished update process. isUpdating set to false.");
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
        if (!name) return "CU";
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts[1] || "";
        
        if (!firstName) return "CU";
        
        if (lastName) {
            return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
        }
        
        return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
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

            // Show success animation for editing comment
            setShowCommentSuccess(true);
            setTimeout(() => {
                setShowCommentSuccess(false);
            }, 2000); // Hide after 2 seconds

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

            // Show success animation for deleting comment
            setShowDeleteSuccess(true);
            setTimeout(() => {
                setShowDeleteSuccess(false);
            }, 2000); // Hide after 2 seconds

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

    const formatTimeOnly = (date: string) => {
        return dayjs(date).format("h:mm A");
    };

    const formatDateOnly = (date: string) => {
        return dayjs(date).format("D MMM YYYY");
    };

    const handleCalendarClose = (date?: dayjs.Dayjs, time?: string) => {
        console.log('Calendar Close - Received values:', {
            date: date?.format(),
            time,
            isDateValid: date?.isValid(),
            currentTime: new Date().toISOString()
        });
        
        setIsCalendarModalVisible(false);
        if (date && time) {
            setSelectedTime(time);
            // Parse the time string to get hours and minutes
            const [hours, minutes] = time.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
            const period = time.match(/(AM|PM)/i)?.[0];
            
            console.log('Time parsing:', {
                hours,
                minutes,
                period,
                originalTime: time
            });
            
            // Create a new date object and set the time
            let newDate = date.clone();
            let hour = parseInt(hours);
            
            // Convert to 24-hour format if PM
            if (period?.toUpperCase() === 'PM' && hour !== 12) {
                hour += 12;
            } else if (period?.toUpperCase() === 'AM' && hour === 12) {
                hour = 0;
            }
            
            newDate = newDate.hour(hour).minute(parseInt(minutes)).second(0);
            
            console.log('Final datetime:', {
                original: time,
                parsed: newDate.format('YYYY-MM-DDTHH:mm:ss'),
                hour,
                minutes,
                isNewDateValid: newDate.isValid()
            });
            
            setLocalFollowUpDate(newDate.format('YYYY-MM-DDTHH:mm:ss'));
            
            // Log the state after update
            console.log('State after update:', {
                localFollowUpDate: newDate.format('YYYY-MM-DDTHH:mm:ss'),
                selectedTime: time
            });
        }
    };

    const formatDisplayDateTime = (dateTimeStr: string | undefined) => {
        if (!dateTimeStr) return 'Select date and time';
        const dt = dayjs(dateTimeStr);
        if (!dt.isValid()) return 'Select date and time';
        return `${dt.format('D MMM YYYY')} at ${dt.format('h:mm A')}`;
    };


    return (
        <>
            {showSuccess && <SuccessAnimation message='Customer Log Updated' />}
            {showCommentSuccess && <SuccessAnimation message='Comment Edited Successfully' />}
            {showDeleteSuccess && <SuccessAnimation message='Comment Deleted Successfully' />}
            <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 50,
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                opacity: isCalendarModalVisible ? 0.1 : 0,
                pointerEvents: isCalendarModalVisible ? 'auto' : 'none',
            }}
        />
        
        <ScrollView ref={scrollViewRef} className='pt-7 px-7 pb-32'>
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
                    <View className="flex-row gap-4 mt-2">
                        {/* Buying*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            onPress={() => handleCheckboxChange("Buying")}
                        >
                            <Checkbox
                                checked={interestedIn.includes("Buying")}
                                onPress={() => handleCheckboxChange("Buying")}
                                size={14}
                            />
                            <Text className="text-[10px]">Buying</Text>
                        </TouchableOpacity>
                        {/* Selling*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            onPress={() => handleCheckboxChange("Selling")}
                        >
                            <Checkbox
                                checked={interestedIn.includes("Selling")}
                                onPress={() => handleCheckboxChange("Selling")}
                                size={14}
                            />
                            <Text className="text-[10px]">Selling</Text>
                        </TouchableOpacity>
                        {/* Financing*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            onPress={() => handleCheckboxChange("Financing")}
                        >
                            <Checkbox
                                checked={interestedIn.includes("Financing")}
                                onPress={() => handleCheckboxChange("Financing")}
                                size={14}
                            />
                            <Text className="text-[10px]">Financing</Text>
                        </TouchableOpacity>
                        {/* Purchased*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            onPress={() => handleCheckboxChange("Purchased")}
                        >
                            <Checkbox
                                checked={interestedIn.includes("Purchased")}
                                onPress={() => handleCheckboxChange("Purchased")}
                                size={14}
                            />
                            <Text className="text-[10px]">Purchased</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Interest status radio group*/}
                <View className="mt-3">
                    <Text className="text-[10px] text-gray-500">Interest Status</Text>
                    <View className="flex-row gap-4 mt-2">
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            onPress={() => handleInterestStatusChange("Hot")}
                        >
                            <Radio
                                checked={value === "Hot"}
                                onPress={() => handleInterestStatusChange("Hot")}
                                size={12}
                            />
                            <Text className={`text-[10px] ${value === "Hot" ? "text-black" : "text-gray-500"}`}>
                                Hot
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            onPress={() => handleInterestStatusChange("Warm")}
                        >
                            <Radio
                                checked={value === "Warm"}
                                onPress={() => handleInterestStatusChange("Warm")}
                                size={12}
                            />
                            <Text className={`text-[10px] ${value === "Warm" ? "text-black" : "text-gray-500"}`}>
                                Warm
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            onPress={() => handleInterestStatusChange("Cold")}
                        >
                            <Radio
                                checked={value === "Cold"}
                                onPress={() => handleInterestStatusChange("Cold")}
                                size={12}
                            />
                            <Text className={`text-[10px] ${value === "Cold" ? "text-black" : "text-gray-500"}`}>
                                Cold
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            onPress={() => handleInterestStatusChange("Not Interested")}
                        >
                            <Radio
                                checked={value === "Not Interested"}
                                onPress={() => handleInterestStatusChange("Not Interested")}
                                size={12}
                            />
                            <Text className={`text-[10px] ${value === "Not Interested" ? "text-black" : "text-gray-500"}`}>
                                Not Interested
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            onPress={() => handleInterestStatusChange("Bought")}
                        >
                            <Radio
                                checked={value === "Bought"}
                                onPress={() => handleInterestStatusChange("Bought")}
                                size={12}
                            />
                            <Text className={`text-[10px] ${value === "Bought" ? "text-black" : "text-gray-500"}`}>
                                Bought
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Follow up select date*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
                    <TouchableOpacity
    
                        className="mt-3 rounded-md bg-color3 py-3 px-4"
                        onPress={() => setIsCalendarModalVisible(true)}
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs">
                                {formatDisplayDateTime(localFollowUpDate)}
                            </Text>
                            <Calendar2Icon width={16} height={16} />
                        </View>
                    </TouchableOpacity>
                    {/* Calendar Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isCalendarModalVisible}
                    >
                        <View className="flex-1 justify-end bg-transparent">
                            <TouchableOpacity
                                className="flex-1"
                                activeOpacity={1}
                                onPress={() => setIsCalendarModalVisible(false)}
                            >
                                <View className="flex-1" />
                            </TouchableOpacity>
                            <View className="bg-white rounded-t-3xl" style={{ padding: 28, height: "80%" }}>
                                <CalendarModal
                                    onClose={handleCalendarClose}
                                    initialDate={currentScan?.followUpDate ? dayjs(currentScan.followUpDate) : undefined}
                                    selectingFor="from"
                                />
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Comments and Thread Section */}
                <View className="mt-10">
                    {/* Tab Buttons */}
                    <View className="flex-row gap-2 justify-between">
                        <TouchableOpacity 
                            className={`py-2 px-4 rounded-full ${activeTab === 'comments' ? 'bg-color3' : ''}`}
                            onPress={() => handleTabChange('comments')}
                        >
                            <Text className={`text-[10px] text-center  ${activeTab === 'comments' ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>
                                Comments
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className={`py-2 px-4 rounded-full ${activeTab === 'thread' ? 'bg-color3' : ''}`}
                            onPress={() => handleTabChange('thread')}
                        >
                            <Text className={`text-[10px] text-center  ${activeTab === 'thread' ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>
                                Thread
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity 
                            className={`py-2 px-4 rounded-full ${activeTab === 'history' ? 'bg-color3' : ''}`}
                            onPress={() => handleTabChange('history')}
                        >
                            <Text className={`text-[10px] text-center  ${activeTab === 'history' ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>
                                Assignment History
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    {activeTab === 'history' ? (
                        <View className="mt-5">
                            {isLoadingHistory ? (
                                <View className="flex-row justify-center items-center py-8">
                                    <ActivityIndicator size="large" color="#3D12FA" />
                                </View>
                            ) : assignmentHistory.length === 0 ? (
                                <View className="bg-color3 rounded-md p-4">
                                    <Text className="text-gray-500 text-xs">No assignment history</Text>
                                </View>
                            ) : (
                                <View>
                                    {/* Table Header */}
                                    <View className="flex-row border-y border-gray-200 py-2">
                                        <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                            <Text className="text-[10px] text-gray-500 font-medium text-center">Date</Text>
                                        </View>
                                        <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                            <Text className="text-[10px] text-gray-500 font-medium text-center">Time</Text>
                                        </View>
                                        <View style={{ flex: 2 }} className="flex-row items-center justify-center">
                                            <Text className="text-[10px] text-gray-500 font-medium text-center">Assigned to</Text>
                                        </View>
                                    </View>

                                    {/* Table Content */}
                                    <View className="gap-2 mt-2">
                                        {assignmentHistory.map((assignment, index) => (
                                            <View key={index} className="flex-row py-3 border-b border-gray-100">
                                                <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                    <Text className="text-xs">
                                                        {formatDateOnly(assignment.date)}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                    <Text className="text-xs">
                                                        {formatTimeOnly(assignment.date)}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 2 }} className="pl-2 flex-row items-center justify-start gap-2">
                                                    {renderUserIcon(assignment.userName, assignment.profileImage)}
                                                    <Text className="text-xs">
                                                        {assignment.userName}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : activeTab === 'comments' ? (
                        <View className="mt-5">
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
                        <View className="mt-5">
                            {isLoadingThread ? (
                                <SkeletonLoader />
                            ) : comments.slice().reverse().length === 0 ? (
                                <View className="bg-color3 rounded-md p-4">
                                    <Text className="text-gray-500 text-xs">No comments yet</Text>
                                </View>
                            ) : (
                                <View className="gap-2">
                                    {comments.slice().reverse().map((comment) => (
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
                                                    {getUserId(comment.users) === getUserId(userData?.scans?.find(scan => scan.$id === currentScanId)?.users) && (
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
                                                    {editingCommentId === comment.$id && getUserId(comment.users) === getUserId(userData?.scans?.find(scan => scan.$id === currentScanId)?.users) ? (
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
                                            {showOptions === comment.$id && getUserId(comment.users) === getUserId(userData?.scans?.find(scan => scan.$id === currentScanId)?.users) && (
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
                    onPress={() => handleUpdate()} 
                    className="mt-10"
                    loading={isUpdating}
                    disabled={isUpdating}
                />

                {/* Back to activities button*/}
                <ButtonComponent var2 label="Back to Activities" onPress={() => router.push("/home")} className="mt-5 mb-20" />
            </View>
        </ScrollView>
        </>
    );
};

export default CustomerLogScreen;