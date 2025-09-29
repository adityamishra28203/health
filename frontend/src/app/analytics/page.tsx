'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Activity,
  Heart,
  Shield,
  FileText,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const mockAnalytics = {
  healthScore: 85,
  totalRecords: 24,
  verifiedRecords: 20,
  pendingRecords: 4,
  totalClaims: 3,
  approvedClaims: 1,
  pendingClaims: 1,
  rejectedClaims: 1,
  totalClaimAmount: 180000,
  approvedAmount: 25000,
  trends: [
    { month: 'Jan', score: 80, records: 5, claims: 1 },
    { month: 'Feb', score: 82, records: 8, claims: 1 },
    { month: 'Mar', score: 85, records: 11, claims: 1 },
  ],
  recordTypes: [
    { type: 'Prescriptions', count: 8, percentage: 33 },
    { type: 'Lab Reports', count: 6, percentage: 25 },
    { type: 'Imaging', count: 4, percentage: 17 },
    { type: 'Vaccinations', count: 3, percentage: 12 },
    { type: 'Other', count: 3, percentage: 13 },
  ],
  monthlyActivity: [
    { month: 'January', records: 5, claims: 1 },
    { month: 'February', records: 8, claims: 1 },
    { month: 'March', records: 11, claims: 1 },
  ]
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/');
        return;
      }

      try {
        // Simulate loading analytics data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8">
      <div className="page-container">
        {/* Header */}
        <div className="section-spacing">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                Health Analytics
              </h1>
              <p className="text-lg text-gray-600">Insights into your health data and trends</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex gap-3"
            >
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Health Score Overview */}
        <div className="section-spacing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  Overall Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-4">
                    {analytics.healthScore}%
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4 mb-4">
                    <div 
                      className="bg-primary h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${analytics.healthScore}%` }}
                    ></div>
                  </div>
                  <p className="text-muted-foreground">
                    Based on your recent health records and activities
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="section-spacing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="card-enhanced">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Records</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totalRecords}</p>
                    </div>
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="card-enhanced">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified Records</p>
                      <p className="text-3xl font-bold text-green-600">{analytics.verifiedRecords}</p>
                    </div>
                    <Shield className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">83% verified</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="card-enhanced">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Insurance Claims</p>
                      <p className="text-3xl font-bold text-purple-600">{analytics.totalClaims}</p>
                    </div>
                    <Heart className="h-10 w-10 text-purple-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">1 new this month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="card-enhanced">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved Claims</p>
                      <p className="text-3xl font-bold text-green-600">${analytics.approvedAmount.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">33% approval rate</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="section-spacing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Health Score Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <LineChart className="h-6 w-6 text-primary" />
                    Health Score Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.trends.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between">
                        <span className="font-medium">{trend.month}</span>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${trend.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold w-12">{trend.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Record Types Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <PieChart className="h-6 w-6 text-primary" />
                    Record Types Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recordTypes.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                            }}
                          ></div>
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${type.percentage}%`,
                                backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold w-12">{type.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="section-spacing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Monthly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analytics.monthlyActivity.map((activity) => (
                    <div key={activity.month} className="text-center p-6 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4">{activity.month}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Records</span>
                          <Badge variant="outline">{activity.records}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Claims</span>
                          <Badge variant="outline">{activity.claims}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
