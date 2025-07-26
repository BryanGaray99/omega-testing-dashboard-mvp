import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  Code,
} from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1/api";

interface Project {
  id: string;
  name: string;
  displayName?: string;
  baseUrl: string;
  basePath?: string;
  type: "playwright-bdd" | "api-only";
  status: "pending" | "ready" | "failed";
  endpoints: number;
  testCases: number;
  lastRun: string;
  createdAt: string;
  path?: string;
}

interface CreateProjectData {
  name: string;
  displayName?: string;
  baseUrl: string;
  basePath?: string;
  type?: 'playwright-bdd' | 'api-only';
}

interface UpdateProjectData {
  displayName?: string;
  baseUrl: string;
  basePath?: string;
}

// Utility Functions
const formatLastRun = (lastExecution: string | null) => {
  if (!lastExecution) return "Never";
  
  const lastRun = new Date(lastExecution);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return lastRun.toLocaleDateString();
};

// API Functions
async function fetchProjects() {
  const url = `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching projects");
  return res.json();
}

async function createProject(projectData: CreateProjectData) {
  const url = `${API_BASE}/projects`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error("Error creating project");
  return res.json();
}

async function fetchProjectEndpoints(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/endpoints`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching project endpoints");
  return res.json();
}

async function fetchProjectTestCases(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/test-cases`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching project test cases");
  return res.json();
}

async function fetchProjectExecutionSummary(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/test-execution/summary`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching project execution summary");
  return res.json();
}

async function updateProject(projectId: string, projectData: UpdateProjectData) {
  const url = `${API_BASE}/projects/${projectId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error("Error updating project");
  return res.json();
}

async function deleteProject(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Error deleting project");
  return res.json();
}

async function runProjectTests(projectId: string) {
  const url = `${API_BASE}/projects/${projectId}/test-execution/execute`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Enviamos un objeto vacío para ejecutar todos los test cases
  });
  if (!res.ok) throw new Error("Error running tests");
  return res.json();
}

// Función para abrir proyecto en editor externo
function openProjectInEditor(project: Project, editor: string, toast: any) {
  // Usar la ruta del proyecto que viene del backend
  const projectPath = project.path;
  
  if (!projectPath) {
    toast({
      title: "Error",
      description: "No se encontró la ruta del proyecto. Contacta al administrador.",
      variant: "destructive",
    });
    return;
  }
  
  // Intentar abrir el proyecto en el editor especificado
  try {
    if (editor === 'vscode') {
      // Usar el protocolo vscode:// para abrir VS Code
      const vscodeUrl = `vscode://file/${encodeURIComponent(projectPath)}`;
      window.open(vscodeUrl, '_blank');
      toast({
        title: "Proyecto abierto",
        description: `Abriendo ${project.name} en VS Code...`,
      });
    } else if (editor === 'cursor') {
      // Usar el protocolo cursor:// para abrir Cursor
      const cursorUrl = `cursor://file/${encodeURIComponent(projectPath)}`;
      window.open(cursorUrl, '_blank');
      toast({
        title: "Proyecto abierto",
        description: `Abriendo ${project.name} en Cursor...`,
      });
    } else {
      // Fallback: intentar abrir con el comando del sistema
      const fileUrl = `file://${projectPath}`;
      window.open(fileUrl, '_blank');
      toast({
        title: "Proyecto abierto",
        description: `Abriendo ${project.name} en el editor del sistema...`,
      });
    }
  } catch (error) {
    console.error('Error opening project in editor:', error);
    toast({
      title: "Error",
      description: `No se pudo abrir el proyecto en ${editor}. Asegúrate de que ${editor} esté instalado y configurado.`,
      variant: "destructive",
    });
  }
}

