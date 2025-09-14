import chalk from 'chalk';
import { inspect } from 'node:util';

export interface ErrorContext {
  operation: string;
  component: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
  exitCode?: number;
}

export interface ErrorMetadata {
  nodeVersion: string;
  platform: string;
  pid: number;
  memory: NodeJS.MemoryUsage;
}

export class CLIError extends Error {
  public readonly timestamp: Date;
  
  constructor(
    message: string,
    public readonly context: ErrorContext,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'CLIError';
    this.timestamp = new Date();
    
    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CLIError);
    }
  }
  
  static from(error: unknown, context: Partial<ErrorContext> = {}): CLIError {
    if (error instanceof CLIError) {
      return error;
    }
    
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error ? error : undefined;
    
    return new CLIError(message, {
      operation: 'unknown',
      component: 'cli',
      timestamp: new Date(),
      exitCode: 1,
      ...context
    }, cause);
  }
}

export class ErrorHandler {
  private static readonly DEBUG_MODE = process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === '1';
  
  static handleError(error: unknown, context?: Partial<ErrorContext>): never {
    const cliError = CLIError.from(error, context);
    const exitCode = cliError.context.exitCode ?? 1;
    
    this.logErrorInternal(cliError);
    
    // Additional debugging info in development
    if (this.DEBUG_MODE) {
      this.logDebugInfo(cliError);
    }
    
    // Graceful cleanup
    this.cleanup();
    
    process.exit(exitCode);
  }
  
  static logError(error: unknown, context?: Partial<ErrorContext>): void {
    const cliError = CLIError.from(error, context);
    
    this.logErrorInternal(cliError);
    
    // Additional debugging info in development
    if (this.DEBUG_MODE) {
      this.logDebugInfo(cliError);
    }
  }
  
  private static logErrorInternal(error: CLIError): void {
    const { context, message, cause } = error;
    
    console.error(chalk.red(`\n❌ Error in ${context.component}:`));
    console.error(chalk.red(`   ${message}`));
    
    if (context.details) {
      console.error(chalk.dim('   Details:'));
      console.error(chalk.dim(`   ${inspect(context.details, { colors: true, depth: 2 })}`));
    }
    
    if (cause) {
      console.error(chalk.dim('   Caused by:'), cause.message);
      
      if (this.DEBUG_MODE && cause.stack) {
        console.error(chalk.dim('\n   Stack trace:'));
        console.error(chalk.dim(cause.stack));
      }
    }
  }
  
  private static logDebugInfo(error: CLIError): void {
    const metadata: ErrorMetadata = {
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      memory: process.memoryUsage()
    };
    
    console.error(chalk.dim('\n   Debug Information:'));
    console.error(chalk.dim(`   Timestamp: ${error.timestamp.toISOString()}`));
    console.error(chalk.dim(`   Node.js: ${metadata.nodeVersion}`));
    console.error(chalk.dim(`   Platform: ${metadata.platform}`));
    console.error(chalk.dim(`   PID: ${metadata.pid}`));
    console.error(chalk.dim(`   Memory: RSS ${(metadata.memory.rss / 1024 / 1024).toFixed(1)}MB`));
    
    if (error.stack) {
      console.error(chalk.dim('\n   Full Stack Trace:'));
      console.error(chalk.dim(error.stack));
    }
  }
  
  private static cleanup(): void {
    // Cleanup operations before exit
    try {
      // Flush stdio streams
      process.stdout.write('');
      process.stderr.write('');
    } catch {
      // Ignore cleanup errors
    }
  }

  static wrapAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    context: Partial<ErrorContext>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
      }
    };
  }

  static handleProcessErrors(): void {
    process.on('uncaughtException', (error) => {
      this.handleError(error, { 
        operation: 'uncaught-exception', 
        component: 'process' 
      });
    });

    process.on('unhandledRejection', (reason) => {
      this.handleError(reason, { 
        operation: 'unhandled-rejection', 
        component: 'process' 
      });
    });
  }
}