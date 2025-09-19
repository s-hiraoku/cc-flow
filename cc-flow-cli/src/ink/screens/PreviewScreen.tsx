import React, { useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { UnifiedScreen, ScreenDescription, MenuSection } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { MenuItem } from '../components/Interactive.js';

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
  environment?: string;
}

interface PreviewScreenProps {
  config: WorkflowConfig;
  onGenerate: () => void;
  onBack: () => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({ config, onGenerate, onBack }) => {
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  const choices: MenuItem[] = [
    { label: '🚀 ワークフローを作成する', value: 'generate' },
    { label: '✏️ 設定を修正する', value: 'back' },
    { label: '❌ キャンセル', value: 'cancel' }
  ];

  // Handle keyboard shortcuts
  useInput(useCallback((input: string, key: any) => {
    if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (key.return) {
      onGenerate();
    }
  }, [onBack, exit, onGenerate]));

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'generate') {
      onGenerate();
    } else if (item.value === 'back') {
      onBack();
    } else if (item.value === 'cancel') {
      exit();
    }
  };

  const hasValidConfig = (config.selectedAgents?.length || 0) > 0;

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('preview', {
    title: 'ワークフロー プレビュー',
    subtitle: '作成するワークフローの設定を確認してください',
    icon: '📋'
  });

  const statusItems = [
    { key: 'Agents', value: `${config.selectedAgents?.length || 0}個` },
    { key: 'Status', value: hasValidConfig ? 'Ready' : 'Invalid', color: hasValidConfig ? '#00ff00' : '#ff0000' }
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={hasValidConfig ? 
        '✅ 設定完了 - ワークフローを作成できます' : 
        '⚠️ エージェントを選択してから実行してください'}
    >
      {/* Workflow Basic Information */}
      <Section title="📝 ワークフロー基本情報" spacing="sm">
        <Box flexDirection="column" gap={1}>
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>名前: </Text>
            <Text color={theme.colors.hex.green} bold>/{config.workflowName || 'my-workflow'}</Text>
          </Flex>
          
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>対象パス: </Text>
            <Text color={theme.colors.gray}>{config.targetPath || './agents'}</Text>
          </Flex>
          
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>実行環境: </Text>
            <Text color={theme.colors.gray}>{config.environment || 'Claude Code'}</Text>
          </Flex>
          
          {config.purpose && (
            <Flex>
              <Text color={theme.colors.hex.lightBlue}>目的: </Text>
              <Text color={theme.colors.hex.green}>{config.purpose}</Text>
            </Flex>
          )}
        </Box>
      </Section>

      {/* Agent Execution Order */}
      <Section title={`🤖 実行順序 (${config.selectedAgents?.length || 0}個のエージェント)`} spacing="sm">
        <Box flexDirection="column" gap={1}>
          {config.selectedAgents?.map((agent, index) => (
            <Box key={agent.id}>
              <Text color={theme.colors.hex.green} bold>
                {(index + 1).toString().padStart(2, ' ')}. 
              </Text>
              <Text color={theme.colors.white}> {agent.name}</Text>
              <Text color={theme.colors.gray}> - {agent.description}</Text>
            </Box>
          )) || (
            <Text color={theme.colors.error}>エージェントが選択されていません</Text>
          )}
        </Box>
      </Section>

      {/* Generated Files */}
      <Section title="📦 生成されるファイル" spacing="sm">
        <Box flexDirection="column" gap={1}>
          <Text color={theme.colors.gray}>• .claude/commands/{config.workflowName || 'my-workflow'}.md</Text>
          <Text color={theme.colors.gray}>• 一時的なPOMLファイル (処理後に削除)</Text>
        </Box>
      </Section>

      {/* Execution Instructions */}
      <Section title="⚡ 実行方法" spacing="sm">
        <Text color={theme.colors.gray}>
          作成後は /{config.workflowName || 'my-workflow'} コマンドで実行可能
        </Text>
      </Section>

      {/* Action Selection */}
      <MenuSection
        items={choices}
        onSelect={handleSelect}
      />
    </UnifiedScreen>
  );
};