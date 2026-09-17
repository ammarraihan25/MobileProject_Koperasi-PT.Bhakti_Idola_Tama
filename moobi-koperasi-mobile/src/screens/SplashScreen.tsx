import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Platform,
  Easing,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
  durationSeconds?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationSeconds = 5,
}) => {
  // Animated values
  const screenFadeOut = useRef(new Animated.Value(1)).current;
  
  // Logo Animations (clean entrance without ripple)
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  // Text Animations
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(16)).current;

  // Footer Animation
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Animation Sequence
    Animated.sequence([
      // Pop Logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      // Text Cascade
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(footerFade, {
          toValue: 1,
          duration: 500,
          delay: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();

    // 2. Gentle Floating on Logo
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -6,
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

    // 3. Complete and Transition out at duration
    const totalMs = durationSeconds * 1000;
    const timeout = setTimeout(() => {
      Animated.timing(screenFadeOut, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        onFinish();
      });
    }, totalMs);

    return () => {
      floatLoop.stop();
      clearTimeout(timeout);
    };
  }, [durationSeconds, onFinish]);

  return (
    <Animated.View style={[styles.screenContainer, { opacity: screenFadeOut }]}>
      {/* 1. TOP ROYAL BLUE ARCH WITH GEOMETRIC ACCENTS */}
      <View style={styles.topBlueArch}>
        <View style={styles.watermarkCircle1} />
        <View style={styles.watermarkCircle2} />
      </View>

      {/* 2. CENTER LOGO & BRANDING */}
      <View style={styles.centerWrapper}>
        {/* Floating Circular Brand Logo (Clean without background ripple animation) */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoFloat },
              ],
            },
          ]}
        >
          <View style={styles.logoCircleCard}>
            <Image
              source={require('../../assets/transfer/paguyuban.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand Names & Titles */}
        <Animated.View
          style={[
            styles.brandTextSection,
            {
              opacity: textFade,
              transform: [{ translateY: textSlide }],
            },
          ]}
        >
          <Text style={styles.mainBrandTitle}>MOOBI KOPERASI</Text>
          <Text style={styles.companySubTitle}>PT BAKTI IDOLA TAMA</Text>
          <Text style={styles.taglineText}>
            Layanan Keuangan Digital & Kesejahteraan Karyawan
          </Text>
        </Animated.View>
      </View>

      {/* 3. BOTTOM FOOTER */}
      <Animated.View style={[styles.footerContainer, { opacity: footerFade }]}>
        <Text style={styles.appVersionText}>App Version 2.6.0</Text>
        <Text style={styles.regulationNoticeText}>
          Koperasi Karyawan PT Bakti Idola Tama
        </Text>
        <Text style={styles.regulationSubNotice}>
          Terdaftar & Terintegrasi Internal PT BIT
        </Text>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    position: 'relative',
    overflow: 'hidden',
  },

  /* TOP ROYAL BLUE ARCH */
  topBlueArch: {
    position: 'absolute',
    top: -width * 0.45,
    left: -width * 0.25,
    width: width * 1.5,
    height: width * 1.45,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: '#1d72db',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 0,
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    top: width * 0.2,
    right: width * 0.15,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  watermarkCircle2: {
    position: 'absolute',
    bottom: 30,
    left: width * 0.25,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  /* CENTER LOGO & BRAND SECTION */
  centerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    marginVertical: 'auto',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoCircleCard: {
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  logoImage: {
    width: 102,
    height: 102,
  },

  /* BRAND TEXTS */
  brandTextSection: {
    alignItems: 'center',
    width: '100%',
  },
  mainBrandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  companySubTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1d72db',
    letterSpacing: 1.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 290,
    lineHeight: 18,
  },

  /* FOOTER */
  footerContainer: {
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  appVersionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  regulationNoticeText: {
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
  regulationSubNotice: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});
