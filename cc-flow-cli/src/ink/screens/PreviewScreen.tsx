import React, { useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { Frame, ContentLine } from '../components/Frame.js';

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

  const choices = [
    { label: '🚀 ワークフローを作成する', value: 'generate' },
    { label: '✏️  設定を修正する', value: 'back' },
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

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'generate') {
      onGenerate();
    } else if (item.value === 'back') {
      onBack();
    } else if (item.value === 'cancel') {
      exit();
    }
  };

  const frameWidth = 90;

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame title="ワークフロー プレビュー" icon="📋" minWidth={85} maxWidth={110}>
        <ContentLine align="center">
          <Text color="cyan">作成するワークフローの設定を確認してください</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text bold color="white">📝 ワークフロー基本情報:</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="cyan">名前: </Text>
            <Text color="green" bold>/{config.workflowName || 'my-workflow'}</Text>
          </Box>
        </ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="cyan">対象パス: </Text>
            <Text color="gray">{config.targetPath || './agents'}</Text>
          </Box>
        </ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="cyan">実行環境: </Text>
            <Text color="gray">{config.environment || 'Claude Code'}</Text>
          </Box>
        </ContentLine>
        
        {config.purpose && (
          <ContentLine >
            <Box>
              <Text color="cyan">目的: </Text>
              <Text color="yellow">{config.purpose}</Text>
            </Box>
          </ContentLine>
        )}
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text bold color="white">🤖 実行順序 ({config.selectedAgents?.length || 0}個のエージェント):</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        {config.selectedAgents?.map((agent, index) => (
          <ContentLine key={agent.id} >
            <Box>
              <Text color="green" bold>
                {(index + 1).toString().padStart(2, ' ')}. 
              </Text>
              <Text color="white"> {agent.name}</Text>
              <Text color="gray"> - {agent.description}</Text>
            </Box>
          </ContentLine>
        )) || (
          <ContentLine >
            <Text color="red">エージェントが選択されていません</Text>
          </ContentLine>
        )}
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text color="blue">📦 生成されるファイル:</Text>
        </ContentLine>
        <ContentLine >
          <Text color="gray">• .claude/commands/{config.workflowName || 'my-workflow'}.md</Text>
        </ContentLine>
        <ContentLine >
          <Text color="gray">• 一時的なPOMLファイル (処理後に削除)</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text color="yellow">⚡ 実行方法:</Text>
        </ContentLine>
        <ContentLine >
          <Text color="gray">作成後は /{config.workflowName || 'my-workflow'} コマンドで実行可能</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Box paddingLeft={2}>
            <SelectInput
              items={choices}
              onSelect={handleSelect}
              indicatorComponent={({ isSelected }) => (
                <Box marginRight={1}>
                  <Text color="cyan">{isSelected ? '▶' : ' '}</Text>
                </Box>
              )}
              itemComponent={({ label, isSelected }) => (
                <Text {...(isSelected ? { color: 'cyan' } : {})}>
                  {label}
                </Text>
              )}
            />
          </Box>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine align="center">
          <Text color="blue">📝 操作方法:</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">↑↓: 選択 | Enter: 実行/選択 | Esc: 戻る | Q: 終了</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        {(config.selectedAgents?.length || 0) > 0 ? (
          <ContentLine align="center">
            <Text color="green">✅ 設定完了 - ワークフローを作成できます</Text>
          </ContentLine>
        ) : (
          <ContentLine align="center">
            <Text color="red">⚠️ エージェントを選択してから実行してください</Text>
          </ContentLine>
        )}
      </Frame>
    </Box>
  );
};