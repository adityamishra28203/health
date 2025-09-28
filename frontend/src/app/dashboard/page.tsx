"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  FileText, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Download,
  Share2,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const healthData = [
  { name: "Jan", value: 85 },
  { name: "Feb", value: 78 },
  { name: "Mar", value: 92 },
  { name: "Apr", value: 88 },
  { name: "May", value: 95 },
  { name: "Jun", value: 90 },
];

const recentRecords = [
  {
    id: "1",
    type: "Prescription",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Hospital",
    date: "2024-01-15",
    status: "verified",
    hash: "0x1234...5678"
  },
  {
    id: "2",
    type: "Lab Report",
    doctor: "Dr. Rajesh Kumar",
    hospital: "Fortis Healthcare",
    date: "2024-01-10",
    status: "pending",
    hash: "0x2345...6789"
  },
  {
    id: "3",
    type: "Discharge Summary",
    doctor: "Dr. Sunita Patel",
    hospital: "Max Hospital",
    date: "2024-01-05",
    status: "verified",
    hash: "0x3456...7890"
  },
];

const recentClaims = [
  {
    id: "C001",
    amount: 25000,
    status: "approved",
    date: "2024-01-15",
    description: "Cardiology Treatment"
  },
  {
    id: "C002",
    amount: 15000,
    status: "pending",
    date: "2024-01-12",
    description: "Lab Tests"
  },
  {
    id: "C003",
    amount: 50000,
    status: "rejected",
    date: "2024-01-08",
    description: "Surgery"
  },
];

const pieData = [
  { name: "Prescriptions", value: 45, color: "#8884d8" },
  { name: "Lab Reports", value: 30, color: "#82ca9d" },
  { name: "Discharge Summaries", value: 15, color: "#ffc658" },
  { name: "Other", value: 10, color: "#ff7300" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [healthScore] = useState(85);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground">Here&apos;s your health data overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Health Records",
            value: "24",
            change: "+3 this month",
            icon: <FileText className="h-5 w-5" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
          },
          {
            title: "Active Claims",
            value: "3",
            change: "1 pending",
            icon: <CreditCard className="h-5 w-5" />,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
          },
          {
            title: "Health Score",
            value: `${healthScore}%`,
            change: "+5% this week",
            icon: <Heart className="h-5 w-5" />,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-950",
          },
          {
            title: "Blockchain Verified",
            value: "18",
            change: "100% secure",
            icon: <Shield className="h-5 w-5" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Health Score Trend</span>
              </CardTitle>
              <CardDescription>Your health score over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Score Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Health Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{healthScore}%</div>
                <p className="text-sm text-muted-foreground">Overall Health Score</p>
              </div>
              <Progress value={healthScore} className="h-2" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Physical Health</span>
                  <span>92%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mental Health</span>
                  <span>78%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lifestyle</span>
                  <span>85%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Records and Claims Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records">Recent Records</TabsTrigger>
            <TabsTrigger value="claims">Insurance Claims</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <div className="grid gap-4">
              {recentRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${getStatusColor(record.status)} text-white`}>
                            {getStatusIcon(record.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{record.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {record.doctor} • {record.hospital}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()} • {record.hash}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={record.status === "verified" ? "default" : "secondary"}>
                            {record.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            <div className="grid gap-4">
              {recentClaims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${getStatusColor(claim.status)} text-white`}>
                            {getStatusIcon(claim.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">Claim #{claim.id}</h3>
                            <p className="text-sm text-muted-foreground">{claim.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(claim.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold">₹{claim.amount.toLocaleString()}</div>
                            <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
                              {claim.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Record Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
