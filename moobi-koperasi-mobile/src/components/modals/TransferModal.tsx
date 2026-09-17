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
import { AppIcon, IconType } from '../common/AppIcon';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
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

export const TransferModal: React.FC<TransferModalProps> = ({
  visible,
  onClose,
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
          text: 'Tutup',
          onPress: () => {
            setStep('input');
            setAmount('');
            setTargetAccount('');
            setTargetName('');
            setNote('');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.headerIconCircle}>
                <AppIcon name="transfer" size={18} color="#1d72db" />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {step === 'input' ? 'Transfer Saldo Koperasi' : 'Konfirmasi Transfer'}
                </Text>
                <Text style={styles.modalSub}>Bebas Biaya Admin • Instan Real-Time</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setStep('input');
                onClose();
              }}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <AppIcon name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {step === 'input' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Hero Wallet Balance Card */}
              <View style={styles.heroBalanceCard}>
                <View style={styles.heroGlowCircle} />
                <View style={styles.heroBalanceTop}>
                  <View style={styles.heroLabelWrap}>
                    <AppIcon name="wallet" size={15} color="#93c5fd" />
                    <Text style={styles.heroBalanceLabel}>Saldo Koperasi Tersedia</Text>
                  </View>
                </View>

                <View style={styles.heroBalanceMain}>
                  <Text style={styles.heroCurrency}>Rp</Text>
                  <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
                </View>
              </View>

              {/* Method Switcher */}
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
                    size={14}
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
                    size={14}
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
                    size={14}
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

              {/* Bank Selector (Original Clean Style) */}
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

              {/* e-Wallet Selector (Original Clean Style) */}
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

              {/* Destination Input Card */}
              <View style={styles.formCard}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputCardLabel}>
                    {transferType === 'anggota'
                      ? 'NIK Karyawan / No. HP Anggota PT BIT'
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
                      size={16}
                      color="#1d72db"
                    />
                  </View>
                  <TextInput
                    style={styles.textInputField}
                    placeholder={
                      transferType === 'anggota'
                        ? 'Contoh: 2024-089 atau 0812...'
                        : 'Masukkan nomor rekening...'
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

              {/* Amount Input Card */}
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
                          Sisa saldo: Rp {formatRupiah(remainingBalance)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

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

              {/* Note Card */}
              <View style={styles.formCard}>
                <Text style={styles.inputCardLabel}>Catatan Transfer (Opsional)</Text>
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
                </View>
              </View>

              {/* Live Summary */}
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
                </View>
              )}

              {/* Submit Button */}
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
            </ScrollView>
          ) : (
            /* Confirm Step */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={styles.confirmReceiptCard}>
                <View style={styles.receiptTopHeader}>
                  <View style={styles.receiptIconBadge}>
                    <AppIcon name="transfer" size={22} color="#1d72db" />
                  </View>
                  <Text style={styles.receiptHeaderTitle}>Rincian Transfer</Text>
                  <Text style={styles.receiptHeaderSub}>Periksa kembali data transfer</Text>
                </View>

                <View style={styles.receiptAmountBox}>
                  <Text style={styles.confirmAmountLabel}>TOTAL NOMINAL TRANSFER</Text>
                  <Text style={styles.confirmAmountValue}>Rp {formatRupiah(numericAmount)}</Text>
                  <View style={styles.confirmFreeBadge}>
                    <Text style={styles.confirmFreeBadgeText}>✓ Bebas Biaya Admin Koperasi</Text>
                  </View>
                </View>

                <View style={styles.receiptDetailsSection}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Penerima</Text>
                    <Text style={styles.receiptValueBold}>{targetName || targetAccount}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Metode</Text>
                    <Text style={styles.receiptValue}>
                      {transferType === 'anggota'
                        ? '👥 Sesama Anggota BIT'
                        : transferType === 'bank'
                        ? `🏦 Bank (${selectedBank})`
                        : `📱 e-Wallet (${selectedEwallet})`}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Nomor Tujuan</Text>
                    <Text style={styles.receiptValueMono}>{targetAccount}</Text>
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
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setStep('input')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryBtnText}>‹ Ubah</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmActionBtn}
                  onPress={handleExecuteTransfer}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmActionBtnText}>Kirim Sekarang 🚀</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 10.5,
    color: '#16a34a',
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    borderRadius: 18,
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
    backgroundColor: 'rgba(29, 114, 219, 0.25)',
  },
  heroBalanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    marginTop: 2,
  },
  heroCurrency: {
    fontSize: 15,
    fontWeight: '600',
    color: '#38bdf8',
  },
  heroBalanceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
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
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickContactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickContactsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  seeAllTransferText: {
    fontSize: 11,
    color: '#1d72db',
    fontWeight: '700',
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
    marginBottom: 4,
    borderRadius: 22,
    padding: 2,
  },
  avatarImageWrapperActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#1d72db',
  },
  contactAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  contactAvatarAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  contactAvatarAddActive: {
    borderColor: '#1d72db',
    backgroundColor: '#dbeafe',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
  },
  contactTitle: {
    fontSize: 11,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
  },
  contactTitleActive: {
    color: '#1d72db',
  },
  contactSubTag: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
    fontWeight: '600',
  },
  contactSubTagActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  partnerSelectorSection: {
    marginBottom: 14,
  },
  partnerSectionLabel: {
    fontSize: 10,
    fontWeight: '600',
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
    fontWeight: '700',
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
    padding: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputCardLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1e293b',
  },
  inputRequiredMark: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ef4444',
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  inputIconBox: {
    marginRight: 6,
  },
  textInputField: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  inputHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputHelperIconWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHelperText: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    flex: 1,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    gap: 6,
  },
  verifiedIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheckMark: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedTextWrap: {
    flex: 1,
  },
  verifiedHeader: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  verifiedTargetName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14532d',
    marginTop: 1,
  },
  maxAmountBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  maxAmountBtnText: {
    fontSize: 10,
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
    paddingVertical: 8,
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
  },
  amountStatusRow: {
    marginTop: 5,
  },
  statusMsgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountErrorText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#dc2626',
  },
  amountSuccessText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  quickChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 9,
  },
  quickAmountChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickAmountChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  quickAmountChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickAmountChipTextActive: {
    color: '#1d72db',
  },
  quickNotesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickNoteIconBadge: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNotePillText: {
    fontSize: 10.5,
  },
  liveSummaryBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  liveSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveSummaryLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  liveSummaryValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#14532d',
  },
  liveSummaryFree: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  primaryBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 13,
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
  confirmReceiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  receiptTopHeader: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#f8fafc',
  },
  receiptIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  receiptHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptHeaderSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  receiptAmountBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmAmountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmAmountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d72db',
    marginVertical: 3,
  },
  confirmFreeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confirmFreeBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
  },
  receiptDetailsSection: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '600',
    width: '38%',
  },
  receiptValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
  },
  receiptValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1,
  },
  receiptValueMono: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1d72db',
    textAlign: 'right',
    fontFamily: 'monospace',
    flex: 1,
  },
  receiptFreeHighlight: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16a34a',
    textAlign: 'right',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
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
    fontWeight: '600',
    color: '#475569',
  },
  confirmActionBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
