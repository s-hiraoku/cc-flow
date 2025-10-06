import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import {
  UnifiedScreen,
  ScreenDescription,
  MenuSection,
  HintBox,
  ICONS,
} from "../design-system/index.js";
import { createScreenLayout } from "../design-system/ScreenPatterns.js";
import type { MenuItem } from "../components/Interactive.js";
import { Section } from "../components/Layout.js";
import { useTheme } from "../themes/theme.js";
import { getAgentDirectories, getCommandDirectories } from "../utils/directoryUtils.js";

interface DirectoryScreenProps {
  workflowMode?: 'create' | 'convert';
  onNext: (targetPath: string) => void;
  onBack: () => void;
}

const DirectoryScreenContent: React.FC<DirectoryScreenProps> = ({
  workflowMode = 'create',
  onNext,
  onBack,
}) => {
  const theme = useTheme();
  const [directories, setDirectories] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDirectories = async () => {
      try {
        setIsLoading(true);
        
        const dirs = workflowMode === 'convert' 
          ? getCommandDirectories(".claude/commands")
          : getAgentDirectories(".claude/agents");
          
        const mappedDirs = dirs.map<MenuItem>((dir) => ({
          id: dir.id,
          label: dir.label,
          value: dir.value,
          icon: dir.icon,
          description: dir.description,
        }));
        
        setDirectories(mappedDirs);
      } catch (error) {
        console.error("Failed to load directories:", error);
        // エラー時はデフォルトの戻るオプションのみ表示
        setDirectories([
          {
            id: "back",
            label: "戻る",
            value: "back",
            icon: ICONS.back,
            description: "前の画面に戻ります",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDirectories();
  }, [workflowMode]);

  const handleSelect = (item: MenuItem) => {
    if (item.value === "back") {
      onBack();
    } else {
      onNext(item.value);
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout("selection", {
    title: workflowMode === 'convert' ? "スラッシュコマンドディレクトリ選択" : "エージェントディレクトリ選択",
    subtitle: workflowMode === 'convert' ? "変換対象のコマンドディレクトリを選択" : "ワークフロー作成対象の選択",
    icon: workflowMode === 'convert' ? ICONS.clipboard : ICONS.folder,
  });

  const hintBoxContent = workflowMode === 'convert' ? [
    "• ./.claude/commands/ 内のスラッシュコマンドを変換対象とします",
    "• ディレクトリを選択すると、その中のコマンドファイル (.md) を変換します",
    "• 変換されたコマンドは新しいサブエージェント形式になります",
    "• 通常は「メインコマンド」を選択してください",
  ] : [
    "• ./claude/agents/ 内の各ディレクトリでサブエージェントをカテゴリ分け",
    "• ディレクトリを選択すると、その中のサブエージェントのみが表示されます",
    "• 目的に応じてディレクトリを選ぶことで、適切なサブエージェントを見つけやすくなります",
    "• 「全体」を選択すると、すべてのディレクトリのサブエージェントから選択できます",
  ];

  return (
    <UnifiedScreen config={screenConfig}>
      {/* Screen Description */}
      <ScreenDescription
        heading="サブエージェントのカテゴリを選択"
        subheading="目的に応じたディレクトリを選ぶことで、適切なサブエージェントを見つけやすくなります"
        align="center"
      />

      {/* Directory Selection */}
      <Section title={workflowMode === 'convert' ? `${ICONS.clipboard} 利用可能なコマンドディレクトリ` : `${ICONS.folder} 利用可能なディレクトリ`} spacing="sm">
        {isLoading ? (
          <Text color={theme.colors.hex.blue}>
            {ICONS.search} ディレクトリを読み込み中...
          </Text>
        ) : (
          <MenuSection
            items={directories}
            onSelect={handleSelect}
            showDescription={true}
            spacing="xs"
          />
        )}
      </Section>

      {/* Hint Box */}
      <HintBox title={`${ICONS.hint} ディレクトリ構成について`} hints={hintBoxContent} />
    </UnifiedScreen>
  );
};

export const DirectoryScreen: React.FC<DirectoryScreenProps> = (props) => (
  <DirectoryScreenContent {...props} />
);
