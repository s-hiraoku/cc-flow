/**
 * CC-Flow TUI Design System - MenuScreen Implementation Example
 * 
 * This example shows how to migrate MenuScreen to use the unified design system
 * while maintaining all existing functionality.
 */

import React from 'react';
import { useApp } from 'ink';
import { UnifiedScreen, ScreenDescription, MenuSection } from '../ScreenComponents.js';
import { createScreenLayout } from '../ScreenPatterns.js';
import { useTheme } from '../../themes/theme.js';
import type { MenuItem } from '../../components/Interactive.js';
import packageJson from '../../../../package.json';

interface MenuScreenProps {
  onSelect: (action: string) => void;
  onBack?: () => void;
}

export const MenuScreenExample: React.FC<MenuScreenProps> = ({ onSelect, onBack }) => {
  const { exit } = useApp();
  const theme = useTheme();

  // Define screen layout configuration
  const config = createScreenLayout('menu', {
    title: '🌊 CC-Flow メインメニュー',
    subtitle: 'エージェント連携ワークフロー作成ツール'
  });

  // Menu items with consistent structure
  const menuItems: MenuItem[] = [
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

  // Handle menu selection
  const handleSelect = (item: MenuItem) => {
    if (item.value === 'exit') {
      exit();
    } else {
      onSelect(item.value);
    }
  };

  // Status bar items
  const statusItems = [
    { key: 'Mode', value: 'Main Menu' },
    { key: 'Version', value: packageJson.version },
    { key: 'Status', value: 'Ready', color: theme.colors.success }
  ];

  return (
    <UnifiedScreen 
      config={config}
      statusItems={statusItems}
    >
      {/* Screen description with unified styling */}
      <ScreenDescription 
        heading="エージェント連携ワークフロー作成ツール"
        subheading="以下から実行したい操作を選択してください"
      />
      
      {/* Main menu with consistent styling */}
      <MenuSection 
        items={menuItems}
        onSelect={handleSelect}
      />
      
      {/* Operation instructions */}
      <ScreenDescription 
        heading="📝 操作方法:"
        description="↑↓: 選択 | Enter: 実行 | Q: 終了"
        align="center"
      />
    </UnifiedScreen>
  );
};

// Comparison with original implementation:
// BEFORE: Manual Container + Card + Section + StatusBar arrangement
// AFTER: UnifiedScreen wrapper + pre-built components
// BENEFITS: 
// - Consistent spacing (lg for menu, sm for descriptions)
// - Unified color scheme from design tokens
// - Automatic width calculation
// - Standardized status bar with proper navigation type