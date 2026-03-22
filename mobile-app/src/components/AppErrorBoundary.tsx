import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

type Props = { children: ReactNode };

type State = { error: Error | null };

/**
 * Bắt lỗi render JS — tránh màn hình xanh chung của Expo Go không có chi tiết.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const msg = this.state.error.message || String(this.state.error);
      return (
        <View style={styles.wrap}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Đã có lỗi khi khởi chạy</Text>
            <Text style={styles.body}>
              Mở Metro terminal trên PC để xem stack đầy đủ. Dưới đây là thông báo lỗi:
            </Text>
            <View style={styles.codeBox}>
              <Text selectable style={styles.code}>
                {msg}
              </Text>
            </View>
            <Text style={styles.hint}>
              Gợi ý: cập nhật app Expo Go (SDK 54), đồng bộ cổng Metro với QR (8081/8082), kiểm tra
              EXPO_PUBLIC_* trong .env.
            </Text>
            <TouchableOpacity style={styles.btn} onPress={this.handleReset} activeOpacity={0.85}>
              <Text style={styles.btnText}>Thử lại</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.slate[50] },
  scroll: { padding: 20, paddingTop: 48 },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate[900], marginBottom: 12 },
  body: { fontSize: 14, color: colors.slate[600], lineHeight: 20, marginBottom: 12 },
  codeBox: {
    backgroundColor: colors.slate[100],
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  code: { fontSize: 12, color: colors.red[600], fontFamily: 'monospace' },
  hint: { fontSize: 12, color: colors.slate[500], lineHeight: 18, marginBottom: 20 },
  btn: {
    backgroundColor: colors.vstepDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
