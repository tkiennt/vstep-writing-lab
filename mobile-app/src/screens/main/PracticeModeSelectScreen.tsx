import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { PracticeStackParamList } from '../../navigation/types';
import type { PracticeSessionMode } from '../../types/practiceMode';
import { useAppSettings } from '../../context/AppSettingsContext';
import { colors } from '../../theme/colors';

type Nav = NativeStackNavigationProp<PracticeStackParamList, 'PracticeModeSelect'>;
type R = RouteProp<PracticeStackParamList, 'PracticeModeSelect'>;

export default function PracticeModeSelectScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { examId, exam } = route.params;
  const { theme, t } = useAppSettings();

  const modes = useMemo(
    () =>
      [
        {
          id: 'guided' as const,
          title: 'Guided',
          subtitle: t('mode_guided_sub'),
          bullets: [t('mode_guided_b0'), t('mode_guided_b1'), t('mode_guided_b2')],
          icon: 'book-outline' as const,
          accent: theme.linkAccent,
          bg: theme.isDark ? '#064e3b' : colors.emerald[50],
        },
        {
          id: 'practice' as const,
          title: 'Practice',
          subtitle: t('mode_practice_sub'),
          bullets: [t('mode_practice_b0'), t('mode_practice_b1'), t('mode_practice_b2')],
          icon: 'create-outline' as const,
          accent: theme.brand,
          bg: theme.isDark ? '#14532d' : '#e8f5f0',
        },
        {
          id: 'exam' as const,
          title: 'Exam',
          subtitle: t('mode_exam_sub'),
          bullets: [t('mode_exam_b0'), t('mode_exam_b1'), t('mode_exam_b2')],
          icon: 'timer-outline' as const,
          accent: '#f59e0b',
          bg: theme.isDark ? '#422006' : '#fffbeb',
        },
      ] as const,
    [t, theme]
  );

  const title = exam?.topicKeyword?.trim() || t('practice_default_topic');
  const isT1 = (exam?.taskType || '').toLowerCase() === 'task1';

  const choose = (mode: PracticeSessionMode) => {
    navigation.navigate('PracticeWrite', { examId, exam, mode });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, backgroundColor: theme.bg },
        content: { padding: 20, paddingBottom: 40 },
        lead: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 8,
        },
        topic: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 6 },
        meta: { fontSize: 13, color: theme.linkAccent, fontWeight: '600', marginBottom: 20 },
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 2,
          borderColor: theme.border,
          gap: 12,
        },
        iconWrap: {
          width: 56,
          height: 56,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        },
        cardBody: { flex: 1 },
        cardTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
        cardSubtitle: { fontSize: 12, fontWeight: '700', marginTop: 2, marginBottom: 8 },
        bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
        bulletDot: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
        bulletText: { flex: 1, fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
        backBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 16,
          paddingVertical: 12,
        },
        backText: { fontSize: 15, fontWeight: '600', color: theme.textSecondary },
      }),
    [theme]
  );

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>{t('mode_lead')}</Text>
      <Text style={styles.topic} numberOfLines={3}>
        {title}
      </Text>
      <Text style={styles.meta}>
        {isT1 ? t('practice_task_pill1') : t('practice_task_pill2')}
        {exam?.cefrLevel ? ` · VSTEP ${exam.cefrLevel}` : ''}
      </Text>

      {modes.map((m) => {
        // Practice: brand (#123524) quá tối trên card tối — dùng linkAccent cho dòng phụ
        const subtitleColor =
          m.id === 'practice' && theme.isDark ? theme.linkAccent : m.accent;
        return (
          <TouchableOpacity
            key={m.id}
            style={[styles.card, { borderColor: m.bg }]}
            activeOpacity={0.88}
            onPress={() => choose(m.id)}
          >
            <View style={[styles.iconWrap, { backgroundColor: m.bg }]}>
              <Ionicons name={m.icon} size={28} color={m.accent} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{m.title}</Text>
              <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>{m.subtitle}</Text>
              {m.bullets.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.textMuted} />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
        <Text style={styles.backText}>{t('mode_back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
