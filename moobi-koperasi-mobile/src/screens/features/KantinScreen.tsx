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
import { mockKantinMenu } from '../../data/mockData';
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
  userBalance: number;
  onOrderSuccess?: (totalPrice: number, itemsCount: number, itemsSummary: string) => void;
}

export const KantinScreen: React.FC<KantinScreenProps> = ({
  onBack,
  userBalance,
  onOrderSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<string>('');

  // Modal States for Order Flow
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState<boolean>(false);
  const [isSuccessTicketVisible, setIsSuccessTicketVisible] = useState<boolean>(false);
  const [completedOrderTicket, setCompletedOrderTicket] = useState<{
    ticketNo: string;
    itemsCount: number;
    totalAmount: number;
    paymentSource: string;
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
        'Saldo Utama Tidak Mencukupi',
        `Saldo Utama Koperasi Anda (Rp ${formatRupiah(
          userBalance
        )}) tidak cukup untuk membayar pesanan sebesar Rp ${formatRupiah(
          totalPrice
        )}. Silakan lakukan Top Up terlebih dahulu.`
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
      paymentSource: 'Saldo Utama Moobi Koperasi (Cashless)',
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
          <Text style={styles.topNavTitle}>Pre-Order Kantin BIT</Text>
          <Text style={styles.topNavSub}>Pesan Praktis • 1 Dompet Terintegrasi</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* 2. Hero Wallet Balance Card (Sesuai Gambar 2) */}
        <View style={styles.heroBalanceCard}>
          <View style={styles.heroGlowCircle} />
          <View style={styles.heroBalanceTop}>
            <View style={styles.heroLabelWrap}>
              <AppIcon name="wallet" size={15} color="#38bdf8" />
              <Text style={styles.heroBalanceLabel}>Sumber Dana: Saldo Koperasi</Text>
            </View>
          </View>

          <View style={styles.heroBalanceMain}>
            <Text style={styles.heroCurrency}>Rp</Text>
            <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
          </View>

          <View style={styles.heroFooter}>
            <Text style={styles.heroSubText}>
              Bisa bayar langsung via Saldo Koperasi atau Potong Gaji Payroll
            </Text>
          </View>
        </View>

        {/* 3. Category Filter Tabs */}
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

        {/* 4. Menu Grid (Matching User Screenshot) */}
        <View style={styles.menuGrid}>
          {filteredMenu.map((item: KantinMenuItem) => {
            const count = cart[item.id] || 0;
            const currentStock = Math.max(0, item.stock - count);
            const imageSource = foodImages[item.imageKey];

            return (
              <View key={item.id} style={styles.foodCard}>
                {/* Image Container with Stock Pill */}
                <View style={styles.imageContainer}>
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={styles.foodImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <AppIcon name="food" size={28} color="#94a3b8" />
                    </View>
                  )}
                  {/* Stock Badge on Top Right */}
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>Stok: {currentStock}</Text>
                  </View>
                </View>

                {/* Content */}
                <View style={styles.foodContent}>
                  <Text style={styles.foodTitle} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {/* Price Row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.foodPrice}>
                      Rp {formatRupiah(item.price)}
                    </Text>
                    {item.originalPrice && (
                      <Text style={styles.originalPrice}>
                        Rp {formatRupiah(item.originalPrice)}
                      </Text>
                    )}
                  </View>

                  {/* Action Button: + Pilih or Stepper */}
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
                      <Text style={styles.pilihBtnText}>+ Pilih</Text>
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

      {/* 6. Checkout & Payment Modal (Alur Pemesanan Terintegrasi Saldo Utama) */}
      <Modal
        visible={isCheckoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Rincian Pre-Order Kantin</Text>
                <Text style={styles.modalHeaderSub}>
                  Pengambilan Tanpa Antre • Kantin PT BIT
                </Text>
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
              {/* Order Items List */}
              <Text style={styles.modalSectionLabel}>MENU YANG DIPESAN</Text>
              <View style={styles.orderItemList}>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = mockKantinMenu.find((m) => m.id === id);
                  if (!item) return null;
                  const itemTotal = item.price * qty;
                  const imageSource = foodImages[item.imageKey];

                  return (
                    <View key={id} style={styles.orderItemRow}>
                      {imageSource && (
                        <Image
                          source={imageSource}
                          style={styles.orderItemThumb}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.orderItemDetails}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <Text style={styles.orderItemPrice}>
                          Rp {formatRupiah(item.price)} x {qty}
                        </Text>
                      </View>
                      <View style={styles.orderItemStepper}>
                        <TouchableOpacity
                          style={styles.modalStepBtn}
                          onPress={() => handleRemoveFromCart(id)}
                        >
                          <Text style={styles.modalStepBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalStepQty}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.modalStepBtn}
                          onPress={() => handleAddToCart(id)}
                        >
                          <Text style={styles.modalStepBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.orderItemSubtotal}>
                        Rp {formatRupiah(itemTotal)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Catatan untuk Dapur */}
              <Text style={styles.modalSectionLabel}>CATATAN KHUSUS (OPSIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Contoh: Sambal dipisah, kuah banyak, es sedikit..."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />

              {/* Sumber Pembayaran Terintegrasi 1 Saldo Utama */}
              <Text style={styles.modalSectionLabel}>SUMBER PEMBAYARAN</Text>
              <View style={styles.paymentMethodsList}>
                <View style={styles.paymentOptionCardActive}>
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.payIconBox}>
                      <AppIcon name="wallet" size={18} color="#1d72db" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payOptionTitle}>Saldo Utama Koperasi</Text>
                      <Text style={styles.payOptionBalance}>
                        Sisa: Rp {formatRupiah(userBalance)} (1 Dompet Terintegrasi)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.payRadioActive}>
                    <View style={styles.payRadioDot} />
                  </View>
                </View>
              </View>

              {/* Total & Summary Ticket */}
              <View style={styles.checkoutSummaryCard}>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineLabel}>Total ({totalItems} Menu)</Text>
                  <Text style={styles.summaryLineVal}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineLabel}>Biaya Layanan & Kemasan</Text>
                  <Text style={styles.summaryLineValFree}>GRATIS (Rp 0)</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryTotalRow}>
                  <Text style={styles.summaryTotalLabel}>TOTAL PEMBAYARAN</Text>
                  <Text style={styles.summaryTotalVal}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.modalFooterAction}>
              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleConfirmPayment}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmPayBtnText}>
                  Konfirmasi & Bayar Rp {formatRupiah(totalPrice)} ›
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. E-Tiket Digital Pre-Order Modal (Kupon Pengambilan) */}
      <Modal
        visible={isSuccessTicketVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSuccessTicketVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ticketModalCard}>
            {/* Header Success */}
            <View style={styles.ticketSuccessHeader}>
              <View style={styles.ticketCheckCircle}>
                <AppIcon name="check-circle" size={32} color="#1d72db" />
              </View>
              <Text style={styles.ticketSuccessTitle}>Pre-Order Berhasil Dibuat!</Text>
              <Text style={styles.ticketSuccessSub}>
                Dapur kantin telah menerima pesanan Anda
              </Text>
            </View>

            {/* E-Tiket Body */}
            {completedOrderTicket && (
              <View style={styles.eTiketBox}>
                <View style={styles.eTiketTop}>
                  <View>
                    <Text style={styles.eTiketLabel}>KODE AMBIL KANTIN</Text>
                    <Text style={styles.eTiketCode}>{completedOrderTicket.ticketNo}</Text>
                  </View>
                  <View style={styles.shiftBadge}>
                    <Text style={styles.shiftBadgeText}>Kantin BIT</Text>
                  </View>
                </View>

                {/* Visual Barcode Pattern */}
                <View style={styles.barcodeWrapper}>
                  <View style={styles.barcodeLines}>
                    {[...Array(26)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.barcodeBar,
                          {
                            width: (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1),
                            marginRight: (i % 4 === 0 ? 3 : 2),
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.barcodeNumber}>
                    {completedOrderTicket.ticketNo.replace('#', '')}-BIT
                  </Text>
                </View>

                <View style={styles.ticketDottedDivider} />

                {/* Ticket Details */}
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketRowLabel}>Jumlah Menu:</Text>
                  <Text style={styles.ticketRowVal}>
                    {completedOrderTicket.itemsCount} Porsi
                  </Text>
                </View>

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketRowLabel}>Total Terbayar:</Text>
                  <Text style={styles.ticketRowValGreen}>
                    Rp {formatRupiah(completedOrderTicket.totalAmount)}
                  </Text>
                </View>

                <View style={styles.ticketRow}>
                  <Text style={styles.ticketRowLabel}>Metode Bayar:</Text>
                  <Text style={styles.ticketRowVal}>
                    {completedOrderTicket.paymentSource}
                  </Text>
                </View>

                <View style={styles.ticketNoticeBox}>
                  <AppIcon name="food" size={14} color="#1d72db" />
                  <Text style={styles.ticketNoticeText}>
                    Tunjukkan tiket ini di stand kantin saat jam istirahat untuk mengambil makanan langsung tanpa antre.
                  </Text>
                </View>
              </View>
            )}

            {/* Selesai Button */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setIsSuccessTicketVisible(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Selesai & Kembali ke Menu</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCenter: {
    alignItems: 'center',
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  topNavSub: {
    color: '#dbeafe',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollBody: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 110,
  },
  heroBalanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(2, 132, 199, 0.35)',
  },
  heroBalanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBalanceLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  heroBalanceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  heroCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#38bdf8',
  },
  heroBalanceAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroFooter: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroSubText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
  },
  categoryTabActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTabTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  foodCard: {
    width: '48.2%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 2,
  },
  imageContainer: {
    width: '100%',
    height: 110,
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
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '700',
  },
  foodContent: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  foodTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 16,
    minHeight: 32,
    letterSpacing: -0.1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  foodPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d72db',
  },
  originalPrice: {
    fontSize: 10,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  pilihBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
  },
  pilihBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#cbd5e1',
    padding: 2,
  },
  stepperBtnMinus: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepperBtnMinusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
    lineHeight: 18,
  },
  stepperValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  stepperBtnPlus: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPlusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 18,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
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
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  cartCountPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
  },
  cartShiftText: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },
  cartTotalPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: -0.3,
  },
  cartCheckoutBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  cartCheckoutBtnText: {
    fontSize: 13,
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
    maxHeight: '88%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalSectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  orderItemList: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 8,
  },
  orderItemDetails: {
    flex: 1,
    marginRight: 6,
  },
  orderItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  orderItemPrice: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  orderItemStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
  },
  modalStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modalStepBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalStepQty: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 4,
  },
  orderItemSubtotal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d72db',
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 14,
  },
  paymentMethodsList: {
    gap: 8,
    marginBottom: 14,
  },
  paymentOptionCardActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#1d72db',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  payIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  payOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  payOptionBalance: {
    fontSize: 11,
    color: '#1d72db',
    fontWeight: '600',
    marginTop: 1,
  },
  payRadioActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1d72db',
  },
  checkoutSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLineLabel: {
    fontSize: 11.5,
    color: '#64748b',
  },
  summaryLineVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  summaryLineValFree: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 6,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryTotalVal: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  modalFooterAction: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  confirmPayBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmPayBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  ticketModalCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 18,
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  ticketSuccessHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketCheckCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  ticketSuccessTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketSuccessSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  eTiketBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  eTiketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eTiketLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  eTiketCode: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: -0.2,
  },
  shiftBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  shiftBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  barcodeWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  barcodeLines: {
    flexDirection: 'row',
    height: 36,
    alignItems: 'center',
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: '#0f172a',
  },
  barcodeNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    letterSpacing: 2,
  },
  ticketDottedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ticketRowLabel: {
    fontSize: 11.5,
    color: '#64748b',
  },
  ticketRowVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  ticketRowValGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d72db',
  },
  ticketNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  ticketNoticeText: {
    fontSize: 9.5,
    color: '#1e40af',
    fontWeight: '500',
    flex: 1,
    lineHeight: 13,
  },
  doneBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
