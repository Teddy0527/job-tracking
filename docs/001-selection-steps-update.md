# 001: 選考ステップ構成の変更

## 概要
現在の5段階の選考ステップを4段階に変更し、より直感的な管理を実現する。

## 目的
- 選考ステップの簡略化によるユーザビリティ向上
- より実際の就活プロセスに即した分類の提供

## 現在の実装
```typescript
export const SELECTION_STEPS = [
  { id: 1, name: 'ES提出', progress: 20 },
  { id: 2, name: '書類選考', progress: 40 },
  { id: 3, name: '一次面接', progress: 60 },
  { id: 4, name: '最終面接', progress: 80 },
  { id: 5, name: '内定', progress: 100 },
] as const;
```

## 変更後の実装
```typescript
export const SELECTION_STEPS = [
  { id: 1, name: '検討中', progress: 0 },
  { id: 2, name: 'ES提出済み', progress: 25 },
  { id: 3, name: '選考中（書類・適性検査）', progress: 50 },
  { id: 4, name: '選考中（面接）', progress: 75 },
  { id: 5, name: '内定獲得', progress: 100 },
] as const;
```

## タスク一覧
- [ ] `src/types/index.ts`のSELECTION_STEPSを更新
- [ ] 既存データのマイグレーション戦略を検討
- [ ] KanbanBoardコンポーネントの表示テキスト更新
- [ ] CompanyTableコンポーネントの表示テキスト更新
- [ ] データベーススキーマの変更（必要に応じて）
- [ ] テストケースの更新

## 影響範囲
- `src/types/index.ts`
- `src/components/KanbanBoard.tsx`
- `src/components/CompanyTable.tsx`
- `src/components/CompanyDialog.tsx`
- データベース：`companies`テーブル

## 備考
- 既存ユーザーのデータ移行が必要
- 進捗率の再計算が必要

## 優先度
**Phase 1 - 高優先度**

## 予想工数
**2-3日**