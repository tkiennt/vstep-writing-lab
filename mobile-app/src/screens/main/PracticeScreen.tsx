import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { examPromptService } from '../../services/examPromptService';
import type { ExamPrompt } from '../../types/exam';
import { compactApiUrl, config } from '../../config/env';
import type { PracticeStackParamList } from '../../navigation/types';
import { useAppSettings } from '../../context/AppSettingsContext';
import { interpolate } from '../../i18n/translations';

type Nav = NativeStackNavigationProp<PracticeStackParamList, 'PracticeList'>;

type TabKey = 'all' | 'task1' | 'task2';

export default function PracticeScreen() {
  const navigation = useNavigation<Nav>();
  const { theme, t } = useAppSettings();
  const [prompts, setPrompts] = useState<ExamPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, backgroundColor: theme.bg },
        centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.bg,
        },
        hint: { marginTop: 10, color: theme.textMuted, fontSize: 14 },
        lead: {
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 20,
        },
        tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
        tab: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        },
        tabOn: { backgroundColor: theme.brand, borderColor: theme.brand },
        tabText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
        tabTextOn: { color: '#fff' },
        searchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 16,
          marginBottom: 8,
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 12,
        },
        searchIcon: { marginRight: 6 },
        search: { flex: 1, paddingVertical: 10, fontSize: 15, color: theme.text },
        err: { color: theme.red[500], paddingHorizontal: 20, marginBottom: 6, fontSize: 13 },
        list: { paddingHorizontal: 16, paddingBottom: 24 },
        card: {
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 18,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: theme.borderLight,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.25 : 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        badge: {
          alignSelf: 'flex-start',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          marginBottom: 10,
        },
        badgeB1: {
          backgroundColor: theme.badgeB1Bg,
          borderWidth: 1,
          borderColor: theme.badgeB1Border,
        },
        badgeB2: {
          backgroundColor: theme.badgeB2Bg,
          borderWidth: 1,
          borderColor: theme.badgeB2Border,
        },
        badgeC1: {
          backgroundColor: theme.badgeC1Bg,
          borderWidth: 1,
          borderColor: theme.badgeC1Border,
        },
        badgeText: { fontSize: 10, fontWeight: '800', color: theme.text },
        cardTitle: { fontSize: 17, fontWeight: '800', color: theme.text, marginBottom: 6 },
        taskPill: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.linkAccent,
          marginBottom: 8,
        },
        cardDesc: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
        cardFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: theme.borderLight,
        },
        tapHint: { fontSize: 13, fontWeight: '600', color: theme.linkAccent },
        empty: { textAlign: 'center', color: theme.textMuted, padding: 24, fontSize: 14 },
      }),
    [theme]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await examPromptService.getAll();
      setPrompts(Array.isArray(data) ? data.filter((p) => p.isActive !== false) : []);
    } catch (e) {
      const base = compactApiUrl(config.API_BASE_URL);
      const net =
        axios.isAxiosError(e) && !e.response ? ` (${e.message || 'Network'})` : '';
      setError(
        interpolate(t('practice_load_error'), {
          net,
          apiUrl: base,
        })
      );
      setPrompts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const tt = (p.taskType || '').toLowerCase();
      if (tab === 'task1' && tt !== 'task1') return false;
      if (tab === 'task2' && tt !== 'task2') return false;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        return (
          p.instruction.toLowerCase().includes(s) ||
          p.topicKeyword.toLowerCase().includes(s) ||
          p.topicCategory.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [prompts, tab, search]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const levelStyle = (level: string) => {
    const L = level.toUpperCase();
    if (L === 'B1') return styles.badgeB1;
    if (L === 'B2') return styles.badgeB2;
    return styles.badgeC1;
  };

  const renderItem = ({ item }: { item: ExamPrompt }) => {
    const isT1 = item.taskType.toLowerCase() === 'task1';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('PracticeModeSelect', { examId: item.id, exam: item })
        }
      >
        <View style={[styles.badge, levelStyle(item.cefrLevel)]}>
          <Text style={styles.badgeText}>VSTEP {item.cefrLevel}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.topicKeyword || t('practice_default_topic')}
        </Text>
        <Text style={styles.taskPill}>
          {isT1 ? t('practice_task_pill1') : t('practice_task_pill2')}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.instruction}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.tapHint}>{t('practice_tap_hint')}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.linkAccent} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.brand} />
        <Text style={styles.hint}>{t('practice_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.lead}>{t('practice_lead')}</Text>

      <View style={styles.tabs}>
        {(['all', 'task1', 'task2'] as const).map((k) => (
          <TouchableOpacity
            key={k}
            style={[styles.tab, tab === k && styles.tabOn]}
            onPress={() => setTab(k)}
          >
            <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>
              {k === 'all' ? t('practice_all') : k === 'task1' ? t('practice_task1') : t('practice_task2')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder={t('practice_search_ph')}
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{error ? '' : t('practice_empty')}</Text>
        }
      />
    </View>
  );
}
