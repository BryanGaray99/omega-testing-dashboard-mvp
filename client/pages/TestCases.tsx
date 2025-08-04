import { useTestCases } from "@/hooks/useTestCases";
import TestCaseCard from "@/components/test-cases/TestCaseCard";
import TestCaseFilters from "@/components/test-cases/TestCaseFilters";
import TestCaseCreateDialog from "@/components/test-cases/TestCaseCreateDialog";
import TestCaseEmptyState from "@/components/test-cases/TestCaseEmptyState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";

export default function TestCases() {
  const {
    // State
    loading,
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
    filteredTestCases,
    projects,
    projectSections,

    // Actions
    handleCreateTestCase,
    handleEditTestCase,
    handleDeleteTestCase,
    handleRunTestCase,
    handleDuplicateTestCase,
    handleViewDetails,
  } = useTestCases();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test cases...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Test Cases</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage test scenarios with AI assistance
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Test Case
          </Button>
        </div>
      </div>

      {/* Filters */}
                   <TestCaseFilters
               searchTerm={searchTerm}
               setSearchTerm={setSearchTerm}
               projectFilter={projectFilter}
               setProjectFilter={setProjectFilter}
               statusFilter={statusFilter}
               setStatusFilter={setStatusFilter}
               priorityFilter={priorityFilter}
               setPriorityFilter={setPriorityFilter}
               projects={projectSections}
             />

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredTestCases.map((testCase) => (
               <TestCaseCard
                 key={testCase.testCaseId}
                 testCase={testCase}
                 projects={projects}
                 onViewDetails={handleViewDetails}
                 onEdit={handleEditTestCase}
                 onRun={handleRunTestCase}
                 onDuplicate={handleDuplicateTestCase}
                 onDelete={handleDeleteTestCase}
                 openDropdownId={openDropdownId}
                 setOpenDropdownId={setOpenDropdownId}
               />
             ))}
      </div>

      {/* Empty State */}
      {filteredTestCases.length === 0 && (
        <TestCaseEmptyState
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />
      )}

      {/* Test Case Create Dialog */}
                   <TestCaseCreateDialog
               isOpen={isCreateDialogOpen}
               onOpenChange={setIsCreateDialogOpen}
               projects={projectSections}
               onCreate={handleCreateTestCase}
             />
    </div>
  );
}
