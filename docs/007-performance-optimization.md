# 007: パフォーマンス最適化

## 概要
アプリケーション全体のパフォーマンスを向上させる最適化を実装する。

## 目的
- ページロード時間の短縮
- ユーザーインタラクションの応答性向上
- メモリ使用量の最適化

## 最適化項目

### コンポーネント最適化
```typescript
// React.memo の活用
export const CompanyCard = React.memo(({ company, onEdit }: CompanyCardProps) => {
  // ...
});

// useMemo, useCallback の適切な使用
const filteredCompanies = useMemo(() => 
  companies.filter(company => company.status === selectedStatus),
  [companies, selectedStatus]
);
```

### データフェッチ最適化
- Supabaseクエリの最適化
- 不要なデータ取得の削減
- ページネーション実装
- キャッシュ機能の追加

### バンドルサイズ最適化
- Tree shakingの確認
- 不要なライブラリの削除
- Code splittingの実装
- Lazy loadingの追加

## タスク一覧
- [ ] React Developer Toolsでパフォーマンス分析
- [ ] 重いコンポーネントの特定と最適化
- [ ] メモ化が必要な計算処理の識別
- [ ] データベースクエリの最適化
- [ ] 画像最適化（企業ロゴ等）
- [ ] Bundle analyzerでバンドルサイズ分析
- [ ] Code splittingの実装
- [ ] Service Workerによるキャッシュ戦略
- [ ] パフォーマンス測定の自動化

## 測定指標

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: 2.5秒以下
- **FID (First Input Delay)**: 100ms以下  
- **CLS (Cumulative Layout Shift)**: 0.1以下

### カスタム指標
- 企業一覧表示時間: 1秒以下
- ビュー切り替え時間: 500ms以下
- 検索結果表示時間: 300ms以下

## 技術実装

### Lazy Loading
```typescript
// ルートレベルでのCode Splitting
const CalendarView = lazy(() => import('../components/CalendarView'));
const CompanyTable = lazy(() => import('../components/CompanyTable'));
```

### データキャッシュ
```typescript
// React Queryまたは独自キャッシュ実装
const { data: companies, isLoading } = useQuery(
  ['companies'],
  getCompanies,
  { staleTime: 5 * 60 * 1000 } // 5分間キャッシュ
);
```

## 影響範囲
- 全コンポーネント
- `src/services/supabase.ts`
- `src/hooks/` (新規キャッシュフック)
- `webpack.config.js` (設定変更)

## 備考
- 最適化前後の測定が重要
- ユーザー体験を損なわない範囲で実施

## 優先度
**Phase 3 - 低優先度**

## 予想工数
**2-3日**