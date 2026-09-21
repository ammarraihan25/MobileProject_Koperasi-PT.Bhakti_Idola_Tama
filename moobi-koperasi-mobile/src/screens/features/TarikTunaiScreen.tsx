import React, { useState } from 'react';
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

interface TarikTunaiScreenProps {
  onBack: () => void;
  userBalance: number;
  onWithdrawSuccess?: (amount: number, locationLabel: string) => void;
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

export const TarikTunaiScreen: React.FC<TarikTunaiScreenProps> = ({
  onBack,
  userBalance,
  onWithdrawSuccess,
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

  const getLocationLabel = () => {
    if (method === 'koperasi') {
      return 'Kasir Koperasi PT BIT (Gedung A & B)';
    }
    if (method === 'retail') {
      return `Gerai ${currentRetail.name}`;
    }
    return `ATM ${currentAtmBank.fullName} (Cardless)`;
  };

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
    if (onWithdrawSuccess) {
      onWithdrawSuccess(numericAmount, getLocationLabel());
    }
  };

  const handleReset = () => {
    setTokenGenerated(false);
    setTokenCode('');
    onBack();
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Bar Navigation */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavContent}>
          <Text style={styles.topNavTitle}>Tarik Tunai Koperasi</Text>
          <Text style={styles.topNavSub}>Tarik Tunai Tanpa Kartu • Kasir Koperasi</Text>
        </View>
      </View>

      {!tokenGenerated ? (
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
              <Text style={styles.heroSubText}>PT Bakti Idola Tama • Siap ditarik tunai kapan saja</Text>
            </View>
          </View>

          {/* Method Selector Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>PILIH LOKASI PENARIKAN</Text>
            <Text style={styles.sectionHint}>Pilih salah satu</Text>
          </View>

          <View style={styles.methodList}>
            {/* 1. Kasir Koperasi PT BIT with paguyuban.png */}
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

            {/* 2. Gerai Retail (Indomaret / Alfamart) */}
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

              {/* Sub-selector for retail if active */}
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

            {/* 3. ATM Cardless with Bank Dropdown */}
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
                      color="#1d72db"
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

              {/* ATM Bank Dropdown List */}
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

          {/* Submit Button */}
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

          {/* Security Notice */}
          <View style={styles.securityNoteRow}>
            <AppIcon name="lock" size={13} color="#94a3b8" />
            <Text style={styles.securityNoteText}>
              Transaksi aman & terverifikasi oleh Koperasi PT Bakti Idola Tama
            </Text>
          </View>
        </ScrollView>
      ) : (
        /* Token Generated Screen */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <View style={styles.tokenSuccessCard}>
            <View style={styles.tokenIconCircle}>
              <AppIcon name="tarik" size={24} color="#ffffff" />
            </View>

            <Text style={styles.tokenSuccessCaption}>KODE TOKEN PENARIKAN TUNAI</Text>
            <View style={styles.tokenCodeBox}>
              <Text style={styles.tokenCodeText}>{tokenCode}</Text>
            </View>
            <View style={styles.expiryBadgeRow}>
              <AppIcon name="info" size={12} color="#1d72db" />
              <Text style={styles.tokenExpiryText}>Berlaku hingga 15 menit ke depan</Text>
            </View>

            <View style={styles.barcodeBox}>
              <View style={styles.barcodeBarsRow}>
                {[4, 2, 6, 2, 8, 3, 5, 2, 7, 4, 3, 6, 2, 5, 3, 8, 2, 4, 6].map((w, i) => (
                  <View
                    key={i}
                    style={{
                      width: w,
                      height: 44,
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
            <Text style={styles.doneActionBtnText}>Selesai & Kembali</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  methodList: {
    gap: 10,
    marginBottom: 16,
  },
  methodCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  methodCardContainerActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
    shadowColor: '#1d72db',
    shadowOpacity: 0.12,
  },
  methodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  methodLogoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 3,
  },
  methodLogoImagePaguyuban: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  methodLogoImageRetail: {
    width: 38,
    height: 24,
  },
  methodLogoImageBank: {
    width: 38,
    height: 24,
  },
  methodTextGroup: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1e293b',
  },
  methodTitleActive: {
    color: '#1d4ed8',
  },
  methodSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  atmHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  atmDropdownToggleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  selectionIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  selectionIndicatorActive: {
    borderColor: '#1d72db',
  },
  selectionIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1d72db',
  },
  dropdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dropdownHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: 0.5,
  },
  dropdownHeaderSub: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
  },
  bankDropdownList: {
    gap: 7,
  },
  bankDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bankDropdownItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
    borderWidth: 1.5,
  },
  bankDropdownLogoWrap: {
    width: 52,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    paddingHorizontal: 4,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  bankDropdownNameActive: {
    color: '#1d4ed8',
  },
  bankDropdownTag: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  bankRadioIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankRadioIndicatorActive: {
    borderColor: '#1d72db',
  },
  bankRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db',
  },
  subSelectorBox: {
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  subSelectorLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subPartnerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subPartnerChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
    borderWidth: 1.5,
  },
  subPartnerLogo: {
    width: 44,
    height: 18,
  },
  subPartnerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  subPartnerTextActive: {
    color: '#1d72db',
    fontWeight: '700',
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
  inputCardLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  maxAmountBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  maxAmountBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  amountInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  amountCurrencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d72db',
    marginRight: 6,
  },
  amountNumberInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  amountStatusRow: {
    marginTop: 8,
  },
  statusMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  amountErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  amountSuccessText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  quickChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  quickAmountChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickAmountChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  quickAmountChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  quickAmountChipTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1d72db',
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
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tokenSuccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tokenIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenSuccessCaption: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: 0.5,
  },
  tokenCodeBox: {
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    marginVertical: 10,
  },
  tokenCodeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: 3,
  },
  expiryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  tokenExpiryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d72db',
  },
  barcodeBox: {
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    width: '100%',
    marginBottom: 14,
  },
  barcodeBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 6,
  },
  tokenDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    width: '100%',
    marginBottom: 12,
  },
  tokenDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  tokenDetailLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  tokenDetailValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
  tokenDetailValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d72db',
  },
  tokenFreeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  doneActionBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
