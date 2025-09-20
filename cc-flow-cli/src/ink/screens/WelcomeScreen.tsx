import React from "react";
import { useApp, Text, Box } from "ink";
import { Container, Card, Section } from "../components/Layout.js";
import {
  FocusableMenu,
  StatusBar,
  MenuItem,
} from "../components/Interactive.js";
import { useTheme } from "../themes/theme.js";
import { renderLines } from "../utils/text.js";
import { getVersion } from "../../utils/package.js";

interface WelcomeScreenProps {
  onNext: () => void;
}

const LOGO_LINES = [
  "██████╗ ██████╗      ███████╗██╗      ██████╗ ██╗    ██╗",
  "██╔════╝██╔════╝     ██╔════╝██║     ██╔═══██╗██║    ██║",
  "██║     ██║    █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║",
  "██║     ██║    ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║",
  "╚██████╗╚██████╗     ██║     ███████╗╚██████╔╝╚███╔███╔╝",
  " ╚═════╝ ╚═════╝     ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ",
];

// Logo colors will be taken from theme.colors.hex

const packageVersion = getVersion();

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const { exit } = useApp();
  const theme = useTheme();

  const menuItems: MenuItem[] = [
    {
      label: "🚀 Start",
      value: "start",
    },
    {
      label: "👋 Exit",
      value: "exit",
    },
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value === "start") {
      onNext();
    } else if (item.value === "exit") {
      exit();
    }
  };

  // より適切な幅計算 - ターミナル幅の90%か最大幅の小さい方
  const maxCardWidth = Math.min(
    theme.layout.maxWidth,
    Math.floor(theme.responsive.terminalWidth * 0.9)
  );
  const cardWidth = Math.max(theme.layout.minWidth, maxCardWidth);
  const contentWidth = Math.max(20, cardWidth - theme.layout.paddingX * 2 - 2); // borders

  const heroLines = renderLines(
    "⚡ Create workflows using subagents in Claude Code ⚡",
    contentWidth,
    "center"
  );
  const featureLines = [
    "🎯 エージェントを連携させてワークフロー作成",
    "⚡ 高速かつ再利用可能なタスク自動化",
  ];

  return (
    <Container centered fullHeight>
      <Card width={cardWidth} align="center">
        <Section spacing="sm" align="center">
          <Box flexDirection="column" width="100%" alignItems="center">
            {LOGO_LINES.map((line, index) => {
              const [centeredLine] = renderLines(line, contentWidth, "center");
              const logoColors = [
                theme.colors.hex.darkBlue,
                theme.colors.hex.darkBlue,
                theme.colors.hex.blue,
                theme.colors.hex.blue,
                theme.colors.hex.lightBlue,
                theme.colors.hex.lightBlue,
              ];
              const logoColor = logoColors[index] ?? theme.colors.hex.blue;
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
              <Text
                key={`hero-${index}`}
                color={theme.colors.yellow}
                bold
              >
                {line}
              </Text>
            ))}
          </Box>
        </Section>

        <Section spacing="sm" align="center">
          <Box flexDirection="column" width="100%" alignItems="center">
            {featureLines.map((line, index) => {
              const [centeredLine] = renderLines(line, contentWidth, "center");
              return (
                <Text key={`feature-${index}`} color={theme.colors.hex.green}>
                  {centeredLine}
                </Text>
              );
            })}
          </Box>
        </Section>

        <Section spacing="sm" align="center">
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

        <Section spacing="xs" align="center">
          <Box width="100%" alignItems="center" justifyContent="center">
            <Text color={theme.colors.gray}>Version {packageVersion}</Text>
          </Box>
        </Section>
      </Card>
    </Container>
  );
};
