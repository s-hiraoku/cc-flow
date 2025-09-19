/**
 * CC-Flow TUI Design System - WelcomeScreen Refactored Example
 * 
 * This example shows how the original WelcomeScreen can be refactored
 * to use the new design system components while maintaining the exact same appearance.
 */

import React from 'react';
import { useApp } from 'ink';
import { 
  UnifiedScreen, 
  Logo, 
  HeroText, 
  FeatureHighlights, 
  MenuSection,
  VersionDisplay
} from '../ScreenComponents.js';
import { createScreenLayout } from '../ScreenPatterns.js';
import type { MenuItem } from '../../components/Interactive.js';
import packageJson from '../../../../package.json';

interface WelcomeScreenProps {
  onNext: () => void;
}

const LOGO_LINES = [
  '██████╗ ██████╗      ███████╗██╗      ██████╗ ██╗    ██╗',
  '██╔════╝██╔════╝     ██╔════╝██║     ██╔═══██╗██║    ██║',
  '██║     ██║    █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║',
  '██║     ██║    ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║',
  '╚██████╗╚██████╗     ██║     ███████╗╚██████╔╝╚███╔███╔╝',
  ' ╚═════╝ ╚═════╝     ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ '
];

export const WelcomeScreenRefactored: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { exit } = useApp();

  // Define screen layout using the design system
  const config = createScreenLayout('welcome');

  // Menu items
  const menuItems: MenuItem[] = [
    {
      label: '🚀 Start - CC-Flowを開始',
      value: 'start'
    },
    {
      label: '👋 Exit - アプリケーションを終了',
      value: 'exit'
    }
  ];

  // Handle menu selection
  const handleSelect = (item: MenuItem) => {
    if (item.value === 'start') {
      onNext();
    } else if (item.value === 'exit') {
      exit();
    }
  };

  // Hero text and features
  const heroText = '⚡ Create workflows using subagents in Claude Code ⚡';
  const features = [
    '🎯 エージェントを連携させてワークフロー作成',
    '⚡ 高速かつ再利用可能なタスク自動化'
  ];

  return (
    <UnifiedScreen 
      config={config}
      logoLines={LOGO_LINES}
      heroText={heroText}
      features={features}
      version={packageJson.version}
    >
      {/* Menu section with unified styling */}
      <MenuSection 
        items={menuItems}
        onSelect={handleSelect}
      />
    </UnifiedScreen>
  );
};

// Alternative: Manual component usage for more control
export const WelcomeScreenManualExample: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { exit } = useApp();
  const config = createScreenLayout('welcome');

  const menuItems: MenuItem[] = [
    { label: '🚀 Start - CC-Flowを開始', value: 'start' },
    { label: '👋 Exit - アプリケーションを終了', value: 'exit' }
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'start') {
      onNext();
    } else if (item.value === 'exit') {
      exit();
    }
  };

  return (
    <UnifiedScreen config={config}>
      {/* Manual component usage for fine-grained control */}
      <Logo lines={LOGO_LINES} contentWidth={0} /> {/* contentWidth will be auto-calculated */}
      
      <HeroText 
        text="⚡ Create workflows using subagents in Claude Code ⚡" 
        contentWidth={0}
      />
      
      <FeatureHighlights 
        features={[
          '🎯 エージェントを連携させてワークフロー作成',
          '⚡ 高速かつ再利用可能なタスク自動化'
        ]}
        contentWidth={0}
      />
      
      <MenuSection 
        items={menuItems}
        onSelect={handleSelect}
      />
      
      <VersionDisplay version={packageJson.version} />
    </UnifiedScreen>
  );
};

// Comparison with original:
// BEFORE: 137 lines of manual layout code with repeated patterns
// AFTER: 30-40 lines using design system components
// 
// Key improvements:
// 1. Eliminated code duplication across multiple screens
// 2. Consistent spacing using design tokens
// 3. Unified color scheme management
// 4. Automatic width calculation
// 5. Reusable components for logo, hero, features
// 6. Type-safe configuration system
// 7. Easy to maintain and extend