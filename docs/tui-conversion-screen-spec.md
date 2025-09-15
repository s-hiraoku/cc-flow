# TUI変換画面 設計仕様書

## 1. 概要

### 1.1 目的
カスタムスラッシュコマンドをサブエージェントに変換するためのTUIインターフェースを提供します。直感的な操作でスラッシュコマンドの選択・変換・配置を行い、既存のワークフロー作成機能にシームレスに統合します。

### 1.2 責務
- スラッシュコマンドの一覧表示と選択
- 変換設定（出力先、カテゴリ等）の構成
- 変換処理の実行と進捗表示
- 変換結果の確認と次画面への遷移

## 2. 画面仕様

### 2.1 ConversionScreen.ts

#### 2.1.1 クラス定義
```typescript
export class ConversionScreen extends BaseScreen {
  constructor() {
    super('Slash Command Conversion');
  }
  
  async show(): Promise<ConversionResult> {
    // メイン処理
  }
}

export interface ConversionResult {
  success: boolean;
  convertedCount: number;
  targetDirectory: string;
  convertedAgents: Agent[];
  errors?: ConversionError[];
}

export interface ConversionError {
  sourceFile: string;
  error: string;
  severity: 'warning' | 'error';
}
```

#### 2.1.2 画面レイアウト

##### ステップ1: スラッシュコマンド一覧
```
┌─ 🔄 スラッシュコマンド → エージェント変換 ─────────────────────┐
│                                                               │
│ 📋 検出されたスラッシュコマンド: (12個)                        │
│                                                               │
│ ┌─ utility ─────────────────────────────────────────────────┐ │
│ │ ☐ my-tool          - Custom development utility          │ │
│ │ ☐ code-formatter   - Automatic code formatting tool     │ │
│ │ ☐ log-analyzer     - Parse and analyze log files        │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─ workflow ────────────────────────────────────────────────┐ │
│ │ ☐ deploy-checker   - Deployment validation workflow     │ │
│ │ ☐ test-runner      - Automated testing pipeline        │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─ analysis ────────────────────────────────────────────────┐ │
│ │ ☐ security-scan    - Security vulnerability scanner     │ │
│ │ ☐ performance-test - Performance benchmarking tool      │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ 💡 ヒント: スペースキーで選択/解除、Enterで次へ                │
│                                                               │
│ 🚀 [次へ: 設定] 🔙 [戻る] 📊 [プレビュー]                      │
└───────────────────────────────────────────────────────────────┘
```

##### ステップ2: 変換設定
```
┌─ ⚙️ 変換設定 ───────────────────────────────────────────────┐
│                                                               │
│ 📂 出力設定:                                                  │
│   ベースディレクトリ: .claude/agents/                         │
│   ☑ カテゴリ別に分類して保存                                   │
│                                                               │
│ 🎨 エージェント設定:                                          │
│   デフォルトモデル: [sonnet ▼]                                │
│   デフォルトカラー: [blue   ▼]                                │
│   ☑ 既存エージェントとの名前衝突をチェック                      │
│                                                               │
│ 🔍 検証設定:                                                  │
│   ☑ 変換後に妥当性をチェック                                  │
│   ☑ 機能等価性を検証                                          │
│   ☑ エラー時は詳細ログを表示                                  │
│                                                               │
│ 📋 選択されたコマンド: 5個                                     │
│   - utility/my-tool                                          │
│   - workflow/deploy-checker                                  │
│   - analysis/security-scan                                   │
│   (他2個...)                                                 │
│                                                               │
│ 🚀 [変換開始] 🔙 [戻る]                                       │
└───────────────────────────────────────────────────────────────┘
```

##### ステップ3: 変換実行中
```
┌─ ⏳ 変換実行中 ─────────────────────────────────────────────┐
│                                                               │
│ 🔄 スラッシュコマンド → エージェント変換を実行中...            │
│                                                               │
│ 進捗: ████████████░░░░░░░░░░ 50% (3/6)                       │
│                                                               │
│ 📁 現在の処理:                                                │
│   ✅ utility/my-tool           → .claude/agents/utility/      │
│   ✅ workflow/deploy-checker   → .claude/agents/workflow/     │
│   🔄 analysis/security-scan    → .claude/agents/analysis/    │
│   ⏳ workflow/test-runner                                     │
│   ⏳ utility/code-formatter                                   │
│   ⏳ utility/log-analyzer                                     │
│                                                               │
│ 📊 統計:                                                      │
│   成功: 2個 | 処理中: 1個 | 待機中: 3個 | エラー: 0個          │
│                                                               │
│ 💡 変換処理は数秒で完了します...                               │
└───────────────────────────────────────────────────────────────┘
```

