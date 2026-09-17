import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface PlafonPinjamanCardProps {
  plafonPinjaman?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  onPress?: () => void;
  onApplyPress?: () => void;
}

export const PlafonPinjamanCard: React.FC<PlafonPinjamanCardProps> = ({
  plafonPinjaman = 25000000,
  pinjamanAktif = 2500000,
  angsuranPerBulan = 250000,
  sisaTenorBulan = 10,
  onPress,
  onApplyPress,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.plafonCard}
        onPress={onPress || onApplyPress}
        activeOpacity={0.92}
      >
        {/* Background Geometric Accent Waves */}
        <View style={styles.bgAccentCircle1} pointerEvents="none" />
        <View style={styles.bgAccentCircle2} pointerEvents="none" />
        <View style={styles.bgGlossHighlight} pointerEvents="none" />

        {/* Top Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleCol}>
            <Text style={styles.titleLabel}>Plafon Pinjaman Karyawan</Text>
            <Text style={styles.formulaSub}>
              Dasar: 30% × Gaji × 12 Bulan • Bunga 0.8% Flat
            </Text>
          </View>
        </View>

        {/* Amount & CTA Button */}
        <View style={styles.amountRow}>
          <View style={styles.amountLeft}>
            <Text style={styles.currency}>Rp</Text>
            <Text style={styles.amountValue}>
              {formatRupiah(plafonPinjaman)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={onApplyPress || onPress}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>Ajukan Pinjaman ›</Text>
          </TouchableOpacity>
        </View>

        {/* Active Debt / Installment Status Bar */}
        {pinjamanAktif > 0 ? (
          <View style={styles.activeDebtBar}>
            <View style={styles.activeDebtLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.activeDebtText} numberOfLines={1}>
                Cicilan Aktif: <Text style={styles.boldAmount}>Rp {formatRupiah(pinjamanAktif)}</Text>{' '}
                <Text style={styles.tenorSub}>({sisaTenorBulan}x @ Rp {formatRupiah(angsuranPerBulan)}/bln)</Text>
              </Text>
            </View>
            <View style={styles.autoPayrollPill}>
              <Text style={styles.autoPayrollText}>Auto-Payroll</Text>
            </View>
          </View>
        ) : (
          <View style={styles.cleanDebtBar}>
            <View style={styles.cleanStatusDot} />
            <Text style={styles.cleanDebtText}>
              Bebas pinjaman aktif • Limit siap digunakan
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  plafonCard: {
    backgroundColor: '#1d72db',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  /* Subtle Card Watermark/Geometric Accents */
  bgAccentCircle1: {
    position: 'absolute',
    top: -45,
    right: -35,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bgAccentCircle2: {
    position: 'absolute',
    top: -20,
    right: 45,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bgGlossHighlight: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  titleLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  formulaSub: {
    fontSize: 10,
    color: '#dbeafe',
    marginTop: 2.5,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flex: 1,
  },
  currency: {
    fontSize: 15,
    fontWeight: '800',
    color: '#bae6fd',
  },
  amountValue: {
    fontSize: 23,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  applyBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },
  activeDebtBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 25, 55, 0.38)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    gap: 6,
  },
  activeDebtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fde047',
  },
  activeDebtText: {
    fontSize: 10,
    color: '#e2e8f0',
    flex: 1,
    fontWeight: '500',
  },
  boldAmount: {
    color: '#ffffff',
    fontWeight: '800',
  },
  tenorSub: {
    color: '#cbd5e1',
    fontSize: 9.5,
  },
  autoPayrollPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  autoPayrollText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  cleanDebtBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 25, 55, 0.38)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    gap: 6,
  },
  cleanStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#86efac',
  },
  cleanDebtText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dcfce7',
  },
});




