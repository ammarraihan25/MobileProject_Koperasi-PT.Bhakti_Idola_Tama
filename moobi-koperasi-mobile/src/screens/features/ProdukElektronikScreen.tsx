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
}

export const ProdukElektronikScreen: React.FC<ProdukElektronikScreenProps> = ({
  onBack,
  userBalance,
  onPurchaseSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedBrand, setSelectedBrand] = useState<string>('Semua');
  const [isBrandModalVisible, setIsBrandModalVisible] = useState<boolean>(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState<boolean>(false);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<string>('');

  // Checkout Flow States
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState<boolean>(false);
  const [isSuccessTicketVisible, setIsSuccessTicketVisible] = useState<boolean>(false);
  const [pickupLocation, setPickupLocation] = useState<'gedung_a' | 'gedung_b'>('gedung_a');
  const [paymentMethod, setPaymentMethod] = useState<'saldo' | 'payroll_1x' | 'payroll_3x' | 'payroll_6x'>('saldo');

  const [completedOrderTicket, setCompletedOrderTicket] = useState<{
    ticketNo: string;
    itemsCount: number;
    totalAmount: number;
    paymentSource: string;
    pickupLocName: string;
    itemsList: { name: string; qty: number; price: number }[];
  } | null>(null);

  const categories: { key: string; label: string; icon: string }[] = [
    { key: 'Semua', label: 'Semua Kategori', icon: '⚡' },
    { key: 'dapur', label: 'Peralatan Dapur', icon: '🍳' },
    { key: 'living', label: 'Living & Rumah', icon: '🏠' },
    { key: 'cooling', label: 'Pendingin & Kipas', icon: '💨' },
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
    if (paymentMethod === 'saldo' && userBalance < totalPrice) {
      Alert.alert(
        'Saldo Tidak Mencukupi',
        `Saldo Koperasi Anda (Rp ${formatRupiah(
          userBalance
        )}) tidak cukup untuk membayar pesanan sebesar Rp ${formatRupiah(
          totalPrice
        )}. Silakan gunakan opsi Potong Gaji Payroll atau isi saldo terlebih dahulu.`
      );
      return;
    }

    const ticketNo = `BIT-ELX-#${Math.floor(10000 + Math.random() * 90000)}`;

    const itemsSummary = Object.entries(cart).map(([id, qty]) => {
      const p = mockElektronikProducts.find((item) => item.id === id);
      return {
        name: p ? p.name : 'Produk BIT',
        qty,
        price: p ? p.price : 0,
      };
    });

    let paymentLabel = 'Saldo Utama Koperasi (Lunas)';
    if (paymentMethod === 'payroll_1x') {
      paymentLabel = 'Potong Slip Gaji 1x (Bulan Depan)';
    } else if (paymentMethod === 'payroll_3x') {
      paymentLabel = `Potong Slip Gaji 3x Cicilan (Rp ${formatRupiah(Math.round(totalPrice / 3))}/bln)`;
    } else if (paymentMethod === 'payroll_6x') {
      paymentLabel = `Potong Slip Gaji 6x Cicilan (Rp ${formatRupiah(Math.round(totalPrice / 6))}/bln)`;
    }

    const locLabel =
      pickupLocation === 'gedung_a'
        ? 'Loket Koperasi Pabrik Gedung A (Depan HRD)'
        : 'Loket Koperasi Pabrik Gedung B (Area Produksi)';

    const summaryText = itemsSummary.map((i) => `${i.qty}x ${i.name}`).join(', ');
    if (onPurchaseSuccess) {
      onPurchaseSuccess(totalPrice, totalItems, paymentLabel, summaryText);
    }

    setCompletedOrderTicket({
      ticketNo,
      itemsCount: totalItems,
      totalAmount: totalPrice,
      paymentSource: paymentLabel,
      pickupLocName: locLabel,
      itemsList: itemsSummary,
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* 2. Hero Wallet Balance Card */}
        <View style={styles.heroBalanceCard}>
          <View style={styles.heroGlowCircle} />
          <View style={styles.heroBalanceTop}>
            <View style={styles.heroLabelWrap}>
              <AppIcon name="wallet" size={15} color="#38bdf8" />
              <Text style={styles.heroBalanceLabel}>Sumber Dana: Saldo Koperasi</Text>
            </View>
            <View style={styles.karyawanPill}>
              <Text style={styles.karyawanPillText}>Cicilan 0% Payroll</Text>
            </View>
          </View>

          <View style={styles.heroBalanceMain}>
            <Text style={styles.heroCurrency}>Rp</Text>
            <Text style={styles.heroBalanceAmount}>{formatRupiah(userBalance)}</Text>
          </View>

          <View style={styles.heroFooter}>
            <Text style={styles.heroSubText}>
              Bisa bayar langsung via Saldo Koperasi atau Cicilan Potong Gaji s/d 6 Bulan
            </Text>
          </View>
        </View>

        {/* 3. Integrated Search & Filter Section */}
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
                  {categories.find((c) => c.key === selectedCategory)?.label || 'Semua'}
                </Text>
              </View>
              <AppIcon
                name="chevron-down"
                size={13}
                color={selectedCategory !== 'Semua' ? '#1d72db' : '#64748b'}
              />
            </TouchableOpacity>
          </View>

          {/* Filter Status / Reset Action */}
          {(searchQuery !== '' || selectedBrand !== 'Semua' || selectedCategory !== 'Semua') && (
            <View style={styles.filterStatusRow}>
              <Text style={styles.filterStatusText}>
                Ditemukan <Text style={styles.filterStatusHighlight}>{filteredProducts.length}</Text> produk
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedBrand('Semua');
                  setSelectedCategory('Semua');
                }}
                style={styles.resetFilterBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={11} color="#dc2626" />
                <Text style={styles.resetFilterText}>Reset Filter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. Product List or Empty State */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptySearchWrap}>
            <View style={styles.emptySearchIconWrap}>
              <AppIcon name="search" size={32} color="#94a3b8" />
            </View>
            <Text style={styles.emptySearchTitle}>Produk Tidak Ditemukan</Text>
            <Text style={styles.emptySearchSub}>
              Tidak ada produk yang cocok dengan kata kunci "{searchQuery}" atau filter yang dipilih.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedBrand('Semua');
                setSelectedCategory('Semua');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyResetBtnText}>Tampilkan Semua Produk</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((item) => {
              const qtyInCart = cart[item.id] || 0;
              return (
                <View key={item.id} style={styles.productCard}>
                {/* Brand & Discount Tag Row */}
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

                {/* Product Image Box */}
                <View style={styles.productImageContainer}>
                  <Image source={item.image} style={styles.productImage} resizeMode="contain" />
                </View>

                {/* Product Info */}
                <View style={styles.productInfoWrap}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productSpecs} numberOfLines={1}>
                    {item.specs}
                  </Text>

                  {/* Price Row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceFinal}>Rp {formatRupiah(item.price)}</Text>
                    {item.originalPrice > item.price && (
                      <Text style={styles.priceOriginal}>Rp {formatRupiah(item.originalPrice)}</Text>
                    )}
                  </View>

                  {/* Cicilan Pill */}
                  <View style={styles.cicilanPill}>
                    <AppIcon name="receipt" size={10} color="#1d72db" />
                    <Text style={styles.cicilanPillText}>
                      Cicilan Rp {formatRupiah(item.cicilanPerBulan)}/bln
                    </Text>
                  </View>

                  {/* Action / Quantity Selector Button */}
                  <View style={styles.cardActionRow}>
                    {qtyInCart === 0 ? (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item.id)}
                        activeOpacity={0.8}
                      >
                        <AppIcon name="shopping-bag" size={13} color="#ffffff" />
                        <Text style={styles.addBtnText}>+ Keranjang</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControlRow}>
                        <TouchableOpacity
                          style={styles.qtyBtnMinus}
                          onPress={() => handleRemoveFromCart(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.qtyNumberText}>{qtyInCart}</Text>

                        <TouchableOpacity
                          style={styles.qtyBtnPlus}
                          onPress={() => handleAddToCart(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>

      {/* 6. Floating Cart Bar (Appears when items in cart) */}
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
            <Text style={styles.checkoutBtnText}>Checkout ›</Text>
          </TouchableOpacity>
        </View>
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalScrollBody}
            >
              {/* Order Items Summary */}
              <Text style={styles.sectionFormTitle}>RINGKASAN PESANAN</Text>
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
                          {qty}x @ Rp {formatRupiah(item.price)}
                        </Text>
                      </View>
                      <Text style={styles.itemSummarySubtotal}>
                        Rp {formatRupiah(item.price * qty)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Lokasi Pengambilan Pesanan */}
              <Text style={styles.sectionFormTitle}>PILIH LOKASI PENGAMBILAN BARANG</Text>
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
                      Loket Koperasi Gedung A
                    </Text>
                    <Text style={styles.locSub}>Depan HRD & Lobby Utama</Text>
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

              {/* Metode Pembayaran */}
              <Text style={styles.sectionFormTitle}>PILIH METODE PEMBAYARAN</Text>
              <View style={styles.paymentMethodList}>
                {/* 1. Saldo Koperasi */}
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'saldo' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod('saldo')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.locRadio,
                      paymentMethod === 'saldo' && styles.locRadioActive,
                    ]}
                  >
                    {paymentMethod === 'saldo' && <View style={styles.locRadioDot} />}
                  </View>
                  <View style={styles.methodInfoWrap}>
                    <View style={styles.methodTitleBadgeRow}>
                      <Text
                        style={[
                          styles.methodName,
                          paymentMethod === 'saldo' && styles.methodNameActive,
                        ]}
                      >
                        Saldo Utama Koperasi
                      </Text>
                      <View style={styles.instantBadge}>
                        <Text style={styles.instantBadgeText}>LUNAS LANGSUNG</Text>
                      </View>
                    </View>
                    <Text style={styles.methodSub}>
                      Tersedia: Rp {formatRupiah(userBalance)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Potong Gaji 1x */}
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'payroll_1x' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod('payroll_1x')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.locRadio,
                      paymentMethod === 'payroll_1x' && styles.locRadioActive,
                    ]}
                  >
                    {paymentMethod === 'payroll_1x' && <View style={styles.locRadioDot} />}
                  </View>
                  <View style={styles.methodInfoWrap}>
                    <Text
                      style={[
                        styles.methodName,
                        paymentMethod === 'payroll_1x' && styles.methodNameActive,
                      ]}
                    >
                      Potong Slip Gaji (1x Bayar)
                    </Text>
                    <Text style={styles.methodSub}>
                      Dipotong otomatis dari gaji bulan berikutnya
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Cicilan 3x (0%) */}
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'payroll_3x' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod('payroll_3x')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.locRadio,
                      paymentMethod === 'payroll_3x' && styles.locRadioActive,
                    ]}
                  >
                    {paymentMethod === 'payroll_3x' && <View style={styles.locRadioDot} />}
                  </View>
                  <View style={styles.methodInfoWrap}>
                    <View style={styles.methodTitleBadgeRow}>
                      <Text
                        style={[
                          styles.methodName,
                          paymentMethod === 'payroll_3x' && styles.methodNameActive,
                        ]}
                      >
                        Cicilan Potong Gaji 3x (0% Bunga)
                      </Text>
                      <View style={styles.cicilanBadge}>
                        <Text style={styles.cicilanBadgeText}>POPULER</Text>
                      </View>
                    </View>
                    <Text style={styles.methodSub}>
                      Rp {formatRupiah(Math.round(totalPrice / 3))}/bulan selama 3 bulan
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 4. Cicilan 6x (0%) */}
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'payroll_6x' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod('payroll_6x')}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.locRadio,
                      paymentMethod === 'payroll_6x' && styles.locRadioActive,
                    ]}
                  >
                    {paymentMethod === 'payroll_6x' && <View style={styles.locRadioDot} />}
                  </View>
                  <View style={styles.methodInfoWrap}>
                    <Text
                      style={[
                        styles.methodName,
                        paymentMethod === 'payroll_6x' && styles.methodNameActive,
                      ]}
                    >
                      Cicilan Potong Gaji 6x (0% Bunga)
                    </Text>
                    <Text style={styles.methodSub}>
                      Rp {formatRupiah(Math.round(totalPrice / 6))}/bulan selama 6 bulan
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Catatan Khusus */}
              <Text style={styles.sectionFormTitle}>CATATAN PESANAN (OPSIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Contoh: Titip ke staf HRD / Ambil jam istirahat"
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
                <View style={styles.summaryLineRow}>
                  <Text style={styles.summaryLabel}>Bunga Koperasi</Text>
                  <Text style={styles.freeAdminVal}>0% TANPA BUNGA</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryLineRow}>
                  <Text style={styles.summaryTotalLabel}>TOTAL PEMBAYARAN</Text>
                  <Text style={styles.summaryTotalAmount}>Rp {formatRupiah(totalPrice)}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Confirm Payment Action Button */}
            <View style={styles.modalActionFooter}>
              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleConfirmPayment}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmPayBtnText}>Konfirmasi & Pesan Barang Sekarang ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. Modal Tiket Struk Pengambilan (Order Success Ticket) */}
      <Modal
        visible={isSuccessTicketVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsSuccessTicketVisible(false);
          onBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ticketSuccessCard}>
            <View style={styles.ticketIconCircle}>
              <AppIcon name="check-circle" size={32} color="#16a34a" />
            </View>

            <Text style={styles.ticketSuccessTitle}>Pemesanan Berhasil!</Text>
            <Text style={styles.ticketSuccessSub}>
              Tunjukkan struk digital ini saat mengambil barang di Loket Koperasi
            </Text>

            {/* Ticket Code Box */}
            <View style={styles.ticketCodeBox}>
              <Text style={styles.ticketCodeLabel}>KODE PENGAMBILAN BARANG</Text>
              <Text style={styles.ticketCodeText}>{completedOrderTicket?.ticketNo}</Text>
            </View>

            {/* Barcode Visual */}
            <View style={styles.barcodeBox}>
              <View style={styles.barcodeBarsRow}>
                {[5, 2, 7, 3, 9, 4, 6, 2, 8, 5, 3, 7, 2, 6, 4, 9, 3, 5, 7].map((w, i) => (
                  <View
                    key={i}
                    style={{
                      width: w,
                      height: 42,
                      backgroundColor: '#0f172a',
                      marginHorizontal: 1.5,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </View>
              <Text style={styles.barcodeSub}>Scan Barcode di Loket Koperasi PT BIT</Text>
            </View>

            {/* Details List */}
            <View style={styles.ticketDetailsList}>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Lokasi Pengambilan</Text>
                <Text style={styles.ticketVal}>{completedOrderTicket?.pickupLocName}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Total Pembayaran</Text>
                <Text style={styles.ticketValBold}>
                  Rp {formatRupiah(completedOrderTicket?.totalAmount || 0)}
                </Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Metode Pembayaran</Text>
                <Text style={styles.ticketVal}>{completedOrderTicket?.paymentSource}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Garansi Resmi</Text>
                <Text style={styles.ticketValGreen}>100% Produk Original PT BIT</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setIsSuccessTicketVisible(false);
                onBack();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Selesai & Kembali ke Beranda</Text>
            </TouchableOpacity>
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
                      <View style={styles.catEmojiWrap}>
                        <Text style={styles.catEmojiText}>{c.icon}</Text>
                      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
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
  karyawanPill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  karyawanPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
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
  modalActionFooter: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  confirmPayBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmPayBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  ticketSuccessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  ticketIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ticketSuccessTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketSuccessSub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  ticketCodeBox: {
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  ticketCodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: 0.5,
  },
  ticketCodeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: 2,
    marginTop: 2,
  },
  barcodeBox: {
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    marginBottom: 12,
  },
  barcodeBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 6,
  },
  ticketDetailsList: {
    width: '100%',
    gap: 6,
    marginBottom: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  ticketVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    maxWidth: '60%',
    textAlign: 'right',
  },
  ticketValBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d72db',
  },
  ticketValGreen: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  doneBtn: {
    backgroundColor: '#1d72db',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
