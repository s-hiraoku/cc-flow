import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Text, useApp, useInput, type Key } from 'ink';
import { UnifiedScreen, ScreenDescription } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { CheckboxList, StatusBar } from '../components/Interactive.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { renderLines } from '../utils/text.js';
import { getAgentsFromPath, type Agent as AgentType } from '../utils/directoryUtils.js';



interface AgentSelectionScreenProps {
  targetPath: string;
  onNext: (selectedAgents: AgentType[]) => void;
  onBack: () => void;
}

export const AgentSelectionScreen: React.FC<AgentSelectionScreenProps> = ({
  targetPath,
  onNext,
  onBack
}) => {
  const theme = useTheme();
  const { exit } = useApp();
  const { contentWidth } = useScreenDimensions();

  const [availableAgents, setAvailableAgents] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setIsLoading(true);
        const agents = getAgentsFromPath(targetPath);
        setAvailableAgents(agents);
      } catch (error) {
        console.error('Failed to load agents:', error);
        setAvailableAgents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [targetPath]);

  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((agentId: string) => {
    setSelectedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (selectedAgents.size > 0) {
      const selected = availableAgents.filter(agent => selectedAgents.has(agent.id));
      onNext(selected);
    }
  }, [availableAgents, onNext, selectedAgents]);

  useInput(useCallback((input: string, key: Key) => {
    if (key.return && selectedAgents.size > 0) {
      handleNext();
    } else if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    }
  }, [exit, handleNext, onBack, selectedAgents.size]));

  const selectedAgentsList = availableAgents.filter(agent => selectedAgents.has(agent.id));

  const summaryLines = selectedAgentsList.length === 0
    ? renderLines('⚠️  少なくとも1つのエージェントを選択してください', contentWidth - 4, 'left')
    : selectedAgentsList.map((agent, index) => `${index + 1}. ${agent.name}`);

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('selection', {
    title: '🤖 エージェント選択',
    subtitle: `対象: ${targetPath}`,
    align: 'left'
  });

  const statusItems = [
    { key: 'Selected', value: `${selectedAgents.size}/${availableAgents.length}` },
    { key: 'Status', value: selectedAgents.size > 0 ? 'Ready' : 'Waiting', color: selectedAgents.size > 0 ? '#00ff00' : '#ffaa00' }
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={selectedAgents.size === 0 ? '⚠️ 少なくとも1つ選択してください' : `✅ ${selectedAgents.size}個選択中 | Enter: 次へ進む`}
    >
      {/* Screen Description */}
      <ScreenDescription
        heading="ワークフローに含めるサブエージェントを選択"
        subheading="スペースキーで選択/解除します。実行順序は次のステップで調整できます"
        align="center"
      />

      {/* Agent Selection List */}
      <Section spacing="md">
        <CheckboxList
          items={availableAgents.map(agent => ({
            id: agent.id,
            label: agent.name,
            description: agent.description,
            icon: agent.icon || '🤖'
          }))}
          selectedIds={selectedAgents}
          onToggle={handleToggle}
          width={contentWidth}
          maxHeight={12}
        />
      </Section>

      {/* Selection Summary */}
      <Section spacing="sm">
        <Box
          borderStyle={theme.layout.borderStyle}
          borderColor={selectedAgents.size > 0 ? theme.colors.hex.green : theme.colors.hex.orange}
          paddingX={1}
          paddingY={0}
          width={contentWidth}
          flexDirection="column"
        >
          <Flex justify="space-between" align="center">
            <Text color={theme.colors.white}>
              選択済みエージェント数
            </Text>
            <Text color={selectedAgents.size > 0 ? theme.colors.hex.green : theme.colors.hex.orange} bold>
              {selectedAgents.size} / {availableAgents.length}
            </Text>
          </Flex>
          <Box marginTop={1} flexDirection="column">
            {summaryLines.map((line, index) => (
              <Text
                key={`summary-${index}`}
                color={selectedAgents.size > 0 ? theme.colors.hex.green : theme.colors.hex.orange}
              >
                {line}
              </Text>
            ))}
          </Box>
        </Box>
      </Section>

      {/* Additional Status Bar for Controls */}
      <Section spacing="sm">
        <StatusBar
          center="↑↓: 移動 | Space: 選択切替 | Enter: 確定 | Esc: 戻る | Q: 終了"
          variant="info"
          width={contentWidth}
        />
      </Section>
    </UnifiedScreen>
  );
};