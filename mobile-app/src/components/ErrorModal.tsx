import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  /** Luôn hiển thị ít nhất một dòng (tránh popup trống). */
  message?: string;
  onDismiss: () => void;
}

export function ErrorModal({
  visible,
  title,
  message,
  onDismiss,
}: ErrorModalProps) {
  const { theme, t } = useAppSettings();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: theme.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        card: {
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 20,
          width: '100%',
          maxWidth: 400,
          borderWidth: 1,
          borderColor: theme.border,
        },
        title: {
          fontSize: 18,
          fontWeight: '800',
          color: theme.text,
          marginBottom: 10,
        },
        message: {
          fontSize: 14,
          lineHeight: 22,
          color: theme.textSecondary,
          marginBottom: 20,
        },
        button: {
          alignSelf: 'flex-end',
          paddingVertical: 10,
          paddingHorizontal: 16,
        },
        buttonText: {
          color: theme.brand,
          fontWeight: '800',
          fontSize: 16,
        },
      }),
    [theme]
  );

  const body =
    message != null && String(message).trim().length > 0
      ? String(message).trim()
      : t('error_modal_fallback');

  const resolvedTitle = title ?? t('common_error');

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{resolvedTitle}</Text>
          <Text style={styles.message}>{body}</Text>
          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>{t('common_ok')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
