import figlet from 'figlet';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';

export class WelcomeScreen {
  private centerText(text: string, width?: number): string {
    const terminalWidth = width || process.stdout.columns || 80;
    const lines = text.split('\n');
    
    return lines.map(line => {
      // Remove ANSI codes to calculate actual display width
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
      
      // If terminal is too narrow, don't center (just return original)
      if (terminalWidth < cleanLine.length + 4) {
        return line;
      }
      
      const padding = Math.max(0, Math.floor((terminalWidth - cleanLine.length) / 2));
      return ' '.repeat(padding) + line;
    }).join('\n');
  }

  private getResponsiveBanner(): string {
    // Simple CC-FLOW logo only
    return `
   ██████╗ ██████╗       ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██╔════╝      ██╔════╝██║     ██╔═══██╗██║    ██║
  ██║     ██║     █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║
  ██║     ██║     ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║
  ╚██████╗╚██████╗      ██║     ███████╗╚██████╔╝╚███╔███╔╝
   ╚═════╝ ╚═════╝      ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
`;
  }

  async show(): Promise<boolean> {
    try {
      console.clear();
      
      // Get responsive banner based on terminal width
      const rawBanner = this.getResponsiveBanner();
      
      // Center the banner
      const banner = this.centerText(rawBanner);

      // Display 3-color logo: sophisticated blue gradient
      const lines = banner.split('\n');
      lines.forEach((line, index) => {
        if (line.trim() === '') {
          console.log(line);
        } else if (index <= 2) {
          // CC part - blue (professional)
          console.log(chalk.blue.bold(line));
        } else if (index <= 4) {
          // FLOW part - cyan (elegant)  
          console.log(chalk.cyan.bold(line));
        } else {
          // Bottom border - green (success)
          console.log(chalk.green.bold(line));
        }
      });

      console.log();
      console.log(chalk.yellow.bold('                    ⚡ Claude Code Workflow Orchestration Platform ⚡'));
      console.log();
      console.log(chalk.green('🚀 Create custom workflows for your Claude Code agents'));
      console.log(chalk.dim('   Build powerful agent orchestration with visual TUI'));
      console.log();
      
      // Create a rainbow effect manually and center it
      const rainbowLine = chalk.red('✦ ') + chalk.yellow('Ready to ') + chalk.green('build ') + 
                         chalk.cyan('amazing ') + chalk.blue('workflows? ') + chalk.magenta('✦');
      console.log(this.centerText(rainbowLine));
      console.log();
      
      const action = await input({
        message: 'Press Enter to get started, or type "q" to quit',
        default: ''
      });
      
      if (action.toLowerCase() === 'q' || action.toLowerCase() === 'quit') {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        return false;
      }
      
      return true;
    } catch (error) {
      // Handle user cancellation (Ctrl+C)
      if (error instanceof Error && error.message.includes('User force closed')) {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        return false;
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}