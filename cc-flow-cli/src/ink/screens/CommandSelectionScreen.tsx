import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { UnifiedScreen, ScreenDescription } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { CheckboxList, StatusBar } from '../components/Interactive.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { renderLines } from '../utils/text.js';
import { getCommandsFromPath, type Command as CommandType } from '../utils/directoryUtils.js';

interface CommandSelectionScreenProps {
  targetPath: string;
  onNext: (selectedCommands: CommandType[]) => void;
  onBack: () => void;
}

export const CommandSelectionScreen: React.FC<CommandSelectionScreenProps> = ({
  targetPath,
  onNext,
  onBack
}) => {
  const theme = useTheme();
  const { exit } = useApp();
  const { contentWidth } = useScreenDimensions();

  const [availableCommands, setAvailableCommands] = useState<CommandType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommands = async () => {
      try {
        setIsLoading(true);
        const commands = getCommandsFromPath(targetPath);
        setAvailableCommands(commands);
      } catch (error) {
        console.error('Failed to load commands:', error);
        setAvailableCommands([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommands();
  }, [targetPath]);

  const [selectedCommands, setSelectedCommands] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((commandId: string) => {
    setSelectedCommands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commandId)) {
        newSet.delete(commandId);
      } else {
        newSet.add(commandId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedCommands.size === availableCommands.length) {
      setSelectedCommands(new Set());
    } else {
      setSelectedCommands(new Set(availableCommands.map(cmd => cmd.id)));
    }
  }, [selectedCommands.size, availableCommands]);

  const handleNext = useCallback(() => {
    const selectedCommandList = availableCommands.filter(cmd => selectedCommands.has(cmd.id));
    if (selectedCommandList.length > 0) {
      onNext(selectedCommandList);
    }
  }, [availableCommands, selectedCommands, onNext]);

  // Keyboard shortcuts
  useInput(useCallback((input: string, key: any) => {
    if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (input === 'a' || input === 'A') {
      handleSelectAll();
    } else if (key.return && selectedCommands.size > 0) {
      handleNext();
    }
  }, [onBack, exit, handleSelectAll, selectedCommands.size, handleNext]));

  const checkboxItems = useMemo(() => 
    availableCommands.map(command => ({
      id: command.id,
      label: command.name,
      checked: selectedCommands.has(command.id),
      description: command.description
    })),
    [availableCommands, selectedCommands]
  );

  const hasValidSelection = selectedCommands.size > 0;

  // Screen configuration
  const screenConfig = createScreenLayout('selection', {
    title: 'スラッシュコマンド選択',
    subtitle: '変換するスラッシュコマンドを選択してください',
    icon: '📋'
  });

  const statusItems = [
    { key: 'Commands', value: `${availableCommands.length}個` },
    { key: 'Selected', value: `${selectedCommands.size}個` },
    { key: 'Status', value: hasValidSelection ? 'Ready' : 'Select Items', color: hasValidSelection ? '#00ff00' : '#ffaa00' }
  ];

  const shortcuts = [
    '↑↓: 移動',
    'Space: 選択/解除',
    'A: 全選択/全解除',
    'Enter: 次へ',
    'Esc: 戻る'
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={hasValidSelection ? 
        '✅ スラッシュコマンドが選択されました - Enterで次へ進みます' : 
        '📋 変換するスラッシュコマンドを選択してください (Spaceで選択)'}
    >
      {/* Screen Description */}
      <ScreenDescription
        heading="変換対象のスラッシュコマンドを選択"
        subheading="選択されたスラッシュコマンドが新しいサブエージェント形式に変換されます"
        align="center"
      />

      {/* Command Selection */}
      <Section title={`📋 利用可能なスラッシュコマンド (${targetPath})`} spacing="sm">
        {isLoading ? (
          <Text color={theme.colors.hex.blue}>
            🔍 スラッシュコマンドを読み込み中...
          </Text>
        ) : availableCommands.length === 0 ? (
          <Box flexDirection="column" gap={1}>
            <Text color={theme.colors.error}>
              ❌ 選択されたディレクトリにスラッシュコマンドが見つかりません
            </Text>
            <Text color={theme.colors.text.muted}>
              💡 .md ファイル形式のスラッシュコマンドを配置してください
            </Text>
          </Box>
        ) : (
          <CheckboxList
            items={checkboxItems}
            onToggle={handleToggle}
            contentWidth={contentWidth}
          />
        )}
      </Section>

      {/* Selection Summary */}
      {selectedCommands.size > 0 && (
        <Section title="📊 選択サマリー" spacing="sm">
          <Box flexDirection="column" gap={1}>
            <Text color={theme.colors.hex.green}>
              ✅ {selectedCommands.size}個のスラッシュコマンドが選択されています
            </Text>
            <Text color={theme.colors.text.muted}>
              これらのコマンドが新しいサブエージェント形式に変換されます
            </Text>
          </Box>
        </Section>
      )}

      {/* Keyboard Shortcuts */}
      <StatusBar 
        shortcuts={shortcuts}
        contentWidth={contentWidth}
      />
    </UnifiedScreen>
  );
};