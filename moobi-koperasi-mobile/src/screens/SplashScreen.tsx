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

const loadingSteps = [
  { step: '1/5', text: 'Memuat sistem Moobi Koperasi...' },
  { step: '2/5', text: 'Menghubungkan ke server PT Bakti Idola Tama...' },
  { step: '3/5', text: 'Sinkronisasi data simpan pinjam & kantin...' },
  { step: '4/5', text: 'Mengaktifkan enkripsi transaksi aman 256-bit...' },
  { step: '5/5', text: 'Selamat datang di Moobi Koperasi!' },
];

const featureChips = [
  { icon: 'wallet', label: 'Simpan Pinjam', color: '#1d72db' },
  { icon: 'kantin', label: 'Kantin BIT', color: '#f59e0b' },
  { icon: 'tagihan', label: 'Tagihan PPoB', color: '#10b981' },
  { icon: 'lock', label: '100% Terproteksi', color: '#6366f1' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationSeconds = 5,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [percentDisplay, setPercentDisplay] = useState(0);

  // Animated values
  const screenFadeOut = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  
  // Ripple Rings
  const ripple1Scale = useRef(new Animated.Value(0.85)).current;
  const ripple1Opacity = useRef(new Animated.Value(0.7)).current;
  const ripple2Scale = useRef(new Animated.Value(0.85)).current;
  const ripple2Opacity = useRef(new Animated.Value(0.7)).current;

  // Ambient Floating Blobs
  const blobFloat1 = useRef(new Animated.Value(0)).current;
  const blobFloat2 = useRef(new Animated.Value(0)).current;

  // Staggered Content Elements
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const chipsAnim = useRef(new Animated.Value(0)).current;
  const bottomSectionAnim = useRef(new Animated.Value(0)).current;

  // Progress Bar & Dynamic Text
  const progressAnim = useRef(new Animated.Value(0)).current;
  const statusTextFade = useRef(new Animated.Value(1)).current;
  const pulseLight = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // 1. Staggered Entrance Sequence
    Animated.sequence([
      // Logo Pop
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Badge, Title, Subtitle, Tagline in smooth cascade
      Animated.stagger(120, [
        Animated.timing(badgeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(subtitleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(chipsAnim, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(bottomSectionAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();

    // 2. Continuous Floating / Breathing on Logo
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    floatLoop.start();

    // 3. Ambient Background Blobs Float
    const blob1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blobFloat1, {
          toValue: 15,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(blobFloat1, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    const blob2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blobFloat2, {
          toValue: -18,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(blobFloat2, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    blob1Loop.start();
    blob2Loop.start();

    // 4. Concentric Glowing Ripple Ripples
    const ripple1Loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ripple1Scale, {
            toValue: 1.42,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(ripple1Opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(ripple1Scale, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(ripple1Opacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );

    const ripple2Loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(ripple2Scale, {
            toValue: 1.5,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(ripple2Opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(ripple2Scale, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(ripple2Opacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    ripple1Loop.start();
    ripple2Loop.start();

    // 5. Head Light Glow Pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseLight, {
          toValue: 1,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseLight, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    // 6. Progress Bar Animation across durationSeconds
    const totalMs = durationSeconds * 1000;
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: totalMs - 350,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    }).start();

    // 7. Dynamic Percentage & Text updates
    const percentInterval = setInterval(() => {
      setPercentDisplay((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 2);
      });
    }, totalMs / 52);

    const stepIntervalTime = (totalMs - 500) / loadingSteps.length;
    const stepInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(statusTextFade, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(statusTextFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      setCurrentStepIdx((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, stepIntervalTime);

    // 8. Exit Transition
    const timeout = setTimeout(() => {
      Animated.timing(screenFadeOut, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        onFinish();
      });
    }, totalMs);

    return () => {
      floatLoop.stop();
      blob1Loop.stop();
      blob2Loop.stop();
      ripple1Loop.stop();
      ripple2Loop.stop();
      pulseLoop.stop();
      clearInterval(percentInterval);
      clearInterval(stepInterval);
      clearTimeout(timeout);
    };
  }, [durationSeconds, onFinish]);

  const handleSkip = () => {
    Animated.timing(screenFadeOut, {
      toValue: 0,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onFinish();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.screenContainer, { opacity: screenFadeOut }]}>
      {/* 1. BACKGROUND FLOATING PASTEL AURA BLOBS */}
      <Animated.View
        style={[
          styles.ambientBlobTopRight,
          {
            transform: [
              { translateY: blobFloat1 },
              { scale: 1.1 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ambientBlobBottomLeft,
          {
            transform: [
              { translateY: blobFloat2 },
              { scale: 1.15 },
            ],
          },
        ]}
      />
      <View style={styles.ambientCenterGlow} />

      {/* 2. TOP HEADER BAR */}
      <View style={styles.topHeaderBar}>
        <View style={styles.appPillBadge}>
          <View style={styles.appPillDot} />
          <Text style={styles.appPillText}>Moobi Official v2.6</Text>
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButtonCard}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Lewati</Text>
          <AppIcon name="chevron-right" size={13} color="#1d72db" />
        </TouchableOpacity>
      </View>

      {/* 3. CENTER BRANDING HERO WITH RICH LIGHT THEME ANIMATIONS */}
      <View style={styles.centerHeroSection}>
        {/* Glowing Ripple Waves */}
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              transform: [{ scale: ripple1Scale }],
              opacity: ripple1Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.rippleCircleSecondary,
            {
              transform: [{ scale: ripple2Scale }],
              opacity: ripple2Opacity,
            },
          ]}
        />

        {/* Floating Logo Card */}
        <Animated.View
          style={[
            styles.floatingLogoWrap,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoFloat },
              ],
            },
          ]}
        >
          <View style={styles.logoCardBox}>
            <Image
              source={require('../../assets/transfer/paguyuban.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Staggered Brand Identity Details */}
        <View style={styles.brandingTextContainer}>
          {/* Pill Badge */}
          <Animated.View
            style={[
              styles.categoryPillWrap,
              {
                opacity: badgeAnim,
                transform: [
                  {
                    translateY: badgeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <AppIcon name="star" size={12} color="#1d72db" />
            <Text style={styles.categoryPillLabel}>KOPERASI KARYAWAN</Text>
            <AppIcon name="star" size={12} color="#1d72db" />
          </Animated.View>

          {/* Main Title */}
          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.primaryBrandHeading}>MOOBI KOPERASI</Text>
          </Animated.View>

          {/* Subtitle Company Name */}
          <Animated.View
            style={{
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.companySubHeading}>PT BAKTI IDOLA TAMA</Text>
          </Animated.View>

          {/* Slogan & Value Proposition */}
          <Animated.View
            style={{
              opacity: taglineAnim,
              transform: [
                {
                  translateY: taglineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.brandTagline}>
              Layanan Keuangan Digital & Kesejahteraan Anggota Terintegrasi
            </Text>
          </Animated.View>

          {/* 4 Animated Feature Micro-Chips */}
          <Animated.View
            style={[
              styles.chipsGridRow,
              {
                opacity: chipsAnim,
                transform: [
                  {
                    scale: chipsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {featureChips.map((chip, idx) => (
              <View key={idx} style={styles.microChipCard}>
                <AppIcon name={chip.icon as any} size={13} color={chip.color} />
                <Text style={styles.microChipText}>{chip.label}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>

      {/* 4. BOTTOM DYNAMIC PROGRESS & LIVELY STATUS CARD */}
      <Animated.View
        style={[
          styles.bottomLoadingCard,
          {
            opacity: bottomSectionAnim,
            transform: [
              {
                translateY: bottomSectionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [25, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Header with Step indicator & Percentage */}
        <View style={styles.progressMetaHeader}>
          <View style={styles.stepBadgePill}>
            <Text style={styles.stepBadgeText}>
              {loadingSteps[currentStepIdx]?.step}
            </Text>
          </View>
          <Text style={styles.percentageNumberText}>{percentDisplay}%</Text>
        </View>

        {/* Animated Status Step Text */}
        <Animated.View style={{ opacity: statusTextFade, minHeight: 20 }}>
          <Text style={styles.statusLiveMessage}>
            {loadingSteps[currentStepIdx]?.text}
          </Text>
        </Animated.View>

        {/* Dual-Tone Electric Progress Track */}
        <View style={styles.progressTrackOuter}>
          <Animated.View
            style={[
              styles.progressFillGradient,
              {
                width: progressWidth,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressHeadGlow,
                {
                  opacity: pulseLight,
                },
              ]}
            />
          </Animated.View>
        </View>

        {/* Security & Regulatory Footer */}
        <View style={styles.securityTrustRow}>
          <View style={styles.secureShieldBadge}>
            <AppIcon name="lock" size={12} color="#1d72db" />
          </View>
          <Text style={styles.securityTrustText}>
            Enkripsi 256-Bit • Terproteksi & Terkoneksi HRD PT BIT
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
    position: 'relative',
    overflow: 'hidden',
  },

  /* 1. AMBIENT BACKGROUND BLOBS */
  ambientBlobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(219, 234, 254, 0.65)',
    zIndex: 0,
  },
  ambientBlobBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(224, 242, 254, 0.7)',
    zIndex: 0,
  },
  ambientCenterGlow: {
    position: 'absolute',
    top: '30%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(239, 246, 255, 0.5)',
    zIndex: 0,
  },

  /* 2. TOP HEADER */
  topHeaderBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  appPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  appPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  appPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  skipButtonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d72db',
  },

  /* 3. CENTER HERO SECTION */
  centerHeroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 'auto',
    width: '100%',
    zIndex: 10,
  },

  /* RIPPLE CIRCLES */
  rippleCircle: {
    position: 'absolute',
    top: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(29, 114, 219, 0.35)',
  },
  rippleCircleSecondary: {
    position: 'absolute',
    top: -10,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(219, 234, 254, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },

  /* FLOATING LOGO */
  floatingLogoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoCardBox: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 76,
    height: 76,
  },

  /* BRAND TEXTS */
  brandingTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  categoryPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 8,
  },
  categoryPillLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
    letterSpacing: 1.5,
  },
  primaryBrandHeading: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.4,
    marginBottom: 2,
    textAlign: 'center',
  },
  companySubHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1d72db',
    letterSpacing: 1.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
  },

  /* CHIPS ROW */
  chipsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 320,
  },
  microChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  microChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },

  /* 4. BOTTOM LOADING CARD */
  bottomLoadingCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    zIndex: 20,
  },
  progressMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepBadgePill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  stepBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  percentageNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1d72db',
  },
  statusLiveMessage: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 10,
  },
  progressTrackOuter: {
    width: '100%',
    height: 7,
    borderRadius: 4,
    backgroundColor: '#eff6ff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 12,
    position: 'relative',
  },
  progressFillGradient: {
    height: '100%',
    backgroundColor: '#1d72db',
    borderRadius: 4,
    position: 'relative',
  },
  progressHeadGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  securityTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secureShieldBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTrustText: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
  },
});
