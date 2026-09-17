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
import { colors } from '../theme/colors';
import { TabType, ActiveScreenType, BillCategoryType } from '../types';
import { HeaderBalance } from '../components/HeaderBalance';
import { ReminderCard } from '../components/ReminderCard';
import { PromoBannerCarousel } from '../components/PromoBannerCarousel';
import { AppIcon, IconType } from '../components/common/AppIcon';
import { mockWallet, mockUser } from '../data/mockData';

interface BerandaScreenProps {
  userBalance?: number;
  userCoins?: number;
  paidBills?: string[];
  onNavigateScreen?: (screen: ActiveScreenType) => void;
  onNavigateTab?: (tab: TabType) => void;
  onPayBillPress?: (category: BillCategoryType) => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  userBalance = mockWallet.saldoUtama,
  userCoins = mockWallet.moobiCoins,
  paidBills = ['internet'],
  onNavigateScreen,
  onNavigateTab,
  onPayBillPress,
}) => {

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleGridMenuClick = (id: string, title: string) => {
    switch (id) {
      case '1': // Produk Elektronik
        onNavigateScreen ? onNavigateScreen('produk') : Alert.alert('Elektronik', 'Membuka Katalog Elektronik');
        break;
      case '2': // Transfer
        onNavigateScreen ? onNavigateScreen('transfer') : Alert.alert('Transfer', 'Membuka Layanan Transfer');
        break;
      case '3': // Riwayat
        if (onNavigateTab) {
          onNavigateTab('riwayat');
        } else if (onNavigateScreen) {
          onNavigateScreen('riwayat');
        }
        break;
      case '4': // Tarik Tunai
        onNavigateScreen ? onNavigateScreen('tarik') : Alert.alert('Tarik Tunai', 'Membuka Layanan Tarik Tunai');
        break;
      case '5': // Tagihan
        if (onPayBillPress) {
          onPayBillPress('pln');
        } else if (onNavigateScreen) {
          onNavigateScreen('tagihan');
        }
        break;
      case '6': // Pulsa
        onNavigateScreen ? onNavigateScreen('pulsa') : Alert.alert('Pulsa', 'Membuka Layanan Pulsa & Paket Data');
        break;
      case '7': // Pinjaman
        onNavigateScreen ? onNavigateScreen('pinjaman') : Alert.alert('Pinjaman', 'Membuka Layanan Pinjaman');
        break;
      case '8': // Kantin
        onNavigateScreen ? onNavigateScreen('kantin') : Alert.alert('Kantin', 'Membuka Layanan Kantin');
        break;
      default:
        break;
    }
  };

  const handleServiceClick = (name: string) => {
    if (name.includes('Kantin')) {
      onNavigateScreen?.('kantin');
    } else if (name.includes('Elektronik') || name.includes('Produk')) {
      onNavigateScreen?.('produk');
    } else if (name.includes('Transfer')) {
      onNavigateScreen?.('transfer');
    } else if (name.includes('Tarik Tunai') || name.includes('Tarik')) {
      onNavigateScreen?.('tarik');
    } else if (name.includes('Pinjaman') || name.includes('PayLater') || name.includes('Bunga Spesial')) {
      onNavigateScreen?.('pinjaman');
    } else if (name.includes('Tagihan') || name.includes('PLN') || name.includes('BPJS') || name.includes('PPoB')) {
      onNavigateScreen?.('tagihan');
    } else if (name.includes('Pulsa')) {
      onNavigateScreen?.('pulsa');
    } else {
      Alert.alert('Layanan Moobi Koperasi', `Membuka fitur: ${name}\nTerhubung ke sistem PT Bakti Idola Tama.`);
    }
  };

  // High-Contrast Solid Vector Icons with Vibrant Accents
  const cleanFeatures: {
    id: string;
    title: string;
    icon: IconType;
    color: string;
    bg: string;
    borderColor: string;
    shadowColor: string;
    action: string;
  }[] = [
    {
      id: '1',
      title: 'Elektronik',
      icon: 'elektronik',
      color: '#ffffff',
      bg: '#1d72db',
      borderColor: '#1462c4',
      shadowColor: '#1d72db',
      action: 'Katalog Produk Elektronik BIT',
    },
    {
      id: '2',
      title: 'Transfer',
      icon: 'transfer',
      color: '#ffffff',
      bg: '#1d72db',
      borderColor: '#1462c4',
      shadowColor: '#1d72db',
      action: 'Transfer ke Bank & Sesama',
    },
    {
      id: '3',
      title: 'Riwayat',
      icon: 'riwayat',
      color: '#ffffff',
      bg: '#0284c7',
      borderColor: '#0369a1',
      shadowColor: '#0284c7',
      action: 'Riwayat Transaksi',
    },
    {
      id: '4',
      title: 'Tarik Tunai',
      icon: 'tarik',
      color: '#ffffff',
      bg: '#059669',
      borderColor: '#047857',
      shadowColor: '#059669',
      action: 'Tarik Tunai Koperasi',
    },
    {
      id: '5',
      title: 'Tagihan',
      icon: 'tagihan',
      color: '#ffffff',
      bg: '#ea580c',
      borderColor: '#c2410c',
      shadowColor: '#ea580c',
      action: 'Bayar Tagihan PLN & BPJS',
    },
    {
      id: '6',
      title: 'Pulsa',
      icon: 'pulsa',
      color: '#ffffff',
      bg: '#2563eb',
      borderColor: '#1d4ed8',
      shadowColor: '#2563eb',
      action: 'Beli Pulsa & Paket Data',
    },
    {
      id: '7',
      title: 'Pinjaman',
      icon: 'paylater',
      color: '#ffffff',
      bg: '#d97706',
      borderColor: '#b45309',
      shadowColor: '#d97706',
      action: 'Pinjaman & PayLater Karyawan',
    },
    {
      id: '8',
      title: 'Kantin',
      icon: 'kantin',
      color: '#ffffff',
      bg: '#16a34a',
      borderColor: '#15803d',
      shadowColor: '#16a34a',
      action: 'Kantin Digital',
    },
  ];

  const transferDestinations = [
    {
      id: '1',
      name: 'Budi S.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      tag: 'BCA',
      color: '#1d72db',
    },
    {
      id: '2',
      name: 'Siti A.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      tag: 'Moobi',
      color: '#00aa13',
    },
    {
      id: '3',
      name: 'Rudi W.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      tag: 'e-Wallet',
      color: '#f59e0b',
    },
    {
      id: '4',
      name: 'Baru',
      subTag: '+ Rekening',
      isAdd: true,
    },
  ];

  const promoArticles: {
    id: string;
    title: string;
    desc: string;
    icon: IconType;
    color: string;
    cardBg: string;
    borderColor: string;
    iconBg: string;
    arrowBg: string;
    arrowColor: string;
    action: string;
  }[] = [
    {
      id: '1',
      title: 'Reward & Cashback PPoB',
      desc: 'Dapatkan cashback poin reward setiap bayar tagihan, pulsa & token',
      icon: 'gift',
      color: '#ffffff',
      cardBg: '#e8f2fe',
      borderColor: '#93c5fd',
      iconBg: '#1d72db',
      arrowBg: '#dbeafe',
      arrowColor: '#1d72db',
      action: 'Promo PPoB & Reward Cashback',
    },
    {
      id: '2',
      title: 'Diskon Pre-Order Kantin',
      desc: 'Cashback 10% pesan makan siang sebelum jam 10:00 WIB (Bebas Antre)',
      icon: 'food',
      color: '#ffffff',
      cardBg: '#eaf8ed',
      borderColor: '#86efac',
      iconBg: '#16a34a',
      arrowBg: '#dcfce7',
      arrowColor: '#15803d',
      action: 'Promo Pre-Order Kantin',
    },
    {
      id: '3',
      title: 'Bunga Spesial Anggota 0.8%',
      desc: 'Pinjaman modal kerja & darurat bunga flat terpotong payroll otomatis',
      icon: 'bolt',
      color: '#ffffff',
      cardBg: '#fff7ed',
      borderColor: '#fcd34d',
      iconBg: '#d97706',
      arrowBg: '#fef3c7',
      arrowColor: '#b45309',
      action: 'Pinjaman Khusus Anggota',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Saldo Koperasi & Kantin */}
      <HeaderBalance
        saldo={userBalance}
        moobiCoins={userCoins}
        userName={mockUser.name}

        department={mockUser.department}
        shift={mockUser.shift}
        onTopUpPress={() => onNavigateScreen?.('transfer')}
        onTarikPress={() => onNavigateScreen?.('tarik')}
        onTransferPress={() => onNavigateScreen?.('transfer')}
        onKantinPress={() => onNavigateScreen?.('kantin')}
        onPinjamanPress={() => onNavigateScreen?.('pinjaman')}
      />

      {/* 2. Pengingat Tagihan Listrik / Cicilan Terintegrasi */}
      <ReminderCard
        paidBills={paidBills}
        onPayPress={(cat) => {
          if (onPayBillPress) {
            onPayBillPress(cat);
          } else {
            onNavigateScreen?.('tagihan');
          }
        }}
      />

      {/* 4. Auto-Sliding Promo Carousel Khusus Produk PT Bakti Idola Tama (Miyako, Rinnai, Shimizu) */}
      <PromoBannerCarousel />

      {/* 5. Clean Grid Icon Features */}
      <View style={styles.gridSection}>
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
                <AppIcon name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.iconLabel} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 6. Transfer Cepat (Ke Rekening Bank, e-Wallet, & Kontak) */}
      <View style={styles.contactsSection}>
        <View style={styles.transferSectionHeader}>
          <Text style={styles.sectionHeading}>Transfer</Text>
          <TouchableOpacity onPress={() => onNavigateScreen?.('transfer')}>
            <Text style={styles.seeAllTransferText}>Cari Rekening / Bank ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transferGridRow}>
          {transferDestinations.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.contactCard}
              onPress={() => onNavigateScreen?.('transfer')}
              activeOpacity={0.75}
            >
              {c.isAdd ? (
                <View style={styles.contactAvatarAdd}>
                  <AppIcon name="topup" size={18} color="#1d72db" />
                </View>
              ) : (
                <Image
                  source={{ uri: c.avatar }}
                  style={styles.contactAvatarImage}
                />
              )}
              <Text style={styles.contactTitle} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.contactSubTag} numberOfLines={1}>
                {c.tag || c.subTag || ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 7. Artikel Promo & Penawaran Koperasi */}
      <View style={styles.promoSection}>
        <View style={styles.promoSectionHeader}>
          <Text style={styles.sectionHeading}>Promo & Penawaran</Text>
          <TouchableOpacity onPress={() => handleServiceClick('Semua Promo & Artikel')}>
            <Text style={styles.seeAllPromoText}>Lihat Semua ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.promoCardsList}>
          {promoArticles.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={[
                styles.promoArticleCard,
                {
                  backgroundColor: promo.cardBg,
                  borderColor: promo.borderColor,
                },
              ]}
              onPress={() => handleServiceClick(promo.action)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.promoIconContainer,
                  {
                    backgroundColor: promo.iconBg,
                    borderColor: promo.borderColor,
                  },
                ]}
              >
                <AppIcon name={promo.icon} size={22} color={promo.color} />
              </View>

              <View style={styles.promoTextContainer}>
                <Text style={styles.promoArticleTitle} numberOfLines={1}>
                  {promo.title}
                </Text>
                <Text style={styles.promoArticleDesc}>{promo.desc}</Text>
              </View>

              <View
                style={[
                  styles.promoArrowWrapper,
                  { backgroundColor: promo.arrowBg },
                ]}
              >
                <AppIcon name="chevron-right" size={13} color={promo.arrowColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer Branding */}
      <View style={styles.footer}>
        <Text style={styles.footerMain}>
          Ekosistem Koperasi & Kantin PT Bakti Idola Tama
        </Text>
        <Text style={styles.footerSub}>
          Didukung oleh Moobi Platform 2026 • Notifikasi WhatsApp Otomatis
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
    paddingBottom: 120, // Ample space to prevent bottom navigation bar overlap
  },
  sectionHeaderBox: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  ticketBannerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  ticketBanner: {
    backgroundColor: '#1d72db',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  ticketLeftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketGiftIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  ticketTextCol: {
    flex: 1,
  },
  ticketTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  ticketTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#bae6fd',
    letterSpacing: 0.6,
  },
  discountPill: {
    backgroundColor: '#fef08a',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  discountPillText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#854d0e',
  },
  ticketText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#ffffff',
  },
  ticketDashedLine: {
    width: 1,
    height: 28,
    borderLeftWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  ticketBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: 0.5,
  },
  gridSection: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cleanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCol: {
    width: '25%',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3.5,
    elevation: 3,
  },
  iconText: {
    fontSize: 20,
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  contactsSection: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  transferSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seeAllTransferText: {
    fontSize: 12,
    color: '#1d72db',
    fontWeight: '600',
  },
  transferGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: 2,
  },
  contactCard: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  contactAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 5,
  },
  contactAvatarAdd: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  contactTitle: {
    fontSize: 11.5,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
  },
  contactSubTag: {
    fontSize: 9.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
    fontWeight: '500',
  },
  promoSection: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  promoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  promoHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  promoCountBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  promoCountBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  seeAllPromoText: {
    fontSize: 11.5,
    color: '#1d72db',
    fontWeight: '600',
  },
  promoCardsList: {
    gap: 10,
  },
  promoArticleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  promoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  promoTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  promoArticleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  promoArticleDesc: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
    fontWeight: '500',
  },
  promoArrowWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerMain: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  footerSub: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 3,
    textAlign: 'center',
  },
});
