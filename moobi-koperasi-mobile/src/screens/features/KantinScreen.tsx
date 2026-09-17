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
}

export const KantinScreen: React.FC<KantinScreenProps> = ({
  onBack,
  userBalance = mockWallet.simpananSukarela,
  onOrderSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<string>('');

  // Modal States
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState<boolean>(false);
  const [isSuccessTicketVisible, setIsSuccessTicketVisible] = useState<boolean>(false);
  const [completedOrderTicket, setCompletedOrderTicket] = useState<{
    ticketNo: string;
    itemsCount: number;
    totalAmount: number;
    paymentSource: string;
    canteenStand: string;
  } | null>(null);

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
    if (userBalance < totalPrice) {
      Alert.alert(
        'Simpanan Sukarela Tidak Cukup',
        `Saldo Simpanan Sukarela Koperasi Anda (Rp ${formatRupiah(
          userBalance
        )}) tidak cukup untuk membayar pesanan sebesar Rp ${formatRupiah(
          totalPrice
        )}. Silakan lakukan Setor Simpanan Sukarela terlebih dahulu.`
      );
      return;
    }

    const ticketNo = `BIT-KTN-#${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsSummary = Object.entries(cart)
      .map(([id, qty]) => {
        const item = mockKantinMenu.find((m) => m.id === id);
        return item ? `${qty}x ${item.name}` : '';
      })
      .filter(Boolean)
      .join(', ');

    if (onOrderSuccess) {
      onOrderSuccess(totalPrice, totalItems, itemsSummary);
    }

    setCompletedOrderTicket({
      ticketNo,
      itemsCount: totalItems,
      totalAmount: totalPrice,
      paymentSource: 'Simpanan Sukarela Koperasi',
      canteenStand: 'Loket Kantin Gedung A - PT BIT',
    });

    setIsCheckoutModalVisible(false);
    setIsSuccessTicketVisible(true);
    setCart({});
    setNotes('');
  };

  return (
    <View style={styles.screenContainer}>
      {/* 1. Top Bar Navigation */}
      <View style={styles.topNavBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevron-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>Kantin Koperasi BIT</Text>
          <Text style={styles.topNavSub}>Pre-Order Praktis • Tanpa Antre</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
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
                      <Text style={styles.originalPrice}>Rp {formatRupiah(item.originalPrice)}</Text>
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

      {/* 6. Checkout Modal */}
      <Modal
        visible={isCheckoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Rincian Pesanan Kantin</Text>
                <Text style={styles.modalHeaderSub}>Pengambilan Loket Kantin PT BIT</Text>
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
              <Text style={styles.modalSectionLabel}>DAFTAR MENU</Text>
              <View style={styles.orderItemList}>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = mockKantinMenu.find((m) => m.id === id);
                  if (!item) return null;
                  const itemTotal = item.price * qty;
                  const imageSource = foodImages[item.imageKey];

                  return (
                    <View key={id} style={styles.orderItemRow}>
                      {imageSource && (
                        <Image source={imageSource} style={styles.orderItemThumb} resizeMode="cover" />
                      )}
                      <View style={styles.orderItemDetails}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <Text style={styles.orderItemPrice}>
                          Rp {formatRupiah(item.price)} x {qty}
                        </Text>
                      </View>
                      <Text style={styles.orderItemSubtotal}>Rp {formatRupiah(itemTotal)}</Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.modalSectionLabel}>CATATAN PESANAN</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Contoh: Sambal dipisah, es sedikit..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />

              <Text style={styles.modalSectionLabel}>METODE PEMBAYARAN</Text>
              <View style={styles.paymentMethodCard}>
                <View style={styles.payIconBox}>
                  <AppIcon name="wallet" size={16} color="#1d72db" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>Simpanan Sukarela Anggota</Text>
                  <Text style={styles.paySub}>
                    Saldo: Rp {formatRupiah(userBalance)} • Potong Langsung
                  </Text>
                </View>
                <View style={styles.payCheckDot} />
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
                  Bayar (Rp {formatRupiah(totalPrice)})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Success Ticket Modal */}
      <Modal
        visible={isSuccessTicketVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSuccessTicketVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successTicketCard}>
            <View style={styles.ticketSuccessIcon}>
              <AppIcon name="check" size={28} color="#ffffff" />
            </View>

            <Text style={styles.ticketSuccessTitle}>Pesanan Kantin Berhasil! 🎉</Text>
            <Text style={styles.ticketSuccessSub}>
              Tunjukkan nomor pesanan ini ke loket kantin PT BIT saat pengambilan.
            </Text>

            {completedOrderTicket && (
              <View style={styles.ticketReceiptBox}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketNumberLabel}>NOMOR ANTRIAN LOKET</Text>
                  <Text style={styles.ticketNumberVal}>{completedOrderTicket.ticketNo}</Text>
                </View>

                <View style={styles.ticketDivider} />

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Total Menu</Text>
                  <Text style={styles.ticketVal}>{completedOrderTicket.itemsCount} Porsi</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Total Dibayar</Text>
                  <Text style={styles.ticketValGreen}>
                    Rp {formatRupiah(completedOrderTicket.totalAmount)}
                  </Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Sumber Dana</Text>
                  <Text style={styles.ticketVal}>{completedOrderTicket.paymentSource}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.ticketCloseBtn}
              onPress={() => setIsSuccessTicketVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.ticketCloseBtnText}>Selesai & Tutup</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16a34a',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
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
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
  },
  payIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  paySub: {
    fontSize: 9.5,
    color: '#1d72db',
    marginTop: 1,
  },
  payCheckDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  ticketDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 6,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
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
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16a34a',
  },
  ticketCloseBtn: {
    width: '100%',
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  ticketCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
