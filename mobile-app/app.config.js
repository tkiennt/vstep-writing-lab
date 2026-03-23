const path = require('path');
const withAndroidCmakeBest = require('./plugins/withAndroidCmakeBest');
// Đảm bảo luôn đọc .env trong thư mục mobile-app (tránh inject 0 biến khi cwd khác)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/** Tránh .env có "localhost: 5288" — bỏ mọi khoảng trắng trong giá trị URL */
function cleanApiUrl(v) {
  if (v == null || v === '') return v;
  return String(v).replace(/[\s\u00A0\uFEFF\u200B-\u200D\u202F\u2060]+/g, '').trim();
}

module.exports = {
  expo: {
    // RN / Expo: tat New Architecture (tranh CMake phuc tap tren Windows)
    newArchEnabled: false,
    name: 'VSTEP Writing Lab',
    slug: 'vstep-writing-lab',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: { supportsTablet: true },
    android: {
      package: 'com.vstepwritinglab.app',
      versionCode: 1,
      // Cho phép gọi API HTTP (localhost / 10.0.2.2 / IP LAN) — Android 9+ chặn cleartext mặc định
      usesCleartextTraffic: true,
      adaptiveIcon: {
        backgroundColor: '#059669',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
    },
    web: { favicon: './assets/favicon.png' },
    plugins: [
      'expo-font',
      withAndroidCmakeBest,
      [
        'expo-build-properties',
        {
          android: {
            // Chi arm64 (dien thoai that) — giam CMake/Ninja, tranh build armeabi-v7a/x86
            buildArchs: ['arm64-v8a'],
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'dcd74936-dadc-486f-84e9-be690ab937c2',
      },
      apiUrl: cleanApiUrl(process.env.EXPO_PUBLIC_API_URL),
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
    },
  },
};
