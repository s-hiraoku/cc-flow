import React, { useCallback } from 'react';
import { Box, Text, useInput, useApp, type Key } from 'ink';
import SelectInput from 'ink-select-input';
import { UnifiedScreen, MenuSection, ICONS } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import type { MenuItem } from '../components/Interactive.js';
import type { WorkflowConfig } from '../../models/Agent.js';

interface PreviewScreenProps {
  config: WorkflowConfig;
  onGenerate: () => void;
  onBack: () => void;
  isProcessing?: boolean;
  processingError?: string | null;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({ config, onGenerate, onBack, isProcessing, processingError }) => {
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  const choices: MenuItem[] = isProcessing ? [
    { label: `${ICONS.processing} 作成中...`, value: 'processing', disabled: true },
    { label: `${ICONS.error} キャンセル`, value: 'cancel' }
  ] : [
    { label: `${ICONS.rocket} ワークフローを作成する`, value: 'generate' },
    { label: `${ICONS.error} キャンセル`, value: 'cancel' }
  ];

  // Handle keyboard shortcuts
  useInput(useCallback((input: string, key: Key) => {
    if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (key.return && !isProcessing) {
      onGenerate();
    }
  }, [onBack, exit, onGenerate, isProcessing]));

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'generate' && !isProcessing) {
      onGenerate();
    } else if (item.value === 'cancel') {
      exit();
    }
  };

  const hasValidConfig = (config.selectedAgents?.length || 0) > 0;

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('preview', {
    title: '最終確認 - ワークフロー作成',
    subtitle: '設定内容を確認してワークフローを作成してください',
    icon: ICONS.clipboard
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
        `${ICONS.success} 設定完了 - ワークフローを作成できます` :
        `${ICONS.warning} エージェントを選択してから実行してください`}
    >
      {/* Workflow Basic Information */}
      <Section title={`${ICONS.edit} ワークフロー基本情報`} spacing="sm">
        <Box flexDirection="column" gap={1}>
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>名前: </Text>
            <Text color={theme.colors.hex.green} bold>/{config.workflowName || 'my-workflow'}</Text>
          </Flex>
          
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>対象パス: </Text>
            <Text color={theme.colors.hex.green} bold>{config.targetPath || './agents'}</Text>
          </Flex>
          
          <Flex>
            <Text color={theme.colors.hex.lightBlue}>実行環境: </Text>
            <Text color={theme.colors.hex.green} bold>{config.environment || 'Claude Code'}</Text>
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
      <Section title={`${ICONS.agent} 実行順序 (${config.selectedAgents?.length || 0}個のエージェント)`} spacing="sm">
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
      <Section title={`${ICONS.package} 生成されるファイル`} spacing="sm">
        <Box flexDirection="column" gap={1}>
          <Text color={theme.colors.hex.lightBlue}>• .claude/commands/{config.workflowName || 'my-workflow'}.md</Text>
          <Text color={theme.colors.hex.lightBlue}>• 一時的なPOMLファイル (処理後に削除)</Text>
        </Box>
      </Section>

      {/* Execution Instructions */}
      <Section title={`${ICONS.lightning} 実行方法`} spacing="sm">
        <Text color={theme.colors.hex.lightBlue}>
          作成後は /{config.workflowName || 'my-workflow'} コマンドで実行可能
        </Text>
      </Section>

      {/* Error Display */}
      {processingError && (
        <Section title={`${ICONS.error} エラー`} spacing="sm">
          <Box
            borderStyle="single"
            borderColor={theme.colors.error}
            padding={1}
            width="100%"
          >
            <Text color={theme.colors.error}>{processingError}</Text>
          </Box>
        </Section>
      )}

      {/* Action Selection */}
      <MenuSection
        items={choices}
        onSelect={handleSelect}
      />
    </UnifiedScreen>
  );
};