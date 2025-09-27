import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  ProgressBar,
  Chip,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { useAuth } from '../contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const { user } = useAuth();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const healthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [85, 78, 92, 88, 95, 90],
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const stats = [
    {
      title: 'Health Records',
      value: '24',
      change: '+3 this month',
      icon: 'document-text',
      color: '#3b82f6',
    },
    {
      title: 'Active Claims',
      value: '3',
      change: '1 pending',
      icon: 'card',
      color: '#10b981',
    },
    {
      title: 'Health Score',
      value: `${healthScore}%`,
      change: '+5% this week',
      icon: 'heart',
      color: '#ef4444',
    },
    {
      title: 'Blockchain Verified',
      value: '18',
      change: '100% secure',
      icon: 'shield-checkmark',
      color: '#8b5cf6',
    },
  ];

  const recentRecords = [
    {
      id: '1',
      type: 'Prescription',
      doctor: 'Dr. Priya Sharma',
      hospital: 'Apollo Hospital',
      date: '2024-01-15',
      status: 'verified',
    },
    {
      id: '2',
      type: 'Lab Report',
      doctor: 'Dr. Rajesh Kumar',
      hospital: 'Fortis Healthcare',
      date: '2024-01-10',
      status: 'pending',
    },
    {
      id: '3',
      type: 'Discharge Summary',
      doctor: 'Dr. Sunita Patel',
      hospital: 'Max Hospital',
      date: '2024-01-05',
      status: 'verified',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.welcomeTitle}>
            Welcome back, {user?.firstName}!
          </Title>
          <Paragraph style={styles.subtitle}>
            Here's your health data overview
          </Paragraph>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <Ionicons name={stat.icon as any} size={24} color="white" />
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                    <Text style={styles.statChange}>{stat.change}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Health Score Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Health Score Trend</Title>
            <Paragraph style={styles.chartSubtitle}>
              Your health score over the last 6 months
            </Paragraph>
            <LineChart
              data={healthData}
              width={screenWidth - 80}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Health Score Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title style={styles.progressTitle}>Health Score</Title>
            <View style={styles.progressContainer}>
              <Text style={styles.progressValue}>{healthScore}%</Text>
              <ProgressBar
                progress={healthScore / 100}
                color="#6366f1"
                style={styles.progressBar}
              />
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Physical Health</Text>
                <Text style={styles.progressPercentage}>92%</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Mental Health</Text>
                <Text style={styles.progressPercentage}>78%</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Lifestyle</Text>
                <Text style={styles.progressPercentage}>85%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Records */}
        <Card style={styles.recordsCard}>
          <Card.Content>
            <Title style={styles.recordsTitle}>Recent Records</Title>
            {recentRecords.map((record) => (
              <View key={record.id} style={styles.recordItem}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordType}>{record.type}</Text>
                  <Text style={styles.recordDoctor}>
                    {record.doctor} • {record.hospital}
                  </Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                </View>
                <View style={styles.recordStatus}>
                  <Chip
                    icon={getStatusIcon(record.status)}
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(record.status) + '20' },
                    ]}
                    textStyle={{ color: getStatusColor(record.status) }}
                  >
                    {record.status}
                  </Chip>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to add record screen
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 10,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    elevation: 2,
  },
  statContent: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statChange: {
    fontSize: 10,
    color: '#10b981',
    marginTop: 2,
  },
  chartCard: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressCard: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressDetails: {
    gap: 8,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recordsCard: {
    margin: 20,
    marginTop: 10,
    elevation: 2,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  recordInfo: {
    flex: 1,
  },
  recordType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recordDoctor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  recordStatus: {
    marginLeft: 12,
  },
  statusChip: {
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },
});
