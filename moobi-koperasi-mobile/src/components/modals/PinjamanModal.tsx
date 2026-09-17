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
} from 'react-native';
import { AppIcon } from '../common/AppIcon';

interface PinjamanModalProps {
  visible: boolean;
  onClose: () => void;
  maxPlafon?: number;
  onApplySuccess?: (amount: number, tenor: number) => void;
}

export const PinjamanModal: React.FC<PinjamanModalProps> = ({
  visible,
  onClose,
  maxPlafon = 25000000,
  onApplySuccess,
}) => {
  const [amountInput, setAmountInput] = useState<string>('5000000');
  const [selectedTenor, setSelectedTenor] = useState<number>(6);

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
      'Pengajuan Pinjaman Terkirim! 📝',
      `Nominal: Rp ${formatRupiah(parsedAmount)}\nTenor: ${selectedTenor} Bulan\nEstimasi Angsuran: Rp ${formatRupiah(
        monthlyTotal
      )} / bulan (Potong Gaji)\n\nPengajuan akan diverifikasi dan disetujui digital oleh HR & Pengurus Koperasi PT Bakti Idola Tama.`,
      [
        {
          text: 'Selesai',
          onPress: () => {
            if (onApplySuccess) {
              onApplySuccess(parsedAmount, selectedTenor);
            }
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
            <View>
              <Text style={styles.modalTitle}>Pengajuan Pinjaman Karyawan</Text>
              <Text style={styles.modalSub}>
                Persetujuan digital langsung oleh HR & Pengurus
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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
                placeholder="Contoh: 5000000"
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

            {/* Pilihan Tenor */}
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

            {/* Ringkasan Simulasi */}
            <View style={styles.simulasiCard}>
              <View style={styles.simulasiRow}>
                <Text style={styles.simulasiLabel}>Plafon Maksimal:</Text>
                <Text style={styles.simulasiVal}>Rp {formatRupiah(maxPlafon)}</Text>
              </View>
              <View style={styles.simulasiRow}>
                <Text style={styles.simulasiLabel}>Estimasi Potong Gaji/Bln:</Text>
                <Text style={styles.simulasiValGreen}>
                  Rp {formatRupiah(monthlyTotal)}
                </Text>
              </View>
              <Text style={styles.simulasiNotice}>
                ✓ Tanpa Biaya Admin Awal • Bunga Koperasi 0.8% Ringan
              </Text>
            </View>

            {/* Tombol Ajukan */}
            <TouchableOpacity
              style={styles.submitLoanBtn}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              <Text style={styles.submitLoanBtnText}>
                Ajukan Pinjaman Sekarang
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d72db',
    marginRight: 6,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
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
    marginBottom: 10,
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
    marginVertical: 8,
  },
  tenorBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  tenorBtnActive: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  tenorBtnText: {
    fontSize: 12,
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
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  simulasiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  simulasiLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  simulasiVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  simulasiValGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  simulasiNotice: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 4,
  },
  submitLoanBtn: {
    backgroundColor: '#00aa13',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#00aa13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitLoanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
