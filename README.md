# typescript-nestjs-prisma-jest

npx prisma migrate dev

npm run start:dev
npm run test:cov
npm run test:e2e

課題
管理画面
ロール機能
フォローイング機能
チーム機能
Zod


抽象コントローラはパブリックとガード等専用に作った方がよさそう

マイクロポストの実装は中断



ユーザー詳細テーブルは後回し

管理機能
ロール機能を意識

ユーザー詳細テーブル対応

http://localhost:3000/admin/users
モーダル ポップアップ ロール選択

チーム機能
どうせならフォローイングシステムも作る


UserRoleのレスポンスを修正

    "userRoles": [
      "admin",
      "read_only_admin",
      "general"
    ]