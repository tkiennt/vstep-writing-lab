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
import { register, clearError } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function RegisterScreen({
  navigation,
}: {
  navigation: { navigate: (screen: string) => void };
}) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
          opacity: 0.5,
        },
        blob1: {
          top: -80,
          left: -80,
          width: 280,
          height: 280,
          backgroundColor: theme.isDark ? '#064e3b' : colors.emerald[100],
        },
        blob2: {
          bottom: -120,
          right: -80,
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
        title: {
          fontSize: 28,
          fontWeight: '800',
          color: theme.text,
          textAlign: 'center',
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 14,
          color: theme.textMuted,
          textAlign: 'center',
          marginBottom: 28,
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
          marginBottom: 16,
        },
        button: {
          backgroundColor: colors.emerald[600],
          borderRadius: 12,
          padding: 14,
          alignItems: 'center',
          marginTop: 12,
        },
        buttonDisabled: { opacity: 0.7 },
        buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
        footer: {
          marginTop: 28,
          textAlign: 'center',
          fontSize: 14,
          color: theme.textSecondary,
        },
        footerLink: { color: colors.emerald[700], fontWeight: '600' },
      }),
    [theme]
  );

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      Alert.alert(t('common_error'), t('auth_val_register'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('common_error'), t('auth_val_email'));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t('common_error'), t('auth_val_pw_len'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common_error'), t('auth_val_pw_match'));
      return;
    }
    dispatch(clearError());
    const result = await dispatch(
      register({ email: email.trim(), password, displayName: displayName.trim() })
    );
    if (register.rejected.match(result)) {
      Alert.alert(t('auth_register_fail'), result.payload as string);
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
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Start your journey to VSTEP mastery today.</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyen Van A"
            placeholderTextColor={theme.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!isLoading}
          />

          <Text style={styles.label}>Email Address</Text>
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

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a strong password"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={theme.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Started</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Already have an account?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
              Sign in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
