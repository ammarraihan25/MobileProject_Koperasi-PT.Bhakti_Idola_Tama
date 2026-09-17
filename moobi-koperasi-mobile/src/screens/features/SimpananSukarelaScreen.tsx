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
import { TransactionItem } from '../../types';

interface SimpananSukarelaScreenProps {
  onBack: () => void;
  userBalance?: number;
  transactions?: TransactionItem[];
  onNavigateScreen?: (screen: any) => void;
}

export const SimpananSukarelaScreen: React.FC<SimpananSukarelaScreenProps> = ({
  onBack,
  userBalance = mockWallet.simpananSukarela,
  transactions = [],
  onNavigateScreen,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const sukarelaTxList = transactions.length > 0 ? transactions.slice(0, 8) : [
    {
      id: 'tx-1',
      title: 'Top Up Simpanan Sukarela (BCA Virtual Account)',
      amount: 500000,
      isCredit: true,
      timestamp: '16 Sep 2026, 14:30 WIB',
      statusText: 'Berhasil',
      referenceNo: 'BIT-TOPUP-9921',
    },
    {
      id: 'tx-2',
      title: 'Makan Siang Kantin BIT (Nasi Goreng + Es Teh)',
      amount: 22000,
      isCredit: false,
      timestamp: '16 Sep 2026, 12:15 WIB',
      statusText: 'Berhasil',
      referenceNo: 'BIT-KANTIN-8120',
    },
    {
      id: 'tx-3',
      title: 'Pembelian Token PLN 50.000',
      amount: 51500,
      isCredit: false,
      timestamp: '15 Sep 2026, 09:10 WIB',
      statusText: 'Berhasil',
      referenceNo: 'BIT-PLN-3341',
    },
    {
      id: 'tx-4',
      title: 'Top Up E-Money GoPay 100.000',
      amount: 101000,
      isCredit: false,
      timestamp: '14 Sep 2026, 18:45 WIB',
      statusText: 'Berhasil',
      referenceNo: 'BIT-EMONEY-1120',
    },
    {
      id: 'tx-5',
      title: 'Setor Tunai Loket Koperasi PT BIT',
      amount: 300000,
      isCredit: true,
      timestamp: '10 Sep 2026, 10:00 WIB',
      statusText: 'Berhasil',
      referenceNo: 'BIT-CASH-7712',
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
          <Text style={styles.topNavSub}>Saldo Transaksi Harian • PT Bakti Idola Tama</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Informasi Simpanan Sukarela',
              'Simpanan Sukarela adalah saldo simpanan fleksibel anggota koperasi yang dapat ditambah (setor/top-up), ditarik tunai, maupun digunakan langsung untuk transaksi kantin, belanja elektronik, dan pembayaran PPoB.'
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
        {/* 2. MAIN BALANCE CARD */}
        <View style={styles.mainBalanceCard}>
          <View style={styles.balanceCardTop}>
            <View style={styles.balanceIconWrap}>
              <AppIcon name="wallet" size={20} color="#1d72db" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceCardLabel}>Saldo Aktif Simpanan Sukarela</Text>
              <Text style={styles.balanceCardSub}>{mockUser.name} • {mockUser.jabatan}</Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Aktif Digunakan</Text>
            </View>
          </View>

          <Text style={styles.balanceAmountText}>Rp {formatRupiah(userBalance)}</Text>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() =>
                Alert.alert(
                  'Setor Simpanan (Top Up)',
                  'Metode Setor Simpanan Sukarela:\n\n1. Virtual Account BCA / Mandiri / BRI (Otomatis masuk)\n2. Setor Tunai langsung di Kasir Koperasi PT BIT\n3. Pemotongan payroll tambahan via HRD.'
                )
              }
              activeOpacity={0.85}
            >
              <AppIcon name="topup" size={14} color="#ffffff" />
              <Text style={styles.actionBtnPrimaryText}>+ Setor / Top Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() =>
                Alert.alert(
                  'Tarik / Cashout Saldo',
                  `Saldo Simpanan Sukarela tersedia Rp ${formatRupiah(userBalance)}.\n\nPencairan saldo akan ditransfer langsung ke rekening payroll (${mockUser.name}) dalam 1x24 jam hari kerja tanpa potongan biaya admin.`
                )
              }
              activeOpacity={0.85}
            >
              <AppIcon name="withdraw" size={14} color="#1d72db" />
              <Text style={styles.actionBtnSecondaryText}>Tarik / Cashout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. CARD PENGGUNAAN & FITUR TERINTEGRASI */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconCircle}>
              <AppIcon name="zap" size={14} color="#1d72db" />
            </View>
            <Text style={styles.sectionHeading}>Dapat Digunakan Untuk Transaksi</Text>
          </View>

          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#dcfce7' }]}>
                <AppIcon name="food" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Kantin Karyawan PT BIT</Text>
                <Text style={styles.featureDesc}>Bayar makan & minum tanpa antre cash</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#eff6ff' }]}>
                <AppIcon name="elektronik" size={16} color="#1d72db" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Produk Elektronik BIT</Text>
                <Text style={styles.featureDesc}>Belanja produk Miyako, Rinnai, & Shimizu</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#fff7ed' }]}>
                <AppIcon name="zap" size={16} color="#ea580c" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Tagihan & PPoB</Text>
                <Text style={styles.featureDesc}>Token PLN, PDAM, BPJS, & Pulsa</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <AppIcon name="topup" size={16} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Top Up Dompet Digital</Text>
                <Text style={styles.featureDesc}>GoPay, DANA, OVO, ShopeePay, Flazz, e-Money</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. CARD KEUNTUNGAN SIMPANAN SUKARELA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#ecfdf5' }]}>
              <AppIcon name="check-circle" size={14} color="#059669" />
            </View>
            <Text style={styles.sectionHeading}>Keuntungan Simpanan Sukarela</Text>
          </View>

          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <AppIcon name="check" size={13} color="#16a34a" />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Bebas Biaya Admin:</Text> Tidak ada potongan biaya bulanan pemeliharaan rekening.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <AppIcon name="check" size={13} color="#16a34a" />
              <Text style={styles.ruleText}>
                <Text style={styles.boldDark}>Fleksibel 24/7:</Text> Saldo dapat disetor atau ditarik kapan saja sesuai kebutuhan anggota.
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
                    name={item.isCredit ? 'topup' : 'receipt'}
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
    marginBottom: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1d72db',
    paddingVertical: 9,
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
    paddingVertical: 9,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
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
});
