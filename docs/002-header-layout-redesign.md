# 002: ヘッダーレイアウトの再設計

## 概要
monday.comを参考にしたヘッダーレイアウトの変更を実装する。

## 目的
- より直感的なビュー切り替え機能の提供
- モダンなUI/UXの実現
- 機能アクセスの最適化

## 現在の実装
- 右上にビュー切り替えボタン（カンバン・テーブル）
- 右上にログアウトボタン

## 変更後の実装

### 左上エリア
```typescript
// ビュー切り替えボタングループ
<ToggleButtonGroup>
  <ToggleButton value="kanban">
    <ViewKanbanIcon />
  </ToggleButton>
  <ToggleButton value="table">
    <TableChartIcon />
  </ToggleButton>
  <ToggleButton value="calendar">
    <CalendarMonthIcon />
  </ToggleButton>
</ToggleButtonGroup>
```

### 右上エリア
```typescript
// ユーザー情報・アクション
<Box>
  <Button>企業を追加</Button>
  <IconButton>
    <AccountCircleIcon />
  </IconButton>
  <IconButton>
    <LogoutIcon />
  </IconButton>
</Box>
```

## タスク一覧
- [ ] CalendarMonthアイコンをMaterial-UIからimport
- [ ] ビュー切り替えボタンを左上に移動
- [ ] カレンダービューのToggleButtonを追加  
- [ ] 右上にユーザー情報エリアを作成
- [ ] 企業追加ボタンを右上に移動
- [ ] 右下のFABボタンを削除
- [ ] ViewModeのtype定義に'calendar'を追加
- [ ] レスポンシブデザインの調整

## 影響範囲
- `src/pages/Dashboard.tsx`
- `src/types/index.ts` (ViewMode型)

## 備考
- カレンダービューの実装は別チケットで対応
- デザイン一貫性を保つためのスタイル調整が必要

## 優先度
**Phase 1 - 高優先度**

## 予想工数
**1-2日**