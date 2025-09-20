/**
 * Test setup for React Ink components
 */

// Mock process.stdout for consistent test output
const originalWrite = process.stdout.write;
const originalColumns = process.stdout.columns;
const originalRows = process.stdout.rows;

beforeEach(() => {
  // Set consistent terminal size for tests
  process.stdout.columns = 80;
  process.stdout.rows = 24;
  
  // Mock stdout write to capture output
  process.stdout.write = vi.fn() as any;
});

afterEach(() => {
  // Restore original stdout
  process.stdout.write = originalWrite;
  process.stdout.columns = originalColumns;
  process.stdout.rows = originalRows;
  
  // Clear all mocks
  vi.clearAllMocks();
});

// Mock external dependencies that might cause issues in tests
vi.mock('node:process', () => ({
  exit: vi.fn(),
  cwd: vi.fn(() => '/test'),
  env: {}
}));

// Note: fs operations are now mocked per-test using vi.spyOn() for better control
// This allows tests to specify exact behavior without global interference