'use client';

/**
 * app/(dashboard)/progress/page.tsx
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, PenLine } from 'lucide-react';
import { getProgressSummary, subscribeToHistory } from '@/lib/firestore';
import type { ProgressSummary, GradingResultDoc } from '@/types/grading';
import { useGradingAuth } from '@/hooks/useGradingAuth';
import { useTranslation } from 'react-i18next';

// ── Helpers ──────────────────────────────────────────────────

function formatDate(d: Date, lang: string = 'vi'): string {
  return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
  });
}

function relevanceColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-400';
  if (rate >= 60) return 'text-amber-400';
  return 'text-red-400';
}

// ── Skeleton ─────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ''}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-indigo-500/10 p-6 mb-4 border border-indigo-500/20">
        <PenLine className="h-10 w-10 text-indigo-400" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        {t('progress.empty.title')}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        {t('progress.empty.subtitle')}
      </p>
      <Link
        href="/practice-list"
        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        {t('progress.empty.cta')}
      </Link>
    </div>
  );
}

// ── Section 1: Overview cards ─────────────────────────────────

function OverviewCards({ summary }: { summary: ProgressSummary }) {
  const { t } = useTranslation();
  const trendIcon =
    summary.trend === 'Improving' ? (
      <TrendingUp className="h-4 w-4 text-emerald-400" />
    ) : summary.trend === 'Declining' ? (
      <TrendingDown className="h-4 w-4 text-red-400" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );

  const trendLabel =
    summary.trend === 'Improving'
      ? `↗ +${summary.trendValue.toFixed(1)}`
      : summary.trend === 'Declining'
      ? `↘ ${summary.trendValue.toFixed(1)}`
      : t('progress.stats.trendStable');

  const cards = [
    {
      label: t('progress.stats.avgScore'),
      value: (
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-indigo-400">
            {summary.avgScore.toFixed(1)}
          </span>
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
            {summary.currentCefr}
          </span>
        </div>
      ),
      sub: summary.vstepComparison,
    },
    {
      label: t('progress.stats.totalSubmissions'),
      value: (
        <span className="text-3xl font-bold text-foreground">
          {summary.totalSubmissions}
        </span>
      ),
      sub: t('progress.stats.submissionsCount'),
    },
    {
      label: t('progress.stats.trend'),
      value: (
        <div className="flex items-center gap-2">
          {trendIcon}
          <span
            className={`text-2xl font-bold ${
              summary.trend === 'Improving'
                ? 'text-emerald-400'
                : summary.trend === 'Declining'
                ? 'text-red-400'
                : 'text-muted-foreground'
            }`}
          >
            {trendLabel}
          </span>
        </div>
      ),
      sub: t('progress.stats.trendComparison'),
    },
    {
      label: t('progress.stats.relevance'),
      value: (
        <span
          className={`text-3xl font-bold ${relevanceColor(summary.relevanceRate)}`}
        >
          {summary.relevanceRate.toFixed(0)}%
        </span>
      ),
      sub:
        summary.relevanceRate >= 80
          ? t('progress.stats.relevanceGood')
          : summary.relevanceRate >= 60
          ? t('progress.stats.relevanceImprove')
          : t('progress.stats.relevanceAttention'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-card shadow-sm p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {card.label}
          </p>
          <div className="mb-1">{card.value}</div>
          <p className="text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Section 2: Radar chart ────────────────────────────────────

function CriteriaRadar({ summary }: { summary: ProgressSummary }) {
  const { t } = useTranslation();
  const data = [
    { criterion: t('progress.radar.taskFulfilment'), value: summary.avgTaskFulfilment },
    { criterion: t('progress.radar.organization'), value: summary.avgOrganization },
    { criterion: t('progress.radar.vocabulary'), value: summary.avgVocabulary },
    { criterion: t('progress.radar.grammar'), value: summary.avgGrammar },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
      <h3 className="text-base font-semibold text-foreground mb-1">{t('progress.radar.title')}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius={80}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="criterion"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <Radar
            name="Điểm TB"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-xs text-red-400 text-center mt-1">
        {t('progress.radar.weakest')}:{' '}
        <span className="font-semibold">{summary.weakestCriterion}</span>
      </p>
    </div>
  );
}

// ── Section 3: Score history line chart ──────────────────────

interface HistoryChartProps {
  history: GradingResultDoc[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ColoredDot(props: any) {
  const { cx, cy, payload } = props;
  const color = payload?.isRelevant ? '#22c55e' : '#ef4444';
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#1e293b" strokeWidth={2} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  const { t, i18n } = useTranslation();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as GradingResultDoc;
  return (
    <div className="rounded-xl bg-card border border-border shadow-lg px-3 py-2 text-xs space-y-0.5">
      <p className="font-semibold text-foreground">{formatDate(d.gradedAt, i18n.language)}</p>
      <p>
        {t('progress.history.score')}:{' '}
        <span className="font-bold text-indigo-400">{d.totalScore.toFixed(1)}</span>
      </p>
      <p className="text-muted-foreground">{t('progress.history.cefr')}: {d.cefrLevel}</p>
      <p>
        {d.taskType === 'task1' ? t('practiceList.tabs.task1') : t('practiceList.tabs.task2')} —{' '}
        <span className={d.isRelevant ? 'text-emerald-400' : 'text-red-400'}>
          {d.isRelevant ? t('progress.history.relevant') : t('progress.history.offTopic')}
        </span>
      </p>
    </div>
  );
}

function ScoreHistoryChart({ history }: HistoryChartProps) {
  const { t, i18n } = useTranslation();
  const data = [...history]
    .reverse()
    .slice(-10)
    .map((h) => ({
      ...h,
      date: formatDate(h.gradedAt, i18n.language),
      score: h.totalScore,
    }));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        {t('progress.history.title')}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            dot={<ColoredDot />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Section 4: History table ──────────────────────────────────

function HistoryTable({ history }: { history: GradingResultDoc[] }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">
          {t('progress.history.tableTitle')}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left px-5 py-3">{t('progress.history.date')}</th>
              <th className="text-left px-5 py-3">{t('progress.history.task')}</th>
              <th className="text-left px-5 py-3">{t('progress.history.score')}</th>
              <th className="text-left px-5 py-3">{t('progress.history.cefr')}</th>
              <th className="text-left px-5 py-3">{t('progress.history.relevance')}</th>
              <th className="text-left px-5 py-3">{t('progress.history.details')}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-5 py-3 tabular-nums text-muted-foreground">
                  {formatDate(row.gradedAt, i18n.language)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.taskType === 'task1'
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-orange-500/15 text-orange-400'
                    }`}
                  >
                    {row.taskType === 'task1' ? t('practiceList.tabs.task1') : t('practiceList.tabs.task2')}
                  </span>
                </td>
                <td className="px-5 py-3 font-bold tabular-nums text-indigo-400">
                  {row.totalScore.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{row.cefrLevel}</td>
                <td className="px-5 py-3">
                  {row.isRelevant ? (
                    <span className="text-emerald-400 font-bold">✓</span>
                  ) : (
                    <span className="text-red-400 font-bold">✗</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/practice/${row.promptId}/result?id=${row.id}`}
                    className="text-indigo-400 hover:text-indigo-300 underline text-xs"
                  >
                    {t('progress.history.viewDetails')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function ProgressPage() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useGradingAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<GradingResultDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      try {
        const s = await getProgressSummary(user.uid);
        setSummary(s);
      } catch (err) {
        console.error('[ProgressPage] getProgressSummary error:', err);
      } finally {
        setDataLoading(false);
      }

      unsubscribe = subscribeToHistory(user.uid, (results) => {
        setHistory(results);
      });
    };

    void load();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, authLoading]);

  const isLoading = authLoading || dataLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('progress.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('progress.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !user ? (
        <div className="text-center py-10 text-muted-foreground">
          {t('progress.notLoggedIn')}
        </div>
      ) : history.length === 0 && !summary ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {summary && <OverviewCards summary={summary} />}

          {summary && history.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CriteriaRadar summary={summary} />
              <ScoreHistoryChart history={history} />
            </div>
          )}

          {history.length > 0 ? (
            <HistoryTable history={history} />
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
}
