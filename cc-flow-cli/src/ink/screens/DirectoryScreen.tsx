import React from 'react';
import { Box, Text, Spacer } from 'ink';
import { Container, Card, Section, Flex } from '../components/Layout.js';
import { FocusableMenu, StatusBar, MenuItem } from '../components/Interactive.js';
import { useTheme } from '../themes/theme.js';

interface DirectoryScreenProps {
  onNext: (targetPath: string) => void;
  onBack: () => void;
}

const DirectoryScreenContent: React.FC<DirectoryScreenProps> = ({ onNext, onBack }) => {
  const theme = useTheme();
  
  const directories: MenuItem[] = [
    {
      id: 'all-agents',
      label: 'すべてのエージェント',
      value: './agents',
      icon: '📂',
      description: 'プロジェクト内のすべてのエージェントディレクトリを対象とします'
    },
    {
      id: 'spec-agents',
      label: 'spec/ - 仕様定義エージェント',
      value: './agents/spec',
      icon: '📋',
      description: '仕様定義・要件分析・設計関連のエージェントが含まれます'
    },
    {
      id: 'utility-agents',
      label: 'utility/ - ユーティリティエージェント',
      value: './agents/utility',
      icon: '🔧',
      description: '汎用的なヘルパーエージェントやツール系エージェントが含まれます'
    },
    {
      id: 'back',
      label: '戻る',
      value: 'back',
      icon: '↩️',
      description: '前の画面に戻ります'
    }
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'back') {
      onBack();
    } else {
      onNext(item.value);
    }
  };

  return (
    <Container centered>
      <Card
        title="エージェントディレクトリ選択"
        subtitle="ワークフロー作成対象の選択"
        icon="📂"
        variant="primary"
        fullHeight
      >
        {/* 説明セクション */}
        <Section spacing="sm">
          <Flex direction="column" align="center" gap={1}>
            <Text color={theme.colors.info}>
              選択したディレクトリ内のエージェントが
            </Text>
            <Text color={theme.colors.info}>
              ワークフロー作成時に利用可能になります
            </Text>
          </Flex>
        </Section>

        <Spacer />

        {/* ディレクトリ選択 */}
        <Section title="📁 利用可能なディレクトリ" spacing="sm">
          <FocusableMenu
            items={directories}
            onSelect={handleSelect}
            showDescription={true}
            focusId="directory-menu"
          />
        </Section>

        <Spacer />

        {/* ヒント */}
        <Section spacing="xs">
          <Box 
            borderStyle="single"
            borderColor={theme.colors.success}
            padding={1}
            width="100%"
          >
            <Flex direction="column" gap={1}>
              <Text color={theme.colors.success} bold>
                💡 ディレクトリ構成について
              </Text>
              <Text color={theme.colors.text.secondary}>
                • spec/: プロジェクト仕様・要件定義・設計関連
              </Text>
              <Text color={theme.colors.text.secondary}>
                • utility/: 汎用ツール・ヘルパー機能
              </Text>
              <Text color={theme.colors.text.secondary}>
                • 全体: すべてのエージェントから自由に選択可能
              </Text>
            </Flex>
          </Box>
        </Section>

        {/* フッター */}
        <StatusBar
          center="↑↓: ナビゲート | Enter: 選択 | Esc: 戻る"
          variant="default"
        />
      </Card>
    </Container>
  );
};

export const DirectoryScreen: React.FC<DirectoryScreenProps> = (props) => (
  <DirectoryScreenContent {...props} />
);