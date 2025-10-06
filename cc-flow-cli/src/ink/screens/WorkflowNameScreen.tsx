import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp, type Key } from 'ink';
import TextInput from 'ink-text-input';
import { UnifiedScreen, ScreenDescription, HintBox, ICONS } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';

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
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  // Handle global keyboard shortcuts
  useInput(useCallback((input: string, key: Key) => {
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

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('configuration', {
    title: 'ワークフロー名設定',
    subtitle: `対象ディレクトリ: ${targetPath}`,
    icon: ICONS.edit
  });

  const statusItems = [
    { key: 'Field', value: currentField === 'name' ? 'Name' : 'Purpose' },
    { key: 'Status', value: isValidName ? 'Valid' : 'Invalid', color: isValidName ? '#00ff00' : '#ff0000' }
  ];

  const inputHints = [
    '• ワークフロー名はコマンド名として使用されます',
    '• 英数字とハイフンが推奨されます (例: my-spec-workflow)',
    '• 目的は省略可能ですが、チーム共有時に便利です'
  ];

  const operationHints = [
    'Enter: 次のフィールド/確定 | Tab: フィールド切替',
    'Esc: 戻る | Q: 終了'
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={!isValidName ? `${ICONS.warning} ワークフロー名を入力してください` :
        currentField === 'name' ? `${ICONS.success} Enterキーで次のフィールドに進みます` :
        `${ICONS.success} Enterキーでワークフロー設定を完了します`}
    >
      {/* Screen Description */}
      <ScreenDescription
        heading="ワークフローの名前と目的を設定してください"
        align="center"
      />

      {/* Workflow Configuration Form */}
      <Section spacing="md">
        <Box flexDirection="column" gap={2}>
          {/* Workflow Name Field */}
          <Box flexDirection="column" gap={1}>
            <Box>
              <Text color={currentField === 'name' ? theme.colors.hex.lightBlue : theme.colors.white} bold>
                ワークフロー名: 
              </Text>
              <Text color={currentField === 'name' ? theme.colors.hex.green : theme.colors.gray}>
                {currentField === 'name' ? '(入力中)' : `${workflowName}`}
              </Text>
            </Box>
            
            {currentField === 'name' && (
              <Box paddingLeft={2}>
                <Text color={theme.colors.hex.lightBlue}>▶ </Text>
                <TextInput
                  value={workflowName}
                  onChange={setWorkflowName}
                  onSubmit={handleNameSubmit}
                  placeholder="例: spec-workflow"
                />
              </Box>
            )}
          </Box>

          {/* Purpose Field */}
          <Box flexDirection="column" gap={1}>
            <Box>
              <Text color={currentField === 'purpose' ? theme.colors.hex.lightBlue : theme.colors.white} bold>
                目的・説明: 
              </Text>
              <Text color={currentField === 'purpose' ? theme.colors.hex.green : theme.colors.gray}>
                {currentField === 'purpose' ? '(入力中)' : 
                 purpose ? `${purpose}` : '(オプション)'}
              </Text>
            </Box>
            
            {currentField === 'purpose' && (
              <Box paddingLeft={2}>
                <Text color={theme.colors.hex.lightBlue}>▶ </Text>
                <TextInput
                  value={purpose}
                  onChange={setPurpose}
                  onSubmit={handlePurposeSubmit}
                  placeholder="例: 仕様書作成からコード生成までの一連の流れ"
                />
              </Box>
            )}
          </Box>
        </Box>
      </Section>

      {/* Input Hints */}
      <HintBox
        title={`${ICONS.hint} 入力のヒント`}
        hints={inputHints}
      />

      {/* Operation Hints */}
      <HintBox
        title={`${ICONS.edit} 操作方法`}
        hints={operationHints}
      />
    </UnifiedScreen>
  );
};