import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';
import { mockWallet, mockUser } from '../../data/mockData';
import { TransactionItem } from '../../types';

interface SimpananSukarelaScreenProps {
  onBack: () => void;
  userBalance?: number;
  transactions?: TransactionItem[];
  onNavigateScreen?: (screen: any) => void;
}

const PRESET_NOMINALS = [50000, 100000, 200000, 300000, 500000];

export const SimpananSukarelaScreen: React.FC<SimpananSukarelaScreenProps> = ({
  onBack,
  userBalance = mockWallet.simpananSukarela,
  transactions = [],
  onNavigateScreen,
}) => {
  // State for Simpanan Sukarela Payroll Settings
  const [potonganBulanan, setPotonganBulanan] = useState<number>(100000);
  const [lockedUntilDate, setLockedUntilDate] = useState<string>('21 Maret 2027');
  const [isLocked, setIsLocked] = useState<boolean>(true); // default true: already set

  // Modal States
  const [isSetModalVisible, setIsSetModalVisible] = useState<boolean>(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState<boolean>(false);
  const [tempSelectedNominal, setTempSelectedNominal] = useState<number>(potonganBulanan);
  const [customInputValue, setCustomInputValue] = useState<string>('');
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleOpenSetModal = () => {
    setTempSelectedNominal(potonganBulanan);
    setIsCustomSelected(false);
    setCustomInputValue('');
    setIsSetModalVisible(true);
  };

  const handleSelectPreset = (nominal: number) => {
    setTempSelectedNominal(nominal);
    setIsCustomSelected(false);
    setCustomInputValue('');
  };

  const handleCustomInput = (text: string) => {
    const cleanNum = text.replace(/[^0-9]/g, '');
    setCustomInputValue(cleanNum);
    setIsCustomSelected(true);
    const parsed = parseInt(cleanNum, 10);
    if (!isNaN(parsed)) {
      setTempSelectedNominal(parsed);
    } else {
      setTempSelectedNominal(0);
    }
  };

  const handleProceedToConfirm = () => {
    const finalNominal = isCustomSelected
      ? parseInt(customInputValue, 10) || 0
      : tempSelectedNominal;

    if (!finalNominal || finalNominal < 10000) {
      Alert.alert(
        'Nominal Tidak Valid',
        'Minimal potongan simpanan sukarela bulanan adalah Rp 10.000.'
      );
      return;
    }

    setTempSelectedNominal(finalNominal);
    setIsSetModalVisible(false);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmSaveLock = () => {
    setPotonganBulanan(tempSelectedNominal);
    // Calculate new locked date 6 months from now
    const now = new Date();
    now.setMonth(now.getMonth() + 6);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const newDateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    setLockedUntilDate(newDateStr);
    setIsLocked(true);
    setIsConfirmModalVisible(false);

    Alert.alert(
      'Pengaturan Berhasil Disimpan! 🎉',
      `Potongan Simpanan Sukarela sebesar Rp ${formatRupiah(
        tempSelectedNominal
      )} / bulan telah aktif.\n\nStatus: Terkunci hingga ${newDateStr} (Komitmen 6 Bulan). Pemotongan dilakukan otomatis via slip gaji payroll.`
    );
  };

  const sukarelaTxList = [
    {
      id: 'tx-1',
      title: 'Potongan Payroll Simpanan Sukarela (Sep 2026)',
      amount: potonganBulanan,
      isCredit: true,
      timestamp: '25 Sep 2026, 08:00 WIB',
      statusText: 'Berhasil (Payroll)',
      referenceNo: 'BIT-PAYROLL-9921',
    },
    {
      id: 'tx-2',
      title: 'Penarikan Dana / Cashout ke Rekening Payroll',
      amount: 250000,
      isCredit: false,
      timestamp: '15 Sep 2026, 11:20 WIB',
      statusText: 'Berhasil',
      referenceNo: 'BIT-WD-8812',
    },
    {
      id: 'tx-3',
      title: 'Potongan Payroll Simpanan Sukarela (Agt 2026)',
      amount: potonganBulanan,
      isCredit: true,
      timestamp: '25 Agt 2026, 08:00 WIB',
      statusText: 'Berhasil (Payroll)',
      referenceNo: 'BIT-PAYROLL-8819',
    },
    {
      id: 'tx-4',
      title: 'Potongan Payroll Simpanan Sukarela (Jul 2026)',
      amount: potonganBulanan,
      isCredit: true,
      timestamp: '25 Jul 2026, 08:00 WIB',
      statusText: 'Berhasil (Payroll)',
      referenceNo: 'BIT-PAYROLL-7712',
    },
  ];

  return (
    <View style={styles.screenContainer}>
      {/* 1. TOP NAVIGATION BAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <AppIcon name="chevron-left" size={19} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>Detail Simpanan Sukarela</Text>
          <Text style={styles.topNavSub}>Pemotongan Payroll • Komitmen 6 Bulan</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Konsep Simpanan Sukarela Otomatis',
              `Simpanan Sukarela ini bekerja seperti Simpanan Wajib dengan sistem pemotongan otomatis langsung dari slip gaji (payroll) bulanan.\n\nAturan:\n• Nominal potongan diatur dan terkunci selama 6 bulan.\n• Perubahan nominal hanya dapat dilakukan setelah periode 6 bulan berakhir.\n• Saldo simpanan tetap bebas dicairkan kapan saja ke rekening payroll anggota.`
            )
          }
          style={styles.infoBtn}
          activeOpacity={0.8}
        >
          <AppIcon name="info" size={17} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. MAIN BALANCE & PAYROLL SETTING CARD */}
        <View style={styles.mainBalanceCard}>
          <View style={styles.balanceCardTop}>
            <View style={styles.balanceIconWrap}>
              <AppIcon name="wallet" size={20} color="#1d72db" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceCardLabel}>Saldo Simpanan Sukarela</Text>
              <Text style={styles.balanceCardSub}>{mockUser.name} • {mockUser.jabatan}</Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Payroll Otomatis</Text>
            </View>
          </View>

          <Text style={styles.balanceAmountText}>Rp {formatRupiah(userBalance)}</Text>

          {/* Monthly Fixed Deduction Status Box */}
          <View style={styles.payrollStatusBox}>
            <View style={styles.payrollStatusLeft}>
              <View style={styles.payrollIconWrap}>
                <AppIcon name="calendar" size={15} color="#1d72db" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payrollLabel}>Potongan Payroll Bulanan:</Text>
                <Text style={styles.payrollValue}>
                  Rp {formatRupiah(potonganBulanan)} <Text style={styles.payrollPerMonth}>/ bulan</Text>
                </Text>
              </View>
            </View>
            <View style={styles.lockBadgeContainer}>
              <AppIcon name="lock" size={11} color="#0369a1" />
              <Text style={styles.lockBadgeText}>Terkunci s/d {lockedUntilDate}</Text>
            </View>
          </View>

          {/* Action Buttons Row: Atur / Status Potongan & Tarik */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={handleOpenSetModal}
              activeOpacity={0.85}
            >
              <AppIcon name={isLocked ? "lock" : "edit"} size={13} color="#ffffff" />
              <Text style={styles.actionBtnPrimaryText}>
                {isLocked ? "Status Potongan" : "Atur Potongan Bulanan"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() =>
                Alert.alert(
                  'Tarik / Cashout Saldo',
                  `Saldo Simpanan Sukarela tersedia Rp ${formatRupiah(userBalance)}.\n\nPencairan saldo akan ditransfer langsung ke rekening payroll (${mockUser.name}) dalam 1x24 jam hari kerja tanpa potongan tambahan.`
                )
              }
              activeOpacity={0.85}
            >
              <AppIcon name="withdraw" size={13} color="#1d72db" />
              <Text style={styles.actionBtnSecondaryText}>Tarik / Cashout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. CARD KETENTUAN PENARIKAN & TRANSAKSI */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconCircle}>
              <AppIcon name="info" size={13} color="#ffffff" />
            </View>
            <Text style={styles.sectionHeading}>Ketentuan & Mekanisme Simpanan</Text>
          </View>

          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#2563eb' }]}>
                <AppIcon name="simpanan" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Potongan Otomatis Slip Gaji</Text>
                <Text style={styles.featureDesc}>
                  Dipotong fiks dari slip gaji bulanan anggota seperti halnya Simpanan Wajib
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#d97706' }]}>
                <AppIcon name="lock" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Komitmen Terkunci 6 Bulan</Text>
                <Text style={styles.featureDesc}>
                  Nominal yang diset dikunci dan hanya dapat diubah kembali setelah 6 bulan
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#059669' }]}>
                <AppIcon name="withdraw" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Khusus Penarikan Dana (Fleksibel)</Text>
                <Text style={styles.featureDesc}>
                  Saldo simpanan tetap dapat dicairkan kapan saja ke rekening payroll anggota
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#7c3aed' }]}>
                <AppIcon name="gift" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Bagi Hasil SHU Tahunan</Text>
                <Text style={styles.featureDesc}>
                  Saldo simpanan sukarela aktif memperbesar porsi pembagian SHU saat RAT
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. CARD KEUNTUNGAN SIMPANAN SUKARELA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#059669' }]}>
              <AppIcon name="check-circle" size={13} color="#ffffff" />
            </View>
            <Text style={styles.sectionHeading}>Keuntungan Simpanan Sukarela</Text>
          </View>

          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <AppIcon name="check" size={13} color="#16a34a" />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Disiplin Menabung Otomatis:</Text> Pemotongan fiks dari payroll tanpa perlu repot transfer atau setor manual setiap bulan.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <AppIcon name="check" size={13} color="#16a34a" />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Proteksi Komitmen 6 Bulan:</Text> Membantu merencanakan dan menjaga tabungan masa depan anggota tetap konsisten.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <AppIcon name="check" size={13} color="#16a34a" />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Pemeliharaan Rekening:</Text> Pengelolaan simpanan anggota terintegrasi dan transparan.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <AppIcon name="check" size={13} color="#16a34a" />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Bagi Hasil SHU:</Text> Rata-rata saldo bulanan dihitung sebagai porsi pembagian SHU koperasi saat RAT tahunan.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. DAFTAR MUTASI / RIWAYAT SIMPANAN SUKARELA */}
        <Text style={styles.historySectionTitle}>Mutasi Saldo Simpanan Sukarela</Text>
        <View style={styles.historyCard}>
          {sukarelaTxList.map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.historyItemRow,
                index === sukarelaTxList.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.historyItemLeft}>
                <View
                  style={[
                    styles.historyIconBox,
                    item.isCredit ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fee2e2' },
                  ]}
                >
                  <AppIcon
                    name={item.isCredit ? 'simpanan' : 'receipt'}
                    size={13}
                    color={item.isCredit ? '#16a34a' : '#ef4444'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.historyItemDate}>
                    {item.timestamp || 'Hari Ini'} • {item.referenceNo || 'BIT-TX'}
                  </Text>
                </View>
              </View>

              <View style={styles.historyItemRight}>
                <Text
                  style={[
                    styles.historyItemAmount,
                    item.isCredit ? { color: '#16a34a' } : { color: '#ef4444' },
                  ]}
                >
                  {item.isCredit ? '+' : '-'}Rp {formatRupiah(item.amount)}
                </Text>
                <Text style={styles.historyItemStatus}>{item.statusText || 'Berhasil'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL: ATUR / STATUS POTONGAN SIMPANAN SUKARELA           */}
      {/* ========================================================= */}
      <Modal
        visible={isSetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalHeaderIconWrap,
                  isLocked && { backgroundColor: '#fef3c7' },
                ]}
              >
                <AppIcon
                  name={isLocked ? 'lock' : 'edit'}
                  size={18}
                  color={isLocked ? '#d97706' : '#1d72db'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {isLocked
                    ? 'Status Potongan Simpanan Sukarela'
                    : 'Atur Potongan Simpanan Sukarela'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isLocked
                    ? 'Pengaturan potongan terkunci selama 6 bulan'
                    : 'Pilih atau masukkan nominal potongan slip gaji bulanan'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSetModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Current Value Pill */}
            <View style={styles.currentValBanner}>
              <Text style={styles.currentValLabel}>Potongan Aktif Saat Ini:</Text>
              <Text style={styles.currentValNum}>Rp {formatRupiah(potonganBulanan)} / bulan</Text>
            </View>

            {isLocked ? (
              /* ===================================================== */
              /* STATE SUDAH DI-SET: TAMPILAN NOMINAL DIHAPUS & NOTE   */
              /* ===================================================== */
              <View style={styles.lockedStateContainer}>
                {/* Big Locked Notice Box */}
                <View style={styles.lockedNoticeBox}>
                  <View style={styles.lockedNoticeIconWrap}>
                    <AppIcon name="calendar" size={24} color="#d97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lockedNoticeHeading}>
                      Perubahan hanya dapat dilakukan pada:
                    </Text>
                    <Text style={styles.lockedNoticeDateHighlight}>
                      {lockedUntilDate}
                    </Text>
                    <Text style={styles.lockedNoticeDesc}>
                      Nominal potongan simpanan sukarela via slip gaji telah dikunci selama 6 bulan untuk menjaga konsistensi menabung dan administrasi payroll.
                    </Text>
                  </View>
                </View>

                {/* Summary Info Cards */}
                <View style={styles.lockedSummaryCard}>
                  <View style={styles.lockedSummaryRow}>
                    <Text style={styles.lockedSummaryLabel}>Status Penguncian:</Text>
                    <View style={styles.lockedStatusBadge}>
                      <AppIcon name="lock" size={10} color="#0369a1" />
                      <Text style={styles.lockedStatusBadgeText}>Aktif (6 Bulan)</Text>
                    </View>
                  </View>
                  <View style={styles.lockedSummaryDivider} />
                  <View style={styles.lockedSummaryRow}>
                    <Text style={styles.lockedSummaryLabel}>Metode Pemotongan:</Text>
                    <Text style={styles.lockedSummaryValue}>Slip Gaji Bulanan (Payroll)</Text>
                  </View>
                  <View style={styles.lockedSummaryDivider} />
                  <View style={styles.lockedSummaryRow}>
                    <Text style={styles.lockedSummaryLabel}>Penarikan Dana:</Text>
                    <Text style={styles.lockedSummaryValueGreen}>Bebas Ditarik Kapan Saja</Text>
                  </View>
                </View>

                {/* Single Close / Understand Button */}
                <TouchableOpacity
                  style={styles.modalBtnCloseLocked}
                  onPress={() => setIsSetModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnCloseLockedText}>Tutup & Mengerti</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ===================================================== */
              /* STATE BELUM DI-SET: FORM PEMILIHAN NOMINAL AKTIF      */
              /* ===================================================== */
              <View>
                <Text style={styles.presetSectionLabel}>Pilih Nominal Potongan Rutin:</Text>

                {/* Nominal Presets Grid */}
                <View style={styles.presetGrid}>
                  {PRESET_NOMINALS.map((nom) => {
                    const isSelected = !isCustomSelected && tempSelectedNominal === nom;
                    return (
                      <TouchableOpacity
                        key={nom}
                        style={[
                          styles.presetChip,
                          isSelected && styles.presetChipSelected,
                        ]}
                        onPress={() => handleSelectPreset(nom)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isSelected && styles.presetChipTextSelected,
                          ]}
                        >
                          Rp {formatRupiah(nom)}
                        </Text>
                        {nom === 100000 && (
                          <View style={[styles.recBadge, isSelected && styles.recBadgeSelected]}>
                            <Text
                              style={[
                                styles.recBadgeText,
                                isSelected && styles.recBadgeTextSelected,
                              ]}
                            >
                              Rekomendasi
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Input */}
                <Text style={styles.presetSectionLabel}>Atau Masukkan Nominal Lainnya:</Text>
                <View
                  style={[
                    styles.customInputWrapper,
                    isCustomSelected && styles.customInputWrapperActive,
                  ]}
                >
                  <Text style={styles.rpPrefix}>Rp</Text>
                  <TextInput
                    style={styles.customTextInput}
                    placeholder="Contoh: 150.000"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={
                      customInputValue
                        ? formatRupiah(parseInt(customInputValue, 10) || 0)
                        : ''
                    }
                    onChangeText={handleCustomInput}
                    onFocus={() => setIsCustomSelected(true)}
                  />
                </View>

                {/* 6-Month Commitment Notice */}
                <View style={styles.noticeLockBox}>
                  <AppIcon name="lock" size={15} color="#d97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noticeLockTitle}>Aturan Penguncian 6 Bulan</Text>
                    <Text style={styles.noticeLockDesc}>
                      Setelah disimpan, nominal potongan ini akan otomatis dipotong setiap bulan dan{' '}
                      <Text style={{ fontWeight: '800', color: '#b45309' }}>
                        tidak dapat diubah selama 6 bulan
                      </Text>{' '}
                      ke depan.
                    </Text>
                  </View>
                </View>

                {/* Modal Buttons */}
                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={styles.modalBtnCancel}
                    onPress={() => setIsSetModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBtnCancelText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnSubmit}
                    onPress={handleProceedToConfirm}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalBtnSubmitText}>Lanjutkan Simpan</Text>
                    <AppIcon name="chevron-right" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: KONFIRMASI PENGUNCIAN 6 BULAN (CRITICAL STEP)    */}
      {/* ========================================================= */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.confirmModalCard]}>
            {/* Warning Lock Header */}
            <View style={styles.confirmHeaderIconWrap}>
              <AppIcon name="lock" size={32} color="#d97706" />
            </View>

            <Text style={styles.confirmTitle}>Konfirmasi & Kunci 6 Bulan</Text>
            <Text style={styles.confirmDesc}>
              Harap periksa kembali sebelum menyetujui. Pengaturan ini akan mengikat selama periode 6 bulan.
            </Text>

            {/* Detail Box */}
            <View style={styles.confirmDetailBox}>
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmDetailLabel}>Nominal Potongan Baru:</Text>
                <Text style={styles.confirmDetailValueHighlight}>
                  Rp {formatRupiah(tempSelectedNominal)} / bulan
                </Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmDetailLabel}>Mulai Efektif:</Text>
                <Text style={styles.confirmDetailValue}>Payroll Gaji Bulan Ini</Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmDetailLabel}>Periode Terkunci:</Text>
                <Text style={styles.confirmDetailValue}>6 Bulan Penuh</Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmDetailLabel}>Dapat Diubah Kembali:</Text>
                <Text style={styles.confirmDetailValueDate}>Setelah 6 Bulan Berjalan</Text>
              </View>
            </View>

            {/* Explicit Confirmation Warning */}
            <View style={styles.warningAlertBox}>
              <AppIcon name="info" size={16} color="#b91c1c" />
              <Text style={styles.warningAlertText}>
                Dengan menekan tombol setuju di bawah, Anda mengonfirmasi pemotongan fiks dari slip gaji dan memahami bahwa nominal{' '}
                <Text style={{ fontWeight: '800' }}>TIDAK DAPAT DIUBAH</Text> sampai periode 6 bulan selesai.
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.confirmAgreeBtn}
              onPress={handleConfirmSaveLock}
              activeOpacity={0.85}
            >
              <AppIcon name="check" size={16} color="#ffffff" />
              <Text style={styles.confirmAgreeBtnText}>Ya, Setujui & Kunci 6 Bulan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBackBtn}
              onPress={() => {
                setIsConfirmModalVisible(false);
                setIsSetModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBackBtnText}>Batal / Periksa Kembali</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1d72db',
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCenter: {
    alignItems: 'center',
    flex: 1,
  },
  topNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  topNavSub: {
    fontSize: 10,
    color: '#dbeafe',
    marginTop: 1,
    fontWeight: '500',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },

  /* Main Balance Card */
  mainBalanceCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  balanceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e40af',
  },
  balanceCardSub: {
    fontSize: 9.5,
    color: '#3b82f6',
    marginTop: 1,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#86efac',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },
  balanceAmountText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1d72db',
    letterSpacing: 0.3,
    marginBottom: 12,
  },

  /* Payroll Status Box */
  payrollStatusBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 10,
    marginBottom: 14,
  },
  payrollStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 6,
  },
  payrollIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payrollLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  payrollValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  payrollPerMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  lockBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bae6fd',
    alignSelf: 'flex-start',
  },
  lockBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0369a1',
  },

  /* Action Buttons Row */
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1d72db',
    paddingVertical: 9.5,
    borderRadius: 10,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 9.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },

  /* Feature Grid */
  featureGrid: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  featureDesc: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },

  /* Rules List */
  rulesList: {
    gap: 9,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 16,
  },
  boldDark: {
    fontWeight: '700',
    color: '#1e293b',
  },

  /* History */
  historySectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    marginRight: 8,
  },
  historyIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyItemDate: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemAmount: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyItemStatus: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },

  /* ========================================= */
  /* MODAL STYLES                              */
  /* ========================================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  currentValBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  currentValLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  currentValNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },

  /* LOCKED STATE STYLES (NEW) */
  lockedStateContainer: {
    width: '100%',
  },
  lockedNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#fde68a',
    marginBottom: 14,
  },
  lockedNoticeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  lockedNoticeHeading: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  lockedNoticeDateHighlight: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b45309',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  lockedNoticeDesc: {
    fontSize: 9.5,
    color: '#78350f',
    lineHeight: 14,
  },
  lockedSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
  },
  lockedSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lockedSummaryLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  lockedSummaryValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  lockedSummaryValueGreen: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#16a34a',
  },
  lockedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0369a1',
  },
  lockedSummaryDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  modalBtnCloseLocked: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  modalBtnCloseLockedText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* PRESET GRID & FORM (UNLOCKED STATE) */
  presetSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flexGrow: 1,
    flexBasis: '30%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipSelected: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  presetChipTextSelected: {
    color: '#1d72db',
    fontWeight: '800',
  },
  recBadge: {
    marginTop: 3,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recBadgeSelected: {
    backgroundColor: '#1d72db',
  },
  recBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0284c7',
  },
  recBadgeTextSelected: {
    color: '#ffffff',
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  customInputWrapperActive: {
    borderColor: '#1d72db',
    backgroundColor: '#ffffff',
  },
  rpPrefix: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginRight: 6,
  },
  customTextInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 6,
  },
  noticeLockBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 16,
  },
  noticeLockTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 2,
  },
  noticeLockDesc: {
    fontSize: 9.5,
    color: '#78350f',
    lineHeight: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  modalBtnSubmit: {
    flex: 1.6,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  modalBtnSubmitText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* Confirm Modal Styles */
  confirmModalCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  confirmHeaderIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fde68a',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
  },
  confirmDesc: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  confirmDetailBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
  },
  confirmDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  confirmDetailLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  confirmDetailValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  confirmDetailValueHighlight: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1d72db',
  },
  confirmDetailValueDate: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#d97706',
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  warningAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  warningAlertText: {
    flex: 1,
    fontSize: 9.5,
    color: '#991b1b',
    lineHeight: 14,
  },
  confirmAgreeBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1d72db',
    paddingVertical: 11,
    borderRadius: 10,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  confirmAgreeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  confirmBackBtn: {
    width: '100%',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBackBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
});
