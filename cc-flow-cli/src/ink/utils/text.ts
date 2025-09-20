import stripAnsi from 'strip-ansi';
import _stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';

const stringWidth = (value: string): number => {
  return _stringWidth(stripAnsi(value), { ambiguousIsNarrow: false });
};

export const visibleWidth = (value: string): number => stringWidth(value);

export const padToWidth = (value: string, width: number, padChar: string = ' '): string => {
  const currentWidth = visibleWidth(value);
  if (currentWidth >= width) {
    return value;
  }
  return value + padChar.repeat(width - currentWidth);
};

export const alignRight = (value: string, width: number): string => {
  const currentWidth = visibleWidth(value);
  if (currentWidth >= width) {
    return value;
  }
  return ' '.repeat(width - currentWidth) + value;
};

export const centerLine = (value: string, width: number): string => {
  const trimmed = stripAnsi(value).trimEnd();
  const currentWidth = visibleWidth(trimmed);
  if (currentWidth >= width) {
    return trimmed;
  }
  const totalPadding = width - currentWidth;
  const left = Math.floor(totalPadding / 2);
  const right = totalPadding - left;
  return `${' '.repeat(left)}${trimmed}${' '.repeat(right)}`;
};

export const alignWithinWidth = (
  value: string,
  width: number,
  align: 'left' | 'center' | 'right'
): string => {
  switch (align) {
    case 'center':
      return centerLine(value, width);
    case 'right':
      return alignRight(value, width);
    default:
      return padToWidth(value, width);
  }
};

export const wrapLines = (value: string, width: number): string[] => {
  if (width <= 0) {
    return [value];
  }
  return wrapAnsi(value, width, { hard: true, trim: false }).split('\n');
};

export const wrapAndAlign = (
  value: string,
  width: number,
  align: 'left' | 'center' | 'right' = 'left'
): string[] => {
  const lines = wrapLines(value, width).map(line => line.replace(/\s+$/, ''));

  switch (align) {
    case 'center':
      return lines.map(line => centerLine(line, width));
    case 'right':
      return lines.map(line => alignRight(line, width));
    default:
      return lines.map(line => padToWidth(line, width));
  }
};

export const renderLines = (
  value: string | string[],
  width: number,
  align: 'left' | 'center' | 'right' = 'left'
): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(line => wrapAndAlign(line, width, align));
  }
  return wrapAndAlign(value, width, align);
};
