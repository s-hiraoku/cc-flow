import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { Frame, ContentLine } from '../components/Frame.js';

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
      case 'processing': return 'cyan';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame title="スラッシュコマンド変換" icon="🔄" minWidth={80} maxWidth={100}>
        <ContentLine align="center">
          <Text color="cyan">カスタムスラッシュコマンドをエージェント形式に変換しています</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine>
          <Text bold color="white">変換プロセス:</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        {steps.map((step, index) => (
          <ContentLine key={step.name}>
            <Box>
              {getStatusIcon(step.status)}
              <Text color="white"> {step.name}: </Text>
              <Text color={getStatusColor(step.status)}>
                {step.message}
              </Text>
            </Box>
          </ContentLine>
        ))}
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        {!isComplete && (
          <ContentLine align="center">
            <Text color="yellow">
              変換中です... 進行状況: {currentStep + 1}/{steps.length}
            </Text>
          </ContentLine>
        )}
        
        {isComplete && (
          <>
            <ContentLine align="center">
              <Text color="green" bold>🎉 変換完了!</Text>
            </ContentLine>
            
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            
            <ContentLine>
              <Text color="cyan">✨ 変換結果:</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• 3個のスラッシュコマンドを変換</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• エージェント形式のMarkdownファイルを生成</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• .claude/agents/converted/ に保存完了</Text>
            </ContentLine>
            
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            
            <ContentLine>
              <Text color="blue">📝 変換されたコマンド:</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• analyze-code - コード解析エージェント</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• generate-docs - ドキュメント生成エージェント</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• create-tests - テスト作成エージェント</Text>
            </ContentLine>
            
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            
            <ContentLine align="center">
              <Text color="green">✅ まもなくワークフロー作成画面に移行します...</Text>
            </ContentLine>
          </>
        )}
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine align="center">
          <Text color="blue">📝 操作方法:</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">
            {isComplete ? 'しばらくお待ちください...' : 'Esc: キャンセル | Q: 終了'}
          </Text>
        </ContentLine>
      </Frame>
    </Box>
  );
};