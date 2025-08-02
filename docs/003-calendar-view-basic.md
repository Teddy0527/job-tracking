# 003: カレンダービューの基本実装

## 概要
新しいビューモードとしてカレンダー表示機能を追加する。

## 目的
- 第3のビューモードとしてカレンダー表示を提供
- 時系列での企業管理を可能にする
- 将来のGoogleカレンダー連携の基盤を構築

## 実装詳細

### 新規コンポーネント作成
```typescript
// src/components/CalendarView.tsx
interface CalendarViewProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onRefresh: () => void;
}
```

### 基本機能
- 月表示のカレンダーUI
- 企業の応募日・更新日を表示
- 日付クリックで企業一覧表示
- 企業カードクリックで編集ダイアログ表示

## タスク一覧
- [ ] CalendarViewコンポーネントを作成
- [ ] 月表示のカレンダーUIを実装
- [ ] 企業データの日付ベース表示ロジック実装
- [ ] Dashboard.tsxにカレンダービューを統合
- [ ] ビューモード切り替え時の状態管理
- [ ] カレンダー表示用のスタイリング
- [ ] レスポンシブデザイン対応
- [ ] エラーハンドリングの実装

## 技術詳細
- Material-UIのDatePickerまたは独自実装を検討
- react-big-calendarライブラリの使用も検討
- 既存のコンポーネント（CompanyCard）の再利用

## 影響範囲
- `src/components/CalendarView.tsx` (新規)
- `src/pages/Dashboard.tsx`
- `src/types/index.ts`

## 備考
- 初期実装では基本的な月表示のみ
- Googleカレンダー連携は次のPhaseで実装

## 優先度
**Phase 1 - 高優先度**

## 予想工数
**3-4日**