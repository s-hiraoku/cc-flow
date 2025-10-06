import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPackageJson, getVersion } from './package.js';
import * as fs from 'fs';

// Use partial mock to preserve real fs behavior while allowing specific overrides
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    readFileSync: vi.fn()
  };
});

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

    it('handles corrupted JSON with syntax errors', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue('{ "name": "test", invalid }');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getPackageJson();

      expect(result.version).toBe('0.0.0');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('handles empty file content', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue('');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getPackageJson();

      expect(result.version).toBe('0.0.0');

      consoleSpy.mockRestore();
    });

    it('handles whitespace-only content', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue('   \n\t  ');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getPackageJson();

      expect(result.version).toBe('0.0.0');

      consoleSpy.mockRestore();
    });

    it('handles non-object JSON', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue('"string value"');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getPackageJson();

      expect(result).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('handles array JSON', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue('[1, 2, 3]');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getPackageJson();

      expect(result).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('handles very large JSON files', async () => {
      const largePackage = JSON.stringify({
        name: 'test',
        version: '1.0.0',
        dependencies: Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [`dep${i}`, `^${i}.0.0`])
        )
      });

      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(largePackage);

      const result = getPackageJson();

      expect(result.version).toBe('1.0.0');
      expect(result.dependencies).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles version as number instead of string', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: 1.0
      }));

      const version = getVersion();

      // getVersion returns version ?? '0.0.0', so 1.0 (number) will be returned as-is
      expect(version).toBe(1);
    });

    it('handles version as object', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: { major: 1, minor: 0 }
      }));

      const version = getVersion();

      // getVersion returns version ?? '0.0.0', so object will be returned as-is
      expect(version).toEqual({ major: 1, minor: 0 });
    });

    it('handles version as empty string', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: ''
      }));

      const version = getVersion();

      expect(version).toBe('');
    });

    it('handles package.json with only name field', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test-package'
      }));

      const result = getPackageJson();

      expect(result.name).toBe('test-package');
      expect(result.version).toBeUndefined();
    });

    it('handles package.json with additional fields', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '2.0.0',
        description: 'Test package',
        author: 'Test Author',
        license: 'MIT',
        dependencies: {}
      }));

      const result = getPackageJson();

      expect(result.version).toBe('2.0.0');
      expect(result.description).toBe('Test package');
      expect(result.author).toBe('Test Author');
    });

    it('handles package.json with unicode characters', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
        description: '日本語の説明 🎯'
      }));

      const result = getPackageJson();

      expect(result.description).toBe('日本語の説明 🎯');
    });

    it('handles package.json with escaped characters', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0',
        description: 'Test with "quotes" and \\backslash'
      }));

      const result = getPackageJson();

      expect(result.description).toContain('quotes');
      expect(result.description).toContain('backslash');
    });

    it('caches and returns consistent results', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '3.0.0'
      }));

      const result1 = getPackageJson();
      const result2 = getPackageJson();

      expect(result1.version).toBe(result2.version);
    });

    it('handles semver prerelease versions', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0-alpha.1'
      }));

      const version = getVersion();

      expect(version).toBe('1.0.0-alpha.1');
    });

    it('handles semver build metadata', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0+build.123'
      }));

      const version = getVersion();

      expect(version).toBe('1.0.0+build.123');
    });

    it('handles complex semver versions', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '2.0.0-rc.1+build.456'
      }));

      const version = getVersion();

      expect(version).toBe('2.0.0-rc.1+build.456');
    });
  });

  describe('Integration', () => {
    it('getVersion uses getPackageJson internally', async () => {
      const mockContent = JSON.stringify({
        name: 'integration-test',
        version: '5.0.0'
      });

      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(mockContent);

      const packageJson = getPackageJson();
      const version = getVersion();

      expect(version).toBe(packageJson.version);
    });

    it('handles rapid successive calls', async () => {
      const { readFileSync } = await import('fs');
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        name: 'test',
        version: '1.0.0'
      }));

      const results = Array.from({ length: 100 }, () => getVersion());

      expect(results.every(v => v === '1.0.0')).toBe(true);
    });

    it('handles alternating success and failure', async () => {
      const { readFileSync } = await import('fs');
      let callCount = 0;

      vi.mocked(readFileSync).mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          throw new Error('Read failed');
        }
        return JSON.stringify({ name: 'test', version: '1.0.0' });
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result1 = getPackageJson();
      const result2 = getPackageJson();

      expect(result1.version).toBe('1.0.0');
      expect(result2.version).toBe('0.0.0');

      consoleSpy.mockRestore();
    });
  });
});