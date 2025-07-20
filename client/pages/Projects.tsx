import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  status: "pending" | "ready" | "failed";
  endpoints: number;
  testCases: number;
  lastRun: string;
  createdAt: string;
  description?: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "ecommerce-api",
    displayName: "E-commerce Platform API",
    baseUrl: "https://api.ecommerce.com",
    status: "ready",
    endpoints: 24,
    testCases: 156,
    lastRun: "2 hours ago",
    createdAt: "2024-01-15",
    description: "Main e-commerce platform API testing suite",
  },
  {
    id: "2",
    name: "user-auth-service",
    displayName: "User Authentication Service",
    baseUrl: "https://auth.example.com",
    status: "ready",
    endpoints: 8,
    testCases: 45,
    lastRun: "5 minutes ago",
    createdAt: "2024-01-10",
    description: "Authentication and authorization API tests",
  },
  {
    id: "3",
    name: "payment-gateway",
    displayName: "Payment Gateway Integration",
    baseUrl: "https://payments.stripe.com",
    status: "pending",
    endpoints: 12,
    testCases: 67,
    lastRun: "1 day ago",
    createdAt: "2024-01-05",
    description: "Payment processing and webhook tests",
  },
  {
    id: "4",
    name: "inventory-system",
    displayName: "Inventory Management System",
    baseUrl: "https://inventory.internal.com",
    status: "failed",
    endpoints: 18,
    testCases: 89,
    lastRun: "3 hours ago",
    createdAt: "2024-01-01",
    description: "Inventory tracking and management API",
  },
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    displayName: "",
    baseUrl: "",
    description: "",
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.displayName.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (!newProject.name || !newProject.displayName || !newProject.baseUrl) {
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      displayName: newProject.displayName,
      baseUrl: newProject.baseUrl,
      description: newProject.description,
      status: "pending",
      endpoints: 0,
      testCases: 0,
      lastRun: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setProjects([project, ...projects]);
    setNewProject({ name: "", displayName: "", baseUrl: "", description: "" });
    setIsCreateDialogOpen(false);
  };

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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                  placeholder="https://api.example.com"
                  value={newProject.baseUrl}
                  onChange={(e) =>
                    setNewProject({ ...newProject, baseUrl: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
          <Card key={project.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(project.status)}
                  <Badge variant={getStatusColor(project.status) as any}>
                    {project.status}
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
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Run Tests
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{project.displayName}</CardTitle>
              {project.description && (
                <p className="text-sm text-muted-foreground overflow-hidden h-10">
                  {project.description}
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
                  <span className="font-medium">{project.endpoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Test Cases:</span>
                  <span className="font-medium">{project.testCases}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Run:</span>
                  <span className="font-medium">{project.lastRun}</span>
                </div>
                <div className="pt-3 border-t">
                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/projects/${project.id}`}>View Project</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
