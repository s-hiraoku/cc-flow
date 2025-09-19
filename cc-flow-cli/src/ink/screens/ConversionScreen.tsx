import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { UnifiedScreen, ScreenDescription, FeatureHighlights } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';

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
  onComplete: (result: ConversionResult) => void;
  onBack: () => void;
}

export const ConversionScreen: React.FC<ConversionScreenProps> = ({ onComplete, onBack }) => {
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

  // Simulate conversion process
  useEffect(() => {
    const runConversion = async () => {
      const stepMessages = [
        ['処理中...', '.claude/commands/ ディレクトリをスキャン中'],
        ['解析中...', '3個のスラッシュコマンドを発見'],
        ['変換中...', 'エージェント形式のMarkdownファイルを生成中'],
        ['保存中...', '.claude/agents/converted/ に保存中'],
        ['完了...', 'ワークフロー作成画面に移行準備中'],
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        
        // Set to processing
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'processing' as const, message: stepMessages[i]?.[0] || '処理中...' } : step
        ));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set to success
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'success' as const, message: stepMessages[i]?.[1] || '完了' } : step
        ));
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsComplete(true);
      
      // Complete after a short delay
      setTimeout(() => {
        onComplete({
          success: true,
          message: 'スラッシュコマンドの変換が完了しました',
          convertedCount: 3,
          targetDirectory: '.claude/agents/converted',
          convertedCommands: ['analyze-code', 'generate-docs', 'create-tests']
        });
      }, 1000);
    };

    runConversion();
  }, [onComplete, steps.length]);

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