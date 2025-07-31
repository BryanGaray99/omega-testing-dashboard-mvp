import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Trash2,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  TestTube,
  Zap,
  AlertCircle,
  FileText,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/v1/api";

interface Endpoint {
  endpointId: string; // Changed from id to endpointId to match backend
  name: string;
  path: string;
  section: string;
  entityName: string; // Changed from entity to entityName to match backend
  projectId: string;
  projectName?: string; // Added for display purposes
  methods: EndpointMethod[]; // Updated to match backend structure with requestBodyDefinition
  status: "pending" | "analyzing" | "generating" | "ready" | "failed"; // Updated to match backend status values
  createdAt: string;
  updatedAt?: string; // Optional since backend doesn't always return it
  description?: string; // Optional description
  generatedArtifacts?: GeneratedArtifacts;
  analysisResults?: AnalysisResults;
  // Removed fields that backend doesn't provide: lastAnalyzed, artifactsGenerated, testCases
}

interface GeneratedArtifacts {
  feature?: string;
  steps?: string;
  fixture?: string;
  schema?: string;
  types?: string;
  client?: string;
}

interface AnalysisResults {
  [method: string]: {
    statusCode?: number;
    responseFields?: ResponseField[];
    contentType?: string;
  };
}

interface ResponseField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  example?: any;
}

interface EndpointMethod {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requestBodyDefinition?: FieldDefinition[];
  description?: string;
  requiresAuth: boolean;
}

interface FieldDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  example?: any;
  validations?: Record<string, any>;
  required?: boolean;
  description?: string;
}

interface CreateEndpointData {
  name: string;
  path: string;
  section: string;
  entityName: string; // Changed from entity to entityName to match backend
  methods: EndpointMethod[];
  description?: string;
}

interface UpdateEndpointData {
  name?: string;
  path?: string;
  section?: string;
  entityName?: string; // Changed from entity to entityName to match backend
  methods?: EndpointMethod[];
  description?: string;
}

// API Functions
async function fetchEndpoints(projectId?: string) {
  if (projectId) {
    // Fetch endpoints for a specific project
    const url = `${API_BASE}/projects/${projectId}/endpoints`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching endpoints");
    return res.json();
  } else {
    // Fetch all endpoints in a single call
    const url = `${API_BASE}/endpoints`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching endpoints");
    return res.json();
  }
}

async function createEndpoint(projectId: string, endpointData: CreateEndpointData) {
  const url = `${API_BASE}/projects/${projectId}/endpoints`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(endpointData),
  });
  if (!res.ok) throw new Error("Error creating endpoint");
  return res.json();
}

