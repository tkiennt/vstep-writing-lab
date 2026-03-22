import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import type { FullAnalysisResponse, InlineHighlightDto } from '../../types/gradingApi';
import { useAppSettings } from '../../context/AppSettingsContext';
import type { SemanticTheme } from '../../theme/semanticTheme';
import { interpolate, type TranslationDict } from '../../i18n/translations';

function criteriaFor(theme: SemanticTheme, t: (k: keyof TranslationDict) => string) {
  const dark = theme.isDark;
  return [
    {
      key: 'taskFulfilment' as const,
      label: t('grading_criterion_tf'),
      accent: '#2563eb',
      bg: dark ? '#172554' : '#eff6ff',
    },
    {
      key: 'organization' as const,
      label: t('grading_criterion_org'),
      accent: '#ea580c',
      bg: dark ? '#431407' : '#fff7ed',
    },
    {
      key: 'vocabulary' as const,
      label: t('grading_criterion_vocab'),
      accent: '#9333ea',
      bg: dark ? '#3b0764' : '#faf5ff',
    },
    {
      key: 'grammar' as const,
      label: t('grading_criterion_gr'),
      accent: '#059669',
      bg: dark ? '#064e3b' : '#ecfdf5',
    },
  ];
}

function HighlightedEssay({
  text,
  highlights,
  theme,
}: {
  text: string;
  highlights: InlineHighlightDto[];
  theme: SemanticTheme;
}) {
  const nodes = useMemo(() => {
    if (!text?.trim()) return [<Text key="empty">—</Text>];
    if (!highlights?.length) {
      return [<Text key="full">{text}</Text>];
    }
    const placed = highlights
      .map((h) => ({ h, i: text.indexOf(h.quote) }))
      .filter((x) => x.i >= 0 && x.h.quote.length > 0)
      .sort((a, b) => a.i - b.i);

    const out: React.ReactNode[] = [];
    let cursor = 0;
    placed.forEach(({ h, i }, idx) => {
      if (i > cursor) {
        out.push(
          <Text key={`t-${idx}-${cursor}`} selectable>
            {text.slice(cursor, i)}
          </Text>
        );
      }
      const isStrength = h.type?.toLowerCase() === 'strength';
      const lineColor = isStrength ? theme.emerald[500] : theme.red[400];
      out.push(
        <Text
          key={`h-${idx}-${i}`}
          selectable
          style={{
            textDecorationLine: 'underline',
            textDecorationColor: lineColor,
            color: theme.text,
            backgroundColor: isStrength ? (theme.isDark ? '#064e3b' : theme.emerald[50]) : (theme.isDark ? '#450a0a' : theme.red[50]),
          }}
        >
          {h.quote}
        </Text>
      );
      cursor = i + h.quote.length;
    });
    if (cursor < text.length) {
      out.push(
        <Text key={`tail-${cursor}`} selectable>
          {text.slice(cursor)}
        </Text>
      );
    }
    return out.length ? out : [<Text key="full2">{text}</Text>];
  }, [text, highlights, theme]);

  return (
    <Text style={{ fontSize: 15, lineHeight: 24, color: theme.textSecondary }} selectable>
      {nodes}
    </Text>
  );
}

function makeGradingStyles(theme: SemanticTheme) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: theme.bg },
    scrollContent: { padding: 20, paddingBottom: 48 },
    kicker: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textMuted,
      letterSpacing: 1.2,
      marginBottom: 14,
      textTransform: 'uppercase',
    },
    criteriaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
    criterionCard: {
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    criterionAccent: {
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 8,
      lineHeight: 15,
    },
    criterionScore: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.text,
    },
    criterionMax: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textMuted,
    },
    banner: {
      backgroundColor: theme.brand,
      borderRadius: 20,
      padding: 18,
      marginBottom: 18,
    },
    bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    scoreCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    scoreCircleNum: { fontSize: 28, fontWeight: '900', color: '#fff' },
    bannerTextCol: { flex: 1 },
    bannerTitle: { fontSize: 17, fontWeight: '900', color: '#fff', marginBottom: 4 },
    bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
    bannerCefr: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    badgeRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
    levelBadge: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    levelBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    warnBox: {
      backgroundColor: theme.warnBoxBg,
      borderWidth: 1,
      borderColor: theme.warnBoxBorder,
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
    },
    warnTitle: { fontWeight: '800', color: theme.warnTitle, marginBottom: 6, fontSize: 13 },
    warnItem: { fontSize: 13, color: theme.warnBody, marginBottom: 4, lineHeight: 20 },
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textMuted,
      letterSpacing: 0.8,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    essayCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    legend: {
      marginTop: 10,
      fontSize: 11,
      color: theme.textMuted,
    },
    paleCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    bullet: { fontSize: 14, lineHeight: 22, color: theme.textSecondary, marginBottom: 6 },
    bulletGood: { fontSize: 14, lineHeight: 22, color: theme.emerald[500], marginBottom: 6 },
    roadmapCard: {
      backgroundColor: theme.brand,
      borderRadius: 16,
      padding: 16,
    },
    roadmapMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 12, fontWeight: '600' },
    roadmapWeek: { marginBottom: 14 },
    roadmapWeekTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 6 },
    roadmapTask: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 20, marginLeft: 4 },
    modelFoot: { fontSize: 10, color: theme.textMuted, marginBottom: 16, textAlign: 'center' },
    primaryBtn: {
      backgroundColor: theme.brand,
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
}

