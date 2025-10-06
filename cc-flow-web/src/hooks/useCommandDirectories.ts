import { useState, useEffect } from 'react';

interface CommandDirectory {
  name: string;
  path: string;
}

interface UseCommandDirectoriesReturn {
  directories: CommandDirectory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCommandDirectories(): UseCommandDirectoriesReturn {
  const [directories, setDirectories] = useState<CommandDirectory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/commands');

      if (!response.ok) {
        throw new Error('Failed to fetch command directories');
      }

      const data = await response.json();
      setDirectories(data.directories || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching command directories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectories();
  }, []);

  return {
    directories,
    loading,
    error,
    refetch: fetchDirectories,
  };
}
