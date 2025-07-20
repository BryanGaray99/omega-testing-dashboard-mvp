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
  Grid3X3,
  List,
  GitBranch,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  TestTube,
  Zap,
} from "lucide-react";

interface Endpoint {
  id: string;
  name: string;
  path: string;
  section: string;
  entity: string;
  project: string;
  methods: EndpointMethod[];
  status: "active" | "inactive" | "analyzing";
  lastAnalyzed: string;
  artifactsGenerated: boolean;
  testCases: number;
}

interface EndpointMethod {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requestBodyDefinition?: FieldDefinition[];
  description?: string;
  requiresAuth?: boolean;
}

interface FieldDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description?: string;
}

const mockEndpoints: Endpoint[] = [
  {
    id: "1",
    name: "User Authentication",
    path: "/api/auth/login",
    section: "Authentication",
    entity: "User",
    project: "E-commerce Platform",
    methods: [
      {
        method: "POST",
        requestBodyDefinition: [
          { name: "email", type: "string", required: true },
          { name: "password", type: "string", required: true },
        ],
        requiresAuth: false,
      },
    ],
    status: "active",
    lastAnalyzed: "2 hours ago",
    artifactsGenerated: true,
    testCases: 12,
  },
  {
    id: "2",
    name: "Product Catalog",
    path: "/api/products",
    section: "Catalog",
    entity: "Product",
    project: "E-commerce Platform",
    methods: [
      { method: "GET", requiresAuth: false },
      {
        method: "POST",
        requestBodyDefinition: [
          { name: "name", type: "string", required: true },
          { name: "price", type: "number", required: true },
          { name: "description", type: "string", required: false },
        ],
        requiresAuth: true,
      },
    ],
    status: "analyzing",
    lastAnalyzed: "1 hour ago",
    artifactsGenerated: false,
    testCases: 0,
  },
];

