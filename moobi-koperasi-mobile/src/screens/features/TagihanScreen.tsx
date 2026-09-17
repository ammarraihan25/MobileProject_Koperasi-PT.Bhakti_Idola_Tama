import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';

interface TagihanScreenProps {
  onBack: () => void;
  userBalance: number;
  initialCategory?: 'pln' | 'bpjs' | 'pdam' | 'internet';
  paidBills?: string[];
  onPaymentSuccess?: (
    amount: number,
    categoryName: string,
    catId: 'pln' | 'bpjs' | 'pdam' | 'internet',
    paymentSource: 'saldo' | 'payroll',
    customerId: string
  ) => void;
}

export const TagihanScreen: React.FC<TagihanScreenProps> = ({
  onBack,
  userBalance,
  initialCategory = 'pln',
  paidBills = ['internet'],
  onPaymentSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'pln' | 'bpjs' | 'pdam' | 'internet'>(
    initialCategory
  );
  const [customerId, setCustomerId] = useState('');
  const [billChecked, setBillChecked] = useState(true);
  const [paymentSource, setPaymentSource] = useState<'saldo' | 'payroll'>('saldo');

  const categories = [
    {
      id: 'pln' as const,
      name: 'PLN Listrik',
      subName: 'Pascabayar / Token',
      defaultId: '5371-2099-1823',
      logo: require('../../../assets/tagihan/pln.png'),
      billAmount: 148500,
      customerName: 'Budi Santoso (Rumah)',
      serviceDetail: 'Tarif R1M / 1300 VA (Stand: 2841-2950)',
      period: 'September 2026',
    },
    {
      id: 'bpjs' as const,
      name: 'BPJS',
      subName: 'Iuran Mandiri / Wajib',
      defaultId: '0001-8293-8472',
      logo: require('../../../assets/tagihan/bpjs.png'),
      billAmount: 70000,
      customerName: 'Budi Santoso (Keluarga)',
      serviceDetail: 'Kelas 1 - Peserta Mandiri (2 Jiwa)',
      period: 'September 2026',
    },
    {
      id: 'pdam' as const,
      name: 'PDAM Air',
      subName: 'Tirta Kencana',
      defaultId: '0921-8832-1029',
      logo: require('../../../assets/tagihan/pdam.png'),
      billAmount: 56000,
      customerName: 'Budi Santoso',
      serviceDetail: 'Golongan Rumah Tangga A2 (24 m³)',
      period: 'September 2026',
    },
    {
      id: 'internet' as const,
      name: 'WiFi ID',
      subName: 'IndiHome / Fiber',
      defaultId: '5200-8812-9901',
      logo: require('../../../assets/tagihan/wifi.png'),
      billAmount: 280000,
      customerName: 'IndiHome 100Mbps',
      serviceDetail: 'Paket Internet Fiber Unlimited 100 Mbps',
      period: 'September 2026',
    },
  ];

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      const matched = categories.find((c) => c.id === initialCategory);
      if (matched) {
        setCustomerId(matched.defaultId);
        setBillChecked(true);
      }
    }
  }, [initialCategory]);

  const currentCat = categories.find((c) => c.id === selectedCategory) || categories[0];
  const isCurrentPaid = paidBills.includes(selectedCategory);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleSelectCategory = (catId: 'pln' | 'bpjs' | 'pdam' | 'internet') => {
    setSelectedCategory(catId);
    const matched = categories.find((c) => c.id === catId);
    if (matched) {
      setCustomerId(matched.defaultId);
      setBillChecked(true);
    }
  };

  const handleInquiry = () => {
    if (!customerId.trim()) {
      Alert.alert('Input Kosong', 'Silakan masukkan nomor pelanggan / ID tagihan.');
      return;
    }
    setBillChecked(true);
  };

  const handlePay = () => {
    if (isCurrentPaid) {
      Alert.alert('Tagihan Lunas', 'Tagihan ini sudah dibayar untuk periode ini.');
      return;
    }

    if (paymentSource === 'saldo' && userBalance < currentCat.billAmount) {
      Alert.alert(
        'Saldo Tidak Cukup',
        `Saldo koperasi Anda Rp ${formatRupiah(userBalance)}. Kurang untuk membayar Rp ${formatRupiah(
          currentCat.billAmount
        )}.`
      );
      return;
    }

    if (onPaymentSuccess) {
      onPaymentSuccess(
        currentCat.billAmount,
        currentCat.name,
        currentCat.id,
        paymentSource,
        customerId
      );
    }

    Alert.alert(
      'Pembayaran Berhasil! 🧾',
      `Tagihan ${currentCat.name} senilai Rp ${formatRupiah(currentCat.billAmount)} berhasil dibayar.\n\nNomor Pelanggan: ${customerId}\nMetode: ${
        paymentSource === 'saldo' ? 'Saldo Koperasi Anggota' : 'Potong Slip Gaji Payroll PT BIT'
      }\nNo. Struk: PPOB-${Date.now().toString().slice(-6)}`,
      [
        {
          text: 'Kembali ke Beranda',
          onPress: onBack,
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Bar Navigation */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavContent}>
          <Text style={styles.topNavTitle}>Bayar Tagihan & PPoB</Text>
          <Text style={styles.topNavSub}>Listrik, BPJS, PDAM & Internet</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Hero Wallet Balance Card */}
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

        {/* Category Grid Section - Vertical Centered Stack Layout */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>PILIH JENIS TAGIHAN</Text>
          <Text style={styles.sectionHint}>Pilih salah satu</Text>
        </View>

        <View style={styles.catGrid}>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catCard, isSelected && styles.catCardActive]}
                onPress={() => handleSelectCategory(c.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconWrap, isSelected && styles.catIconWrapActive]}>
                  <Image source={c.logo} style={styles.catLogoImg} resizeMode="contain" />
                </View>
                <Text
                  style={[styles.catName, isSelected && styles.catNameActive]}
                  numberOfLines={1}
                >
                  {c.name}
                </Text>
                {isSelected && (
                  <View style={styles.catActiveIndicator}>
                    <View style={styles.catActiveDot} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Customer ID Input Card - Clean & Balanced */}
        <View style={styles.formCard}>
          <View style={styles.inputHeaderRow}>
            <View style={styles.inputHeaderTitleRow}>
              <AppIcon name="receipt" size={14} color="#1d72db" />
              <Text style={styles.inputCardLabel}>NOMOR PELANGGAN / ID TAGIHAN</Text>
            </View>
          </View>

          <View style={styles.inputBoxRow}>
            <View style={styles.inputPrefixIcon}>
              <AppIcon name="receipt" size={15} color="#1d72db" />
            </View>
            <TextInput
              style={styles.textInputField}
              value={customerId}
              onChangeText={(t) => {
                setCustomerId(t);
                setBillChecked(false);
              }}
              placeholder="Contoh: 5200-8812-9901"
              placeholderTextColor="#94a3b8"
            />
            {customerId.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setCustomerId('');
                  setBillChecked(false);
                }}
              >
                <AppIcon name="x" size={14} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.checkBillBtn}
            onPress={handleInquiry}
            activeOpacity={0.8}
          >
            <AppIcon name="search" size={15} color="#ffffff" />
            <Text style={styles.checkBillBtnText}>Cek Tagihan</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Details Result Card (Invoice Ticket Style) */}
        {billChecked && (
          <View style={styles.billDetailsCard}>
            {/* Ticket Header */}
            <View style={styles.billDetailHeader}>
              <View style={styles.billHeaderLeft}>
                <View style={styles.billLogoWrap}>
                  <Image source={currentCat.logo} style={styles.billLogoImg} resizeMode="contain" />
                </View>
                <View style={styles.billHeaderTextWrap}>
                  <Text style={styles.billDetailTitle} numberOfLines={1}>
                    Tagihan {currentCat.name}
                  </Text>
                  <Text style={styles.billDetailSubId}>ID: {customerId}</Text>
                </View>
              </View>

              {isCurrentPaid ? (
                <View style={styles.paidBadge}>
                  <View style={styles.paidDot} />
                  <Text style={styles.paidBadgeText}>SUDAH DIBAYAR</Text>
                </View>
              ) : (
                <View style={styles.unpaidBadge}>
                  <View style={styles.unpaidDot} />
                  <Text style={styles.unpaidBadgeText}>BELUM DIBAYAR</Text>
                </View>
              )}
            </View>

            {/* Perforated Divider */}
            <View style={styles.ticketDividerRow}>
              <View style={styles.ticketDottedLine} />
            </View>

            {/* Bill Info Rows */}
            <View style={styles.detailList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nama Pelanggan</Text>
                <Text style={styles.detailValue}>{currentCat.customerName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Periode Tagihan</Text>
                <Text style={styles.detailValue}>{currentCat.period}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Detail Layanan</Text>
                <Text style={styles.detailValueSub}>{currentCat.serviceDetail}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Biaya Admin Koperasi</Text>
                <View style={styles.freeAdminBadge}>
                  <Text style={styles.freeAdminBadgeText}>GRATIS (Rp 0)</Text>
                </View>
              </View>
            </View>

            {/* Total Amount Box */}
            <View style={styles.totalAmountBox}>
              <Text style={styles.totalAmountLabel}>TOTAL TAGIHAN</Text>
              <View style={styles.totalAmountValueRow}>
                <Text style={styles.totalAmountCurrency}>Rp</Text>
                <Text style={styles.totalAmountNumber}>{formatRupiah(currentCat.billAmount)}</Text>
              </View>
            </View>

            {/* Payment Source Options */}
            <View style={styles.paymentSourceHeader}>
              <Text style={styles.paymentSourceLabel}>PILIH METODE PEMBAYARAN:</Text>
            </View>

            <View style={styles.paymentSourceRow}>
              {/* Option 1: Saldo Koperasi */}
              <TouchableOpacity
                style={[
                  styles.sourceBtn,
                  paymentSource === 'saldo' && styles.sourceBtnActive,
                ]}
                onPress={() => setPaymentSource('saldo')}
                activeOpacity={0.8}
              >
                <View style={styles.sourceBtnTop}>
                  <View style={[styles.sourceIconBox, paymentSource === 'saldo' && styles.sourceIconBoxActive]}>
                    <AppIcon
                      name="wallet"
                      size={15}
                      color={paymentSource === 'saldo' ? '#1d72db' : '#64748b'}
                    />
                  </View>
                  <View
                    style={[
                      styles.sourceRadio,
                      paymentSource === 'saldo' && styles.sourceRadioActive,
                    ]}
                  >
                    {paymentSource === 'saldo' && <View style={styles.sourceRadioDot} />}
                  </View>
                </View>
                <Text
                  style={[
                    styles.sourceBtnTitle,
                    paymentSource === 'saldo' && styles.sourceBtnTitleActive,
                  ]}
                >
                  Saldo Koperasi
                </Text>
                <Text style={styles.sourceBtnSub}>
                  Tersedia: Rp {formatRupiah(userBalance)}
                </Text>
              </TouchableOpacity>

              {/* Option 2: Potong Slip Gaji */}
              <TouchableOpacity
                style={[
                  styles.sourceBtn,
                  paymentSource === 'payroll' && styles.sourceBtnActive,
                ]}
                onPress={() => setPaymentSource('payroll')}
                activeOpacity={0.8}
              >
                <View style={styles.sourceBtnTop}>
                  <View style={[styles.sourceIconBox, paymentSource === 'payroll' && styles.sourceIconBoxActive]}>
                    <AppIcon
                      name="receipt"
                      size={15}
                      color={paymentSource === 'payroll' ? '#1d72db' : '#64748b'}
                    />
                  </View>
                  <View
                    style={[
                      styles.sourceRadio,
                      paymentSource === 'payroll' && styles.sourceRadioActive,
                    ]}
                  >
                    {paymentSource === 'payroll' && <View style={styles.sourceRadioDot} />}
                  </View>
                </View>
                <Text
                  style={[
                    styles.sourceBtnTitle,
                    paymentSource === 'payroll' && styles.sourceBtnTitleActive,
                  ]}
                >
                  Potong Slip Gaji
                </Text>
                <Text style={styles.sourceBtnSub}>Payroll Otomatis PT BIT</Text>
              </TouchableOpacity>
            </View>

            {/* Pay Action Button */}
            <TouchableOpacity
              style={[styles.payBtn, isCurrentPaid && styles.payBtnDisabled]}
              onPress={handlePay}
              disabled={isCurrentPaid}
              activeOpacity={0.85}
            >
              <Text style={styles.payBtnText}>
                {isCurrentPaid
                  ? '✓ Tagihan Ini Sudah Lunas'
                  : `Bayar Sekarang • Rp ${formatRupiah(currentCat.billAmount)} ›`}
              </Text>
            </TouchableOpacity>

            {/* Security Assurance */}
            <View style={styles.securityNoteRow}>
              <AppIcon name="lock" size={12} color="#94a3b8" />
              <Text style={styles.securityNoteText}>
                Transaksi resmi terverifikasi & terhubung langsung ke biller PPoB
              </Text>
            </View>
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
    paddingTop: 16,
    paddingBottom: 36,
  },
  heroBalanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    color: '#64748b',
    fontWeight: '500',
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
  catGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  catCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  catCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
    borderWidth: 1.5,
    shadowColor: '#1d72db',
    shadowOpacity: 0.12,
  },
  catIconWrap: {
    width: 44,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingHorizontal: 2,
  },
  catIconWrapActive: {
    backgroundColor: '#ffffff',
  },
  catLogoImg: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  catNameActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  catActiveIndicator: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputCardLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 48,
  },
  inputPrefixIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInputField: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  clearBtn: {
    padding: 6,
  },
  checkBillBtn: {
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 2,
  },
  checkBillBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  billDetailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    padding: 14,
  },
  billDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  billHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  billHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  billLogoWrap: {
    width: 42,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 2,
  },
  billLogoImg: {
    width: '100%',
    height: '100%',
  },
  billDetailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  billDetailSubId: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  unpaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
    flexShrink: 0,
  },
  unpaidDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#dc2626',
  },
  unpaidBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: 0.2,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    flexShrink: 0,
  },
  paidDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16a34a',
  },
  paidBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.2,
  },
  ticketDividerRow: {
    marginVertical: 10,
  },
  ticketDottedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
  },
  detailList: {
    gap: 7,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  detailValueSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    maxWidth: '55%',
    textAlign: 'right',
  },
  freeAdminBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  freeAdminBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  totalAmountBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    marginTop: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  totalAmountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalAmountValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalAmountCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d72db',
  },
  totalAmountNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: -0.5,
  },
  paymentSourceHeader: {
    marginBottom: 8,
  },
  paymentSourceLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  paymentSourceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sourceBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sourceBtnActive: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
  },
  sourceBtnTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sourceIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceIconBoxActive: {
    backgroundColor: '#dbeafe',
  },
  sourceRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceRadioActive: {
    borderColor: '#1d72db',
  },
  sourceRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db',
  },
  sourceBtnTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  sourceBtnTitleActive: {
    color: '#1e40af',
    fontWeight: '700',
  },
  sourceBtnSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  payBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  payBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  payBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  securityNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  securityNoteText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
});
