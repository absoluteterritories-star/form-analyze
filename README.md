# フォーム解析ラボ

投球・打撃フォームをブラウザだけで解析します。動画は端末の外に送信されません。

## 使い方

**まず `manual.html`（説明書）を読んでください。** 撮り方から数値の読みかたまで、
必要なことは全部そこに書いてあります。

## 中身

| ファイル | 内容 |
|---|---|
| `index.html` | 入口 |
| `manual.html` | **説明書** |
| `pitching-analyzer.html` | 投球動作解析 Ver.1 |
| `batting-analyzer.html` | 打撃動作解析 Ver.1A |
| `formanalyzer.html` | 旧版（投球／打撃 切替式） |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | オフライン動作とホーム画面追加のため |
| `docs/` | 測定仕様書 |

## 置きかた

`https://` で配信してください（`file://` では Service Worker とカメラ関連が動きません）。
GitHub Pages なら、このフォルダの中身をリポジトリ直下か `docs/` に置き、
Settings → Pages で公開ブランチを指定するだけです。
