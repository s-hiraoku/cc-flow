import React from 'react';
import { useApp } from 'ink';
import { UnifiedScreen, ScreenDescription, MenuSection } from '../design-system/index.js';
import { createScreenLayout } from '../design-system/ScreenPatterns.js';
import { MenuItem } from '../components/Interactive.js';
import packageJson from '../../../package.json';

interface MenuScreenProps {
  onSelect: (action: string) => void;
  onBack?: () => void;
}

const packageVersion = packageJson.version ?? '0.0.0';

export const MenuScreen: React.FC<MenuScreenProps> = ({ onSelect, onBack }) => {
  const { exit } = useApp();

  const menuItems: MenuItem[] = [
    {
      label: '🤖 サブエージェントを連携してワークフロー作成',
      value: 'create-workflow',
      description: 'サブエージェントを選択・連携して新しいワークフローを作成'
    },
    {
      label: '🔄 スラッシュコマンドをサブエージェントに変換してワークフローを作成',
      value: 'convert-commands',
      description: '既存のスラッシュコマンドを新しいサブエージェント形式に変換してワークフローを作成'
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

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'exit') {
      exit();
    } else {
      onSelect(item.value);
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout('menu');

  const statusItems = [
    { key: 'Mode', value: 'Main Menu' },
    { key: 'Version', value: packageVersion },
    { key: 'Status', value: 'Ready', color: '#00ff00' }
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      version={packageVersion}
      statusItems={statusItems}
    >
      {/* Screen Description */}
      <ScreenDescription
        heading="エージェント連携ワークフロー作成ツール"
        subheading="以下から実行したい操作を選択してください"
        align="center"
      />

      {/* Main Menu */}
      <MenuSection
        items={menuItems}
        onSelect={handleSelect}
        showDescription={true}
      />
    </UnifiedScreen>
  );
};