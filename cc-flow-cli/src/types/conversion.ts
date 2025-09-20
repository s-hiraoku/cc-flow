export interface ConversionResult {
  success: boolean;
  message: string;
  convertedCount: number;
  targetDirectory: string;
  convertedCommands?: string[];
}