import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useAppSelector } from '../../store/hooks';
import { examPromptService } from '../../services/examPromptService';
import { gradingService } from '../../services/gradingService';
import type { ExamPrompt, OutlineStep } from '../../types/exam';
import type { FullAnalysisResponse } from '../../types/gradingApi';
import { GradingResultView } from '../../components/grading/GradingResultView';
import type { SemanticTheme } from '../../theme/semanticTheme';
import { compactApiUrl, config } from '../../config/env';
import type { PracticeStackParamList } from '../../navigation/types';
import type { PracticeSessionMode } from '../../types/practiceMode';
import { extractApiErrorMessage } from '../../utils/apiError';
import { Ionicons } from '@expo/vector-icons';
import {
  TASK1_CHECKLIST,
  TASK2_CHECKLIST,
  GUIDED_PHRASES,
  GUIDED_TIPS_VI,
  GUIDED_TIPS_EN,
} from '../../constants/guidedWriting';
import { useAppSettings } from '../../context/AppSettingsContext';
import { interpolate } from '../../i18n/translations';
import type { AppLanguage } from '../../i18n/translations';

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type Nav = NativeStackNavigationProp<PracticeStackParamList, 'PracticeWrite'>;
type R = RouteProp<PracticeStackParamList, 'PracticeWrite'>;

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function makePracticeWriteStyles(theme: SemanticTheme) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: theme.bg },
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.bg,
    },
    loadingText: { marginTop: 12, color: theme.textMuted },
    modeBanner: {
      backgroundColor: theme.brand,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      marginBottom: 14,
      alignSelf: 'flex-start',
    },
    modeBannerText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    examTimerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.examBannerBg,
      borderWidth: 1,
      borderColor: theme.examBannerBorder,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 14,
    },
    examTimerLabel: { fontSize: 13, fontWeight: '700', color: theme.examBannerText },
    examTimerValue: {
      fontSize: 22,
      fontWeight: '900',
      color: '#f59e0b',
      fontVariant: ['tabular-nums'],
    },
    examTimerWarn: { color: theme.red[500] },
    guidedBox: {
      backgroundColor: theme.cardMuted,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 8,
    },
    guidedSub: { fontSize: 11, fontWeight: '800', color: theme.textMuted, letterSpacing: 0.6 },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginBottom: 12,
    },
    badgeT1: {
      backgroundColor: theme.badgeB1Bg,
      borderWidth: 1,
      borderColor: theme.badgeB1Border,
    },
    badgeT2: {
      backgroundColor: theme.badgeB2Bg,
      borderWidth: 1,
      borderColor: theme.badgeB2Border,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: theme.text },
    keyword: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 4 },
    category: { fontSize: 13, color: theme.textMuted, marginBottom: 20 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textMuted,
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 8,
    },
    instruction: { fontSize: 15, lineHeight: 24, color: theme.textSecondary },
    bullet: { fontSize: 14, lineHeight: 22, color: theme.textSecondary, marginBottom: 4 },
    input: {
      minHeight: 200,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      lineHeight: 22,
      backgroundColor: theme.inputBg,
      color: theme.text,
    },
    footer: { marginTop: 16 },
    wc: { fontSize: 13, color: theme.textMuted, marginBottom: 12 },
    submitBtn: {
      backgroundColor: theme.brand,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitDisabled: { opacity: 0.5 },
    submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    examLobbyTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 10,
    },
    examLobbyLead: { fontSize: 14, color: theme.textSecondary, lineHeight: 22, marginBottom: 16 },
    examRuleBox: {
      backgroundColor: theme.examBannerBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.examBannerBorder,
      padding: 14,
      marginBottom: 16,
      gap: 6,
    },
    examRuleLine: { fontSize: 14, color: theme.warnBody, lineHeight: 22 },
    examRuleBold: { fontWeight: '800', color: theme.warnTitle },
    examStartBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: theme.brand,
      paddingVertical: 16,
      borderRadius: 14,
      marginTop: 8,
    },
    examStartBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    examBackLink: { alignItems: 'center', paddingVertical: 16 },
    examBackLinkText: { fontSize: 15, fontWeight: '600', color: theme.textMuted },
    checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
    checkBox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    checkBoxOn: { backgroundColor: theme.emerald[600], borderColor: theme.emerald[600] },
    checkLabel: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    checkLabelDone: { color: theme.textMuted, textDecorationLine: 'line-through' },
    phraseItalic: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginBottom: 6,
    },
    guidedAiCaption: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 20,
      marginBottom: 12,
    },
    guidedLoadingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 8,
    },
    guidedLoadingText: { fontSize: 14, color: theme.textSecondary, flex: 1 },
    outlineStepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
    outlineStepBody: { flex: 1 },
    outlineTitle: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 4 },
    outlineHint: { fontSize: 14, lineHeight: 22, color: theme.textSecondary },
    guidedErrText: { fontSize: 13, color: theme.red[400], marginBottom: 10, lineHeight: 20 },
    guidedRetryBtn: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    guidedRetryText: { fontSize: 14, fontWeight: '700', color: theme.linkAccent },
  });
}