##### ステップ4: 変換完了
```
┌─ ✅ 変換完了 ───────────────────────────────────────────────┐
│                                                               │
│ 🎉 スラッシュコマンドの変換が正常に完了しました！               │
│                                                               │
│ 📊 変換結果:                                                  │
│   ✅ 成功: 5個                                                │
│   ⚠️  警告: 1個 (軽微な問題)                                  │
│   ❌ エラー: 0個                                              │
│                                                               │
│ 📂 作成されたエージェント:                                     │
│   • .claude/agents/utility/my-tool.md                        │
│   • .claude/agents/workflow/deploy-checker.md                │
│   • .claude/agents/analysis/security-scan.md                 │
│   • .claude/agents/workflow/test-runner.md                   │
│   • .claude/agents/utility/code-formatter.md                 │
│                                                               │
│ ⚠️  警告詳細:                                                 │
│   - utility/log-analyzer: 大きなシェルスクリプト検出          │
│                                                               │
│ 🚀 次のステップ:                                              │
│   変換されたエージェントを使ってワークフローを作成できます       │
│                                                               │
│ 🚀 [ワークフロー作成へ] 🔙 [メインメニューへ] 📊 [詳細表示]     │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 画面フロー

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  コマンド一覧    │───▶│   変換設定      │───▶│   変換実行      │
│  (選択画面)     │    │  (設定画面)     │    │  (進捗画面)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  エージェント    │◀───│   変換完了      │◀───│   (自動遷移)     │
│  選択画面       │    │  (結果画面)     │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. 実装仕様

### 3.1 主要メソッド

#### 3.1.1 show()
```typescript
async show(): Promise<ConversionResult> {
  try {
    // 1. スラッシュコマンド検出
    const discoveredCommands = await this.discoverSlashCommands();
    
    // 2. 選択画面表示
    const selectedCommands = await this.showCommandSelection(discoveredCommands);
    
    // 3. 設定画面表示
    const conversionConfig = await this.showConversionSettings(selectedCommands);
    
    // 4. 変換実行
    const result = await this.executeConversion(selectedCommands, conversionConfig);
    
    // 5. 結果表示
    await this.showConversionResult(result);
    
    return result;
    
  } catch (error) {
    return this.handleConversionError(error);
  }
}
```

#### 3.1.2 discoverSlashCommands()
```typescript
private async discoverSlashCommands(): Promise<DiscoveredCommand[]> {
  // slash-command-discovery.sh を呼び出し
  const discovery = new SlashCommandDiscovery();
  return await discovery.findAndAnalyzeCommands('.claude/commands');
}
```

#### 3.1.3 showCommandSelection()
```typescript
private async showCommandSelection(commands: DiscoveredCommand[]): Promise<SelectedCommand[]> {
  // カテゴリ別グループ化
  const groupedCommands = this.groupCommandsByCategory(commands);
  
  // チェックボックス形式での選択
  return await checkbox({
    message: '変換するスラッシュコマンドを選択してください: (スペースで選択)',
    choices: this.buildCommandChoices(groupedCommands),
    pageSize: 15,
    instructions: false,
    theme: {
      prefix: (state: any) => state.status === 'done' ? '✅' : '> ',
    },
    validate: (selections: readonly unknown[]) => {
      if (selections.length === 0) {
        return '少なくとも一つのコマンドを選択してください';
      }
      return true;
    }
  });
}
```

#### 3.1.4 executeConversion()
```typescript
private async executeConversion(
  commands: SelectedCommand[], 
  config: ConversionConfig
): Promise<ConversionResult> {
  
  const results: ConversionResult = {
    success: true,
    convertedCount: 0,
    targetDirectory: config.baseDirectory,
    convertedAgents: [],
    errors: []
  };
  
  // 進捗表示の準備
  this.initializeProgressDisplay(commands.length);
  
  // 各コマンドを変換
  for (const [index, command] of commands.entries()) {
    try {
      this.updateProgress(index, `Converting ${command.name}...`);
      
      // conversion-processor.sh を呼び出し
      const agent = await this.convertSingleCommand(command, config);
      
      results.convertedAgents.push(agent);
      results.convertedCount++;
      
      this.updateProgressSuccess(index, command.name);
      
    } catch (error) {
      results.errors?.push({
        sourceFile: command.sourcePath,
        error: error.message,
        severity: 'error'
      });
      this.updateProgressError(index, command.name, error);
    }
  }
  
  this.finalizeProgress();
  return results;
}
```

### 3.2 依存関係

#### 3.2.1 SlashCommandDiscovery
```typescript
class SlashCommandDiscovery {
  async findAndAnalyzeCommands(baseDir: string): Promise<DiscoveredCommand[]> {
    // scripts/lib/slash-command-discovery.sh をラップ
    const result = await this.executeShellScript(
      'scripts/lib/slash-command-discovery.sh',
      ['find_and_analyze', baseDir]
    );
    
    return this.parseDiscoveryResult(result);
  }
}
```

#### 3.2.2 ConversionProcessor
```typescript
class ConversionProcessor {
  async convertCommand(
    command: SelectedCommand, 
    config: ConversionConfig
  ): Promise<Agent> {
    // scripts/lib/conversion-processor.sh をラップ  
    const result = await this.executeShellScript(
      'scripts/lib/conversion-processor.sh',
      ['convert_single', command.sourcePath, this.getTargetPath(command, config)]
    );
    
    return this.parseConversionResult(result);
  }
}
```

### 3.3 進捗表示

#### 3.3.1 プログレスバー
```typescript
private updateProgressDisplay(current: number, total: number, message: string) {
  const percentage = Math.floor((current / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + 
                     '░'.repeat(20 - Math.floor(percentage / 5));
  
  console.clear();
  console.log(this.renderProgressScreen(progressBar, percentage, current, total, message));
}
```

#### 3.3.2 リアルタイム更新
```typescript
private renderProgressScreen(
  progressBar: string, 
  percentage: number, 
  current: number, 
  total: number, 
  currentMessage: string
): string {
  return `
┌─ ⏳ 変換実行中 ─────────────────────────────────────────────┐
│                                                               │
│ 🔄 スラッシュコマンド → エージェント変換を実行中...            │
│                                                               │
│ 進捗: ${progressBar} ${percentage}% (${current}/${total})     │
│                                                               │
│ 📁 ${currentMessage}                                          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
  `.trim();
}
```

## 4. エラーハンドリング

### 4.1 エラー分類

#### 4.1.1 重要度レベル
- **Error**: 変換処理が完全に失敗
- **Warning**: 変換は成功したが問題あり
- **Info**: 参考情報

#### 4.1.2 エラー種別
```typescript
enum ConversionErrorType {
  FILE_NOT_FOUND = 'file_not_found',
  INVALID_YAML = 'invalid_yaml',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  TEMPLATE_ERROR = 'template_error',
  WRITE_ERROR = 'write_error',
  VALIDATION_ERROR = 'validation_error',
  NAME_CONFLICT = 'name_conflict'
}
```

### 4.2 エラー表示

#### 4.2.1 インライン警告
```
⚠️  警告: utility/my-tool
    大きなシェルスクリプトが検出されました。
    変換後に動作確認を推奨します。
```

#### 4.2.2 詳細エラー表示
```
❌ エラー: workflow/broken-cmd
    YAML解析エラー: 無効な構文 (行15)
    → 手動修正後に再試行してください
```

## 5. 統合仕様

### 5.1 TUIManager.ts統合

```typescript
// メインメニューに追加
case 'Convert slash commands to agents':
  const conversionScreen = new ConversionScreen();
  const result = await conversionScreen.show();
  
  if (result.success && result.convertedCount > 0) {
    // 変換成功 → エージェント選択画面へ
    const agentScreen = new AgentSelectionScreen();
    return await agentScreen.show();
  }
  break;
```

### 5.2 BaseScreen継承

```typescript
export class ConversionScreen extends BaseScreen<ConversionResult> {
  // BaseScreenの共通機能を活用
  // - clearAndRender()
  // - renderHeader()  
  // - showError()
  // - showSuccess()
}
```

## 6. 設定ファイル

### 6.1 conversion-settings.json
```json
{
  "defaultSettings": {
    "baseDirectory": ".claude/agents",
    "categorizeBySource": true,
    "defaultModel": "sonnet",
    "defaultColor": "blue",
    "validateAfterConversion": true,
    "checkNameConflicts": true,
    "backupOriginals": false
  },
  "templates": {
    "default": "templates/agent-template.md",
    "utility": "templates/agent-utility-template.md",
    "workflow": "templates/agent-workflow-template.md"
  },
  "exclusions": [
    "create-workflow.md",
    "*.poml",
    "template-*"
  ]
}
```

## 7. テスト仕様

### 7.1 ユニットテスト
- 各メソッドの個別動作確認
- エラーハンドリングの検証
- 進捗表示の更新確認

### 7.2 統合テスト  
- 実際のスラッシュコマンドでの変換テスト
- TUIManager経由での動作確認
- 変換後のエージェント選択画面遷移

### 7.3 ユーザビリティテスト
- 画面レイアウトの視認性
- キーボード操作の直感性
- エラーメッセージの分かりやすさ

---

**作成日**: 2024-01-15  
**バージョン**: 1.0  
**作成者**: CC-Flow Development Team