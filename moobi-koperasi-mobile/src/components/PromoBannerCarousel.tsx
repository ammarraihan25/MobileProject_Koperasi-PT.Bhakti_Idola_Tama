import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { AppIcon } from './common/AppIcon';
import Svg, { Path, Circle } from 'react-native-svg';

interface PromoSlide {
  id: string;
  brand: string;
  badge: string;
  headline: string;
  ticket1Value: string;
  ticket1Label: string;
  ticket2Value: string;
  ticket2Label: string;
  productImage: any;
  productName: string;
  productPrice: string;
  subtext: string;
  bgColor: string;
}

const promoSlides: PromoSlide[] = [
  {
    id: 'promo-1',
    brand: 'MIYAKO',
    badge: 'Hanya Hari Ini',
    headline: 'Diskon s/d 35% Rice Cooker & Blender',
    ticket1Value: '35%',
    ticket1Label: 'MIYAKO',
    ticket2Value: 'Rp 50rb',
    ticket2Label: 'POTONG GAJI',
    productImage: require('../../assets/products/rice-cooker(1).png'),
    productName: 'Miyako Rice Cooker MCM-508',
    productPrice: 'Rp 265.000',
    subtext: '*Khusus Karyawan PT. Bakti Idola Tama',
    bgColor: '#1d72db',
  },
  {
    id: 'promo-2',
    brand: 'RINNAI',
    badge: 'Kitchen Set BIT',
    headline: 'Kompor Gas 2 Tungku & Cookware',
    ticket1Value: '40%',
    ticket1Label: 'RINNAI',
    ticket2Value: '0%',
    ticket2Label: 'CICILAN GAJI',
    productImage: require('../../assets/products/kompor(1).png'),
    productName: 'Rinnai Kompor Gas RI-522C',
    productPrice: 'Rp 340.000',
    subtext: '*Garansi Resmi 1 Tahun Koperasi',
    bgColor: '#1462c4',
  },
  {
    id: 'promo-3',
    brand: 'SHIMIZU',
    badge: 'Home Living BIT',
    headline: 'Peralatan Rumah & Juicer Shimizu',
    ticket1Value: '30%',
    ticket1Label: 'SHIMIZU',
    ticket2Value: 'FREE',
    ticket2Label: 'ONGKIR PABRIK',
    productImage: require('../../assets/products/juicer.png'),
    productName: 'Juicer Ekstraktor Serbaguna',
    productPrice: 'Rp 310.000',
    subtext: '*Bisa Ambil Langsung di Loket Koperasi',
    bgColor: '#0284c7',
  },
  {
    id: 'promo-4',
    brand: 'MIYAKO',
    badge: 'Flash Sale Karyawan',
    headline: 'Dispenser & Blender Hemat Energi',
    ticket1Value: '25%',
    ticket1Label: 'HEMAT',
    ticket2Value: '20 Koin',
    ticket2Label: 'CASHBACK',
    productImage: require('../../assets/products/dispenser(1).png'),
    productName: 'Miyako Dispenser WD-186H',
    productPrice: 'Rp 195.000',
    subtext: '*Tersedia Potong Gaji 3x Cicilan',
    bgColor: '#1e40af',
  },
];

