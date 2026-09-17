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
import { AppIcon, IconType } from '../../components/common/AppIcon';

interface TransferScreenProps {
  onBack: () => void;
  userBalance: number;
  onTransferSuccess?: (amount: number, destination: string) => void;
}

interface QuickContact {
  id: string;
  name: string;
  shortName: string;
  account: string;
  tag: string;
  type?: 'anggota' | 'bank' | 'ewallet';
  bankOrWallet?: string;
  avatar?: string;
  isAdd?: boolean;
}

export const TransferScreen: React.FC<TransferScreenProps> = ({
  onBack,
  userBalance,
  onTransferSuccess,
}) => {
  const [transferType, setTransferType] = useState<'anggota' | 'bank' | 'ewallet'>('anggota');
  const [targetAccount, setTargetAccount] = useState('');
  const [targetName, setTargetName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [selectedEwallet, setSelectedEwallet] = useState('GoPay');
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  const bankList = [
    { id: 'BCA', name: 'BCA', logo: require('../../../assets/transfer/bca.png') },
    { id: 'Mandiri', name: 'Mandiri', logo: require('../../../assets/transfer/mandiri.png') },
    { id: 'BRI', name: 'BRI', logo: require('../../../assets/transfer/bri.png') },
    { id: 'BNI', name: 'BNI', logo: require('../../../assets/transfer/bni.png') },
    { id: 'CIMB Niaga', name: 'CIMB', logo: require('../../../assets/transfer/cimb.png') },
  ];

  const ewalletList = [
    { id: 'GoPay', name: 'GoPay', logo: require('../../../assets/transfer/gopay.png') },
    { id: 'DANA', name: 'DANA', logo: require('../../../assets/transfer/dana.png') },
    { id: 'OVO', name: 'OVO', logo: require('../../../assets/transfer/ovo.png') },
    { id: 'ShopeePay', name: 'Shopee', logo: require('../../../assets/transfer/shopeepay.png') },
    { id: 'LinkAja', name: 'LinkAja', logo: require('../../../assets/transfer/linkaja.png') },
  ];

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const recentContacts: QuickContact[] = [
    {
      id: '1',
      name: 'Budi Santoso',
      shortName: 'Budi S.',
      account: '17800028912',
      tag: 'BCA',
      type: 'bank',
      bankOrWallet: 'BCA',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Siti Aminah',
      shortName: 'Siti A.',
      account: '2024-089',
      tag: 'Moobi',
      type: 'anggota',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Rudi Wijaya',
      shortName: 'Rudi W.',
      account: '08129876543',
      tag: 'e-Wallet',
      type: 'ewallet',
      bankOrWallet: 'GoPay',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Baru',
      shortName: 'Baru',
      account: '',
      tag: '+ Rekening',
      isAdd: true,
    },
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleAccountChange = (text: string) => {
    setTargetAccount(text);
    if (transferType === 'anggota') {
      if (text.trim().length >= 4) {
        setTargetName('Siti Aminah (QC Dept - NIK 2024-089)');
      } else {
        setTargetName('');
      }
    } else if (transferType === 'bank') {
      if (text.trim().length >= 6) {
        setTargetName(`Budi Santoso (${selectedBank} Terverifikasi)`);
      } else {
        setTargetName('');
      }
    } else if (transferType === 'ewallet') {
      if (text.trim().length >= 8) {
        setTargetName(`Akun ${selectedEwallet} Terverifikasi`);
      } else {
        setTargetName('');
      }
    }
  };

  const selectContact = (contact: QuickContact) => {
    if (contact.isAdd) {
      setTargetAccount('');
      setTargetName('');
      return;
    }
    if (contact.type) {
      setTransferType(contact.type);
      if (contact.type === 'bank' && contact.bankOrWallet) {
        setSelectedBank(contact.bankOrWallet);
      } else if (contact.type === 'ewallet' && contact.bankOrWallet) {
        setSelectedEwallet(contact.bankOrWallet);
      }
    }
    setTargetAccount(contact.account);
    if (contact.type === 'anggota') {
      setTargetName(`${contact.name} (QC Dept - NIK ${contact.account})`);
    } else if (contact.type === 'bank') {
      setTargetName(`${contact.name} (${contact.tag} Terverifikasi)`);
    } else if (contact.type === 'ewallet') {
      setTargetName(`${contact.name} (${contact.bankOrWallet || 'e-Wallet'} Terverifikasi)`);
    } else {
      setTargetName(contact.name);
    }
  };

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const isAmountOverBalance = numericAmount > userBalance;
  const remainingBalance = userBalance - numericAmount;

  const handleProceedToConfirm = () => {
    if (!numericAmount || numericAmount < 10000) {
      Alert.alert('Nominal Tidak Valid', 'Minimal transfer adalah Rp 10.000.');
      return;
    }
    if (isAmountOverBalance) {
      Alert.alert(
        'Saldo Tidak Cukup',
        `Saldo Anda Rp ${formatRupiah(userBalance)}. Kurang untuk transfer Rp ${formatRupiah(
          numericAmount
        )}.`
      );
      return;
    }
    if (!targetAccount.trim()) {
      Alert.alert('Data Belum Lengkap', 'Silakan masukkan nomor tujuan atau pilih kontak.');
      return;
    }
    setStep('confirm');
  };

  const handleExecuteTransfer = () => {
    const dest =
      transferType === 'anggota'
        ? `Sesama Anggota (${targetName || targetAccount})`
        : `${selectedBank || selectedEwallet} - ${targetAccount}`;

    if (onTransferSuccess) {
      onTransferSuccess(numericAmount, dest);
    }

    Alert.alert(
      'Transfer Berhasil! 🚀',
      `Berhasil mengirim Rp ${formatRupiah(numericAmount)} ke ${
        targetName || targetAccount
      }.\n\nBiaya Admin: Rp 0 (Bebas Biaya Anggota PT BIT)\nNo. Ref: TRF-${Date.now()
        .toString()
        .slice(-6)}`,
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
      {/* Top Header */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavContent}>
          <Text style={styles.topNavTitle}>
            {step === 'input' ? 'Transfer Saldo' : 'Konfirmasi Transfer'}
          </Text>
        </View>

        {/* Step Indicator Bar */}
        <View style={styles.stepIndicatorRow}>
          <View
            style={[styles.stepItem, step === 'input' ? styles.stepItemActive : styles.stepItemDone]}
          >
            <Text style={[styles.stepNumber, step === 'input' ? styles.stepNumberActive : styles.stepNumberDone]}>
              1
            </Text>
            <Text style={[styles.stepLabel, step === 'input' ? styles.stepLabelActive : styles.stepLabelDone]}>
              Input Transfer
            </Text>
          </View>
          <View style={styles.stepDividerLine} />
          <View
            style={[styles.stepItem, step === 'confirm' ? styles.stepItemActive : styles.stepItemInactive]}
          >
            <Text
              style={[
                styles.stepNumber,
                step === 'confirm' ? styles.stepNumberActive : styles.stepNumberInactive,
              ]}
            >
              2
            </Text>
            <Text
              style={[
                styles.stepLabel,
                step === 'confirm' ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              Konfirmasi & Kirim
            </Text>
          </View>
        </View>
      </View>

      {step === 'input' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {/* Hero Wallet Balance Card */}
          <View style={styles.heroBalanceCard}>
            <View style={styles.heroGlowCircle} />
            <View style={styles.heroBalanceTop}>
              <View style={styles.heroLabelWrap}>
                <AppIcon name="wallet" size={16} color="#93c5fd" />
                <Text style={styles.heroBalanceLabel}>Sumber Dana: Saldo Koperasi</Text>
              </View>
            </View>

            <View style={styles.heroBalanceMain}>
              <Text style={styles.heroCurrency}>Rp</Text>
              <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroSubText}>PT Bakti Idola Tama • Siap Ditransfer Kapan Saja</Text>
            </View>
          </View>

          {/* Clean 1-Line Transfer Type Switcher */}
          <View style={styles.typeSwitcher}>
            <TouchableOpacity
              style={[styles.typeBtn, transferType === 'anggota' && styles.typeBtnActive]}
              onPress={() => {
                setTransferType('anggota');
                setTargetName('');
                setTargetAccount('');
              }}
              activeOpacity={0.8}
            >
              <AppIcon
                name="users"
                size={15}
                color={transferType === 'anggota' ? '#1d72db' : '#64748b'}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  transferType === 'anggota' && styles.typeBtnTextActive,
                ]}
                numberOfLines={1}
              >
                Sesama Anggota
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, transferType === 'bank' && styles.typeBtnActive]}
              onPress={() => {
                setTransferType('bank');
                setTargetName('');
                setTargetAccount('');
              }}
              activeOpacity={0.8}
            >
              <AppIcon
                name="building"
                size={15}
                color={transferType === 'bank' ? '#1d72db' : '#64748b'}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  transferType === 'bank' && styles.typeBtnTextActive,
                ]}
                numberOfLines={1}
              >
                Rekening Bank
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, transferType === 'ewallet' && styles.typeBtnActive]}
              onPress={() => {
                setTransferType('ewallet');
                setTargetName('');
                setTargetAccount('');
              }}
              activeOpacity={0.8}
            >
              <AppIcon
                name="wallet"
                size={15}
                color={transferType === 'ewallet' ? '#1d72db' : '#64748b'}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  transferType === 'ewallet' && styles.typeBtnTextActive,
                ]}
                numberOfLines={1}
              >
                e-Wallet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Transfer Contacts Section (Matching Image 2) */}
          <View style={styles.quickContactsCard}>
            <View style={styles.quickContactsHeader}>
              <Text style={styles.quickContactsTitle}>Transfer</Text>
              <TouchableOpacity
                onPress={() => {
                  setTargetAccount('');
                  setTargetName('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllTransferText}>Cari Rekening / Bank ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transferGridRow}>
              {recentContacts.map((c) => {
                const isSelected = !c.isAdd && targetAccount === c.account;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.contactCard}
                    onPress={() => selectContact(c)}
                    activeOpacity={0.75}
                  >
                    {c.isAdd ? (
                      <View style={[styles.contactAvatarAdd, targetAccount === '' && styles.contactAvatarAddActive]}>
                        <AppIcon name="topup" size={18} color="#1d72db" />
                      </View>
                    ) : (
                      <View style={[styles.avatarImageWrapper, isSelected && styles.avatarImageWrapperActive]}>
                        <Image
                          source={{ uri: c.avatar }}
                          style={styles.contactAvatarImage}
                        />
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                    )}
                    <Text style={[styles.contactTitle, isSelected && styles.contactTitleActive]} numberOfLines={1}>
                      {c.shortName}
                    </Text>
                    <Text style={[styles.contactSubTag, isSelected && styles.contactSubTagActive]} numberOfLines={1}>
                      {c.tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Specific Sub Selectors with Real Logos */}
          {transferType === 'bank' && (
            <View style={styles.partnerSelectorSection}>
              <Text style={styles.partnerSectionLabel}>PILIH BANK TUJUAN</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partnerSelectorRow}
              >
                {bankList.map((b) => {
                  const isSelected = selectedBank === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.partnerCard, isSelected && styles.partnerCardActive]}
                      onPress={() => {
                        setSelectedBank(b.id);
                        if (targetAccount.length >= 6) {
                          setTargetName(`Budi Santoso (${b.id} Terverifikasi)`);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.partnerLogoWrap}>
                        <Image source={b.logo} style={styles.partnerLogoImage} resizeMode="contain" />
                      </View>
                      <Text style={[styles.partnerNameText, isSelected && styles.partnerNameTextActive]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {transferType === 'ewallet' && (
            <View style={styles.partnerSelectorSection}>
              <Text style={styles.partnerSectionLabel}>PILIH E-WALLET TUJUAN</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partnerSelectorRow}
              >
                {ewalletList.map((ew) => {
                  const isSelected = selectedEwallet === ew.id;
                  return (
                    <TouchableOpacity
                      key={ew.id}
                      style={[styles.partnerCard, isSelected && styles.partnerCardActive]}
                      onPress={() => {
                        setSelectedEwallet(ew.id);
                        if (targetAccount.length >= 8) {
                          setTargetName(`Akun ${ew.id} Terverifikasi`);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.partnerLogoWrap}>
                        <Image source={ew.logo} style={styles.partnerLogoImage} resizeMode="contain" />
                      </View>
                      <Text style={[styles.partnerNameText, isSelected && styles.partnerNameTextActive]}>
                        {ew.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Destination Account Card - Clean & Modern */}
          <View style={styles.formCard}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputCardLabel}>
                {transferType === 'anggota'
                  ? 'NIK Karyawan / No. HP Anggota'
                  : transferType === 'bank'
                  ? `Nomor Rekening Bank ${selectedBank}`
                  : `Nomor Handphone Akun ${selectedEwallet}`}
              </Text>
              <Text style={styles.inputRequiredMark}>*Wajib</Text>
            </View>

            <View style={styles.inputBoxRow}>
              <View style={styles.inputIconBox}>
                <AppIcon
                  name={
                    transferType === 'anggota'
                      ? 'user'
                      : transferType === 'bank'
                      ? 'building'
                      : 'phone'
                  }
                  size={17}
                  color="#1d72db"
                />
              </View>
              <TextInput
                style={styles.textInputField}
                placeholder={
                  transferType === 'anggota'
                    ? 'Ketik NIK contoh: 2024-089 atau 0812...'
                    : transferType === 'bank'
                    ? 'Masukkan nomor rekening tujuan...'
                    : 'Masukkan nomor handphone akun...'
                }
                placeholderTextColor="#94a3b8"
                value={targetAccount}
                onChangeText={handleAccountChange}
              />
              {targetAccount.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setTargetAccount('');
                    setTargetName('');
                  }}
                >
                  <AppIcon name="x" size={13} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Verified Target Name Box with Clean Vector Check */}
            {targetName ? (
              <View style={styles.verifiedCard}>
                <View style={styles.verifiedIconWrap}>
                  <AppIcon name="check-circle" size={14} color="#ffffff" />
                </View>
                <View style={styles.verifiedTextWrap}>
                  <Text style={styles.verifiedHeader}>Penerima Terverifikasi</Text>
                  <Text style={styles.verifiedTargetName}>{targetName}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.inputHelperRow}>
                <View style={styles.inputHelperIconWrap}>
                  <AppIcon name="info" size={11} color="#1d72db" />
                </View>
                <Text style={styles.inputHelperText}>
                  {transferType === 'anggota'
                    ? 'Nama dan keanggotaan akan dicek secara otomatis.'
                    : 'Nama pemilik rekening/akun akan dicek secara otomatis.'}
                </Text>
              </View>
            )}
          </View>

          {/* Amount Input Card - Clean & Prominent */}
          <View style={styles.formCard}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputCardLabel}>Nominal Transfer</Text>
              <TouchableOpacity
                onPress={() => setAmount(userBalance.toString())}
                style={styles.maxAmountBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.maxAmountBtnText}>Transfer Maksimal</Text>
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
                placeholderTextColor="#cbd5e1"
                keyboardType="numeric"
                value={amount ? formatRupiah(numericAmount) : ''}
                onChangeText={(val) => setAmount(val.replace(/[^0-9]/g, ''))}
              />
            </View>

            {/* Dynamic Status / Validation with Clean Vector Icons */}
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
                      Sisa saldo setelah transfer: Rp {formatRupiah(remainingBalance)}
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

          {/* Transfer Note Card - Clean Input */}
          <View style={styles.formCard}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputCardLabel}>Catatan Transfer (Opsional)</Text>
            </View>
            <View style={styles.inputBoxRow}>
              <View style={styles.inputIconBox}>
                <AppIcon name="receipt" size={16} color="#64748b" />
              </View>
              <TextInput
                style={styles.textInputField}
                placeholder="Contoh: Titip makan siang, uang kas..."
                placeholderTextColor="#94a3b8"
                value={note}
                onChangeText={setNote}
              />
              {note.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setNote('')}
                >
                  <AppIcon name="x" size={13} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Live Summary Preview */}
          {numericAmount >= 10000 && (
            <View style={styles.liveSummaryBox}>
              <View style={styles.liveSummaryRow}>
                <Text style={styles.liveSummaryLabel}>Total Ditransfer</Text>
                <Text style={styles.liveSummaryValue}>Rp {formatRupiah(numericAmount)}</Text>
              </View>
              <View style={styles.liveSummaryRow}>
                <Text style={styles.liveSummaryLabel}>Biaya Transaksi</Text>
                <Text style={styles.liveSummaryFree}>Rp 0 (GRATIS)</Text>
              </View>
              <View style={styles.liveSummaryDivider} />
              <View style={styles.liveSummaryRow}>
                <Text style={styles.liveSummaryTotalLabel}>Total Pengurangan Saldo</Text>
                <Text style={styles.liveSummaryTotalValue}>Rp {formatRupiah(numericAmount)}</Text>
              </View>
            </View>
          )}

          {/* Primary Submit Button */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (numericAmount < 10000 || isAmountOverBalance || !targetAccount) &&
                styles.primaryBtnDisabled,
            ]}
            onPress={handleProceedToConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Lanjutkan Transfer ›</Text>
          </TouchableOpacity>

          {/* Security Note Footer */}
          <View style={styles.securityNoteRow}>
            <AppIcon name="lock" size={13} color="#94a3b8" />
            <Text style={styles.securityNoteText}>
              Transaksi aman & terenkripsi oleh Koperasi PT Bakti Idola Tama
            </Text>
          </View>
        </ScrollView>
      ) : (
        /* ================= STEP 2: CONFIRMATION ================= */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          <View style={styles.confirmReceiptCard}>
            {/* Header Ticket Pattern */}
            <View style={styles.receiptTopHeader}>
              <View style={styles.receiptIconBadge}>
                <AppIcon name="transfer" size={24} color="#1d72db" />
              </View>
              <Text style={styles.receiptHeaderTitle}>Rincian Transfer</Text>
              <Text style={styles.receiptHeaderSub}>Periksa kembali data tujuan & nominal</Text>
            </View>

            <View style={styles.receiptAmountBox}>
              <Text style={styles.confirmAmountLabel}>TOTAL NOMINAL TRANSFER</Text>
              <Text style={styles.confirmAmountValue}>Rp {formatRupiah(numericAmount)}</Text>
              <View style={styles.confirmFreeBadge}>
                <Text style={styles.confirmFreeBadgeText}>✓ Bebas Biaya Admin Koperasi</Text>
              </View>
            </View>

            <View style={styles.receiptPerforation}>
              <View style={styles.perforationHoleLeft} />
              <View style={styles.perforationLine} />
              <View style={styles.perforationHoleRight} />
            </View>

            <View style={styles.receiptDetailsSection}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Penerima</Text>
                <Text style={styles.receiptValueBold}>{targetName || targetAccount}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Metode Transfer</Text>
                <Text style={styles.receiptValue}>
                  {transferType === 'anggota'
                    ? 'Sesama Anggota Koperasi BIT'
                    : transferType === 'bank'
                    ? `Transfer Bank (${selectedBank})`
                    : `e-Wallet (${selectedEwallet})`}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Nomor / Rekening</Text>
                <Text style={styles.receiptValueMono}>{targetAccount}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Sumber Dana</Text>
                <Text style={styles.receiptValue}>Saldo Koperasi (Utama)</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Biaya Admin</Text>
                <Text style={styles.receiptFreeHighlight}>GRATIS (Rp 0)</Text>
              </View>

              {note ? (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Catatan</Text>
                  <Text style={styles.receiptValue}>{note}</Text>
                </View>
              ) : null}

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Waktu Proses</Text>
                <Text style={styles.receiptValueGreen}>Real-Time (Instan)</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep('input')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>‹ Ubah Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmActionBtn}
              onPress={handleExecuteTransfer}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmActionBtnText}>Konfirmasi & Kirim ›</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 12,
    paddingBottom: 14,
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
    marginBottom: 8,
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepItemDone: {
    opacity: 0.9,
  },
  stepItemInactive: {
    opacity: 0.5,
  },
  stepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 10.5,
    fontWeight: '700',
  },
  stepNumberActive: {
    backgroundColor: '#ffffff',
    color: '#1d72db',
  },
  stepNumberDone: {
    backgroundColor: '#4ade80',
    color: '#064e3b',
  },
  stepNumberInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#ffffff',
  },
  stepLabelDone: {
    color: '#bbf7d0',
  },
  stepLabelInactive: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  stepDividerLine: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
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
    backgroundColor: 'rgba(29, 114, 219, 0.25)',
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
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  typeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  typeBtnTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  quickContactsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  quickContactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickContactsTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  seeAllTransferText: {
    fontSize: 11.5,
    color: '#1d72db',
    fontWeight: '600',
  },
  transferGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 4,
    paddingBottom: 2,
  },
  contactCard: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  avatarImageWrapper: {
    position: 'relative',
    marginBottom: 5,
    borderRadius: 24,
    padding: 2,
  },
  avatarImageWrapperActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#1d72db',
  },
  contactAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
  },
  contactAvatarAdd: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  contactAvatarAddActive: {
    borderColor: '#1d72db',
    backgroundColor: '#dbeafe',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  contactTitle: {
    fontSize: 11.5,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
  },
  contactTitleActive: {
    color: '#1d72db',
  },
  contactSubTag: {
    fontSize: 9.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
    fontWeight: '500',
  },
  contactSubTagActive: {
    color: '#1d72db',
    fontWeight: '600',
  },
  partnerSelectorSection: {
    marginBottom: 14,
  },
  partnerSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  partnerSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  partnerCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
    height: 62,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  partnerCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
    borderWidth: 1.5,
    shadowColor: '#1d72db',
    shadowOpacity: 0.15,
  },
  partnerLogoWrap: {
    width: 60,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  partnerLogoImage: {
    width: '100%',
    height: '100%',
  },
  partnerNameText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  partnerNameTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  inputRequiredMark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIconBox: {
    marginRight: 8,
  },
  textInputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  clearBtn: {
    padding: 4,
  },
  inputHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputHelperIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHelperText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    gap: 8,
  },
  verifiedIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTextWrap: {
    flex: 1,
  },
  verifiedHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  verifiedTargetName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#14532d',
    marginTop: 1,
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
    marginTop: 6,
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
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
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
  },
  quickNotesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  quickNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  quickNoteIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNotePillText: {
    fontSize: 11.5,
  },
  liveSummaryBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  liveSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveSummaryLabel: {
    fontSize: 11.5,
    color: '#166534',
    fontWeight: '500',
  },
  liveSummaryValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#14532d',
  },
  liveSummaryFree: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803d',
  },
  liveSummaryDivider: {
    height: 1,
    backgroundColor: '#bbf7d0',
    marginVertical: 6,
  },
  liveSummaryTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14532d',
  },
  liveSummaryTotalValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#15803d',
  },
  primaryBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 13.5,
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
    letterSpacing: 0.2,
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
    textAlign: 'center',
  },
  confirmReceiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  receiptTopHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#f8fafc',
  },
  receiptIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  receiptHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptHeaderSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  receiptAmountBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  confirmAmountLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  confirmAmountValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  confirmFreeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
  },
  confirmFreeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  receiptPerforation: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    marginVertical: 2,
    overflow: 'hidden',
  },
  perforationHoleLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginLeft: -8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  perforationLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginHorizontal: 6,
  },
  perforationHoleRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginRight: -8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  receiptDetailsSection: {
    padding: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    width: '38%',
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
  },
  receiptValueBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
  },
  receiptValueMono: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d72db',
    textAlign: 'right',
    fontFamily: 'monospace',
    flex: 1,
  },
  receiptFreeHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    textAlign: 'right',
  },
  receiptValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    textAlign: 'right',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmActionBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 4,
  },
  confirmActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
