import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getPackageJson, getVersion } from './package.js';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

// Mock path module for consistent testing
vi.mock('path', () => ({
  resolve: vi.fn((...paths) => paths.join('/')),
  dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/'))
}));

// Mock url module
vi.mock('url', () => ({
  fileURLToPath: vi.fn((url) => url.replace('file://', ''))
}));

describe('Package Utilities', () => {
  beforeEach(async () => {
    const { readFileSync } = await import('fs');
    vi.mocked(readFileSync).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPackageJson', () => {
    it('returns parsed package.json when file exists', async () => {
      const mockPackageContent = JSON.stringify({
        name: '@hiraoku/cc-flow-cli',
        version: '1.2.3',
        description: 'Test package'
      });
      
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(mockPackageContent);
      
      const result = getPackageJson();
      
      expect(result).toEqual({
        name: '@hiraoku/cc-flow-cli',
        version: '1.2.3',
        description: 'Test package'
      });
      expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        'utf-8'
      );
    });

    it('returns default package when file read fails', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = getPackageJson();
      
      expect(result).toEqual({ version: '0.0.0' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to read package.json:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('returns default package when JSON parsing fails', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue('invalid json content');
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = getPackageJson();
      
      expect(result).toEqual({ version: '0.0.0' });
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getVersion', () => {
    it('returns version from package.json', async () => {
      const mockPackageContent = JSON.stringify({
        name: 'test-package',
        version: '2.1.0'
      });
      
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(mockPackageContent);
      
      const version = getVersion();
      
      expect(version).toBe('2.1.0');
    });

    it('returns default version when package.json has no version', async () => {
      const mockPackageContent = JSON.stringify({
        name: 'test-package'
        // no version field
      });
      
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(mockPackageContent);
      
      const version = getVersion();
      
      expect(version).toBe('0.0.0');
    });

    it('returns default version when package.json read fails', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File access error');
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const version = getVersion();
      
      expect(version).toBe('0.0.0');
      
      consoleSpy.mockRestore();
    });

    it('handles null or undefined version gracefully', async () => {
      const mockPackageContent = JSON.stringify({
        name: 'test-package',
        version: null
      });
      
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(mockPackageContent);
      
      const version = getVersion();
      
      expect(version).toBe('0.0.0');
    });
  });

  describe('Error Handling', () => {
    it('handles permission errors gracefully', async () => {
      const permissionError = new Error('EACCES: permission denied');
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockImplementation(() => {
        throw permissionError;
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = getPackageJson();
      
      expect(result.version).toBe('0.0.0');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to read package.json:',
        permissionError
      );
      
      consoleSpy.mockRestore();
    });

    it('handles network/filesystem errors gracefully', async () => {
      const networkError = new Error('ENOENT: no such file or directory');
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockImplementation(() => {
        throw networkError;
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const version = getVersion();
      
      expect(version).toBe('0.0.0');
      
      consoleSpy.mockRestore();
    });
  });
});