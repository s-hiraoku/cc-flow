import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { UnifiedScreen, ScreenDescription, MenuSection, HintBox } from '../design-system/index.js';
import { createScreenLayout } from '../design-system/ScreenPatterns.js';
import { MenuItem } from '../components/Interactive.js';
import { Section } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import { getAgentDirectories } from '../utils/directoryUtils.js';

interface DirectoryScreenProps {
  onNext: (targetPath: string) => void;
  onBack: () => void;
}

const DirectoryScreenContent: React.FC<DirectoryScreenProps> = ({ onNext, onBack }) => {
  const theme = useTheme();
  const [directories, setDirectories] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDirectories = async () => {
      try {
        setIsLoading(true);
        const dirs = getAgentDirectories('.claude/agents').map<MenuItem>((dir) => ({
          id: dir.id,
          label: dir.label,
          value: dir.value,
          icon: dir.icon,
          description: dir.description
        }));
        setDirectories(dirs);
      } catch (error) {
        console.error('Failed to load directories:', error);
        // エラー時はデフォルトの戻るオプションのみ表示
        setDirectories([{
          id: 'back',
          label: '戻る',
          value: 'back',
          icon: '↩️',
          description: '前の画面に戻ります'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectories();
  }, []);

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'back') {
      onBack();
    } else {
      onNext(item.value);
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('selection', {
    title: 'エージェントディレクトリ選択',
    subtitle: 'ワークフロー作成対象の選択',
    icon: '📂'
  });

  const hintBoxContent = [
    '• ./claude/agents/ 内の各ディレクトリでサブエージェントをカテゴリ分け',
    '• ディレクトリを選択すると、その中のサブエージェントのみが表示されます',
    '• 目的に応じてディレクトリを選ぶことで、適切なサブエージェントを見つけやすくなります',
    '• 「全体」を選択すると、すべてのディレクトリのサブエージェントから選択できます'
  ];

  return (
    <UnifiedScreen config={screenConfig}>
      {/* Screen Description */}
      <ScreenDescription
        heading="選択したディレクトリ内のエージェントが"
        subheading="ワークフロー作成時に利用可能になります"
        align="center"
      />

      {/* Directory Selection */}
      <Section title="📁 利用可能なディレクトリ" spacing="sm">
        {isLoading ? (
          <Box padding={2}>
            <Text color={theme.colors.hex.blue}>
              🔍 ディレクトリを読み込み中...
            </Text>
          </Box>
        ) : (
          <MenuSection
            items={directories}
            onSelect={handleSelect}
            showDescription={true}
          />
        )}
      </Section>

      {/* Hint Box */}
      <HintBox
        title="💡 ディレクトリ構成について"
        hints={hintBoxContent}
      />
    </UnifiedScreen>
  );
};

export const DirectoryScreen: React.FC<DirectoryScreenProps> = (props) => (
  <DirectoryScreenContent {...props} />
);