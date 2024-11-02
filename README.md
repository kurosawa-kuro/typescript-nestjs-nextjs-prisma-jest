# typescript-nestjs-prisma-jest

ユーザー詳細からのフォロー、アンフォロー

いいねの完全非同期化

ロール付与機能の改善

ここまでできたらテーブルのカラム名の見直し
型の見直し

管理画面のランキングをタブで格好よく表示



# プロジェクトタスク整理

## 1. インフラ/基盤関連
- [ ] テストカバレッジ設定の見直し
  - カバレッジ目標の設定
  - テスト範囲の再定義
  - CI/CDパイプラインの調整

## 2. ユーザー画面機能実装
### 2.1 カテゴリー機能
- [ ] カテゴリー基本実装
  - カテゴリーCRUD
  - UI/UXデザイン
  - データベース設計

### 2.2 並び替え機能
- [ ] 以下の並び替え機能の実装
  - MostView順
  - いいね数順
  - 作成日時順
  - ソート条件の永続化
  - パフォーマンス最適化

## 3. 管理画面機能強化
### 3.1 権限管理
- [ ] ロール付与機能の改善
  - 三役全体の権限調整
  - 権限マトリックスの整備
  - 権限変更履歴の管理

### 3.2 データ管理・分析
- [ ] CSVエクスポート機能
- [ ] 各種ランキング機能実装
  - いいねランキング
  - コメントランキング
  - カテゴリーランキング

### 3.3 技術改善
- [ ] Swagger実装
  - API仕様書の自動生成
  - エンドポイントのドキュメント化
- [ ] 画像投稿処理のリファクタリング
  - フック処理の分離
  - エラーハンドリングの改善
- [ ] ローディング処理の改善
  - UXの向上
  - パフォーマンス最適化

## 優先度提案
1. 高優先度
   - テストカバレッジ設定（品質担保の基盤）
   - カテゴリー基本実装（他機能の前提）
   - ロール付与機能（セキュリティ関連）

2. 中優先度
   - 並び替え機能群
   - Swagger実装
   - ランキング機能群

3. 低優先度
   - CSVエクスポート
   - ローディング処理改善
   - 画像投稿フック分離

# デザイン改善 モーション レスポンシブ