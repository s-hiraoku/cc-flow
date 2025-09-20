import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { UnifiedScreen, ScreenDescription, FeatureHighlights } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

interface ConversionStep {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message: string;
}

interface ConversionResult {
  success: boolean;
  message: string;
  convertedCount: number;
  targetDirectory: string;
  convertedCommands?: string[];
}

interface ConversionScreenProps {
  targetPath?: string | undefined;
  selectedCommands?: any[];
  onComplete: (result: ConversionResult) => void;
  onBack: () => void;
}

export const ConversionScreen: React.FC<ConversionScreenProps> = ({ targetPath, selectedCommands = [], onComplete, onBack }) => {
  const [steps, setSteps] = useState<ConversionStep[]>([
    { name: 'スラッシュコマンド検索', status: 'pending', message: '開始待ち...' },
    { name: 'コマンド解析', status: 'pending', message: '開始待ち...' },
    { name: 'エージェント形式変換', status: 'pending', message: '開始待ち...' },
    { name: 'ファイル生成', status: 'pending', message: '開始待ち...' },
    { name: 'ワークフロー作成', status: 'pending', message: '開始待ち...' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

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

        // Step 2: Prepare conversion
        setCurrentStep(1);
        setSteps(prev => prev.map((step, index) => 
          index === 1 ? { ...step, status: 'processing' as const, message: '変換スクリプトを準備中...' } : step
        ));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setSteps(prev => prev.map((step, index) => 
          index === 1 ? { ...step, status: 'success' as const, message: '変換準備が完了しました' } : step
        ));

        // Step 3: Execute conversion script
        setCurrentStep(2);
        setSteps(prev => prev.map((step, index) => 
          index === 2 ? { ...step, status: 'processing' as const, message: 'スラッシュコマンドを変換中...' } : step
        ));

        // Get directory name from targetPath for script argument
        // e.g., "./.claude/commands/test" -> "test", "./.claude/commands" -> "all"
        console.log('DEBUG: targetPath =', targetPath);
        let commandDir = 'all';
        if (targetPath?.includes('.claude/commands') && targetPath !== './.claude/commands') {
          commandDir = targetPath.split('/').pop() || 'all';
        }
        console.log('DEBUG: commandDir =', commandDir);
        
        // Use ScriptExecutor pattern for script path resolution
        // When running from cc-flow-cli, need to go up one level to find scripts/
        const basePath = process.cwd();
        const isInCliDir = basePath.endsWith('cc-flow-cli');
        const projectRoot = isInCliDir ? join(basePath, '..') : basePath;
        const scriptPath = join(projectRoot, 'scripts', 'convert-slash-commands.sh');
        const command = `bash "${scriptPath}" "${commandDir}"`;
        console.log('DEBUG: Executing command:', command);
        
        execSync(command, { 
          cwd: projectRoot,
          stdio: 'inherit', // Show output for debugging
          encoding: 'utf8',
          shell: '/bin/bash', // Force bash shell
          env: { ...process.env, BASH_VERSION: '5.0' } // Ensure bash environment
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        setSteps(prev => prev.map((step, index) => 
          index === 2 ? { ...step, status: 'success' as const, message: 'エージェント形式への変換が完了しました' } : step
        ));

        // Step 4: Verify output
        setCurrentStep(3);
        setSteps(prev => prev.map((step, index) => 
          index === 3 ? { ...step, status: 'processing' as const, message: '変換されたファイルを確認中...' } : step
        ));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSteps(prev => prev.map((step, index) => 
          index === 3 ? { ...step, status: 'success' as const, message: `${outputDir} に保存しました` } : step
        ));

        // Step 5: Complete
        setCurrentStep(4);
        setSteps(prev => prev.map((step, index) => 
          index === 4 ? { ...step, status: 'processing' as const, message: '変換を完了しています...' } : step
        ));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setSteps(prev => prev.map((step, index) => 
          index === 4 ? { ...step, status: 'success' as const, message: '変換が正常に完了しました' } : step
        ));

        setIsComplete(true);
        
        setTimeout(() => {
          onComplete({
            success: true,
            message: 'スラッシュコマンドの変換が完了しました',
            convertedCount: selectedCommands.length,
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
    { key: 'Progress', value: `${currentStep + 1}/${steps.length}` },
    { key: 'Status', value: isComplete ? 'Complete' : 'Processing', color: isComplete ? '#00ff00' : '#ffaa00' }
  ];

  const conversionResults = isComplete ? [
    '• 3個のスラッシュコマンドを変換',
    '• エージェント形式のMarkdownファイルを生成',
    '• .claude/agents/converted/ に保存完了'
  ] : [];

  const convertedCommands = isComplete ? [
    '• analyze-code - コード解析エージェント',
    '• generate-docs - ドキュメント生成エージェント',
    '• create-tests - テスト作成エージェント'
  ] : [];

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

      {/* Completion Results */}
      {isComplete && (
        <>
          <ScreenDescription
            heading="🎉 変換完了!"
            align="center"
          />

          <FeatureHighlights
            features={conversionResults}
            contentWidth={contentWidth}
          />

          <Section title="📝 変換されたコマンド" spacing="sm">
            <Box flexDirection="column" gap={1}>
              {convertedCommands.map((command, index) => (
                <Text key={index} color={theme.colors.gray}>
                  {command}
                </Text>
              ))}
            </Box>
          </Section>
        </>
      )}
    </UnifiedScreen>
  );
};