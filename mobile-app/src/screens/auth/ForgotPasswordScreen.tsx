import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPassword } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function ForgotPasswordScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);
  const { theme, t } = useAppSettings();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.bg },
        scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
        blob: {
          position: 'absolute',
          borderRadius: 999,
        },
        blob1: {
          top: -60,
          left: -60,
          width: 280,
          height: 280,
          backgroundColor: theme.isDark ? '#064e3b' : colors.emerald[100],
          opacity: 0.5,
        },
        blob2: {
          bottom: -100,
          right: -100,
          width: 360,
          height: 360,
          backgroundColor: colors.teal[400],
          opacity: theme.isDark ? 0.08 : 0.15,
        },
        card: {
          backgroundColor: theme.card,
          borderRadius: 24,
          padding: 32,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme.isDark ? 0.35 : 0.04,
          shadowRadius: 24,
          elevation: 6,
          borderWidth: 1,
          borderColor: theme.border,
        },
        backBtn: { marginBottom: 24 },
        backText: { fontSize: 14, color: theme.textMuted, fontWeight: '500' },
        iconBox: {
          width: 44,
          height: 44,
          backgroundColor: theme.isDark ? '#064e3b' : colors.emerald[50],
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.isDark ? '#059669' : colors.emerald[100],
        },
        iconText: { fontSize: 20 },
        title: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 8 },
        subtitle: {
          fontSize: 14,
          color: theme.textMuted,
          marginBottom: 24,
          lineHeight: 20,
        },
        label: { fontSize: 14, fontWeight: '500', color: theme.textSecondary, marginBottom: 6 },
        input: {
          backgroundColor: theme.inputBg,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          color: theme.text,
          marginBottom: 24,
        },
        button: {
          backgroundColor: colors.emerald[600],
          borderRadius: 12,
          padding: 14,
          alignItems: 'center',
        },
        buttonDisabled: { opacity: 0.7 },
        buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
        success: { alignItems: 'center', paddingVertical: 16 },
        successIcon: {
          width: 64,
          height: 64,
          backgroundColor: theme.isDark ? '#064e3b' : colors.emerald[50],
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: theme.isDark ? '#059669' : colors.emerald[100],
        },
        successIconText: { fontSize: 32, color: colors.emerald[600], fontWeight: 'bold' },
        successTitle: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 8 },
        successText: {
          fontSize: 14,
          color: theme.textMuted,
          textAlign: 'center',
          marginBottom: 24,
        },
        emailBold: { fontWeight: '600', color: theme.textSecondary },
        resendBtn: { marginBottom: 24 },
        resendText: { fontSize: 14, color: colors.emerald[700], fontWeight: '600' },
        footer: {
          textAlign: 'center',
          fontSize: 14,
          color: theme.textSecondary,
        },
        footerLink: { color: colors.emerald[700], fontWeight: '600' },
      }),
    [theme]
  );

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert(t('common_error'), t('auth_forgot_err_email'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('common_error'), t('auth_forgot_err_email_fmt'));
      return;
    }
    const result = await dispatch(forgotPassword(email.trim()));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
    } else if (forgotPassword.rejected.match(result)) {
      Alert.alert(t('common_error'), result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />

        <View style={styles.card}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back to sign in</Text>
          </TouchableOpacity>

          {!sent ? (
            <>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>✉</Text>
              </View>
              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                No worries. Enter your university email and we'll send you a reset link.
              </Text>

              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@university.edu.vn"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.success}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successText}>
                We sent a reset link to <Text style={styles.emailBold}>{email}</Text>. It expires in 15 minutes.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSent(false);
                  setEmail('');
                }}
                style={styles.resendBtn}
              >
                <Text style={styles.resendText}>Didn't receive it? Resend</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footer}>
            Remember it?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
              Sign in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
