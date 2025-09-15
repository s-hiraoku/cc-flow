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

### 🔍 2. Package.json 詳細検証（実装準拠）
- 必須フィールド: name, version, description の確認
- 追加メタ: author, repository(url), homepage の有無確認
- files 配列の基本構成: 少なくとも `bin/`, `README.md` を含むか確認
- publishConfig.access が `public` であることを確認
  - それ以外の詳細（`exports`/`main`/`types`/依存整合性 等）は現時点では未チェック

### 🏗️ 3. ビルドとコンパイル検証（実装準拠）
- `npm run build` の実行結果のみを評価（0終了で合格）
- 生成物（`dist/` や `.d.ts`）の存在チェックは現時点では未実装
- `bin/cc-flow.js` の実行権限は「6. CLI機能テスト」で検証

### 🧪 4. テストとコード品質（実装準拠）
- `npm test` の実行（0終了で合格）
- `lint`/`validate`/カバレッジの評価は現時点では未実装

### 📁 5. パッケージ内容検証（実装準拠）
- `templates/` ディレクトリの存在確認
- `scripts/` ディレクトリの存在確認
- `.claude/agents/` ディレクトリの存在確認
- 実行可能性/不要ファイル除外の検証は現時点では未実装

### 🔧 6. CLI機能テスト（実装準拠）
- `bin/cc-flow.js` の存在と実行権限の確認
- ヘルプ表示/基本動作の検証は現時点では未実装

### 📈 7. パッケージサイズとパフォーマンス（実装準拠）
- `--dry-run` または `--fix` 指定時のみ `npm pack --dry-run` を実行しサイズ表示
- しきい値判定/依存サイズ/混入ファイル検知は現時点では未実装

### 🚀 8. 公開前最終確認（実装準拠）
- `--dry-run` 指定時のみ `npm publish --dry-run` を実行
- tarball 内容/バージョン重複の検証は現時点では未実装

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

## 実行

```bash
# Get arguments
ARGUMENTS="$*"

# Execute publish-check script
./scripts/releases/publish-check.sh $ARGUMENTS
```