function tipsFor(lang: AppLanguage, isTask1: boolean): string[] {
  const pack = lang === 'en' ? GUIDED_TIPS_EN : GUIDED_TIPS_VI;
  return isTask1 ? pack.task1 : pack.task2;
}

export default function PracticeWriteScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const { examId, exam: examFromList, mode: modeParam } = route.params;
  const mode: PracticeSessionMode = modeParam ?? 'practice';
  const { user } = useAppSelector((s) => s.auth);
  const { theme, t, language } = useAppSettings();
  const styles = useMemo(() => makePracticeWriteStyles(theme), [theme]);

  const [prompt, setPrompt] = useState<ExamPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [essay, setEssay] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState<FullAnalysisResponse | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [guidedChecked, setGuidedChecked] = useState<Set<number>>(new Set());
  const [guidedSteps, setGuidedSteps] = useState<OutlineStep[]>([]);
  const [guidedLoadState, setGuidedLoadState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [guidedLoadError, setGuidedLoadError] = useState<string | null>(null);

  const examInitialSeconds = useMemo(() => {
    const t1 = prompt?.taskType?.toLowerCase() === 'task1';
    return t1 ? 20 * 60 : 40 * 60;
  }, [prompt?.taskType]);

  const [examSecondsLeft, setExamSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== 'exam' || !prompt || !examStarted) {
      setExamSecondsLeft(null);
      return;
    }
    setExamSecondsLeft(examInitialSeconds);
    const id = setInterval(() => {
      setExamSecondsLeft((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, examInitialSeconds, prompt?.id, examStarted]);

  const toggleGuidedCheck = (idx: number) => {
    setGuidedChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const loadGuidedOutline = useCallback(async () => {
    if (mode !== 'guided' || !prompt?.id) return;
    setGuidedLoadState('loading');
    setGuidedLoadError(null);
    try {
      const steps = await examPromptService.getOutline(prompt.id);
      setGuidedSteps(steps.filter((s) => s.title?.trim() || s.hint?.trim()));
      setGuidedLoadState('success');
    } catch (e: unknown) {
      setGuidedSteps([]);
      setGuidedLoadState('error');
      setGuidedLoadError(extractApiErrorMessage(e));
    }
  }, [mode, prompt?.id]);

  useEffect(() => {
    if (mode === 'guided' && prompt?.id) {
      loadGuidedOutline();
    } else {
      setGuidedSteps([]);
      setGuidedLoadState('idle');
      setGuidedLoadError(null);
    }
  }, [mode, prompt?.id, loadGuidedOutline]);

  useEffect(() => {
    setGuidedChecked(new Set());
  }, [guidedSteps]);

  const load = useCallback(async () => {
    if (examFromList?.id && examFromList.instruction) {
      setPrompt(examFromList);
      setLoading(false);
      return;
    }
    try {
      const p = await examPromptService.getById(examId);
      setPrompt(p);
    } catch (e) {
      const detail = axios.isAxiosError(e)
        ? e.response
          ? `HTTP ${e.response.status}: ${JSON.stringify(e.response.data).slice(0, 200)}`
          : e.message
        : String(e);
      Alert.alert(
        t('write_load_fail_title'),
        interpolate(t('write_load_fail_msg'), {
          detail,
          apiUrl: compactApiUrl(config.API_BASE_URL),
        }),
        [{ text: t('common_ok'), onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  }, [examId, examFromList, navigation, t]);

  useEffect(() => {
    load();
  }, [load]);

  const minWords = prompt?.taskType?.toLowerCase() === 'task1' ? 120 : 250;
  const wc = wordCount(essay);
  const minSubmit = Math.max(50, Math.floor(minWords * 0.5));
  const canSubmit = wc >= Math.min(minWords, minSubmit);

  const handleSubmit = async () => {
    if (!prompt || !user?.userId) {
      Alert.alert(t('write_err_submit_title'), t('write_err_user'));
      return;
    }
    if (!canSubmit) {
      Alert.alert(
        t('write_err_short_title'),
        interpolate(t('write_err_short_msg'), { min: minSubmit })
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await gradingService.gradeEssay({
        userUid: user.userId,
        promptId: prompt.id,
        content: essay.trim(),
        taskType: prompt.taskType,
      });
      setGradingResult(res);
    } catch (err: unknown) {
      Alert.alert(t('common_error'), extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !prompt) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.brand} />
        <Text style={styles.loadingText}>{t('write_loading')}</Text>
      </View>
    );
  }

  if (gradingResult) {
    const taskLabel =
      prompt.taskType.toLowerCase() === 'task1' ? t('write_task1_label') : t('write_task2_label');
    return (
      <View style={styles.flex}>
        <GradingResultView
          result={gradingResult}
          essayText={essay.trim()}
          taskLabel={taskLabel}
          onClose={() => navigation.goBack()}
        />
      </View>
    );
  }

  const isTask1 = prompt.taskType.toLowerCase() === 'task1';
  const phraseBlock = isTask1 ? GUIDED_PHRASES.task1 : GUIDED_PHRASES.task2;
  const checklist = isTask1 ? TASK1_CHECKLIST : TASK2_CHECKLIST;
  const tipsVi = tipsFor(language, isTask1);

  if (mode === 'exam' && !examStarted) {
    const examMins = isTask1 ? 20 : 40;
    const taskTag = isTask1 ? 'Task 1' : 'Task 2';
    return (
      <View style={styles.flex}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.modeBanner}>
            <Text style={styles.modeBannerText}>{t('write_exam_banner')}</Text>
          </View>
          <Text style={styles.examLobbyTitle}>{t('write_exam_ready_title')}</Text>
          <Text style={styles.examLobbyLead}>{t('write_exam_ready_lead')}</Text>
          <View style={styles.examRuleBox}>
            <Text style={styles.examRuleLine}>
              {interpolate(t('write_exam_rule_line'), { task: taskTag, mins: examMins })}
            </Text>
            <Text style={styles.examRuleLine}>• {t('write_exam_rule_hide')}</Text>
            <Text style={styles.examRuleLine}>• {t('write_exam_rule_grade')}</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('write_prompt_title')}</Text>
          <Text style={styles.instruction}>{prompt.instruction}</Text>
          <TouchableOpacity
            style={styles.examStartBtn}
            onPress={() => setExamStarted(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="play-circle" size={22} color="#fff" />
            <Text style={styles.examStartBtnText}>{t('write_exam_start')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.examBackLink} onPress={() => navigation.goBack()}>
            <Text style={styles.examBackLinkText}>{t('write_exam_back')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const modeLabel =
    mode === 'guided'
      ? t('write_mode_guided')
      : mode === 'exam'
        ? t('write_mode_exam')
        : t('write_mode_practice');

  const showKeyPoints = mode !== 'exam';
  const showGuidedExtra = mode === 'guided';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.modeBanner}>
          <Text style={styles.modeBannerText}>{modeLabel}</Text>
        </View>

        {mode === 'exam' && examStarted && examSecondsLeft !== null && (
          <View style={styles.examTimerRow}>
            <Text style={styles.examTimerLabel}>{t('write_time_left')}</Text>
            <Text
              style={[
                styles.examTimerValue,
                examSecondsLeft <= 5 * 60 && styles.examTimerWarn,
              ]}
            >
              {formatCountdown(examSecondsLeft)}
            </Text>
          </View>
        )}

        <View style={[styles.badge, isTask1 ? styles.badgeT1 : styles.badgeT2]}>
          <Text style={styles.badgeText}>
            VSTEP {prompt.cefrLevel} · {isTask1 ? 'Task 1' : 'Task 2'}
          </Text>
        </View>
        <Text style={styles.keyword}>{prompt.topicKeyword}</Text>
        <Text style={styles.category}>{prompt.topicCategory}</Text>

        <Text style={styles.sectionTitle}>{t('write_prompt_title')}</Text>
        <Text style={styles.instruction}>{prompt.instruction}</Text>

        {showKeyPoints && prompt.keyPoints?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {mode === 'guided' ? t('write_key_points') : t('write_hints')}
            </Text>
            {prompt.keyPoints.map((k, i) => (
              <Text key={i} style={styles.bullet}>
                • {k}
              </Text>
            ))}
          </>
        )}

        {showGuidedExtra && (
          <>
            <Text style={styles.sectionTitle}>{t('write_guided_ai_title')}</Text>
            <Text style={styles.guidedAiCaption}>{t('write_guided_ai_caption')}</Text>

            {guidedLoadState === 'loading' && (
              <View style={styles.guidedLoadingBox}>
                <ActivityIndicator color={theme.brand} />
                <Text style={styles.guidedLoadingText}>{t('write_guided_loading')}</Text>
              </View>
            )}

            {guidedLoadState === 'success' && guidedSteps.length > 0 && (
              <View style={styles.guidedBox}>
                {guidedSteps.map((step, i) => {
                  const done = guidedChecked.has(i);
                  return (
                    <Pressable
                      key={`${step.index}-${i}`}
                      style={styles.outlineStepRow}
                      onPress={() => toggleGuidedCheck(i)}
                    >
                      <View style={[styles.checkBox, done && styles.checkBoxOn]}>
                        {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                      </View>
                      <View style={styles.outlineStepBody}>
                        <Text style={styles.outlineTitle}>
                          {i + 1}. {step.title}
                        </Text>
                        {step.hint ? (
                          <Text style={styles.outlineHint}>{step.hint}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {(guidedLoadState === 'error' ||
              (guidedLoadState === 'success' && guidedSteps.length === 0)) && (
              <>
                {guidedLoadState === 'error' && guidedLoadError ? (
                  <Text style={styles.guidedErrText}>{guidedLoadError}</Text>
                ) : null}
                {guidedLoadState === 'success' && guidedSteps.length === 0 ? (
                  <Text style={styles.guidedErrText}>{t('write_guided_no_outline')}</Text>
                ) : null}
                <TouchableOpacity style={styles.guidedRetryBtn} onPress={loadGuidedOutline}>
                  <Text style={styles.guidedRetryText}>{t('write_guided_retry')}</Text>
                </TouchableOpacity>
              </>
            )}

            {(guidedLoadState === 'error' ||
              (guidedLoadState === 'success' && guidedSteps.length === 0)) && (
              <>
                <Text style={styles.sectionTitle}>{t('write_guided_fallback_title')}</Text>
                <Text style={styles.guidedAiCaption}>{t('write_guided_fallback_caption')}</Text>
                <View style={styles.guidedBox}>
                  {checklist.map((line, i) => {
                    const done = guidedChecked.has(100 + i);
                    return (
                      <Pressable
                        key={`fb-${i}`}
                        style={styles.checkRow}
                        onPress={() => toggleGuidedCheck(100 + i)}
                      >
                        <View style={[styles.checkBox, done && styles.checkBoxOn]}>
                          {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                        </View>
                        <Text style={[styles.checkLabel, done && styles.checkLabelDone]}>{line}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.sectionTitle}>{t('write_guided_tips_title')}</Text>
                <View style={styles.guidedBox}>
                  {tipsVi.map((line, i) => (
                    <Text key={i} style={styles.bullet}>
                      • {line}
                    </Text>
                  ))}
                </View>
                <Text style={styles.sectionTitle}>{t('write_guided_vocab_title')}</Text>
                <View style={styles.guidedBox}>
                  <Text style={styles.guidedSub}>{t('write_guided_formal')}</Text>
                  {phraseBlock.formalPhrases.map((line, i) => (
                    <Text key={`f${i}`} style={styles.phraseItalic}>
                      "{line}"
                    </Text>
                  ))}
                  <Text style={[styles.guidedSub, { marginTop: 12 }]}>{t('write_guided_structures')}</Text>
                  {phraseBlock.usefulStructures.map((line, i) => (
                    <Text key={`s${i}`} style={styles.bullet}>
                      • {line}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>{t('write_your_essay')}</Text>
        <TextInput
          style={styles.input}
          multiline
          textAlignVertical="top"
          placeholder={interpolate(t('write_placeholder_min'), { min: minWords })}
          placeholderTextColor={theme.textMuted}
          value={essay}
          onChangeText={setEssay}
        />

        <View style={styles.footer}>
          <Text style={styles.wc}>
            {interpolate(t('write_wc_line'), { wc, min: minWords })}
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t('write_submit_ai')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
