import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPackageJson = () => {
  try {
    const packagePath = resolve(__dirname, '../../package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    return JSON.parse(packageContent);
  } catch (error) {
    console.warn('Failed to read package.json:', error);
    return { version: '0.0.0' };
  }
};

export const getVersion = (): string => {
  const packageJson = getPackageJson();
  return packageJson.version ?? '0.0.0';
};