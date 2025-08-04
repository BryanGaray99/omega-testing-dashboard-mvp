import { TestCase } from "../components/types/testCase.types";

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/v1/api";

export async function fetchTestCases(): Promise<{ data: TestCase[] }> {
  const url = `${API_BASE}/test-cases`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching test cases");
  return res.json();
}

export async function createTestCase(testCaseData: any): Promise<{ data: TestCase }> {
  const url = `${API_BASE}/test-cases`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCaseData),
  });
  if (!res.ok) throw new Error("Error creating test case");
  return res.json();
}

export async function updateTestCase(testCaseId: string, testCaseData: any): Promise<{ data: TestCase }> {
  const url = `${API_BASE}/test-cases/${testCaseId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testCaseData),
  });
  if (!res.ok) throw new Error("Error updating test case");
  return res.json();
}

export async function deleteTestCase(testCaseId: string): Promise<{ data: any }> {
  const url = `${API_BASE}/test-cases/${testCaseId}`;
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error deleting test case");
  return res.json();
}

export async function runTestCase(testCaseId: string): Promise<{ data: any }> {
  const url = `${API_BASE}/test-cases/${testCaseId}/run`;
  const res = await fetch(url, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error running test case");
  return res.json();
}

// Helper function to reload test cases data
export async function reloadTestCasesData(): Promise<{ testCases: TestCase[] }> {
  try {
    const response = await fetch(`${API_BASE}/test-cases`);
    if (response.ok) {
      const data = await response.json();
      const testCases = data.data || [];
      return { testCases };
    }
    return { testCases: [] };
  } catch (error) {
    console.error("Error reloading test cases data:", error);
    return { testCases: [] };
  }
} 