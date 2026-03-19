'use client';

/**
 * app/(dashboard)/progress/page.tsx
 * Progress dashboard — 4 stacked sections:
 *  1. Overview cards
 *  2. Criteria radar chart (recharts)
 *  3. Score history line chart (recharts)
 *  4. History table (real-time Firestore)
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

// ── Helpers ──────────────────────────────────────────────────

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

function relevanceColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-600';
  if (rate >= 60) return 'text-amber-500';
  return 'text-red-500';
}

// ── Skeleton ─────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ''}`} />;
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
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-indigo-50 p-6 mb-4">
        <PenLine className="h-10 w-10 text-indigo-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Chưa có bài nào
      </h2>
      <p className="text-gray-500 mb-6 max-w-xs">
        Bắt đầu luyện tập ngay để theo dõi tiến độ của bạn!
      </p>
      <Link
        href="/practice"
        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Viết bài ngay
      </Link>
    </div>
  );
}

// ── Section 1: Overview cards ─────────────────────────────────

function OverviewCards({ summary }: { summary: ProgressSummary }) {
  const trendIcon =
    summary.trend === 'Improving' ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : summary.trend === 'Declining' ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <Minus className="h-4 w-4 text-gray-400" />
    );

  const trendLabel =
    summary.trend === 'Improving'
      ? `↗ +${summary.trendValue.toFixed(1)}`
      : summary.trend === 'Declining'
      ? `↘ ${summary.trendValue.toFixed(1)}`
      : '→ Ổn định';

  const cards = [
    {
      label: 'Điểm TB hiện tại',
      value: (
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-indigo-600">
            {summary.avgScore.toFixed(1)}
          </span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
            {summary.currentCefr}
          </span>
        </div>
      ),
      sub: summary.vstepComparison,
    },
    {
      label: 'Tổng bài đã nộp',
      value: (
        <span className="text-3xl font-bold text-gray-800">
          {summary.totalSubmissions}
        </span>
      ),
      sub: 'bài viết',
    },
    {
      label: 'Xu hướng',
      value: (
        <div className="flex items-center gap-2">
          {trendIcon}
          <span
            className={`text-2xl font-bold ${
              summary.trend === 'Improving'
                ? 'text-emerald-600'
                : summary.trend === 'Declining'
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {trendLabel}
          </span>
        </div>
      ),
      sub: 'so với 5 bài gần nhất',
    },
    {
      label: 'Bám đề',
      value: (
        <span
          className={`text-3xl font-bold ${relevanceColor(summary.relevanceRate)}`}
        >
          {summary.relevanceRate.toFixed(0)}%
        </span>
      ),
      sub:
        summary.relevanceRate >= 80
          ? 'Rất tốt'
          : summary.relevanceRate >= 60
          ? 'Cần cải thiện'
          : 'Cần chú ý',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {card.label}
          </p>
          <div className="mb-1">{card.value}</div>
          <p className="text-xs text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Section 2: Radar chart ────────────────────────────────────

function CriteriaRadar({ summary }: { summary: ProgressSummary }) {
  const data = [
    { criterion: 'Hoàn thành\nnhiệm vụ', value: summary.avgTaskFulfilment },
    { criterion: 'Tổ chức', value: summary.avgOrganization },
    { criterion: 'Từ vựng', value: summary.avgVocabulary },
    { criterion: 'Ngữ pháp', value: summary.avgGrammar },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-1">Năng lực 4 tiêu chí</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius={80}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="criterion"
            tick={{ fontSize: 11, fill: '#6b7280' }}
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
      <p className="text-xs text-red-500 text-center mt-1">
        Tiêu chí yếu nhất:{' '}
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
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as GradingResultDoc;
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-lg px-3 py-2 text-xs space-y-0.5">
      <p className="font-semibold text-gray-800">{formatDate(d.gradedAt)}</p>
      <p>
        Điểm:{' '}
        <span className="font-bold text-indigo-600">{d.totalScore.toFixed(1)}</span>
      </p>
      <p>CEFR: {d.cefrLevel}</p>
      <p>
        {d.taskType === 'task1' ? 'Task 1' : 'Task 2'} —{' '}
        <span className={d.isRelevant ? 'text-emerald-600' : 'text-red-500'}>
          {d.isRelevant ? 'Bám đề' : 'Lạc đề'}
        </span>
      </p>
    </div>
  );
}

function ScoreHistoryChart({ history }: HistoryChartProps) {
  const data = [...history]
    .reverse()
    .slice(-10)
    .map((h) => ({
      ...h,
      date: formatDate(h.gradedAt),
      score: h.totalScore,
    }));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Lịch sử điểm (10 bài gần nhất)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
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
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">
          10 bài gần nhất
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <th className="text-left px-5 py-3">Ngày</th>
              <th className="text-left px-5 py-3">Task</th>
              <th className="text-left px-5 py-3">Điểm</th>
              <th className="text-left px-5 py-3">CEFR</th>
              <th className="text-left px-5 py-3">Bám đề</th>
              <th className="text-left px-5 py-3">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr
                key={row.docId}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3 tabular-nums text-gray-600">
                  {formatDate(row.gradedAt)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.taskType === 'task1'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {row.taskType === 'task1' ? 'Task 1' : 'Task 2'}
                  </span>
                </td>
                <td className="px-5 py-3 font-bold tabular-nums text-indigo-600">
                  {row.totalScore.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-gray-600">{row.cefrLevel}</td>
                <td className="px-5 py-3">
                  {row.isRelevant ? (
                    <span className="text-emerald-600 font-bold">✓</span>
                  ) : (
                    <span className="text-red-500 font-bold">✗</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/practice/result/${row.docId}`}
                    className="text-indigo-500 hover:text-indigo-700 underline text-xs"
                  >
                    Xem chi tiết
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

      // Real-time history listener
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
        <h1 className="text-3xl font-bold text-gray-900">Tiến độ của bạn</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Theo dõi điểm số và tiến bộ theo thời gian.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !user ? (
        <div className="text-center py-10 text-gray-400">
          Vui lòng đăng nhập để xem tiến độ.
        </div>
      ) : history.length === 0 && !summary ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Section 1 — Overview cards */}
          {summary && <OverviewCards summary={summary} />}

          {/* Section 2 + 3 — Charts side by side on lg */}
          {summary && history.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CriteriaRadar summary={summary} />
              <ScoreHistoryChart history={history} />
            </div>
          )}

          {/* Section 4 — History table */}
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

