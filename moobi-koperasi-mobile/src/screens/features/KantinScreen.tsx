import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';
import { mockKantinMenu, mockWallet } from '../../data/mockData';
import { KantinMenuItem } from '../../types';

const foodImages: Record<string, any> = {
  'nasi-goreng': require('../../../assets/kantin/nasi-goreng.webp'),
  'soto-ayam': require('../../../assets/kantin/soto-ayam.webp'),
  'geprek': require('../../../assets/kantin/geprek.webp'),
  'miso': require('../../../assets/kantin/miso.webp'),
  'tahu-tempe': require('../../../assets/kantin/tahu-tempe.webp'),
  'es-teh': require('../../../assets/kantin/es-teh.webp'),
  'kopi-hitam': require('../../../assets/kantin/kopi-hitam.webp'),
  'air-mineral': require('../../../assets/kantin/air-mineral.webp'),
};

interface KantinScreenProps {
  onBack: () => void;
  userBalance?: number;
  onOrderSuccess?: (totalPrice: number, itemsCount: number, itemsSummary: string) => void;
  onNavigateRiwayat?: () => void;
}

interface KantinOrderRecord {
  id: string;
  ticketNo: string;
  itemsCount: number;
  totalAmount: number;
  paymentSource: string;
  canteenStand: string;
  timestamp: string;
  notes?: string;
  itemsList: {
    id: string;
    name: string;
    qty: number;
    price: number;
    imageKey?: string;
  }[];
  status: 'menunggu_pembayaran' | 'selesai';
}

