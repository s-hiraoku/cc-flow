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
import { ScriptExecutor } from '../services/ScriptExecutor.js';
import type { WorkflowConfig } from '../models/Agent.js';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

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

  const handleWorkflowGeneration = async () => {
    console.log('🔧 Starting workflow generation...');
    console.log('📦 Current workflowConfig:', workflowConfig);
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Create proper WorkflowConfig with required fields
      const config: WorkflowConfig = {
        targetPath: workflowConfig.targetPath || './agents',
        purpose: workflowConfig.purpose || 'Custom workflow',
        selectedAgents: workflowConfig.selectedAgents || [],
        executionOrder: (workflowConfig.selectedAgents || []).map(agent => agent.name),
        createdAt: new Date(),
        ...(workflowConfig.workflowName && { workflowName: workflowConfig.workflowName })
      };
      
      console.log('📝 Final config for ScriptExecutor:', config);
      
      const executor = new ScriptExecutor();
      await executor.executeWorkflowCreation(config);
      
      // Success - navigate to complete screen
      navigateTo('complete');
    } catch (error) {
      console.error('Workflow generation failed:', error);
      setProcessingError(error instanceof Error ? error.message : 'Unknown error occurred');
      // Stay on preview screen to show error
    } finally {
      setIsProcessing(false);
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
            selectedAgents={workflowConfig.selectedAgents as any[] || []}
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
            config={workflowConfig as any}
            onGenerate={handleWorkflowGeneration}
            isProcessing={isProcessing}
            processingError={processingError}
            onBack={goBack}
          />
        );
      
      case 'complete':
        return (
          <CompleteScreen
            config={workflowConfig as any}
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