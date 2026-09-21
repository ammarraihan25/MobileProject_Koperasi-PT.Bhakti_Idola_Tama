import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TabType, ActiveScreenType } from '../types';
import { HeaderBalance } from '../components/HeaderBalance';
import { PlafonPinjamanCard } from '../components/PlafonPinjamanCard';
import { AppIcon, IconType } from '../components/common/AppIcon';
import { mockWallet, mockUser } from '../data/mockData';

interface BerandaScreenProps {
  userBalance?: number;
  userCoins?: number;
  userAvatarUri?: string | null;
  walletState?: typeof mockWallet;
  onNavigateScreen?: (screen: ActiveScreenType) => void;
  onNavigateTab?: (tab: TabType) => void;
  onOpenPPOB?: (tabName: 'pulsa' | 'token' | 'emoney') => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  userBalance = mockWallet.simpananSukarela,
  userCoins = mockWallet.moobiCoins,
  userAvatarUri = null,
  walletState = mockWallet,
  onNavigateScreen,
  onNavigateTab,
  onOpenPPOB,
}) => {
  const handleGridMenuClick = (id: string, title: string) => {
    switch (id) {
      case '1': // Pinjaman Karyawan
        onNavigateScreen ? onNavigateScreen('pinjaman') : Alert.alert('Pinjaman', 'Membuka Layanan Pinjaman');
        break;
      case '2': // Kantin BIT
        onNavigateScreen ? onNavigateScreen('kantin') : Alert.alert('Kantin', 'Membuka Layanan Kantin');
        break;
      case '4': // Token Listrik PLN
        if (onNavigateScreen) {
          onNavigateScreen('token');
        } else if (onOpenPPOB) {
          onOpenPPOB('token');
        }
        break;
      case '5': // Pulsa & Data
        if (onNavigateScreen) {
          onNavigateScreen('pulsa');
        } else if (onOpenPPOB) {
          onOpenPPOB('pulsa');
        }
        break;
      case '6': // Top Up E-Money
        if (onNavigateScreen) {
          onNavigateScreen('emoney');
        } else if (onOpenPPOB) {
          onOpenPPOB('emoney');
        }
        break;
      case '7': // Simpanan Sukarela
        if (onNavigateTab) {
          onNavigateTab('keuangan');
        } else if (onNavigateScreen) {
          onNavigateScreen('keuangan');
        }
        break;
      case '8': // Riwayat
        if (onNavigateTab) {
          onNavigateTab('riwayat');
        } else if (onNavigateScreen) {
          onNavigateScreen('riwayat');
        }
        break;
      case '9': // PDAM Air Bersih
        if (onNavigateScreen) {
          onNavigateScreen('pdam');
        } else {
          Alert.alert('PDAM', 'Layanan Pembayaran Tagihan PDAM / Air Bersih.');
        }
        break;
      case '10': // BPJS Kesehatan & Ketenagakerjaan
        if (onNavigateScreen) {
          onNavigateScreen('bpjs');
        } else {
          Alert.alert('BPJS', 'Layanan Pembayaran Iuran BPJS Ketenagakerjaan & Kesehatan.');
        }
        break;
      default:
        break;
    }
  };

  const cleanFeatures: {
    id: string;
    title: string;
    icon: IconType;
    color: string;
    bg: string;
    borderColor: string;
    shadowColor: string;
  }[] = [
    {
      id: '1',
      title: 'Pinjaman',
      icon: 'paylater',
      color: '#ffffff',
      bg: '#d97706',
      borderColor: '#b45309',
      shadowColor: '#d97706',
    },
    {
      id: '2',
      title: 'Kantin BIT',
      icon: 'kantin',
      color: '#ffffff',
      bg: '#16a34a',
      borderColor: '#15803d',
      shadowColor: '#16a34a',
    },
    {
      id: '7',
      title: 'Simpanan',
      icon: 'simpanan',
      color: '#ffffff',
      bg: '#059669',
      borderColor: '#047857',
      shadowColor: '#059669',
    },
    {
      id: '4',
      title: 'Token PLN',
      icon: 'zap',
      color: '#ffffff',
      bg: '#ea580c',
      borderColor: '#c2410c',
      shadowColor: '#ea580c',
    },
    {
      id: '5',
      title: 'Pulsa & Data',
      icon: 'pulsa',
      color: '#ffffff',
      bg: '#2563eb',
      borderColor: '#1d4ed8',
      shadowColor: '#2563eb',
    },
    {
      id: '9',
      title: 'PDAM',
      icon: 'pdam',
      color: '#ffffff',
      bg: '#0284c7',
      borderColor: '#0369a1',
      shadowColor: '#0284c7',
    },
    {
      id: '10',
      title: 'BPJS',
      icon: 'bpjs',
      color: '#ffffff',
      bg: '#0d9488',
      borderColor: '#0f766e',
      shadowColor: '#0d9488',
    },
    {
      id: '8',
      title: 'Riwayat',
      icon: 'riwayat',
      color: '#ffffff',
      bg: '#6366f1',
      borderColor: '#4f46e5',
      shadowColor: '#6366f1',
    },
  ];

  const promoArticles: {
    id: string;
    title: string;
    desc: string;
    icon: IconType;
    iconBg: string;
    watermarkImage: any;
    ctaText: string;
    ctaBg: string;
    ctaColor: string;
    cardBorder: string;
    cardBg: string;
    actionType: 'pinjaman' | 'kantin';
  }[] = [
    {
      id: '1',
      title: 'Pinjaman Karyawan & Dana Tunai',
      desc: 'Pinjaman tanpa agunan hingga Rp 25.000.000 dengan cicilan ringan langsung potong slip gaji.',
      icon: 'bolt',
      iconBg: '#d97706',
      watermarkImage: require('../../assets/page/pinjaman.jpg'),
      ctaText: 'Ajukan Pinjaman',
      ctaBg: '#fef3c7',
      ctaColor: '#92400e',
      cardBorder: '#fde68a',
      cardBg: '#fffdfa',
      actionType: 'pinjaman',
    },
    {
      id: '2',
      title: 'Pre-Order Kantin Tanpa Antre',
      desc: 'Pesan makanan siang sebelum jam 10:00 WIB, siap dinikmati saat istirahat tanpa antre.',
      icon: 'food',
      iconBg: '#16a34a',
      watermarkImage: require('../../assets/page/kantin.jpeg'),
      ctaText: 'Pesan Menu',
      ctaBg: '#dcfce7',
      ctaColor: '#15803d',
      cardBorder: '#bbf7d0',
      cardBg: '#fafefb',
      actionType: 'kantin',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Saldo Koperasi (Hanya Simpanan Wajib & Simpanan Sukarela) */}
      <HeaderBalance
        saldo={userBalance}
        moobiCoins={userCoins}
        userName={mockUser.name}
        avatarUri={userAvatarUri}
        jabatan={mockUser.jabatan}
        department={mockUser.department}
        masaKerjaBulan={mockUser.masaKerjaBulan}
        simpananWajib={walletState.simpananWajib}
        simpananSukarela={userBalance}
        onAvatarPress={() => onNavigateTab ? onNavigateTab('profil') : onNavigateScreen?.('profil')}
        onDetailPress={() => onNavigateTab ? onNavigateTab('keuangan') : onNavigateScreen?.('keuangan')}
        onDetailWajibPress={() => onNavigateScreen ? onNavigateScreen('simpanan_wajib') : onNavigateTab?.('keuangan')}
        onDetailSukarelaPress={() => onNavigateScreen ? onNavigateScreen('simpanan_sukarela') : onNavigateTab?.('keuangan')}
        onNavigateScreen={onNavigateScreen}
        onNavigateTab={onNavigateTab}
      />

      {/* 2. Plafon Pinjaman Karyawan (Menggantikan Promo Khusus Karyawan) */}
      <PlafonPinjamanCard
        plafonPinjaman={walletState.plafonPinjaman}
        pinjamanAktif={walletState.pinjamanAktif}
        angsuranPerBulan={walletState.angsuranPerBulan}
        sisaTenorBulan={walletState.sisaTenorBulan}
        onApplyPress={() => onNavigateScreen?.('pinjaman')}
        onPress={() => onNavigateScreen?.('pinjaman')}
      />

      {/* 3. Grid Icon Fitur Transaksional On-Demand & Koperasi */}
      <View style={styles.gridSection}>
        <View style={styles.gridHeaderRow}>
          <Text style={styles.sectionHeading}>Layanan Koperasi & Transaksi</Text>
        </View>

        <View style={styles.cleanGrid}>
          {cleanFeatures.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCol}
              onPress={() => handleGridMenuClick(item.id, item.title)}
              activeOpacity={0.65}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: item.bg,
                    borderColor: item.borderColor,
                    shadowColor: item.shadowColor,
                  },
                ]}
              >
                <AppIcon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.iconLabel} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. Artikel & Penawaran Koperasi */}
      <View style={styles.promoSection}>
        <View style={styles.promoSectionHeader}>
          <Text style={styles.sectionHeading}>Program & Fasilitas Anggota</Text>
          <Text style={styles.sectionSubHeading}>Fasilitas khusus karyawan PT Bakti Idola Tama</Text>
        </View>

        <View style={styles.promoCardsList}>
          {promoArticles.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={[
                styles.promoCardWrapper,
                {
                  backgroundColor: promo.cardBg,
                  borderColor: promo.cardBorder,
                },
              ]}
              onPress={() => onNavigateScreen?.(promo.actionType)}
              activeOpacity={0.82}
            >
              {/* Full Card Background Image */}
              <Image
                source={promo.watermarkImage}
                style={styles.promoFullBackgroundImage}
                resizeMode="cover"
              />

              {/* Gradient Overlay: Proteksi kontras teks di sisi kiri & transisi halus ke gambar di sisi kanan */}
              <LinearGradient
                colors={[
                  promo.cardBg,
                  promo.cardBg + 'FA',
                  promo.cardBg + 'E6',
                  promo.cardBg + '55',
                  'transparent',
                ]}
                locations={[0, 0.32, 0.56, 0.82, 1.0]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Top Row: Squircle Icon + Title */}
              <View style={styles.promoCardTopRow}>
                <View
                  style={[
                    styles.promoIconSquircle,
                    { backgroundColor: promo.iconBg },
                  ]}
                >
                  <AppIcon name={promo.icon} size={20} color="#ffffff" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitleText} numberOfLines={1}>
                    {promo.title}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.promoDescText}>{promo.desc}</Text>

              {/* Bottom CTA Action Row */}
              <View style={styles.promoCardFooterDivider} />
              <View style={styles.promoCardFooter}>
                <Text style={styles.promoFooterHint}>Fasilitas Resmi Anggota BIT</Text>
                <View
                  style={[
                    styles.promoCtaButton,
                    { backgroundColor: promo.ctaBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.promoCtaButtonText,
                      { color: promo.ctaColor },
                    ]}
                  >
                    {promo.ctaText}
                  </Text>
                  <AppIcon name="chevron-right" size={11} color={promo.ctaColor} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer Branding */}
      <View style={styles.footer}>
        <Text style={styles.footerMain}>
          Ekosistem Koperasi Karyawan PT Bakti Idola Tama
        </Text>
        <Text style={styles.footerSub}>
          Terdaftar & Terverifikasi Payroll PT BIT
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  gridSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  cleanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridCol: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 6,
  },
  iconLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  promoSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  promoSectionHeader: {
    marginBottom: 10,
  },
  sectionSubHeading: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  promoCardsList: {
    gap: 12,
  },
  promoCardWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  promoFullBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.75,
  },
  promoCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  promoIconSquircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  promoTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  promoDescText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 16,
    maxWidth: '82%',
    marginBottom: 12,
  },
  promoCardFooterDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 8,
  },
  promoCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoFooterHint: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  promoCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  promoCtaButtonText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerMain: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  footerSub: {
    fontSize: 9.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2,
  },
});
