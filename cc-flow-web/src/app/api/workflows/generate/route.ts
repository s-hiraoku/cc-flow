import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface GenerateWorkflowRequest {
  json: string;
}

interface GenerateWorkflowResponse {
  success: boolean;
  commandName?: string;
  commandPath?: string;
  commandContent?: string;
  message: string;
  errors?: string[];
}

/**
 * POST /api/workflows/generate
 * Generates a workflow slash command by executing create-workflow.sh
 */
export async function POST(request: NextRequest): Promise<NextResponse<GenerateWorkflowResponse>> {
  let tempFilePath: string | null = null;

  try {
    // Get Claude root path from environment variable set by CLI
    const claudeRootPath = process.env.CLAUDE_ROOT_PATH;
    if (!claudeRootPath) {
      return NextResponse.json(
        {
          success: false,
          message: 'Claude root path not configured. Please start using cc-flow-web CLI.',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: GenerateWorkflowRequest = await request.json();
    const { json } = body;

    if (!json || typeof json !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request: JSON string is required',
        },
        { status: 400 }
      );
    }

    // Create a secure temporary directory with restrictive permissions
    const tempDir = await mkdir(join(tmpdir(), `cc-flow-${Date.now()}`), { mode: 0o700 });
    tempFilePath = join(tempDir.toString(), 'workflow.json');
    await writeFile(tempFilePath, json, { mode: 0o600, encoding: 'utf-8' });

    // Get script path from @hiraoku/cc-flow-core package
    // Try to resolve package location - handle Next.js standalone build quirks
    let scriptPath: string;
    try {
      const resolved = require.resolve('@hiraoku/cc-flow-core/package.json');
      // Check if resolve returned a valid string path
      if (typeof resolved === 'string') {
        const coreRoot = join(resolved, '..');
        scriptPath = join(coreRoot, 'workflow/create-workflow.sh');
      } else {
        throw new Error('require.resolve returned non-string value');
      }
    } catch (error) {
      // Fallback: construct path from standalone node_modules
      // __dirname in standalone build: .next/standalone/.next/server/app/api/workflows/generate
      // So go up 5 levels to reach .next/standalone, then access node_modules
      const nodeModulesPath = join(__dirname, '../../../../../..', 'node_modules', '@hiraoku', 'cc-flow-core');
      scriptPath = join(nodeModulesPath, 'workflow/create-workflow.sh');
    }

    // Use absolute path for agent directory - simpler for script
    const agentDir = join(claudeRootPath, '.claude', 'agents');
    const commandsDir = join(claudeRootPath, '.claude', 'commands');

    console.log('Executing script:', {
      scriptPath,
      agentDir,
      commandsDir,
      tempFilePath,
      claudeRootPath,
    });

    // Log temp file creation (file was just created above)
    console.log('Temp file created at:', tempFilePath);

    // Execute create-workflow.sh with absolute paths
    const { stdout, stderr, exitCode } = await executeScript(
      scriptPath,
      [agentDir, commandsDir, '--steps-json', tempFilePath],
      claudeRootPath
    );

    console.log('Script execution result:', {
      exitCode,
      stdoutLength: stdout.length,
      stderrLength: stderr.length,
    });

    if (stderr) {
      console.log('Script stderr:', stderr);
    }
    if (stdout) {
      console.log('Script stdout preview:', stdout.substring(0, 500));
    }

    // Clean up temporary file
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {
        // Ignore cleanup errors
      });
      tempFilePath = null;
    }

    // Check if script execution was successful
    if (exitCode !== 0) {
      const errorLines = stderr.split('\n').filter(line => line.trim());
      console.error('Script execution failed:', {
        exitCode,
        errorLines,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Workflow generation failed',
          errors: errorLines.length > 0 ? errorLines : ['Script exited with code ' + exitCode],
        },
        { status: 500 }
      );
    }

    // Parse workflow name from stdout
    const workflowName = extractWorkflowName(stdout);
    if (!workflowName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to extract workflow name from script output',
          errors: ['Could not determine generated command name'],
        },
        { status: 500 }
      );
    }

    // Read generated command file
    const commandPath = join(claudeRootPath, '.claude', 'commands', `${workflowName}.md`);
    let commandContent: string;
    try {
      commandContent = await readFile(commandPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to read generated command file',
          errors: [`Command file not found at: ${commandPath}`],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commandName: workflowName,
      commandPath: `.claude/commands/${workflowName}.md`,
      commandContent,
      message: `Workflow command /${workflowName} generated successfully`,
    });

  } catch (error) {
    // Clean up temporary file on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {
        // Ignore cleanup errors
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Workflow generation error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: [errorMessage],
      },
      { status: 500 }
    );
  }
}

/**
 * Execute a shell script and capture output
 */
function executeScript(
  scriptPath: string,
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    // Use 'bash' as the command and pass script + args safely
    const childProcess = spawn('bash', [scriptPath, ...args], {
      cwd,
      shell: false, // Disable shell to avoid security issues
      timeout: 30000, // 30 second timeout
      env: { ...process.env, LANG: 'ja_JP.UTF-8' }, // Ensure proper encoding for Japanese output
      stdio: ['pipe', 'pipe', 'pipe'], // Pipe stdin/stdout/stderr
    });

    // Close stdin immediately to prevent script from waiting for input
    if (childProcess.stdin) {
      childProcess.stdin.end();
    }

    let stdout = '';
    let stderr = '';

    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        const text = data.toString('utf8');
        stdout += text;
        console.log('[Script stdout]:', text);
      });
    }

    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        const text = data.toString('utf8');
        stderr += text;
        console.log('[Script stderr]:', text);
      });
    }

    childProcess.on('close', (code) => {
      console.log('[Script close]:', {
        code,
        stdoutLength: stdout.length,
        stderrLength: stderr.length,
      });
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
      });
    });

    childProcess.on('error', (error) => {
      console.error('[Script error]:', error);
      reject(new Error(`Failed to execute script: ${error.message}`));
    });
  });
}

/**
 * Extract workflow name from script output
 * Looks for patterns like "ワークフローコマンド '/workflow-name' を生成しました"
 */
function extractWorkflowName(output: string): string | null {
  // Look for workflow name in Japanese success message
  const japaneseMatch = output.match(/ワークフローコマンド ['"]\/(.+?)['"] を生成しました/);
  if (japaneseMatch) {
    return japaneseMatch[1];
  }

  // Look for workflow name in English success message (if script supports it)
  const englishMatch = output.match(/Generated workflow command ['"]\/(.+?)['"]/);
  if (englishMatch) {
    return englishMatch[1];
  }

  // Fallback: look for .md file mention
  const fileMatch = output.match(/\.claude\/commands\/(.+?)\.md/);
  if (fileMatch) {
    return fileMatch[1];
  }

  return null;
}
