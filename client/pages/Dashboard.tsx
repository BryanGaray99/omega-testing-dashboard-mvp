import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  TestTube,
  FolderKanban,
  Plus,
  Activity,
  Zap,
  Bot,
} from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  activeTests: number;
  successRate: number;
  totalEndpoints: number;
  testsThisWeek: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
}

interface RecentActivity {
  id: string;
  type: "test_run" | "project_created" | "endpoint_added";
  title: string;
  status: "success" | "failed" | "pending";
  timestamp: string;
}

const mockStats: DashboardStats = {
  totalProjects: 12,
  activeTests: 248,
  successRate: 94.2,
  totalEndpoints: 67,
  testsThisWeek: 156,
  passedTests: 147,
  failedTests: 9,
  pendingTests: 12,
};

const mockActivity: RecentActivity[] = [
  {
    id: "1",
    type: "test_run",
    title: "User Authentication API tests completed",
    status: "success",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "project_created",
    title: "E-commerce Platform project created",
    status: "success",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    type: "test_run",
    title: "Payment Gateway integration tests",
    status: "failed",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "endpoint_added",
    title: "New POST /api/orders endpoint registered",
    status: "success",
    timestamp: "2 hours ago",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentActivity, setRecentActivity] =
    useState<RecentActivity[]>(mockActivity);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "test_run":
        return <PlayCircle className="h-4 w-4" />;
      case "project_created":
        return <FolderKanban className="h-4 w-4" />;
      case "endpoint_added":
        return <TestTube className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-success";
      case "failed":
        return "text-error";
      case "pending":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to TestCentral
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your comprehensive testing automation platform dashboard
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button asChild>
            <Link to="/projects">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/ai-assistant">
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTests}</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Endpoints
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/projects">
                <FolderKanban className="h-4 w-4 mr-2" />
                Create New Project
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/endpoints">
                <TestTube className="h-4 w-4 mr-2" />
                Register Endpoint
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/test-cases">
                <PlayCircle className="h-4 w-4 mr-2" />
                Build Test Case
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/execution">
                <Zap className="h-4 w-4 mr-2" />
                Run Tests
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "success"
                        ? "default"
                        : activity.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.passedTests}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">
              {stats.failedTests}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.pendingTests}
            </div>
            <p className="text-xs text-muted-foreground">In queue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
