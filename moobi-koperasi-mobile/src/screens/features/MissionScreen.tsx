import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';

interface MissionScreenProps {
  onBack: () => void;
  userCoins: number;
  onCoinClaimed?: (addedCoins: number) => void;
}

export const MissionScreen: React.FC<MissionScreenProps> = ({
  onBack,
  userCoins,
  onCoinClaimed,
}) => {
  const [checkedInDays, setCheckedInDays] = useState<number[]>([1, 2]);
  const [todayClaimed, setTodayClaimed] = useState(false);
  const [activeTab, setActiveTab] = useState<'misi' | 'tukar'>('misi');

  const dailyStreak = [
    { day: 1, name: 'Sen', coins: 10 },
    { day: 2, name: 'Sel', coins: 10 },
    { day: 3, name: 'Rab', coins: 15, isToday: true },
    { day: 4, name: 'Kam', coins: 15 },
    { day: 5, name: 'Jum', coins: 20 },
    { day: 6, name: 'Sab', coins: 25 },
    { day: 7, name: 'Min', coins: 50, isBonus: true },
  ];

  const missionList = [
    {
      id: 'm1',
      title: 'Pre-Order Kantin Pabrik Hari Ini',
      desc: 'Pesan makan siang tanpa antre tunai di kasir',
      coins: 15,
      progress: '1/1',
      completed: true,
      claimed: false,
    },
    {
      id: 'm2',
      title: 'Bayar Tagihan Listrik / BPJS via Saldo',
      desc: 'Transaksi pembayaran PPoB min. Rp 25.000',
      coins: 25,
      progress: '0/1',
      completed: false,
      claimed: false,
    },
    {
      id: 'm3',
      title: 'Simpanan Sukarela Rutin Bulan Ini',
      desc: 'Top up simpanan sukarela min. Rp 50.000',
      coins: 50,
      progress: '50.000/50.000',
      completed: true,
      claimed: true,
    },
    {
      id: 'm4',
      title: 'Beli Produk BIT (Miyako/Rinnai/Shimizu)',
      desc: 'Dapatkan diskon khusus karyawan dan cashback koin',
      coins: 100,
      progress: '0/1',
      completed: false,
      claimed: false,
    },
  ];

  const rewardCatalog = [
    {
      id: 'r1',
      brand: 'MIYAKO',
      title: 'Voucher Diskon 35% Rice Cooker',
      cost: 50,
      badge: 'PROMO BIT',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
    },
    {
      id: 'r2',
      brand: 'KANTIN BIT',
      title: 'Gratis Minuman Es Teh / Kopi Stand 1',
      cost: 15,
      badge: 'INSTAN',
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
    },
    {
      id: 'r3',
      brand: 'KOPERASI',
      title: 'Bebas Biaya Admin Transfer Antar Bank (3x)',
      cost: 20,
      badge: 'GRATIS',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
    },
    {
      id: 'r4',
      brand: 'RINNAI',
      title: 'Cashback Rp 50.000 Kompor Gas 2 Tungku',
      cost: 80,
      badge: 'SPESIAL',
      badgeBg: '#fee2e2',
      badgeColor: '#dc2626',
    },
  ];

  const handleDailyCheckIn = () => {
    if (todayClaimed) {
      Alert.alert('Info Absensi', 'Anda sudah melakukan check-in hari ini. Kembali lagi besok!');
      return;
    }
    setCheckedInDays([...checkedInDays, 3]);
    setTodayClaimed(true);
    if (onCoinClaimed) onCoinClaimed(15);
    Alert.alert('Selamat! 🎉', 'Anda mendapatkan +15 Moobi Coins dari Check-In Harian Koperasi!');
  };

  const handleClaimMission = (title: string, coins: number) => {
    if (onCoinClaimed) onCoinClaimed(coins);
    Alert.alert('Misi Berhasil! 🎁', `Klaim reward +${coins} Moobi Coins dari misi: "${title}".`);
  };

  const handleRedeemReward = (title: string, cost: number) => {
    if (userCoins < cost) {
      Alert.alert('Koin Tidak Cukup', `Anda membutuhkan ${cost} Koin untuk menukar reward ini.`);
      return;
    }
    Alert.alert(
      'Konfirmasi Tukar Koin 🪙',
      `Tukarkan ${cost} Koin untuk:\n"${title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tukar Reward',
          onPress: () => {
            if (onCoinClaimed) onCoinClaimed(-cost);
            Alert.alert('Berhasil Ditukar! 🎟️', 'Kupon reward telah ditambahkan ke dompet akun Anda.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      {/* Top Bar Navigation */}
      <View style={styles.topNavBar}>
        <Text style={styles.topNavTitle}>Misi & Koin Anggota</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Coins Hero Card */}
        <View style={styles.coinsHeroCard}>
          <View style={styles.coinsHeroLeft}>
            <Text style={styles.coinsHeroLabel}>Total Koin Saya</Text>
            <View style={styles.coinsHeroAmountRow}>
              <View style={styles.coinGoldDot} />
              <Text style={styles.coinsHeroAmount}>{userCoins + (todayClaimed ? 15 : 0)}</Text>
              <Text style={styles.coinsHeroUnit}>Moobi Coins</Text>
            </View>
            <Text style={styles.memberStatusText}>Status: Anggota Aktif Koperasi (Tier Gold)</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkInBtn, todayClaimed && styles.checkInBtnDisabled]}
            onPress={handleDailyCheckIn}
            activeOpacity={0.8}
          >
            <Text style={styles.checkInBtnText}>
              {todayClaimed ? '✓ Sudah Absen' : '+ Check-In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Check-In 7-Days Streak */}
        <View style={styles.streakSection}>
          <Text style={styles.sectionSubtitle}>ABSENSI HARIAN (7 HARI STREAK)</Text>
          <View style={styles.streakRow}>
            {dailyStreak.map((item) => {
              const isClaimed = checkedInDays.includes(item.day);
              return (
                <View
                  key={item.day}
                  style={[
                    styles.streakDayBox,
                    isClaimed && styles.streakDayBoxClaimed,
                    item.isToday && !todayClaimed && styles.streakDayBoxToday,
                  ]}
                >
                  <Text style={[styles.streakDayName, isClaimed && styles.streakDayNameClaimed]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.streakDayCoins, isClaimed && styles.streakDayCoinsClaimed]}>
                    +{item.coins}
                  </Text>
                  {isClaimed && (
                    <View style={styles.claimedCheck}>
                      <Text style={styles.claimedCheckText}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'misi' && styles.tabBtnActive]}
            onPress={() => setActiveTab('misi')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'misi' && styles.tabBtnTextActive]}>
              Misi Koperasi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tukar' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tukar')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'tukar' && styles.tabBtnTextActive]}>
              Tukar Hadiah ({rewardCatalog.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content 1: Misi */}
        {activeTab === 'misi' ? (
          <View style={styles.missionsList}>
            {missionList.map((m) => (
              <View key={m.id} style={styles.missionCard}>
                <View style={styles.missionCardLeft}>
                  <View style={styles.missionCoinBadge}>
                    <Text style={styles.missionCoinBadgeText}>+{m.coins}</Text>
                  </View>
                  <View style={styles.missionTextGroup}>
                    <Text style={styles.missionTitle}>{m.title}</Text>
                    <Text style={styles.missionDesc}>{m.desc}</Text>
                    <Text style={styles.missionProgress}>Progress: {m.progress}</Text>
                  </View>
                </View>
                {m.claimed ? (
                  <View style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Sudah Diklaim</Text>
                  </View>
                ) : m.completed ? (
                  <TouchableOpacity
                    style={styles.claimRewardBtn}
                    onPress={() => handleClaimMission(m.title, m.coins)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.claimRewardBtnText}>Klaim</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionMissionBtn}
                    onPress={() => {
                      Alert.alert('Menuju Fitur', `Silakan selesaikan aksi: ${m.title}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionMissionBtnText}>Mulai</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          /* Tab Content 2: Tukar Hadiah */
          <View style={styles.rewardsList}>
            {rewardCatalog.map((r) => (
              <View key={r.id} style={styles.rewardCard}>
                <View style={styles.rewardCardHeader}>
                  <View style={[styles.rewardBadge, { backgroundColor: r.badgeBg }]}>
                    <Text style={[styles.rewardBadgeText, { color: r.badgeColor }]}>
                      {r.badge}
                    </Text>
                  </View>
                  <Text style={styles.rewardCost}>{r.cost} Koin</Text>
                </View>
                <Text style={styles.rewardBrand}>{r.brand}</Text>
                <Text style={styles.rewardTitle}>{r.title}</Text>
                <TouchableOpacity
                  style={[
                    styles.redeemBtn,
                    userCoins < r.cost && styles.redeemBtnDisabled,
                  ]}
                  onPress={() => handleRedeemReward(r.title, r.cost)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.redeemBtnText,
                      userCoins < r.cost && styles.redeemBtnTextDisabled,
                    ]}
                  >
                    {userCoins >= r.cost ? 'Tukar Kupon' : 'Koin Kurang'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
    justifyContent: 'center',
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  coinsHeroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  coinsHeroLeft: {
    flex: 1,
  },
  coinsHeroLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  coinsHeroAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  coinGoldDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#facc15',
  },
  coinsHeroAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d72db',
  },
  coinsHeroUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854d0e',
  },
  memberStatusText: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  checkInBtn: {
    backgroundColor: '#facc15',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  checkInBtnDisabled: {
    backgroundColor: '#f1f5f9',
  },
  checkInBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#713f12',
  },
  streakSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  streakDayBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  streakDayBoxClaimed: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  streakDayBoxToday: {
    borderColor: '#1d72db',
    borderWidth: 1.5,
    backgroundColor: '#eff6ff',
  },
  streakDayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  streakDayNameClaimed: {
    color: '#16a34a',
  },
  streakDayCoins: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  streakDayCoinsClaimed: {
    color: '#15803d',
  },
  claimedCheck: {
    position: 'absolute',
    top: -4,
    right: -3,
    backgroundColor: '#16a34a',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimedCheckText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  missionsList: {
    gap: 10,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  missionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  missionCoinBadge: {
    backgroundColor: '#fef08a',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  missionCoinBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854d0e',
  },
  missionTextGroup: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  missionDesc: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  missionProgress: {
    fontSize: 10,
    color: '#1d72db',
    fontWeight: '700',
    marginTop: 4,
  },
  claimRewardBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  claimRewardBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  doneBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  doneBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  actionMissionBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  actionMissionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  rewardsList: {
    gap: 12,
  },
  rewardCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rewardCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  rewardBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  rewardCost: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
  rewardBrand: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  rewardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
    marginBottom: 10,
  },
  redeemBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  redeemBtnDisabled: {
    backgroundColor: '#f1f5f9',
  },
  redeemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  redeemBtnTextDisabled: {
    color: '#94a3b8',
  },
});
