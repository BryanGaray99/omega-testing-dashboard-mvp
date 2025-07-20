import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Download,
  Upload,
  Play,
  Copy,
  Bot,
  Wand2,
  Settings,
  FileText,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  description: string;
  entity: string;
  section: string;
  method: string;
  testType: "functional" | "integration" | "e2e" | "performance";
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "ready" | "running" | "passed" | "failed";
  tags: string[];
  scenario: string;
  project: string;
  createdBy: "user" | "ai" | "parameterized";
  lastRun?: string;
  complexity: "simple" | "medium" | "complex";
  estimatedDuration: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const mockTestCases: TestCase[] = [
  {
    id: "1",
    name: "User Login Success Flow",
    description: "Test successful user authentication with valid credentials",
    entity: "User",
    section: "Authentication",
    method: "POST",
    testType: "functional",
    priority: "high",
    status: "ready",
    tags: ["auth", "login", "security"],
    scenario: `Feature: User Authentication
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid email "user@example.com"
    And I enter valid password "password123"
    And I click the login button
    Then I should see the dashboard
    And I should be logged in successfully`,
    project: "E-commerce Platform",
    createdBy: "user",
    lastRun: "2 hours ago",
    complexity: "simple",
    estimatedDuration: 30,
  },
  {
    id: "2",
    name: "Product Creation with Invalid Data",
    description:
      "Verify error handling when creating products with invalid data",
    entity: "Product",
    section: "Catalog",
    method: "POST",
    testType: "functional",
    priority: "medium",
    status: "draft",
    tags: ["product", "validation", "error-handling"],
    scenario: `Feature: Product Management
  Scenario Outline: Create product with invalid data
    Given I am authenticated as an admin
    When I try to create a product with <field> as "<value>"
    Then I should see error "<error_message>"
    
    Examples:
    | field | value | error_message |
    | name  | ""    | Name is required |
    | price | -10   | Price must be positive |`,
    project: "E-commerce Platform",
    createdBy: "parameterized",
    complexity: "medium",
    estimatedDuration: 45,
  },
];

const stepTemplates = [
  {
    id: "1",
    name: "Login Step",
    definition: "Given I am logged in as {user_type}",
    type: "given",
    category: "Authentication",
    usage: 150,
    rating: 4.8,
  },
  {
    id: "2",
    name: "Navigate to Page",
    definition: "When I navigate to {page_name}",
    type: "when",
    category: "Navigation",
    usage: 120,
    rating: 4.6,
  },
  {
    id: "3",
    name: "Verify Element",
    definition: "Then I should see {element_name}",
    type: "then",
    category: "Verification",
    usage: 200,
    rating: 4.9,
  },
];

