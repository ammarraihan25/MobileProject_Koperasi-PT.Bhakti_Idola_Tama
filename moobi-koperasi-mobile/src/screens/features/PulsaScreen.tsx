import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';

interface PulsaScreenProps {
  onBack: () => void;
  userBalance: number;
  onPurchaseSuccess?: (
    amount: number,
    product: string,
    operatorName: string,
    phoneNumber: string
  ) => void;
}

export const PulsaScreen: React.FC<PulsaScreenProps> = ({
  onBack,
  userBalance,
  onPurchaseSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0812-8921-3849');
  const [tab, setTab] = useState<'pulsa' | 'data'>('pulsa');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const pulsaItems = [
    {
      id: 'p10',
      title: 'Pulsa 10.000',
      amount: '10.000',
      price: 10500,
      normalPrice: 12000,
      desc: 'Masa aktif +15 hari',
      tag: null,
    },
    {
      id: 'p25',
      title: 'Pulsa 25.000',
      amount: '25.000',
      price: 25000,
      normalPrice: 26500,
      desc: 'Masa aktif +30 hari • Promo BIT',
      tag: 'PROMO BIT',
      isPromo: true,
    },
    {
      id: 'p50',
      title: 'Pulsa 50.000',
      amount: '50.000',
      price: 49500,
      normalPrice: 51500,
      desc: 'Masa aktif +45 hari • Diskon Anggota',
      tag: 'HEMAT Rp 2.000',
      isPromo: true,
    },
    {
      id: 'p100',
      title: 'Pulsa 100.000',
      amount: '100.000',
      price: 98000,
      normalPrice: 102000,
      desc: 'Masa aktif +60 hari • Diskon Anggota',
      tag: 'TERLARIS',
      isPromo: true,
    },
  ];

  const dataItems = [
    {
      id: 'd5',
      title: 'Flash 5GB (7 Hari)',
      amount: '5 GB',
      price: 25000,
      normalPrice: 28000,
      desc: 'Kuota Utama 5GB • 24 Jam Semua Jaringan',
      tag: null,
    },
    {
      id: 'd15',
      title: 'OMG! 15GB (30 Hari)',
      amount: '15 GB',
      price: 55000,
      normalPrice: 62000,
      desc: '10GB Kuota Utama + 5GB Apps (WA/YouTube)',
      tag: 'TERLARIS',
      isPromo: true,
    },
    {
      id: 'd35',
      title: 'Super Kuota 35GB (30 Hari)',
      amount: '35 GB',
      price: 85000,
      normalPrice: 95000,
      desc: '25GB Utama + 10GB Streaming Prime Video',
      tag: 'HEMAT Rp 10.000',
      isPromo: true,
    },
    {
      id: 'dunlim',
      title: 'Unlimited Max 55GB (30 Hari)',
      amount: '55 GB',
      price: 120000,
      normalPrice: 135000,
      desc: 'Tanpa Batas Kuota • FUP 55GB High Speed 5G',
      tag: 'BEST VALUE',
      isPromo: true,
    },
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const getOperatorInfo = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (
      clean.startsWith('0811') ||
      clean.startsWith('0812') ||
      clean.startsWith('0813') ||
      clean.startsWith('0821') ||
      clean.startsWith('0822') ||
      clean.startsWith('0823') ||
      clean.startsWith('0851') ||
      clean.startsWith('0852') ||
      clean.startsWith('0853')
    ) {
      return { name: 'TELKOMSEL', color: '#dc2626', bg: '#fee2e2' };
    }
    if (
      clean.startsWith('0814') ||
      clean.startsWith('0815') ||
      clean.startsWith('0816') ||
      clean.startsWith('0855') ||
      clean.startsWith('0856') ||
      clean.startsWith('0857') ||
      clean.startsWith('0858')
    ) {
      return { name: 'INDOSAT', color: '#d97706', bg: '#fef3c7' };
    }
    if (
      clean.startsWith('0817') ||
      clean.startsWith('0818') ||
      clean.startsWith('0819') ||
      clean.startsWith('0859') ||
      clean.startsWith('0877') ||
      clean.startsWith('0878')
    ) {
      return { name: 'XL AXIATA', color: '#2563eb', bg: '#dbeafe' };
    }
    if (
      clean.startsWith('0831') ||
      clean.startsWith('0832') ||
      clean.startsWith('0833') ||
      clean.startsWith('0838')
    ) {
      return { name: 'AXIS', color: '#7c3aed', bg: '#ede9fe' };
    }
    if (
      clean.startsWith('0881') ||
      clean.startsWith('0882') ||
      clean.startsWith('0883') ||
      clean.startsWith('0884') ||
      clean.startsWith('0885') ||
      clean.startsWith('0886') ||
      clean.startsWith('0887') ||
      clean.startsWith('0888') ||
      clean.startsWith('0889')
    ) {
      return { name: 'SMARTFREN', color: '#db2777', bg: '#fce7f3' };
    }
    if (
      clean.startsWith('0895') ||
      clean.startsWith('0896') ||
      clean.startsWith('0897') ||
      clean.startsWith('0898') ||
      clean.startsWith('0899')
    ) {
      return { name: 'TRI (3)', color: '#ea580c', bg: '#ffedd5' };
    }
    return { name: 'OPERATOR', color: '#0284c7', bg: '#e0f2fe' };
  };

  const currentOp = getOperatorInfo(phoneNumber);

  const handleCheckout = () => {
    if (!selectedProduct) {
      Alert.alert('Pilih Paket', 'Silakan pilih nominal pulsa atau paket data.');
      return;
    }
    if (phoneNumber.trim().length < 9) {
      Alert.alert('Nomor Tidak Valid', 'Silakan masukkan nomor handphone yang valid.');
      return;
    }
    if (userBalance < selectedProduct.price) {
      Alert.alert(
        'Saldo Tidak Cukup',
        `Saldo koperasi Rp ${formatRupiah(userBalance)}. Kurang untuk membeli Rp ${formatRupiah(
          selectedProduct.price
        )}.`
      );
      return;
    }

    if (onPurchaseSuccess) {
      onPurchaseSuccess(selectedProduct.price, selectedProduct.title, currentOp.name, phoneNumber);
    }

    Alert.alert(
      'Transaksi Berhasil! 📱',
      `Berhasil membeli ${selectedProduct.title} untuk nomor ${phoneNumber}.\n\nTotal: Rp ${formatRupiah(
        selectedProduct.price
      )}\nSN: 8912739102931209`,
      [
        {
          text: 'Kembali ke Beranda',
          onPress: onBack,
        },
      ]
    );
  };

  const currentList = tab === 'pulsa' ? pulsaItems : dataItems;

  return (
    <View style={styles.screenContainer}>
      {/* Top Bar Navigation */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavContent}>
          <Text style={styles.topNavTitle}>Pulsa & Paket Data</Text>
          <Text style={styles.topNavSub}>Isi ulang pulsa & kuota internet resmi PT BIT</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Hero Wallet Balance Card (Blue Theme) */}
        <View style={styles.heroBalanceCard}>
          <View style={styles.heroGlowCircle} />
          <View style={styles.heroBalanceTop}>
            <View style={styles.heroLabelWrap}>
              <AppIcon name="wallet" size={15} color="#38bdf8" />
              <Text style={styles.heroBalanceLabel}>Sumber Dana: Saldo Koperasi</Text>
            </View>
          </View>

          <View style={styles.heroBalanceMain}>
            <Text style={styles.heroCurrency}>Rp</Text>
            <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
          </View>

          <View style={styles.heroFooter}>
            <Text style={styles.heroSubText}>
              Bisa bayar langsung via Saldo Koperasi atau Potong Gaji Payroll
            </Text>
          </View>
        </View>

        {/* Phone Number Input Card */}
        <View style={styles.phoneInputCard}>
          <View style={styles.phoneHeaderRow}>
            <View style={styles.phoneHeaderTitleRow}>
              <AppIcon name="phone" size={13} color="#0284c7" />
              <Text style={styles.inputLabel}>NOMOR HANDPHONE PELANGGAN</Text>
            </View>
            <View style={[styles.providerBadge, { backgroundColor: currentOp.bg }]}>
              <View style={[styles.providerDot, { backgroundColor: currentOp.color }]} />
              <Text style={[styles.providerBadgeText, { color: currentOp.color }]}>
                {currentOp.name}
              </Text>
            </View>
          </View>

          <View style={styles.phoneInputRow}>
            <View style={styles.phoneIconWrap}>
              <AppIcon name="phone" size={15} color="#0284c7" />
            </View>
            <TextInput
              style={styles.phoneTextInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="Contoh: 0812xxxxxxxx"
              placeholderTextColor="#94a3b8"
            />
            {phoneNumber.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setPhoneNumber('')}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={13} color="#94a3b8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.myNumberBtn}
              onPress={() => setPhoneNumber('0812-8921-3849')}
              activeOpacity={0.7}
            >
              <AppIcon name="user" size={12} color="#0284c7" />
              <Text style={styles.myNumberBtnText}>Nomor Saya</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher: Pulsa Reguler vs Paket Data */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'pulsa' && styles.tabBtnActive]}
            onPress={() => {
              setTab('pulsa');
              setSelectedProduct(null);
            }}
            activeOpacity={0.8}
          >
            <AppIcon
              name="zap"
              size={14}
              color={tab === 'pulsa' ? '#0284c7' : '#64748b'}
            />
            <Text style={[styles.tabBtnText, tab === 'pulsa' && styles.tabBtnTextActive]}>
              Pulsa Reguler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'data' && styles.tabBtnActive]}
            onPress={() => {
              setTab('data');
              setSelectedProduct(null);
            }}
            activeOpacity={0.8}
          >
            <AppIcon
              name="wifi"
              size={14}
              color={tab === 'data' ? '#0284c7' : '#64748b'}
            />
            <Text style={[styles.tabBtnText, tab === 'data' && styles.tabBtnTextActive]}>
              Paket Data Internet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            {tab === 'pulsa' ? 'PILIH NOMINAL PULSA' : 'PILIH PAKET INTERNET'}
          </Text>
          <Text style={styles.sectionHint}>Harga khusus anggota</Text>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {currentList.map((item) => {
            const isSelected = selectedProduct?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.productCard, isSelected && styles.productCardActive]}
                onPress={() => setSelectedProduct(item)}
                activeOpacity={0.85}
              >
                {/* Header Row: Title & Promo Tag */}
                <View style={styles.productHeaderRow}>
                  <View style={styles.productTitleWrap}>
                    <Text style={[styles.productTitle, isSelected && styles.productTitleActive]}>
                      {item.title}
                    </Text>
                  </View>

                  {item.tag && (
                    <View style={styles.promoTag}>
                      <Text style={styles.promoTagText}>{item.tag}</Text>
                    </View>
                  )}
                </View>

                {/* Subtitle / Description */}
                <Text style={styles.productDesc}>{item.desc}</Text>

                {/* Divider Line */}
                <View style={styles.cardDivider} />

                {/* Bottom Row: Price & Selection Radio */}
                <View style={styles.productBottomRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Harga Anggota</Text>
                    <View style={styles.priceValueRow}>
                      <Text style={[styles.productPrice, isSelected && styles.productPriceActive]}>
                        Rp {formatRupiah(item.price)}
                      </Text>
                      {item.normalPrice && item.normalPrice > item.price && (
                        <Text style={styles.normalPrice}>Rp {formatRupiah(item.normalPrice)}</Text>
                      )}
                    </View>
                  </View>

                  {/* Radio Selection Indicator */}
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Checkout Summary Card */}
        {selectedProduct && (
          <View style={styles.checkoutFooter}>
            <View style={styles.checkoutSummary}>
              <Text style={styles.checkoutSummaryLabel}>Total Bayar (Saldo Koperasi):</Text>
              <View style={styles.checkoutSummaryValueRow}>
                <Text style={styles.checkoutCurrency}>Rp</Text>
                <Text style={styles.checkoutSummaryValue}>
                  {formatRupiah(selectedProduct.price)}
                </Text>
              </View>
              <Text style={styles.checkoutPackageName} numberOfLines={1}>
                {selectedProduct.title} • {phoneNumber}
              </Text>
            </View>

            <TouchableOpacity style={styles.buyBtn} onPress={handleCheckout} activeOpacity={0.85}>
              <Text style={styles.buyBtnText}>Beli Sekarang</Text>
              <AppIcon name="chevron-right" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNavBar: {
    backgroundColor: '#1d72db',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  topNavContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  topNavSub: {
    color: '#dbeafe',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  heroBalanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(2, 132, 199, 0.35)',
  },
  heroBalanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBalanceLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  heroBalanceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  heroCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38bdf8',
  },
  heroBalanceAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroFooter: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroSubText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  phoneInputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  providerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  providerBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingLeft: 8,
    paddingRight: 4,
    height: 48,
  },
  phoneIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  myNumberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  myNumberBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284c7',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  productsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  productCardActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0284c7',
    borderWidth: 1.5,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  productHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  productTitleWrap: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  productTitleActive: {
    color: '#0369a1',
  },
  promoTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  promoTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  productDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 10,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 10,
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: -0.3,
  },
  productPriceActive: {
    color: '#0284c7',
  },
  normalPrice: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  radioCircleActive: {
    borderColor: '#0284c7',
    backgroundColor: '#0284c7',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  checkoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4,
  },
  checkoutSummary: {
    flex: 1,
    marginRight: 12,
  },
  checkoutSummaryLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  checkoutSummaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginVertical: 1,
  },
  checkoutCurrency: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  checkoutSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: -0.5,
  },
  checkoutPackageName: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  buyBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

