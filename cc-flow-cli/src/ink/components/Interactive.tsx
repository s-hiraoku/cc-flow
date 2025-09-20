import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import { useTheme } from "../themes/theme.js";
import { alignWithinWidth, renderLines } from "../utils/text.js";
import { Alignment, SpacingValue } from "../types/index.js";

export interface MenuItem {
  id?: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

const clampWidth = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const resolveListWidth = (
  themeWidth: number,
  minWidth: number,
  maxWidth: number
): number => {
  const candidate = Math.min(maxWidth, themeWidth - 8);
  return clampWidth(candidate, minWidth, maxWidth);
};

const useSelectableIndex = <T extends { disabled?: boolean }>(
  items: T[],
  initialIndex = 0
): [number, (direction: 1 | -1) => void] => {
  const [index, setIndex] = useState(initialIndex);

  const moveIndex = useCallback(
    (direction: 1 | -1) => {
      if (items.length === 0) return;

      let nextIndex = index;
      for (let i = 0; i < items.length; i++) {
        nextIndex = (nextIndex + direction + items.length) % items.length;
        if (!items[nextIndex]?.disabled) {
          setIndex(nextIndex);
          return;
        }
      }
    },
    [index, items]
  );

  return [index, moveIndex];
};

interface FocusableMenuProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  onSelectionChange?: (item: MenuItem) => void;
  width?: number;
  showDescription?: boolean;
  focusId?: string;
  align?: Alignment;
  spacing?: SpacingValue;
}

