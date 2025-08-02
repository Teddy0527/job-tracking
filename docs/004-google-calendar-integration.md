# 004: Googleカレンダー連携機能

## 概要
Google Calendar APIを使用して就活関連イベントを表示・管理する機能を実装する。

## 目的
- 就活スケジュールの一元管理
- ES締切、面接日程等の自動表示
- 既存Googleカレンダーとの統合

## 技術要件

### Google Calendar API連携
```typescript
// Google Calendar API設定
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
```

### データ構造
```typescript
interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  description?: string;
  companyId?: string; // 企業との紐付け
}
```

## タスク一覧
- [ ] Google Cloud Consoleでプロジェクト・API設定
- [ ] Google Calendar APIのクライアント実装
- [ ] OAuth認証フローの実装
- [ ] 就活関連イベントのフィルタリングロジック
- [ ] カレンダーイベントと企業データの紐付け機能
- [ ] イベント表示UI（CalendarViewに統合）
- [ ] エラーハンドリング（API制限等）
- [ ] 認証状態の管理
- [ ] データキャッシュ機能

## 実装詳細

### フィルタリング条件
就活関連キーワード：
- "面接", "選考", "ES", "エントリーシート"
- "説明会", "インターン", "適性検査"
- "webテスト", "締切"

### セキュリティ考慮事項
- 最小限の権限（readonly）
- APIキーの環境変数管理
- エラー時の適切なフォールバック

## 影響範囲
- `src/services/googleCalendar.ts` (新規)
- `src/components/CalendarView.tsx`
- `src/hooks/useGoogleCalendar.ts` (新規)
- 環境変数設定

## 備考
- Google Cloud Consoleでの事前設定が必要
- API使用制限への対応が必要

## 優先度
**Phase 2 - 中優先度**

## 予想工数
**4-5日**