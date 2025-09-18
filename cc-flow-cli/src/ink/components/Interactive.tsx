import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { useTheme } from '../themes/theme.js';
import { Flex, Section } from './Layout.js';

interface MenuItem {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface FocusableMenuProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  title?: string;
}

export const FocusableMenu: React.FC<FocusableMenuProps> = ({ 
  items, 
  onSelect, 
  title 
}) => {
  const theme = useTheme();
  
  return (
    <Section>
      {title && (
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>{title}</Text>
        </Box>
      )}
      <SelectInput
        items={items}
        onSelect={onSelect}
        indicatorComponent={({ isSelected }) => (
          <Box marginRight={1}>
            <Text color={theme.colors.primary}>
              {isSelected ? '▶' : ' '}
            </Text>
          </Box>
        )}
        itemComponent={({ label, isSelected }) => (
          <Text 
            color={isSelected ? theme.colors.primary : theme.colors.text}
            bold={isSelected}
          >
            {label}
          </Text>
        )}
      />
    </Section>
  );
};

interface CheckboxListProps {
  items: Array<{ id: string; label: string; description?: string; icon?: string; value?: string }>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  title?: string;
  focusId?: string;
  multiSelect?: boolean;
}

export const CheckboxList: React.FC<CheckboxListProps> = ({ 
  items, 
  selectedIds,
  onToggle, 
  title 
}) => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput(useCallback((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(items.length - 1, prev + 1));
    } else if (input === ' ') {
      const currentItem = items[selectedIndex];
      if (currentItem) {
        onToggle(currentItem.id);
      }
    }
  }, [selectedIndex, items, onToggle]));

  return (
    <Section>
      {title && (
        <Box marginBottom={1}>
          <Text color={theme.colors.primary} bold>{title}</Text>
        </Box>
      )}
      {items.map((item, index) => (
        <Box key={item.id} marginY={0}>
          <Flex align="center" gap={1}>
            <Text color={theme.colors.primary}>
              {index === selectedIndex ? '▶' : ' '}
            </Text>
            <Text color={theme.colors.success}>
              {selectedIds.has(item.id) ? '☑' : '☐'}
            </Text>
            {item.icon && (
              <Text color={theme.colors.primary}>
                {item.icon}
              </Text>
            )}
            <Text 
              color={index === selectedIndex ? theme.colors.primary : theme.colors.text.primary}
              bold={index === selectedIndex}
            >
              {item.label}
            </Text>
          </Flex>
          {item.description && index === selectedIndex && (
            <Box marginLeft={4} marginTop={0}>
              <Text color={theme.colors.muted} italic>
                {item.description}
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Section>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showCursor?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '',
  showCursor = true
}) => {
  const theme = useTheme();
  
  return (
    <Section>
      <Box marginBottom={1}>
        <Text color={theme.colors.primary} bold>{label}</Text>
      </Box>
      <Box 
        borderStyle="single" 
        borderColor={theme.colors.border}
        padding={1}
        width="100%"
      >
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          showCursor={showCursor}
        />
      </Box>
    </Section>
  );
};

interface ProgressSpinnerProps {
  text: string;
  type?: 'dots' | 'line' | 'pipe' | 'simpleDots' | 'simpleDotsScrolling' | 'star' | 'flip' | 'hamburger' | 'growVertical' | 'growHorizontal' | 'balloon' | 'noise' | 'bounce' | 'boxBounce';
}

export const ProgressSpinner: React.FC<ProgressSpinnerProps> = ({ 
  text, 
  type = 'dots' 
}) => {
  const theme = useTheme();
  
  return (
    <Section>
      <Flex align="center" gap={1}>
        <Spinner type={type} />
        <Text color={theme.colors.info}>{text}</Text>
      </Flex>
    </Section>
  );
};

interface StatusBarProps {
  items?: Array<{ key: string; value: string; color?: string }>;
  center?: string;
  left?: string;
  right?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const StatusBar: React.FC<StatusBarProps> = ({ items, center, left, right, variant = 'default' }) => {
  const theme = useTheme();
  
  const getVariantColor = () => {
    switch (variant) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      default: return theme.colors.text.primary;
    }
  };
  
  return (
    <Box 
      borderStyle="single" 
      borderColor={theme.colors.muted}
      padding={1}
      width="100%"
    >
      {items ? (
        <Flex justify="space-between" align="center">
          {items.map((item, index) => (
            <Flex key={`${item.key}-${index}`} align="center" gap={1}>
              <Text color={theme.colors.muted}>{item.key}:</Text>
              <Text color={item.color || theme.colors.text.primary}>{item.value}</Text>
              {index < items.length - 1 && (
                <Text color={theme.colors.muted}> | </Text>
              )}
            </Flex>
          ))}
        </Flex>
      ) : (
        <Flex justify="space-between" align="center">
          {left && <Text color={getVariantColor()}>{left}</Text>}
          {center && (
            <Text color={getVariantColor()} textWrap="wrap">
              {center}
            </Text>
          )}
          {right && <Text color={getVariantColor()}>{right}</Text>}
        </Flex>
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
  onCancel 
}) => {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no'>('no');

  useInput(useCallback((input, key) => {
    if (key.leftArrow || key.rightArrow) {
      setSelectedOption(prev => prev === 'yes' ? 'no' : 'yes');
    } else if (key.return) {
      if (selectedOption === 'yes') {
        onConfirm();
      } else {
        onCancel();
      }
    } else if (key.escape) {
      onCancel();
    }
  }, [selectedOption, onConfirm, onCancel]));

  return (
    <Box 
      borderStyle="double" 
      borderColor={theme.colors.warning}
      padding={2}
      flexDirection="column"
      alignItems="center"
    >
      <Box marginBottom={2}>
        <Text color={theme.colors.warning} bold>{message}</Text>
      </Box>
      <Flex gap={4}>
        <Text 
          color={selectedOption === 'yes' ? theme.colors.success : theme.colors.muted}
          bold={selectedOption === 'yes'}
        >
          {selectedOption === 'yes' ? '▶ ' : '  '}Yes
        </Text>
        <Text 
          color={selectedOption === 'no' ? theme.colors.error : theme.colors.muted}
          bold={selectedOption === 'no'}
        >
          {selectedOption === 'no' ? '▶ ' : '  '}No
        </Text>
      </Flex>
      <Box marginTop={1}>
        <Text color={theme.colors.muted}>← → to navigate, Enter to confirm, Esc to cancel</Text>
      </Box>
    </Box>
  );
};