import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

export interface DirectoryInfo {
  id: string;
  label: string;
  value: string;
  icon: string;
  description: string;
}

export interface DirectoryStats {
  agentCount: number;
  description: string;
}

export interface CommandStats {
  commandCount: number;
  description: string;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  path: string;
  category?: string;
}

/**
 * 指定されたパスのサブディレクトリを取得し、エージェント数を計算する
 */
export function getAgentDirectories(basePath: string): DirectoryInfo[] {
  try {
    const directories: DirectoryInfo[] = [];
    
    // .claude/agents ディレクトリが存在するかチェック
    const agentsPath = join(process.cwd(), '.claude', 'agents');
    
    try {
      const items = readdirSync(agentsPath);
      
      for (const item of items) {
        const itemPath = join(agentsPath, item);
        
        try {
          const stats = statSync(itemPath);
          
          if (stats.isDirectory()) {
            const agentStats = getDirectoryStats(itemPath);
            const directoryInfo = createDirectoryInfo(item, agentStats);
            directories.push(directoryInfo);
          }
        } catch (error) {
          // 個別のディレクトリでエラーが発生しても続行
          console.warn(`Warning: Could not read directory ${item}:`, error);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not read agents directory:', error);
    }
    
    // "すべてのエージェント" オプションを追加
    const totalAgents = directories.reduce((sum, dir) => {
      const match = dir.description.match(/(\d+)個のエージェント/);
      const count = match?.[1];
      return sum + (count ? parseInt(count, 10) : 0);
    }, 0);
    
    directories.unshift({
      id: 'all-agents',
      label: 'すべてのエージェント',
      value: './agents',
      icon: '📂',
      description: `プロジェクト内のすべてのエージェント（${totalAgents}個）を対象とします`
    });
    
    // "戻る" オプションを追加
    directories.push({
      id: 'back',
      label: '戻る',
      value: 'back',
      icon: '↩️',
      description: '前の画面に戻ります'
    });
    
    return directories;
  } catch (error) {
    console.error('Error getting agent directories:', error);
    return getDefaultDirectories();
  }
}

/**
 * ディレクトリ内のエージェント数と説明を取得
 */
function getDirectoryStats(dirPath: string): DirectoryStats {
  try {
    const files = readdirSync(dirPath);
    const agentFiles = files.filter(file => file.endsWith('.md'));
    
    return {
      agentCount: agentFiles.length,
      description: getDirectoryDescription(dirPath)
    };
  } catch (error) {
    return {
      agentCount: 0,
      description: '説明なし'
    };
  }
}

/**
 * ディレクトリ名に基づいて説明を生成
 */
function getDirectoryDescription(dirPath: string): string {
  const dirName = dirPath.split('/').pop() || '';
  
  switch (dirName) {
    case 'spec':
      return '仕様定義・要件分析・設計関連のエージェントが含まれます';
    case 'utility':
      return '汎用的なヘルパーエージェントやツール系エージェントが含まれます';
    default:
      return `${dirName}関連のエージェントが含まれます`;
  }
}

/**
 * ディレクトリ情報を作成
 */
function createDirectoryInfo(dirName: string, stats: DirectoryStats): DirectoryInfo {
  const icon = getDirectoryIcon(dirName);
  const label = getDirectoryLabel(dirName, stats.agentCount);
  
  return {
    id: `${dirName}-agents`,
    label,
    value: `./agents/${dirName}`,
    icon,
    description: `${stats.description}（${stats.agentCount}個のエージェント）`
  };
}

/**
 * ディレクトリ名に基づいてアイコンを取得
 */
function getDirectoryIcon(dirName: string): string {
  switch (dirName) {
    case 'spec':
      return '📋';
    case 'utility':
      return '🔧';
    case 'workflow':
      return '⚡';
    case 'development':
      return '💻';
    default:
      return '📁';
  }
}

/**
 * ディレクトリ名とエージェント数に基づいてラベルを生成
 */
function getDirectoryLabel(dirName: string, agentCount: number): string {
  switch (dirName) {
    case 'spec':
      return `spec/ - 仕様定義エージェント (${agentCount})`;
    case 'utility':
      return `utility/ - ユーティリティエージェント (${agentCount})`;
    default:
      return `${dirName}/ - ${dirName}エージェント (${agentCount})`;
  }
}

/**
 * エラー時のデフォルトディレクトリ一覧
 */
/**
 * 指定されたパスからエージェントファイルを読み込む
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  path: string;
  icon?: string;
}

export function getAgentsFromPath(targetPath: string): Agent[] {
  try {
    const agents: Agent[] = [];
    
    // パスの正規化（./agents形式から絶対パスに変換）
    const normalizedPath = targetPath.startsWith('./') 
      ? join(process.cwd(), '.claude', targetPath.slice(2))
      : targetPath;
    
    try {
      const files = readdirSync(normalizedPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = join(normalizedPath, file);
          const stats = statSync(filePath);
          
          if (stats.isFile()) {
            const agentName = file.replace('.md', '');
            const description = extractAgentDescription(filePath, agentName);
            const icon = getAgentIcon(agentName);
            
            agents.push({
              id: agentName,
              name: agentName,
              description,
              path: filePath,
              icon
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${normalizedPath}:`, error);
    }
    
    // 名前でソート
    agents.sort((a, b) => a.name.localeCompare(b.name));
    
    return agents;
  } catch (error) {
    console.error('Error getting agents from path:', error);
    return [];
  }
}

/**
 * エージェントファイルから説明を抽出
 */
function extractAgentDescription(filePath: string, agentName: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // YAML frontmatterから説明を抽出を試行
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch && frontmatterMatch[1]) {
      const yaml = frontmatterMatch[1];
      const descMatch = yaml.match(/description:\s*(.+)/);
      if (descMatch && descMatch[1]) {
        return descMatch[1].replace(/["']/g, '').trim();
      }
    }
    
    // 最初の段落から説明を抽出
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed;
      }
    }
    
    // フォールバック：エージェント名に基づく説明
    return getAgentDescriptionByName(agentName);
  } catch (error) {
    return getAgentDescriptionByName(agentName);
  }
}

