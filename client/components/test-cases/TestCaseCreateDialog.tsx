import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Settings,
  Bot,
  Send,
  Wand2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

import { CreateTestCaseData } from "@/components/types/testCase.types";

interface TestCaseCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projects: string[];
  onCreate: () => void;
}

export default function TestCaseCreateDialog({
  isOpen,
  onOpenChange,
  projects,
  onCreate,
}: TestCaseCreateDialogProps) {
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

    onCreate();
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
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test Case</DialogTitle>
          <DialogDescription>
            Choose your preferred creation method and build comprehensive test
            scenarios.
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
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="e2e">End-to-End</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
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
              <h3 className="font-medium mb-3">Parameterized Test Builder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create test cases with dynamic parameters and data tables for
                comprehensive scenario coverage.
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTestCase}>Create Test Case</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 