export default function Projects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    displayName: "",
    baseUrl: "",
    basePath: "/v1/api",
    type: "playwright-bdd" as 'playwright-bdd' | 'api-only',
  });

  // Estados para editar proyecto
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectData, setEditProjectData] = useState({
    displayName: "",
    baseUrl: "",
    basePath: "/v1/api",
  });

  // Estados para eliminar proyecto
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Estado para controlar el DropdownMenu
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Función para limpiar todos los estados de diálogos
  const resetDialogStates = useCallback(() => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setEditingProject(null);
    setDeletingProject(null);
    setDeleteConfirmation("");
    setOpenDropdownId(null); // Cerrar cualquier dropdown abierto
    setNewProject({
      name: "",
      displayName: "",
      baseUrl: "",
      basePath: "/v1/api",
      type: "playwright-bdd" as 'playwright-bdd' | 'api-only',
    });
    setEditProjectData({
      displayName: "",
      baseUrl: "",
      basePath: "/v1/api",
    });
  }, []);

  // Función para manejar el cierre de diálogos de forma segura
  const handleDialogClose = useCallback((dialogType: 'create' | 'edit' | 'delete') => {
    // Usar requestAnimationFrame para asegurar que el DOM se actualice correctamente
    requestAnimationFrame(() => {
      resetDialogStates();
    });
  }, [resetDialogStates]);

  // Fetch projects
  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const projects = Array.isArray(projectsData?.data) ? projectsData.data : [];

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetDialogStates();
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectData }) => 
      updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetDialogStates();
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetDialogStates();
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Run tests mutation
  const runTestsMutation = useMutation({
    mutationFn: runProjectTests,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Tests started",
        description: data.data?.message || "Test execution has been initiated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start test execution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.displayName && project.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
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
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.baseUrl) {
      return;
    }

    createProjectMutation.mutate({
      name: newProject.name,
      displayName: newProject.displayName || undefined,
      baseUrl: newProject.baseUrl,
      basePath: newProject.basePath,
      type: newProject.type,
    });
  };

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setEditProjectData({
      displayName: project.displayName || "",
      baseUrl: project.baseUrl,
      basePath: project.basePath || "/v1/api",
    });
    setIsEditDialogOpen(true);
    setOpenDropdownId(null); // Cerrar el dropdown al abrir el diálogo
  }, []);

  const handleUpdateProject = () => {
    if (!editingProject || !editProjectData.baseUrl) {
      return;
    }

    updateProjectMutation.mutate({
      projectId: editingProject.id,
      data: {
        displayName: editProjectData.displayName || undefined,
        baseUrl: editProjectData.baseUrl,
        basePath: editProjectData.basePath,
      },
    });
  };

  const handleDeleteProject = useCallback((project: Project) => {
    setDeletingProject(project);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
    setOpenDropdownId(null); // Cerrar el dropdown al abrir el diálogo
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingProject || deleteConfirmation !== deletingProject.name) {
      return;
    }

    deleteProjectMutation.mutate(deletingProject.id);
  };

  const handleRunTests = useCallback((projectId: string) => {
    runTestsMutation.mutate(projectId);
  }, [runTestsMutation]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  if (loadingProjects) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your testing projects and configurations
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your testing projects and configurations
          </p>
        </div>
        {/* Contenedor de botones alineados a la derecha */}
        <div className="flex flex-row gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          <Dialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              if (!open) {
                handleDialogClose('create');
              } else {
                setIsCreateDialogOpen(true);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new testing project with its basic configuration.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    name="project-name"
                    placeholder="e.g., ecommerce-api"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    name="display-name"
                    placeholder="e.g., E-commerce Platform API"
                    value={newProject.displayName}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        displayName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    name="base-url"
                    placeholder="https://api.example.com"
                    value={newProject.baseUrl}
                    onChange={(e) =>
                      setNewProject({ ...newProject, baseUrl: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="basePath">Base Path (Optional)</Label>
                  <Input
                    id="basePath"
                    name="basePath"
                    placeholder="/v1/api"
                    value={newProject.basePath}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        basePath: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value) =>
                      setNewProject({
                        ...newProject,
                        type: value as 'playwright-bdd' | 'api-only',
                      })
                    }
                  >
                    <SelectTrigger id="project-type">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="playwright-bdd">Playwright BDD</SelectItem>
                      <SelectItem value="api-only">API Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleDialogClose('create')}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Project Dialog */}
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleDialogClose('edit');
            } else {
              setIsEditDialogOpen(true);
            }
          }}
        >
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the project configuration. Note: Project name and type cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-display-name">Display Name</Label>
                <Input
                  id="edit-display-name"
                  name="edit-display-name"
                  placeholder="e.g., E-commerce Platform API"
                  value={editProjectData.displayName}
                  onChange={(e) =>
                    setEditProjectData({
                      ...editProjectData,
                      displayName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-base-url">Base URL</Label>
                <Input
                  id="edit-base-url"
                  name="edit-base-url"
                  placeholder="https://api.example.com"
                  value={editProjectData.baseUrl}
                  onChange={(e) =>
                    setEditProjectData({ ...editProjectData, baseUrl: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-basePath">Base Path (Optional)</Label>
                <Input
                  id="edit-basePath"
                  name="edit-basePath"
                  placeholder="/v1/api"
                  value={editProjectData.basePath}
                  onChange={(e) =>
                    setEditProjectData({
                      ...editProjectData,
                      basePath: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogClose('edit')}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProject}
                disabled={updateProjectMutation.isPending}
              >
                {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog 
          open={isDeleteDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleDialogClose('delete');
            } else {
              setIsDeleteDialogOpen(true);
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Project</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the project
                <strong> "{deletingProject?.name}"</strong> and all its associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="delete-confirmation">
                  Type <strong>"{deletingProject?.name}"</strong> to confirm
                </Label>
                <Input
                  id="delete-confirmation"
                  name="delete-confirmation"
                  placeholder={deletingProject?.name}
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="border-destructive focus:border-destructive"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogClose('delete')}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteProjectMutation.isPending || deleteConfirmation !== deletingProject?.name}
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-projects"
            name="search-projects"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="status-filter" className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={`project-card-${project.id}`} 
            project={project}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onRunTests={handleRunTests}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            toast={toast}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No projects found matching your criteria.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      )}
    </div>
  );
}

// Separate component for project card to handle individual project data fetching
function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onRunTests,
  openDropdownId,
  setOpenDropdownId,
  toast
}: { 
  project: any;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onRunTests: (projectId: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  toast: any;
}) {
  // Fetch project-specific data
  const { data: endpointsData } = useQuery({
    queryKey: ["project-endpoints", project.id],
    queryFn: () => fetchProjectEndpoints(project.id),
    enabled: !!project.id,
  });

  const { data: testCasesData } = useQuery({
    queryKey: ["project-test-cases", project.id],
    queryFn: () => fetchProjectTestCases(project.id),
    enabled: !!project.id,
  });

  const { data: executionSummaryData } = useQuery({
    queryKey: ["project-execution-summary", project.id],
    queryFn: () => fetchProjectExecutionSummary(project.id),
    enabled: !!project.id,
  });

  const endpoints = Array.isArray(endpointsData?.data) ? endpointsData.data.length : 0;
  const testCases = Array.isArray(testCasesData?.data?.testCases) ? testCasesData.data.testCases.length : 0;
  const lastRun = executionSummaryData?.data?.lastExecution 
    ? formatLastRun(executionSummaryData.data.lastExecution)
    : "Never";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
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
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            <Badge variant={getStatusColor(project.status) as any}>
              {project.status}
            </Badge>
          </div>
          <DropdownMenu
            open={openDropdownId === project.id}
            onOpenChange={(open) => {
              if (!open) {
                setOpenDropdownId(null);
              } else {
                setOpenDropdownId(project.id);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRunTests(project.id)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Tests
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(project)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{project.name}</CardTitle>
        {project.displayName && (
          <p className="text-sm text-muted-foreground overflow-hidden h-10">
            {project.displayName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {project.baseUrl}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Endpoints:</span>
            <span className="font-medium">{endpoints}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Test Cases:</span>
            <span className="font-medium">{testCases}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Run:</span>
            <span className="font-medium">{lastRun}</span>
          </div>
          <div className="pt-3 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Project
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Open in Editor</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openProjectInEditor(project, 'vscode', toast)}>
                  <Code className="mr-2 h-4 w-4" />
                  VS Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openProjectInEditor(project, 'cursor', toast)}>
                  <Code className="mr-2 h-4 w-4" />
                  Cursor
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
