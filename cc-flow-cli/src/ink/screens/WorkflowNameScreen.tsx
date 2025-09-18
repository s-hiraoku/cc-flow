import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { Frame, ContentLine } from '../components/Frame.js';

interface WorkflowNameScreenProps {
  targetPath: string;
  onNext: (workflowName: string, purpose: string) => void;
  onBack: () => void;
}

export const WorkflowNameScreen: React.FC<WorkflowNameScreenProps> = ({ 
  targetPath,
  onNext, 
  onBack 
}) => {
  const [workflowName, setWorkflowName] = useState('my-workflow');
  const [purpose, setPurpose] = useState('');
  const [currentField, setCurrentField] = useState<'name' | 'purpose'>('name');
  const { exit } = useApp();

  // Handle global keyboard shortcuts
  useInput(useCallback((input: string, key: any) => {
    if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (key.tab) {
      // Switch between fields with tab
      setCurrentField(prev => prev === 'name' ? 'purpose' : 'name');
    }
  }, [onBack, exit]), {
    isActive: true
  });

  const handleNameSubmit = useCallback(() => {
    if (workflowName.trim()) {
      setCurrentField('purpose');
    }
  }, [workflowName]);

  const handlePurposeSubmit = useCallback(() => {
    if (workflowName.trim()) {
      onNext(workflowName.trim(), purpose.trim());
    }
  }, [workflowName, purpose, onNext]);

  const isValidName = workflowName.trim().length > 0;

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame title="ワークフロー名設定" icon="✏️" minWidth={75} maxWidth={95}>
        <ContentLine align="center">
          <Text color="cyan">ワークフローの名前と目的を設定してください</Text>
        </ContentLine>
        
        <ContentLine align="center">
          <Text color="gray">対象ディレクトリ: {targetPath}</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine>
          <Text bold color="white">ワークフロー設定:</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine>
          <Box>
            <Text color={currentField === 'name' ? 'cyan' : 'white'} bold>
              ワークフロー名: 
            </Text>
            <Text color={currentField === 'name' ? 'green' : 'gray'}>
              {currentField === 'name' ? '(入力中)' : `${workflowName}`}
            </Text>
          </Box>
        </ContentLine>
        
        {currentField === 'name' && (
          <ContentLine>
            <Box paddingLeft={2}>
              <Text color="cyan">▶ </Text>
              <TextInput
                value={workflowName}
                onChange={setWorkflowName}
                onSubmit={handleNameSubmit}
                placeholder="例: spec-workflow"
              />
            </Box>
          </ContentLine>
        )}
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine>
          <Box>
            <Text color={currentField === 'purpose' ? 'cyan' : 'white'} bold>
              目的・説明: 
            </Text>
            <Text color={currentField === 'purpose' ? 'green' : 'gray'}>
              {currentField === 'purpose' ? '(入力中)' : 
               purpose ? `${purpose}` : '(オプション)'}
            </Text>
          </Box>
        </ContentLine>
        
        {currentField === 'purpose' && (
          <ContentLine>
            <Box paddingLeft={2}>
              <Text color="cyan">▶ </Text>
              <TextInput
                value={purpose}
                onChange={setPurpose}
                onSubmit={handlePurposeSubmit}
                placeholder="例: 仕様書作成からコード生成までの一連の流れ"
              />
            </Box>
          </ContentLine>
        )}
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine>
          <Text color="yellow">💡 入力のヒント:</Text>
        </ContentLine>
        <ContentLine>
          <Text color="gray">• ワークフロー名はコマンド名として使用されます</Text>
        </ContentLine>
        <ContentLine>
          <Text color="gray">• 英数字とハイフンが推奨されます (例: my-spec-workflow)</Text>
        </ContentLine>
        <ContentLine>
          <Text color="gray">• 目的は省略可能ですが、チーム共有時に便利です</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine align="center">
          <Text color="blue">📝 操作方法:</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">Enter: 次のフィールド/確定 | Tab: フィールド切替</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">Esc: 戻る | Q: 終了</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        {!isValidName ? (
          <ContentLine align="center">
            <Text color="red">⚠️ ワークフロー名を入力してください</Text>
          </ContentLine>
        ) : currentField === 'name' ? (
          <ContentLine align="center">
            <Text color="green">✅ Enterキーで次のフィールドに進みます</Text>
          </ContentLine>
        ) : (
          <ContentLine align="center">
            <Text color="green">✅ Enterキーでワークフロー設定を完了します</Text>
          </ContentLine>
        )}
      </Frame>
    </Box>
  );
};