export default function TestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>(mockTestCases);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<
    "form" | "parameterized" | "ai-natural-language"
  >("form");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI testing assistant. Describe the test scenario you'd like to create in plain English, and I'll help generate a comprehensive test case for you.",
      timestamp: "10:30 AM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const [newTestCase, setNewTestCase] = useState({
    name: "",
    description: "",
    entity: "",
    section: "",
    method: "",
    testType: "functional" as const,
    priority: "medium" as const,
    tags: [] as string[],
    scenario: "",
    project: "",
  });

  const filteredTestCases = testCases.filter((testCase) => {
    const matchesSearch =
      testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testCase.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesProject =
      projectFilter === "all" || testCase.project === projectFilter;
    const matchesStatus =
      statusFilter === "all" || testCase.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || testCase.priority === priorityFilter;
    return matchesSearch && matchesProject && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
      case "running":
        return <Clock className="h-4 w-4 text-warning" />;
      case "ready":
        return <Play className="h-4 w-4 text-primary" />;
      case "draft":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      case "ready":
        return "default";
      case "draft":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getCreationModeIcon = (mode: string) => {
    switch (mode) {
      case "form":
        return <Edit className="h-4 w-4" />;
      case "parameterized":
        return <Settings className="h-4 w-4" />;
      case "ai-natural-language":
        return <Bot className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on your description, I'll create a test case for "${chatInput}". Here's what I suggest:

**Test Name:** ${chatInput.split(" ").slice(0, 3).join(" ")} Test
**Type:** Functional Test
**Priority:** Medium

**Generated Scenario:**
\`\`\`gherkin
Feature: ${chatInput.split(" ")[0]} functionality
  Scenario: ${chatInput}
    Given the system is ready
    When the user performs the action
    Then the expected result should occur
\`\`\`

Would you like me to refine this test case or add more specific steps?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const handleCreateTestCase = () => {
    if (!newTestCase.name || !newTestCase.entity) {
      return;
    }

    const testCase: TestCase = {
      id: Date.now().toString(),
      name: newTestCase.name,
      description: newTestCase.description,
      entity: newTestCase.entity,
      section: newTestCase.section,
      method: newTestCase.method,
      testType: newTestCase.testType,
      priority: newTestCase.priority,
      status: "draft",
      tags: newTestCase.tags,
      scenario: newTestCase.scenario,
      project: newTestCase.project || "Default Project",
      createdBy: creationMode === "ai-natural-language" ? "ai" : creationMode,
      complexity: "medium",
      estimatedDuration: 30,
    };

    setTestCases([testCase, ...testCases]);
    setNewTestCase({
      name: "",
      description: "",
      entity: "",
      section: "",
      method: "",
      testType: "functional",
      priority: "medium",
      tags: [],
      scenario: "",
      project: "",
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Cases</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage test scenarios with AI assistance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Test Case
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
                <DialogDescription>
                  Choose your preferred creation method and build comprehensive
                  test scenarios.
                </DialogDescription>
              </DialogHeader>

              {/* Creation Mode Switch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                {[
                  {
                    id: "form",
                    label: "Form Builder",
                    icon: "edit",
                    description: "Traditional form-based test case creation",
                  },
                  {
                    id: "parameterized",
                    label: "Parameterized",
                    icon: "tune",
                    description: "Create test cases with dynamic parameters",
                  },
                  {
                    id: "ai-natural-language",
                    label: "AI Assistant",
                    icon: "smart_toy",
                    description: "Generate test cases using natural language",
                  },
                ].map((mode) => (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all ${
                      creationMode === mode.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setCreationMode(mode.id as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-2 flex justify-center">
                        {getCreationModeIcon(mode.id)}
                      </div>
                      <h3 className="font-medium text-sm">{mode.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mode.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Tabs value={creationMode} className="w-full">
                <TabsContent value="form" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="test-name">Test Name</Label>
                      <Input
                        id="test-name"
                        placeholder="User Login Success Flow"
                        value={newTestCase.name}
                        onChange={(e) =>
                          setNewTestCase({
                            ...newTestCase,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="entity">Entity</Label>
                      <Input
                        id="entity"
                        placeholder="User"
                        value={newTestCase.entity}
                        onChange={(e) =>
                          setNewTestCase({
                            ...newTestCase,
                            entity: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this test case validates..."
                      value={newTestCase.description}
                      onChange={(e) =>
                        setNewTestCase({
                          ...newTestCase,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Test Type</Label>
                      <Select
                        value={newTestCase.testType}
                        onValueChange={(value) =>
                          setNewTestCase({
                            ...newTestCase,
                            testType: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="functional">Functional</SelectItem>
                          <SelectItem value="integration">
                            Integration
                          </SelectItem>
                          <SelectItem value="e2e">End-to-End</SelectItem>
                          <SelectItem value="performance">
                            Performance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Priority</Label>
                      <Select
                        value={newTestCase.priority}
                        onValueChange={(value) =>
                          setNewTestCase({
                            ...newTestCase,
                            priority: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Method</Label>
                      <Select
                        value={newTestCase.method}
                        onValueChange={(value) =>
                          setNewTestCase({ ...newTestCase, method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scenario">Gherkin Scenario</Label>
                    <Textarea
                      id="scenario"
                      placeholder={`Feature: User Authentication
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in`}
                      value={newTestCase.scenario}
                      onChange={(e) =>
                        setNewTestCase({
                          ...newTestCase,
                          scenario: e.target.value,
                        })
                      }
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="parameterized" className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-3">
                      Parameterized Test Builder
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create test cases with dynamic parameters and data tables
                      for comprehensive scenario coverage.
                    </p>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Base Scenario Template</Label>
                        <Textarea
                          placeholder={`Scenario Outline: Login with different credentials
  Given I am on the login page
  When I enter <email> and <password>
  Then I should see <result>
  
Examples:
| email | password | result |
| valid@email.com | correct123 | dashboard |
| invalid@email.com | wrong | error message |`}
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Parameter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Example Row
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai-natural-language" className="space-y-4">
                  <div className="border rounded-lg h-96 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Describe your test scenario in plain English..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTestCase}>Create Test Case</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="E-commerce Platform">
                E-commerce Platform
              </SelectItem>
              <SelectItem value="Auth Service">Auth Service</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestCases.map((testCase) => (
          <Card key={testCase.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(testCase.status)}
                  <Badge variant={getStatusColor(testCase.status) as any}>
                    {testCase.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Test Case
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Test Case
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{testCase.name}</CardTitle>
              <p className="text-sm text-muted-foreground overflow-hidden h-10">
                {testCase.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(testCase.priority)}`}
                  >
                    {testCase.priority}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {testCase.testType}
                  </Badge>
                  {testCase.createdBy === "ai" && (
                    <Badge variant="outline" className="text-xs">
                      <Bot className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entity:</span>
                  <span className="font-medium">{testCase.entity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="font-medium">{testCase.section}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    ~{testCase.estimatedDuration}s
                  </span>
                </div>
                {testCase.lastRun && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span className="font-medium">{testCase.lastRun}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {testCase.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="pt-3 border-t">
                  <Button className="w-full" variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Run Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTestCases.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No test cases found matching your criteria.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Test Case
          </Button>
        </div>
      )}

      {/* Step Template Library (floating button) */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full shadow-lg">
          <Wand2 className="h-5 w-5 mr-2" />
          Step Templates
        </Button>
      </div>
    </div>
  );
}
