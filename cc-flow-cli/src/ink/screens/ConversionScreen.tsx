import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { UnifiedScreen } from '../design-system/index.js';
import { createScreenLayout } from '../design-system/ScreenPatterns.js';
import { Section } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { execSync } from 'child_process';
import { join } from 'path';
import type { ConversionResult } from '../../types/conversion.js';

interface ConversionStep {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
}


interface ConversionScreenProps {
  targetPath?: string | undefined;
  selectedCommands?: any[];
  onComplete: (result: ConversionResult) => void;
  onBack: () => void;
}

export const ConversionScreen: React.FC<ConversionScreenProps> = ({ targetPath, selectedCommands = [], onComplete, onBack }) => {
  const [steps, setSteps] = useState<ConversionStep[]>([
    { name: 'コマンド検証', status: 'pending', message: '開始待ち...' },
    { name: 'エージェント変換', status: 'pending', message: '開始待ち...' },
    { name: '完了', status: 'pending', message: '開始待ち...' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { exit } = useApp();
  const theme = useTheme();

  // Handle keyboard input
  useInput(useCallback((input: string, key: any) => {
    if (key.escape && !isComplete) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    }
  }, [onBack, exit, isComplete]));

  // Real conversion process using existing shell script
  useEffect(() => {
    const runConversion = async () => {
      // Determine output directory based on source category
      // Extract category from target path, fallback to 'commands' for root directory
      const pathParts = targetPath?.split('/') || [];
      const category = pathParts[pathParts.length - 1] || 'commands';
      const outputDir = `.claude/agents/${category}`;
      
      try {
        // Step 1: Validate selected commands
        setCurrentStep(0);
        setSteps(prev => prev.map((step, index) => 
          index === 0 ? { ...step, status: 'processing' as const, message: `${selectedCommands.length}個のコマンドを検証中...` } : step
        ));
        
        if (!selectedCommands || selectedCommands.length === 0) {
          throw new Error('変換するコマンドが選択されていません');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSteps(prev => prev.map((step, index) => 
          index === 0 ? { ...step, status: 'success' as const, message: `${selectedCommands.length}個のコマンドを確認しました` } : step
        ));

        // Step 2: Execute conversion
        setCurrentStep(1);
        setSteps(prev => prev.map((step, index) => 
          index === 1 ? { ...step, status: 'processing' as const, message: `${selectedCommands.length}個のコマンドを変換中...` } : step
        ));

        // Convert each selected command individually using convert-command.sh
        let convertedCount = 0;
        
        for (const command of selectedCommands) {
          try {
            // Convert absolute paths to relative paths
            const sourcePath = command.path.replace(process.cwd() + '/', '');
            const targetDirectory = outputDir;
            
            // Use relative path for script
            const scriptPath = './scripts/convert-command.sh';
            const commandStr = `bash "${scriptPath}" "${sourcePath}" "${targetDirectory}"`;
            
            console.log(`Converting: ${command.name} (${sourcePath})`);
            
            execSync(commandStr, { 
              cwd: process.cwd(),
              stdio: 'pipe', // Capture output
              encoding: 'utf8',
              shell: '/bin/bash'
            });
            
            convertedCount++;
            console.log(`✅ Converted: ${command.name}`);
            
            // Update progress
            setSteps(prev => prev.map((step, index) => 
              index === 2 ? { ...step, message: `${convertedCount}/${selectedCommands.length}個のコマンドを変換済み` } : step
            ));
            
          } catch (error) {
            console.error(`❌ Failed to convert ${command.name}:`, error);
            // Continue with other commands even if one fails
          }
        }

        setSteps(prev => prev.map((step, index) => 
          index === 1 ? { ...step, status: 'success' as const, message: `${convertedCount}個のコマンドを変換完了` } : step
        ));

        // Step 3: Complete
        setCurrentStep(2);
        setSteps(prev => prev.map((step, index) => 
          index === 2 ? { ...step, status: 'success' as const, message: `${outputDir}に保存完了` } : step
        ));

        setIsComplete(true);
        
        setTimeout(() => {
          onComplete({
            success: true,
            message: 'スラッシュコマンドの変換が完了しました',
            convertedCount: convertedCount,
            targetDirectory: outputDir,
            convertedCommands: selectedCommands.map((cmd: any) => cmd.name || cmd.id)
          });
        }, 1000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
        setSteps(prev => prev.map((step, index) => 
          index === currentStep ? { ...step, status: 'error' as const, message: errorMessage } : step
        ));
        
        setTimeout(() => {
          onComplete({
            success: false,
            message: `変換に失敗しました: ${errorMessage}`,
            convertedCount: 0,
            targetDirectory: '',
            convertedCommands: []
          });
        }, 2000);
      }
    };

    runConversion();
  }, [onComplete, selectedCommands, targetPath, currentStep]);

  const getStatusIcon = (status: ConversionStep['status']) => {
    switch (status) {
      case 'pending': return <Text color="gray">⏳</Text>;
      case 'processing': return <Spinner type="dots" />;
      case 'success': return <Text color="green">✅</Text>;
      case 'error': return <Text color="red">❌</Text>;
      default: return <Text color="gray">-</Text>;
    }
  };

  const getStatusColor = (status: ConversionStep['status']) => {
    switch (status) {
      case 'processing': return theme.colors.hex.lightBlue;
      case 'success': return theme.colors.hex.green;
      case 'error': return theme.colors.error;
      default: return theme.colors.gray;
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('processing', {
    title: 'スラッシュコマンド変換',
    subtitle: 'カスタムスラッシュコマンドをエージェント形式に変換しています',
    icon: '🔄'
  });

  const statusItems = [
    { key: 'Commands', value: `${selectedCommands.length}個` },
    { key: 'Status', value: isComplete ? 'Complete' : 'Processing', color: isComplete ? '#00ff00' : '#ffaa00' }
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={!isComplete ? 
        `変換中です... 進行状況: ${currentStep + 1}/${steps.length}` : 
        '✅ まもなくワークフロー作成画面に移行します...'}
    >
      {/* Conversion Progress */}
      <Section title="変換プロセス" spacing="sm">
        <Box flexDirection="column" gap={1}>
          {steps.map((step, index) => (
            <Box key={step.name}>
              {getStatusIcon(step.status)}
              <Text color={theme.colors.white}> {step.name}: </Text>
              <Text color={getStatusColor(step.status)}>
                {step.message}
              </Text>
            </Box>
          ))}
        </Box>
      </Section>

      {/* Completion Message */}
      {isComplete && (
        <Section title="🎉 変換完了" spacing="sm">
          <Text color={theme.colors.hex.green}>
            {selectedCommands.length}個のスラッシュコマンドをエージェント形式に変換しました
          </Text>
        </Section>
      )}
    </UnifiedScreen>
  );
};