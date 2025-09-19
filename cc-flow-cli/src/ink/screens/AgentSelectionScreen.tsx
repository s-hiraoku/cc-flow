import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Container, Card, Section, Flex } from '../components/Layout.js';
import { CheckboxList, StatusBar } from '../components/Interactive.js';
import { useTheme } from '../themes/theme.js';
import { renderLines } from '../utils/text.js';

interface Agent {
  id: string;
  name: string;
  description: string;
  path: string;
}

interface AgentSelectionScreenProps {
  targetPath: string;
  onNext: (selectedAgents: Agent[]) => void;
  onBack: () => void;
}

export const AgentSelectionScreen: React.FC<AgentSelectionScreenProps> = ({
  targetPath,
  onNext,
  onBack
}) => {
  const theme = useTheme();
  const { exit } = useApp();

  const availableAgents: Agent[] = useMemo(() => ([
    { id: 'spec-init', name: 'spec-init', description: 'プロジェクト仕様の初期化', path: './agents/spec/spec-init.md' },
    { id: 'spec-requirements', name: 'spec-requirements', description: '要件定義と分析', path: './agents/spec/spec-requirements.md' },
    { id: 'spec-design', name: 'spec-design', description: 'システム設計と架構', path: './agents/spec/spec-design.md' },
    { id: 'spec-tasks', name: 'spec-tasks', description: 'タスク分解と計画', path: './agents/spec/spec-tasks.md' },
    { id: 'spec-impl', name: 'spec-impl', description: '実装仕様とガイド', path: './agents/spec/spec-impl.md' }
  ]), []);

  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  const cardWidth = Math.min(theme.layout.maxWidth, Math.max(theme.layout.minWidth, 84));
  const contentWidth = Math.max(24, cardWidth - theme.layout.paddingX * 2);

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

  useInput(useCallback((input: string, key: any) => {
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

  return (
    <Container centered fullHeight>
      <Card
        width={cardWidth}
        title="🤖 エージェント選択"
        subtitle={`対象: ${targetPath}`}
        align="left"
      >
        <Section spacing="sm">
          <Flex direction="column" align="flex-start" gap={1}>
            <Text color={theme.colors.info}>
              ワークフローに含めるエージェントを選択してください（スペースキーで切替）
            </Text>
            <Text color={theme.colors.text.muted}>
              選択順は後のステップで並べ替えできます。
            </Text>
          </Flex>
        </Section>

        <Section spacing="md">
          <CheckboxList
            items={availableAgents.map(agent => ({
              id: agent.id,
              label: agent.name,
              description: agent.description,
              icon: '🤖'
            }))}
            selectedIds={selectedAgents}
            onToggle={handleToggle}
            width={contentWidth}
            maxHeight={12}
          />
        </Section>

        <Section spacing="sm">
          <Box
            borderStyle={theme.layout.borderStyle}
            borderColor={selectedAgents.size > 0 ? theme.colors.success : theme.colors.warning}
            paddingX={1}
            paddingY={0}
            width={contentWidth}
            flexDirection="column"
          >
            <Flex justify="space-between" align="center">
              <Text color={theme.colors.text.primary}>
                選択済みエージェント数
              </Text>
              <Text color={selectedAgents.size > 0 ? theme.colors.success : theme.colors.warning} bold>
                {selectedAgents.size} / {availableAgents.length}
              </Text>
            </Flex>
            <Box marginTop={1} flexDirection="column">
              {summaryLines.map((line, index) => (
                <Text
                  key={`summary-${index}`}
                  color={selectedAgents.size > 0 ? theme.colors.success : theme.colors.warning}
                >
                  {line}
                </Text>
              ))}
            </Box>
          </Box>
        </Section>

        <Section spacing="sm">
          <StatusBar
            center={selectedAgents.size === 0 ? '⚠️ 少なくとも1つ選択してください' : `✅ ${selectedAgents.size}個選択中 | Enter: 次へ進む`}
            variant={selectedAgents.size === 0 ? 'warning' : 'success'}
            width={contentWidth}
          />
        </Section>

        <Section spacing="sm">
          <StatusBar
            center="↑↓: 移動 | Space: 選択切替 | Enter: 確定 | Esc: 戻る | Q: 終了"
            variant="info"
            width={contentWidth}
          />
        </Section>
      </Card>
    </Container>
  );
};
