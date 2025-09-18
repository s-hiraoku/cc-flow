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
}

interface CompleteScreenProps {
  config: WorkflowConfig;
  onAnother: () => void;
  onExit: () => void;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({ config, onAnother, onExit }) => {
  const { exit } = useApp();

  const choices = [
    { label: '🔄 新しいワークフローを作成する', value: 'another' },
    { label: '🔧 コマンド変換モードに切り替える', value: 'convert' },
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

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'another') {
      onAnother();
    } else if (item.value === 'convert') {
      // TODO: Switch to conversion mode
      onAnother();
    } else {
      onExit();
    }
  };

  const frameWidth = 85;

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame title="ワークフロー作成完了" icon="🎉" minWidth={80} maxWidth={100}>
        <ContentLine align="center">
          <Text color="green" bold>🎉 ワークフローの作成が完了しました！</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text bold color="white">📋 作成されたワークフロー:</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="cyan">コマンド名: </Text>
            <Text color="green" bold>/{config.workflowName || 'my-workflow'}</Text>
          </Box>
        </ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="cyan">エージェント数: </Text>
            <Text color="yellow">{config.selectedAgents?.length || 0}個</Text>
          </Box>
        </ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="cyan">ファイル保存先: </Text>
            <Text color="gray">.claude/commands/{config.workflowName || 'my-workflow'}.md</Text>
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
          <Text bold color="white">🚀 使用方法:</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text color="green">1. 基本実行:</Text>
        </ContentLine>
        <ContentLine >
          <Box paddingLeft={2}>
            <Text color="gray">/{config.workflowName || 'my-workflow'} "あなたのタスク内容"</Text>
          </Box>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text color="green">2. 実行例:</Text>
        </ContentLine>
        <ContentLine >
          <Box paddingLeft={2}>
            <Text color="gray">/{config.workflowName || 'my-workflow'} "Webアプリの仕様書を作成してください"</Text>
          </Box>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text color="blue">📝 実行順序:</Text>
        </ContentLine>
        {config.selectedAgents?.slice(0, 3).map((agent, index) => (
          <ContentLine key={agent.id} >
            <Box paddingLeft={2}>
              <Text color="green">{index + 1}. </Text>
              <Text color="white">{agent.name}</Text>
              <Text color="gray"> - {agent.description}</Text>
            </Box>
          </ContentLine>
        ))}
        {(config.selectedAgents?.length || 0) > 3 && (
          <ContentLine >
            <Box paddingLeft={2}>
              <Text color="gray">... 他 {(config.selectedAgents?.length || 0) - 3}個のエージェント</Text>
            </Box>
          </ContentLine>
        )}
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text color="yellow">💡 ヒント:</Text>
        </ContentLine>
        <ContentLine >
          <Text color="gray">• エージェントは上記の順序で自動実行されます</Text>
        </ContentLine>
        <ContentLine >
          <Text color="gray">• 各エージェントの結果は次のエージェントに引き継がれます</Text>
        </ContentLine>
        <ContentLine >
          <Text color="gray">• ワークフローはClaude Code環境で実行可能です</Text>
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
          <Text color="gray">↑↓: 選択 | Enter: 実行 | N: 新規作成 | Q: 終了</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine align="center">
          <Text color="green">✅ お疲れ様でした！ワークフローをお試しください</Text>
        </ContentLine>
      </Frame>
    </Box>
  );
};