export const PromoBannerCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-Slide effect every 3.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 3800);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const changeSlide = (newIndex: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveIndex(newIndex);
  };

  const handleNextSlide = () => {
    const nextIdx = (activeIndex + 1) % promoSlides.length;
    changeSlide(nextIdx);
  };

  const handleBannerPress = (slide: PromoSlide) => {
    Alert.alert(
      `Promo Khusus: ${slide.brand} 🎁`,
      `Produk: ${slide.productName}\nHarga Spesial Karyawan: ${slide.productPrice}\n\nFasilitas Pembayaran:\n• Potong Slip Gaji (Bunga 0%)\n• Payment Gateway Pihak Ke-3 (VA/QRIS)\n• Ambil langsung di Loket Koperasi PT Bakti Idola Tama`
    );
  };

  const currentSlide = promoSlides[activeIndex];

  return (
    <View style={styles.container}>
      {/* Top Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionHeading}>Promo Khusus Karyawan</Text>
          <View style={styles.brandPillsRow}>
            <Text style={styles.brandTag}>Miyako</Text>
            <Text style={styles.brandDot}>•</Text>
            <Text style={styles.brandTag}>Rinnai</Text>
            <Text style={styles.brandDot}>•</Text>
            <Text style={styles.brandTag}>Shimizu</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Katalog Produk PT Bakti Idola Tama',
              'Menampilkan seluruh promo resmi produk Miyako, Rinnai, dan Shimizu dengan harga pabrik khusus karyawan.'
            )
          }
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Katalog ›</Text>
        </TouchableOpacity>
      </View>

      {/* Main Banner Card (With Rich Layered Geometric & Ambient Background Elements) */}
      <TouchableOpacity
        style={[styles.bannerCard, { backgroundColor: currentSlide.bgColor }]}
        onPress={() => handleBannerPress(currentSlide)}
        activeOpacity={0.92}
      >
        {/* Layered Background Design Elements */}
        <View style={styles.bgCircleLarge} />
        <View style={styles.bgCircleRing} />
        <View style={styles.bgCircleTop} />
        <View style={styles.bgSoftCloud} />

        {/* Sparkle 1 (Top Right) */}
        <View style={styles.sparkleOne}>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
            <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </Svg>
        </View>

        {/* Sparkle 2 (Bottom Left) */}
        <View style={styles.sparkleTwo}>
          <Svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)">
            <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </Svg>
        </View>

        {/* Top-Left Pill Badge ("Hanya Hari Ini" with clock icon) */}
        <View style={styles.topBadgeWrapper}>
          <View style={styles.topBadge}>
            <AppIcon name="history" size={11} color="#ffffff" />
            <Text style={styles.topBadgeText}>{currentSlide.badge}</Text>
          </View>
        </View>

        <Animated.View style={[styles.bannerContentRow, { opacity: fadeAnim }]}>
          {/* Left Column: Headline & Two Voucher Tickets */}
          <View style={styles.leftCol}>
            <Text style={styles.headlineText} numberOfLines={2}>
              {currentSlide.headline}
            </Text>

            {/* Two Perforated Discount Tickets with Authentic Semicircular Notches */}
            <View style={styles.ticketsRow}>
              {/* Ticket 1 */}
              <View style={styles.ticketBox}>
                {/* Left & Right Semicircle Cutout Notches */}
                <View style={styles.ticketNotchLeft} />
                <View style={styles.ticketNotchRight} />

                <View style={styles.ticketTop}>
                  <Text style={styles.ticketValueText}>
                    {currentSlide.ticket1Value}
                  </Text>
                </View>
                <View style={styles.ticketDashedSep} />
                <View style={styles.ticketBottom}>
                  <Text style={styles.ticketLabelText}>
                    {currentSlide.ticket1Label}
                  </Text>
                </View>
              </View>

              {/* Ticket 2 */}
              <View style={styles.ticketBox}>
                {/* Left & Right Semicircle Cutout Notches */}
                <View style={styles.ticketNotchLeft} />
                <View style={styles.ticketNotchRight} />

                <View style={styles.ticketTop}>
                  <Text style={styles.ticketValueText}>
                    {currentSlide.ticket2Value}
                  </Text>
                </View>
                <View style={styles.ticketDashedSep} />
                <View style={styles.ticketBottom}>
                  <Text style={styles.ticketLabelText}>
                    {currentSlide.ticket2Label}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.subtextNotice}>{currentSlide.subtext}</Text>
          </View>

          {/* Right Column: Framed Product Postcard & Next Arrow */}
          <View style={styles.rightCol}>
            {/* Polaroid / Postcard Frame with Glossy Layering */}
            <View style={styles.postcardFrame}>
              <View style={styles.postcardHeader}>
                <Text style={styles.postcardBrand}>{currentSlide.brand}</Text>
                <Text style={styles.postcardOfficial}>BIT Official</Text>
              </View>
              <View style={styles.productImgWrapper}>
                <Image
                  source={currentSlide.productImage}
                  style={styles.productImg}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Next Arrow Button */}
            <TouchableOpacity
              style={styles.nextArrowBtn}
              onPress={handleNextSlide}
              activeOpacity={0.8}
            >
              <AppIcon name="chevron-right" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Pagination Indicators */}
      <View style={styles.paginationRow}>
        {promoSlides.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => changeSlide(idx)}
            style={[
              styles.dot,
              idx === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'column',
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  brandPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  brandTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1d72db',
  },
  brandDot: {
    fontSize: 10,
    color: '#94a3b8',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d72db',
  },

  /* Banner Card */
  bannerCard: {
    borderRadius: 18,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Layered Background Ornaments */
  bgCircleLarge: {
    position: 'absolute',
    top: -30,
    right: -25,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bgCircleRing: {
    position: 'absolute',
    bottom: -35,
    right: 50,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bgCircleTop: {
    position: 'absolute',
    top: -20,
    left: 40,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bgSoftCloud: {
    position: 'absolute',
    bottom: -10,
    left: -15,
    width: 120,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sparkleOne: {
    position: 'absolute',
    top: 14,
    right: 125,
  },
  sparkleTwo: {
    position: 'absolute',
    bottom: 24,
    left: 15,
  },

  topBadgeWrapper: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  bannerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
    marginRight: 10,
  },
  headlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 17,
    letterSpacing: -0.1,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ticketsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  ticketBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 2.5,
    elevation: 3,
    minWidth: 70,
    position: 'relative',
  },
  ticketNotchLeft: {
    position: 'absolute',
    top: '50%',
    left: -4,
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db', // Matches current card background tone
    zIndex: 10,
  },
  ticketNotchRight: {
    position: 'absolute',
    top: '50%',
    right: -4,
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db',
    zIndex: 10,
  },
  ticketTop: {
    backgroundColor: '#ffffff',
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketValueText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  ticketDashedSep: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  ticketBottom: {
    backgroundColor: '#ea580c', // Bright orange voucher pill
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketLabelText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  subtextNotice: {
    fontSize: 8.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '500',
  },

  /* Right Column: Polaroid Postcard */
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  postcardFrame: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 5,
    width: 105,
    height: 105,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    transform: [{ rotate: '2deg' }],
  },
  postcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.8,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 2,
    marginBottom: 3,
  },
  postcardBrand: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  postcardOfficial: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#64748b',
  },
  productImgWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  nextArrowBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  /* Pagination */
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#1d72db',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#cbd5e1',
  },
});