export const KantinScreen: React.FC<KantinScreenProps> = ({
  onBack,
  userBalance = mockWallet.simpananSukarela,
  onOrderSuccess,
  onNavigateRiwayat,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const [ordersList, setOrdersList] = useState<KantinOrderRecord[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<string>('');

  // Modal States
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState<boolean>(false);
  const [selectedOrderToComplete, setSelectedOrderToComplete] = useState<KantinOrderRecord | null>(null);
  const [isConfirmPickupModalVisible, setIsConfirmPickupModalVisible] = useState<boolean>(false);
  const [isCompletedSuccessModalVisible, setIsCompletedSuccessModalVisible] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<KantinOrderRecord | null>(null);

  const categories = ['Semua', 'Makanan', 'Camilan', 'Minuman'];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleAddToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] -= 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, count]) => {
    const item = mockKantinMenu.find((m) => m.id === id);
    return sum + (item ? item.price * count : 0);
  }, 0);

  const filteredMenu = mockKantinMenu.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Makanan') return item.category === 'makanan';
    if (selectedCategory === 'Camilan') return item.category === 'snack';
    if (selectedCategory === 'Minuman') return item.category === 'minuman';
    return true;
  });

  const handleOpenCheckout = () => {
    if (totalItems === 0) {
      Alert.alert('Keranjang Kosong', 'Silakan pilih menu makanan/minuman terlebih dahulu.');
      return;
    }
    setIsCheckoutModalVisible(true);
  };

  const handleConfirmPayment = () => {
    const ticketNo = `BIT-KTN-#${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const itemsSummaryList = Object.entries(cart)
      .map(([id, qty]) => {
        const item = mockKantinMenu.find((m) => m.id === id);
        return {
          id,
          name: item ? item.name : 'Menu Kantin',
          qty,
          price: item ? item.price : 0,
          imageKey: item?.imageKey,
        };
      })
      .filter((i) => i.qty > 0);

    const newOrder: KantinOrderRecord = {
      id: `KTN-${Date.now()}`,
      ticketNo,
      itemsCount: totalItems,
      totalAmount: totalPrice,
      paymentSource: 'Pembayaran Pihak Ke-3',
      canteenStand: 'Loket Kantin Gedung A - PT BIT',
      timestamp: `Hari Ini, ${timeFormatted}`,
      notes: notes.trim() || undefined,
      itemsList: itemsSummaryList,
      status: 'menunggu_pembayaran',
    };

    setOrdersList((prev) => [newOrder, ...prev]);
    setCart({});
    setNotes('');
    setIsCheckoutModalVisible(false);
    setActiveTab('orders'); // Langsung beralih ke daftar pesanan yang dipesan
  };

  const handleOpenCompleteOrderModal = (order: KantinOrderRecord) => {
    setSelectedOrderToComplete(order);
    setIsConfirmPickupModalVisible(true);
  };

  const handleExecuteCompleteOrder = () => {
    if (!selectedOrderToComplete) return;
    const orderId = selectedOrderToComplete.id;
    const target = selectedOrderToComplete;

    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'selesai' } : o))
    );

    const itemsSummary = target.itemsList.map((i) => `${i.qty}x ${i.name}`).join(', ');
    if (onOrderSuccess) {
      onOrderSuccess(target.totalAmount, target.itemsCount, itemsSummary);
    }

    setLastCompletedOrder(target);
    setIsConfirmPickupModalVisible(false);
    setIsCompletedSuccessModalVisible(true);
  };

  return (
    <View style={styles.screenContainer}>
      {/* 1. Top Bar Navigation */}
      <View style={styles.topNavBar}>
        <View style={styles.topNavHeaderRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <AppIcon name="chevron-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.topNavCenter}>
            <Text style={styles.topNavTitle}>Kantin Koperasi BIT</Text>
            <Text style={styles.topNavSub}>Pre-Order Praktis • Tanpa Antre</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Tab Switcher: Pilih Menu vs Pesanan Saya */}
        <View style={styles.screenNavTabs}>
          <TouchableOpacity
            style={[styles.screenNavTabItem, activeTab === 'menu' && styles.screenNavTabItemActive]}
            onPress={() => setActiveTab('menu')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.screenNavTabText,
                activeTab === 'menu' && styles.screenNavTabTextActive,
              ]}
            >
              Menu Kantin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.screenNavTabItem,
              activeTab === 'orders' && styles.screenNavTabItemActive,
            ]}
            onPress={() => setActiveTab('orders')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.screenNavTabText,
                activeTab === 'orders' && styles.screenNavTabTextActive,
              ]}
            >
              Pesanan Saya
            </Text>
            {ordersList.length > 0 && (
              <View style={styles.tabBadgeCounter}>
                <Text style={styles.tabBadgeCounterText}>{ordersList.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ============================================================ */}
      {/* TAB 1: MENU KANTIN (KATALOG MAKANAN & MINUMAN) */}
      {/* ============================================================ */}
      {activeTab === 'menu' ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Banner info pesanan aktif jika sudah pernah pesan */}
            {ordersList.length > 0 && (
              <TouchableOpacity
                style={styles.activeOrderNotifyBanner}
                onPress={() => setActiveTab('orders')}
                activeOpacity={0.85}
              >
                <View style={styles.activeOrderNotifyLeft}>
                  <View style={styles.notifyPulseDot} />
                  <Text style={styles.activeOrderNotifyText}>
                    Kamu memiliki <Text style={{ fontWeight: '800' }}>{ordersList.length} pesanan aktif</Text> di loket kantin.
                  </Text>
                </View>
                <Text style={styles.activeOrderNotifyLink}>Lihat Pesanan ›</Text>
              </TouchableOpacity>
            )}

            {/* 2. Category Filter Tabs */}
            <View style={styles.categoryTabsRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        isSelected && styles.categoryTabTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Menu Grid */}
            <View style={styles.menuGrid}>
              {filteredMenu.map((item: KantinMenuItem) => {
                const count = cart[item.id] || 0;
                const currentStock = Math.max(0, item.stock - count);
                const imageSource = foodImages[item.imageKey];

                return (
                  <View key={item.id} style={styles.foodCard}>
                    <View style={styles.imageContainer}>
                      {imageSource ? (
                        <Image source={imageSource} style={styles.foodImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <AppIcon name="food" size={28} color="#94a3b8" />
                        </View>
                      )}
                      <View style={styles.stockBadge}>
                        <Text style={styles.stockBadgeText}>Stok: {currentStock}</Text>
                      </View>
                    </View>

                    <View style={styles.foodContent}>
                      <Text style={styles.foodTitle} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.foodPrice}>Rp {formatRupiah(item.price)}</Text>
                        {item.originalPrice && (
                          <Text style={styles.originalPrice}>
                            Rp {formatRupiah(item.originalPrice)}
                          </Text>
                        )}
                      </View>

                      {count > 0 ? (
                        <View style={styles.stepperContainer}>
                          <TouchableOpacity
                            style={styles.stepperBtnMinus}
                            onPress={() => handleRemoveFromCart(item.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.stepperBtnMinusText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.stepperValue}>{count}</Text>
                          <TouchableOpacity
                            style={styles.stepperBtnPlus}
                            onPress={() => handleAddToCart(item.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.stepperBtnPlusText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.pilihBtn}
                          onPress={() => handleAddToCart(item.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.pilihBtnText}>+ Pesan</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* 5. Sticky Floating Cart Bar */}
          {totalItems > 0 && (
            <View style={styles.floatingCartBar}>
              <View style={styles.cartBarInfo}>
                <View style={styles.cartBadgeRow}>
                  <View style={styles.cartCountPill}>
                    <Text style={styles.cartCountPillText}>{totalItems} Menu</Text>
                  </View>
                  <Text style={styles.cartShiftText}>Kantin BIT</Text>
                </View>
                <Text style={styles.cartTotalPrice}>Rp {formatRupiah(totalPrice)}</Text>
              </View>

              <TouchableOpacity
                style={styles.cartCheckoutBtn}
                onPress={handleOpenCheckout}
                activeOpacity={0.85}
              >
                <Text style={styles.cartCheckoutBtnText}>Lihat Pesanan ›</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        /* ============================================================ */
        /* TAB 2: PESANAN SAYA (DAFTAR PESANAN YANG SUDAH DIPESAN) */
        /* ============================================================ */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersScrollBody}
        >
          {ordersList.length > 0 ? (
            <>
              <View style={styles.ordersListSection}>
                <Text style={styles.ordersSectionTitle}>PESANAN AKTIF ANDA</Text>

                {ordersList.map((order) => (
                  <View key={order.id} style={styles.orderTicketCard}>
                    {/* Header Ticket */}
                    <View style={styles.orderTicketHeader}>
                      <View>
                        <Text style={styles.orderTicketNoLabel}>NOMOR ANTRIAN LOKET</Text>
                        <Text style={styles.orderTicketNoVal}>{order.ticketNo}</Text>
                        <Text style={styles.orderTicketStand}>{order.canteenStand}</Text>
                      </View>
                      <View
                        style={[
                          styles.orderStatusBadge,
                          order.status === 'selesai' && styles.orderStatusBadgeSuccess,
                        ]}
                      >
                        <Text
                          style={[
                            styles.orderStatusBadgeText,
                            order.status === 'selesai' && styles.orderStatusBadgeTextSuccess,
                          ]}
                        >
                          {order.status === 'selesai' ? '✅ Pesanan Selesai' : '⏳ Siap Diambil'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderTicketDivider} />

                    {/* Daftar Item Menu yang Dipesan */}
                    <Text style={styles.orderItemsHeading}>MENU YANG DIPESAN</Text>
                    <View style={styles.orderItemsStack}>
                      {order.itemsList.map((item, idx) => {
                        const img = item.imageKey ? foodImages[item.imageKey] : null;
                        return (
                          <View key={idx} style={styles.orderedItemRow}>
                            {img ? (
                              <Image source={img} style={styles.orderedItemThumb} resizeMode="cover" />
                            ) : (
                              <View style={styles.orderedItemPlaceholderThumb}>
                                <AppIcon name="food" size={16} color="#16a34a" />
                              </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={styles.orderedItemName}>{item.name}</Text>
                              <Text style={styles.orderedItemSub}>
                                {item.qty} Porsi x Rp {formatRupiah(item.price)}
                              </Text>
                            </View>
                            <Text style={styles.orderedItemSubtotal}>
                              Rp {formatRupiah(item.price * item.qty)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {order.notes && (
                      <View style={styles.orderNotesCard}>
                        <Text style={styles.orderNotesLabel}>Catatan: </Text>
                        <Text style={styles.orderNotesVal}>{order.notes}</Text>
                      </View>
                    )}

                    <View style={styles.orderTicketDivider} />

                    {/* Summary Row */}
                    <View style={styles.orderSummaryMetaRow}>
                      <Text style={styles.orderMetaLabel}>Waktu Pesan:</Text>
                      <Text style={styles.orderMetaVal}>{order.timestamp}</Text>
                    </View>
                    <View style={styles.orderSummaryMetaRow}>
                      <Text style={styles.orderMetaLabel}>Status Pembayaran:</Text>
                      {order.status === 'selesai' ? (
                        <Text style={styles.orderPaymentMetaBadgeSuccess}>Sudah Dibayar (Lunas)</Text>
                      ) : (
                        <Text style={styles.orderPaymentMetaBadgePending}>Menunggu Pembayaran</Text>
                      )}
                    </View>
                    <View style={styles.orderSummaryMetaRow}>
                      <Text style={styles.orderTotalLabel}>Total Tagihan Loket:</Text>
                      <Text style={styles.orderTotalAmount}>Rp {formatRupiah(order.totalAmount)}</Text>
                    </View>

                    {/* Action Button & Note */}
                    {order.status === 'menunggu_pembayaran' ? (
                      <>
                        <View style={styles.loketInfoBox}>
                          <AppIcon name="info" size={13} color="#b45309" />
                          <Text style={styles.loketInfoPendingText}>
                            Tunjukkan nomor antrian ini di loket kantin. Pembayaran dilakukan ke kasir pihak ke-3 saat mengambil makanan.
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.confirmPickupPayBtn}
                          onPress={() => handleOpenCompleteOrderModal(order)}
                          activeOpacity={0.85}
                        >
                          <AppIcon name="check-circle" size={15} color="#ffffff" />
                          <Text style={styles.confirmPickupPayBtnText}>Sudah Diambil & Dibayar di Loket</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.orderCompletedNoteBox}>
                        <AppIcon name="check-circle" size={14} color="#15803d" />
                        <Text style={styles.orderCompletedNoteText}>
                          Pesanan telah diambil & dibayar. Transaksi telah masuk ke halaman Riwayat.
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Tombol Buat Pesanan Baru / Tambah Menu */}
              <View style={styles.addOrderActionWrap}>
                <TouchableOpacity
                  style={styles.addOrderPrimaryBtn}
                  onPress={() => setActiveTab('menu')}
                  activeOpacity={0.85}
                >
                  <AppIcon name="plus" size={18} color="#ffffff" />
                  <Text style={styles.addOrderPrimaryBtnText}>Pesan Menu Baru / Tambah Menu</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Empty State */
            <View style={styles.emptyOrdersContainer}>
              <View style={styles.emptyOrdersIconBox}>
                <AppIcon name="food" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyOrdersTitle}>Belum Ada Pesanan Aktif</Text>
              <Text style={styles.emptyOrdersSub}>
                Pesan aneka menu lezat di Kantin Koperasi BIT sebelum kehabisan!
              </Text>
              <TouchableOpacity
                style={styles.emptyOrderStartBtn}
                onPress={() => setActiveTab('menu')}
                activeOpacity={0.85}
              >
                <AppIcon name="plus" size={16} color="#ffffff" />
                <Text style={styles.emptyOrderStartBtnText}>Pilih Menu Sekarang</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* 6. Modal Checkout Kantin */}
      <Modal
        visible={isCheckoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Rincian Pesanan Kantin</Text>
                <Text style={styles.modalHeaderSub}>Koperasi Karyawan PT Bakti Idola Tama</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCheckoutModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.modalSectionLabel}>RINGKASAN MENU</Text>
              <View style={styles.orderItemList}>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = mockKantinMenu.find((m) => m.id === id);
                  if (!item) return null;
                  const img = item.imageKey ? foodImages[item.imageKey] : null;

                  return (
                    <View key={id} style={styles.orderItemRow}>
                      {img ? (
                        <Image source={img} style={styles.orderItemThumb} resizeMode="cover" />
                      ) : (
                        <View style={styles.orderedItemPlaceholderThumb}>
                          <AppIcon name="food" size={14} color="#16a34a" />
                        </View>
                      )}
                      <View style={styles.orderItemDetails}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <Text style={styles.orderItemPrice}>
                          {qty} Porsi x Rp {formatRupiah(item.price)}
                        </Text>
                      </View>
                      <Text style={styles.orderItemSubtotal}>
                        Rp {formatRupiah(item.price * qty)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.modalSectionLabel}>CATATAN TAMBAHAN (OPSIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Contoh: Jangan terlalu pedas / nasi banyakin..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
                maxLength={100}
              />

              <View style={styles.paymentInfoBanner}>
                <AppIcon name="info" size={14} color="#1d72db" />
                <Text style={styles.paymentInfoBannerText}>
                  Pembayaran akan diproses via Mitra Pihak Ke-3 saat pengambilan di Loket Kantin PT BIT. Saldo simpanan koperasi tidak terpotong.
                </Text>
              </View>

              <View style={styles.modalTotalSummary}>
                <View style={styles.totalSummaryRow}>
                  <Text style={styles.totalSummaryLabel}>Total Tagihan:</Text>
                  <Text style={styles.totalSummaryVal}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCheckoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmPayment}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmBtnText}>
                  Konfirmasi Pesanan (Rp {formatRupiah(totalPrice)})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Modal Konfirmasi Pengambilan & Pembayaran */}
      <Modal
        visible={isConfirmPickupModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConfirmPickupModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            <View style={styles.confirmModalIconCircle}>
              <AppIcon name="check-circle" size={32} color="#16a34a" />
            </View>
            <Text style={styles.confirmModalTitle}>Konfirmasi Pengambilan</Text>
            <Text style={styles.confirmModalSub}>
              Pastikan Anda sudah menerima pesanan dan melakukan pembayaran ke kasir loket pihak ke-3.
            </Text>

            {selectedOrderToComplete && (
              <View style={styles.confirmOrderSummaryBox}>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Nomor Antrian:</Text>
                  <Text style={styles.confirmSummaryTicket}>{selectedOrderToComplete.ticketNo}</Text>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Jumlah Menu:</Text>
                  <Text style={styles.confirmSummaryVal}>{selectedOrderToComplete.itemsCount} Porsi</Text>
                </View>
                <View style={styles.confirmSummaryDivider} />
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryTotalLabel}>Total Tagihan:</Text>
                  <Text style={styles.confirmSummaryTotalAmount}>
                    Rp {formatRupiah(selectedOrderToComplete.totalAmount)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.confirmModalBtnRow}>
              <TouchableOpacity
                style={styles.confirmModalCancelBtn}
                onPress={() => setIsConfirmPickupModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmModalCancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalExecuteBtn}
                onPress={handleExecuteCompleteOrder}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmModalExecuteBtnText}>Ya, Sudah Bayar & Ambil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. Modal Sukses Pesanan Selesai & Masuk Riwayat */}
      <Modal
        visible={isCompletedSuccessModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCompletedSuccessModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.successCompletedCard}>
            <View style={styles.successBadgeCircle}>
              <AppIcon name="check" size={34} color="#ffffff" />
            </View>
            <Text style={styles.successCompletedTitle}>Pesanan Selesai! 🎉</Text>
            <Text style={styles.successCompletedSub}>
              Pesanan telah berhasil diambil dan dibayar. Transaksi telah otomatis tercatat di halaman Riwayat Pemesanan.
            </Text>

            {lastCompletedOrder && (
              <View style={styles.successReceiptBriefBox}>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Kode Tiket:</Text>
                  <Text style={styles.confirmSummaryTicket}>{lastCompletedOrder.ticketNo}</Text>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Total Bayar:</Text>
                  <Text style={styles.confirmSummaryTotalAmount}>
                    Rp {formatRupiah(lastCompletedOrder.totalAmount)}
                  </Text>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Status:</Text>
                  <Text style={styles.orderPaymentMetaBadgeSuccess}>Sudah Dibayar (Lunas)</Text>
                </View>
              </View>
            )}

            <View style={styles.successActionStack}>
              {onNavigateRiwayat && (
                <TouchableOpacity
                  style={styles.viewRiwayatBtn}
                  onPress={() => {
                    setIsCompletedSuccessModalVisible(false);
                    onNavigateRiwayat();
                  }}
                  activeOpacity={0.85}
                >
                  <AppIcon name="receipt" size={16} color="#ffffff" />
                  <Text style={styles.viewRiwayatBtnText}>Lihat di Riwayat Pemesanan</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeSuccessBtn}
                onPress={() => setIsCompletedSuccessModalVisible(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.closeSuccessBtnText}>Tetap di Kantin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNavBar: {
    backgroundColor: '#16a34a',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topNavHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  screenNavTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  screenNavTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 6,
  },
  screenNavTabItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  screenNavTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dcfce7',
  },
  screenNavTabTextActive: {
    color: '#16a34a',
    fontWeight: '800',
  },
  tabBadgeCounter: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeCounterText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCenter: {
    alignItems: 'center',
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 16.5,
    fontWeight: '800',
  },
  topNavSub: {
    color: '#dcfce7',
    fontSize: 10.5,
    marginTop: 1,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  compactBalanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  balanceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  balanceVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  standBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  standBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  categoryTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  categoryTab: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 100,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  foodContent: {
    padding: 10,
  },
  foodTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
    height: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  foodPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  originalPrice: {
    fontSize: 9.5,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  pilihBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  pilihBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
    padding: 2,
  },
  stepperBtnMinus: {
    width: 26,
    height: 26,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnMinusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  stepperValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  stepperBtnPlus: {
    width: 26,
    height: 26,
    backgroundColor: '#16a34a',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPlusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartBarInfo: {
    flex: 1,
  },
  cartBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cartCountPill: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  cartCountPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  cartShiftText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  cartTotalPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  cartCheckoutBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cartCheckoutBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  checkoutModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalHeaderSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 380,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  orderItemList: {
    gap: 6,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  orderItemPrice: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  orderItemSubtotal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16a34a',
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    color: '#0f172a',
  },
  paymentInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 8,
  },
  paymentInfoBannerText: {
    flex: 1,
    fontSize: 9.5,
    color: '#1d72db',
    lineHeight: 13,
  },
  paymentListContainer: {
    gap: 6,
  },
  paymentOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentOptionItemActive: {
    borderColor: '#1d72db',
    backgroundColor: '#f0f7ff',
  },
  payOptionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  payOptionSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#1d72db',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db',
  },
  modalTotalSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSummaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  totalSummaryVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16a34a',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  modalConfirmBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  successTicketCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  ticketSuccessIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ticketSuccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  ticketSuccessSub: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  ticketReceiptBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketNumberLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  ticketNumberVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 2,
  },
  ticketStandText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  ticketSectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ticketItemsList: {
    marginBottom: 6,
  },
  ticketItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  ticketItemName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  ticketItemSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  ticketItemSubtotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketNotesBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  ticketNotesLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  ticketNotesVal: {
    fontSize: 9.5,
    color: '#334155',
    fontStyle: 'italic',
    flex: 1,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketLabel: {
    fontSize: 10.5,
    color: '#64748b',
  },
  ticketVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  ticketValGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  ticketValBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeOrderNotifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  activeOrderNotifyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  notifyPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  activeOrderNotifyText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
  },
  activeOrderNotifyLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
    marginLeft: 6,
  },
  ordersScrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  ordersListSection: {
    marginBottom: 16,
  },
  ordersSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  orderTicketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  orderTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderTicketNoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  orderTicketNoVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 2,
  },
  orderTicketStand: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  orderStatusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  orderStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  orderTicketDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  orderItemsHeading: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  orderItemsStack: {
    gap: 8,
  },
  orderedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderedItemThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  orderedItemPlaceholderThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderedItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  orderedItemSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  orderedItemSubtotal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  orderNotesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  orderNotesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  orderNotesVal: {
    fontSize: 10,
    color: '#334155',
    fontStyle: 'italic',
    flex: 1,
  },
  orderSummaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderMetaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  orderMetaVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  orderStatusBadgeSuccess: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  orderStatusBadgeTextSuccess: {
    color: '#15803d',
  },
  orderPaymentMetaBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderPaymentMetaBadgePending: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#fde68a',
  },
  orderPaymentMetaBadgeSuccess: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#bbf7d0',
  },
  orderTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  orderTotalAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 4,
  },
  loketInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginTop: 10,
  },
  loketInfoText: {
    flex: 1,
    fontSize: 10,
    color: '#15803d',
    lineHeight: 14,
  },
  loketInfoPendingText: {
    flex: 1,
    fontSize: 10,
    color: '#92400e',
    lineHeight: 14,
    fontWeight: '500',
  },
  confirmPickupPayBtn: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmPickupPayBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  orderCompletedNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  orderCompletedNoteText: {
    fontSize: 10.5,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  addOrderActionWrap: {
    marginTop: 6,
    marginBottom: 30,
  },
  addOrderPrimaryBtn: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  addOrderPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyOrdersIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyOrdersTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyOrdersSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  emptyOrderStartBtn: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  emptyOrderStartBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmModalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  confirmModalSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  confirmOrderSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
    gap: 6,
  },
  confirmSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmSummaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  confirmSummaryTicket: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  confirmSummaryVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  confirmSummaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  confirmSummaryTotalLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  confirmSummaryTotalAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
  },
  confirmModalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmModalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmModalExecuteBtn: {
    flex: 1.6,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmModalExecuteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  successCompletedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  successBadgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  successCompletedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  successCompletedSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
    marginBottom: 16,
  },
  successReceiptBriefBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20,
    gap: 6,
  },
  successActionStack: {
    width: '100%',
    gap: 8,
  },
  viewRiwayatBtn: {
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  viewRiwayatBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  closeSuccessBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSuccessBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
});
