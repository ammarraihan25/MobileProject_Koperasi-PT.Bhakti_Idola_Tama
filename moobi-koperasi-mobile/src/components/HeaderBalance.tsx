import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { AppIcon } from './common/AppIcon';
import { mockWallet } from '../data/mockData';

interface HeaderBalanceProps {
  saldo: number;
  moobiCoins?: number;
  saldoKantin?: number;
  plafonPinjaman?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  userName?: string;
  department?: string;
  shift?: string;
  onTopUpPress?: () => void;
  onTarikPress?: () => void;
  onTransferPress?: () => void;
  onKantinPress?: () => void;
  onPinjamanPress?: () => void;
}

export const HeaderBalance: React.FC<HeaderBalanceProps> = ({
  saldo,
  moobiCoins = mockWallet.moobiCoins,
  userName,
  department,
  shift,
  plafonPinjaman = mockWallet.plafonPinjaman,
  pinjamanAktif = mockWallet.pinjamanAktif,
  angsuranPerBulan = mockWallet.angsuranPerBulan,
  sisaTenorBulan = mockWallet.sisaTenorBulan,
  onTopUpPress,
  onTarikPress,
  onTransferPress,
  onKantinPress,
  onPinjamanPress,
}) => {
  const [hideBalance, setHideBalance] = useState(false);

  // Pulse animation for live notification dot and canteen status
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous breathing pulse loop
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

  return (
    <View style={styles.headerContainer}>
      {/* 1. Top Bar: Company Name, Welcome User Greeting & Animated Notification Icon */}
      <View style={styles.topBar}>
        <View style={styles.brandWrapper}>
          <Text style={styles.companyTitle}>PT. BAKTI IDOLA TAMA</Text>
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeText} numberOfLines={1}>
              Selamat Datang, <Text style={styles.welcomeName}>{userName || 'Budi Santoso'}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() =>
            Alert.alert(
              'Pusat Notifikasi 🔔',
              '• [Payroll] Gaji & Potongan Koperasi Terverifikasi\n• [Kantin] Promo Diskon 15% Spesial Anggota\n• [Koperasi] Simpanan Wajib Periode Agustus Telah Tercatat'
            )
          }
          activeOpacity={0.8}
        >
          <AppIcon name="bell" size={20} color="#ffffff" />
          <Animated.View
            style={[
              styles.notificationDot,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* 2. Unified Master Wallet Card with High-Contrast Internal Grid */}
      <View style={styles.walletCard}>
        {/* Ambient Decorative Background Circles */}
        <View style={styles.watermarkCircle1} />
        <View style={styles.watermarkCircle2} />

        {/* Tier 1: Main Balance (Left) & Quick Actions (Right) */}
        <View style={styles.mainBalanceRow}>
          <View style={styles.saldoCol}>
            <View style={styles.saldoCaptionRow}>
              <Text style={styles.saldoCaption}>Saldo Koperasi Anggota</Text>
              <TouchableOpacity
                onPress={toggleHideBalance}
                style={styles.eyeToggleBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <AppIcon
                  name={hideBalance ? 'eye-off' : 'eye'}
                  size={15}
                  color="#bae6fd"
                />
              </TouchableOpacity>
            </View>

            <Animated.View style={[styles.amountRow, { opacity: fadeAnim }]}>
              <Text style={styles.currencyPrefix}>Rp</Text>
              <Text style={styles.amountValue}>
                {hideBalance ? '••••••' : formatRupiah(saldo)}
              </Text>
            </Animated.View>
          </View>

          {/* Action Buttons: Top Up & Tarik Tunai */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onTopUpPress}
              activeOpacity={0.75}
            >
              <View style={styles.actionCircleGreen}>
                <AppIcon name="topup" size={14} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>Top Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onTarikPress}
              activeOpacity={0.75}
            >
              <View style={styles.actionCircleBlue}>
                <AppIcon name="withdraw" size={14} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>Tarik Tunai</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tier 2: Info Cicilan & Plafon Pinjaman Koperasi */}
        <TouchableOpacity
          style={styles.loanInfoBar}
          onPress={onPinjamanPress}
          activeOpacity={0.8}
        >
          {/* Chip 1: Tagihan Cicilan / Pinjaman Aktif */}
          <View style={styles.loanChip}>
            <View style={styles.loanChipIconCircleOrange}>
              <AppIcon name="paylater" size={12} color="#ffffff" />
            </View>
            <View style={styles.loanChipTextWrap}>
              <Text style={styles.loanChipLabel}>Cicilan Bulan Ini</Text>
              <Text style={styles.loanChipValue}>
                Rp {formatRupiah(angsuranPerBulan)} <Text style={styles.loanTenorText}>({sisaTenorBulan}x)</Text>
              </Text>
            </View>
          </View>

          {/* Vertical Divider */}
          <View style={styles.loanDivider} />

          {/* Chip 2: Pinjaman Tersedia Anggota */}
          <View style={styles.loanChip}>
            <View style={styles.loanChipIconCircleCyan}>
              <AppIcon name="bolt" size={12} color="#ffffff" />
            </View>
            <View style={styles.loanChipTextWrap}>
              <Text style={styles.loanChipLabel}>Pinjaman Tersedia</Text>
              <Text style={styles.loanChipValueCyan}>
                Rp {formatRupiah(plafonPinjaman)}
              </Text>
            </View>
          </View>

          <View style={styles.loanArrowCircle}>
            <AppIcon name="chevron-right" size={11} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#1d72db',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandWrapper: {
    justifyContent: 'center',
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dbeafe',
    letterSpacing: 0.1,
  },
  welcomeName: {
    fontWeight: '700',
    color: '#ffffff',
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#1d72db',
  },
  walletCard: {
    backgroundColor: '#1462c4',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#0c4896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  watermarkCircle2: {
    position: 'absolute',
    bottom: -40,
    left: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  mainBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saldoCol: {
    flex: 1,
  },
  saldoCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  saldoCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: '#bae6fd',
  },
  eyeToggleBtn: {
    padding: 2,
    opacity: 0.9,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 4,
  },
  amountValue: {
    fontSize: 22.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    width: 68,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  actionCircleGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCircleBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 13,
  },
  loanInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'space-between',
  },
  loanChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  loanChipIconCircleOrange: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanChipIconCircleCyan: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loanChipTextWrap: {
    flex: 1,
  },
  loanChipLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#bae6fd',
    letterSpacing: 0.2,
  },
  loanChipValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fef08a',
    marginTop: 1,
  },
  loanChipValueCyan: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    marginTop: 1,
  },
  loanTenorText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fde68a',
  },
  loanDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  loanArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
