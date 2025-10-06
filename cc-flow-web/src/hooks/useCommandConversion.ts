import { useState, useCallback } from 'react';

interface ConversionResult {
  success: boolean;
  output: string;
  error?: string;
  details?: string;
  dryRun: boolean;
}

interface UseCommandConversionReturn {
  converting: boolean;
  result: ConversionResult | null;
  error: string | null;
  convertCommands: (directory: string, dryRun?: boolean) => Promise<ConversionResult | null>;
}

export function useCommandConversion(): UseCommandConversionReturn {
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertCommands = useCallback(async (directory: string, dryRun = false) => {
    try {
      setConverting(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/commands/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directory, dryRun }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert commands');
      }

      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error converting commands:', err);
      return null;
    } finally {
      setConverting(false);
    }
  }, []);

  return {
    converting,
    result,
    error,
    convertCommands,
  };
}