/**
 * エージェント名に基づく説明を生成
 */
function getAgentDescriptionByName(agentName: string): string {
  if (agentName.includes('init')) return '🏗️ 初期化・セットアップ';
  if (agentName.includes('requirements')) return '📋 要件定義・分析';
  if (agentName.includes('design')) return '🎨 設計・アーキテクチャ';
  if (agentName.includes('tasks')) return '📝 タスク分解・計画';
  if (agentName.includes('impl')) return '⚡ 実装・開発';
  if (agentName.includes('status')) return '📊 進捗・ステータス確認';
  if (agentName.includes('test')) return '🧪 テスト・検証';
  if (agentName.includes('deploy')) return '🚀 デプロイメント';
  if (agentName.includes('steering')) return '🎯 方向性・ガイダンス';
  return '⚙️ 処理・実行';
}

/**
 * エージェント名に基づくアイコンを取得
 */
function getAgentIcon(agentName: string): string {
  if (agentName.includes('init')) return '🏗️';
  if (agentName.includes('requirements')) return '📋';
  if (agentName.includes('design')) return '🎨';
  if (agentName.includes('tasks')) return '📝';
  if (agentName.includes('impl')) return '⚡';
  if (agentName.includes('status')) return '📊';
  if (agentName.includes('test')) return '🧪';
  if (agentName.includes('deploy')) return '🚀';
  if (agentName.includes('steering')) return '🎯';
  return '🤖';
}

function getDefaultDirectories(): DirectoryInfo[] {
  return [
    {
      id: 'all-agents',
      label: 'すべてのエージェント',
      value: './agents',
      icon: '📂',
      description: 'プロジェクト内のすべてのエージェントディレクトリを対象とします'
    },
    {
      id: 'back',
      label: '戻る',
      value: 'back',
      icon: '↩️',
      description: '前の画面に戻ります'
    }
  ];
}

/**
 * スラッシュコマンドディレクトリを取得し、コマンド数を計算する
 */
