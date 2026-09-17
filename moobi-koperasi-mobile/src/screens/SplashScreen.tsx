import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { AppIcon } from '../components/common/AppIcon';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
  durationSeconds?: number;
}

const loadingTexts = [
  'Memuat sistem Moobi Koperasi...',
  'Menghubungkan ke database PT Bakti Idola Tama...',
  'Menyiapkan data simpan pinjam & kantin...',
  'Enkripsi keamanan 256-bit aktif...',
  'Selamat datang di Moobi Koperasi!',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationSeconds = 5,
}) => {
  const [currentTextIdx, setCurrentTextIdx] = useState(0);

  // Animated values
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const progressBar = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.4)).current;
  const screenFadeOut = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo Entrance Animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // 2. Content Fade and Slide Up
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 900,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 900,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // 3. Continuous Halo Pulse Animation
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.28,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.15,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.5,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    haloLoop.start();

    // 4. Progress Bar Animation across exactly durationSeconds
    const totalMs = durationSeconds * 1000;
    Animated.timing(progressBar, {
      toValue: 1,
      duration: totalMs - 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // 5. Cycling status texts
    const intervalTime = (totalMs - 600) / loadingTexts.length;
    const textInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(textFade, {
          toValue: 0,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      setCurrentTextIdx((prev) =>
        prev < loadingTexts.length - 1 ? prev + 1 : prev
      );
    }, intervalTime);

    // 6. Complete and Transition out after duration
    const timeout = setTimeout(() => {
      Animated.timing(screenFadeOut, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        onFinish();
      });
    }, totalMs);

    return () => {
      haloLoop.stop();
      clearInterval(textInterval);
      clearTimeout(timeout);
    };
  }, [durationSeconds, onFinish]);

  const handleSkip = () => {
    Animated.timing(screenFadeOut, {
      toValue: 0,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onFinish();
    });
  };

  const progressWidth = progressBar.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeOut }]}>
      {/* Top Bar with Skip Button */}
      <View style={styles.topBar}>
        <View style={styles.versionBadge}>
          <Text style={styles.versionBadgeText}>v2.6 Official</Text>
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Lewati</Text>
          <AppIcon name="chevron-right" size={14} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Center Cinematic Branding */}
      <View style={styles.centerContent}>
        {/* Glowing Halo Rings */}
        <Animated.View
          style={[
            styles.haloRingOuter,
            {
              transform: [{ scale: haloScale }],
              opacity: haloOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.haloRingInner,
            {
              transform: [{ scale: haloScale }],
              opacity: haloOpacity,
            },
          ]}
        />

        {/* Logo Card with Glow */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/transfer/paguyuban.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Brand Titles */}
        <Animated.View
          style={[
            styles.brandTextWrap,
            {
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.badgeRow}>
            <View style={styles.blueDot} />
            <Text style={styles.subCategoryText}>KOPERASI KARYAWAN</Text>
            <View style={styles.blueDot} />
          </View>

          <Text style={styles.mainTitle}>MOOBI KOPERASI</Text>
          <Text style={styles.companySubTitle}>PT BAKTI IDOLA TAMA</Text>

          <Text style={styles.taglineText}>
            Layanan Keuangan Digital & Kesejahteraan Anggota
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Progress & Status Bar */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: contentFade,
          },
        ]}
      >
        {/* Dynamic Status Text */}
        <Animated.View style={{ opacity: textFade }}>
          <Text style={styles.loadingStatusText}>
            {loadingTexts[currentTextIdx]}
          </Text>
        </Animated.View>

        {/* Progress Bar Container */}
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Security & Regulatory Footer */}
        <View style={styles.securityFooter}>
          <AppIcon name="lock" size={13} color="#64748b" />
          <Text style={styles.securityFooterText}>
            Enkripsi 256-Bit • Terproteksi & Terintegrasi HRD BIT
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a101d',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: Platform.OS === 'ios' ? 42 : 28,
  },

  /* TOP BAR */
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },

  /* CENTER BRANDING */
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 'auto',
  },
  haloRingOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 114, 219, 0.12)',
  },
  haloRingInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
  logoContainer: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#93c5fd',
    marginBottom: 26,
    zIndex: 10,
  },
  logoImage: {
    width: 72,
    height: 72,
  },

  brandTextWrap: {
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  blueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38bdf8',
  },
  subCategoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
    marginBottom: 4,
    textAlign: 'center',
  },
  companySubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },

  /* BOTTOM SECTION */
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  loadingStatusText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressBarTrack: {
    width: Math.min(width - 64, 300),
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 2,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  securityFooterText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
});
