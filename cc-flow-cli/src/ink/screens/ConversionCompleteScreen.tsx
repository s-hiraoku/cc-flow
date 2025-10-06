import React, { useCallback } from 'react';
import { Box, Text, useInput, useApp, type Key } from 'ink';
import { UnifiedScreen, ScreenDescription, MenuSection, FeatureHighlights, HintBox, ICONS } from '../design-system/index.js';
import { createScreenLayout, useScreenDimensions } from '../design-system/ScreenPatterns.js';
import { Section, Flex } from '../components/Layout.js';
import { useTheme } from '../themes/theme.js';
import type { MenuItem } from '../components/Interactive.js';
import { getVersion } from '../../utils/package.js';
import type { ConversionResult } from '../../types/conversion.js';


interface ConversionCompleteScreenProps {
  result: ConversionResult;
  onAnother: () => void;
  onWorkflow: () => void;
  onMenu: () => void;
}

const packageVersion = getVersion();

export const ConversionCompleteScreen: React.FC<ConversionCompleteScreenProps> = ({ 
  result, 
  onAnother, 
  onWorkflow, 
  onMenu 
}) => {
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  const choices: MenuItem[] = [
    { label: `${ICONS.rocket} 変換されたエージェントでワークフロー作成`, value: 'workflow' },
    { label: `${ICONS.convert} 新しい変換を実行する`, value: 'another' },
    { label: `${ICONS.home} メインメニューに戻る`, value: 'menu' },
    { label: `${ICONS.exit} アプリケーションを終了`, value: 'exit' }
  ];

  // Handle keyboard shortcuts
  useInput(useCallback((input: string, key: Key) => {
    if (input === 'q' || input === 'Q') {
      exit();
    } else if (input === 'w' || input === 'W') {
      onWorkflow();
    } else if (input === 'm' || input === 'M') {
      onMenu();
    }
  }, [exit, onWorkflow, onMenu]));

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'another') {
      onAnother();
    } else if (item.value === 'workflow') {
      onWorkflow();
    } else if (item.value === 'menu') {
      onMenu();
    } else if (item.value === 'exit') {
      exit();
    }
  };

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout(result.success ? 'complete' : 'preview', {
    title: 'スラッシュコマンド変換完了',
    subtitle: result.success ? `${ICONS.party} スラッシュコマンド変換が完了しました！` : `${ICONS.warning} 変換中に問題が発生しました`,
    icon: result.success ? ICONS.success : ICONS.warning
  });

  const statusItems = [
    { key: 'Converted', value: `${result.convertedCount}個` },
    { key: 'Status', value: result.success ? 'Success' : 'Failed', color: result.success ? '#00ff00' : '#ff0000' }
  ];

  const nextStepFeatures = result.success ? [
    '• ワークフロー作成でエージェントを組み合わせ',
    '• 実行順序を設定して連携ワークフローを構築',
    '• 新しいスラッシュコマンドとして利用可能'
  ] : [];

  const generatedFiles = result.success ? [
    '• エージェント形式のMarkdownファイル',
    '• メタデータと実行可能なBashコード',
    '• Claude Code環境での実行に対応'
  ] : [];

  const troubleshootingHints = !result.success ? [
    '• .claude/commands/ ディレクトリが存在するか確認',
    '• スラッシュコマンドが正しい形式で記述されているか確認',
    '• ファイルアクセス権限に問題がないか確認'
  ] : [];

  return (
    <UnifiedScreen
      config={screenConfig}
      version={packageVersion}
      statusItems={statusItems}
      customStatusMessage={result.success ?
        `${ICONS.success} 変換完了！ワークフロー作成に進むことをお勧めします` :
        `${ICONS.warning} 問題を確認してから再度お試しください`}
    >
      {/* Conversion Results Summary */}
      <Section title={`${ICONS.clipboard} 変換結果`} spacing="sm">
        <Box flexDirection="column" gap={1}>
          {result.success ? (
            <>
              <Flex>
                <Text color={theme.colors.hex.lightBlue}>変換成功: </Text>
                <Text color={theme.colors.hex.green} bold>{result.convertedCount}個のコマンド</Text>
              </Flex>
              
              <Flex>
                <Text color={theme.colors.hex.lightBlue}>保存先: </Text>
                <Text color={theme.colors.gray}>{result.targetDirectory}</Text>
              </Flex>
              
              <Flex>
                <Text color={theme.colors.hex.lightBlue}>ステータス: </Text>
                <Text color={theme.colors.hex.green}>正常完了</Text>
              </Flex>
            </>
          ) : (
            <Flex>
              <Text color={theme.colors.error}>エラー: </Text>
              <Text color={theme.colors.gray}>{result.message}</Text>
            </Flex>
          )}
        </Box>
      </Section>

      {/* Converted Agents List (Success only) */}
      {result.success && (
        <Section title={`${ICONS.agent} 変換されたエージェント`} spacing="sm">
          <Box flexDirection="column" gap={1}>
            {result.convertedCommands?.map((command, index) => (
              <Box key={command}>
                <Text color={theme.colors.hex.green} bold>{(index + 1).toString().padStart(2, ' ')}. </Text>
                <Text color={theme.colors.white}>{command}</Text>
                <Text color={theme.colors.gray}> - スラッシュコマンドから変換</Text>
              </Box>
            )) || (
              <Text color={theme.colors.gray}>変換されたコマンドの詳細情報なし</Text>
            )}
          </Box>
        </Section>
      )}

      {/* Generated Files (Success only) */}
      {result.success && (
        <Section title={`${ICONS.package} 生成されたファイル`} spacing="sm">
          <FeatureHighlights
            features={generatedFiles}
            contentWidth={contentWidth}
          />
        </Section>
      )}

      {/* Next Steps (Success only) */}
      {result.success && (
        <Section title={`${ICONS.rocket} 次のステップ`} spacing="sm">
          <FeatureHighlights
            features={nextStepFeatures}
            contentWidth={contentWidth}
          />
        </Section>
      )}

      {/* Troubleshooting (Failure only) */}
      {!result.success && (
        <HintBox
          title={`${ICONS.hint} 対処方法`}
          hints={troubleshootingHints}
        />
      )}

      {/* Action Menu */}
      <MenuSection
        items={choices}
        onSelect={handleSelect}
      />
    </UnifiedScreen>
  );
};