export function getCommandDirectories(basePath: string): DirectoryInfo[] {
  try {
    const directories: DirectoryInfo[] = [];
    
    // .claude/commands ディレクトリが存在するかチェック
    const commandsPath = join(process.cwd(), '.claude', 'commands');
    
    try {
      const items = readdirSync(commandsPath);
      
      for (const item of items) {
        const itemPath = join(commandsPath, item);
        
        try {
          const stats = statSync(itemPath);
          
          if (stats.isDirectory()) {
            const commandStats = getCommandDirectoryStats(itemPath);
            const directoryInfo = createCommandDirectoryInfo(item, commandStats);
            directories.push(directoryInfo);
          }
        } catch (error) {
          // 個別のディレクトリでエラーが発生しても続行
          console.warn(`Warning: Could not read directory ${item}:`, error);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not read commands directory:', error);
    }
    
    // メインのcommandsディレクトリも追加
    try {
      const mainCommandStats = getCommandDirectoryStats(commandsPath);
      directories.unshift({
        id: 'main-commands',
        label: 'メインコマンド',
        value: './.claude/commands',
        icon: '📋',
        description: `メインのスラッシュコマンドディレクトリ（${mainCommandStats.commandCount}個のコマンド）`
      });
    } catch (error) {
      // メインディレクトリが存在しない場合はデフォルトを追加
      directories.unshift({
        id: 'main-commands',
        label: 'メインコマンド',
        value: './.claude/commands',
        icon: '📋',
        description: 'メインのスラッシュコマンドディレクトリ'
      });
    }
    
    return directories;
  } catch (error) {
    console.warn('Error loading command directories:', error);
    return getDefaultCommandDirectories();
  }
}

/**
 * ディレクトリ内のコマンド統計を取得
 */
function getCommandDirectoryStats(dirPath: string): CommandStats {
  try {
    const files = readdirSync(dirPath);
    const commandFiles = files.filter(file => file.endsWith('.md'));
    
    return {
      commandCount: commandFiles.length,
      description: `${commandFiles.length}個のスラッシュコマンド`
    };
  } catch (error) {
    return {
      commandCount: 0,
      description: 'アクセスできません'
    };
  }
}

/**
 * コマンドディレクトリ情報を作成
 */
function createCommandDirectoryInfo(dirName: string, stats: CommandStats): DirectoryInfo {
  const icon = getCommandDirectoryIcon(dirName);
  const label = getCommandDirectoryLabel(dirName, stats.commandCount);
  
  return {
    id: `${dirName}-commands`,
    label,
    value: `./.claude/commands/${dirName}`,
    icon,
    description: `${stats.description}（${stats.commandCount}個のコマンド）`
  };
}

/**
 * コマンドディレクトリのアイコンを取得
 */
function getCommandDirectoryIcon(dirName: string): string {
  if (dirName.includes('demo')) return '🧪';
  if (dirName.includes('workflow')) return '🔄';
  if (dirName.includes('util')) return '🛠️';
  if (dirName.includes('spec')) return '📋';
  return '📄';
}

/**
 * コマンドディレクトリのラベルを取得
 */
function getCommandDirectoryLabel(dirName: string, commandCount: number): string {
  const baseLabel = dirName.charAt(0).toUpperCase() + dirName.slice(1);
  return `${baseLabel} (${commandCount}個)`;
}

/**
 * デフォルトのコマンドディレクトリ一覧
 */
function getDefaultCommandDirectories(): DirectoryInfo[] {
  return [
    {
      id: 'main-commands',
      label: 'メインコマンド',
      value: './.claude/commands',
      icon: '📋',
      description: 'メインのスラッシュコマンドディレクトリ'
    },
    {
      id: 'back',
      label: '戻る',
      value: 'back',
      icon: '↩️',
      description: '前の画面に戻ります'
    }
  ];
}

/**
 * 指定されたパスからスラッシュコマンドを取得する
 */
export function getCommandsFromPath(targetPath: string): Command[] {
  try {
    const commands: Command[] = [];
    const fullPath = join(process.cwd(), targetPath);
    
    try {
      const files = readdirSync(fullPath);
      const commandFiles = files.filter(file => file.endsWith('.md'));
      
      for (const file of commandFiles) {
        const filePath = join(fullPath, file);
        const commandName = file.replace('.md', '');
        
        try {
          const description = extractCommandDescription(filePath);
          commands.push({
            id: commandName,
            name: commandName,
            description,
            path: filePath,
            category: extractCategoryFromPath(targetPath)
          });
        } catch (error) {
          console.warn(`Warning: Could not read command file ${file}:`, error);
          // エラーでも基本情報は追加
          commands.push({
            id: commandName,
            name: commandName,
            description: 'スラッシュコマンド',
            path: filePath,
            category: extractCategoryFromPath(targetPath)
          });
        }
      }
    } catch (error) {
      console.warn('Warning: Could not read commands directory:', error);
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Error loading commands from path:', error);
    return [];
  }
}

/**
 * コマンドファイルから説明を抽出
 */
function extractCommandDescription(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // YAML frontmatterから説明を抽出を試行
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch && frontmatterMatch[1]) {
      const yaml = frontmatterMatch[1];
      const descMatch = yaml.match(/description:\s*(.+)/);
      if (descMatch && descMatch[1]) {
        return descMatch[1].replace(/["']/g, '').trim();
      }
    }
    
    // H1タイトルから抽出を試行
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match && h1Match[1]) {
      return h1Match[1].trim();
    }
    
    // 最初の非空行から抽出を試行
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed;
      }
    }
    
    // フォールバック：コマンド名に基づく説明
    return getCommandDescriptionByName(extractNameFromPath(filePath));
  } catch (error) {
    return getCommandDescriptionByName(extractNameFromPath(filePath));
  }
}

/**
 * ファイルパスからコマンド名を抽出
 */
function extractNameFromPath(filePath: string): string {
  return filePath.split('/').pop()?.replace('.md', '') || 'command';
}

/**
 * パスからカテゴリを抽出
 */
function extractCategoryFromPath(targetPath: string): string {
  const pathParts = targetPath.split('/');
  return pathParts[pathParts.length - 1] || 'commands';
}

/**
 * コマンド名に基づく説明を生成
 */
function getCommandDescriptionByName(commandName: string): string {
  if (commandName.includes('create')) return '🏗️ 作成・生成コマンド';
  if (commandName.includes('workflow')) return '🔄 ワークフロー管理';
  if (commandName.includes('spec')) return '📋 仕様書関連コマンド';
  if (commandName.includes('test')) return '🧪 テスト・検証コマンド';
  if (commandName.includes('deploy')) return '🚀 デプロイメントコマンド';
  if (commandName.includes('build')) return '🔧 ビルド・コンパイルコマンド';
  if (commandName.includes('convert')) return '🔄 変換・移行コマンド';
  return '📄 スラッシュコマンド';
}
