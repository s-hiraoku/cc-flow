import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Frame, ContentLine } from '../components/Frame.js';

interface Agent {
  id: string;
  name: string;
  description: string;
  path: string;
}

interface OrderScreenProps {
  selectedAgents: Agent[];
  onNext: (orderedAgents: Agent[]) => void;
  onBack: () => void;
}

export const OrderScreen: React.FC<OrderScreenProps> = ({ 
  selectedAgents, 
  onNext, 
  onBack 
}) => {
  const [orderedAgents, setOrderedAgents] = useState<Agent[]>(selectedAgents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { exit } = useApp();

  // Memoized input handler for better performance
  const handleInput = useCallback((input: string, key: any) => {
    if (key.upArrow) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setCurrentIndex(prev => Math.min(orderedAgents.length - 1, prev + 1));
    } else if (key.ctrl && key.upArrow) {
      // Move current item up
      if (currentIndex > 0) {
        const newOrder = [...orderedAgents];
        const current = newOrder[currentIndex];
        const previous = newOrder[currentIndex - 1];
        if (current && previous) {
          newOrder[currentIndex] = previous;
          newOrder[currentIndex - 1] = current;
        }
        setOrderedAgents(newOrder);
        setCurrentIndex(prev => prev - 1);
      }
    } else if (key.ctrl && key.downArrow) {
      // Move current item down
      if (currentIndex < orderedAgents.length - 1) {
        const newOrder = [...orderedAgents];
        const current = newOrder[currentIndex];
        const next = newOrder[currentIndex + 1];
        if (current && next) {
          newOrder[currentIndex] = next;
          newOrder[currentIndex + 1] = current;
        }
        setOrderedAgents(newOrder);
        setCurrentIndex(prev => prev + 1);
      }
    } else if (key.return) {
      onNext(orderedAgents);
    } else if (key.escape) {
      onBack();
    } else if (input === 'q' || input === 'Q') {
      exit();
    } else if (input === 'r' || input === 'R') {
      // Reset to original order
      setOrderedAgents(selectedAgents);
      setCurrentIndex(0);
    }
  }, [orderedAgents, currentIndex, selectedAgents, onNext, onBack, exit]);

  useInput(handleInput);

  const frameWidth = 85;

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Frame title="実行順序設定" icon="📋" minWidth={80} maxWidth={100}>
        <ContentLine align="center">
          <Text color="cyan">エージェントの実行順序を設定してください</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Text bold color="white">現在の実行順序:</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        {orderedAgents.map((agent, index) => (
          <ContentLine key={`${agent.id}-${index}`} >
            <Box>
              <Text color={index === currentIndex ? 'cyan' : 'white'}>
                {index === currentIndex ? '▶ ' : '  '}
              </Text>
              <Text color={index === currentIndex ? 'cyan' : 'green'}>
                {(index + 1).toString().padStart(2, ' ')}. 
              </Text>
              <Text color={index === currentIndex ? 'cyan' : 'white'}>
                <Text> </Text>{agent.name}
              </Text>
              <Text color="gray"> - {agent.description}</Text>
            </Box>
          </ContentLine>
        ))}
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine >
          <Box>
            <Text color="green">総エージェント数: </Text>
            <Text color="cyan">{orderedAgents.length}</Text>
            <Text color="green">個</Text>
          </Box>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine align="center">
          <Text color="yellow">💡 操作方法:</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">↑↓: 移動 | Ctrl+↑↓: 順序変更 | R: リセット</Text>
        </ContentLine>
        <ContentLine align="center">
          <Text color="gray">Enter: 確定 | Esc: 戻る | Q: 終了</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine align="center">
          <Text color="green">✅ 順序が決まったらEnterキーで次に進みます</Text>
        </ContentLine>
        
        <ContentLine ><Text> </Text></ContentLine>
        
        <ContentLine align="center">
          <Text color="blue">📝 ヒント: エージェントは上から順番に実行されます</Text>
        </ContentLine>
      </Frame>
    </Box>
  );
};