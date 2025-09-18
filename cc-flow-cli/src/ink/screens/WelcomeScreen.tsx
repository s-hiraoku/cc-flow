import React from 'react';
import { Text, useApp, Box } from 'ink';
import { FocusableMenu } from '../components/Interactive.js';
import { useTheme } from '../themes/theme.js';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { exit } = useApp();
  const theme = useTheme();

  const menuItems = [
    {
      label: '🚀 Start - CC-Flowを開始',
      value: 'start'
    },
    {
      label: '👋 Exit - アプリケーションを終了',
      value: 'exit'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'start') {
      onNext();
    } else if (item.value === 'exit') {
      exit();
    }
  };

  return (
    <Box justifyContent="center" alignItems="center" flexDirection="column" minHeight="100%">
      <Box 
        borderStyle="single" 
        borderColor="#3B82F6"
        paddingX={4}
        paddingY={2}
        width={80}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        {/* ASCII Art - Blue Gradient 3 Sections */}
        <Box flexDirection="column" alignItems="center">
          <Text color="#1E40AF">██████╗ ██████╗      ███████╗██╗      ██████╗ ██╗    ██╗</Text>
          <Text color="#1E40AF">██╔════╝██╔════╝     ██╔════╝██║     ██╔═══██╗██║    ██║</Text>
          <Text color="#3B82F6">██║     ██║    █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║</Text>
          <Text color="#3B82F6">██║     ██║    ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║</Text>
          <Text color="#60A5FA">╚██████╗╚██████╗     ██║     ███████╗╚██████╔╝╚███╔███╔╝</Text>
          <Text color="#60A5FA"> ╚═════╝ ╚═════╝     ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝</Text>
        </Box>

        {/* Subtitle */}
        <Box marginY={2} justifyContent="center" flexDirection="column" alignItems="center">
          <Text color="#3B82F6" italic>Claude Code Workflow Creation Tool</Text>
          <Text color="#6B7280">Version 0.0.10</Text>
        </Box>

        {/* Features */}
        <Box marginBottom={2} justifyContent="center" flexDirection="column" alignItems="center">
          <Text color="#10B981">🎯 エージェントを連携させてワークフロー作成</Text>
          <Text color="#10B981">⚡ 高速で効率的なタスク処理</Text>
        </Box>

        {/* Menu */}
        <Box width="100%" marginBottom={1} justifyContent="center">
          <FocusableMenu
            items={menuItems}
            onSelect={handleSelect}
          />
        </Box>

        {/* Controls */}
        <Box justifyContent="center">
          <Text color="#6B7280">↑↓: 選択 | Enter: 実行 | Q: 終了</Text>
        </Box>
      </Box>
    </Box>
  );
};