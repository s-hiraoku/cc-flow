import React, { useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { UnifiedScreen, ScreenDescription, MenuSection, FeatureHighlights, HintBox } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { MenuItem } from '../components/Interactive.js';
import packageJson from '../../../package.json' with { type: 'json' };

interface Agent {
  id: string;
  name: string;
  description: string;
  path: string;
}

interface WorkflowConfig {
  workflowName?: string;
  selectedAgents?: Agent[];
  purpose?: string;
  targetPath?: string;
}

interface CompleteScreenProps {
  config: WorkflowConfig;
  onAnother: () => void;
  onExit: () => void;
}

const packageVersion = packageJson.version ?? '0.0.0';

export const CompleteScreen: React.FC<CompleteScreenProps> = ({ config, onAnother, onExit }) => {
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  const choices: MenuItem[] = [
    { label: '🔄 新しいワークフローを作成する', value: 'another' },
    { label: '🏠 メインメニューに戻る', value: 'convert' },
    { label: '👋 アプリケーションを終了', value: 'exit' }
  ];

  // Handle keyboard shortcuts
  useInput(useCallback((input: string, key: any) => {
    if (input === 'q' || input === 'Q') {
      exit();
    } else if (input === 'n' || input === 'N') {
      onAnother();
    }
  }, [exit, onAnother]));

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'another') {
      onAnother();
    } else if (item.value === 'convert') {
      // TODO: Switch to conversion mode
      onAnother();
    } else {
      onExit();
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('complete', {
    title: 'ワークフロー作成完了',
    subtitle: '🎉 ワークフローの作成が完了しました！',
    icon: '🎉'
  });

  const statusItems = [
    { key: 'Command', value: `/${config.workflowName || 'my-workflow'}` },
    { key: 'Agents', value: `${config.selectedAgents?.length || 0}個` },
    { key: 'Status', value: 'Complete', color: '#00ff00' }
  ];

  const usageFeatures = [
    `1. 基本実行: /${config.workflowName || 'my-workflow'} "あなたのタスク内容"`,
    `2. 実行例: /${config.workflowName || 'my-workflow'} "Webアプリの仕様書を作成してください"`
  ];

  const usageHints = [
    '• エージェントは上記の順序で自動実行されます',
    '• 各エージェントの結果は次のエージェントに引き継がれます',
    '• ワークフローはClaude Code環境で実行可能です'
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      version={packageVersion}
      statusItems={statusItems}
      customStatusMessage="✅ お疲れ様でした！ワークフローをお試しください"
    >
      {/* Workflow Summary */}
      <Section title="📋 作成されたワークフロー" spacing="sm">
        <Box flexDirection="column" gap={1}>
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>コマンド名: </Text>
            <Text color={theme.colors.hex.green} bold>/{config.workflowName || 'my-workflow'}</Text>
          </Flex>
          
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>エージェント数: </Text>
            <Text color={theme.colors.hex.green}>{config.selectedAgents?.length || 0}個</Text>
          </Flex>
          
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>ファイル保存先: </Text>
            <Text color={theme.colors.gray}>.claude/commands/{config.workflowName || 'my-workflow'}.md</Text>
          </Flex>
          
          {config.purpose && (
            <Flex>
              <Text color={theme.colors.hex.lightBlue}>目的: </Text>
              <Text color={theme.colors.hex.green}>{config.purpose}</Text>
            </Flex>
          )}
        </Box>
      </Section>

      {/* Usage Instructions */}
      <FeatureHighlights
        features={usageFeatures}
        contentWidth={contentWidth}
      />

      {/* Execution Order */}
      <Section title="📝 実行順序" spacing="sm">
        <Box flexDirection="column" gap={1}>
          {config.selectedAgents?.slice(0, 3).map((agent, index) => (
            <Box key={agent.id}>
              <Text color={theme.colors.hex.green}>{index + 1}. </Text>
              <Text color={theme.colors.white}>{agent.name}</Text>
              <Text color={theme.colors.gray}> - {agent.description}</Text>
            </Box>
          ))}
          {(config.selectedAgents?.length || 0) > 3 && (
            <Box>
              <Text color={theme.colors.gray}>... 他 {(config.selectedAgents?.length || 0) - 3}個のエージェント</Text>
            </Box>
          )}
        </Box>
      </Section>

      {/* Usage Hints */}
      <HintBox
        title="💡 ヒント"
        hints={usageHints}
      />

      {/* Next Action Menu */}
      <MenuSection
        items={choices}
        onSelect={handleSelect}
      />
    </UnifiedScreen>
  );
};