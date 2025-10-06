import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';

const AUTO_SAVE_KEY = 'cc-flow-web-autosave';
const AUTO_SAVE_DEBOUNCE_MS = 500; // 500ms debounce

interface AutoSaveData {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  timestamp: number;
  version: string;
}

let debounceTimer: NodeJS.Timeout | null = null;

/**
 * Saves workflow data to localStorage with debouncing
 */
export function autoSaveWorkflow(
  metadata: WorkflowMetadata,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): void {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(() => {
    try {
      const saveData: AutoSaveData = {
        metadata,
        nodes,
        edges,
        timestamp: Date.now(),
        version: '1.0.0',
      };

      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
      console.debug('Workflow auto-saved to localStorage');
    } catch (error) {
      console.warn('Failed to auto-save workflow:', error);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);
}

/**
 * Loads workflow data from localStorage
 */
export function loadAutoSavedWorkflow(): AutoSaveData | null {
  try {
    const savedData = localStorage.getItem(AUTO_SAVE_KEY);
    if (!savedData) {
      return null;
    }

    const parsedData = JSON.parse(savedData) as AutoSaveData;

    // Basic validation
    if (!parsedData.metadata || !parsedData.nodes || !parsedData.edges) {
      console.warn('Invalid auto-save data structure');
      return null;
    }

    return parsedData;
  } catch (error) {
    console.warn('Failed to load auto-saved workflow:', error);
    return null;
  }
}

/**
 * Clears auto-saved workflow data
 */
export function clearAutoSavedWorkflow(): void {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
    console.debug('Auto-saved workflow cleared');
  } catch (error) {
    console.warn('Failed to clear auto-saved workflow:', error);
  }
}

/**
 * Checks if there's newer auto-saved data compared to current data
 */
export function hasNewerAutoSave(currentTimestamp: number): boolean {
  const autoSaved = loadAutoSavedWorkflow();
  return autoSaved ? autoSaved.timestamp > currentTimestamp : false;
}

/**
 * Gets formatted date string for auto-save timestamp
 */
export function getAutoSaveTimestamp(autoSaveData: AutoSaveData): string {
  return new Date(autoSaveData.timestamp).toLocaleString();
}