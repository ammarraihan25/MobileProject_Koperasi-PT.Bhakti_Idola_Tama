import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { AppIcon } from './common/AppIcon';
import { mockWallet, mockUser } from '../data/mockData';
import { NotificationModal, initialNotifications, NotificationItem } from './modals/NotificationModal';
import { ActiveScreenType, TabType } from '../types';

interface HeaderBalanceProps {
  saldo?: number;
  moobiCoins?: number;
  userName?: string;
  avatarUri?: string | null;
  jabatan?: string;
  department?: string;
  masaKerjaBulan?: number;
  plafonPinjaman?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  simpananWajib?: number;
  simpananSukarela?: number;
  onSetorPress?: () => void;
  onTarikPress?: () => void;
  onDetailPress?: () => void;
  onDetailWajibPress?: () => void;
  onDetailSukarelaPress?: () => void;
  onKantinPress?: () => void;
  onPinjamanPress?: () => void;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onNavigateScreen?: (screen: ActiveScreenType) => void;
  onNavigateTab?: (tab: TabType) => void;
}

export const HeaderBalance: React.FC<HeaderBalanceProps> = ({
  saldo = mockWallet.simpananSukarela,
  userName = mockUser.name,
  avatarUri = null,
  jabatan = mockUser.jabatan,
  department = mockUser.department,
  masaKerjaBulan = mockUser.masaKerjaBulan,
  plafonPinjaman = mockWallet.plafonPinjaman,
  pinjamanAktif = mockWallet.pinjamanAktif,
  angsuranPerBulan = mockWallet.angsuranPerBulan,
  sisaTenorBulan = mockWallet.sisaTenorBulan,
  simpananWajib = mockWallet.simpananWajib,
  simpananSukarela = mockWallet.simpananSukarela,
  onSetorPress,
  onTarikPress,
  onDetailPress,
  onDetailWajibPress,
  onDetailSukarelaPress,
  onPinjamanPress,
  onAvatarPress,
  onNotificationPress,
  onNavigateScreen,
  onNavigateTab,
}) => {
  const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Pulse animation for notification dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const masaKerjaText = `${Math.floor(masaKerjaBulan / 12)} Thn ${masaKerjaBulan % 12} Bln`;

  const handleOpenDetail = onDetailPress || onDetailSukarelaPress || onDetailWajibPress;

  return (
    <View style={styles.headerContainer}>
      {/* Background Watermark Geometric Accents */}
      <View style={styles.watermarkCircle1} pointerEvents="none" />
      <View style={styles.watermarkCircle2} pointerEvents="none" />

      {/* 1. Header Top Bar with Centered Company Title */}
      <View style={styles.topHeaderBar}>
        <View style={styles.headerSidePlaceholder} />

        <View style={styles.titleCenterWrapper}>
          <Text style={styles.companyTitle}>PT. BAKTI IDOLA TAMA</Text>
          <Text style={styles.companySubtitle}>KOPERASI KARYAWAN</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => {
            if (onNotificationPress) {
              onNotificationPress();
            } else {
              setIsNotifModalVisible(true);
            }
          }}
          activeOpacity={0.8}
        >
          <AppIcon name="bell" size={19} color="#ffffff" />
          {unreadCount > 0 && (
            <Animated.View
              style={[
                styles.notificationDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. User Profile Banner with Avatar + Info */}
      <View style={styles.userProfileCard}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarPress}
          activeOpacity={onAvatarPress ? 0.8 : 1}
        >
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <AppIcon name="user" size={24} color="#1d72db" />
            )}
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfoCol}>
          <Text style={styles.welcomeText}>
            Selamat Datang, <Text style={styles.welcomeName}>{userName}</Text>
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.positionPill}>
              <AppIcon name="user" size={11} color="#dbeafe" />
              <Text style={styles.positionText}>{jabatan}</Text>
            </View>
            <View style={styles.tenurePill}>
              <Text style={styles.tenureText}>Masa Kerja: {masaKerjaText}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. DUA KARTU SIMPANAN MENYATU DENGAN BG BANNER (ATAS & BAWAH) */}
      <View style={styles.stackedCardsContainer}>
        {/* KARTU 1 (ATAS): SIMPANAN WAJIB */}
        <TouchableOpacity
          style={styles.savingGlassCard}
          onPress={onDetailWajibPress || handleOpenDetail}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeftGroup}>
            <View style={styles.amberCircleIcon}>
              <AppIcon name="lock" size={16} color="#ffffff" />
            </View>
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardLabelWajib}>Simpanan Wajib</Text>
              <Text style={styles.cardArticleSubWajib}>Terkunci 1 Thn • Auto-debit slip gaji</Text>
              <Text style={styles.cardAmountValue}>
                Rp {formatRupiah(simpananWajib)}
              </Text>
            </View>
          </View>

          <View style={styles.cardRightGroup}>
            <TouchableOpacity
              style={styles.detailPillBtn}
              onPress={onDetailWajibPress || handleOpenDetail}
              activeOpacity={0.8}
            >
              <Text style={styles.detailPillText}>Detail ›</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* KARTU 2 (BAWAH): SIMPANAN SUKARELA */}
        <TouchableOpacity
          style={styles.savingGlassCard}
          onPress={onDetailSukarelaPress || handleOpenDetail}
          activeOpacity={0.85}
        >
          <View style={styles.cardLeftGroup}>
            <View style={styles.blueCircleIcon}>
              <AppIcon name="wallet" size={16} color="#ffffff" />
            </View>
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardLabelSukarela}>Simpanan Sukarela</Text>
              <Text style={styles.cardArticleSubSukarela}>Tabungan Anggota • Khusus Penarikan Dana</Text>
              <Text style={styles.cardAmountValue}>
                Rp {formatRupiah(simpananSukarela)}
              </Text>
            </View>
          </View>

          <View style={styles.cardRightGroup}>
            <TouchableOpacity
              style={styles.detailPillBtn}
              onPress={onDetailSukarelaPress || handleOpenDetail}
              activeOpacity={0.8}
            >
              <Text style={styles.detailPillText}>Detail ›</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Pusat Notifikasi Modal */}
      <NotificationModal
        visible={isNotifModalVisible}
        onClose={() => setIsNotifModalVisible(false)}
        notifications={notifications}
        onUpdateNotifications={setNotifications}
        onNavigateScreen={onNavigateScreen}
        onNavigateTab={onNavigateTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#1d72db',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  /* Background Watermarks */
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
    top: 55,
    left: -40,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  /* 1. Centered Company Header Bar */
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerSidePlaceholder: {
    width: 36,
    height: 36,
  },
  titleCenterWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  companyTitle: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  companySubtitle: {
    color: '#bae6fd',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 1.5,
    textAlign: 'center',
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#ffffff',
  },

  /* 2. User Profile Banner with Avatar + Info */
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  profileInfoCol: {
    flex: 1,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeName: {
    fontWeight: '800',
    color: '#ffffff',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  positionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  positionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  tenurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  tenureText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#dbeafe',
  },

  /* 3. STACKED GLASS CARDS CONTAINER (MENYATU DENGAN BG BANNER) */
  stackedCardsContainer: {
    gap: 8,
  },
  savingGlassCard: {
    backgroundColor: 'rgba(10, 25, 55, 0.42)',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  cardLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  amberCircleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueCircleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextGroup: {
    flex: 1,
  },
  cardLabelWajib: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fef08a',
    letterSpacing: -0.1,
  },
  cardArticleSubWajib: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#fed7aa',
    marginTop: 1,
    marginBottom: 3,
  },
  cardLabelSukarela: {
    fontSize: 12,
    fontWeight: '800',
    color: '#bae6fd',
    letterSpacing: -0.1,
  },
  cardArticleSubSukarela: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#86efac',
    marginTop: 1,
    marginBottom: 3,
  },
  cardAmountValue: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  cardRightGroup: {
    paddingLeft: 6,
  },
  detailPillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  detailPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});

