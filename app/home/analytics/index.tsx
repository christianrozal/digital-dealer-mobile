import { View, Text, TouchableOpacity, ScrollView, Modal, useWindowDimensions } from "react-native";
import React, { useMemo, useState } from "react";
import FilterIcon from "@/components/svg/filterIcon";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import AnalyticsFilter from "@/components/analyticsFilter";
import { showAnalyticsFilter, hideAnalyticsFilter } from "@/lib/store/uiSlice";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface CustomerStats {
  interestedIn: {
    Buying: number;
    Selling: number;
    Financing: number;
    Purchased: number;
  };
  interestStatus: {
    Hot: number;
    Warm: number;
    Cold: number;
    Bought: number;
  };
  dailyScans: { [key: string]: number };
}

const AnalyticsScreen = () => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowDimensions();
  const userData = useSelector((state: RootState) => state.user.data);
  const { analyticsFromDate, analyticsToDate, isAnalyticsFilterVisible } = useSelector((state: RootState) => state.ui);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingFor, setSelectingFor] = useState<"from" | "to">("from");

  // Get the date range text for display
  const getDateRangeText = useMemo(() => {
    if (!analyticsFromDate && !analyticsToDate) return "Last 7 days";

    const isFilterMatch = (filterFrom: dayjs.Dayjs, filterTo: dayjs.Dayjs) => {
      const selectedFrom = dayjs(analyticsFromDate);
      const selectedTo = dayjs(analyticsToDate);
      return selectedFrom.isSame(filterFrom, 'day') && selectedTo.isSame(filterTo, 'day');
    };

    // Check if it matches any quick filter
    const quickFilters = [
      {
        label: "Last 7 Days",
        getRange: () => ({
          from: dayjs().subtract(6, 'day').startOf('day'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "Last 30 Days",
        getRange: () => ({
          from: dayjs().subtract(29, 'day').startOf('day'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "This Week",
        getRange: () => ({
          from: dayjs().startOf('week'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "This Month",
        getRange: () => ({
          from: dayjs().startOf('month'),
          to: dayjs().endOf('day')
        })
      },
      {
        label: "Last Month",
        getRange: () => ({
          from: dayjs().subtract(1, 'month').startOf('month'),
          to: dayjs().subtract(1, 'month').endOf('month')
        })
      },
      {
        label: "This Year",
        getRange: () => ({
          from: dayjs().startOf('year'),
          to: dayjs().endOf('day')
        })
      }
    ];

    const matchingQuickFilter = quickFilters.find(filter => {
      const range = filter.getRange();
      return isFilterMatch(range.from, range.to);
    });

    if (matchingQuickFilter) {
      return matchingQuickFilter.label;
    }

    // If no quick filter matches, show the date range
    return `${dayjs(analyticsFromDate).format('D MMM')} - ${dayjs(analyticsToDate).format('D MMM')}`;
  }, [analyticsFromDate, analyticsToDate]);

  // Process the data to get latest scan per customer and statistics
  const stats = useMemo(() => {
    const initialStats: CustomerStats = {
      interestedIn: { Buying: 0, Selling: 0, Financing: 0, Purchased: 0 },
      interestStatus: { Hot: 0, Warm: 0, Cold: 0, Bought: 0 },
      dailyScans: {}
    };

    if (!userData?.scans) return initialStats;

    // If no filter is set, default to last 7 days
    const effectiveFromDate = analyticsFromDate || dayjs().subtract(6, 'day').startOf('day').toISOString();
    const effectiveToDate = analyticsToDate || dayjs().endOf('day').toISOString();

    // Group scans by customer ID and get the latest scan for each
    const latestScansMap = new Map();
    userData.scans.forEach(scan => {
      const scanDate = dayjs(scan.$createdAt);
      const isInRange = scanDate.isBetween(dayjs(effectiveFromDate), dayjs(effectiveToDate), 'day', '[]');
      
      if (!isInRange) return;

      const customerId = scan.customers?.$id;
      if (!customerId) return;

      const existingScan = latestScansMap.get(customerId);
      if (!existingScan || new Date(scan.$createdAt) > new Date(existingScan.$createdAt)) {
        latestScansMap.set(customerId, scan);
      }

      // Track daily scans
      const scanDateStr = scanDate.format('YYYY-MM-DD');
      initialStats.dailyScans[scanDateStr] = (initialStats.dailyScans[scanDateStr] || 0) + 1;
    });

    // Process latest scans to get statistics
    const stats = Array.from(latestScansMap.values()).reduce((acc, scan) => {
      if (scan.interestedIn) {
        acc.interestedIn[scan.interestedIn as keyof typeof acc.interestedIn] = 
          (acc.interestedIn[scan.interestedIn as keyof typeof acc.interestedIn] || 0) + 1;
      }

      if (scan.interestStatus) {
        acc.interestStatus[scan.interestStatus as keyof typeof acc.interestStatus] = 
          (acc.interestStatus[scan.interestStatus as keyof typeof acc.interestStatus] || 0) + 1;
      }

      return acc;
    }, initialStats);

    return stats;
  }, [userData?.scans, analyticsFromDate, analyticsToDate]);

  // Prepare data for charts
  const interestedInData = [
    { value: stats.interestedIn.Buying, color: '#8396FE', label: 'Buying' },
    { value: stats.interestedIn.Selling, color: '#B3A4F6', label: 'Selling' },
    { value: stats.interestedIn.Financing, color: '#8E72FF', label: 'Financing' },
    { value: stats.interestedIn.Purchased, color: '#A0ABFF', label: 'Purchased' }
  ];

  const interestStatusData = [
    { value: stats.interestStatus.Cold, color: '#8396FE', label: 'Cold' },
    { value: stats.interestStatus.Warm, color: '#B3A4F6', label: 'Warm' },
    { value: stats.interestStatus.Hot, color: '#8E72FF', label: 'Hot' },
    { value: stats.interestStatus.Bought, color: '#A0ABFF', label: 'Bought' }
  ];

  // Prepare line chart data
  const lineData = useMemo(() => {
    // Get the date range to display
    const fromDate = analyticsFromDate || dayjs().subtract(6, 'day').startOf('day').toISOString();
    const toDate = analyticsToDate || dayjs().endOf('day').toISOString();
    
    // Calculate number of days between dates
    const daysDiff = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;

    // If the range is 30 days or more, aggregate by weeks
    if (daysDiff >= 30) {
      const weekData = new Map();
      
      // Initialize all weeks in the range
      let currentDate = dayjs(fromDate);
      while (currentDate.isSameOrBefore(dayjs(toDate), 'day')) {
        const weekStart = currentDate.startOf('week');
        const weekKey = weekStart.format('YYYY-MM-DD');
        if (!weekData.has(weekKey)) {
          weekData.set(weekKey, {
            start: weekStart,
            count: 0
          });
        }
        currentDate = currentDate.add(1, 'day');
      }

      // Aggregate scan counts by week
      Object.entries(stats.dailyScans).forEach(([date, count]) => {
        const scanDate = dayjs(date);
        if (scanDate.isBetween(fromDate, toDate, 'day', '[]')) {
          const weekKey = scanDate.startOf('week').format('YYYY-MM-DD');
          if (weekData.has(weekKey)) {
            weekData.get(weekKey).count += count;
          }
        }
      });

      // Convert to line chart data format
      return Array.from(weekData.values()).map(week => ({
        value: week.count,
        label: `${week.start.format('D MMM')}`,
        dataPointText: week.count.toString()
      }));
    }

    // For shorter ranges, show daily data as before
    const dates = Array.from({ length: daysDiff }, (_, i) => {
      return dayjs(fromDate).add(i, 'day').format('YYYY-MM-DD');
    });

    return dates.map(date => ({
      value: stats.dailyScans[date] || 0,
      label: dayjs(date).format('D MMM'),
      dataPointText: stats.dailyScans[date]?.toString() || '0'
    }));
  }, [stats.dailyScans, analyticsFromDate, analyticsToDate]);

  // Check if there's any data
  const hasData = useMemo(() => {
    return lineData.some(item => item.value > 0);
  }, [lineData]);

  // Calculate totals
  const totalCustomers = Array.from(interestedInData).reduce((sum, item) => sum + item.value, 0);
  const totalByStatus = Array.from(interestStatusData).reduce((sum, item) => sum + item.value, 0);

  const handleCalendarClose = (date?: dayjs.Dayjs) => {
    if (date) {
      const isoDate = date.toISOString();
      if (selectingFor === "from") {
        setSelectingFor("from");
      } else {
        setSelectingFor("to");
      }
    }
    setShowCalendar(false);
  };

  return (
    <>
      <ScrollView className="px-5 pt-20">
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Analytics</Text>
          <TouchableOpacity onPress={() => dispatch(showAnalyticsFilter())}>
            <FilterIcon showCircle={!!(analyticsFromDate || analyticsToDate)} />
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-500 text-right mt-5">Date: {getDateRangeText}</Text>
        <View className="mt-5">
          <View className="">
          <Text className="font-semibold bg-color3 p-3 rounded-md w-full text-center">Scans</Text>
            
          </View>
        </View>
        <View className="mt-5">
          {hasData ? (
            <LineChart
              data={lineData}
              color="#3D12FA"
              hideDataPoints={false}
              dataPointsColor="#3D12FA"
              showValuesAsDataPointsText={true}
              textFontSize={10}
              noOfSections={3}
              maxValue={Math.max(...lineData.map(d => d.value)) + 5}
              width={windowWidth - 40}
              height={150}
              adjustToWidth={true}
              spacing={(windowWidth - 80) / lineData.length}
              rulesType="solid"
              rulesColor='#E5E7EB'
              xAxisColor={'#E5E7EB'}
              yAxisColor={'white'}
              yAxisTextStyle={{color: '#4b5563', fontSize: 12}}
              xAxisLabelTextStyle={{color: '#4b5563', fontSize: 10}}
              horizontalRulesStyle={{
                strokeDasharray: '',
              }}
              initialSpacing={20}
              endSpacing={20}
              xAxisLabelsVerticalShift={3}
              focusEnabled
            />
          ) : (
            <View className="h-[150px] items-center justify-center">
              <Text className="text-gray-500 text-sm">No scans recorded for this period</Text>
            </View>
          )}
        </View>

        {/* Lead Status Distribution */}
        <View className="mt-16 items-center">
          <Text className="font-semibold bg-color3 p-3 rounded-md w-full text-center">Lead Status Distribution</Text>
          <View className="mt-10 flex-row items-center gap-10">
            <PieChart 
              data={interestedInData} 
              donut  
              radius={70}  
              innerRadius={57} 
              centerLabelComponent={() => {
                return <View>
                  <Text className="font-bold text-center text-2xl text-color1">{totalCustomers}</Text>
                  <Text className="font-medium text-gray-500 text-sm text-center">Total</Text>
                </View>;
              }}
            />
            <View className="gap-3">
              {interestedInData.map((item, index) => (
                <View key={index} className="flex-row gap-3 items-center">
                  <View className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}/>
                  <Text className="text-xs text-gray-500">
                    {item.label} <Text className="font-bold text-gray-600">{item.value}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Customer Interest Distribution */}
        <View className="mt-16 mb-64 items-center">
          <Text className="font-semibold bg-color3 p-3 rounded-md w-full text-center">Customer Interest Distribution</Text>
          <View className="mt-10 flex-row items-center gap-10">
            <PieChart 
              data={interestStatusData} 

              donut  
              radius={70}  
              innerRadius={57} 
              centerLabelComponent={() => {
                return <View>
                  <Text className="font-bold text-2xl text-color1 text-center">{totalByStatus}</Text>
                  <Text className="font-medium text-gray-500 text-sm text-center">Total</Text>
                </View>;
              }}
            />
            <View className="gap-3">
              {interestStatusData.map((item, index) => (
                <View key={index} className="flex-row gap-3 items-center">
                  <View className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}/>
                  <Text className="text-xs text-gray-500">
                    {item.label} <Text className="font-bold text-gray-600">{item.value}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAnalyticsFilterVisible}
        onRequestClose={() => dispatch(hideAnalyticsFilter())}
      >
        <View className="flex-1 justify-end bg-transparent">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => dispatch(hideAnalyticsFilter())}
          >
            <View className="flex-1" />
          </TouchableOpacity>
          <View className="bg-white rounded-t-3xl" style={{ padding: 28, height: "70%" }}>
            <AnalyticsFilter onClose={() => dispatch(hideAnalyticsFilter())} />
          </View>
        </View>
      </Modal>
      </ScrollView>
    </>
  );
};

export default AnalyticsScreen;