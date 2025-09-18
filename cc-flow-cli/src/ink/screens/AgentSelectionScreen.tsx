import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, Spacer, useInput, useApp } from 'ink';
import { Container, Card, Section, Flex } from '../components/Layout.js';
import { CheckboxList, StatusBar, MenuItem } from '../components/Interactive.js';
import { useTheme } from '../themes/theme.js';

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

const AgentSelectionScreenContent: React.FC<AgentSelectionScreenProps> = ({ 
  targetPath, 
  onNext, 
  onBack 
}) => {
  const theme = useTheme();
  const { exit } = useApp();
  
  // Mock agents for now - in real implementation this would come from targetPath
  const availableAgents: Agent[] = [
    { id: 'spec-init', name: 'spec-init', description: 'プロジェクト仕様の初期化', path: './agents/spec/spec-init.md' },
    { id: 'spec-requirements', name: 'spec-requirements', description: '要件定義と分析', path: './agents/spec/spec-requirements.md' },
    { id: 'spec-design', name: 'spec-design', description: 'システム設計と架構', path: './agents/spec/spec-design.md' },
    { id: 'spec-tasks', name: 'spec-tasks', description: 'タスク分解と計画', path: './agents/spec/spec-tasks.md' },
    { id: 'spec-impl', name: 'spec-impl', description: '実装仕様とガイド', path: './agents/spec/spec-impl.md' },
  ];

  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  // エージェントをMenuItemに変換
  const menuItems: MenuItem[] = availableAgents.map(agent => ({
    id: agent.id,
    label: agent.name,
    value: agent.id,
    icon: '🤖',
    description: agent.description
  }));

  const handleToggle = useCallback((agentId: string) => {
    setSelectedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (selectedAgents.size > 0) {
      const selected = availableAgents.filter(agent => selectedAgents.has(agent.id));
      onNext(selected);
    }
  }, [selectedAgents, availableAgents, onNext]);

  // グローバルキーバインド
  useInput(useCallback((input: string, key: any) => {
    if (key.return && selectedAgents.size > 0) {
      handleNext();
    } else if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    }
  }, [selectedAgents.size, handleNext, onBack, exit]));

  // 選択されたエージェントのリスト
  const selectedAgentsList = availableAgents.filter(agent => selectedAgents.has(agent.id));

  return (
    <Container centered>
      <Card
        title="エージェント選択"
        subtitle={`対象: ${targetPath}`}
        icon="🤖"
        variant="primary"
        fullHeight
      >
        {/* 説明セクション */}
        <Section spacing="sm">
          <Flex direction="column" align="center" gap={1}>
            <Text color={theme.colors.info}>
              ワークフローに含めるエージェントを選択してください
            </Text>
            <Text color={theme.colors.text.secondary}>
              複数選択可能です（スペースキーで切替）
            </Text>
          </Flex>
        </Section>

        <Spacer />

        {/* エージェント選択リスト */}
        <Section title="🤖 利用可能なエージェント" spacing="sm">
          <Box height={Math.min(availableAgents.length + 2, 12)}>
            <CheckboxList
              items={menuItems}
              selectedIds={selectedAgents}
              onToggle={handleToggle}
              focusId="agent-list"
              multiSelect={true}
            />
          </Box>
        </Section>

        <Spacer />

        {/* 選択状況表示 */}
        <Section title="📋 選択状況" spacing="sm">
          <Box 
            borderStyle="single"
            borderColor={selectedAgents.size > 0 ? theme.colors.success : theme.colors.warning}
            padding={1}
            width="100%"
          >
            <Flex direction="column" gap={1}>
              <Flex justify="space-between" align="center">
                <Text color={theme.colors.text.primary}>
                  選択済みエージェント数:
                </Text>
                <Text 
                  color={selectedAgents.size > 0 ? theme.colors.success : theme.colors.warning}
                  bold
                >
                  {selectedAgents.size} / {availableAgents.length}
                </Text>
              </Flex>
              
              {selectedAgents.size > 0 && (
                <Box flexDirection="column">
                  <Text color={theme.colors.text.secondary} marginBottom={1}>
                    選択されたエージェント:
                  </Text>
                  {selectedAgentsList.map((agent, index) => (
                    <Text key={agent.id} color={theme.colors.success}>
                      {index + 1}. {agent.name}
                    </Text>
                  ))}
                </Box>
              )}
            </Flex>
          </Box>
        </Section>

        {/* 次へボタン状態 */}
        {selectedAgents.size === 0 ? (
          <StatusBar
            center="⚠️ 少なくとも1つのエージェントを選択してください"
            variant="warning"
          />
        ) : (
          <StatusBar
            center={`✅ ${selectedAgents.size}個選択中 | Enter: 次へ進む`}
            variant="success"
          />
        )}

        {/* 操作ガイド */}
        <Box marginTop={1}>
          <StatusBar
            center="↑↓: 移動 | Space: 選択切替 | Enter: 確定 | Esc: 戻る | Q: 終了"
            variant="default"
          />
        </Box>
      </Card>
    </Container>
  );
};

export const AgentSelectionScreen: React.FC<AgentSelectionScreenProps> = (props) => (
  <AgentSelectionScreenContent {...props} />
);