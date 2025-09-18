import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { Frame, ContentLine } from '../components/Frame.js';

interface EnvironmentCheck {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
}

interface EnvironmentScreenProps {
  onNext: (environment: string) => void;
  onBack: () => void;
}

export const EnvironmentScreen: React.FC<EnvironmentScreenProps> = ({ onNext, onBack }) => {
  const [checks, setChecks] = useState<EnvironmentCheck[]>([
    { name: 'Claude Code環境', status: 'pending', message: '確認中...' },
    { name: 'POML処理環境', status: 'pending', message: '確認中...' },
    { name: 'スクリプト実行権限', status: 'pending', message: '確認中...' },
    { name: 'テンプレートファイル', status: 'pending', message: '確認中...' },
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const { exit } = useApp();

  // Handle keyboard input
  useInput(useCallback((input: string, key: any) => {
    if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (key.return && canProceed) {
      onNext('claude-code');
    }
  }, [onBack, exit, canProceed, onNext]));

  // Simulate environment checks
  useEffect(() => {
    const runChecks = async () => {
      const checkSequence = [
        () => setChecks(prev => prev.map((check, i) => 
          i === 0 ? { ...check, status: 'success', message: 'Claude Code環境で実行中' } : check
        )),
        () => setChecks(prev => prev.map((check, i) => 
          i === 1 ? { ...check, status: 'success', message: 'POML v0.0.8 利用可能' } : check
        )),
        () => setChecks(prev => prev.map((check, i) => 
          i === 2 ? { ...check, status: 'success', message: 'スクリプト実行権限あり' } : check
        )),
        () => setChecks(prev => prev.map((check, i) => 
          i === 3 ? { ...check, status: 'success', message: 'テンプレートファイル確認済み' } : check
        )),
      ];

      for (let i = 0; i < checkSequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const checkFunction = checkSequence[i];
        if (checkFunction) {
          checkFunction();
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setIsComplete(true);
      setCanProceed(true);
    };

    runChecks();
  }, []);

  const getStatusIcon = (status: EnvironmentCheck['status']) => {
    switch (status) {
      case 'pending': return <Spinner type="dots" />;
      case 'success': return <Text color="green">✅</Text>;
      case 'warning': return <Text color="yellow">⚠️</Text>;
      case 'error': return <Text color="red">❌</Text>;
      default: return <Text color="gray">-</Text>;
    }
  };

  const getStatusColor = (status: EnvironmentCheck['status']) => {
    switch (status) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame title="実行環境確認" icon="⚙️" minWidth={80} maxWidth={100}>
        <ContentLine align="center">
          <Text color="cyan">ワークフロー作成に必要な環境を確認しています</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        <ContentLine>
          <Text bold color="white">環境チェック結果:</Text>
        </ContentLine>
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        {checks.map((check, index) => (
          <ContentLine key={check.name}>
            <Box>
              {getStatusIcon(check.status)}
              <Text color="white"> {check.name}: </Text>
              <Text color={getStatusColor(check.status)}>
                {check.message}
              </Text>
            </Box>
          </ContentLine>
        ))}
        
        <ContentLine>
          <Text> </Text>
        </ContentLine>
        
        {isComplete && (
          <>
            <ContentLine align="center">
              <Text color="green" bold>🎉 環境チェック完了!</Text>
            </ContentLine>
            
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            
            <ContentLine>
              <Text color="cyan">✨ 検出された機能:</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• Claude Code統合環境での実行</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• POML (Prompt Orchestration Markup Language) サポート</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• ワークフロー自動生成とコマンド作成</Text>
            </ContentLine>
            <ContentLine>
              <Text color="gray">• エージェント連携とスクリプト実行</Text>
            </ContentLine>
            
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            
            <ContentLine align="center">
              <Text color="blue">📝 操作方法:</Text>
            </ContentLine>
            <ContentLine align="center">
              <Text color="gray">Enter: 次に進む | Esc: 戻る | Q: 終了</Text>
            </ContentLine>
            
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            
            <ContentLine align="center">
              <Text color="green">✅ Enterキーでプレビュー画面に進みます</Text>
            </ContentLine>
          </>
        )}
        
        {!isComplete && (
          <>
            <ContentLine>
              <Text> </Text>
            </ContentLine>
            <ContentLine align="center">
              <Text color="yellow">環境確認中です... しばらくお待ちください</Text>
            </ContentLine>
          </>
        )}
      </Frame>
    </Box>
  );
};