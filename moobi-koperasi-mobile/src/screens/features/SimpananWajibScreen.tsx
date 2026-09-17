import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';
import { mockWallet, mockUser } from '../../data/mockData';

interface SimpananWajibScreenProps {
  onBack: () => void;
  simpananWajib?: number;
}

export const SimpananWajibScreen: React.FC<SimpananWajibScreenProps> = ({
  onBack,
  simpananWajib = mockWallet.simpananWajib,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const masaKerjaText = `${Math.floor(mockUser.masaKerjaBulan / 12)} Tahun ${mockUser.masaKerjaBulan % 12} Bulan`;

  const payrollHistory = [
    { month: 'September 2026', date: '25 Sep 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202609-001' },
    { month: 'Agustus 2026', date: '25 Agu 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202608-001' },
    { month: 'Juli 2026', date: '25 Jul 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202607-001' },
    { month: 'Juni 2026', date: '25 Jun 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202606-001' },
    { month: 'Mei 2026', date: '25 Mei 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202605-001' },
    { month: 'April 2026', date: '25 Apr 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202604-001' },
    { month: 'Maret 2026', date: '25 Mar 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202603-001' },
    { month: 'Februari 2026', date: '25 Feb 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202602-001' },
    { month: 'Januari 2026', date: '25 Jan 2026', amount: 100000, status: 'Terpotong Payroll', ref: 'PAY-202601-001' },
  ];

  return (
    <View style={styles.screenContainer}>
      {/* 1. TOP NAVIGATION BAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <AppIcon name="chevron-left" size={19} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>Detail Simpanan Wajib</Text>
          <Text style={styles.topNavSub}>Auto-debit Slip Gaji • PT Bakti Idola Tama</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Informasi Simpanan Wajib',
              'Simpanan Wajib adalah simpanan rutin yang dipotong otomatis dari slip gaji karyawan setiap bulan sebesar Rp 100.000 sesuai AD/ART Koperasi PT Bakti Idola Tama.'
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
        {/* 2. CARD UTAMA TOTAL SALDO SIMPANAN WAJIB */}
        <View style={styles.mainBalanceCard}>
          <View style={styles.balanceCardTop}>
            <View style={styles.balanceIconWrap}>
              <AppIcon name="lock" size={20} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceCardLabel}>Total Akumulasi Simpanan Wajib</Text>
              <Text style={styles.balanceCardSub}>Koperasi Karyawan PT BIT</Text>
            </View>
            <View style={styles.lockBadge}>
              <AppIcon name="lock" size={10} color="#92400e" />
              <Text style={styles.lockBadgeText}>Terkunci 1 Thn</Text>
            </View>
          </View>

          <Text style={styles.balanceAmountText}>Rp {formatRupiah(simpananWajib)}</Text>

          <View style={styles.tenureNoticeRow}>
            <AppIcon name="check" size={13} color="#16a34a" />
            <Text style={styles.tenureNoticeText}>
              Masa Kerja: <Text style={styles.boldText}>{masaKerjaText}</Text> (✓ Memenuhi syarat kepesertaan)
            </Text>
          </View>
        </View>

        {/* 3. CARD RINCIAN PEMOTONGAN OTOMATIS SLIP GAJI */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconCircle}>
              <AppIcon name="receipt" size={14} color="#1d72db" />
            </View>
            <Text style={styles.sectionHeading}>Rincian Pemotongan Otomatis Gaji</Text>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nominal Potongan per Bulan</Text>
              <Text style={styles.detailValBold}>Rp 100.000 / bulan</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jadwal Pemotongan</Text>
              <Text style={styles.detailVal}>Setiap tanggal 25 (Payroll PT BIT)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Metode Transaksi</Text>
              <Text style={styles.detailVal}>Auto-debit Slip Gaji Karyawan</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nama Anggota</Text>
              <Text style={styles.detailVal}>{mockUser.name} ({mockUser.nik})</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Departemen / Unit</Text>
              <Text style={styles.detailVal}>{mockUser.department}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status Kepesertaan</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Aktif Rutin</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. CARD KETENTUAN DAN HAK ANGGOTA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#fef3c7' }]}>
              <AppIcon name="lock" size={14} color="#d97706" />
            </View>
            <Text style={styles.sectionHeading}>Ketentuan & Kebijakan Simpanan Wajib</Text>
          </View>

          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Terkunci Selama Menjadi Karyawan:</Text> Simpanan wajib tidak dapat ditarik sewaktu-waktu guna menjaga stabilitas permodalan koperasi.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Pencairan 100% Saat Resign/Pensiun:</Text> Seluruh akumulasi simpanan wajib beserta SHU akan dikembalikan penuh saat masa tugas berakhir.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Perhitungan Bagi Hasil SHU:</Text> Semakin besar akumulasi simpanan wajib, semakin tinggi porsi pembagian Sisa Hasil Usaha tahunan.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. DAFTAR RIWAYAT PEMOTONGAN GAJI */}
        <Text style={styles.historySectionTitle}>Riwayat Pemotongan Payroll (2026)</Text>
        <View style={styles.historyCard}>
          {payrollHistory.map((item, index) => (
            <View
              key={item.ref}
              style={[
                styles.historyItemRow,
                index === payrollHistory.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.historyItemLeft}>
                <View style={styles.historyIconBox}>
                  <AppIcon name="check" size={13} color="#16a34a" />
                </View>
                <View>
                  <Text style={styles.historyItemMonth}>Iuran Wajib {item.month}</Text>
                  <Text style={styles.historyItemDate}>{item.date} • {item.ref}</Text>
                </View>
              </View>

              <View style={styles.historyItemRight}>
                <Text style={styles.historyItemAmount}>+Rp {formatRupiah(item.amount)}</Text>
                <Text style={styles.historyItemStatus}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
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
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#fde68a',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#d97706',
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
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400e',
  },
  balanceCardSub: {
    fontSize: 9.5,
    color: '#b45309',
    marginTop: 1,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  lockBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400e',
  },
  balanceAmountText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#b45309',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  tenureNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  tenureNoticeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '800',
    color: '#1e293b',
  },

  /* Section Cards */
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
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  detailBox: {
    gap: 9,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 10.5,
    color: '#1e293b',
    fontWeight: '600',
  },
  detailValBold: {
    fontSize: 11.5,
    color: '#1d72db',
    fontWeight: '800',
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: '#86efac',
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },

  /* Rules List */
  rulesList: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#d97706',
    marginTop: 6,
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

  /* History Section */
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
  },
  historyIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyItemDate: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemAmount: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16a34a',
  },
  historyItemStatus: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
});
