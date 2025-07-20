import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  CheckCircle,
  XCircle,
  Zap,
  AlertTriangle,
  Eye,
  EyeOff,
  TestTube,
  Save,
} from "lucide-react";

export default function OpenAISettings() {
  const [isConnected, setIsConnected] = useState(true);
  const [apiKey, setApiKey] = useState("sk-...your-api-key...xyz");
  const [showApiKey, setShowApiKey] = useState(false);
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("2000");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [customPrompts, setCustomPrompts] = useState({
    testGeneration:
      "Generate comprehensive test cases for the following API endpoint. Include positive, negative, and edge case scenarios.",
    codeReview:
      "Review the following test code and suggest improvements for better coverage and maintainability.",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [usage] = useState({
    thisMonth: {
      requests: 1247,
      tokens: 156780,
      cost: 12.45,
    },
    lastMonth: {
      requests: 980,
      tokens: 124560,
      cost: 9.87,
    },
  });

  const handleTestConnection = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          OpenAI Configuration
        </h2>
        <p className="text-muted-foreground">
          Configure AI-powered features for intelligent test generation and
          analysis.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>OpenAI Connection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Connected to OpenAI</p>
                      <p className="text-sm text-muted-foreground">
                        API key is valid and working
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-error" />
                    <div>
                      <p className="font-medium">Connection failed</p>
                      <p className="text-sm text-muted-foreground">
                        Please check your API key and try again
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="0.7"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  placeholder="2000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Features */}
        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable AI Features</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI-powered test generation and suggestions
                </p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate test cases</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically suggest test cases for new endpoints
                </p>
              </div>
              <Switch
                checked={autoGenerate}
                onCheckedChange={setAutoGenerate}
                disabled={!aiEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testGeneration">Test Generation Prompt</Label>
              <Textarea
                id="testGeneration"
                value={customPrompts.testGeneration}
                onChange={(e) =>
                  setCustomPrompts({
                    ...customPrompts,
                    testGeneration: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeReview">Code Review Prompt</Label>
              <Textarea
                id="codeReview"
                value={customPrompts.codeReview}
                onChange={(e) =>
                  setCustomPrompts({
                    ...customPrompts,
                    codeReview: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">This Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Requests:
                    </span>
                    <span className="font-medium">
                      {usage.thisMonth.requests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tokens:
                    </span>
                    <span className="font-medium">
                      {usage.thisMonth.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cost:</span>
                    <span className="font-medium">
                      ${usage.thisMonth.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Last Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Requests:
                    </span>
                    <span className="font-medium">
                      {usage.lastMonth.requests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tokens:
                    </span>
                    <span className="font-medium">
                      {usage.lastMonth.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cost:</span>
                    <span className="font-medium">
                      ${usage.lastMonth.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Important Security Notice</p>
                <p className="text-xs text-muted-foreground">
                  Your API key is encrypted and stored securely. Never share
                  your API key with others or commit it to version control.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  );
}
