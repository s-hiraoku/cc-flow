import React, { useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { Frame, ContentLine } from '../components/Frame.js';

interface ConversionResult {
  success: boolean;
  message: string;
  convertedCount: number;
  targetDirectory: string;
  convertedCommands?: string[];
}

interface ConversionCompleteScreenProps {
  result: ConversionResult;
  onAnother: () => void;
  onWorkflow: () => void;
  onMenu: () => void;
}

export const ConversionCompleteScreen: React.FC<ConversionCompleteScreenProps> = ({ 
  result, 
  onAnother, 
  onWorkflow, 
  onMenu 
}) => {
  const { exit } = useApp();

  const choices = [
    { label: '🚀 変換されたエージェントでワークフロー作成', value: 'workflow' },
    { label: '🔄 新しい変換を実行する', value: 'another' },
    { label: '🏠 メインメニューに戻る', value: 'menu' },
    { label: '👋 アプリケーションを終了', value: 'exit' }
  ];

  // Handle keyboard shortcuts
  useInput(useCallback((input: string, key: any) => {
    if (input === 'q' || input === 'Q') {
      exit();
    } else if (input === 'w' || input === 'W') {
      onWorkflow();
    } else if (input === 'm' || input === 'M') {
      onMenu();
    }
  }, [exit, onWorkflow, onMenu]));

  const handleSelect = (item: { value: string }) => {
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

  const frameWidth = 90;

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame 
        title="スラッシュコマンド変換完了" 
        icon={result.success ? '✅' : '⚠️'} 
        minWidth={85} 
        maxWidth={110}
      >
        <ContentLine align="center">
          <Text color={result.success ? 'green' : 'yellow'} bold>
            {result.success ? '🎉 スラッシュコマンド変換が完了しました！' : '⚠️ 変換中に問題が発生しました'}
          </Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text bold color="white">📋 変換結果:</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        {result.success ? (
          <>
            <ContentLine >
              <Box>
                <Text color="cyan">変換成功: </Text>
                <Text color="green" bold>{result.convertedCount}個のコマンド</Text>
              </Box>
            </ContentLine>
            
            <ContentLine >
              <Box>
                <Text color="cyan">保存先: </Text>
                <Text color="gray">{result.targetDirectory}</Text>
              </Box>
            </ContentLine>
            
            <ContentLine >
              <Box>
                <Text color="cyan">ステータス: </Text>
                <Text color="green">正常完了</Text>
              </Box>
            </ContentLine>
            
            <ContentLine ><Text> </Text></ContentLine>
            
            <ContentLine >
              <Text bold color="white">🤖 変換されたエージェント:</Text>
            </ContentLine>
            
            <ContentLine ><Text> </Text></ContentLine>
            
            {result.convertedCommands?.map((command, index) => (
              <ContentLine key={command} >
                <Box>
                  <Text color="green" bold>{(index + 1).toString().padStart(2, ' ')}. </Text>
                  <Text color="white">{command}</Text>
                  <Text color="gray"> - スラッシュコマンドから変換</Text>
                </Box>
              </ContentLine>
            )) || (
              <ContentLine >
                <Text color="gray">変換されたコマンドの詳細情報なし</Text>
              </ContentLine>
            )}
            
            <ContentLine ><Text> </Text></ContentLine>
            
            <ContentLine >
              <Text color="blue">📦 生成されたファイル:</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• エージェント形式のMarkdownファイル</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• メタデータと実行可能なBashコード</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• Claude Code環境での実行に対応</Text>
            </ContentLine>
            
            <ContentLine ><Text> </Text></ContentLine>
            
            <ContentLine >
              <Text color="yellow">🚀 次のステップ:</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• ワークフロー作成でエージェントを組み合わせ</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• 実行順序を設定して連携ワークフローを構築</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• 新しいスラッシュコマンドとして利用可能</Text>
            </ContentLine>
          </>
        ) : (
          <>
            <ContentLine >
              <Box>
                <Text color="red">エラー: </Text>
                <Text color="gray">{result.message}</Text>
              </Box>
            </ContentLine>
            
            <ContentLine ><Text> </Text></ContentLine>
            
            <ContentLine >
              <Text color="yellow">💡 対処方法:</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• .claude/commands/ ディレクトリが存在するか確認</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• スラッシュコマンドが正しい形式で記述されているか確認</Text>
            </ContentLine>
            <ContentLine >
              <Text color="gray">• ファイルアクセス権限に問題がないか確認</Text>
            </ContentLine>
          </>
        )}
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Box paddingLeft={2}>
            <SelectInput
              items={choices}
              onSelect={handleSelect}
              indicatorComponent={({ isSelected }) => (
                <Box marginRight={1}>
                  <Text color="cyan">{isSelected ? '▶' : ' '}</Text>
                </Box>
              )}
              itemComponent={({ label, isSelected }) => (
                <Text {...(isSelected ? { color: 'cyan' } : {})}>
                  {label}
                </Text>
              )}
            />
          </Box>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine align="center">
          <Text color="blue">📝 操作方法:</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">↑↓: 選択 | Enter: 実行 | W: ワークフロー | M: メニュー | Q: 終了</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        {result.success ? (
          <ContentLine align="center">
            <Text color="green">✅ 変換完了！ワークフロー作成に進むことをお勧めします</Text>
          </ContentLine>
        ) : (
          <ContentLine align="center">
            <Text color="yellow">⚠️ 問題を確認してから再度お試しください</Text>
          </ContentLine>
        )}
      </Frame>
    </Box>
  );
};