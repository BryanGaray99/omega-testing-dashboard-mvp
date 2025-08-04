export interface TestCase {
  testCaseId: string;
  testCaseIdName: string;
  name: string;
  entityName: string;
  section: string;
  method: string;
  testType: string;
  scenario: string;
  status: string;
  projectId: string;
  lastRun?: string;
  lastRunStatus?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  hooks: any;
  examples: any;
  metadata: any;
}

export interface CreateTestCaseData {
  name: string;
  entityName: string;
  section: string;
  method: string;
  testType: string;
  scenario: string;
  description?: string;
  tags?: string[];
}

export interface UpdateTestCaseData {
  name?: string;
  entityName?: string;
  section?: string;
  method?: string;
  testType?: string;
  scenario?: string;
  status?: string;
  description?: string;
  tags?: string[];
} 