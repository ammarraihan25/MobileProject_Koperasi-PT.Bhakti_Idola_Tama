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
import { mockElektronikProducts } from '../../data/mockElektronik';
import { ElektronikProductItem } from '../../types';

interface ProdukElektronikScreenProps {
  onBack: () => void;
  userBalance: number;
  onPurchaseSuccess?: (
    totalPrice: number,
    itemsCount: number,
    paymentMethod: string,
    itemsSummary: string
  ) => void;
  onNavigateRiwayat?: () => void;
}

interface ElektronikOrderRecord {
  id: string;
  ticketNo: string;
  itemsCount: number;
  totalAmount: number;
  paymentSource: string;
  pickupLocName: string;
  timestamp: string;
  notes?: string;
  itemsList: { name: string; brand?: string; qty: number; price: number }[];
  status: 'menunggu_pembayaran' | 'selesai';
}

export const ProdukElektronikScreen: React.FC<ProdukElektronikScreenProps> = ({
  onBack,
  userBalance,
  onPurchaseSuccess,
  onNavigateRiwayat,
}) => {
  const [activeTab, setActiveTab] = useState<'katalog' | 'orders'>('katalog');
  const [ordersList, setOrdersList] = useState<ElektronikOrderRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBrand, setSelectedBrand] = useState<string>('Semua');
  const [isBrandModalVisible, setIsBrandModalVisible] = useState<boolean>(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState<boolean>(false);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<string>('');

  // Checkout Flow States
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState<boolean>(false);
  const [pickupLocation, setPickupLocation] = useState<'gedung_a' | 'gedung_b'>('gedung_a');
  const [selectedOrderToComplete, setSelectedOrderToComplete] = useState<ElektronikOrderRecord | null>(null);
  const [isConfirmPickupModalVisible, setIsConfirmPickupModalVisible] = useState<boolean>(false);
  const [isCompletedSuccessModalVisible, setIsCompletedSuccessModalVisible] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<ElektronikOrderRecord | null>(null);

  const categories: { key: string; label: string }[] = [
    { key: 'Semua', label: 'Semua Kategori' },
    { key: 'dapur', label: 'Peralatan Dapur' },
    { key: 'living', label: 'Living & Rumah' },
    { key: 'cooling', label: 'Pendingin & Kipas' },
  ];

  const brands: { key: string; label: string; tag: string }[] = [
    { key: 'Semua', label: 'Semua Merk', tag: 'ALL' },
    { key: 'Miyako', label: 'Miyako', tag: 'MIYAKO' },
    { key: 'Rinnai', label: 'Rinnai', tag: 'RINNAI' },
    { key: 'Shimizu', label: 'Shimizu', tag: 'SHIMIZU' },
  ];

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
    const item = mockElektronikProducts.find((m) => m.id === id);
    return sum + (item ? item.price * count : 0);
  }, 0);

  const filteredProducts = mockElektronikProducts.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.specs.toLowerCase().includes(q) ||
      item.warranty.toLowerCase().includes(q);

    const matchCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;

    const matchBrand =
      selectedBrand === 'Semua' || item.brand.toLowerCase() === selectedBrand.toLowerCase();

    return matchSearch && matchCategory && matchBrand;
  });

  const handleOpenCheckout = () => {
    if (totalItems === 0) {
      Alert.alert('Keranjang Kosong', 'Silakan pilih produk elektronik terlebih dahulu.');
      return;
    }
    setIsCheckoutModalVisible(true);
  };

  const handleConfirmPayment = () => {
    const ticketNo = `BIT-ELX-#${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const itemsSummaryList = Object.entries(cart).map(([id, qty]) => {
      const p = mockElektronikProducts.find((item) => item.id === id);
      return {
        name: p ? p.name : 'Produk BIT',
        brand: p ? p.brand : '',
        qty,
        price: p ? p.price : 0,
      };
    });

    const paymentLabel = 'Pembayaran Pihak Ke-3';

    const locLabel =
      pickupLocation === 'gedung_a'
        ? 'Loket Koperasi Pabrik Gedung A (Depan HRD)'
        : 'Loket Koperasi Pabrik Gedung B (Area Produksi)';

    const newOrder: ElektronikOrderRecord = {
      id: `ELX-${Date.now()}`,
      ticketNo,
      itemsCount: totalItems,
      totalAmount: totalPrice,
      paymentSource: paymentLabel,
      pickupLocName: locLabel,
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

  const handleOpenCompleteOrderModal = (order: ElektronikOrderRecord) => {
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

    const summaryText = target.itemsList.map((i) => `${i.qty}x ${i.name}`).join(', ');
    if (onPurchaseSuccess) {
      onPurchaseSuccess(target.totalAmount, target.itemsCount, 'Pembayaran Pihak Ke-3', summaryText);
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
            <Text style={styles.topNavTitle}>Katalog Produk Elektronik</Text>
            <Text style={styles.topNavSub}>Produk Resmi Miyako, Rinnai, Shimizu • PT BIT</Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenCheckout}
            style={styles.cartIconBtn}
            activeOpacity={0.75}
          >
            <AppIcon name="shopping-bag" size={18} color="#ffffff" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Switcher: Katalog vs Pesanan Saya */}
        <View style={styles.screenNavTabs}>
          <TouchableOpacity
            style={[styles.screenNavTabItem, activeTab === 'katalog' && styles.screenNavTabItemActive]}
            onPress={() => setActiveTab('katalog')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.screenNavTabText,
                activeTab === 'katalog' && styles.screenNavTabTextActive,
              ]}
            >
              Katalog Produk
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
      {/* TAB 1: KATALOG PRODUK ELEKTRONIK */}
      {/* ============================================================ */}
      {activeTab === 'katalog' ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Banner info pesanan aktif jika ada pesanan */}
            {ordersList.length > 0 && (
              <TouchableOpacity
                style={styles.activeOrderNotifyBanner}
                onPress={() => setActiveTab('orders')}
                activeOpacity={0.85}
              >
                <View style={styles.activeOrderNotifyLeft}>
                  <View style={styles.notifyPulseDot} />
                  <Text style={styles.activeOrderNotifyText}>
                    Kamu memiliki <Text style={{ fontWeight: '800' }}>{ordersList.length} pesanan barang aktif</Text> di loket koperasi.
                  </Text>
                </View>
                <Text style={styles.activeOrderNotifyLink}>Lihat Pesanan ›</Text>
              </TouchableOpacity>
            )}

            {/* 2. Integrated Search & Filter Section */}
            <View style={styles.searchFilterContainer}>
              {/* Search Input Box */}
              <View style={styles.searchBar}>
                <AppIcon name="search" size={17} color="#64748b" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari produk (Miyako, Rinnai, Blender...)"
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery !== '' && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.searchClearBtn}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="x" size={13} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dual Dropdown Filter Buttons */}
              <View style={styles.filterDropdownRow}>
                {/* Filter Merk */}
                <TouchableOpacity
                  style={[
                    styles.filterDropdownBtn,
                    selectedBrand !== 'Semua' && styles.filterDropdownBtnActive,
                  ]}
                  onPress={() => setIsBrandModalVisible(true)}
                  activeOpacity={0.75}
                >
                  <View style={styles.filterDropdownLeft}>
                    <Text style={styles.filterDropdownPrefix}>Merk:</Text>
                    <Text
                      style={[
                        styles.filterDropdownValue,
                        selectedBrand !== 'Semua' && styles.filterDropdownValueActive,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedBrand === 'Semua' ? 'Semua Merk' : selectedBrand}
                    </Text>
                  </View>
                  <AppIcon
                    name="chevron-down"
                    size={13}
                    color={selectedBrand !== 'Semua' ? '#1d72db' : '#64748b'}
                  />
                </TouchableOpacity>

                {/* Filter Kategori Produk */}
                <TouchableOpacity
                  style={[
                    styles.filterDropdownBtn,
                    selectedCategory !== 'Semua' && styles.filterDropdownBtnActive,
                  ]}
                  onPress={() => setIsCategoryModalVisible(true)}
                  activeOpacity={0.75}
                >
                  <View style={styles.filterDropdownLeft}>
                    <Text style={styles.filterDropdownPrefix}>Kategori:</Text>
                    <Text
                      style={[
                        styles.filterDropdownValue,
                        selectedCategory !== 'Semua' && styles.filterDropdownValueActive,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedCategory === 'Semua'
                        ? 'Semua Kategori'
                        : categories.find((c) => c.key === selectedCategory)?.label || selectedCategory}
                    </Text>
                  </View>
                  <AppIcon
                    name="chevron-down"
                    size={13}
                    color={selectedCategory !== 'Semua' ? '#1d72db' : '#64748b'}
                  />
                </TouchableOpacity>
              </View>

              {/* Active Filter Chips */}
              {(selectedCategory !== 'Semua' || selectedBrand !== 'Semua' || searchQuery !== '') && (
                <View style={styles.activeFiltersRow}>
                  {selectedBrand !== 'Semua' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterChipText}>Merk: {selectedBrand}</Text>
                      <TouchableOpacity onPress={() => setSelectedBrand('Semua')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <AppIcon name="x" size={11} color="#1d72db" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {selectedCategory !== 'Semua' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterChipText}>
                        Kategori: {categories.find((c) => c.key === selectedCategory)?.label}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedCategory('Semua')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <AppIcon name="x" size={11} color="#1d72db" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {searchQuery !== '' && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterChipText}>"{searchQuery}"</Text>
                      <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <AppIcon name="x" size={11} color="#1d72db" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedBrand('Semua');
                      setSelectedCategory('Semua');
                      setSearchQuery('');
                    }}
                    style={styles.resetFilterBtn}
                  >
                    <Text style={styles.resetFilterText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 3. Category Horizontal Pills Selector */}
            <View style={styles.categoryPillsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsScroll}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive,
                      ]}
                      onPress={() => setSelectedCategory(cat.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. Official Warranty Banner PT BIT */}
            <View style={styles.warrantyBanner}>
              <View style={styles.warrantyIconBox}>
                <AppIcon name="check-circle" size={18} color="#16a34a" />
              </View>
              <View style={styles.warrantyTextGroup}>
                <Text style={styles.warrantyTitle}>Jaminan 100% Produk Asli & Bergaransi Resmi</Text>
                <Text style={styles.warrantySub}>
                  Pengambilan langsung di Loket Koperasi Pabrik PT Bakti Idola Tama
                </Text>
              </View>
            </View>

            {/* Active Orders Banner if any */}
            {ordersList.length > 0 && (
              <TouchableOpacity
                style={styles.activeOrderNotifyBanner}
                onPress={() => setActiveTab('orders')}
                activeOpacity={0.85}
              >
                <View style={styles.activeOrderNotifyLeft}>
                  <View style={styles.notifyPulseDot} />
                  <Text style={styles.activeOrderNotifyText}>
                    Anda memiliki <Text style={{ fontWeight: '800' }}>{ordersList.length} pesanan aktif</Text>
                  </Text>
                </View>
                <Text style={styles.activeOrderNotifyLink}>Lihat Pesanan ›</Text>
              </TouchableOpacity>
            )}

            {/* 6. Product Grid */}
            <View style={styles.productGrid}>
              {filteredProducts.map((item: ElektronikProductItem) => {
                const count = cart[item.id] || 0;

                return (
                  <View key={item.id} style={styles.productCard}>
                    {/* Top Badge: Brand & Diskon */}
                    <View style={styles.productCardTopBadgeRow}>
                      <View
                        style={[
                          styles.brandBadge,
                          item.brand === 'Miyako'
                            ? styles.brandBadgeMiyako
                            : item.brand === 'Rinnai'
                            ? styles.brandBadgeRinnai
                            : styles.brandBadgeShimizu,
                        ]}
                      >
                        <Text style={styles.brandBadgeText}>{item.brand.toUpperCase()}</Text>
                      </View>
                      {item.discountBadge && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>{item.discountBadge}</Text>
                        </View>
                      )}
                    </View>

                    {/* Product Image */}
                    <View style={styles.productImageContainer}>
                      <Image
                        source={item.image}
                        style={styles.productImage}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Product Info */}
                    <View style={styles.productInfoWrap}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.productSpecs} numberOfLines={1}>
                        {item.specs}
                      </Text>

                      {/* Pricing */}
                      <View style={styles.priceRow}>
                        <Text style={styles.priceFinal}>Rp {formatRupiah(item.price)}</Text>
                        {item.originalPrice && (
                          <Text style={styles.priceOriginal}>
                            Rp {formatRupiah(item.originalPrice)}
                          </Text>
                        )}
                      </View>

                      {item.cicilanPerBulan && (
                        <View style={styles.cicilanPill}>
                          <AppIcon name="wallet" size={10} color="#1d72db" />
                          <Text style={styles.cicilanPillText}>
                            Cicilan Rp {formatRupiah(item.cicilanPerBulan)}/bln
                          </Text>
                        </View>
                      )}

                      {/* Action Button: Add to Cart / Qty Stepper */}
                      <View style={styles.cardActionRow}>
                        {count > 0 ? (
                          <View style={styles.quantityControlRow}>
                            <TouchableOpacity
                              style={styles.qtyBtnMinus}
                              onPress={() => handleRemoveFromCart(item.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyNumberText}>{count}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtnPlus}
                              onPress={() => handleAddToCart(item.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.qtyBtnText, { color: '#ffffff' }]}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => handleAddToCart(item.id)}
                            activeOpacity={0.85}
                          >
                            <AppIcon name="shopping-bag" size={12} color="#ffffff" />
                            <Text style={styles.addBtnText}>+ Pesan</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Floating Sticky Cart Bar */}
          {totalItems > 0 && (
            <View style={styles.floatingCartBar}>
              <View style={styles.floatingCartLeft}>
                <View style={styles.floatingCartBadge}>
                  <Text style={styles.floatingCartBadgeText}>{totalItems} Barang</Text>
                </View>
                <View style={styles.floatingPriceRow}>
                  <Text style={styles.floatingPriceLabel}>Total:</Text>
                  <Text style={styles.floatingPriceNumber}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleOpenCheckout}
                activeOpacity={0.85}
              >
                <Text style={styles.checkoutBtnText}>Lihat Pesanan ›</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        /* ============================================================ */
        /* TAB 2: PESANAN SAYA (BARANG ELEKTRONIK YANG SUDAH DIPESAN) */
        /* ============================================================ */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersScrollBody}
        >
          {ordersList.length > 0 ? (
            <>
              <View style={styles.ordersListSection}>
                <Text style={styles.ordersSectionTitle}>PESANAN PRODUK AKTIF</Text>

                {ordersList.map((order) => (
                  <View key={order.id} style={styles.orderTicketCard}>
                    {/* Header Ticket */}
                    <View style={styles.orderTicketHeader}>
                      <View>
                        <Text style={styles.orderTicketNoLabel}>KODE PENGAMBILAN BARANG</Text>
                        <Text style={styles.orderTicketNoVal}>{order.ticketNo}</Text>
                        <Text style={styles.orderTicketStand}>{order.pickupLocName}</Text>
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
                          {order.status === 'selesai' ? '✅ Barang Diambil' : '⏳ Siap Diambil'}
                        </Text>
                      </View>
                    </View>

                    {/* Barcode Visual */}
                    <View style={styles.barcodeBox}>
                      <View style={styles.barcodeBarsRow}>
                        {[5, 2, 7, 3, 9, 4, 6, 2, 8, 5, 3, 7, 2, 6, 4, 9, 3, 5, 7].map((w, i) => (
                          <View
                            key={i}
                            style={{
                              width: w,
                              height: 32,
                              backgroundColor: '#0f172a',
                              marginHorizontal: 1.5,
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </View>
                      <Text style={styles.barcodeSub}>Scan Barcode di Loket Koperasi PT BIT</Text>
                    </View>

                    <View style={styles.orderTicketDivider} />

                    {/* Daftar Produk yang Dipesan */}
                    <Text style={styles.orderItemsHeading}>PRODUK YANG DIPESAN</Text>
                    <View style={styles.orderItemsStack}>
                      {order.itemsList.map((item, idx) => (
                        <View key={idx} style={styles.orderedItemRow}>
                          <View style={styles.orderedItemPlaceholderThumb}>
                            <AppIcon name="bolt" size={16} color="#1d72db" />
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.orderedItemName}>{item.name}</Text>
                            {item.brand ? <Text style={styles.orderedItemBrand}>{item.brand}</Text> : null}
                            <Text style={styles.orderedItemSub}>
                              {item.qty} Unit x Rp {formatRupiah(item.price)}
                            </Text>
                          </View>
                          <Text style={styles.orderedItemSubtotal}>
                            Rp {formatRupiah(item.price * item.qty)}
                          </Text>
                        </View>
                      ))}
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
                      <Text style={styles.orderTotalLabel}>Total Pembayaran:</Text>
                      <Text style={styles.orderTotalAmount}>Rp {formatRupiah(order.totalAmount)}</Text>
                    </View>

                    {/* Action Button & Info */}
                    {order.status === 'menunggu_pembayaran' ? (
                      <>
                        <View style={styles.loketInfoBox}>
                          <AppIcon name="info" size={13} color="#b45309" />
                          <Text style={styles.loketInfoPendingText}>
                            Tunjukkan kode barcode ini di Loket Koperasi. Lakukan pembayaran via pihak ke-3 saat serah terima barang.
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
                          Barang telah diambil & dibayar. Transaksi telah masuk ke halaman Riwayat.
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Tombol Buat Pesanan Baru / Tambah Produk */}
              <View style={styles.addOrderActionWrap}>
                <TouchableOpacity
                  style={styles.addOrderPrimaryBtn}
                  onPress={() => setActiveTab('katalog')}
                  activeOpacity={0.85}
                >
                  <AppIcon name="plus" size={18} color="#ffffff" />
                  <Text style={styles.addOrderPrimaryBtnText}>Pesan Produk Baru / Tambah Produk</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Empty State */
            <View style={styles.emptyOrdersContainer}>
              <View style={styles.emptyOrdersIconBox}>
                <AppIcon name="bolt" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyOrdersTitle}>Belum Ada Pesanan Elektronik</Text>
              <Text style={styles.emptyOrdersSub}>
                Pesan barang elektronik resmi Miyako, Rinnai, dan Shimizu di Koperasi PT BIT.
              </Text>
              <TouchableOpacity
                style={styles.emptyOrderStartBtn}
                onPress={() => setActiveTab('katalog')}
                activeOpacity={0.85}
              >
                <AppIcon name="plus" size={16} color="#ffffff" />
                <Text style={styles.emptyOrderStartBtnText}>Buka Katalog Produk</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* 7. Modal Alur Pembayaran (Checkout Flow) */}
      <Modal
        visible={isCheckoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Checkout Produk Elektronik</Text>
                <Text style={styles.modalSubtitle}>Koperasi Karyawan PT Bakti Idola Tama</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCheckoutModalVisible(false)}
                style={styles.closeModalBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Ringkasan Item Pesanan */}
              <Text style={styles.sectionFormTitle}>PRODUK YANG DIPESAN</Text>
              <View style={styles.itemsSummaryBox}>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = mockElektronikProducts.find((p) => p.id === id);
                  if (!item) return null;

                  return (
                    <View key={id} style={styles.itemSummaryRow}>
                      <Image source={item.image} style={styles.itemThumb} resizeMode="contain" />
                      <View style={styles.itemInfoCol}>
                        <Text style={styles.itemSummaryTitle} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemSummaryQtyPrice}>
                          {qty} Unit x Rp {formatRupiah(item.price)}
                        </Text>
                      </View>
                      <Text style={styles.itemSummarySubtotal}>
                        Rp {formatRupiah(item.price * qty)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Pilihan Lokasi Pengambilan Pabrik */}
              <Text style={styles.sectionFormTitle}>LOKASI PENGAMBILAN BARANG</Text>
              <View style={styles.locationSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.locationOption,
                    pickupLocation === 'gedung_a' && styles.locationOptionActive,
                  ]}
                  onPress={() => setPickupLocation('gedung_a')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.locRadio,
                      pickupLocation === 'gedung_a' && styles.locRadioActive,
                    ]}
                  >
                    {pickupLocation === 'gedung_a' && <View style={styles.locRadioDot} />}
                  </View>
                  <View style={styles.locTextGroup}>
                    <Text
                      style={[
                        styles.locTitle,
                        pickupLocation === 'gedung_a' && styles.locTitleActive,
                      ]}
                    >
                      Loket Koperasi Gedung A (Utama)
                    </Text>
                    <Text style={styles.locSub}>Lantai 1 Depan Kantor HRD PT BIT</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.locationOption,
                    pickupLocation === 'gedung_b' && styles.locationOptionActive,
                  ]}
                  onPress={() => setPickupLocation('gedung_b')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.locRadio,
                      pickupLocation === 'gedung_b' && styles.locRadioActive,
                    ]}
                  >
                    {pickupLocation === 'gedung_b' && <View style={styles.locRadioDot} />}
                  </View>
                  <View style={styles.locTextGroup}>
                    <Text
                      style={[
                        styles.locTitle,
                        pickupLocation === 'gedung_b' && styles.locTitleActive,
                      ]}
                    >
                      Loket Koperasi Gedung B
                    </Text>
                    <Text style={styles.locSub}>Area Produksi & Assembly</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Info Pembayaran Pihak Ke-3 */}
              <View style={styles.paymentInfoBox}>
                <AppIcon name="info" size={14} color="#1d72db" />
                <Text style={styles.paymentInfoText}>
                  Pemesanan diproses secara pre-order. Pembayaran akan dilakukan melalui Mitra Pihak Ke-3 saat pengambilan di Loket Koperasi PT BIT. Saldo simpanan koperasi tidak terpotong.
                </Text>
              </View>

              {/* Catatan Khusus */}
              <Text style={styles.sectionFormTitle}>CATATAN PESANAN (OPSIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Contoh: Titip ke staf HRD / Ambil saat jam istirahat"
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />

              {/* Total Summary Box */}
              <View style={styles.totalSummaryBox}>
                <View style={styles.summaryLineRow}>
                  <Text style={styles.summaryLabel}>Total Harga Produk ({totalItems} item)</Text>
                  <Text style={styles.summaryVal}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
                <View style={styles.summaryLineRow}>
                  <Text style={styles.summaryLabel}>Ongkir / Biaya Ambil di Pabrik</Text>
                  <Text style={styles.freeAdminVal}>GRATIS (Rp 0)</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryLineRow}>
                  <Text style={styles.summaryTotalLabel}>TOTAL TAGIHAN</Text>
                  <Text style={styles.summaryTotalAmount}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Confirm Action Button */}
            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCheckoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleConfirmPayment}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmPayBtnText}>Konfirmasi Pesanan (Rp {formatRupiah(totalPrice)})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. Modal Konfirmasi Pengambilan & Pembayaran */}
      <Modal
        visible={isConfirmPickupModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConfirmPickupModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            <View style={styles.confirmModalIconCircle}>
              <AppIcon name="check-circle" size={32} color="#1d72db" />
            </View>
            <Text style={styles.confirmModalTitle}>Konfirmasi Pengambilan Barang</Text>
            <Text style={styles.confirmModalSub}>
              Pastikan Anda sudah menerima barang pesanan dan menyelesaikan pembayaran via pihak ke-3 di Loket Koperasi.
            </Text>

            {selectedOrderToComplete && (
              <View style={styles.confirmOrderSummaryBox}>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Kode Pengambilan:</Text>
                  <Text style={styles.confirmSummaryTicket}>{selectedOrderToComplete.ticketNo}</Text>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Jumlah Unit:</Text>
                  <Text style={styles.confirmSummaryVal}>{selectedOrderToComplete.itemsCount} Barang</Text>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Loket Pengambilan:</Text>
                  <Text style={styles.confirmSummaryVal} numberOfLines={1}>{selectedOrderToComplete.pickupLocName}</Text>
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

      {/* 9. Modal Sukses Pesanan Selesai & Masuk Riwayat */}
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
            <Text style={styles.successCompletedTitle}>Pengambilan Berhasil! 🎉</Text>
            <Text style={styles.successCompletedSub}>
              Barang telah berhasil diambil dan dibayar. Transaksi telah otomatis tercatat di halaman Riwayat Pemesanan.
            </Text>

            {lastCompletedOrder && (
              <View style={styles.successReceiptBriefBox}>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Kode Barang:</Text>
                  <Text style={styles.confirmSummaryTicket}>{lastCompletedOrder.ticketNo}</Text>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Total Tagihan:</Text>
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
                <Text style={styles.closeSuccessBtnText}>Tetap di Katalog</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {/* 9. Modal Filter Merk */}
      <Modal
        visible={isBrandModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBrandModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerModalOverlay}
          activeOpacity={1}
          onPress={() => setIsBrandModalVisible(false)}
        >
          <View style={styles.pickerModalCard}>
            <View style={styles.pickerModalHeader}>
              <View>
                <Text style={styles.pickerModalTitle}>Pilih Merk Produk</Text>
                <Text style={styles.pickerModalSubtitle}>Filter produk berdasarkan brand resmi PT BIT</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsBrandModalVisible(false)}
                style={styles.pickerCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerOptionsList}>
              {brands.map((b) => {
                const isSelected = selectedBrand === b.key;
                const count =
                  b.key === 'Semua'
                    ? mockElektronikProducts.length
                    : mockElektronikProducts.filter((p) => p.brand.toLowerCase() === b.key.toLowerCase()).length;

                return (
                  <TouchableOpacity
                    key={b.key}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedBrand(b.key);
                      setIsBrandModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerItemLeft}>
                      <View
                        style={[
                          styles.brandIconSquare,
                          b.key === 'Miyako'
                            ? styles.brandBadgeMiyako
                            : b.key === 'Rinnai'
                            ? styles.brandBadgeRinnai
                            : b.key === 'Shimizu'
                            ? styles.brandBadgeShimizu
                            : styles.brandBadgeAll,
                        ]}
                      >
                        <Text style={styles.brandIconText}>{b.tag}</Text>
                      </View>
                      <View>
                        <Text style={[styles.pickerItemLabel, isSelected && styles.pickerItemLabelActive]}>
                          {b.label}
                        </Text>
                        <Text style={styles.pickerItemCount}>{count} Produk Tersedia</Text>
                      </View>
                    </View>

                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 10. Modal Filter Kategori Produk */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerModalOverlay}
          activeOpacity={1}
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View style={styles.pickerModalCard}>
            <View style={styles.pickerModalHeader}>
              <View>
                <Text style={styles.pickerModalTitle}>Pilih Kategori Produk</Text>
                <Text style={styles.pickerModalSubtitle}>Filter jenis barang elektronik rumah & dapur</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCategoryModalVisible(false)}
                style={styles.pickerCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerOptionsList}>
              {categories.map((c) => {
                const isSelected = selectedCategory === c.key;
                const count =
                  c.key === 'Semua'
                    ? mockElektronikProducts.length
                    : mockElektronikProducts.filter((p) => p.category === c.key).length;

                return (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedCategory(c.key);
                      setIsCategoryModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerItemLeft}>
                      <View>
                        <Text style={[styles.pickerItemLabel, isSelected && styles.pickerItemLabelActive]}>
                          {c.label}
                        </Text>
                        <Text style={styles.pickerItemCount}>{count} Produk Tersedia</Text>
                      </View>
                    </View>

                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#1d72db',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
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
    color: '#dbeafe',
  },
  screenNavTabTextActive: {
    color: '#1d72db',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  topNavSub: {
    color: '#dbeafe',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  cartIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#dc2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 90,
  },
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  balanceBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceBarLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1e40af',
  },
  balanceBarValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  /* 3. Search & Filter Bar Styles */
  searchFilterContainer: {
    marginBottom: 14,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    padding: 0,
    fontWeight: '500',
  },
  searchClearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDropdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterDropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  filterDropdownBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  filterDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 4,
  },
  filterDropdownPrefix: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  filterDropdownValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    flexShrink: 1,
  },
  filterDropdownValueActive: {
    color: '#1d72db',
  },
  filterStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  filterStatusText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  filterStatusHighlight: {
    color: '#1d72db',
    fontWeight: '600',
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#fecaca',
  },
  resetFilterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dc2626',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  activeFilterChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  categoryPillsWrapper: {
    marginBottom: 12,
  },
  categoryPillsScroll: {
    gap: 8,
    paddingRight: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#1d72db',
    borderColor: '#1d72db',
  },
  categoryPillIcon: {
    fontSize: 12,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  warrantyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    gap: 10,
  },
  warrantyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warrantyTextGroup: {
    flex: 1,
  },
  warrantyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  warrantySub: {
    fontSize: 9.5,
    color: '#15803d',
    marginTop: 1,
  },

  /* Empty Search State */
  emptySearchWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  emptySearchIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptySearchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptySearchSub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emptyResetBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '600',
  },

  /* Picker Modals */
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  pickerModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '75%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  pickerModalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  pickerCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionsList: {
    gap: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  pickerItemActive: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandIconSquare: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeAll: {
    backgroundColor: '#f1f5f9',
    borderWidth: 0.8,
    borderColor: '#cbd5e1',
  },
  brandIconText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  catEmojiWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmojiText: {
    fontSize: 16,
  },
  pickerItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  pickerItemLabelActive: {
    color: '#1d72db',
  },
  pickerItemCount: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#1d72db',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1d72db',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 6,
  },
  productCardTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  brandBadgeMiyako: {
    backgroundColor: '#eff6ff',
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  brandBadgeRinnai: {
    backgroundColor: '#fef2f2',
    borderWidth: 0.8,
    borderColor: '#fecaca',
  },
  brandBadgeShimizu: {
    backgroundColor: '#f0fdf4',
    borderWidth: 0.8,
    borderColor: '#bbf7d0',
  },
  brandBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  discountBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#dc2626',
  },
  productImageContainer: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfoWrap: {
    marginTop: 4,
  },
  productTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 15,
    height: 30,
  },
  productSpecs: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  priceFinal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  priceOriginal: {
    fontSize: 9.5,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  cicilanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  cicilanPillText: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  cardActionRow: {
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '600',
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  qtyBtnMinus: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  qtyBtnPlus: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d72db',
    borderRadius: 6,
  },
  qtyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  qtyNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingCartBadge: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  floatingCartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingPriceRow: {},
  floatingPriceLabel: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  floatingPriceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  checkoutBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  checkoutModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  sectionFormTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  itemsSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 36,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemInfoCol: {
    flex: 1,
  },
  itemSummaryTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemSummaryQtyPrice: {
    fontSize: 10,
    color: '#64748b',
  },
  itemSummarySubtotal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  locationSelectorRow: {
    gap: 8,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
  },
  locationOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  locRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locRadioActive: {
    borderColor: '#1d72db',
  },
  locRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d72db',
  },
  locTextGroup: {
    flex: 1,
  },
  locTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1e293b',
  },
  locTitleActive: {
    color: '#1d4ed8',
  },
  locSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  paymentMethodList: {
    gap: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
  },
  paymentMethodCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  methodInfoWrap: {
    flex: 1,
  },
  methodTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  methodName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  methodNameActive: {
    color: '#1d4ed8',
  },
  instantBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  instantBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#15803d',
  },
  cicilanBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  cicilanBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#dc2626',
  },
  methodSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 11.5,
    color: '#0f172a',
  },
  totalSummaryBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginVertical: 14,
    gap: 6,
  },
  summaryLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  freeAdminVal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#bfdbfe',
    marginVertical: 4,
  },
  summaryTotalLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  summaryTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d72db',
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmPayBtn: {
    flex: 2,
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmPayBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  ticketSuccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    maxHeight: '90%',
  },
  ticketIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ticketSuccessTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketSuccessSub: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 10,
  },
  ticketCodeBox: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  ticketCodeLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: 0.5,
  },
  ticketCodeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e40af',
    letterSpacing: 2,
    marginTop: 1,
  },
  barcodeBox: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    marginBottom: 10,
  },
  barcodeBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  ticketDetailsList: {
    width: '100%',
    gap: 4,
    marginBottom: 12,
  },
  ticketProductSectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ticketProductsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  ticketProductItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2.5,
  },
  ticketProductName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  ticketProductBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1d72db',
  },
  ticketProductQtyPrice: {
    fontSize: 9.5,
    color: '#64748b',
  },
  ticketProductSubtotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketNotesRow: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
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
  ticketDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  ticketLabel: {
    fontSize: 10.5,
    color: '#64748b',
  },
  ticketVal: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0f172a',
    maxWidth: '60%',
    textAlign: 'right',
  },
  ticketValBold: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  ticketPaymentBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ticketValGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 10,
  },
  paymentInfoText: {
    flex: 1,
    fontSize: 10,
    color: '#1d72db',
    lineHeight: 14,
  },
  orderedItemBrand: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
    marginTop: 1,
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
    color: '#1d72db',
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
    color: '#1d72db',
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
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
    shadowColor: '#1d72db',
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
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#1d72db',
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
    backgroundColor: '#1d72db',
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
    color: '#1d72db',
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
  orderedItemPlaceholderThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderedItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  activeOrderNotifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
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
    backgroundColor: '#1d72db',
  },
  activeOrderNotifyText: {
    fontSize: 11,
    color: '#1e40af',
    flex: 1,
  },
  activeOrderNotifyLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
    marginLeft: 6,
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
    backgroundColor: '#eff6ff',
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
    color: '#1d72db',
  },
  confirmSummaryVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '65%',
    textAlign: 'right',
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
    color: '#1d72db',
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
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
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
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1d72db',
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
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#bfdbfe',
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
