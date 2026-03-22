import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useAppSettings } from '../../context/AppSettingsContext';
import type { AppLanguage } from '../../i18n/translations';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { theme, t, language, setLanguage, themeMode, setThemeMode } = useAppSettings();
  const initial = (user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.bg },
        content: { padding: 24, paddingBottom: 40 },
        title: {
          fontSize: 24,
          fontWeight: '700',
          color: theme.text,
          marginBottom: 4,
        },
        subtitle: {
          fontSize: 14,
          color: theme.textMuted,
          marginBottom: 24,
        },
        card: {
          backgroundColor: theme.card,
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.isDark ? 0.35 : 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        avatarRow: { marginBottom: 24 },
        avatar: {
          width: 80,
          height: 80,
          backgroundColor: theme.brand,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
        label: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
          marginTop: 16,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        value: {
          fontSize: 16,
          color: theme.text,
          fontWeight: '500',
        },
        sectionLabel: {
          fontSize: 12,
          fontWeight: '800',
          color: theme.textMuted,
          marginBottom: 12,
          letterSpacing: 0.6,
        },
        rowBetween: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        rowLabel: { fontSize: 15, fontWeight: '600', color: theme.text, flex: 1 },
        langRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
        langChip: {
          paddingVertical: 10,
          paddingHorizontal: 18,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.inputBg,
        },
        langChipOn: {
          backgroundColor: theme.brand,
          borderColor: theme.brand,
        },
        langChipText: { fontSize: 14, fontWeight: '700', color: theme.text },
        langChipTextOn: { color: '#fff' },
        logoutButton: {
          backgroundColor: theme.red[500],
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
        },
        logoutText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
        },
      }),
    [theme]
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  const pickLang = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profile_title')}</Text>
      <Text style={styles.subtitle}>{t('profile_subtitle')}</Text>

      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        <Text style={styles.label}>{t('profile_email')}</Text>
        <Text style={styles.value}>{user?.email ?? '-'}</Text>

        <Text style={styles.label}>{t('profile_name')}</Text>
        <Text style={styles.value}>{user?.displayName ?? '-'}</Text>

        <Text style={styles.label}>{t('profile_role')}</Text>
        <Text style={styles.value}>{user?.role ?? 'user'}</Text>
      </View>

      <Text style={styles.sectionLabel}>{t('profile_appearance')}</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.rowLabel}>{t('profile_theme')}</Text>
            <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
              {themeMode === 'dark' ? t('profile_theme_dark') : t('profile_theme_light')}
            </Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={(on) => setThemeMode(on ? 'dark' : 'light')}
            trackColor={{ false: theme.border, true: theme.emerald[600] }}
            thumbColor="#fff"
          />
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>{t('profile_language')}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langChip, language === 'vi' && styles.langChipOn]}
            onPress={() => pickLang('vi')}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.langChipText, language === 'vi' && styles.langChipTextOn]}
            >
              {t('profile_language_vi')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, language === 'en' && styles.langChipOn]}
            onPress={() => pickLang('en')}
            activeOpacity={0.85}
          >
            <Text
              style={[styles.langChipText, language === 'en' && styles.langChipTextOn]}
            >
              {t('profile_language_en')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('profile_logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
