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
  Image,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function LoginScreen({
  navigation,
}: {
  navigation: { navigate: (screen: string) => void };
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);
  const { theme, t } = useAppSettings();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.bg },
        scroll: { flexGrow: 1, paddingBottom: 60 },
        branding: {
          backgroundColor: theme.brand,
          paddingVertical: 32,
          paddingHorizontal: 24,
          alignItems: 'center',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        },
        logoBox: {
          width: 80,
          height: 80,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        },
        logo: { width: 48, height: 48 },
        brandTitle: {
          fontSize: 28,
          fontWeight: '800',
          color: '#fff',
          marginBottom: 8,
        },
        brandSubtitle: {
          fontSize: 14,
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          marginBottom: 24,
        },
        statsRow: { flexDirection: 'row', gap: 24 },
        statItem: { alignItems: 'center' },
        statVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
        statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
        card: {
          backgroundColor: theme.card,
          marginHorizontal: 20,
          marginTop: -16,
          borderRadius: 24,
          padding: 24,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme.isDark ? 0.4 : 0.06,
          shadowRadius: 24,
          elevation: 8,
          borderWidth: 1,
          borderColor: theme.border,
        },
        cardTitle: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 4 },
        cardSubtitle: { fontSize: 14, color: theme.textMuted, marginBottom: 20 },
        divider: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        },
        dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
        dividerText: {
          fontSize: 10,
          fontWeight: '600',
          color: theme.textMuted,
          letterSpacing: 1,
        },
        label: {
          fontSize: 10,
          fontWeight: '700',
          color: theme.textMuted,
          marginBottom: 6,
          letterSpacing: 0.5,
        },
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
        pwRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
        pwInputWrap: { position: 'relative', marginBottom: 16 },
        pwInput: { paddingRight: 56 },
        eyeBtn: {
          position: 'absolute',
          right: 10,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
        },
        eyeText: { fontSize: 12, color: theme.linkAccent, fontWeight: '600' },
        forgotLink: { fontSize: 12, color: theme.linkAccent, fontWeight: '600' },
        button: {
          backgroundColor: theme.brand,
          borderRadius: 12,
          padding: 14,
          alignItems: 'center',
          marginTop: 8,
        },
        buttonDisabled: { opacity: 0.7 },
        buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
        footer: {
          marginTop: 24,
          textAlign: 'center',
          fontSize: 14,
          color: theme.textSecondary,
        },
        footerLink: { color: theme.linkAccent, fontWeight: '600' },
      }),
    [theme]
  );

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('common_error'), t('auth_val_email_pw'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('common_error'), t('auth_val_email'));
      return;
    }
    dispatch(clearError());
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.rejected.match(result)) {
      Alert.alert(t('auth_login_fail'), result.payload as string);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.branding}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>VSTEP Writing</Text>
          <Text style={styles.brandSubtitle}>
            Unlock your writing potential with AI-driven precision feedback.
          </Text>
          <View style={styles.statsRow}>
            {[['10k+', 'Students'], ['98%', 'Accuracy'], ['B1→C1', 'Levels']].map(([val, lbl]) => (
              <View key={lbl} style={styles.statItem}>
                <Text style={styles.statVal}>{val}</Text>
                <Text style={styles.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Welcome back — let's continue your progress.</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>LOGIN WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@university.edu.vn"
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <View style={styles.pwRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={isLoading}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pwInputWrap}>
            <TextInput
              style={[styles.input, styles.pwInput]}
              placeholder="••••••••"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPw(!showPw)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.eyeText}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In with Email</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Don't have an account?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
              Register
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
