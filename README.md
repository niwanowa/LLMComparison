# LLM Comparison Tool

ToDo：スクショ

## デモアプリ URL

非公開（将来的には...）

## 概要

各種生成 AI へ質問を投げて出力される文章を比較するツールです。

## 対応モデル

- gpt-4o-mini
- gemini-1.5-flash
- Claude 3.5 Sonnet
- plamo

## 使用技術

- React 18.3.1
- TypeScript 5.5.3
- vite 5.4.1
- shadcn

## セットアップ

`src/model.json` に自身のもつ API キーを設定してください。

### 例

URL、API キー、アクセスキー、シークレットキーは置換が必要です。
空文字が設定されている項目はそのままで問題ないです。

<details>

<summary>src/model.json</summary>

```json
{
  "gpt-4o-mini": {
    "url": "https://api.openai.com/v1/chat/completions",
    "model": "gpt-4o-mini",
    "apiKey": "APIキー",
    "accessKey": "",
    "secretKey": ""
  },
  "plamo": {
    "url": "https://platform.preferredai.jp/api/completion/v1/chat/completions",
    "model": "plamo-beta",
    "apiKey": "APIキー",
    "accessKey": "",
    "secretKey": ""
  },
  "gemini-1.5-flash": {
    "url": "URL",
    "model": "",
    "apiKey": "APIキー",
    "accessKey": "",
    "secretKey": ""
  },
  "Claude 3.5 Sonnet": {
    "url": "URL",
    "model": "anthropic.claude-3-5-sonnet-20240620-v1:0",
    "apiKey": "",
    "accessKey": "アクセスキー",
    "secretKey": "シークレットキー"
  }
}
```

</details>

## 実行

```bash
npm install
npm run dev
```
