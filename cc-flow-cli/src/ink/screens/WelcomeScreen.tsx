import React from 'react';
import { useApp, Text, Box } from 'ink';
import { Container, Card, Section } from '../components/Layout.js';
import { FocusableMenu, StatusBar, MenuItem } from '../components/Interactive.js';
import { useTheme } from '../themes/theme.js';
import { renderLines } from '../utils/text.js';

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

const LOGO_COLORS = ['#1E40AF', '#1E40AF', '#3B82F6', '#3B82F6', '#60A5FA', '#60A5FA'];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { exit } = useApp();
  const theme = useTheme();

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

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'start') {
      onNext();
    } else if (item.value === 'exit') {
      exit();
    }
  };

  // より適切な幅計算 - ターミナル幅の90%か最大幅の小さい方
  const maxCardWidth = Math.min(theme.layout.maxWidth, Math.floor(theme.responsive.terminalWidth * 0.9));
  const cardWidth = Math.max(theme.layout.minWidth, maxCardWidth);
  const contentWidth = Math.max(20, cardWidth - theme.layout.paddingX * 2 - 2); // borders

  const heroLines = renderLines('⚡ Claude Code Workflow Orchestration Platform ⚡', contentWidth, 'center');
  const featureLines = [
    '🎯 エージェントを連携させてワークフロー作成',
    '⚡ 高速かつ再利用可能なタスク自動化'
  ];

  return (
    <Container centered fullHeight>
      <Card
        width={cardWidth}
        align="center"
        subtitle="Version 0.0.10"
        description="Create stunning terminal workflows with precise layout and multilingual support."
      >
        <Section spacing="sm" align="center">
          <Box flexDirection="column" width="100%" alignItems="center">
            {LOGO_LINES.map((line, index) => {
              const [centeredLine] = renderLines(line, contentWidth, 'center');
              const logoColor = LOGO_COLORS[index] ?? theme.colors.primary;
              return (
                <Text key={`logo-${index}`} color={logoColor}>
                  {centeredLine}
                </Text>
              );
            })}
          </Box>
        </Section>

        <Section spacing="sm" align="center">
          <Box flexDirection="column" width="100%" alignItems="center">
            {heroLines.map((line, index) => (
              <Text key={`hero-${index}`} color={theme.colors.primary} bold>
                {line}
              </Text>
            ))}
          </Box>
        </Section>

        <Section spacing="sm" align="center">
          <Box flexDirection="column" width="100%" alignItems="center">
            {featureLines.map((line, index) => {
              const [centeredLine] = renderLines(line, contentWidth, 'center');
              return (
                <Text key={`feature-${index}`} color={theme.colors.success}>
                  {centeredLine}
                </Text>
              );
            })}
          </Box>
        </Section>

        <Section spacing="lg" align="center">
          <Box width="100%" alignItems="center">
            <FocusableMenu
              items={menuItems}
              onSelect={handleSelect}
              width={contentWidth}
              align="center"
            />
          </Box>
        </Section>

        <Section spacing="sm" align="center">
          <StatusBar
            center="↑↓: 選択 | Enter: 実行 | Q: 終了"
            variant="info"
            width={contentWidth}
          />
        </Section>
      </Card>
    </Container>
  );
};
