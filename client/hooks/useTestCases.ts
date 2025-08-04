import { useState, useMemo, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { TestCase, CreateTestCaseData, UpdateTestCaseData } from "@/components/types/testCase.types";
import { 
  reloadTestCasesData, 
  createTestCase, 
  updateTestCase, 
  deleteTestCase,
  runTestCase
} from "@/services/testCaseService";

export function useTestCases() {
  // State
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [newTestCase, setNewTestCase] = useState<CreateTestCaseData>({
    name: "",
    entityName: "",
    section: "",
    method: "",
    testType: "",
    scenario: "",
    description: "",
    tags: [],
  });

  const { toast } = useToast();

  const resetDialogStates = useCallback(() => {
    setIsCreateDialogOpen(false);
    setEditingTestCase(null);
    setOpenDropdownId(null);
    setNewTestCase({
      name: "",
      entityName: "",
      section: "",
      method: "",
      testType: "",
      scenario: "",
      description: "",
      tags: [],
    });
  }, []);

  const handleDialogClose = useCallback(() => {
    requestAnimationFrame(() => {
      resetDialogStates();
    });
  }, [resetDialogStates]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { testCases: allTestCases } = await reloadTestCasesData();
        setTestCases(allTestCases);
        
        // Load projects data
        const projectsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api'}/projects`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.data || []);
        }
      } catch (error) {
        console.error("Error loading test cases:", error);
        toast({
          title: "Error",
          description: "Failed to load test cases",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, [resetDialogStates]);

  // Computed values
  const filteredTestCases = useMemo(() => {
    return testCases.filter((testCase) => {
      const matchesSearch =
        testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesProject =
        projectFilter === "all" || testCase.section === projectFilter;
      const matchesStatus =
        statusFilter === "all" || testCase.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || testCase.testType === priorityFilter;
      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }, [testCases, searchTerm, projectFilter, statusFilter, priorityFilter]);

  const projectSections = useMemo(() => {
    const uniqueProjects = new Set(testCases.map((tc) => tc.section));
    return Array.from(uniqueProjects);
  }, [testCases]);

  // Actions
  const handleCreateTestCase = async () => {
    if (!newTestCase.name || !newTestCase.entityName || !newTestCase.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTestCase(newTestCase);
      
      toast({
        title: "Success",
        description: "Test case created successfully",
      });

      // Close dialog first
      resetDialogStates();
      
      // Then reload data
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive",
      });
    }
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setNewTestCase({
      name: testCase.name,
      entityName: testCase.entityName,
      section: testCase.section,
      method: testCase.method,
      testType: testCase.testType,
      scenario: testCase.scenario,
      description: "",
      tags: testCase.tags,
    });
    setIsCreateDialogOpen(true);
    setOpenDropdownId(null);
  };

  const handleUpdateTestCase = async () => {
    if (!editingTestCase) return;

    if (!newTestCase.name || !newTestCase.entityName || !newTestCase.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTestCase(editingTestCase.testCaseId, newTestCase);
      
      toast({
        title: "Success",
        description: "Test case updated successfully",
      });

      // Close dialog first
      resetDialogStates();
      
      // Then reload data
      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test case",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTestCase = async (testCase: TestCase) => {
    if (!confirm("Are you sure you want to delete this test case?")) return;

    try {
      await deleteTestCase(testCase.testCaseId);
      
      toast({
        title: "Success",
        description: "Test case deleted successfully",
      });

      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
      
      resetDialogStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test case",
        variant: "destructive",
      });
    }
  };

  const handleRunTestCase = async (testCase: TestCase) => {
    try {
      await runTestCase(testCase.testCaseId);
      
      toast({
        title: "Success",
        description: "Test case execution started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run test case",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTestCase = async (testCase: TestCase) => {
    try {
      const duplicatedData: CreateTestCaseData = {
        name: `${testCase.name} (Copy)`,
        entityName: testCase.entityName,
        section: testCase.section,
        method: testCase.method,
        testType: testCase.testType,
        scenario: testCase.scenario,
        description: "",
        tags: testCase.tags,
      };

      await createTestCase(duplicatedData);
      
      toast({
        title: "Success",
        description: "Test case duplicated successfully",
      });

      const { testCases: allTestCases } = await reloadTestCasesData();
      setTestCases(allTestCases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate test case",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (testCase: TestCase) => {
    // TODO: Implement view details functionality
    console.log("View details:", testCase);
  };

      return {
      // State
      loading,
      testCases,
      projects,
      searchTerm,
      setSearchTerm,
      projectFilter,
      setProjectFilter,
      statusFilter,
      setStatusFilter,
      priorityFilter,
      setPriorityFilter,
      isCreateDialogOpen,
      setIsCreateDialogOpen,
      openDropdownId,
      setOpenDropdownId,
      editingTestCase,
      newTestCase,
      setNewTestCase,
      filteredTestCases,
      projectSections,

      // Actions
      handleCreateTestCase,
      handleEditTestCase,
      handleUpdateTestCase,
      handleDeleteTestCase,
      handleRunTestCase,
      handleDuplicateTestCase,
      handleViewDetails,
      handleDialogClose,
    };
} 