import { exec } from 'child_process';

export interface ShellResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface ShellOptions {
  timeout?: number;
  cwd?: string;
}

/**
 * Shell command executor utility
 */
export class ShellExecutor {
  
  static async execute(command: string, options: ShellOptions = {}): Promise<ShellResult> {
    return new Promise((resolve, reject) => {
      const { timeout = 30000, cwd } = options;
      
      const childProcess = exec(command, {
        cwd: cwd || process.cwd(),
        timeout
      }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            stdout: stdout || '',
            stderr: stderr || '',
            code: error.code || 1
          });
        } else {
          resolve({
            stdout: stdout || '',
            stderr: stderr || '',
            code: 0
          });
        }
      });
      
      childProcess.on('error', (error) => {
        reject(error);
      });
    });
  }
}