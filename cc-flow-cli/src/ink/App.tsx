import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { WelcomeScreen } from './screens/WelcomeScreen.js';
import { MenuScreen } from './screens/MenuScreen.js';
import { DirectoryScreen } from './screens/DirectoryScreen.js';
import { AgentSelectionScreen } from './screens/AgentSelectionScreen.js';
import { OrderScreen } from './screens/OrderScreen.js';
import { PreviewScreen } from './screens/PreviewScreen.js';
import { CompleteScreen } from './screens/CompleteScreen.js';
import { ConversionScreen } from './screens/ConversionScreen.js';
import { ConversionCompleteScreen } from './screens/ConversionCompleteScreen.js';
import { WorkflowNameScreen } from './screens/WorkflowNameScreen.js';
import { EnvironmentScreen } from './screens/EnvironmentScreen.js';
// Simplified types for now
interface WorkflowConfig {
  targetPath?: string;
  selectedAgents?: any[];
  workflowName?: string;
  purpose?: string;
  environment?: string;
}

interface ConversionResult {
  success: boolean;
  message: string;
  convertedCount: number;
  targetDirectory: string;
}

export type ScreenType = 
  | 'welcome'
  | 'menu'
  | 'directory'
  | 'agent-selection'
  | 'order'
  | 'workflow-name'
  | 'environment'
  | 'preview'
  | 'complete'
  | 'conversion'
  | 'conversion-complete';

interface AppProps {
  onExit?: () => void;
}

export const App: React.FC<AppProps> = ({ onExit }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [workflowConfig, setWorkflowConfig] = useState<Partial<WorkflowConfig>>({});
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['welcome']);

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // Remove current
      const previousScreen = newHistory[newHistory.length - 1];
      if (previousScreen) {
        setScreenHistory(newHistory);
        setCurrentScreen(previousScreen);
      }
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      process.exit(0);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={() => navigateTo('menu')} />;
      
      case 'menu':
        return (
          <MenuScreen 
            onSelect={(action) => {
              if (action === 'create-workflow') {
                navigateTo('directory');
              } else if (action === 'convert-commands') {
                navigateTo('conversion');
              } else if (action === 'exit') {
                handleExit();
              }
            }}
            onBack={goBack}
          />
        );
      
      case 'directory':
        return (
          <DirectoryScreen
            onNext={(targetPath: string) => {
              setWorkflowConfig((prev: Partial<WorkflowConfig>) => ({ ...prev, targetPath }));
              navigateTo('agent-selection');
            }}
            onBack={goBack}
          />
        );
      
      case 'agent-selection':
        return (
          <AgentSelectionScreen
            targetPath={workflowConfig.targetPath || './agents'}
            onNext={(selectedAgents: any[]) => {
              setWorkflowConfig((prev: Partial<WorkflowConfig>) => ({ ...prev, selectedAgents }));
              navigateTo('order');
            }}
            onBack={goBack}
          />
        );
      
      case 'order':
        return (
          <OrderScreen
            selectedAgents={workflowConfig.selectedAgents || []}
            onNext={(orderedAgents: any[]) => {
              setWorkflowConfig((prev: Partial<WorkflowConfig>) => ({ ...prev, selectedAgents: orderedAgents }));
              navigateTo('workflow-name');
            }}
            onBack={goBack}
          />
        );
      
      case 'workflow-name':
        return (
          <WorkflowNameScreen
            targetPath={workflowConfig.targetPath || './agents'}
            onNext={(workflowName: string, purpose: string) => {
              setWorkflowConfig((prev: Partial<WorkflowConfig>) => ({ ...prev, workflowName, purpose }));
              navigateTo('environment');
            }}
            onBack={goBack}
          />
        );
      
      case 'environment':
        return (
          <EnvironmentScreen
            onNext={(environment: string) => {
              setWorkflowConfig((prev: Partial<WorkflowConfig>) => ({ ...prev, environment }));
              navigateTo('preview');
            }}
            onBack={goBack}
          />
        );
      
      case 'preview':
        return (
          <PreviewScreen
            config={workflowConfig as WorkflowConfig}
            onGenerate={() => {
              // Execute workflow generation
              navigateTo('complete');
            }}
            onBack={goBack}
          />
        );
      
      case 'complete':
        return (
          <CompleteScreen
            config={workflowConfig as WorkflowConfig}
            onAnother={() => {
              setWorkflowConfig({});
              navigateTo('menu');
            }}
            onExit={handleExit}
          />
        );
      
      case 'conversion':
        return (
          <ConversionScreen
            onComplete={(result: ConversionResult) => {
              setConversionResult(result);
              navigateTo('conversion-complete');
            }}
            onBack={goBack}
          />
        );
      
      case 'conversion-complete':
        return (
          <ConversionCompleteScreen
            result={conversionResult!}
            onAnother={() => navigateTo('conversion')}
            onWorkflow={() => navigateTo('directory')}
            onMenu={() => navigateTo('menu')}
          />
        );
      
      default:
        return (
          <Box>
            <Text color="red">Unknown screen: {currentScreen}</Text>
          </Box>
        );
    }
  };

  return (
    <Box flexDirection="column" width="100%" minHeight={24}>
      {renderScreen()}
    </Box>
  );
};