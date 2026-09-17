import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';
import { mockWallet } from '../../data/mockData';

interface PinjamanScreenProps {
  onBack: () => void;
  maxPlafon?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  onApplySuccess?: (amount: number, tenor: number) => void;
}

export const PinjamanScreen: React.FC<PinjamanScreenProps> = ({
  onBack,
  maxPlafon = mockWallet.plafonPinjaman,
  pinjamanAktif = mockWallet.pinjamanAktif,
  angsuranPerBulan = mockWallet.angsuranPerBulan,
  sisaTenorBulan = mockWallet.sisaTenorBulan,
  onApplySuccess,
}) => {
  const [amountInput, setAmountInput] = useState<string>('5000000');
  const [selectedTenor, setSelectedTenor] = useState<number>(6);
  const [showApplyForm, setShowApplyForm] = useState<boolean>(true);

  const presetAmounts = [2000000, 5000000, 10000000];
  const tenorOptions = [3, 6, 12];
  const interestRate = 0.008; // 0.8% per bulan flat

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const parsedAmount = Math.min(
    maxPlafon,
    Math.max(0, parseInt(amountInput.replace(/[^0-9]/g, ''), 10) || 0)
  );

  const monthlyPrincipal = Math.round(parsedAmount / selectedTenor);
  const monthlyInterest = Math.round(parsedAmount * interestRate);
  const monthlyTotal = monthlyPrincipal + monthlyInterest;

  const handleApply = () => {
    if (parsedAmount < 500000) {
      Alert.alert('Nominal Tidak Valid', 'Minimal pengajuan pinjaman adalah Rp 500.000.');
      return;
    }

    Alert.alert(
      'Konfirmasi Pengajuan Pinjaman 📝',
      `Nominal: Rp ${formatRupiah(parsedAmount)}\nTenor: ${selectedTenor} Bulan\nEstimasi Angsuran: Rp ${formatRupiah(
        monthlyTotal
      )} / bulan (Potong Gaji)\n\nPengajuan akan diverifikasi dan disetujui digital oleh HR & Pengurus Koperasi PT Bakti Idola Tama.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ajukan Sekarang',
          onPress: () => {
            if (onApplySuccess) {
              onApplySuccess(parsedAmount, selectedTenor);
            }
            Alert.alert(
              'Pengajuan Berhasil Dikirim! ✅',
              `Nomor Tiket: LOAN-BIT-${Date.now().toString().slice(-6)}\n\nPencairan dana akan ditransfer ke rekening gaji setelah verifikasi 1-click HRD (Estimasi 1x24 jam).`,
              [
                {
                  text: 'Kembali ke Beranda',
                  onPress: onBack,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleBpkbAction = () => {
    Alert.alert(
      'Pembiayaan Jaminan BPKB',
      'Layanan pembiayaan jaminan BPKB motor/mobil khusus karyawan tetap PT Bakti Idola Tama dengan bunga kompetitif koperasi.\n\nSilakan hubungi admin pengurus koperasi.'
    );
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Header Navigation */}
      <View style={styles.topNavBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevron-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>Pinjaman Karyawan</Text>
          <Text style={styles.topNavSub}>PT Bakti Idola Tama • Auto-Payroll</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Section 1: Card Status Pinjaman Sesuai Gambar 2 */}
        <View style={styles.cardGroup}>
          {/* Active Loan Box */}
          <View style={styles.activeLoanBox}>
            <View style={styles.activeLoanTopRow}>
              <View style={styles.activeStatusPill}>
                <View style={styles.activePulseDot} />
                <Text style={styles.activeStatusText}>Cicilan Berjalan</Text>
              </View>
              <Text style={styles.activeLoanAmount}>
                Rp {formatRupiah(pinjamanAktif)}
              </Text>
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
            onPress={() => setShowApplyForm(true)}
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

          {/* Additional Financing: Pembiayaan Jaminan BPKB */}
          <TouchableOpacity
            style={styles.cardItem}
            onPress={handleBpkbAction}
            activeOpacity={0.7}
          >
            <View style={styles.itemIconBox}>
              <AppIcon name="paylater" size={20} color="#1d72db" />
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

        {/* Section 2: Formulir Pengajuan Pinjaman yang Disederhanakan */}
        {showApplyForm && (
          <View style={styles.formContainer}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formSectionTitle}>Form Pengajuan Pinjaman</Text>
              <View style={styles.plafonPill}>
                <Text style={styles.plafonPillText}>
                  Plafon Rp {formatRupiah(maxPlafon)}
                </Text>
              </View>
            </View>

            {/* Input Nominal */}
            <Text style={styles.inputLabel}>Jumlah Pinjaman (Rp)</Text>
            <View style={styles.inputBoxRow}>
              <Text style={styles.inputPrefix}>Rp</Text>
              <TextInput
                style={styles.textInputField}
                value={amountInput ? formatRupiah(parsedAmount) : ''}
                onChangeText={(t) => {
                  const num = t.replace(/[^0-9]/g, '');
                  setAmountInput(num);
                }}
                keyboardType="numeric"
                placeholder="Contoh: 5.000.000"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={styles.maxBtn}
                onPress={() => setAmountInput(maxPlafon.toString())}
                activeOpacity={0.7}
              >
                <Text style={styles.maxBtnText}>Maksimal</Text>
              </TouchableOpacity>
            </View>

            {/* 3 Preset Nominal Cepat */}
            <View style={styles.amountPresetsGrid}>
              {presetAmounts.map((amt) => {
                const isSelected = parsedAmount === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.amtBtn, isSelected && styles.amtBtnActive]}
                    onPress={() => setAmountInput(amt.toString())}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.amtBtnText, isSelected && styles.amtBtnTextActive]}>
                      Rp {formatRupiah(amt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pilihan Tenor (3 Opsi Sederhana) */}
            <Text style={styles.inputLabel}>Pilih Tenor Pembayaran (Potong Gaji)</Text>
            <View style={styles.tenorRow}>
              {tenorOptions.map((m) => {
                const isSelected = selectedTenor === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.tenorBtn, isSelected && styles.tenorBtnActive]}
                    onPress={() => setSelectedTenor(m)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tenorBtnText,
                        isSelected && styles.tenorBtnTextActive,
                      ]}
                    >
                      {m} Bulan
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ringkasan Simulasi Bersih & Ringkas */}
            <View style={styles.simulasiCard}>
              <View style={styles.simulasiRow}>
                <Text style={styles.simulasiLabel}>Estimasi Potong Gaji/Bln:</Text>
                <Text style={styles.simulasiValGreen}>
                  Rp {formatRupiah(monthlyTotal)}
                </Text>
              </View>
              <View style={styles.simulasiRow}>
                <Text style={styles.simulasiLabel}>Bunga Koperasi Ringan:</Text>
                <Text style={styles.simulasiValDark}>0.8% / bulan (Flat)</Text>
              </View>
              <Text style={styles.simulasiNotice}>
                ✓ Tanpa Biaya Admin Awal • Auto-Debit Slip Gaji Karyawan
              </Text>
            </View>

            {/* Tombol Ajukan Sekarang */}
            <TouchableOpacity
              style={styles.submitLoanBtn}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Text style={styles.submitLoanBtnText}>
                Ajukan Pinjaman Sekarang
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCenter: {
    alignItems: 'center',
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  topNavSub: {
    color: '#dbeafe',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  activeLoanBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  activeLoanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
    gap: 5,
  },
  activePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  activeStatusText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#16a34a',
  },
  activeLoanAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: -0.2,
  },
  loanProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
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
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  activeLoanSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  pinjamActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00aa13',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#00aa13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pinjamActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinjamActionPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  pinjamActionArrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1d72db',
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
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formSectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  plafonPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  plafonPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 46,
    marginBottom: 8,
  },
  inputPrefix: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1d72db',
    marginRight: 6,
  },
  textInputField: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  maxBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  maxBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
  },
  amountPresetsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  amtBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  amtBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  amtBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  amtBtnTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  tenorRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
    marginBottom: 12,
  },
  tenorBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  tenorBtnActive: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  tenorBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  tenorBtnTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  simulasiCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  simulasiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  simulasiLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  simulasiValGreen: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  simulasiValDark: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  simulasiNotice: {
    fontSize: 10.5,
    color: '#0284c7',
    fontWeight: '500',
    marginTop: 4,
  },
  submitLoanBtn: {
    backgroundColor: '#00aa13',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00aa13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitLoanBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
