import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppIcon } from '../components/common/AppIcon';
import { mockWallet, mockUser } from '../data/mockData';

interface KeuanganScreenProps {
  userBalance?: number;
  userCoins?: number;
  plafonPinjaman?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  simpananWajib?: number;
  simpananSukarela?: number;
  onNavigateScreen?: (screen: any) => void;
}

export const KeuanganScreen: React.FC<KeuanganScreenProps> = ({
  userBalance = mockWallet.simpananSukarela,
  pinjamanAktif = mockWallet.pinjamanAktif,
  angsuranPerBulan = mockWallet.angsuranPerBulan,
  sisaTenorBulan = mockWallet.sisaTenorBulan,
  simpananWajib = mockWallet.simpananWajib,
  onNavigateScreen,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const effectiveSukarela = userBalance;
  // HANYA 2 JENIS SIMPANAN: Wajib + Sukarela
  const totalSimpanan = simpananWajib + effectiveSukarela;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HEADER UTAMA (THEME ROYAL BLUE CLEAN) */}
      <View style={styles.header}>
        {/* Background Watermark Geometric Accents */}
        <View style={styles.watermarkCircle1} pointerEvents="none" />
        <View style={styles.watermarkCircle2} pointerEvents="none" />

        <View style={styles.headerTopBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerCompanyTitle}>PT. BAKTI IDOLA TAMA</Text>
            <Text style={styles.headerTitle}>Keuangan & Simpan Pinjam</Text>
          </View>
          <TouchableOpacity
            style={styles.headerInfoBtn}
            onPress={() =>
              Alert.alert(
                'Layanan Keuangan Koperasi',
                'Halaman ini menyajikan rincian lengkap 2 jenis simpanan (Wajib & Sukarela), angsuran pinjaman berjalan, serta estimasi perolehan SHU tahunan anggota PT BIT.'
              )
            }
            activeOpacity={0.8}
          >
            <AppIcon name="info" size={17} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* 2. KARTU ANGSURAN PINJAMAN BERJALAN (TERINTEGRASI ANGSURAN) */}
        {pinjamanAktif > 0 ? (
          <View style={styles.installmentCard}>
            <View style={styles.installmentHeaderRow}>
              <View style={styles.installmentIconWrap}>
                <AppIcon name="receipt" size={15} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.installmentCardTitle}>Angsuran Pinjaman Berjalan</Text>
                <Text style={styles.installmentCardSub}>Auto-debit Slip Gaji Tanggal 25</Text>
              </View>
              <View style={styles.installmentActiveBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.installmentActiveBadgeText}>Aktif Dicicil</Text>
              </View>
            </View>

            <View style={styles.installmentMainRow}>
              <View>
                <Text style={styles.installmentAmountLabel}>Sisa Pokok Pinjaman:</Text>
                <Text style={styles.installmentAmountVal}>Rp {formatRupiah(pinjamanAktif)}</Text>
              </View>
              <TouchableOpacity
                style={styles.payInstallmentBtn}
                onPress={() => onNavigateScreen?.('pinjaman')}
                activeOpacity={0.85}
              >
                <Text style={styles.payInstallmentBtnText}>Bayar / Lunasi ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.installmentDetailGrid}>
              <View style={styles.installmentDetailItem}>
                <Text style={styles.installmentDetailLabel}>Cicilan Bulanan</Text>
                <Text style={styles.installmentDetailVal}>Rp {formatRupiah(angsuranPerBulan)} / bln</Text>
              </View>
              <View style={styles.installmentDetailDivider} />
              <View style={styles.installmentDetailItem}>
                <Text style={styles.installmentDetailLabel}>Sisa Tenor</Text>
                <Text style={styles.installmentDetailVal}>{sisaTenorBulan} Bulan</Text>
              </View>
              <View style={styles.installmentDetailDivider} />
              <View style={styles.installmentDetailItem}>
                <Text style={styles.installmentDetailLabel}>Jatuh Tempo</Text>
                <Text style={styles.installmentDetailVal}>25 Sep 2026</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDebtCard}>
            <View style={styles.noDebtLeft}>
              <View style={styles.noDebtIconWrap}>
                <AppIcon name="check-circle" size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noDebtTitle}>Tidak Ada Angsuran Aktif</Text>
                <Text style={styles.noDebtSub}>Kewajiban pinjaman Anda saat ini telah lunas</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.applyLoanBtn}
              onPress={() => onNavigateScreen?.('pinjaman')}
              activeOpacity={0.85}
            >
              <Text style={styles.applyLoanBtnText}>Ajukan Pinjaman ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. KARTU TOTAL AKUMULASI SIMPANAN (HANYA 2 SIMPANAN: WAJIB & SUKARELA) */}
        <View style={styles.totalSavingCard}>
          <View style={styles.totalSavingHeader}>
            <View style={styles.totalSavingIconCircle}>
              <AppIcon name="simpanan" size={16} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalSavingLabel}>Total Akumulasi Simpanan</Text>
              <Text style={styles.totalSavingSub}>Simpanan Wajib & Simpanan Sukarela</Text>
            </View>
            <View style={styles.savingTypeBadge}>
              <Text style={styles.savingTypeBadgeText}>2 Jenis Simpanan</Text>
            </View>
          </View>

          <Text style={styles.totalSavingAmount}>
            Rp {formatRupiah(totalSimpanan)}
          </Text>
        </View>

        {/* 4. DUA GRID SIMPANAN BERDAMPINGAN (GRID 1: WAJIB & GRID 2: SUKARELA) */}
        <View style={styles.grid2ColRow}>
          {/* GRID 1: SIMPANAN WAJIB */}
          <TouchableOpacity
            style={styles.gridCardWajib}
            onPress={() => onNavigateScreen?.('simpanan_wajib')}
            activeOpacity={0.85}
          >
            <View style={styles.gridCardTop}>
              <View style={styles.savingIconCircleOrange}>
                <AppIcon name="lock" size={14} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.gridCardTitleWajib}>Simpanan Wajib</Text>
            <Text style={styles.gridCardSubWajib}>Auto-debit Slip Gaji</Text>

            <Text style={styles.gridAmountWajib}>
              Rp {formatRupiah(simpananWajib)}
            </Text>

            <View style={styles.gridFooterRow}>
              <Text style={styles.gridFooterTextWajib}>Rp 100rb/bln</Text>
              <View style={styles.gridDetailPillWajib}>
                <Text style={styles.gridDetailPillTextWajib}>Detail ›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* GRID 2: SIMPANAN SUKARELA */}
          <TouchableOpacity
            style={styles.gridCardSukarela}
            onPress={() => onNavigateScreen?.('simpanan_sukarela')}
            activeOpacity={0.85}
          >
            <View style={styles.gridCardTop}>
              <View style={styles.savingIconCircleBlue}>
                <AppIcon name="wallet" size={14} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.gridCardTitleSukarela}>Simpanan Sukarela</Text>
            <Text style={styles.gridCardSubSukarela}>Khusus Penarikan Dana</Text>

            <Text style={styles.gridAmountSukarela}>
              Rp {formatRupiah(effectiveSukarela)}
            </Text>

            <View style={styles.gridFooterRow}>
              <Text style={styles.gridFooterTextSukarela}>Payroll Bulanan</Text>
              <View style={styles.gridDetailPillSukarela}>
                <Text style={styles.gridDetailPillTextSukarela}>Detail ›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. KARTU ESTIMASI BAGI HASIL SHU TAHUNAN */}
        <View style={styles.shuCard}>
          <View style={styles.shuIconCircle}>
            <AppIcon name="gift" size={16} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shuLabel}>Estimasi Bagi Hasil SHU Anggota</Text>
            <Text style={styles.shuValGreen}>Rp {formatRupiah(mockWallet.estimasiBagiHasilSHU)}</Text>
            <Text style={styles.shuSub}>Dibagikan saat Rapat Anggota Tahunan (RAT) Koperasi</Text>
          </View>
        </View>

        {/* 6. KETENTUAN & KEBIJAKAN KEUANGAN KOPERASI */}
        <View style={styles.infoSummaryCard}>
          <View style={styles.infoSummaryHeader}>
            <Text style={styles.infoSummaryHeading}>Ketentuan Keuangan Anggota PT BIT</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoItemText}>
                <Text style={styles.boldDark}>Simpanan Wajib</Text> dipotong otomatis Rp 100.000 / bulan dari slip gaji setiap tgl 25 dan terkunci minimal 1 tahun masa kerja.
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoItemText}>
                <Text style={styles.boldDark}>Simpanan Sukarela</Text> tabungan fleksibel anggota yang hanya dapat disetor & ditarik dana ke rekening payroll (bukan untuk pembayaran belanja).
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoItemText}>
                <Text style={styles.boldDark}>Angsuran Pinjaman</Text> dipotong otomatis dari slip gaji bulanan dengan bunga ringan 0.8% flat koperasi.
              </Text>
            </View>
          </View>
        </View>
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
    paddingBottom: 90,
  },

  /* 1. Header Styles (Royal Blue Theme Aligned with Beranda) */
  header: {
    backgroundColor: '#1d72db',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  watermarkCircle2: {
    position: 'absolute',
    top: 35,
    left: -40,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCompanyTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#bae6fd',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  headerInfoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* Body Content Container */
  bodyContent: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 12,
  },

  /* 2. Installment Card (Angsuran Pinjaman Berjalan) */
  installmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  installmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  installmentIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  installmentCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  installmentCardSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  installmentActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1d72db',
  },
  installmentActiveBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  installmentMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  installmentAmountLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  installmentAmountVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 1,
    letterSpacing: -0.3,
  },
  payInstallmentBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  payInstallmentBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  installmentDetailGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  installmentDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  installmentDetailDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  installmentDetailLabel: {
    fontSize: 8.5,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  installmentDetailVal: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1e293b',
  },

  /* No Debt Card */
  noDebtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  noDebtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  noDebtIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  noDebtTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803d',
  },
  noDebtSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  applyLoanBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyLoanBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* 3. Total Saving Card */
  totalSavingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  totalSavingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  totalSavingIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  totalSavingLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalSavingSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  savingTypeBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: '#bfdbfe',
  },
  savingTypeBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  totalSavingAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1d72db',
    letterSpacing: -0.3,
  },

  /* 4. 2-Column Grid Row */
  grid2ColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCardWajib: {
    flex: 1,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#fde68a',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardSukarela: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingIconCircleOrange: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  savingIconCircleBlue: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  gridCardTitleWajib: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400e',
  },
  gridCardTitleSukarela: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1e40af',
  },
  gridCardSubWajib: {
    fontSize: 9,
    color: '#b45309',
    marginTop: 1,
    marginBottom: 6,
    fontWeight: '600',
  },
  gridCardSubSukarela: {
    fontSize: 9,
    color: '#3b82f6',
    marginTop: 1,
    marginBottom: 6,
    fontWeight: '600',
  },
  gridAmountWajib: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#92400e',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  gridAmountSukarela: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#1d72db',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  gridFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  gridFooterTextWajib: {
    fontSize: 8.5,
    color: '#92400e',
    fontWeight: '700',
  },
  gridFooterTextSukarela: {
    fontSize: 8.5,
    color: '#1e40af',
    fontWeight: '700',
  },
  gridDetailPillWajib: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.7,
    borderColor: '#fcd34d',
  },
  gridDetailPillTextWajib: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#92400e',
  },
  gridDetailPillSukarela: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.7,
    borderColor: '#93c5fd',
  },
  gridDetailPillTextSukarela: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#1d72db',
  },

  /* 5. SHU Card */
  shuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  shuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  shuLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  shuValGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16a34a',
    marginTop: 1,
  },
  shuSub: {
    fontSize: 8.5,
    color: '#94a3b8',
    marginTop: 1,
  },

  /* 6. Info Summary Card */
  infoSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoSummaryIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoSummaryHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoList: {
    gap: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1d72db',
    marginTop: 5,
  },
  infoItemText: {
    flex: 1,
    fontSize: 9.5,
    color: '#475569',
    lineHeight: 14,
  },
  boldDark: {
    fontWeight: '700',
    color: '#0f172a',
  },
});
