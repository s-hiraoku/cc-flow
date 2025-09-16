import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import { BaseScreen } from './BaseScreen.js';

export class WelcomeScreen extends BaseScreen {
  constructor() {
    super();
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
      console.log(this.centerText(chalk.yellow.bold('⚡ Claude Code Workflow Orchestration Platform ⚡')));
      console.log();
      console.log(this.centerText(chalk.green('🚀 Create custom workflows for your Claude Code agents')));
      console.log(this.centerText(chalk.dim('Build powerful agent orchestration with visual TUI')));
      console.log();
      
      // Create a rainbow effect manually and center it
      const rainbowLine = chalk.red('✦ ') + chalk.yellow('Ready to ') + chalk.green('build ') + 
                         chalk.cyan('amazing ') + chalk.blue('workflows? ') + chalk.magenta('✦');
      console.log(this.centerText(rainbowLine));
      console.log();
      
      const promptMessage = 'Press Enter to get started, or type "q" to quit';
      const centeredPrompt = this.centerText(promptMessage);
      
      const action = await input({
        message: centeredPrompt,
        default: ''
      });
      
      if (action.toLowerCase() === 'q' || action.toLowerCase() === 'quit') {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        return false;
      }
      
      return true;
    } catch (error) {
      // Handle user cancellation using BaseScreen method
      if (this.handleUserCancellation(error)) {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        return false;
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}