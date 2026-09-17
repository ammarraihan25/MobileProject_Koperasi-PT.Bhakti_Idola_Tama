import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppIcon } from '../components/common/AppIcon';
import { mockWallet, mockUser } from '../data/mockData';
import { PinjamanModal } from '../components/modals/PinjamanModal';

interface KeuanganScreenProps {
  userBalance?: number;
  userCoins?: number;
  plafonPinjaman?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  simpananPokok?: number;
  simpananWajib?: number;
  simpananSukarela?: number;
  onNavigateScreen?: (screen: any) => void;
  onApplyLoan?: (amount: number, tenor: number) => void;
}

export const KeuanganScreen: React.FC<KeuanganScreenProps> = ({
  userBalance = mockWallet.saldoUtama,
  userCoins = mockWallet.moobiCoins,
  plafonPinjaman = mockWallet.plafonPinjaman,
  pinjamanAktif = mockWallet.pinjamanAktif,
  angsuranPerBulan = mockWallet.angsuranPerBulan,
  sisaTenorBulan = mockWallet.sisaTenorBulan,
  simpananPokok = mockWallet.simpananPokok,
  simpananWajib = mockWallet.simpananWajib,
  simpananSukarela = mockWallet.simpananSukarela,
  onNavigateScreen,
  onApplyLoan,
}) => {
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  // Pulse & Fade Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const toggleHideBalance = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    setHideBalance(!hideBalance);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const totalSimpanan = simpananWajib + simpananSukarela + simpananPokok;
  const totalAset = userBalance + totalSimpanan;

  // Percentage calculations for Simpanan meter
  const wajibPercent = Math.round((simpananWajib / totalSimpanan) * 100);
  const sukarelaPercent = Math.round((simpananSukarela / totalSimpanan) * 100);
  const pokokPercent = 100 - wajibPercent - sukarelaPercent;

  const handleAction = (title: string) => {
    Alert.alert(
      'Layanan Keuangan Koperasi',
      `Membuka modul: ${title}\nTerhubung ke database PT Bakti Idola Tama.`
    );
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Ringkasan Keuangan (Royal Blue Fintech Theme) */}
      <View style={styles.header}>
        {/* Ambient Geometric Watermarks */}
        <View style={styles.watermarkCircle1} />
        <View style={styles.watermarkCircle2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Keuangan & Simpan Pinjam</Text>
            <View style={styles.verifiedRow}>
              <Animated.View
                style={[
                  styles.liveSyncDot,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Text style={styles.headerSub}>
                PT Bakti Idola Tama • Auto-Debit Payroll Aktif
              </Text>
            </View>
          </View>
        </View>

        {/* Total Aset Summary Card with Eye Toggle & Info Icon Trigger */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryLabelRow}>
              <Text style={styles.summaryLabel}>Total Saldo & Simpanan</Text>
              
              <TouchableOpacity
                onPress={toggleHideBalance}
                style={styles.iconActionBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AppIcon
                  name={hideBalance ? 'eye-off' : 'eye'}
                  size={14}
                  color="#bae6fd"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDetailModalVisible(true)}
                style={styles.detailPillBtn}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="info" size={11} color="#ffffff" />
                <Text style={styles.detailPillText}>Detail</Text>
              </TouchableOpacity>
            </View>

            {/* Main Total Amount */}
            <Animated.Text
              style={[
                styles.summaryAmount,
                { opacity: fadeAnim },
              ]}
            >
              Rp {hideBalance ? '••••••••' : formatRupiah(totalAset)}
            </Animated.Text>
          </View>

          {/* Redesigned + Top Up Pill Button */}
          <TouchableOpacity
            style={styles.headerTopUpBtn}
            onPress={() => {
              if (onNavigateScreen) {
                onNavigateScreen('transfer');
              } else {
                handleAction('Top Up Saldo');
              }
            }}
            activeOpacity={0.85}
          >
            <AppIcon name="topup" size={13} color="#1d72db" />
            <Text style={styles.headerTopUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sumber Dana & Dompet Digital */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sumber Dana & Dompet</Text>
          <TouchableOpacity
            onPress={() => handleAction('Kelola Dompet')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLink}>Kelola ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGroup}>
          {/* Saldo Koperasi */}
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => {
              if (onNavigateScreen) {
                onNavigateScreen('transfer');
              } else {
                handleAction('Detail Saldo Koperasi');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#eff6ff' }]}>
              <AppIcon name="wallet" size={20} color="#1d72db" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Moobi Saldo Koperasi</Text>
              <Text style={styles.itemSubtitle}>Dompet Utama Karyawan</Text>
            </View>
            <View style={styles.amountCol}>
              <Animated.Text
                style={[
                  styles.itemAmount,
                  { opacity: fadeAnim },
                ]}
              >
                Rp {hideBalance ? '••••••••' : formatRupiah(userBalance)}
              </Animated.Text>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Buku Simpanan Anggota Koperasi (With Segmented Composition Visualizer) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buku Simpanan Anggota (SHU)</Text>
        </View>

        <View style={styles.cardGroup}>
          {/* Simpanan Header Total Bar */}
          <View style={styles.simpananTotalBar}>
            <View>
              <Text style={styles.simpananTotalLabel}>Total Simpanan Terkumpul</Text>
              <Animated.Text
                style={[
                  styles.simpananTotalValue,
                  { opacity: fadeAnim },
                ]}
              >
                Rp {hideBalance ? '••••••••' : formatRupiah(totalSimpanan)}
              </Animated.Text>
            </View>
            <View style={styles.shuPillBadge}>
              <Text style={styles.shuPillText}>Dividen Siap</Text>
            </View>
          </View>

          {/* Segmented Composition Meter */}
          <View style={styles.meterWrapper}>
            <View style={styles.segmentedBar}>
              <View style={[styles.segment, { flex: wajibPercent, backgroundColor: '#1d72db' }]} />
              <View style={[styles.segment, { flex: sukarelaPercent, backgroundColor: '#16a34a' }]} />
              <View style={[styles.segment, { flex: pokokPercent, backgroundColor: '#64748b' }]} />
            </View>

            {/* Meter Legend Chips */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#1d72db' }]} />
                <Text style={styles.legendText}>Wajib {wajibPercent}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
                <Text style={styles.legendText}>Sukarela {sukarelaPercent}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#64748b' }]} />
                <Text style={styles.legendText}>Pokok {pokokPercent}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Simpanan Wajib */}
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => handleAction('Simpanan Wajib')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#1d72db' }]}>
              <AppIcon name="simpanan" size={18} color="#ffffff" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Simpanan Wajib</Text>
              <Text style={styles.itemSubtitle}>
                Auto-debit Payroll Rp 100.000 / bln
              </Text>
            </View>
            <View style={styles.amountCol}>
              <Animated.Text
                style={[
                  styles.itemAmount,
                  { opacity: fadeAnim },
                ]}
              >
                Rp {hideBalance ? '••••••••' : formatRupiah(simpananWajib)}
              </Animated.Text>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Simpanan Sukarela */}
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => handleAction('Simpanan Sukarela')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#16a34a' }]}>
              <AppIcon name="check-circle" size={18} color="#ffffff" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Simpanan Sukarela</Text>
              <Text style={styles.itemSubtitle}>
                Bagi hasil SHU • Fleksibel ditarik
              </Text>
            </View>
            <View style={styles.amountCol}>
              <Animated.Text
                style={[
                  styles.itemAmount,
                  { opacity: fadeAnim },
                ]}
              >
                Rp {hideBalance ? '••••••••' : formatRupiah(simpananSukarela)}
              </Animated.Text>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Simpanan Pokok */}
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => handleAction('Simpanan Pokok')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#0284c7' }]}>
              <AppIcon name="lock" size={18} color="#ffffff" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Simpanan Pokok Awal</Text>
              <Text style={styles.itemSubtitle}>Status Anggota Tetap Aktif</Text>
            </View>
            <View style={styles.amountCol}>
              <Animated.Text
                style={[
                  styles.itemAmount,
                  { opacity: fadeAnim },
                ]}
              >
                Rp {hideBalance ? '••••••••' : formatRupiah(simpananPokok)}
              </Animated.Text>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Pinjaman Karyawan & Potong Gaji (With Loan Progress Tracker) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pinjaman Karyawan Pabrik</Text>
        </View>

        <View style={styles.cardGroup}>
          {/* Active Loan Overview with Live Progress */}
          <View style={styles.activeLoanBox}>
            <View style={styles.activeLoanTopRow}>
              <View style={styles.activeStatusPill}>
                <Animated.View
                  style={[
                    styles.activePulseDot,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Text style={styles.activeStatusText}>Cicilan Berjalan</Text>
              </View>
              <Animated.Text
                style={[
                  styles.activeLoanAmount,
                  { opacity: fadeAnim },
                ]}
              >
                Rp {hideBalance ? '••••••••' : formatRupiah(pinjamanAktif)}
              </Animated.Text>
            </View>

            {/* Loan Progress Meter */}
            <View style={styles.loanProgressRow}>
              <View style={styles.loanProgressBarBg}>
                <View style={styles.loanProgressBarFill} />
              </View>
              <Text style={styles.loanProgressText}>Sisa {sisaTenorBulan}/12 Bln</Text>
            </View>

            <Text style={styles.activeLoanSub}>
              Angsuran Rp {formatRupiah(angsuranPerBulan)} / bulan terpotong slip gaji
            </Text>
          </View>

          {/* Action CTA Button */}
          <TouchableOpacity
            style={styles.pinjamActionPill}
            onPress={() => {
              if (onNavigateScreen) {
                onNavigateScreen('pinjaman');
              } else {
                setLoanModalVisible(true);
              }
            }}
            activeOpacity={0.85}
          >
            <View style={styles.pinjamActionLeft}>
              <AppIcon name="bolt" size={16} color="#ffffff" />
              <Text style={styles.pinjamActionPillText}>
                Ajukan Pinjaman Cepat (Bunga 0.8%)
              </Text>
            </View>
            <View style={styles.pinjamActionArrowCircle}>
              <AppIcon name="chevron-right" size={10} color="#00aa13" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Additional Financing */}
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => handleAction('Pinjaman Agunan BPKB')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#d97706' }]}>
              <AppIcon name="paylater" size={18} color="#ffffff" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Pembiayaan Jaminan BPKB</Text>
              <Text style={styles.itemSubtitle}>
                Khusus kendaraan karyawan pabrik
              </Text>
            </View>
            <AppIcon name="chevron-right" size={14} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Rekap Potong Gaji Periode Ini (Digital Pay Slip Card) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estimasi Potongan Slip Gaji</Text>
        </View>

        <View style={styles.payrollCard}>
          <View style={styles.payrollRow}>
            <View style={styles.payrollLabelWrapper}>
              <View style={[styles.payrollDot, { backgroundColor: '#1d72db' }]} />
              <Text style={styles.payrollLabel}>Angsuran Pinjaman Koperasi</Text>
            </View>
            <Text style={styles.payrollVal}>Rp 250.000</Text>
          </View>

          <View style={styles.payrollRow}>
            <View style={styles.payrollLabelWrapper}>
              <View style={[styles.payrollDot, { backgroundColor: '#16a34a' }]} />
              <Text style={styles.payrollLabel}>Simpanan Wajib Bulanan</Text>
            </View>
            <Text style={styles.payrollVal}>Rp 100.000</Text>
          </View>

          <View style={styles.payrollRow}>
            <View style={styles.payrollLabelWrapper}>
              <View style={[styles.payrollDot, { backgroundColor: '#94a3b8' }]} />
              <Text style={styles.payrollLabel}>Bon Tagihan Kantin Pabrik</Text>
            </View>
            <Text style={styles.payrollValFree}>Rp 0 (Lunas Cashless)</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.payrollTotalRow}>
            <View>
              <Text style={styles.payrollTotalLabel}>Total Potongan Slip Gaji</Text>
              <View style={styles.shieldRow}>
                <AppIcon name="lock" size={10} color="#16a34a" />
                <Text style={styles.shieldSubText}>Auto-Debet Bebas Biaya Admin</Text>
              </View>
            </View>
            <Animated.Text
              style={[
                styles.payrollTotalVal,
                { opacity: fadeAnim },
              ]}
            >
              Rp {hideBalance ? '••••••••' : formatRupiah(mockWallet.estimasiPotongGajiBulanIni)}
            </Animated.Text>
          </View>
        </View>
      </View>

      {/* Form Pengajuan Pinjaman Modal */}
      <PinjamanModal
        visible={loanModalVisible}
        onClose={() => setLoanModalVisible(false)}
        maxPlafon={plafonPinjaman}
        onApplySuccess={(amt, tenor) => {
          if (onApplyLoan) {
            onApplyLoan(amt, tenor);
          }
        }}
      />

      {/* Detail Penjelasan Total Aset & Simpanan Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalCard}>
            {/* Modal Top Header */}
            <View style={styles.detailModalHeader}>
              <View>
                <Text style={styles.detailModalTitle}>Rincian Total Aset Keuangan</Text>
                <Text style={styles.detailModalSub}>Koperasi Karyawan PT Bakti Idola Tama</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.detailModalCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.detailModalScroll}>
              {/* Grand Total Banner */}
              <View style={styles.detailAsetBanner}>
                <Text style={styles.detailAsetBannerLabel}>TOTAL SALDO & SIMPANAN ANDA</Text>
                <Text style={styles.detailAsetBannerVal}>Rp {formatRupiah(totalAset)}</Text>
                <Text style={styles.detailAsetBannerSub}>
                  Akumulasi seluruh saldo likuid dan modal simpanan di koperasi
                </Text>
              </View>

              {/* Section 1: Saldo Likuid / Siap Pakai */}
              <View style={styles.detailSectionBox}>
                <View style={styles.detailSectionHeader}>
                  <View style={styles.detailSectionTitleWrap}>
                    <View style={[styles.detailSectionDot, { backgroundColor: '#0284c7' }]} />
                    <Text style={styles.detailSectionTitle}>1. Saldo Siap Pakai (Likuid)</Text>
                  </View>
                  <View style={styles.detailSectionBadgeBlue}>
                    <Text style={styles.detailSectionBadgeTextBlue}>Bisa Ditarik / Belanja</Text>
                  </View>
                </View>

                <View style={styles.detailItemRow}>
                  <View style={styles.detailItemLeft}>
                    <Text style={styles.detailItemName}>Moobi Saldo Koperasi</Text>
                    <Text style={styles.detailItemDesc}>
                      Dapat langsung digunakan untuk belanja Kantin Pabrik BIT, bayar Listrik/BPJS/PDAM/WiFi, beli Produk Elektronik, transfer bank/sesama anggota, atau ditarik tunai tanpa kartu di Kasir/ATM.
                    </Text>
                  </View>
                  <Text style={styles.detailItemValBlue}>Rp {formatRupiah(userBalance)}</Text>
                </View>
              </View>

              {/* Section 2: Buku Simpanan Anggota (SHU) */}
              <View style={styles.detailSectionBox}>
                <View style={styles.detailSectionHeader}>
                  <View style={styles.detailSectionTitleWrap}>
                    <View style={[styles.detailSectionDot, { backgroundColor: '#16a34a' }]} />
                    <Text style={styles.detailSectionTitle}>2. Buku Simpanan Anggota (SHU)</Text>
                  </View>
                  <View style={styles.detailSectionBadgeGreen}>
                    <Text style={styles.detailSectionBadgeTextGreen}>Aset Bagi Hasil</Text>
                  </View>
                </View>

                {/* Simpanan Pokok */}
                <View style={styles.detailItemRow}>
                  <View style={styles.detailItemLeft}>
                    <Text style={styles.detailItemName}>Simpanan Pokok</Text>
                    <Text style={styles.detailItemDesc}>
                      Setoran modal awal keanggotaan koperasi (dibayar 1x saat bergabung).
                    </Text>
                  </View>
                  <Text style={styles.detailItemVal}>Rp {formatRupiah(simpananPokok)}</Text>
                </View>

                <View style={styles.detailInnerDivider} />

                {/* Simpanan Wajib */}
                <View style={styles.detailItemRow}>
                  <View style={styles.detailItemLeft}>
                    <Text style={styles.detailItemName}>Simpanan Wajib Bulanan</Text>
                    <Text style={styles.detailItemDesc}>
                      Iuran wajib bulanan terpotong otomatis dari slip gaji (Rp 100.000/bln).
                    </Text>
                  </View>
                  <Text style={styles.detailItemVal}>Rp {formatRupiah(simpananWajib)}</Text>
                </View>

                <View style={styles.detailInnerDivider} />

                {/* Simpanan Sukarela */}
                <View style={styles.detailItemRow}>
                  <View style={styles.detailItemLeft}>
                    <Text style={styles.detailItemName}>Simpanan Sukarela</Text>
                    <Text style={styles.detailItemDesc}>
                      Tabungan sukarela fleksibel anggota dengan bagi hasil dividen kompetitif.
                    </Text>
                  </View>
                  <Text style={styles.detailItemVal}>Rp {formatRupiah(simpananSukarela)}</Text>
                </View>

                <View style={styles.detailSectionTotalRow}>
                  <Text style={styles.detailSectionTotalLabel}>Total Simpanan Modal SHU</Text>
                  <Text style={styles.detailSectionTotalVal}>Rp {formatRupiah(totalSimpanan)}</Text>
                </View>
              </View>

              {/* Bonus SHU Note */}
              <View style={styles.shuBenefitBox}>
                <AppIcon name="gift" size={16} color="#d97706" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.shuBenefitTitle}>Estimasi Pembagian SHU Tahunan</Text>
                  <Text style={styles.shuBenefitDesc}>
                    Semakin besar total simpanan dan keaktifan belanja di koperasi, semakin besar dividen SHU (Sisa Hasil Usaha) yang Anda terima di akhir tahun buku (Estimasi: Rp {formatRupiah(mockWallet.estimasiBagiHasilSHU)}).
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Dismiss Button */}
            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={() => setDetailModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.detailCloseBtnText}>Mengerti & Tutup Rincian</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 120, // Prevents bottom tab bar overlap
  },
  header: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  watermarkCircle2: {
    position: 'absolute',
    bottom: -40,
    left: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  liveSyncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#dbeafe',
    fontWeight: '500',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1462c4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#0c4896',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#bae6fd',
    fontWeight: '600',
  },
  iconActionBtn: {
    padding: 2,
    opacity: 0.9,
  },
  detailPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  detailPillText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  summaryAmount: {
    fontSize: 23,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: -0.4,
  },
  headerTopUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTopUpText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailModalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  detailModalSub: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  detailModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailModalScroll: {
    marginBottom: 12,
  },
  detailAsetBanner: {
    backgroundColor: '#1d72db',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  detailAsetBannerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dbeafe',
    letterSpacing: 0.5,
  },
  detailAsetBannerVal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 4,
    letterSpacing: -0.4,
  },
  detailAsetBannerSub: {
    fontSize: 10.5,
    color: '#eff6ff',
    textAlign: 'center',
    fontWeight: '500',
  },
  detailSectionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  detailSectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailSectionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  detailSectionTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  detailSectionBadgeBlue: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  detailSectionBadgeTextBlue: {
    fontSize: 9.5,
    color: '#1d72db',
    fontWeight: '600',
  },
  detailSectionBadgeGreen: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bbf7d0',
  },
  detailSectionBadgeTextGreen: {
    fontSize: 9.5,
    color: '#16a34a',
    fontWeight: '600',
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  detailItemLeft: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  detailItemDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
    fontWeight: '400',
  },
  detailItemVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  detailItemValBlue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d72db',
  },
  detailInnerDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 6,
  },
  detailSectionTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  detailSectionTotalLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  detailSectionTotalVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  shuBenefitBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 10,
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shuBenefitTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  shuBenefitDesc: {
    fontSize: 9.5,
    color: '#78350f',
    marginTop: 2,
    lineHeight: 13.5,
    fontWeight: '400',
  },
  detailCloseBtn: {
    backgroundColor: '#1d72db',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d72db',
  },
  shuBadgeContainer: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bbf7d0',
  },
  shuEstimateBadge: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803d',
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  simpananTotalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  simpananTotalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  simpananTotalValue: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1d72db',
    marginTop: 1,
  },
  shuPillBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  shuPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  meterWrapper: {
    marginBottom: 8,
  },
  segmentedBar: {
    height: 7,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    gap: 2,
  },
  segment: {
    height: '100%',
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.1,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
  amountCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemAmountGold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b45309',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  plafonPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#fde68a',
  },
  plafonPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#b45309',
  },
  activeLoanBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 13,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  activeLoanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
    gap: 4,
  },
  activePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16a34a',
  },
  activeStatusText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  activeLoanAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d72db',
  },
  loanProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  loanProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loanProgressBarFill: {
    width: '16.6%',
    height: '100%',
    backgroundColor: '#1d72db',
    borderRadius: 3,
  },
  loanProgressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
  },
  activeLoanSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  pinjamActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00aa13',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#00aa13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pinjamActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinjamActionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  pinjamActionArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payrollDateBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  payrollDateText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  payrollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  payrollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  payrollLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payrollDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  payrollLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  payrollVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  payrollValFree: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  payrollTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  payrollTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  shieldSubText: {
    fontSize: 9.5,
    color: '#16a34a',
    fontWeight: '600',
  },
  payrollTotalVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: -0.2,
  },
});

