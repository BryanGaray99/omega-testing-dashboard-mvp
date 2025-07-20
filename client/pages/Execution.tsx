import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  Calendar,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
  MoreVertical,
  Search,
  RefreshCw,
} from "lucide-react";

interface ExecutionItem {
  id: string;
  name: string;
  project: string;
  testCases: number;
  status: "queued" | "running" | "completed" | "failed" | "paused";
  progress: number;
  startTime: string;
  duration?: string;
  currentStep?: string;
  passed: number;
  failed: number;
  skipped: number;
  environment: string;
  executedBy: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  details?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
}

const mockExecutions: ExecutionItem[] = [
  {
    id: "1",
    name: "User Authentication Suite",
    project: "E-commerce Platform",
    testCases: 25,
    status: "running",
    progress: 65,
    startTime: "10:30 AM",
    currentStep: "Testing login validation",
    passed: 16,
    failed: 0,
    skipped: 1,
    environment: "staging",
    executedBy: "John Doe",
  },
  {
    id: "2",
    name: "Payment Integration Tests",
    project: "E-commerce Platform",
    testCases: 18,
    status: "queued",
    progress: 0,
    startTime: "11:00 AM",
    passed: 0,
    failed: 0,
    skipped: 0,
    environment: "staging",
    executedBy: "Jane Smith",
  },
  {
    id: "3",
    name: "Product Catalog API",
    project: "E-commerce Platform",
    testCases: 32,
    status: "completed",
    progress: 100,
    startTime: "09:15 AM",
    duration: "12m 45s",
    passed: 28,
    failed: 2,
    skipped: 2,
    environment: "production",
    executedBy: "System",
  },
];

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "10:45:32",
    level: "info",
    message: "Starting test case: User Login with Valid Credentials",
  },
  {
    id: "2",
    timestamp: "10:45:35",
    level: "success",
    message: "User authentication successful",
  },
  {
    id: "3",
    timestamp: "10:45:38",
    level: "warning",
    message: "Slow response time detected (2.5s)",
    details: "Response time exceeded threshold of 2 seconds",
  },
];

const mockPerformanceMetrics: PerformanceMetric[] = [
  { name: "Memory Usage", value: 68, unit: "%", status: "warning" },
  { name: "CPU Usage", value: 34, unit: "%", status: "good" },
  { name: "Network Latency", value: 145, unit: "ms", status: "good" },
  { name: "Disk I/O", value: 23, unit: "MB/s", status: "good" },
];

export default function Execution() {
  const [executions, setExecutions] = useState<ExecutionItem[]>(mockExecutions);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >(mockPerformanceMetrics);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setExecutions((prev) =>
        prev.map((execution) => {
          if (execution.status === "running" && execution.progress < 100) {
            return {
              ...execution,
              progress: Math.min(execution.progress + Math.random() * 3, 100),
              passed: execution.passed + (Math.random() > 0.8 ? 1 : 0),
            };
          }
          return execution;
        }),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch =
      execution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-primary animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
      case "paused":
        return <Pause className="h-4 w-4 text-warning" />;
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "default";
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "paused":
        return "secondary";
      case "queued":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "success":
        return "text-green-600 dark:text-green-400";
      case "info":
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "good":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  const totalTests = executions.reduce((sum, e) => sum + e.testCases, 0);
  const totalPassed = executions.reduce((sum, e) => sum + e.passed, 0);
  const totalFailed = executions.reduce((sum, e) => sum + e.failed, 0);
  const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Execution</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor and manage test runs in real-time
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="destructive" disabled>
            <Square className="h-4 w-4 mr-2" />
            Stop All
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Start Execution
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executions.length}</div>
            <p className="text-xs text-muted-foreground">3 active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalPassed}</div>
            <p className="text-xs text-muted-foreground">This session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Failed</CardTitle>
            <XCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">This session</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Executions</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search executions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExecutions.map((execution) => (
                  <Card key={execution.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(execution.status)}
                            <Badge
                              variant={getStatusColor(execution.status) as any}
                            >
                              {execution.status}
                            </Badge>
                            <span className="font-medium">
                              {execution.name}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {execution.project} • {execution.testCases} test
                            cases • {execution.environment}
                          </div>
                          {execution.status === "running" && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{execution.progress.toFixed(0)}%</span>
                              </div>
                              <Progress value={execution.progress} />
                              {execution.currentStep && (
                                <p className="text-sm text-muted-foreground">
                                  {execution.currentStep}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <span>Started: {execution.startTime}</span>
                            {execution.duration && (
                              <span>Duration: {execution.duration}</span>
                            )}
                            <span>
                              Results: {execution.passed}✓ {execution.failed}✗{" "}
                              {execution.skipped}↷
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Monitoring */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{metric.name}</span>
                      <span
                        className={`font-medium ${getMetricStatusColor(metric.status)}`}
                      >
                        {metric.value.toFixed(0)}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Live Logs</CardTitle>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-xs text-muted-foreground min-w-[60px]">
                        {log.timestamp}
                      </span>
                      <span
                        className={`font-mono ${getLogLevelColor(log.level)}`}
                      >
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                    {log.details && (
                      <div className="ml-16 text-xs text-muted-foreground">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
