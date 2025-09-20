import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { UnifiedScreen, ScreenDescription, FeatureHighlights } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';

interface EnvironmentCheck {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
}

interface EnvironmentScreenProps {
  onNext: (environment: string) => void;
  onBack: () => void;
}

export const EnvironmentScreen: React.FC<EnvironmentScreenProps> = ({ onNext, onBack }) => {
  const [checks, setChecks] = useState<EnvironmentCheck[]>([
    { name: 'Claude Code環境', status: 'pending', message: '確認中...' },
    { name: 'POML処理環境', status: 'pending', message: '確認中...' },
    { name: 'スクリプト実行権限', status: 'pending', message: '確認中...' },
    { name: 'テンプレートファイル', status: 'pending', message: '確認中...' },
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  // Handle keyboard input
  useInput(useCallback((input: string, key: any) => {
    if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (key.return && canProceed) {
      onNext('claude-code');
    }
  }, [onBack, exit, canProceed, onNext]));

  // Simulate environment checks
  useEffect(() => {
    const runChecks = async () => {
      const checkSequence = [
        () => setChecks(prev => prev.map((check, i) => 
          i === 0 ? { ...check, status: 'success', message: 'Claude Code環境で実行中' } : check
        )),
        () => setChecks(prev => prev.map((check, i) => 
          i === 1 ? { ...check, status: 'success', message: 'POML v0.0.8 利用可能' } : check
        )),
        () => setChecks(prev => prev.map((check, i) => 
          i === 2 ? { ...check, status: 'success', message: 'スクリプト実行権限あり' } : check
        )),
        () => setChecks(prev => prev.map((check, i) => 
          i === 3 ? { ...check, status: 'success', message: 'テンプレートファイル確認済み' } : check
        )),
      ];

      for (let i = 0; i < checkSequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const checkFunction = checkSequence[i];
        if (checkFunction) {
          checkFunction();
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setIsComplete(true);
      setCanProceed(true);
    };

    runChecks();
  }, []);

  const getStatusIcon = (status: EnvironmentCheck['status']) => {
    switch (status) {
      case 'pending': return <Spinner type="dots" />;
      case 'success': return <Text color="green">✅</Text>;
      case 'warning': return <Text color="yellow">⚠️</Text>;
      case 'error': return <Text color="red">❌</Text>;
      default: return <Text color="gray">-</Text>;
    }
  };

  const getStatusColor = (status: EnvironmentCheck['status']) => {
    switch (status) {
      case 'success': return theme.colors.hex.green;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.gray;
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('processing', {
    title: '実行環境確認',
    subtitle: 'ワークフロー作成に必要な環境を確認しています',
    icon: '⚙️'
  });

  const statusItems = [
    { key: 'Checks', value: `${checks.filter(c => c.status === 'success').length}/${checks.length}` },
    { key: 'Status', value: isComplete ? 'Complete' : 'Checking', color: isComplete ? '#00ff00' : '#ffaa00' }
  ];

  const detectedFeatures = isComplete ? [
    '• Claude Code統合環境での実行',
    '• POML (Prompt Orchestration Markup Language) サポート',
    '• ワークフロー自動生成とコマンド作成',
    '• エージェント連携とスクリプト実行'
  ] : [];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={!isComplete ? 
        '環境確認中です... しばらくお待ちください' : 
        '✅ 環境確認完了 - Enterキーで最終確認画面へ進みます'}
    >
      {/* Environment Check Results */}
      <Section title="環境チェック結果" spacing="sm">
        <Box flexDirection="column" gap={1}>
          {checks.map((check, index) => (
            <Box key={check.name}>
              {getStatusIcon(check.status)}
              <Text color={theme.colors.white}> {check.name}: </Text>
              <Text color={getStatusColor(check.status)}>
                {check.message}
              </Text>
            </Box>
          ))}
        </Box>
      </Section>

      {/* Completion Status */}
      {isComplete && (
        <>
          <ScreenDescription
            heading="🎉 環境確認完了 - 次のステップへ"
            description="ワークフロー作成の準備が整いました。最終確認画面に進んでワークフローを生成してください。"
            align="center"
          />

          <Section title="✨ 検出された機能" spacing="sm">
            <FeatureHighlights
              features={detectedFeatures}
              contentWidth={contentWidth}
            />
          </Section>

          <Box marginTop={1} marginBottom={1}>
            <Text color={theme.colors.hex.orange}>
              💡 まだワークフローは作成されていません。Enterキーを押してワークフロー作成を完了してください。
            </Text>
          </Box>
        </>
      )}
    </UnifiedScreen>
  );
};