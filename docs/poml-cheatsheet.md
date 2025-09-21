# POML チートシート

`pomljs` で扱う Prompt Orchestration Markup Language (POML) の主要構文を、テンプレート実装時によく使う順にまとめたチートシートです。これを手元に置けば、CLI からワークフローを生成するときのテンプレートがスムーズに書けます。

---

## 基本構造

- ルート要素は `<poml>`。
- 一般的な構成は以下の通り。

```xml
<poml>
  <meta>
    <version min="0.0.8" />
  </meta>

  <let name="workflowName" value="'demo-workflow'" />

  <role captionStyle="bold">{{workflowName}} Workflow Orchestrator</role>
  <task> ... </task>
  <example> ... </example>
  <stepwiseInstructions> ... </stepwiseInstructions>
</poml>
```

---

## 変数定義とテンプレート式

- `<let name="foo" value="..." />` で変数定義。`value` の中身は JavaScript 式がそのまま評価されます。
- テンプレート式 `{{foo}}` で展開。プロパティアクセスや式展開も可能（例: `{{foo.length}}`）。
- 文字列は `'text'` / `"text"` を使用。配列は `['a', 'b']` 形式。
- 入れ子配列やオブジェクトもそのまま書けます。

```xml
<let name="steps" value="[
  { title: 'Design', agents: ['design-spec'] },
  { title: 'Implementation', agents: ['code-gen'] }
]" />
```

---

## テンプレートエンジン（制御構造）

- **ループ**: `<list for="item in items">`。ループ変数には `loop.index`, `loop.length` などが利用可能。
- **条件分岐**: `<if condition="expression">`／`<else/>`／`<elseif condition="..."/>`。
- **インライン式**: `{{condition ? 'A' : 'B'}}` のように直接式を書いても OK。

```xml
<list for="step in steps">
  <item>
    Step {{loop.index + 1}}: {{step.title}}
  </item>
</list>

<if condition="steps.length === 0">
  <note level="warning">No steps configured.</note>
</if>
```

---

## よく使うコンポーネント

| コンポーネント | 主な用途 | 主な属性 |
| --- | --- | --- |
| `<role>` | プロンプト冒頭のロール宣言 | `captionStyle="hidden|bold|plain"` など |
| `<task>` | メインタスク指示文 | `captionStyle`, `icon`, `charLimit` |
| `<section>` | 見出し付きのまとまり | `caption`, `captionStyle` |
| `<paragraph>` | 段落（Markdown の段落に相当） | なし |
| `<list>` | 箇条書き／順序付きリスト | `ordered="true"`, `for="item in ..."` |
| `<item>` | `<list>` の各要素 | なし |
| `<code>` | コード表現 | `language="bash"` など |
| `<example>` | 例示セクション | `captionStyle` |
| `<stepwiseInstructions>` | 手順解説セクション | `captionStyle` |
| `<note>` | 補足／注意書き | `level="info|warning|error"` |

> **Tip:** `<code>` は 1 行コード用。複数行コードを整形したいときは、コードブロック全体を ```` ```...``` ```` にするか、`<section>` 内に直接 Markdown のコードフェンスを記述します。

---

## include と再利用

- 部品化した POML を貼り付けるには `<include src="partials/step-list.poml" />`。
- `--baseDir` を指定して `npx pomljs --file ... --baseDir ./cc-flow-cli/templates` のように呼ぶと、テンプレート階層の相対パスが解決しやすくなります。

---

## 便利な `loop` プロパティ

- `loop.index` : 0 始まりのインデックス
- `loop.length`: ループ対象の長さ
- `loop.first` / `loop.last`: 真偽値
- `loop.parent`: 入れ子ループで外側ループにアクセスするときに使用

```xml
<list for="agent in workflowAgents">
  <item>
    {{loop.index + 1}} / {{loop.length}}: {{agent}}
    <if condition="!loop.last">
      <paragraph>Next agent queued…</paragraph>
    </if>
  </item>
</list>
```

---

## キャプションスタイルとアクセント

- `captionStyle` は `header` (既定) / `bold` / `plain` / `hidden` など。`hidden` は自動見出しを抑制できるため、Markdown で任意の見出し階層を制御したいときに便利。
- `<section caption="..." captionStyle="bold">` のように調整すると Markdown レベルが整います。

---

## 出力制御 & 制約

- `charLimit`, `tokenLimit`, `priority` などを各コンポーネントに付けてメッセージの制約を設定できます（v0.0.8 以降）。
- `<output-schema>` を使うと、最終レスポンス構造を明示的に定義できます（JSON Schema 風の記述）。

```xml
<output-schema>
  <object>
    <property name="summary" type="string" />
    <property name="steps" type="array" />
  </object>
</output-schema>
```

---

## `pomljs` コマンドラインの使い方

- ファイル変換: `npx pomljs --file ./templates/workflow.poml`
- 標準入力: `cat workflow.poml | npx pomljs`
- 変数注入（v0.0.8+）: `npx pomljs --file workflow.poml --var workflowName="demo" --var workflowAgents='["agent-a"]'`
- JSON 出力例:

```json
{
  "messages": [
    {
      "speaker": "human",
      "content": "...生成された Markdown..."
    }
  ]
}
```

---

## よくある落とし穴と対策

- **コンポーネント名の typo**: `codeblock` → `code` など、実装されていない名前を書くと `Component ... not found` で落ちます。
- **変数未定義**: 文字列置換時に `'` を含む値を渡す際は `\'` へエスケープするか、テンプレート側で JSON 文字列を評価させる（`value="'{WORKFLOW_NAME}'"` のようにダブルシングルで囲む）。
- **インデントと改行**: `<paragraph>` や `<list>` を使うことで余分な改行調整が不要になります。
- **外部依存**: CLI から実行する際は Node 18 以上と npm が必須。`check_nodejs_dependencies` などで事前に確認しておくと安全。

---

## 参考リンク

- POML 最新仕様: https://microsoft.github.io/poml/latest/
- `pomljs` npm パッケージ: https://github.com/microsoft/poml

> 仕様は 0.0.8 ベース。新バージョンではコンポーネントや属性が追加される可能性があるので、必要に応じて公式ドキュメントを確認してください。