export interface GradingResultViewProps {
  result: FullAnalysisResponse;
  essayText: string;
  taskLabel: string;
  onClose: () => void;
}

export function GradingResultView({
  result,
  essayText,
  taskLabel,
  onClose,
}: GradingResultViewProps) {
  const { width } = useWindowDimensions();
  const { theme, t } = useAppSettings();
  const styles = useMemo(() => makeGradingStyles(theme), [theme]);
  const CRITERIA = useMemo(() => criteriaFor(theme, t), [theme, t]);

  const cardGap = 10;
  const cardW = (width - 40 - cardGap) / 2;

  const rel = result.relevance;
  const roadmap = result.roadmap;
  const roadmapPreview = roadmap?.weeklyPlan?.slice(0, 4) ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>{t('grading_kicker')}</Text>

      <View style={styles.criteriaGrid}>
        {CRITERIA.map((c) => {
          const sc = result[c.key]?.score ?? 0;
          return (
            <View key={c.key} style={[styles.criterionCard, { width: cardW, backgroundColor: c.bg }]}>
              <Text style={[styles.criterionAccent, { color: c.accent }]} numberOfLines={2}>
                {c.label}
              </Text>
              <Text style={styles.criterionScore}>
                {Number(sc).toFixed(1)}
                <Text style={styles.criterionMax}>/10</Text>
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreCircleNum}>{Number(result.totalScore).toFixed(1)}</Text>
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>{t('grading_total_title')}</Text>
            <Text style={styles.bannerSub}>
              {t('grading_task_type')}: {taskLabel}
            </Text>
            <Text style={styles.bannerCefr}>
              {t('grading_cefr')}: {result.cefrLevel}
            </Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{result.cefrLevel}</Text>
          </View>
        </View>
      </View>

      {rel && !rel.isRelevant && (
        <View style={styles.warnBox}>
          <Text style={styles.warnTitle}>{t('grading_warn_title')}</Text>
          {rel.missingPoints?.map((m, i) => (
            <Text key={i} style={styles.warnItem}>
              • {m}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('grading_essay_graded')}</Text>
        <View style={styles.essayCard}>
          <HighlightedEssay text={essayText} highlights={result.inlineHighlights ?? []} theme={theme} />
        </View>
        <Text style={styles.legend}>{t('grading_legend')}</Text>
      </View>

      {result.strengthsVi?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('grading_strengths')}</Text>
          <View style={styles.paleCard}>
            {result.strengthsVi.map((s, i) => (
              <Text key={i} style={styles.bulletGood}>
                ✓ {s}
              </Text>
            ))}
          </View>
        </View>
      )}

      {result.improvementsVi?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('grading_improve')}</Text>
          <View style={styles.paleCard}>
            {result.improvementsVi.map((s, i) => (
              <Text key={i} style={styles.bullet}>
                • {s}
              </Text>
            ))}
          </View>
        </View>
      )}

      {roadmap && roadmapPreview.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('grading_roadmap')}</Text>
          <View style={styles.roadmapCard}>
            <Text style={styles.roadmapMeta}>
              {roadmap.currentLevel} → {roadmap.targetLevel} · ~{roadmap.estimatedWeeks}{' '}
              {t('grading_weeks_unit')}
            </Text>
            {roadmapPreview.map((w, i) => (
              <View key={i} style={styles.roadmapWeek}>
                <Text style={styles.roadmapWeekTitle}>
                  {interpolate(t('grading_week_header'), { week: w.week, focus: w.focus })}
                </Text>
                {w.tasks?.slice(0, 3).map((task, j) => (
                  <Text key={j} style={styles.roadmapTask}>
                    – {task}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {result.modelUsed ? (
        <Text style={styles.modelFoot}>
          {t('grading_model')}: {result.modelUsed}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>{t('grading_back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
