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
    const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---/s);
    if (frontmatterMatch) {
      const yaml = frontmatterMatch[1];
      const descMatch = yaml.match(/description:\s*(.+)/);
      if (descMatch) {
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
