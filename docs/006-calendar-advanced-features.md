# 006: カレンダー機能の拡張

## 概要
基本的なカレンダー表示に加えて、高度な機能を追加する。

## 目的
- カレンダービューの使いやすさ向上
- より詳細なスケジュール管理
- ユーザー体験の最適化

## 拡張機能

### 複数ビューモード
- 月表示（デフォルト）
- 週表示
- 日表示
- アジェンダ表示

### インタラクション機能
- カレンダーから直接企業編集
- ドラッグ&ドロップでの日程変更
- 右クリックコンテキストメニュー
- キーボードショートカット

### フィルタリング・検索
- 企業別フィルター
- 選考ステップ別フィルター
- 日付範囲指定
- キーワード検索

## タスク一覧
- [ ] 週表示・日表示の実装
- [ ] ビュー切り替えUI追加
- [ ] ドラッグ&ドロップ機能実装
- [ ] フィルター機能の追加
- [ ] 検索機能の実装
- [ ] コンテキストメニューの実装
- [ ] キーボードショートカット対応
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ対応

## 技術詳細

### カレンダーライブラリ
```typescript
// react-big-calendar または @mui/x-date-pickers を使用
import { Calendar } from 'react-big-calendar';

// カスタムイベントレンダラー
const EventComponent = ({ event }: { event: CalendarEvent }) => (
  <div className="calendar-event">
    <span>{event.title}</span>
    <CompanyChip company={event.company} />
  </div>
);
```

### フィルター機能
```typescript
interface CalendarFilters {
  companies: string[];
  steps: number[];
  dateRange: { start: Date; end: Date };
  keywords: string;
}
```

## 影響範囲
- `src/components/CalendarView.tsx`
- `src/components/CalendarFilters.tsx` (新規)
- `src/hooks/useCalendarFilters.ts` (新規)

## 備考
- アクセシビリティ対応は重要
- モバイル対応も考慮

## 優先度
**Phase 3 - 低優先度**

## 予想工数
**3-4日**