export default function Endpoints() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(mockEndpoints);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "tree">("grid");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    projectId: "",
    section: "",
    entityName: "",
    path: "",
    name: "",
    description: "",
    methods: [{ method: "GET" as const, requiresAuth: false }],
  });

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject =
      projectFilter === "all" || endpoint.project === projectFilter;
    const matchesMethod =
      methodFilter === "all" ||
      endpoint.methods.some((m) => m.method === methodFilter);
    const matchesStatus =
      statusFilter === "all" || endpoint.status === statusFilter;
    return matchesSearch && matchesProject && matchesMethod && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-error" />;
      case "analyzing":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      case "analyzing":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PUT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const addMethod = () => {
    setNewEndpoint({
      ...newEndpoint,
      methods: [...newEndpoint.methods, { method: "GET", requiresAuth: false }],
    });
  };

  const removeMethod = (index: number) => {
    setNewEndpoint({
      ...newEndpoint,
      methods: newEndpoint.methods.filter((_, i) => i !== index),
    });
  };

  const updateMethod = (index: number, updates: Partial<EndpointMethod>) => {
    const updatedMethods = [...newEndpoint.methods];
    updatedMethods[index] = { ...updatedMethods[index], ...updates };
    setNewEndpoint({ ...newEndpoint, methods: updatedMethods });
  };

  const handleRegisterEndpoint = () => {
    if (!newEndpoint.path || !newEndpoint.entityName) {
      return;
    }

    const endpoint: Endpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name || `${newEndpoint.entityName} API`,
      path: newEndpoint.path,
      section: newEndpoint.section,
      entity: newEndpoint.entityName,
      project: newEndpoint.projectId || "Default Project",
      methods: newEndpoint.methods,
      status: "analyzing",
      lastAnalyzed: "Just now",
      artifactsGenerated: false,
      testCases: 0,
    };

    setEndpoints([endpoint, ...endpoints]);
    setNewEndpoint({
      projectId: "",
      section: "",
      entityName: "",
      path: "",
      name: "",
      description: "",
      methods: [{ method: "GET", requiresAuth: false }],
    });
    setIsRegisterDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Endpoints</h1>
          <p className="mt-2 text-muted-foreground">
            Manage API endpoints and generate testing artifacts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog
            open={isRegisterDialogOpen}
            onOpenChange={setIsRegisterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Endpoint</DialogTitle>
                <DialogDescription>
                  Configure a new API endpoint for testing and analysis.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="methods">Methods</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project">Project</Label>
                      <Select
                        value={newEndpoint.projectId}
                        onValueChange={(value) =>
                          setNewEndpoint({ ...newEndpoint, projectId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ecommerce">
                            E-commerce Platform
                          </SelectItem>
                          <SelectItem value="auth">Auth Service</SelectItem>
                          <SelectItem value="payment">
                            Payment Gateway
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="section">Section</Label>
                        <Input
                          id="section"
                          placeholder="e.g., Authentication"
                          value={newEndpoint.section}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              section: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="entity">Entity Name</Label>
                        <Input
                          id="entity"
                          placeholder="e.g., User"
                          value={newEndpoint.entityName}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              entityName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="path">API Path</Label>
                      <Input
                        id="path"
                        placeholder="/api/users/{id}"
                        value={newEndpoint.path}
                        onChange={(e) =>
                          setNewEndpoint({
                            ...newEndpoint,
                            path: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Display Name (Optional)</Label>
                      <Input
                        id="name"
                        placeholder="User Management API"
                        value={newEndpoint.name}
                        onChange={(e) =>
                          setNewEndpoint({
                            ...newEndpoint,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the endpoint..."
                        value={newEndpoint.description}
                        onChange={(e) =>
                          setNewEndpoint({
                            ...newEndpoint,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="methods" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">HTTP Methods</h3>
                    <Button onClick={addMethod} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Method
                    </Button>
                  </div>
                  {newEndpoint.methods.map((method, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Select
                              value={method.method}
                              onValueChange={(value) =>
                                updateMethod(index, {
                                  method: value as any,
                                })
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`auth-${index}`}
                                checked={method.requiresAuth}
                                onCheckedChange={(checked) =>
                                  updateMethod(index, {
                                    requiresAuth: !!checked,
                                  })
                                }
                              />
                              <Label htmlFor={`auth-${index}`}>
                                Requires Auth
                              </Label>
                            </div>
                          </div>
                          {newEndpoint.methods.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMethod(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      {(method.method === "POST" ||
                        method.method === "PUT" ||
                        method.method === "PATCH") && (
                        <CardContent>
                          <Label className="text-sm font-medium">
                            Request Body Definition
                          </Label>
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              Request body builder will be available in the next
                              update. For now, the system will auto-analyze the
                              endpoint.
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-3">Endpoint Preview</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Name:</strong>{" "}
                        {newEndpoint.name ||
                          `${newEndpoint.entityName} API` ||
                          "Unnamed Endpoint"}
                      </div>
                      <div>
                        <strong>Path:</strong> {newEndpoint.path || "Not set"}
                      </div>
                      <div>
                        <strong>Section:</strong>{" "}
                        {newEndpoint.section || "Not set"}
                      </div>
                      <div>
                        <strong>Entity:</strong>{" "}
                        {newEndpoint.entityName || "Not set"}
                      </div>
                      <div>
                        <strong>Methods:</strong>{" "}
                        {newEndpoint.methods.map((m) => m.method).join(", ")}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRegisterDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRegisterEndpoint}>
                  Register & Analyze
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
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
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="analyzing">Analyzing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "tree" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("tree")}
          >
            <GitBranch className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEndpoints.map((endpoint) => (
          <Card key={endpoint.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(endpoint.status)}
                  <Badge variant={getStatusColor(endpoint.status) as any}>
                    {endpoint.status}
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
                      Edit Endpoint
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <TestTube className="mr-2 h-4 w-4" />
                      Generate Tests
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Zap className="mr-2 h-4 w-4" />
                      Re-analyze
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Endpoint
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{endpoint.name}</CardTitle>
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <code className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
                  {endpoint.path}
                </code>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {endpoint.methods.map((method, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(method.method)}`}
                    >
                      {method.method}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="font-medium">{endpoint.section}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entity:</span>
                  <span className="font-medium">{endpoint.entity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Test Cases:</span>
                  <span className="font-medium">{endpoint.testCases}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Analyzed:</span>
                  <span className="font-medium">{endpoint.lastAnalyzed}</span>
                </div>
                <div className="pt-3 border-t">
                  <Button className="w-full" variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEndpoints.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No endpoints found matching your criteria.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsRegisterDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Your First Endpoint
          </Button>
        </div>
      )}
    </div>
  );
}
