import React from 'react';
import { Text, useApp } from 'ink';
import { Container, Card, Section, Flex } from '../components/Layout.js';
import { FocusableMenu, StatusBar } from '../components/Interactive.js';
import { useTheme } from '../themes/theme.js';

interface MenuScreenProps {
  onSelect: (action: string) => void;
  onBack?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onSelect, onBack }) => {
  const { exit } = useApp();
  const theme = useTheme();

  const menuItems = [
    {
      label: '📁 ディレクトリを選択してワークフロー作成',
      value: 'create-workflow',
      description: 'エージェントディレクトリを選択して新しいワークフローを作成'
    },
    {
      label: '🔄 スラッシュコマンドをエージェントに変換',
      value: 'convert-commands',
      description: '既存のスラッシュコマンドを新しいエージェント形式に変換'
    },
    {
      label: '⚙️ 設定',
      value: 'settings',
      description: 'アプリケーション設定を変更'
    },
    {
      label: '❓ ヘルプ',
      value: 'help',
      description: 'CC-Flowの使用方法とドキュメント'
    },
    {
      label: '👋 終了',
      value: 'exit',
      description: 'アプリケーションを終了'
    }
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'exit') {
      exit();
    } else {
      onSelect(item.value);
    }
  };

  const statusItems = [
    { key: 'Mode', value: 'Main Menu' },
    { key: 'Version', value: '0.0.10' },
    { key: 'Status', value: 'Ready', color: theme.colors.success }
  ];

  return (
    <Container>
      <Card title="🌊 CC-Flow メインメニュー" width="85%">
        {/* Description */}
        <Section>
          <Flex direction="column" align="center">
            <Text color={theme.colors.info}>
              エージェント連携ワークフロー作成ツール
            </Text>
            <Text color={theme.colors.muted} italic>
              以下から実行したい操作を選択してください
            </Text>
          </Flex>
        </Section>

        {/* Main Menu */}
        <Section spacing="lg">
          <FocusableMenu
            items={menuItems}
            onSelect={handleSelect}
          />
        </Section>

        {/* Help Text */}
        <Section>
          <Flex direction="column" align="center">
            <Text color={theme.colors.info}>📝 操作方法:</Text>
            <Text color={theme.colors.muted}>
              ↑↓: 選択 | Enter: 実行 | Q: 終了
            </Text>
          </Flex>
        </Section>

        {/* Status Bar */}
        <Section spacing="sm">
          <StatusBar items={statusItems} />
        </Section>
      </Card>
    </Container>
  );
};