export const FocusableMenu: React.FC<FocusableMenuProps> = ({
  items,
  onSelect,
  onSelectionChange,
  width,
  showDescription = false,
  align = "left",
  spacing = 1,
}) => {
  const theme = useTheme();
  const listWidth =
    width ??
    resolveListWidth(
      theme.responsive.terminalWidth,
      theme.layout.minWidth,
      theme.layout.maxWidth
    );
  const contentWidth = Math.max(8, listWidth - 6);
  const lineContainerWidth = Math.min(contentWidth + 2, listWidth); // indicator + space + content, clamped to available width

  const [selectedIndex, moveIndex] = useSelectableIndex(items);

  // Call onSelectionChange when selection changes
  React.useEffect(() => {
    if (onSelectionChange && items[selectedIndex]) {
      onSelectionChange(items[selectedIndex]);
    }
  }, [selectedIndex, items, onSelectionChange]);

  useInput(
    useCallback(
      (input, key) => {
        if (key.upArrow) {
          moveIndex(-1);
        } else if (key.downArrow) {
          moveIndex(1);
        } else if (key.return) {
          const selected = items[selectedIndex];
          if (selected && !selected.disabled) {
            onSelect(selected);
          }
        }
      },
      [items, moveIndex, onSelect, selectedIndex]
    )
  );

  return (
    <Box flexDirection="column" width={listWidth} flexShrink={0}>
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        const isDisabled = Boolean(item.disabled);
        const label = item.icon ? `${item.icon} ${item.label}` : item.label;
        const labelLines = renderLines(label, contentWidth, "left");
        const descriptionLines =
          showDescription && item.description && isSelected
            ? renderLines(item.description, contentWidth, "left")
            : [];

        const textColor = isDisabled
          ? theme.colors.text.muted
          : isSelected
          ? theme.colors.primary
          : theme.colors.text.primary;

        return (
          <Box
            key={item.id ?? item.value}
            flexDirection="column"
            marginBottom={spacing}
            height={showDescription ? 3 : 1}
            minHeight={showDescription ? 3 : 1}
          >
            {labelLines.map((line, lineIndex) => {
              const indicator =
                lineIndex === 0 ? (isSelected ? "▶" : " ") : " ";
              const composedLine = alignWithinWidth(
                `${indicator} ${line}`,
                lineContainerWidth,
                align
              );
              return (
                <Box
                  key={`menu-${item.value}-${lineIndex}`}
                  width={lineContainerWidth}
                  height={1}
                >
                  <Text color={textColor}>{composedLine}</Text>
                </Box>
              );
            })}
            {showDescription && (
              <Box flexDirection="column" width={lineContainerWidth} height={2}>
                {descriptionLines.length > 0 ? (
                  descriptionLines.map((line, lineIndex) => {
                    const composedLine = alignWithinWidth(
                      `  ${line}`,
                      lineContainerWidth,
                      align
                    );
                    return (
                      <Box
                        key={`menu-desc-${item.value}-${lineIndex}`}
                        width={lineContainerWidth}
                        height={1}
                      >
                        <Text color={theme.colors.text.muted} italic>
                          {composedLine}
                        </Text>
                      </Box>
                    );
                  })
                ) : (
                  <Box height={2} width={lineContainerWidth}>
                    <Text> </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

interface CheckboxListProps {
  items: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: string;
    disabled?: boolean;
  }>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  width?: number;
  maxHeight?: number;
}

export const CheckboxList: React.FC<CheckboxListProps> = ({
  items,
  selectedIds,
  onToggle,
  width,
  maxHeight,
}) => {
  const theme = useTheme();
  const listWidth =
    width ??
    resolveListWidth(
      theme.responsive.terminalWidth,
      theme.layout.minWidth,
      theme.layout.maxWidth
    );
  const contentWidth = Math.max(6, listWidth - 8);

  const [selectedIndex, moveIndex] = useSelectableIndex(items);

  useInput(
    useCallback(
      (input, key) => {
        if (key.upArrow) {
          moveIndex(-1);
        } else if (key.downArrow) {
          moveIndex(1);
        } else if (input === " ") {
          const current = items[selectedIndex];
          if (current) {
            onToggle(current.id);
          }
        }
      },
      [items, moveIndex, onToggle, selectedIndex]
    )
  );

  const visibleItems = useMemo(() => {
    if (!maxHeight) {
      return items;
    }
    return items.slice(0, maxHeight);
  }, [items, maxHeight]);

  return (
    <Box flexDirection="column" width={listWidth} flexShrink={0}>
      {visibleItems.map((item, index) => {
        const isSelected = selectedIndex === index;
        const isChecked = selectedIds.has(item.id);
        const label = item.icon ? `${item.icon} ${item.label}` : item.label;
        const labelLines = renderLines(label, contentWidth);
        const descriptionLines =
          item.description && isSelected
            ? renderLines(item.description, contentWidth, "left")
            : [];

        return (
          <Box key={item.id} flexDirection="column" marginBottom={1}>
            {labelLines.map((line, lineIndex) => (
              <Box key={`checkbox-${item.id}-${lineIndex}`}>
                <Text
                  color={
                    isSelected ? theme.colors.primary : theme.colors.text.muted
                  }
                >
                  {lineIndex === 0 ? (isSelected ? "▶" : " ") : " "}
                </Text>
                <Text
                  color={
                    isChecked ? theme.colors.success : theme.colors.text.muted
                  }
                >
                  {lineIndex === 0 ? (isChecked ? " ☑ " : " ☐ ") : " "}
                </Text>
                <Text
                  color={
                    isSelected
                      ? theme.colors.primary
                      : theme.colors.text.primary
                  }
                >
                  {line}
                </Text>
              </Box>
            ))}
            {descriptionLines.length > 0 && (
              <Box marginLeft={4} flexDirection="column">
                {descriptionLines.map((line, lineIndex) => (
                  <Text
                    key={`checkbox-desc-${item.id}-${lineIndex}`}
                    color={theme.colors.text.muted}
                    italic
                  >
                    {line}
                  </Text>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showCursor?: boolean;
  width?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  showCursor = true,
  width,
}) => {
  const theme = useTheme();
  const fieldWidth =
    width ??
    resolveListWidth(
      theme.responsive.terminalWidth,
      theme.layout.minWidth,
      theme.layout.maxWidth
    );

  return (
    <Box flexDirection="column" width={fieldWidth}>
      <Text color={theme.colors.primary} bold>
        {label}
      </Text>
      <Box
        borderStyle={theme.layout.borderStyle}
        borderColor={theme.colors.border}
        paddingX={1}
        paddingY={0}
        width={fieldWidth}
        flexShrink={0}
        marginTop={1}
      >
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          showCursor={showCursor}
        />
      </Box>
    </Box>
  );
};

interface ProgressSpinnerProps {
  text: string;
  type?: Parameters<typeof Spinner>[0]["type"];
}

export const ProgressSpinner: React.FC<ProgressSpinnerProps> = ({
  text,
  type = "dots",
}) => {
  const theme = useTheme();

  return (
    <Box flexDirection="row" alignItems="center" gap={1}>
      <Spinner type={type} />
      <Text color={theme.colors.info}>{text}</Text>
    </Box>
  );
};

interface StatusBarProps {
  items?: Array<{ key: string; value: string; color?: string }>;
  center?: string;
  left?: string;
  right?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  width?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  items,
  center,
  left,
  right,
  variant = "default",
  width,
}) => {
  const theme = useTheme();
  const barWidth =
    width ??
    resolveListWidth(
      theme.responsive.terminalWidth,
      theme.layout.minWidth,
      theme.layout.maxWidth
    );

  const variantColor = useMemo(() => {
    switch (variant) {
      case "success":
        return theme.colors.success;
      case "warning":
        return theme.colors.warning;
      case "error":
        return theme.colors.error;
      case "info":
        return theme.colors.info;
      default:
        return theme.colors.text.primary;
    }
  }, [variant, theme.colors]);

  return (
    <Box
      width={barWidth}
      borderStyle={theme.layout.borderStyle}
      borderColor={theme.colors.border}
      paddingX={1}
      paddingY={0}
      flexShrink={0}
    >
      {items ? (
        <Box flexDirection="row" justifyContent="space-between" width="100%">
          {items.map((item, index) => (
            <Box key={`${item.key}-${index}`} flexDirection="row" gap={1}>
              <Text color={theme.colors.text.muted}>{item.key}:</Text>
              <Text color={item.color ?? variantColor}>{item.value}</Text>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          {left ? (
            <Text color={variantColor}>{left}</Text>
          ) : (
            <Text color={variantColor}> </Text>
          )}
          {center && (
            <Box flexGrow={1} justifyContent="center">
              <Text color={variantColor}>{center}</Text>
            </Box>
          )}
          {right ? (
            <Text color={variantColor}>{right}</Text>
          ) : (
            <Text color={variantColor}> </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const options: Array<"yes" | "no"> = ["yes", "no"];
  const [index, moveIndex] = useSelectableIndex(
    options.map((option) => ({ disabled: false })),
    1
  );

  useInput(
    useCallback(
      (input, key) => {
        if (key.leftArrow) {
          moveIndex(-1);
        } else if (key.rightArrow) {
          moveIndex(1);
        } else if (key.return) {
          options[index] === "yes" ? onConfirm() : onCancel();
        } else if (key.escape) {
          onCancel();
        }
      },
      [index, moveIndex, onCancel, onConfirm]
    )
  );

  return (
    <Box
      borderStyle="double"
      borderColor={theme.colors.warning}
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      alignItems="center"
      width={clampWidth(
        theme.layout.minWidth,
        theme.layout.minWidth,
        theme.layout.maxWidth
      )}
    >
      <Box marginBottom={1}>
        <Text color={theme.colors.warning} bold>
          {message}
        </Text>
      </Box>
      <Box flexDirection="row" gap={4}>
        {options.map((option, optionIndex) => (
          <Text
            key={option}
            color={
              optionIndex === index
                ? theme.colors.success
                : theme.colors.text.muted
            }
            bold={optionIndex === index}
          >
            {optionIndex === index ? "▶ " : "  "}
            {option.toUpperCase()}
          </Text>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.colors.text.muted}>
          ← →: 移動 | Enter: 確定 | Esc: キャンセル
        </Text>
      </Box>
    </Box>
  );
};
