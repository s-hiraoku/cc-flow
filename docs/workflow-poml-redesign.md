# ワークフローテンプレート再設計メモ

## 目的
- `workflow.md` / `workflow.poml` を POML 主導の構造に刷新し、Markdown 側を最小限のラッパーにする。
- `<include>` とテンプレートエンジン機能をフル活用し、保守性の高いファイル分割と変数注入を実現する。
- 各ステップで複数サブエージェントを定義できる柔軟なワークフロー表現を提供する。

## 全体像
1. **POML ファイルの分割**
   - メイン: `workflow.poml`（メタ + 各パートの `include` のみ）
   - サブ: `partials/role.poml`, `partials/overview.poml`, `partials/steps.poml`, `partials/schema.poml`, `partials/example.poml` などに分離。
   - `convert_poml_to_markdown` はメインテンプレートを呼ぶだけにし、`pomljs` の `--baseDir` or テンポラリ配置でパス解決を安定化。 

2. **Markdown 側 (`workflow.md`)**
   - frontmatter（description / argument-hint / allowed-tools）と、簡潔な導入文のみを保持。
   - 実行手順・例・出力仕様などは POML からの出力を丸ごと挿入。
   - `{POML_GENERATED_INSTRUCTIONS}` を最終本文そのものとみなし、余分な見出しや重複記述を撤去。

3. **データモデル**
   - CLI から `SELECTED_AGENTS` を JSON 化し、`workflowSteps`（配列の配列）に再構成して `pomljs --var` で注入。
   - 例:
     ```json
     {
       "workflowName": "demo-workflow",
       "workflowContext": "sequential agent execution",
       "workflowSteps": [
         {
           "title": "Requirement Gathering",
           "mode": "sequential",
           "agents": ["spec-requirements"]
         },
         {
           "title": "Design & QA",
           "mode": "parallel",
           "agents": ["spec-design", "spec-quality"]
         }
       ]
     }
     ```
   - `mode` で並列／順次などの振る舞いを説明可能にし、POML 側で文言やラベルを出し分け。

4. **POML コンポーネント設計**
   - `<meta minVersion="0.0.8" />` と `<stylesheet>` をメインに配置し、captionStyle を統一管理。
   - `<task captionStyle="hidden">` 内は Markdown 見出しではなく `<section>` / `<panel>` / `<step>` を使用。
   - 手順部は `<stepwiseInstructions>` + `<step>` + 内部 `<list>` で複数エージェントを表現。
   - 出力仕様は `<output-schema>` で記述し、開発時向けに `<debug>` や `<note>` を活用。

5. **変数注入ロジック**
   - Bash 側ではブレース置換を廃止し、`pomljs` の `--var workflowName="..." --var workflowSteps='[...]'` を利用。
   - 必要に応じて `--context`（旧仕様互換）も併用しつつ、`<let>` ではなくテンプレート式でデータを展開。
   - 例外処理は POML 内で `<if condition="workflowSteps.length === 0">` → `<note level="error">` として扱い、pomljs 実行段階で異常を検出。

6. **テストとドキュメント**
   - BATS テストは `pomljs` のモックを更新し、分割テンプレートとネスト構造を前提にした出力へ変更。
   - `docs/shell-library-specification.md` 等も `WORKFLOW_AGENT_ARRAY` → `workflowSteps` の差分、`convert_poml_file_to_markdown` 経路の一本化を明記。

## フェーズ別実装ステップ案

### Phase 1: POMLファースト土台づくり（現行の線形エージェント列を維持）
1. POML 部品ファイルを試作 (`partials/*.poml`)。
2. `convert_poml_to_markdown` を `--var` 方式に切り替え、テンプレート側で `{{workflowAgents}}`（一次元配列）を直接扱うようにする。
3. Markdown テンプレートの軽量化と、`{POML_GENERATED_INSTRUCTIONS}` を最終本文として扱うラッパー構成に変更。
4. テスト更新＋ドキュメント追従。
 5. Phase2 を想定したプレースホルダ（例: `<!-- future-step-list -->`）を設置し、後続拡張時の差分を局所化。

### Phase 2: 複数エージェント／ステップ構造への拡張
1. シェル側で `workflowSteps` を構築するヘルパーを追加し、`--var workflowSteps` を POML に渡す。
2. POML テンプレートを `<list>` / `<stepwiseInstructions>` でネスト構造に対応させる。
3. config / Ink UI の拡張と CLI オプション再設計。
4. 並列モードや出力schemaの高度化、および追加テスト。

## オープンな検討事項
- ステップ設定 UI で「並列エージェント」をどう入力させるか（生成スクリプト内の責務か、上位ツールで組むか）。
- `mode` の語彙（`parallel` / `sequential` / `fanout` など）をどう定義し、文章化するか。
- `include` 用パス管理：テンプレート一式をリポジトリに常駐させるか、一時出力に書くか。
- 最終 Markdown に追加で必要なセクション（例：CLI コマンド例、実行上の注意など）を POML 側に内包するか否か。

---

以上をベースに、次はテンプレート分割の具体的なファイル構成と `workflowSteps` の生成ロジックを掘り下げる予定。
