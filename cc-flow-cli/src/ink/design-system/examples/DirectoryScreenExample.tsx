/**
 * CC-Flow TUI Design System - DirectoryScreen Implementation Example
 *
 * This example shows how to migrate DirectoryScreen to use the unified design system
 * removing inconsistent Spacer usage and standardizing layout.
 */

import React, { useState, useEffect } from "react";
import { Text, Box } from "ink";
import {
  UnifiedScreen,
  ScreenDescription,
  MenuSection,
  HintBox,
} from "../ScreenComponents.js";
import { createScreenLayout } from "../ScreenPatterns.js";
import { Section } from "../../components/Layout.js";
import { useTheme } from "../../themes/theme.js";
import { getAgentDirectories } from "../../utils/directoryUtils.js";
import type { MenuItem } from "../../components/Interactive.js";

interface DirectoryScreenProps {
  onNext: (targetPath: string) => void;
  onBack: () => void;
}

export const DirectoryScreenExample: React.FC<DirectoryScreenProps> = ({
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const [directories, setDirectories] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define screen layout configuration
  const config = createScreenLayout("selection", {
    title: "エージェントディレクトリ選択",
    subtitle: "ワークフロー作成対象の選択",
    icon: "📂",
  });

  // Load directories
  useEffect(() => {
    const loadDirectories = async () => {
      try {
        setIsLoading(true);
        const dirs = getAgentDirectories(".claude/agents").map<MenuItem>(
          (dir) => ({
            id: dir.id,
            label: dir.label,
            value: dir.value,
            icon: dir.icon,
            description: dir.description,
          })
        );
        setDirectories(dirs);
      } catch (error) {
        console.error("Failed to load directories:", error);
        // Error fallback
        setDirectories([
          {
            id: "back",
            label: "戻る",
            value: "back",
            icon: "↩️",
            description: "前の画面に戻ります",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectories();
  }, []);

  // Handle directory selection
  const handleSelect = (item: MenuItem) => {
    if (item.value === "back") {
      onBack();
    } else {
      onNext(item.value);
    }
  };

  return (
    <UnifiedScreen config={config}>
      {/* Screen description with unified styling */}
      <ScreenDescription
        heading="選択したディレクトリ内のエージェントが"
        subheading="ワークフロー作成時に利用可能になります"
      />

      {/* Directory selection section */}
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
            spacing="xs"
          />
        )}
      </Section>

      {/* Hint box with consistent styling */}
      <HintBox
        title="💡 ディレクトリ構成について"
        hints={[
          "• spec/: プロジェクト仕様・要件定義・設計関連",
          "• utility/: 汎用ツール・ヘルパー機能",
          "• 全体: すべてのエージェントから自由に選択可能",
        ]}
      />
    </UnifiedScreen>
  );
};

// Migration comparison:
// REMOVED:
// - Manual Spacer components (replaced with consistent Section spacing)
// - Inconsistent Box with manual borderStyle/borderColor
// - Mixed Flex/Box layout patterns
//
// ADDED:
// - UnifiedScreen wrapper with 'selection' pattern
// - ScreenDescription for hero text
// - HintBox for structured hint display
// - Consistent section spacing (sm for content sections)
//
// BENEFITS:
// - Eliminated layout inconsistencies
// - Proper spacing hierarchy
// - Unified color scheme
// - Better responsive behavior
// - Reusable hint box component
