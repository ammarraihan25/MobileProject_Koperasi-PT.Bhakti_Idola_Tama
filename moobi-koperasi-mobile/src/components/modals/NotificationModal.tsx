import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AppIcon, IconType } from '../common/AppIcon';
import { ActiveScreenType, TabType } from '../../types';

export interface NotificationItem {
  id: string;
  category: 'payroll' | 'kantin' | 'pinjaman' | 'koperasi' | 'simpanan' | 'reward';
  categoryLabel: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: IconType;
  iconBg: string;
  badgeBg: string;
  badgeColor: string;
  actionScreen?: ActiveScreenType | TabType;
  actionLabel?: string;
  details?: {
    refNo?: string;
    amount?: string;
    source?: string;
    notes?: string;
  };
}

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'payroll',
    categoryLabel: 'PAYROLL & SIMPANAN',
    title: 'Auto-Debit Simpanan Wajib Berhasil',
    message:
      'Potongan iuran Simpanan Wajib sebesar Rp 100.000 untuk periode September 2026 telah otomatis disinkronkan dari payroll gaji ke saldo koperasi Anda.',
    timestamp: '15 menit yang lalu',
    isRead: false,
    icon: 'wallet',
    iconBg: '#1d72db',
    badgeBg: '#eff6ff',
    badgeColor: '#1d72db',
    actionScreen: 'simpanan_wajib',
    actionLabel: 'Cek Simpanan Wajib',
    details: {
      refNo: 'BIT-SW-202609-8812',
      amount: 'Rp 100.000',
      source: 'Slip Gaji Payroll PT BIT',
      notes: 'Akumulasi iuran wajib untuk perhitungan SHU tahunan.',
    },
  },
  {
    id: 'notif-2',
    category: 'kantin',
    categoryLabel: 'KANTIN KOPERASI',
    title: 'Voucher Diskon Makan Siang Siap Digunakan',
    message:
      'Voucher makan siang kantin pabrik telah aktif! Nikmati diskon potongan menu di Stand 01-03 Kantin Koperasi Barat & Timur.',
    timestamp: 'Hari Ini, 07:30 WIB',
    isRead: false,
    icon: 'food',
    iconBg: '#16a34a',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    actionScreen: 'kantin',
    actionLabel: 'Pesan Menu Kantin',
    details: {
      refNo: 'VCR-KNT-99021',
      amount: 'Potongan Rp 10.000',
      source: 'Program Diskon Makan Siang Karyawan',
      notes: 'Berlaku s.d. jam 14:00 WIB di seluruh loket kantin PT BIT.',
    },
  },
  {
    id: 'notif-3',
    category: 'pinjaman',
    categoryLabel: 'PINJAMAN KARYAWAN',
    title: 'Plafon Pinjaman Karyawan Siap Diajukan',
    message:
      'Plafon pinjaman darurat karyawan Anda sebesar Rp 25.000.000 telah aktif. Pengajuan mudah dengan jasa 0.8% flat dan potong slip gaji.',
    timestamp: 'Kemarin, 14:15 WIB',
    isRead: false,
    icon: 'paylater',
    iconBg: '#d97706',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    actionScreen: 'pinjaman',
    actionLabel: 'Ajukan Pinjaman',
    details: {
      refNo: 'PLN-BIT-25JT',
      amount: 'Hingga Rp 25.000.000',
      source: 'Fasilitas Karyawan Tetap PT BIT',
      notes: 'Tenor s.d. 24 bulan dengan cicilan potong gaji bulanan.',
    },
  },
  {
    id: 'notif-4',
    category: 'koperasi',
    categoryLabel: 'PENGUMUMAN RESMI',
    title: 'Estimasi SHU Koperasi 2026 Diperbarui',
    message:
      'Perhitungan proyeksi Sisa Hasil Usaha (SHU) tahun buku 2026 telah disesuaikan berdasarkan keaktifan simpanan dan transaksi anggota.',
    timestamp: '20 Sep 2026, 11:00 WIB',
    isRead: true,
    icon: 'bell',
    iconBg: '#0d9488',
    badgeBg: '#ccfbf1',
    badgeColor: '#0f766e',
    actionScreen: 'profil',
    actionLabel: 'Lihat Info SHU',
    details: {
      refNo: 'INFO-RAT-2026-09',
      amount: 'Estimasi Rp 1.450.000',
      source: 'Pengurus Koperasi PT Bakti Idola Tama',
      notes: 'Pembagian resmi saat Rapat Anggota Tahunan (RAT).',
    },
  },
  {
    id: 'notif-5',
    category: 'simpanan',
    categoryLabel: 'SIMPANAN SUKARELA',
    title: 'Auto-Debit Simpanan Sukarela Berhasil',
    message:
      'Setoran rutin Simpanan Sukarela sebesar Rp 200.000 telah dialokasikan via auto-debit payroll bulanan. Saldo dapat ditarik kapan saja ke rekening payroll.',
    timestamp: '19 Sep 2026, 08:00 WIB',
    isRead: true,
    icon: 'simpanan',
    iconBg: '#2563eb',
    badgeBg: '#eff6ff',
    badgeColor: '#1d4ed8',
    actionScreen: 'simpanan_sukarela',
    actionLabel: 'Cek Simpanan Sukarela',
    details: {
      refNo: 'BIT-SS-202609-4410',
      amount: 'Rp 200.000',
      source: 'Payroll Auto-Debit PT BIT',
      notes: 'Saldo fleksibel dapat dicairkan langsung ke rekening payroll anggota kapan saja.',
    },
  },
];

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onUpdateNotifications?: (items: NotificationItem[]) => void;
  onNavigateScreen?: (screen: ActiveScreenType) => void;
  onNavigateTab?: (tab: TabType) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications: externalNotifications,
  onUpdateNotifications,
  onNavigateScreen,
  onNavigateTab,
}) => {
  const [internalList, setInternalList] = useState<NotificationItem[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<'semua' | 'unread' | 'payroll' | 'kantin'>('semua');
  const [selectedDetailNotif, setSelectedDetailNotif] = useState<NotificationItem | null>(null);

  const list = externalNotifications || internalList;
  const updateList = (newList: NotificationItem[]) => {
    if (onUpdateNotifications) {
      onUpdateNotifications(newList);
    } else {
      setInternalList(newList);
    }
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  const filteredList = list.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'payroll') return item.category === 'payroll' || item.category === 'pinjaman' || item.category === 'simpanan';
    if (activeFilter === 'kantin') return item.category === 'kantin' || item.category === 'koperasi';
    return true;
  });

  const handleMarkAllAsRead = () => {
    const updated = list.map((item) => ({ ...item, isRead: true }));
    updateList(updated);
    Alert.alert('Sukses', 'Semua notifikasi telah ditandai sebagai sudah dibaca.');
  };

  const handleSelectNotification = (notif: NotificationItem) => {
    // Mark as read
    if (!notif.isRead) {
      const updated = list.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n));
      updateList(updated);
    }
    setSelectedDetailNotif(notif);
  };

  const handleDeleteNotification = (id: string) => {
    const updated = list.filter((n) => n.id !== id);
    updateList(updated);
    if (selectedDetailNotif?.id === id) {
      setSelectedDetailNotif(null);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Hapus Semua Notifikasi',
      'Apakah Anda yakin ingin menghapus seluruh riwayat notifikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => updateList([]),
        },
      ]
    );
  };

  const handleActionClick = (notif: NotificationItem) => {
    if (!notif.actionScreen) return;
    onClose();
    setSelectedDetailNotif(null);

    if (
      notif.actionScreen === 'beranda' ||
      notif.actionScreen === 'keuangan' ||
      notif.actionScreen === 'riwayat' ||
      notif.actionScreen === 'profil'
    ) {
      if (onNavigateTab) {
        onNavigateTab(notif.actionScreen as TabType);
      } else if (onNavigateScreen) {
        onNavigateScreen(notif.actionScreen as ActiveScreenType);
      }
    } else {
      if (onNavigateScreen) {
        onNavigateScreen(notif.actionScreen as ActiveScreenType);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBellWrap}>
                <AppIcon name="bell" size={19} color="#1d72db" />
                {unreadCount > 0 && (
                  <View style={styles.unreadCounterBadge}>
                    <Text style={styles.unreadCounterText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.headerTitle}>Pusat Notifikasi</Text>
                <Text style={styles.headerSubtitle}>
                  {unreadCount > 0
                    ? `${unreadCount} notifikasi baru belum dibaca`
                    : 'Semua notifikasi telah dibaca'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Header Row */}
          <View style={styles.quickActionRow}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.markAllBtn}
                activeOpacity={0.75}
              >
                <AppIcon name="check" size={13} color="#1d72db" />
                <Text style={styles.markAllBtnText}>Tandai Semua Dibaca</Text>
              </TouchableOpacity>
            )}

            {list.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.clearAllBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.clearAllBtnText}>Bersihkan Semua</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <View style={styles.filterTabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterTabsScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'semua' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('semua')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'semua' && styles.filterPillTextActive,
                  ]}
                >
                  Semua ({list.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'unread' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('unread')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'unread' && styles.filterPillTextActive,
                  ]}
                >
                  Belum Dibaca {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'payroll' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('payroll')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'payroll' && styles.filterPillTextActive,
                  ]}
                >
                  Payroll & Dana
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  activeFilter === 'kantin' && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter('kantin')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'kantin' && styles.filterPillTextActive,
                  ]}
                >
                  Kantin & Info
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Notifications Scroll List */}
          <ScrollView
            style={styles.notificationList}
            contentContainerStyle={styles.notificationListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredList.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconCircle}>
                  <AppIcon name="bell" size={26} color="#ffffff" />
                </View>
                <Text style={styles.emptyStateTitle}>Tidak Ada Notifikasi</Text>
                <Text style={styles.emptyStateSub}>
                  {activeFilter === 'unread'
                    ? 'Bagus! Anda telah membaca semua notifikasi yang masuk.'
                    : 'Belum ada notifikasi baru untuk kategori ini saat ini.'}
                </Text>
              </View>
            ) : (
              filteredList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    !item.isRead && styles.notifCardUnread,
                  ]}
                  onPress={() => handleSelectNotification(item)}
                  activeOpacity={0.78}
                >
                  <View style={styles.notifCardHeaderRow}>
                    <View style={styles.notifIconAndCategory}>
                      <View
                        style={[
                          styles.notifIconCircle,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        <AppIcon name={item.icon} size={16} color="#ffffff" />
                      </View>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: item.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            { color: item.badgeColor },
                          ]}
                        >
                          {item.categoryLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.notifHeaderRight}>
                      <Text style={styles.notifTimeText}>{item.timestamp}</Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.notifTitle,
                      !item.isRead && styles.notifTitleUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text style={styles.notifMessage} numberOfLines={2}>
                    {item.message}
                  </Text>

                  {/* Action Link Footer */}
                  {item.actionLabel && (
                    <View style={styles.notifActionRow}>
                      <Text style={styles.notifActionText}>
                        {item.actionLabel}
                      </Text>
                      <AppIcon name="chevron-right" size={11} color="#1d72db" />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer Close Button */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.closeFooterBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeFooterBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* DETAIL MODAL EXPANSION */}
      {selectedDetailNotif && (
        <Modal
          visible={!!selectedDetailNotif}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedDetailNotif(null)}
        >
          <View style={styles.detailOverlay}>
            <View style={styles.detailCard}>
              <View style={styles.detailTopHeader}>
                <View
                  style={[
                    styles.detailIconCircle,
                    { backgroundColor: selectedDetailNotif.iconBg },
                  ]}
                >
                  <AppIcon name={selectedDetailNotif.icon} size={22} color="#ffffff" />
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedDetailNotif(null)}
                  style={styles.detailCloseBtn}
                  activeOpacity={0.7}
                >
                  <AppIcon name="x" size={15} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: selectedDetailNotif.badgeBg,
                    alignSelf: 'flex-start',
                    marginTop: 4,
                    marginBottom: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    { color: selectedDetailNotif.badgeColor },
                  ]}
                >
                  {selectedDetailNotif.categoryLabel}
                </Text>
              </View>

              <Text style={styles.detailTitle}>{selectedDetailNotif.title}</Text>
              <Text style={styles.detailTime}>{selectedDetailNotif.timestamp}</Text>

              <Text style={styles.detailMessage}>
                {selectedDetailNotif.message}
              </Text>

              {selectedDetailNotif.details && (
                <View style={styles.detailMetaBox}>
                  {selectedDetailNotif.details.refNo && (
                    <View style={styles.detailMetaRow}>
                      <Text style={styles.detailMetaLabel}>No. Referensi:</Text>
                      <Text style={styles.detailMetaValBold}>
                        {selectedDetailNotif.details.refNo}
                      </Text>
                    </View>
                  )}
                  {selectedDetailNotif.details.amount && (
                    <View style={styles.detailMetaRow}>
                      <Text style={styles.detailMetaLabel}>Nominal / Nilai:</Text>
                      <Text style={styles.detailMetaValHighlight}>
                        {selectedDetailNotif.details.amount}
                      </Text>
                    </View>
                  )}
                  {selectedDetailNotif.details.source && (
                    <View style={styles.detailMetaRow}>
                      <Text style={styles.detailMetaLabel}>Sumber Data:</Text>
                      <Text style={styles.detailMetaVal}>
                        {selectedDetailNotif.details.source}
                      </Text>
                    </View>
                  )}
                  {selectedDetailNotif.details.notes && (
                    <View style={styles.detailNotesRow}>
                      <Text style={styles.detailNotesText}>
                        💡 {selectedDetailNotif.details.notes}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.detailActionButtons}>
                {selectedDetailNotif.actionScreen && (
                  <TouchableOpacity
                    style={styles.detailPrimaryBtn}
                    onPress={() => handleActionClick(selectedDetailNotif)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.detailPrimaryBtnText}>
                      {selectedDetailNotif.actionLabel || 'Buka Layanan'}
                    </Text>
                    <AppIcon name="chevron-right" size={13} color="#ffffff" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.detailDeleteBtn}
                  onPress={() => handleDeleteNotification(selectedDetailNotif.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.detailDeleteBtnText}>Hapus Notifikasi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBellWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCounterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  unreadCounterText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d72db',
  },
  clearAllBtn: {
    paddingVertical: 2,
  },
  clearAllBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterTabsWrapper: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterTabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: '#1d72db',
    borderColor: '#1d72db',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  notificationList: {
    flex: 1,
  },
  notificationListContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: '#f8fbff',
    borderColor: '#bfdbfe',
    borderLeftWidth: 3.5,
    borderLeftColor: '#1d72db',
  },
  notifCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifIconAndCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  notifHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifTimeText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1d72db',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  notifTitleUnread: {
    color: '#0f172a',
    fontWeight: '800',
  },
  notifMessage: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16.5,
  },
  notifActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  notifActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d72db',
  },
  emptyStateContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeFooterBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFooterBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },

  /* Detail Card Styles */
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  detailTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  detailCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  detailTime: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginBottom: 10,
  },
  detailMessage: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14,
  },
  detailMetaBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    marginBottom: 16,
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailMetaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  detailMetaVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  detailMetaValBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },
  detailMetaValHighlight: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16a34a',
  },
  detailNotesRow: {
    backgroundColor: '#eff6ff',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  detailNotesText: {
    fontSize: 10,
    color: '#1e40af',
    lineHeight: 14,
  },
  detailActionButtons: {
    gap: 8,
  },
  detailPrimaryBtn: {
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  detailPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  detailDeleteBtn: {
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  detailDeleteBtnText: {
    color: '#dc2626',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
