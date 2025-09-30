// File System Access API types
interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface WindowWithFileSystemAPI extends Window {
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
}

/**
 * Downloads a JSON string as a file using File System Access API (with fallback)
 */
export async function downloadJSON(filename: string, jsonString: string): Promise<boolean> {
  try {
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      return await downloadWithFilePicker(filename, jsonString);
    } else {
      // Fallback to traditional download
      downloadWithLink(filename, jsonString);
      return true;
    }
  } catch (error) {
    // Check if user cancelled
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('File save cancelled by user');
      return false;
    }

    console.error('Failed to download file:', error);
    // If File System Access API fails, try fallback
    if ('showSaveFilePicker' in window) {
      console.warn('File System Access API failed, using fallback method');
      downloadWithLink(filename, jsonString);
      return true;
    } else {
      throw new Error('Failed to download file');
    }
  }
}

/**
 * Downloads using File System Access API with file picker modal
 */
async function downloadWithFilePicker(filename: string, jsonString: string): Promise<boolean> {
  const fileHandle = await (window as unknown as WindowWithFileSystemAPI).showSaveFilePicker({
    suggestedName: filename,
    types: [{
      description: 'JSON files',
      accept: {
        'application/json': ['.json'],
      },
    }],
  });

  const writable = await fileHandle.createWritable();
  await writable.write(jsonString);
  await writable.close();
  return true;
}

/**
 * Downloads using traditional link method (fallback)
 */
function downloadWithLink(filename: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.style.display = 'none';

  // Append to body, click, and remove
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename with timestamp for workflow JSON files
 */
export function generateWorkflowFilename(workflowName?: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const baseName = workflowName ?
    workflowName.toLowerCase().replace(/[^a-z0-9]/g, '-') :
    'workflow';

  return `${baseName}-${timestamp}.json`;
}

/**
 * Downloads workflow configuration JSON for create-workflow.sh
 */
export async function downloadWorkflowConfig(
  workflowName: string,
  jsonString: string
): Promise<boolean> {
  const filename = generateWorkflowFilename(workflowName);
  return await downloadJSON(filename, jsonString);
}