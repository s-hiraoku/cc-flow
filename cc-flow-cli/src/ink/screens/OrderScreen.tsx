import React, { useState, useCallback } from "react";
import { Box, Text, useInput, useApp, type Key } from "ink";
import {
  UnifiedScreen,
  ScreenDescription,
  HintBox,
  ICONS,
} from "../design-system/index.js";
import {
  createScreenLayout,
  useScreenDimensions,
} from "../design-system/ScreenPatterns.js";
import { StatusBar } from "../components/Interactive.js";
import { Section, Flex } from "../components/Layout.js";
import { useTheme } from "../themes/theme.js";
import type { Agent } from "../utils/directoryUtils.js";

interface OrderScreenProps {
  selectedAgents: Agent[];
  onNext: (orderedAgents: Agent[]) => void;
  onBack: () => void;
}

export const OrderScreen: React.FC<OrderScreenProps> = ({
  selectedAgents,
  onNext,
  onBack,
}) => {
  const [orderedAgents, setOrderedAgents] = useState<Agent[]>(selectedAgents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { exit } = useApp();
  const theme = useTheme();
  const { contentWidth } = useScreenDimensions();

  // Memoized input handler for better performance
  const handleInput = useCallback(
    (input: string, key: Key) => {
      // Debug: log key presses to understand what's being detected
      console.log("Key pressed:", {
        input,
        key,
        ctrl: key.ctrl,
        upArrow: key.upArrow,
        downArrow: key.downArrow,
      });

      if (key.upArrow && !key.ctrl) {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow && !key.ctrl) {
        setCurrentIndex((prev) => Math.min(orderedAgents.length - 1, prev + 1));
      } else if ((key.ctrl || key.meta) && key.upArrow) {
        // Move current item up (Ctrl on Windows/Linux, Cmd on macOS)
        if (currentIndex > 0) {
          const newOrder = [...orderedAgents];
          const current = newOrder[currentIndex];
          const previous = newOrder[currentIndex - 1];
          if (current && previous) {
            newOrder[currentIndex] = previous;
            newOrder[currentIndex - 1] = current;
          }
          setOrderedAgents(newOrder);
          setCurrentIndex((prev) => prev - 1);
        }
      } else if ((key.ctrl || key.meta) && key.downArrow) {
        // Move current item down (Ctrl on Windows/Linux, Cmd on macOS)
        if (currentIndex < orderedAgents.length - 1) {
          const newOrder = [...orderedAgents];
          const current = newOrder[currentIndex];
          const next = newOrder[currentIndex + 1];
          if (current && next) {
            newOrder[currentIndex] = next;
            newOrder[currentIndex + 1] = current;
          }
          setOrderedAgents(newOrder);
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (key.return) {
        onNext(orderedAgents);
      } else if (key.escape) {
        onBack();
      } else if (input === "q" || input === "Q") {
        exit();
      } else if (input === "r" || input === "R") {
        // Reset to original order
        setOrderedAgents(selectedAgents);
        setCurrentIndex(0);
      } else if (key.leftArrow) {
        // Alternative: Move current item up with ←
        if (currentIndex > 0) {
          const newOrder = [...orderedAgents];
          const current = newOrder[currentIndex];
          const previous = newOrder[currentIndex - 1];
          if (current && previous) {
            newOrder[currentIndex] = previous;
            newOrder[currentIndex - 1] = current;
          }
          setOrderedAgents(newOrder);
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (key.rightArrow) {
        // Alternative: Move current item down with →
        if (currentIndex < orderedAgents.length - 1) {
          const newOrder = [...orderedAgents];
          const current = newOrder[currentIndex];
          const next = newOrder[currentIndex + 1];
          if (current && next) {
            newOrder[currentIndex] = next;
            newOrder[currentIndex + 1] = current;
          }
          setOrderedAgents(newOrder);
          setCurrentIndex((prev) => prev + 1);
        }
      }
    },
    [orderedAgents, currentIndex, selectedAgents, onNext, onBack, exit]
  );

  useInput(handleInput);

  // Screen configuration using design system patterns
  const screenConfig = createScreenLayout("configuration", {
    title: "実行順序設定",
    subtitle: "エージェントの実行順序を設定してください",
    icon: ICONS.clipboard,
  });

  const statusItems = [
    { key: "Total", value: `${orderedAgents.length}個` },
    { key: "Current", value: `${currentIndex + 1}/${orderedAgents.length}` },
    { key: "Status", value: "Ready", color: "#00ff00" },
  ];

  const operationHints = [
    "↑↓: 移動 | ←→: 順序変更 | R: リセット",
    "Enter: 確定 | Esc: 戻る | Q: 終了",
  ];

  return (
    <UnifiedScreen
      config={screenConfig}
      statusItems={statusItems}
      customStatusMessage={`${ICONS.success} 順序が決まったらEnterキーで次に進みます`}
    >
      {/* Screen Description */}
      <ScreenDescription
        heading="サブエージェントの実行順序を調整"
        subheading="Ctrl/Cmd+↑↓キー（または←→キー）で順序を変更します。上から順番に実行されます"
        align="center"
      />

      {/* Agent Order List */}
      <Section title={`${ICONS.refresh} 現在の実行順序`} spacing="sm">
        <Box flexDirection="column" gap={1}>
          {orderedAgents.map((agent, index) => (
            <Box key={`${agent.id}-${index}`} width="100%">
              <Text
                color={
                  index === currentIndex
                    ? theme.colors.hex.blue
                    : theme.colors.cyan
                }
              >
                {index === currentIndex ? "▶ " : "  "}
              </Text>
              <Text
                color={
                  index === currentIndex
                    ? theme.colors.hex.blue
                    : theme.colors.hex.green
                }
              >
                {(index + 1).toString().padStart(2, " ")}.
              </Text>
              <Text
                color={
                  index === currentIndex
                    ? theme.colors.hex.blue
                    : theme.colors.white
                }
              >
                {" "}
                {agent.name}
              </Text>
              <Text color={theme.colors.gray}> - {agent.description}</Text>
            </Box>
          ))}
        </Box>
      </Section>

      {/* Statistics */}
      <Section spacing="xs">
        <Box
          borderStyle="single"
          borderColor={theme.colors.hex.green}
          padding={1}
          width="100%"
        >
          <Flex justify="space-between" align="center">
            <Text color={theme.colors.hex.green}>総エージェント数:</Text>
            <Text color={theme.colors.hex.blue} bold>
              {orderedAgents.length}個
            </Text>
          </Flex>
        </Box>
      </Section>

      {/* Operation Hints */}
      <HintBox title={`${ICONS.hint} 操作方法`} hints={operationHints} />
    </UnifiedScreen>
  );
};
