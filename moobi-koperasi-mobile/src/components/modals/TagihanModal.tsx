import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { AppIcon } from '../common/AppIcon';

interface TagihanModalProps {
  visible: boolean;
  onClose: () => void;
  userBalance: number;
  onPaymentSuccess?: (amount: number, category: string) => void;
}

export const TagihanModal: React.FC<TagihanModalProps> = ({
  visible,
  onClose,
  userBalance,
  onPaymentSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'pln' | 'bpjs' | 'pdam' | 'internet'>('bpjs');
  const [customerId, setCustomerId] = useState('0001-8293-8472');
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

  const currentCat = categories.find((c) => c.id === selectedCategory) || categories[0];

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
      onPaymentSuccess(currentCat.billAmount, currentCat.name);
    }

    Alert.alert(
      'Pembayaran Berhasil! 🧾',
      `Tagihan ${currentCat.name} senilai Rp ${formatRupiah(currentCat.billAmount)} berhasil dibayar.\n\nNomor Pelanggan: ${customerId}\nMetode: ${
        paymentSource === 'saldo' ? 'Saldo Koperasi Anggota' : 'Potong Slip Gaji Payroll PT BIT'
      }\nNo. Struk: PPOB-${Date.now().toString().slice(-6)}`,
      [
        {
          text: 'Selesai',
          onPress: () => {
            onClose();
          },
        },
      ]
    );
  };

  const handleReset = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleReset}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.headerIconCircle}>
                <AppIcon name="tagihan" size={18} color="#ea580c" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Bayar Tagihan & PPoB</Text>
                <Text style={styles.modalSub}>Listrik, BPJS, PDAM & Internet</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn} activeOpacity={0.7}>
              <AppIcon name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Hero Wallet Balance Card */}
            <View style={styles.heroBalanceCard}>
              <View style={styles.heroGlowCircle} />
              <View style={styles.heroBalanceTop}>
                <View style={styles.heroLabelWrap}>
                  <AppIcon name="wallet" size={14} color="#fdba74" />
                  <Text style={styles.heroBalanceLabel}>Saldo Koperasi Tersedia</Text>
                </View>
              </View>

              <View style={styles.heroBalanceMain}>
                <Text style={styles.heroCurrency}>Rp</Text>
                <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
              </View>
            </View>

            {/* Category Grid - Vertical Centered Stack Layout */}
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
                    <View style={styles.catIconWrap}>
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
                  <AppIcon name="receipt" size={13} color="#ea580c" />
                  <Text style={styles.inputCardLabel}>NOMOR PELANGGAN / ID TAGIHAN</Text>
                </View>
              </View>

              <View style={styles.inputBoxRow}>
                <View style={styles.inputPrefixIcon}>
                  <AppIcon name="receipt" size={14} color="#ea580c" />
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
                    <AppIcon name="x" size={13} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.checkBillBtn}
                onPress={handleInquiry}
                activeOpacity={0.8}
              >
                <AppIcon name="search" size={14} color="#ffffff" />
                <Text style={styles.checkBillBtnText}>Cek Tagihan</Text>
              </TouchableOpacity>
            </View>

            {/* Bill Details Result Card */}
            {billChecked && (
              <View style={styles.billDetailsCard}>
                {/* Ticket Header - Properly Spaced & No Collision */}
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

                  <View style={styles.unpaidBadge}>
                    <View style={styles.unpaidDot} />
                    <Text style={styles.unpaidBadgeText}>BELUM DIBAYAR</Text>
                  </View>
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
                          size={14}
                          color={paymentSource === 'saldo' ? '#ea580c' : '#64748b'}
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
                          size={14}
                          color={paymentSource === 'payroll' ? '#ea580c' : '#64748b'}
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
                    <Text style={styles.sourceBtnSub}>Payroll Otomatis</Text>
                  </TouchableOpacity>
                </View>

                {/* Pay Action Button */}
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={handlePay}
                  activeOpacity={0.85}
                >
                  <Text style={styles.payBtnText}>
                    Bayar Sekarang • Rp {formatRupiah(currentCat.billAmount)} ›
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  modalSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  heroBalanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(234, 88, 12, 0.25)',
  },
  heroBalanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBalanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  heroBalanceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 2,
  },
  heroCurrency: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fb923c',
  },
  heroBalanceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  catGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  catCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  catCardActive: {
    backgroundColor: '#fff7ed',
    borderColor: '#ea580c',
  },
  catIconWrap: {
    width: 40,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#ffffff',
    borderRadius: 5,
  },
  catLogoImg: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  catNameActive: {
    color: '#ea580c',
    fontWeight: '700',
  },
  catActiveIndicator: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catActiveDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#ffffff',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inputCardLabel: {
    fontSize: 10,
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
    height: 46,
  },
  inputPrefixIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInputField: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  clearBtn: {
    padding: 6,
  },
  checkBillBtn: {
    backgroundColor: '#ea580c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 11,
    marginTop: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 2,
  },
  checkBillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  billDetailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
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
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  billHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  billLogoWrap: {
    width: 38,
    height: 26,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
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
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  billDetailSubId: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  unpaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
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
  },
  ticketDividerRow: {
    marginVertical: 10,
  },
  ticketDottedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderStyle: 'dashed',
  },
  detailList: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  detailValueSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
    maxWidth: '55%',
    textAlign: 'right',
  },
  freeAdminBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  freeAdminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  totalAmountBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    marginTop: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  totalAmountLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#c2410c',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  totalAmountValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  totalAmountCurrency: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ea580c',
  },
  totalAmountNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#c2410c',
    letterSpacing: -0.5,
  },
  paymentSourceHeader: {
    marginBottom: 6,
  },
  paymentSourceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  paymentSourceRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  sourceBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sourceBtnActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
  },
  sourceBtnTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceIconBoxActive: {
    backgroundColor: '#ffedd5',
  },
  sourceRadio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceRadioActive: {
    borderColor: '#ea580c',
  },
  sourceRadioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ea580c',
  },
  sourceBtnTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  sourceBtnTitleActive: {
    color: '#9a3412',
  },
  sourceBtnSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '600',
  },
  payBtn: {
    backgroundColor: '#ea580c',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  payBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
