import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { submissionService } from '../../services/submissionService';
import type { SubmissionHistoryItem } from '../../types/submission';
import { useAppSettings } from '../../context/AppSettingsContext';
import { extractApiErrorMessage } from '../../utils/apiError';

function normalizeMode(mode: string): string {
  const key = mode.trim().toLowerCase();
  if (!key) return 'Practice';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SubmissionHistoryScreen() {
  const { theme, t } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SubmissionHistoryItem[]>([]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.bg },
        content: { padding: 16, paddingBottom: 30, gap: 12 },
        centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
        loadingText: { marginTop: 12, color: theme.textMuted },
        errorBox: {
          margin: 16,
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.red[400],
          backgroundColor: theme.warnBoxBg,
        },
        errorTitle: { color: theme.warnTitle, fontWeight: '800', marginBottom: 6 },
        errorText: { color: theme.warnBody, lineHeight: 20 },
        card: {
          backgroundColor: theme.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 14,
        },
        title: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 8 },
        metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
        pill: {
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.border,
          paddingVertical: 4,
          paddingHorizontal: 10,
          backgroundColor: theme.bgMuted,
        },
        pillText: { fontSize: 12, fontWeight: '700', color: theme.textSecondary },
        details: { fontSize: 13, color: theme.textMuted, lineHeight: 20 },
        score: { color: theme.linkAccent, fontWeight: '800' },
        emptyBox: { margin: 16, padding: 16, borderRadius: 12, backgroundColor: theme.cardMuted },
        emptyText: { color: theme.textMuted, lineHeight: 20 },
      }),
    [theme]
  );

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await submissionService.getHistory(50);
      setItems(data);
    } catch (e: unknown) {
      setError(extractApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.brand} />
        <Text style={styles.loadingText}>{t('history_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>{t('common_error')}</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.submissionId}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('history_empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title} numberOfLines={2}>
              {item.questionTitle || item.questionId}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{item.taskType || 'Task'}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{normalizeMode(item.mode)}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{item.status || 'Unknown'}</Text>
              </View>
            </View>
            <Text style={styles.details}>
              {t('history_word_count')}: {item.wordCount} · {t('history_time')}:{' '}
              {formatCreatedAt(item.createdAt)}
            </Text>
            <Text style={styles.details}>
              {t('history_score')}:{' '}
              <Text style={styles.score}>
                {typeof item.overallScore === 'number' ? item.overallScore.toFixed(1) : '--'}
              </Text>
            </Text>
          </View>
        )}
      />
    </View>
  );
}
