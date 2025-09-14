---
description: NPM publish readiness check for @hiraoku/cc-flow-cli
argument-hint: [--fix | --dry-run]
allowed-tools: [Bash, Read, Glob]
---

# publish-check

CC-Flow CLIパッケージのnpm publish準備状況を包括的にチェックします。

## 実行チェック項目

以下の項目を順次チェックし、品質の高いパッケージリリースを保証します：

### 📋 1. プロジェクト必須ファイル検証
- package.json の存在と妥当性
- README.md の存在と内容チェック
- CHANGELOG.md の更新確認
- LICENSE ファイルの存在
- .gitignore の適切な設定

### 🔍 2. Package.json 詳細検証
- name, version, description の設定確認
- author, repository, homepage の設定
- files配列の適切な設定（dist/, bin/, scripts/, templates/）
- exports/main/types の正しい設定
- dependencies/devDependencies の整合性
- publishConfig の npm organization 設定

### 🏗️ 3. ビルドとコンパイル検証
- TypeScript コンパイル成功確認
- npm run build の実行成功
- dist/ ディレクトリの生成確認
- bin/ スクリプトの実行可能性
- 型定義ファイル(.d.ts)の生成確認

### 🧪 4. テストとコード品質
- npm run lint の実行（TypeScript型チェック）
- npm run test の実行成功
- テストカバレッジの確認
- npm run validate の実行成功

### 📁 5. パッケージ内容検証
- templates/ ディレクトリの内容確認
- scripts/ ディレクトリの実行可能性
- .claude/agents/ サンプルエージェントの存在
- 不要ファイルの除外確認（node_modules/, .env等）

### 🔧 6. CLI機能テスト
- bin/cc-flow.js の実行可能性
- CLIコマンドのヘルプ表示確認
- 基本的な動作確認

### 📈 7. パッケージサイズとパフォーマンス
- パッケージサイズの適切性（< 10MB推奨）
- 依存関係のサイズ確認
- 不要なファイルの除外確認

### 🚀 8. 公開前最終確認
- npm publish --dry-run の実行
- package tarball 内容確認
- version の重複チェック

## 使用方法

```bash
# 標準チェック（問題のみ報告）
/publish-check

# 自動修正可能な問題を修正
/publish-check --fix

# 実際に公開せずにパッケージ確認
/publish-check --dry-run
```

## エラー時の対応

チェックが失敗した場合：
1. 表示されたエラーメッセージを確認
2. 推奨される修正方法に従って対応
3. 再度チェックを実行
4. 全てのチェックが通過するまで繰り返し

## 成功時の出力例

```
✅ NPM Publish Readiness Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 プロジェクト必須ファイル     ✅ 完璧
🔍 Package.json 設定          ✅ 完璧  
🏗️ ビルドとコンパイル          ✅ 成功
🧪 テストとコード品質          ✅ 合格
📁 パッケージ内容             ✅ 適切
🔧 CLI機能                   ✅ 正常
📈 パッケージサイズ            ✅ 最適
🚀 公開前確認                ✅ 準備完了

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 @hiraoku/cc-flow-cli v0.0.4 は公開準備完了です！

次のステップ:
npm publish
```

このコマンドにより、品質の高いパッケージのみがnpmに公開されることを保証します。