async function updateEndpoint(projectId: string, endpointId: string, endpointData: UpdateEndpointData) {
  const url = `${API_BASE}/projects/${projectId}/endpoints/${endpointId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(endpointData),
  });
  if (!res.ok) throw new Error("Error updating endpoint");
  return res.json();
}

async function deleteEndpoint(projectId: string, endpointId: string) {
  const url = `${API_BASE}/projects/${projectId}/endpoints/${endpointId}`;
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error deleting endpoint");
  return res.json();
}

async function reanalyzeEndpoint(projectId: string, endpointId: string) {
  const url = `${API_BASE}/projects/${projectId}/endpoints/${endpointId}/analyze`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Error reanalyzing endpoint");
  return res.json();
}

// Helper function to reload all data
async function reloadData() {
  try {
    // Fetch all endpoints in a single call
    const endpointsResponse = await fetch(`${API_BASE}/endpoints`);
    if (endpointsResponse.ok) {
      const endpointsData = await endpointsResponse.json();
      const allEndpoints = endpointsData.data || [];
      
      // Extract unique project IDs from endpoints to get project names
      const projectIds = [...new Set(allEndpoints.map((endpoint: any) => endpoint.projectId))];
      
      // Fetch project details for the unique project IDs
      const projectsResponse = await fetch(`${API_BASE}/projects`);
      let allProjects: any[] = [];
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        allProjects = projectsData.data || [];
      }
      
      // Add project names to endpoints and map to frontend format
      const endpointsWithProject = allEndpoints.map((endpoint: any) => {
        const project = allProjects.find((p: any) => p.id === endpoint.projectId);
        return {
          endpointId: endpoint.endpointId,
          name: endpoint.name,
          path: endpoint.path,
          section: endpoint.section,
          entityName: endpoint.entityName,
          projectId: endpoint.projectId,
          projectName: project?.name || 'Unknown Project',
          methods: endpoint.methods,
          status: endpoint.status,
          createdAt: endpoint.createdAt,
          updatedAt: endpoint.updatedAt,
          generatedArtifacts: endpoint.generatedArtifacts,
          analysisResults: endpoint.analysisResults
        };
      });
      
      return { projects: allProjects, endpoints: endpointsWithProject };
    }
    return { projects: [], endpoints: [] };
  } catch (error) {
    console.error("Error reloading data:", error);
    return { projects: [], endpoints: [] };
  }
}

export default function Endpoints() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [newEndpoint, setNewEndpoint] = useState({
    projectId: "",
    section: "",
    entityName: "",
    path: "",
    name: "",
    description: "",
    methods: [] as EndpointMethod[],
  });
  
  // Estado para controlar el DropdownMenu
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Estado para el diálogo comprehensivo de endpoint
  const [isComprehensiveDialogOpen, setIsComprehensiveDialogOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [editingComprehensiveEndpoint, setEditingComprehensiveEndpoint] = useState<Endpoint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registerActiveTab, setRegisterActiveTab] = useState("basic");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Función para limpiar todos los estados de diálogos
  const resetDialogStates = useCallback(() => {
    setIsRegisterDialogOpen(false);
    setEditingEndpoint(null);
    setOpenDropdownId(null); // Cerrar cualquier dropdown abierto
    setIsComprehensiveDialogOpen(false);
    setSelectedEndpoint(null);
    setEditingComprehensiveEndpoint(null);
    setNewEndpoint({
      projectId: "",
      section: "",
      entityName: "",
      path: "",
      name: "",
      description: "",
      methods: [] as EndpointMethod[],
    });
    setRegisterActiveTab("basic");
  }, []);

  // Función para manejar el cierre de diálogos de forma segura
  const handleDialogClose = useCallback(() => {
    // Usar requestAnimationFrame para asegurar que el DOM se actualice correctamente
    requestAnimationFrame(() => {
      resetDialogStates();
    });
  }, [resetDialogStates]);

  // Fetch projects and endpoints
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
        setProjects(allProjects);
        setEndpoints(allEndpoints);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject =
      projectFilter === "all" || endpoint.projectId === projectFilter;
    const matchesMethod =
      methodFilter === "all" ||
      endpoint.methods.some((m) => m.method === methodFilter); // Fixed: methods is now EndpointMethod[]
    const matchesStatus =
      statusFilter === "all" || endpoint.status === statusFilter;
    return matchesSearch && matchesProject && matchesMethod && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "analyzing":
      case "generating":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "failed":
        return "destructive";
      case "analyzing":
      case "generating":
      case "pending":
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

              // Helper function to generate example JSON from requestBodyDefinition
            const generateExample = (requestBodyDefinition: FieldDefinition[]): any => {
              const example: any = {};
              
              requestBodyDefinition.forEach(field => {
                if (field.example !== undefined) {
                  // Handle different types of examples properly
                  if (typeof field.example === 'string' && field.example.startsWith('http')) {
                    example[field.name] = field.example;
                  } else if (typeof field.example === 'boolean') {
                    example[field.name] = field.example;
                  } else if (typeof field.example === 'number') {
                    example[field.name] = field.example;
                  } else {
                    example[field.name] = field.example;
                  }
                } else {
                  // Generate default examples based on type
                  switch (field.type) {
                    case "string":
                      example[field.name] = "example_string";
                      break;
                    case "number":
                      example[field.name] = 0;
                      break;
                    case "boolean":
                      example[field.name] = false;
                      break;
                    case "object":
                      example[field.name] = {};
                      break;
                    case "array":
                      example[field.name] = [];
                      break;
                    default:
                      example[field.name] = null;
                  }
                }
              });
              
              return example;
            };

  const addMethod = () => {
    setNewEndpoint({
      ...newEndpoint,
      methods: [{ method: "GET", requiresAuth: false, requestBodyDefinition: [] }, ...newEndpoint.methods],
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

  const handleRegisterEndpoint = async () => {
    if (!newEndpoint.path || !newEndpoint.entityName || !newEndpoint.projectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newEndpoint.methods.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one HTTP method",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpointData: CreateEndpointData = {
        name: newEndpoint.name || `${newEndpoint.entityName} API`,
        path: newEndpoint.path,
        section: newEndpoint.section,
        entityName: newEndpoint.entityName,
        methods: newEndpoint.methods,
        description: newEndpoint.description,
      };

      await createEndpoint(newEndpoint.projectId, endpointData);
      
      toast({
        title: "Success",
        description: "Endpoint registered successfully",
      });

      // Reload data
      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);

      // Reset dialog states
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register endpoint",
        variant: "destructive",
      });
    }
  };

  const handleEditEndpoint = (endpoint: Endpoint) => {
    // Convert EndpointMethod[] to EndpointMethod[] for the form (no conversion needed now)
    const methodsForForm = endpoint.methods.map(method => ({
      method: method.method,
      requestBodyDefinition: method.requestBodyDefinition || [],
      description: method.description || "",
      requiresAuth: method.requiresAuth || false
    }));
    
    setEditingEndpoint(endpoint);
    setNewEndpoint({
      projectId: endpoint.projectId,
      section: endpoint.section,
      entityName: endpoint.entityName,
      path: endpoint.path,
      name: endpoint.name,
      description: "",
      methods: methodsForForm,
    });
    setIsRegisterDialogOpen(true);
    setOpenDropdownId(null); // Cerrar el dropdown al abrir el diálogo
  };

  const handleUpdateEndpoint = async () => {
    if (!editingEndpoint) return;

    if (!newEndpoint.path || !newEndpoint.entityName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newEndpoint.methods.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one HTTP method",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpointData: UpdateEndpointData = {
        name: newEndpoint.name,
        path: newEndpoint.path,
        section: newEndpoint.section,
        entityName: newEndpoint.entityName,
        methods: newEndpoint.methods,
        description: newEndpoint.description,
      };

      await updateEndpoint(editingEndpoint.projectId, editingEndpoint.endpointId, endpointData);
      
      toast({
        title: "Success",
        description: "Endpoint updated successfully",
      });

      // Reload data
      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);

      // Reset dialog states
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update endpoint",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEndpoint = async (endpoint: Endpoint) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    try {
      await deleteEndpoint(endpoint.projectId, endpoint.endpointId);
      
      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });

      // Reload data
      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);
      
      // Reset dialog states
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive",
      });
    }
  };

  const handleReanalyzeEndpoint = async (endpoint: Endpoint) => {
    try {
      await reanalyzeEndpoint(endpoint.projectId, endpoint.endpointId);
      
      toast({
        title: "Success",
        description: "Endpoint reanalysis started",
      });

      // Reload data
      const { projects: allProjects, endpoints: allEndpoints } = await reloadData();
      setProjects(allProjects);
      setEndpoints(allEndpoints);
      
      // Reset dialog states
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reanalyze endpoint",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTests = (endpoint: Endpoint) => {
    // Redirect to Test Cases page
    navigate("/test-cases");
  };

  const handleOpenComprehensiveDialog = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setEditingComprehensiveEndpoint({...endpoint});
    setIsEditing(false);
    setIsComprehensiveDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleComprehensiveDialogClose = () => {
    handleDialogClose();
  };

  const handleComprehensiveUpdate = async () => {
    if (!editingComprehensiveEndpoint) return;

    try {
      setIsUpdating(true);
      
      // Close dialog first
      setIsEditing(false);
      handleComprehensiveDialogClose();
      
      // Delete the existing endpoint
      await deleteEndpoint(
        editingComprehensiveEndpoint.projectId,
        editingComprehensiveEndpoint.endpointId
      );

      // Create the new endpoint with updated data
      await createEndpoint(
        editingComprehensiveEndpoint.projectId,
        {
          name: editingComprehensiveEndpoint.name,
          path: editingComprehensiveEndpoint.path,
          section: editingComprehensiveEndpoint.section,
          entityName: editingComprehensiveEndpoint.entityName,
          methods: editingComprehensiveEndpoint.methods,
          description: editingComprehensiveEndpoint.description || "",
        }
      );

      toast({
        title: "Success",
        description: "Endpoint updated successfully",
      });

      // Reload data after successful update
      const { endpoints: updatedEndpoints } = await reloadData();
      setEndpoints(updatedEndpoints);
    } catch (error) {
      console.error("Error updating endpoint:", error);
      toast({
        title: "Error",
        description: "Failed to update endpoint",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComprehensiveDelete = async () => {
    if (!selectedEndpoint) return;

    try {
      await deleteEndpoint(selectedEndpoint.projectId, selectedEndpoint.endpointId);

      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });

      // Reload data and close dialog
      const { endpoints: updatedEndpoints } = await reloadData();
      setEndpoints(updatedEndpoints);
      handleComprehensiveDialogClose();
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading endpoints...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mt-4 sm:mt-0">
          <Dialog
            open={isRegisterDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                handleDialogClose();
              } else {
                setIsRegisterDialogOpen(true);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEndpoint ? "Edit Endpoint" : "Register New Endpoint"}
                </DialogTitle>
                <DialogDescription>
                  {editingEndpoint 
                    ? "Update the endpoint configuration."
                    : "Configure a new API endpoint for testing and analysis."
                  }
                </DialogDescription>
              </DialogHeader>
              <Tabs value={registerActiveTab} onValueChange={setRegisterActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="methods">Methods</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  {/* Basic Info - Compact Form */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Project</label>
                        <Select
                          value={newEndpoint.projectId}
                          onValueChange={(value) =>
                            setNewEndpoint({ ...newEndpoint, projectId: value })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.displayName || project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Section</label>
                        <Input
                          placeholder="e.g., ecommerce"
                          value={newEndpoint.section}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              section: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Entity *</label>
                        <Input
                          placeholder="e.g., Product"
                          value={newEndpoint.entityName}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              entityName: e.target.value,
                            })
                          }
                          className="text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Display Name (Optional)</label>
                        <Input
                          placeholder="Product Management API"
                          value={newEndpoint.name}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              name: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Path *</label>
                        <Input
                          placeholder="/products"
                          value={newEndpoint.path}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              path: e.target.value,
                            })
                          }
                          className="text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
                        <Textarea
                          placeholder="Brief description of the endpoint..."
                          value={newEndpoint.description}
                          onChange={(e) =>
                            setNewEndpoint({
                              ...newEndpoint,
                              description: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="methods" className="space-y-4">
                  {/* HTTP Methods - Compact Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">HTTP Methods</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addMethod}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Method
                      </Button>
                    </div>
                    
                    {newEndpoint.methods.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No HTTP methods configured yet.</p>
                        <p className="text-xs mt-1">Click "Add Method" to start configuring your endpoint.</p>
                      </div>
                    ) : (
                      newEndpoint.methods.map((method, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getMethodColor(method.method)}`}>
                                {method.method}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    const updatedMethods = [...newEndpoint.methods];
                                    updatedMethods[index] = { ...method, method: "GET" as any };
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
                                  }}>
                                    GET
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const updatedMethods = [...newEndpoint.methods];
                                    updatedMethods[index] = { ...method, method: "POST" as any };
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
                                  }}>
                                    POST
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const updatedMethods = [...newEndpoint.methods];
                                    updatedMethods[index] = { ...method, method: "PUT" as any };
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
                                  }}>
                                    PUT
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const updatedMethods = [...newEndpoint.methods];
                                    updatedMethods[index] = { ...method, method: "PATCH" as any };
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
                                  }}>
                                    PATCH
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const updatedMethods = [...newEndpoint.methods];
                                    updatedMethods[index] = { ...method, method: "DELETE" as any };
                                    setNewEndpoint({
                                      ...newEndpoint,
                                      methods: updatedMethods
                                    });
                                  }}>
                                    DELETE
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <span className="font-medium">{newEndpoint.path}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeMethod(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Request Body Definition - Compact Table */}
                        {method.method !== "GET" && method.method !== "DELETE" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">Request Body Definition</h5>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const updatedMethods = [...newEndpoint.methods];
                                  const newField: FieldDefinition = {
                                    name: "newField",
                                    type: "string",
                                    example: "",
                                    validations: { required: false }
                                  };
                                  updatedMethods[index] = {
                                    ...method,
                                    requestBodyDefinition: [...(method.requestBodyDefinition || []), newField]
                                  };
                                  setNewEndpoint({
                                    ...newEndpoint,
                                    methods: updatedMethods
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Field
                              </Button>
                            </div>
                            
                            {method.requestBodyDefinition && method.requestBodyDefinition.length > 0 && (
                              <div className="bg-muted rounded p-2">
                                <div className="space-y-2">
                                  {method.requestBodyDefinition.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="border rounded p-3 bg-background">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">Field {fieldIndex + 1}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => {
                                            const updatedMethods = [...newEndpoint.methods];
                                            const updatedFields = method.requestBodyDefinition?.filter((_, i) => i !== fieldIndex) || [];
                                            updatedMethods[index] = {
                                              ...method,
                                              requestBodyDefinition: updatedFields
                                            };
                                            setNewEndpoint({
                                              ...newEndpoint,
                                              methods: updatedMethods
                                            });
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-xs font-medium">Name *</label>
                                          <Input
                                            value={field.name}
                                            onChange={(e) => {
                                              const updatedMethods = [...newEndpoint.methods];
                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                              updatedFields[fieldIndex] = { ...field, name: e.target.value };
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setNewEndpoint({
                                                ...newEndpoint,
                                                methods: updatedMethods
                                              });
                                            }}
                                            className="text-xs"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium">Type *</label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(value) => {
                                              const updatedMethods = [...newEndpoint.methods];
                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                              updatedFields[fieldIndex] = { ...field, type: value as any };
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setNewEndpoint({
                                                ...newEndpoint,
                                                methods: updatedMethods
                                              });
                                            }}
                                          >
                                            <SelectTrigger className="text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="string">string</SelectItem>
                                              <SelectItem value="number">number</SelectItem>
                                              <SelectItem value="boolean">boolean</SelectItem>
                                              <SelectItem value="object">object</SelectItem>
                                              <SelectItem value="array">array</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium">Example</label>
                                          <Input
                                            value={field.example || ''}
                                            onChange={(e) => {
                                              const updatedMethods = [...newEndpoint.methods];
                                              const updatedFields = [...(method.requestBodyDefinition || [])];
                                              updatedFields[fieldIndex] = { ...field, example: e.target.value };
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setNewEndpoint({
                                                ...newEndpoint,
                                                methods: updatedMethods
                                              });
                                            }}
                                            className="text-xs"
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Validations Row */}
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={field.validations?.required || false}
                                              onCheckedChange={(checked) => {
                                                const updatedMethods = [...newEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { 
                                                  ...field, 
                                                  validations: { ...field.validations, required: checked }
                                                };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setNewEndpoint({
                                                  ...newEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }}
                                            />
                                            <span className="text-xs">Required</span>
                                          </div>
                                          
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={field.validations && Object.keys(field.validations).some(key => key !== 'required')}
                                              onCheckedChange={(checked) => {
                                                if (!checked) {
                                                  // Remove all validations except required
                                                  const updatedMethods = [...newEndpoint.methods];
                                                  const updatedFields = [...(method.requestBodyDefinition || [])];
                                                  const required = field.validations?.required || false;
                                                  updatedFields[fieldIndex] = { 
                                                    ...field, 
                                                    validations: required ? { required } : {}
                                                  };
                                                  updatedMethods[index] = {
                                                    ...method,
                                                    requestBodyDefinition: updatedFields
                                                  };
                                                  setNewEndpoint({
                                                    ...newEndpoint,
                                                    methods: updatedMethods
                                                  });
                                                }
                                              }}
                                            />
                                            <span className="text-xs">Validations</span>
                                            {field.validations && Object.keys(field.validations).some(key => key !== 'required') && (
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" size="sm">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Validation
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                  {field.type === "number" && (
                                                    <>
                                                      <DropdownMenuItem onClick={() => {
                                                        const updatedMethods = [...newEndpoint.methods];
                                                        const updatedFields = [...(method.requestBodyDefinition || [])];
                                                        const currentValidations = field.validations || {};
                                                        updatedFields[fieldIndex] = { 
                                                          ...field, 
                                                          validations: { ...currentValidations, minimum: 0 }
                                                        };
                                                        updatedMethods[index] = {
                                                          ...method,
                                                          requestBodyDefinition: updatedFields
                                                        };
                                                        setNewEndpoint({
                                                          ...newEndpoint,
                                                          methods: updatedMethods
                                                        });
                                                      }}>
                                                        Min Value
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onClick={() => {
                                                        const updatedMethods = [...newEndpoint.methods];
                                                        const updatedFields = [...(method.requestBodyDefinition || [])];
                                                        const currentValidations = field.validations || {};
                                                        updatedFields[fieldIndex] = { 
                                                          ...field, 
                                                          validations: { ...currentValidations, maximum: 100 }
                                                        };
                                                        updatedMethods[index] = {
                                                          ...method,
                                                          requestBodyDefinition: updatedFields
                                                        };
                                                        setNewEndpoint({
                                                          ...newEndpoint,
                                                          methods: updatedMethods
                                                        });
                                                      }}>
                                                        Max Value
                                                      </DropdownMenuItem>
                                                    </>
                                                  )}
                                                  {field.type === "string" && (
                                                    <>
                                                      <DropdownMenuItem onClick={() => {
                                                        const updatedMethods = [...newEndpoint.methods];
                                                        const updatedFields = [...(method.requestBodyDefinition || [])];
                                                        const currentValidations = field.validations || {};
                                                        updatedFields[fieldIndex] = { 
                                                          ...field, 
                                                          validations: { ...currentValidations, minLength: 1 }
                                                        };
                                                        updatedMethods[index] = {
                                                          ...method,
                                                          requestBodyDefinition: updatedFields
                                                        };
                                                        setNewEndpoint({
                                                          ...newEndpoint,
                                                          methods: updatedMethods
                                                        });
                                                      }}>
                                                        Min Length
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onClick={() => {
                                                        const updatedMethods = [...newEndpoint.methods];
                                                        const updatedFields = [...(method.requestBodyDefinition || [])];
                                                        const currentValidations = field.validations || {};
                                                        updatedFields[fieldIndex] = { 
                                                          ...field, 
                                                          validations: { ...currentValidations, maxLength: 255 }
                                                        };
                                                        updatedMethods[index] = {
                                                          ...method,
                                                          requestBodyDefinition: updatedFields
                                                        };
                                                        setNewEndpoint({
                                                          ...newEndpoint,
                                                          methods: updatedMethods
                                                        });
                                                      }}>
                                                        Max Length
                                                      </DropdownMenuItem>
                                                    </>
                                                  )}
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Display active validations */}
                                        {field.validations && Object.keys(field.validations).some(key => key !== 'required') && (
                                          <div className="space-y-1">
                                            {field.validations.minimum !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Min Value: {field.validations.minimum}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    const updatedMethods = [...newEndpoint.methods];
                                                    const updatedFields = [...(method.requestBodyDefinition || [])];
                                                    const { minimum, ...restValidations } = field.validations || {};
                                                    updatedFields[fieldIndex] = { 
                                                      ...field, 
                                                      validations: restValidations
                                                    };
                                                    updatedMethods[index] = {
                                                      ...method,
                                                      requestBodyDefinition: updatedFields
                                                    };
                                                    setNewEndpoint({
                                                      ...newEndpoint,
                                                      methods: updatedMethods
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                            {field.validations.maximum !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Max Value: {field.validations.maximum}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    const updatedMethods = [...newEndpoint.methods];
                                                    const updatedFields = [...(method.requestBodyDefinition || [])];
                                                    const { maximum, ...restValidations } = field.validations || {};
                                                    updatedFields[fieldIndex] = { 
                                                      ...field, 
                                                      validations: restValidations
                                                    };
                                                    updatedMethods[index] = {
                                                      ...method,
                                                      requestBodyDefinition: updatedFields
                                                    };
                                                    setNewEndpoint({
                                                      ...newEndpoint,
                                                      methods: updatedMethods
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                            {field.validations.minLength !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Min Length: {field.validations.minLength}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    const updatedMethods = [...newEndpoint.methods];
                                                    const updatedFields = [...(method.requestBodyDefinition || [])];
                                                    const { minLength, ...restValidations } = field.validations || {};
                                                    updatedFields[fieldIndex] = { 
                                                      ...field, 
                                                      validations: restValidations
                                                    };
                                                    updatedMethods[index] = {
                                                      ...method,
                                                      requestBodyDefinition: updatedFields
                                                    };
                                                    setNewEndpoint({
                                                      ...newEndpoint,
                                                      methods: updatedMethods
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                            {field.validations.maxLength !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Max Length: {field.validations.maxLength}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    const updatedMethods = [...newEndpoint.methods];
                                                    const updatedFields = [...(method.requestBodyDefinition || [])];
                                                    const { maxLength, ...restValidations } = field.validations || {};
                                                    updatedFields[fieldIndex] = { 
                                                      ...field, 
                                                      validations: restValidations
                                                    };
                                                    updatedMethods[index] = {
                                                      ...method,
                                                      requestBodyDefinition: updatedFields
                                                    };
                                                    setNewEndpoint({
                                                      ...newEndpoint,
                                                      methods: updatedMethods
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>


              </Tabs>
              <DialogFooter>
                {registerActiveTab === "methods" && !editingEndpoint ? (
                  <Button
                    variant="outline"
                    onClick={() => setRegisterActiveTab("basic")}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancel
                  </Button>
                )}
                {editingEndpoint ? (
                  <Button onClick={handleUpdateEndpoint}>
                    Update Endpoint
                  </Button>
                ) : registerActiveTab === "basic" ? (
                  <Button onClick={() => setRegisterActiveTab("methods")}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleRegisterEndpoint}>
                    Register & Analyze
                  </Button>
                )}
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
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.displayName || project.name}
                </SelectItem>
              ))}
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
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="analyzing">Analyzing</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEndpoints.map((endpoint) => (
          <Card key={endpoint.endpointId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(endpoint.status)}
                  <Badge variant={getStatusColor(endpoint.status) as any}>
                    {endpoint.status}
                  </Badge>
                </div>
                <DropdownMenu 
                  open={openDropdownId === endpoint.endpointId}
                  onOpenChange={(open) => setOpenDropdownId(open ? endpoint.endpointId : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenComprehensiveDialog(endpoint)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View & Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGenerateTests(endpoint)}>
                      <TestTube className="mr-2 h-4 w-4" />
                      Generate Tests
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReanalyzeEndpoint(endpoint)}>
                      <Zap className="mr-2 h-4 w-4" />
                      Re-analyze
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{endpoint.name}</CardTitle>
              <div className="flex items-center text-sm mb-2">
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
                {endpoint.projectName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">{endpoint.projectName}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Section:</span>
                  <span className="font-medium">{endpoint.section}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entity:</span>
                  <span className="font-medium">{endpoint.entityName}</span>
                </div>
                {/* Removed Test Cases and Last Analyzed as they are not in the new Endpoint interface */}
                <div className="pt-3 border-t">
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenComprehensiveDialog(endpoint)}
                  >
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

      {/* Comprehensive Endpoint Dialog */}
      <Dialog
        open={isComprehensiveDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleComprehensiveDialogClose();
          } else {
            setIsComprehensiveDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEndpoint?.name || "Endpoint Details"}
            </DialogTitle>
            <DialogDescription>
              View and edit endpoint details, generated artifacts, and analysis results.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEndpoint && (
            <Tabs defaultValue="swagger" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="swagger">Documentation</TabsTrigger>
                <TabsTrigger value="artifacts">Generated Artifacts</TabsTrigger>
                <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
                <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
              </TabsList>

              <TabsContent value="swagger" className="space-y-4">
                {/* Edit Controls - Top */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Endpoint Configuration</h3>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Modify
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            // Reset to original data
                            setEditingComprehensiveEndpoint(selectedEndpoint ? {
                              ...selectedEndpoint,
                              methods: selectedEndpoint.methods.map(method => ({
                                ...method,
                                requestBodyDefinition: method.requestBodyDefinition?.map(field => ({
                                  ...field,
                                  validations: field.validations || {}
                                }))
                              }))
                            } : null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleComprehensiveUpdate}
                          disabled={isUpdating}
                          className="bg-blue-700 hover:bg-blue-800"
                        >
                          {isUpdating ? 'Saving...' : 'Update'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Basic Info - Compact Form */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project</label>
                      <p className="text-sm">{selectedEndpoint.projectName || 'Unknown Project'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Base URL + API Path</label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                        {projects.find(p => p.id === selectedEndpoint.projectId)?.baseUrl || 'http://localhost:3004'}{projects.find(p => p.id === selectedEndpoint.projectId)?.basePath || '/v1/api'}{selectedEndpoint.path}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Section</label>
                      {isEditing ? (
                        <Input
                          value={editingComprehensiveEndpoint?.section || ''}
                          onChange={(e) => setEditingComprehensiveEndpoint(prev => prev ? {...prev, section: e.target.value} : null)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{selectedEndpoint.section}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity</label>
                      {isEditing ? (
                        <Input
                          value={editingComprehensiveEndpoint?.entityName || ''}
                          onChange={(e) => setEditingComprehensiveEndpoint(prev => prev ? {...prev, entityName: e.target.value} : null)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{selectedEndpoint.entityName}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Path</label>
                      {isEditing ? (
                        <Input
                          value={editingComprehensiveEndpoint?.path || ''}
                          onChange={(e) => setEditingComprehensiveEndpoint(prev => prev ? {...prev, path: e.target.value} : null)}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{selectedEndpoint.path}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* HTTP Methods - Compact Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">HTTP Methods</h4>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (editingComprehensiveEndpoint) {
                            setEditingComprehensiveEndpoint({
                              ...editingComprehensiveEndpoint,
                              methods: [{ method: "GET", requiresAuth: false, requestBodyDefinition: [] }, ...editingComprehensiveEndpoint.methods]
                            });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Method
                      </Button>
                    )}
                  </div>
                  
                  {editingComprehensiveEndpoint?.methods.map((method, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getMethodColor(method.method)}`}>
                              {method.method}
                            </Badge>
                            {isEditing && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    if (editingComprehensiveEndpoint) {
                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                      updatedMethods[index] = { ...method, method: "GET" as any };
                                      setEditingComprehensiveEndpoint({
                                        ...editingComprehensiveEndpoint,
                                        methods: updatedMethods
                                      });
                                    }
                                  }}>
                                    GET
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    if (editingComprehensiveEndpoint) {
                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                      updatedMethods[index] = { ...method, method: "POST" as any };
                                      setEditingComprehensiveEndpoint({
                                        ...editingComprehensiveEndpoint,
                                        methods: updatedMethods
                                      });
                                    }
                                  }}>
                                    POST
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    if (editingComprehensiveEndpoint) {
                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                      updatedMethods[index] = { ...method, method: "PUT" as any };
                                      setEditingComprehensiveEndpoint({
                                        ...editingComprehensiveEndpoint,
                                        methods: updatedMethods
                                      });
                                    }
                                  }}>
                                    PUT
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    if (editingComprehensiveEndpoint) {
                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                      updatedMethods[index] = { ...method, method: "PATCH" as any };
                                      setEditingComprehensiveEndpoint({
                                        ...editingComprehensiveEndpoint,
                                        methods: updatedMethods
                                      });
                                    }
                                  }}>
                                    PATCH
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    if (editingComprehensiveEndpoint) {
                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                      updatedMethods[index] = { ...method, method: "DELETE" as any };
                                      setEditingComprehensiveEndpoint({
                                        ...editingComprehensiveEndpoint,
                                        methods: updatedMethods
                                      });
                                    }
                                  }}>
                                    DELETE
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <span className="font-medium">{selectedEndpoint.path}</span>
                        </div>
                        {isEditing && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (editingComprehensiveEndpoint) {
                                const updatedMethods = editingComprehensiveEndpoint.methods.filter((_, i) => i !== index);
                                setEditingComprehensiveEndpoint({
                                  ...editingComprehensiveEndpoint,
                                  methods: updatedMethods
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Request Body Definition - Compact Table */}
                      {method.method !== "GET" && method.method !== "DELETE" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">Request Body Definition</h5>
                            {isEditing && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (editingComprehensiveEndpoint) {
                                    const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                    const newField: FieldDefinition = {
                                      name: "newField",
                                      type: "string",
                                      example: "",
                                      validations: { required: false }
                                    };
                                    updatedMethods[index] = {
                                      ...method,
                                      requestBodyDefinition: [...(method.requestBodyDefinition || []), newField]
                                    };
                                    setEditingComprehensiveEndpoint({
                                      ...editingComprehensiveEndpoint,
                                      methods: updatedMethods
                                    });
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Field
                              </Button>
                            )}
                          </div>
                          
                          {method.requestBodyDefinition && method.requestBodyDefinition.length > 0 && (
                            <div className="bg-muted rounded p-2">
                              {isEditing ? (
                                <div className="space-y-2">
                                  {method.requestBodyDefinition.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="border rounded p-3 bg-background">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">Field {fieldIndex + 1}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => {
                                            if (editingComprehensiveEndpoint) {
                                              const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                              const updatedFields = method.requestBodyDefinition?.filter((_, i) => i !== fieldIndex) || [];
                                              updatedMethods[index] = {
                                                ...method,
                                                requestBodyDefinition: updatedFields
                                              };
                                              setEditingComprehensiveEndpoint({
                                                ...editingComprehensiveEndpoint,
                                                methods: updatedMethods
                                              });
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-xs font-medium">Name *</label>
                                          <Input
                                            value={field.name}
                                            onChange={(e) => {
                                              if (editingComprehensiveEndpoint) {
                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { ...field, name: e.target.value };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setEditingComprehensiveEndpoint({
                                                  ...editingComprehensiveEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }
                                            }}
                                            className="text-xs"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium">Type *</label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(value) => {
                                              if (editingComprehensiveEndpoint) {
                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { ...field, type: value as any };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setEditingComprehensiveEndpoint({
                                                  ...editingComprehensiveEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="string">string</SelectItem>
                                              <SelectItem value="number">number</SelectItem>
                                              <SelectItem value="boolean">boolean</SelectItem>
                                              <SelectItem value="object">object</SelectItem>
                                              <SelectItem value="array">array</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium">Example</label>
                                          <Input
                                            value={field.example || ''}
                                            onChange={(e) => {
                                              if (editingComprehensiveEndpoint) {
                                                const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                const updatedFields = [...(method.requestBodyDefinition || [])];
                                                updatedFields[fieldIndex] = { ...field, example: e.target.value };
                                                updatedMethods[index] = {
                                                  ...method,
                                                  requestBodyDefinition: updatedFields
                                                };
                                                setEditingComprehensiveEndpoint({
                                                  ...editingComprehensiveEndpoint,
                                                  methods: updatedMethods
                                                });
                                              }
                                            }}
                                            className="text-xs"
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Validations Row */}
                                      <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={field.validations?.required || false}
                                              onCheckedChange={(checked) => {
                                                if (editingComprehensiveEndpoint) {
                                                  const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                  const updatedFields = [...(method.requestBodyDefinition || [])];
                                                  updatedFields[fieldIndex] = { 
                                                    ...field, 
                                                    validations: { ...field.validations, required: checked }
                                                  };
                                                  updatedMethods[index] = {
                                                    ...method,
                                                    requestBodyDefinition: updatedFields
                                                  };
                                                  setEditingComprehensiveEndpoint({
                                                    ...editingComprehensiveEndpoint,
                                                    methods: updatedMethods
                                                  });
                                                }
                                              }}
                                            />
                                            <span className="text-xs">Required</span>
                                          </div>
                                          
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              checked={field.validations && Object.keys(field.validations).some(key => key !== 'required')}
                                              onCheckedChange={(checked) => {
                                                if (!checked) {
                                                  // Remove all validations except required
                                                  if (editingComprehensiveEndpoint) {
                                                    const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                    const updatedFields = [...(method.requestBodyDefinition || [])];
                                                    const required = field.validations?.required || false;
                                                    updatedFields[fieldIndex] = { 
                                                      ...field, 
                                                      validations: required ? { required } : {}
                                                    };
                                                    updatedMethods[index] = {
                                                      ...method,
                                                      requestBodyDefinition: updatedFields
                                                    };
                                                    setEditingComprehensiveEndpoint({
                                                      ...editingComprehensiveEndpoint,
                                                      methods: updatedMethods
                                                    });
                                                  }
                                                }
                                              }}
                                            />
                                            <span className="text-xs">Validations</span>
                                            {field.validations && Object.keys(field.validations).some(key => key !== 'required') && (
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="outline" size="sm">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Validation
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                  {field.type === "number" && (
                                                    <>
                                                      <DropdownMenuItem onClick={() => {
                                                        if (editingComprehensiveEndpoint) {
                                                          const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                          const updatedFields = [...(method.requestBodyDefinition || [])];
                                                          const currentValidations = field.validations || {};
                                                          updatedFields[fieldIndex] = { 
                                                            ...field, 
                                                            validations: { ...currentValidations, minimum: 0 }
                                                          };
                                                          updatedMethods[index] = {
                                                            ...method,
                                                            requestBodyDefinition: updatedFields
                                                          };
                                                          setEditingComprehensiveEndpoint({
                                                            ...editingComprehensiveEndpoint,
                                                            methods: updatedMethods
                                                          });
                                                        }
                                                      }}>
                                                        Min Value
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onClick={() => {
                                                        if (editingComprehensiveEndpoint) {
                                                          const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                          const updatedFields = [...(method.requestBodyDefinition || [])];
                                                          const currentValidations = field.validations || {};
                                                          updatedFields[fieldIndex] = { 
                                                            ...field, 
                                                            validations: { ...currentValidations, maximum: 100 }
                                                          };
                                                          updatedMethods[index] = {
                                                            ...method,
                                                            requestBodyDefinition: updatedFields
                                                          };
                                                          setEditingComprehensiveEndpoint({
                                                            ...editingComprehensiveEndpoint,
                                                            methods: updatedMethods
                                                          });
                                                        }
                                                      }}>
                                                        Max Value
                                                      </DropdownMenuItem>
                                                    </>
                                                  )}
                                                  {field.type === "string" && (
                                                    <>
                                                      <DropdownMenuItem onClick={() => {
                                                        if (editingComprehensiveEndpoint) {
                                                          const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                          const updatedFields = [...(method.requestBodyDefinition || [])];
                                                          const currentValidations = field.validations || {};
                                                          updatedFields[fieldIndex] = { 
                                                            ...field, 
                                                            validations: { ...currentValidations, minLength: 1 }
                                                          };
                                                          updatedMethods[index] = {
                                                            ...method,
                                                            requestBodyDefinition: updatedFields
                                                          };
                                                          setEditingComprehensiveEndpoint({
                                                            ...editingComprehensiveEndpoint,
                                                            methods: updatedMethods
                                                          });
                                                        }
                                                      }}>
                                                        Min Length
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem onClick={() => {
                                                        if (editingComprehensiveEndpoint) {
                                                          const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                          const updatedFields = [...(method.requestBodyDefinition || [])];
                                                          const currentValidations = field.validations || {};
                                                          updatedFields[fieldIndex] = { 
                                                            ...field, 
                                                            validations: { ...currentValidations, maxLength: 255 }
                                                          };
                                                          updatedMethods[index] = {
                                                            ...method,
                                                            requestBodyDefinition: updatedFields
                                                          };
                                                          setEditingComprehensiveEndpoint({
                                                            ...editingComprehensiveEndpoint,
                                                            methods: updatedMethods
                                                          });
                                                        }
                                                      }}>
                                                        Max Length
                                                      </DropdownMenuItem>
                                                    </>
                                                  )}
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Display active validations */}
                                        {field.validations && Object.keys(field.validations).some(key => key !== 'required') && (
                                          <div className="space-y-1">
                                            {field.validations.minimum !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Min Value: {field.validations.minimum}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    if (editingComprehensiveEndpoint) {
                                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                      const updatedFields = [...(method.requestBodyDefinition || [])];
                                                      const { minimum, ...restValidations } = field.validations || {};
                                                      updatedFields[fieldIndex] = { 
                                                        ...field, 
                                                        validations: restValidations
                                                      };
                                                      updatedMethods[index] = {
                                                        ...method,
                                                        requestBodyDefinition: updatedFields
                                                      };
                                                      setEditingComprehensiveEndpoint({
                                                        ...editingComprehensiveEndpoint,
                                                        methods: updatedMethods
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                            {field.validations.maximum !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Max Value: {field.validations.maximum}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    if (editingComprehensiveEndpoint) {
                                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                      const updatedFields = [...(method.requestBodyDefinition || [])];
                                                      const { maximum, ...restValidations } = field.validations || {};
                                                      updatedFields[fieldIndex] = { 
                                                        ...field, 
                                                        validations: restValidations
                                                      };
                                                      updatedMethods[index] = {
                                                        ...method,
                                                        requestBodyDefinition: updatedFields
                                                      };
                                                      setEditingComprehensiveEndpoint({
                                                        ...editingComprehensiveEndpoint,
                                                        methods: updatedMethods
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                            {field.validations.minLength !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Min Length: {field.validations.minLength}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    if (editingComprehensiveEndpoint) {
                                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                      const updatedFields = [...(method.requestBodyDefinition || [])];
                                                      const { minLength, ...restValidations } = field.validations || {};
                                                      updatedFields[fieldIndex] = { 
                                                        ...field, 
                                                        validations: restValidations
                                                      };
                                                      updatedMethods[index] = {
                                                        ...method,
                                                        requestBodyDefinition: updatedFields
                                                      };
                                                      setEditingComprehensiveEndpoint({
                                                        ...editingComprehensiveEndpoint,
                                                        methods: updatedMethods
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                            {field.validations.maxLength !== undefined && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Max Length: {field.validations.maxLength}</span>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm"
                                                  onClick={() => {
                                                    if (editingComprehensiveEndpoint) {
                                                      const updatedMethods = [...editingComprehensiveEndpoint.methods];
                                                      const updatedFields = [...(method.requestBodyDefinition || [])];
                                                      const { maxLength, ...restValidations } = field.validations || {};
                                                      updatedFields[fieldIndex] = { 
                                                        ...field, 
                                                        validations: restValidations
                                                      };
                                                      updatedMethods[index] = {
                                                        ...method,
                                                        requestBodyDefinition: updatedFields
                                                      };
                                                      setEditingComprehensiveEndpoint({
                                                        ...editingComprehensiveEndpoint,
                                                        methods: updatedMethods
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-border/50">
                                      <th className="text-left py-1 font-medium">Field</th>
                                      <th className="text-left py-1 font-medium">Type</th>
                                      <th className="text-left py-1 font-medium">Required</th>
                                      <th className="text-left py-1 font-medium">Validations</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {method.requestBodyDefinition.map((field, fieldIndex) => (
                                      <tr key={fieldIndex} className="border-b border-border/30 last:border-b-0">
                                        <td className="py-1">
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium">{field.name}</span>
                                            {field.validations?.required && <span className="text-gray-500">*</span>}
                                          </div>
                                        </td>
                                        <td className="py-1">
                                          <Badge variant="outline" className="text-xs">
                                            {field.type}
                                          </Badge>
                                        </td>
                                        <td className="py-1">
                                          {field.validations?.required ? (
                                            <Badge variant="secondary" className="text-xs">True</Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-xs">False</Badge>
                                          )}
                                        </td>
                                        <td className="py-1">
                                          <div className="flex flex-wrap gap-1">
                                            {field.type === "number" && field.validations?.minimum !== undefined && (
                                              <Badge variant="outline" className="text-xs">Min Value: {field.validations.minimum}</Badge>
                                            )}
                                            {field.type === "number" && field.validations?.maximum !== undefined && (
                                              <Badge variant="outline" className="text-xs">Max Value: {field.validations.maximum}</Badge>
                                            )}
                                            {field.type === "string" && field.validations?.minLength !== undefined && (
                                              <Badge variant="outline" className="text-xs">Min Length: {field.validations.minLength}</Badge>
                                            )}
                                            {field.type === "string" && field.validations?.maxLength !== undefined && (
                                              <Badge variant="outline" className="text-xs">Max Length: {field.validations.maxLength}</Badge>
                                            )}
                                            {(!field.validations || Object.keys(field.validations).filter(key => key !== 'required').length === 0) && (
                                              <span className="text-muted-foreground text-xs">No validations</span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="artifacts" className="space-y-4">
                {selectedEndpoint.generatedArtifacts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedEndpoint.generatedArtifacts).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2 capitalize">{key}</h4>
                        <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                          {value || "No data available"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No generated artifacts available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                {selectedEndpoint.analysisResults ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedEndpoint.analysisResults).map(([method, results]) => (
                      <div key={method} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`${getMethodColor(method)}`}>
                            {method}
                          </Badge>
                          <h4 className="font-medium text-sm">{method} Analysis</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Status Code & Content Type */}
                          <div className="flex items-center gap-4 text-xs">
                            {results.statusCode && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Status:</span>
                                <Badge variant="outline" className="text-xs">{results.statusCode}</Badge>
                              </div>
                            )}
                            {results.contentType && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Type:</span>
                                <Badge variant="outline" className="text-xs">{results.contentType}</Badge>
                              </div>
                            )}
                          </div>
                          
                          {/* Response Fields Table */}
                          {results.responseFields && results.responseFields.length > 0 && (
                            <div>
                              <span className="font-medium text-xs mb-2 block">Response Fields:</span>
                              <div className="bg-muted rounded p-2">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-border/50">
                                      <th className="text-left py-1 font-medium">Field</th>
                                      <th className="text-left py-1 font-medium">Type</th>
                                      {results.responseFields.some(f => !f.required) && (
                                        <th className="text-left py-1 font-medium">Required</th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {results.responseFields.map((field, fieldIndex) => (
                                      <tr key={fieldIndex} className="border-b border-border/30 last:border-b-0">
                                        <td className="py-1">
                                          <div className="flex items-center gap-1">
                                            <span className="font-medium">{field.name}</span>
                                            {field.required && <span className="text-gray-500">*</span>}
                                          </div>
                                        </td>
                                        <td className="py-1">
                                          <Badge variant="outline" className="text-xs">
                                            {field.type}
                                          </Badge>
                                        </td>
                                        {results.responseFields.some(f => !f.required) && (
                                          <td className="py-1">
                                            {field.required ? (
                                              <Badge variant="secondary" className="text-xs">
                                                Required
                                              </Badge>
                                            ) : (
                                              <span className="text-muted-foreground text-xs">Optional</span>
                                            )}
                                          </td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No analysis results available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timestamps" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-sm text-muted-foreground">
                        {selectedEndpoint.createdAt ? new Date(selectedEndpoint.createdAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  {selectedEndpoint.updatedAt && (
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedEndpoint.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleComprehensiveDialogClose}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleComprehensiveDelete}
            >
              Delete Endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
