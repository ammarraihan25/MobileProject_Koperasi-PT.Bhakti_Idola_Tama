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

interface TarikTunaiModalProps {
  visible: boolean;
  onClose: () => void;
  userBalance: number;
}

interface BankItem {
  id: string;
  name: string;
  fullName: string;
  logo: any;
}

interface RetailItem {
  id: string;
  name: string;
  logo: any;
}

export const TarikTunaiModal: React.FC<TarikTunaiModalProps> = ({
  visible,
  onClose,
  userBalance,
}) => {
  const [method, setMethod] = useState<'koperasi' | 'retail' | 'atm'>('koperasi');
  const [selectedAtmBank, setSelectedAtmBank] = useState<string>('BCA');
  const [isAtmDropdownOpen, setIsAtmDropdownOpen] = useState<boolean>(true);
  const [selectedRetail, setSelectedRetail] = useState<string>('Indomaret');
  const [amount, setAmount] = useState<string>('100000');
  const [tokenGenerated, setTokenGenerated] = useState<boolean>(false);
  const [tokenCode, setTokenCode] = useState<string>('');

  const atmBankList: BankItem[] = [
    {
      id: 'BCA',
      name: 'BCA',
      fullName: 'Bank Central Asia (BCA)',
      logo: require('../../../assets/transfer/bca.png'),
    },
    {
      id: 'Mandiri',
      name: 'Mandiri',
      fullName: 'Bank Mandiri',
      logo: require('../../../assets/transfer/mandiri.png'),
    },
    {
      id: 'BRI',
      name: 'BRI',
      fullName: 'Bank Rakyat Indonesia (BRI)',
      logo: require('../../../assets/transfer/bri.png'),
    },
    {
      id: 'BNI',
      name: 'BNI',
      fullName: 'Bank Negara Indonesia (BNI)',
      logo: require('../../../assets/transfer/bni.png'),
    },
    {
      id: 'CIMB Niaga',
      name: 'CIMB Niaga',
      fullName: 'Bank CIMB Niaga',
      logo: require('../../../assets/transfer/cimb.png'),
    },
  ];

  const retailList: RetailItem[] = [
    {
      id: 'Indomaret',
      name: 'Indomaret',
      logo: require('../../../assets/transfer/indomaret.png'),
    },
    {
      id: 'Alfamart',
      name: 'Alfamart',
      logo: require('../../../assets/transfer/alfamart.png'),
    },
  ];

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const isAmountOverBalance = numericAmount > userBalance;
  const remainingBalance = userBalance - numericAmount;

  const currentAtmBank = atmBankList.find((b) => b.id === selectedAtmBank) || atmBankList[0];
  const currentRetail = retailList.find((r) => r.id === selectedRetail) || retailList[0];

  const handleGenerateToken = () => {
    if (!numericAmount || numericAmount < 50000) {
      Alert.alert('Nominal Tidak Valid', 'Minimal penarikan tunai adalah Rp 50.000.');
      return;
    }
    if (isAmountOverBalance) {
      Alert.alert(
        'Saldo Tidak Cukup',
        `Saldo Anda Rp ${formatRupiah(userBalance)}. Kurang untuk tarik tunai Rp ${formatRupiah(
          numericAmount
        )}.`
      );
      return;
    }
    const randomCode = `BIT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTokenCode(randomCode);
    setTokenGenerated(true);
  };

  const handleReset = () => {
    setTokenGenerated(false);
    setTokenCode('');
    onClose();
  };

  const getLocationLabel = () => {
    if (method === 'koperasi') {
      return 'Kasir Koperasi PT BIT (Gedung A & B)';
    }
    if (method === 'retail') {
      return `Gerai ${currentRetail.name}`;
    }
    return `ATM ${currentAtmBank.fullName} (Cardless)`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleReset}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.headerIconCircle}>
                <AppIcon name="tarik" size={18} color="#059669" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Tarik Tunai Koperasi</Text>
                <Text style={styles.modalSub}>Tarik Tunai Tanpa Kartu • Bebas Biaya</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn} activeOpacity={0.7}>
              <AppIcon name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {!tokenGenerated ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Hero Wallet Balance Card */}
              <View style={styles.heroBalanceCard}>
                <View style={styles.heroGlowCircle} />
                <View style={styles.heroBalanceTop}>
                  <View style={styles.heroLabelWrap}>
                    <AppIcon name="wallet" size={14} color="#6ee7b7" />
                    <Text style={styles.heroBalanceLabel}>Saldo Koperasi Tersedia</Text>
                  </View>
                </View>

                <View style={styles.heroBalanceMain}>
                  <Text style={styles.heroCurrency}>Rp</Text>
                  <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
                </View>
              </View>

              {/* Method Switcher */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>PILIH LOKASI PENARIKAN</Text>
                <Text style={styles.sectionHint}>Pilih salah satu</Text>
              </View>

              <View style={styles.methodList}>
                {/* 1. Kasir Koperasi with paguyuban.png */}
                <TouchableOpacity
                  style={[
                    styles.methodCardContainer,
                    styles.methodCardHeader,
                    method === 'koperasi' && styles.methodCardContainerActive,
                  ]}
                  onPress={() => setMethod('koperasi')}
                  activeOpacity={0.8}
                >
                  <View style={styles.methodLogoWrapper}>
                    <Image
                      source={require('../../../assets/transfer/paguyuban.png')}
                      style={styles.methodLogoImagePaguyuban}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.methodTextGroup}>
                    <Text style={[styles.methodTitle, method === 'koperasi' && styles.methodTitleActive]}>
                      Kasir Koperasi Pabrik PT BIT
                    </Text>
                    <Text style={styles.methodSub}>Gedung A & B • Instan Tanpa Antre</Text>
                  </View>
                  <View
                    style={[
                      styles.selectionIndicator,
                      method === 'koperasi' && styles.selectionIndicatorActive,
                    ]}
                  >
                    {method === 'koperasi' && <View style={styles.selectionIndicatorDot} />}
                  </View>
                </TouchableOpacity>

                {/* 2. Gerai Retail */}
                <View
                  style={[
                    styles.methodCardContainer,
                    method === 'retail' && styles.methodCardContainerActive,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.methodCardHeader}
                    onPress={() => setMethod('retail')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodLogoWrapper}>
                      <Image
                        source={currentRetail.logo}
                        style={styles.methodLogoImageRetail}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.methodTextGroup}>
                      <Text style={[styles.methodTitle, method === 'retail' && styles.methodTitleActive]}>
                        Gerai {currentRetail.name}
                      </Text>
                      <Text style={styles.methodSub}>Tunjukkan kode token ke kasir gerai mitra</Text>
                    </View>
                    <View
                      style={[
                        styles.selectionIndicator,
                        method === 'retail' && styles.selectionIndicatorActive,
                      ]}
                    >
                      {method === 'retail' && <View style={styles.selectionIndicatorDot} />}
                    </View>
                  </TouchableOpacity>

                  {method === 'retail' && (
                    <View style={styles.subSelectorBox}>
                      <Text style={styles.subSelectorLabel}>PILIH GERAI MITRA:</Text>
                      <View style={styles.subSelectorRow}>
                        {retailList.map((r) => {
                          const isRetailSelected = selectedRetail === r.id;
                          return (
                            <TouchableOpacity
                              key={r.id}
                              style={[
                                styles.subPartnerChip,
                                isRetailSelected && styles.subPartnerChipActive,
                              ]}
                              onPress={() => setSelectedRetail(r.id)}
                              activeOpacity={0.7}
                            >
                              <Image
                                source={r.logo}
                                style={styles.subPartnerLogo}
                                resizeMode="contain"
                              />
                              <Text
                                style={[
                                  styles.subPartnerText,
                                  isRetailSelected && styles.subPartnerTextActive,
                                ]}
                              >
                                {r.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>

                {/* 3. ATM Cardless with Dropdown */}
                <View
                  style={[
                    styles.methodCardContainer,
                    method === 'atm' && styles.methodCardContainerActive,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.methodCardHeader}
                    onPress={() => {
                      setMethod('atm');
                      setIsAtmDropdownOpen((prev) => (method === 'atm' ? !prev : true));
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodLogoWrapper}>
                      <Image
                        source={currentAtmBank.logo}
                        style={styles.methodLogoImageBank}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.methodTextGroup}>
                      <Text style={[styles.methodTitle, method === 'atm' && styles.methodTitleActive]}>
                        ATM {currentAtmBank.name} (Cardless)
                      </Text>
                      <Text style={styles.methodSub}>Tarik tunai di mesin ATM tanpa kartu ATM</Text>
                    </View>

                    <View style={styles.atmHeaderRight}>
                      <View style={styles.atmDropdownToggleBadge}>
                        <AppIcon
                          name={method === 'atm' && isAtmDropdownOpen ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#059669"
                        />
                      </View>
                      <View
                        style={[
                          styles.selectionIndicator,
                          method === 'atm' && styles.selectionIndicatorActive,
                        ]}
                      >
                        {method === 'atm' && <View style={styles.selectionIndicatorDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {method === 'atm' && isAtmDropdownOpen && (
                    <View style={styles.dropdownContainer}>
                      <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownHeaderTitle}>PILIH BANK PENYEDIA ATM</Text>
                        <Text style={styles.dropdownHeaderSub}>Tersedia 5 Bank Mitra</Text>
                      </View>
                      <View style={styles.bankDropdownList}>
                        {atmBankList.map((b) => {
                          const isBankActive = selectedAtmBank === b.id;
                          return (
                            <TouchableOpacity
                              key={b.id}
                              style={[
                                styles.bankDropdownItem,
                                isBankActive && styles.bankDropdownItemActive,
                              ]}
                              onPress={() => setSelectedAtmBank(b.id)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.bankDropdownLogoWrap}>
                                <Image
                                  source={b.logo}
                                  style={styles.bankDropdownLogo}
                                  resizeMode="contain"
                                />
                              </View>
                              <View style={styles.bankDropdownInfo}>
                                <Text
                                  style={[
                                    styles.bankDropdownName,
                                    isBankActive && styles.bankDropdownNameActive,
                                  ]}
                                >
                                  {b.fullName}
                                </Text>
                                <Text style={styles.bankDropdownTag}>Tarik Tunai Tanpa Kartu</Text>
                              </View>
                              <View
                                style={[
                                  styles.bankRadioIndicator,
                                  isBankActive && styles.bankRadioIndicatorActive,
                                ]}
                              >
                                {isBankActive && <View style={styles.bankRadioDot} />}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Custom Amount Section */}
              <View style={styles.formCard}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputCardLabel}>NOMINAL PENARIKAN</Text>
                  <TouchableOpacity
                    onPress={() => setAmount(userBalance.toString())}
                    style={styles.maxAmountBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.maxAmountBtnText}>Tarik Maksimal</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.amountInputContainer,
                    isAmountOverBalance && styles.amountInputError,
                  ]}
                >
                  <Text style={styles.amountCurrencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.amountNumberInput}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={amount ? formatRupiah(numericAmount) : ''}
                    onChangeText={(val) => setAmount(val.replace(/[^0-9]/g, ''))}
                  />
                </View>

                {/* Dynamic Status / Validation */}
                {numericAmount > 0 && (
                  <View style={styles.amountStatusRow}>
                    {isAmountOverBalance ? (
                      <View style={styles.statusMsgRow}>
                        <AppIcon name="info" size={13} color="#dc2626" />
                        <Text style={styles.amountErrorText}>
                          Saldo tidak mencukupi (Maks. Rp {formatRupiah(userBalance)})
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.statusMsgRow}>
                        <AppIcon name="check-circle" size={13} color="#16a34a" />
                        <Text style={styles.amountSuccessText}>
                          Sisa saldo setelah penarikan: Rp {formatRupiah(remainingBalance)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Quick Amount Chips */}
                <View style={styles.quickChipsWrapper}>
                  {quickAmounts.map((q) => {
                    const isSelected = numericAmount === q;
                    return (
                      <TouchableOpacity
                        key={q}
                        style={[styles.quickAmountChip, isSelected && styles.quickAmountChipActive]}
                        onPress={() => setAmount(q.toString())}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.quickAmountChipText,
                            isSelected && styles.quickAmountChipTextActive,
                          ]}
                        >
                          {formatRupiah(q)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Generate Token */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (isAmountOverBalance || numericAmount <= 0) && styles.primaryBtnDisabled,
                ]}
                onPress={handleGenerateToken}
                disabled={isAmountOverBalance || numericAmount <= 0}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Buat Kode Token Tarik Tunai ›</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Token Generated Screen */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={styles.tokenSuccessCard}>
                <View style={styles.tokenIconCircle}>
                  <AppIcon name="tarik" size={24} color="#059669" />
                </View>

                <Text style={styles.tokenSuccessCaption}>KODE TOKEN PENARIKAN TUNAI</Text>
                <View style={styles.tokenCodeBox}>
                  <Text style={styles.tokenCodeText}>{tokenCode}</Text>
                </View>
                <View style={styles.expiryBadgeRow}>
                  <AppIcon name="info" size={12} color="#059669" />
                  <Text style={styles.tokenExpiryText}>Berlaku hingga 15 menit ke depan</Text>
                </View>

                <View style={styles.barcodeBox}>
                  <View style={styles.barcodeBarsRow}>
                    {[4, 2, 6, 2, 8, 3, 5, 2, 7, 4, 3, 6, 2, 5, 3, 8, 2, 4, 6].map((w, i) => (
                      <View
                        key={i}
                        style={{
                          width: w,
                          height: 40,
                          backgroundColor: '#0f172a',
                          marginHorizontal: 1.5,
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </View>
                  <Text style={styles.barcodeSub}>Tunjukkan Barcode ini ke Kasir / Input di ATM</Text>
                </View>

                <View style={styles.tokenDivider} />

                <View style={styles.tokenDetailRow}>
                  <Text style={styles.tokenDetailLabel}>Nominal Penarikan</Text>
                  <Text style={styles.tokenDetailValueBold}>Rp {formatRupiah(numericAmount)}</Text>
                </View>

                <View style={styles.tokenDetailRow}>
                  <Text style={styles.tokenDetailLabel}>Lokasi Penarikan</Text>
                  <Text style={styles.tokenDetailValue}>{getLocationLabel()}</Text>
                </View>

                <View style={styles.tokenDetailRow}>
                  <Text style={styles.tokenDetailLabel}>Biaya Admin</Text>
                  <Text style={styles.tokenFreeText}>GRATIS (Rp 0)</Text>
                </View>

                <View style={styles.tokenDetailRow}>
                  <Text style={styles.tokenDetailLabel}>Sisa Saldo Koperasi</Text>
                  <Text style={styles.tokenDetailValue}>Rp {formatRupiah(remainingBalance)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.doneActionBtn}
                onPress={handleReset}
                activeOpacity={0.85}
              >
                <Text style={styles.doneActionBtnText}>Selesai & Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
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
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
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
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
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
    color: '#34d399',
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
  methodList: {
    gap: 9,
    marginBottom: 14,
  },
  methodCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  methodCardContainerActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#059669',
  },
  methodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
  },
  methodLogoWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 2,
  },
  methodLogoImagePaguyuban: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  methodLogoImageRetail: {
    width: 36,
    height: 22,
  },
  methodLogoImageBank: {
    width: 36,
    height: 22,
  },
  methodTextGroup: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  methodTitleActive: {
    color: '#065f46',
  },
  methodSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  atmHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  atmDropdownToggleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  selectionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  selectionIndicatorActive: {
    borderColor: '#059669',
  },
  selectionIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  dropdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dropdownHeaderTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  dropdownHeaderSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  bankDropdownList: {
    gap: 6,
  },
  bankDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bankDropdownItemActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  bankDropdownLogoWrap: {
    width: 48,
    height: 22,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bankDropdownLogo: {
    width: '100%',
    height: '100%',
  },
  bankDropdownInfo: {
    flex: 1,
  },
  bankDropdownName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  bankDropdownNameActive: {
    color: '#065f46',
  },
  bankDropdownTag: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  bankRadioIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankRadioIndicatorActive: {
    borderColor: '#059669',
  },
  bankRadioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#059669',
  },
  subSelectorBox: {
    borderTopWidth: 1,
    borderTopColor: '#dcfce7',
    backgroundColor: '#ffffff',
    padding: 8,
  },
  subSelectorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  subSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  subPartnerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subPartnerChipActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  subPartnerLogo: {
    width: 38,
    height: 16,
  },
  subPartnerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  subPartnerTextActive: {
    color: '#059669',
    fontWeight: '700',
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
  inputCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  maxAmountBtn: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  maxAmountBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  amountInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  amountCurrencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginRight: 5,
  },
  amountNumberInput: {
    flex: 1,
    paddingVertical: 7,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  amountStatusRow: {
    marginTop: 6,
  },
  statusMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountErrorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
  },
  amountSuccessText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  quickChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  quickAmountChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickAmountChipActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  quickAmountChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  quickAmountChipTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#059669',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  tokenSuccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#86efac',
    alignItems: 'center',
    marginBottom: 14,
  },
  tokenIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
  },
  tokenSuccessCaption: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  tokenCodeBox: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#86efac',
    marginVertical: 8,
  },
  tokenCodeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#065f46',
    letterSpacing: 2.5,
  },
  expiryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  tokenExpiryText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  barcodeBox: {
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    width: '100%',
    marginBottom: 12,
  },
  barcodeBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 5,
  },
  tokenDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    width: '100%',
    marginBottom: 10,
  },
  tokenDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  tokenDetailLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  tokenDetailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
  tokenDetailValueBold: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  tokenFreeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  doneActionBtn: {
    backgroundColor: '#059669',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
