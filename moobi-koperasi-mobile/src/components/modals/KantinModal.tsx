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
import { AppIcon } from '../common/AppIcon';
import { mockKantinMenu } from '../../data/mockData';
import { KantinMenuItem } from '../../types';

interface KantinModalProps {
  visible: boolean;
  onClose: () => void;
  userBalance: number;
  onOrderSuccess?: (totalPrice: number, itemsCount: number) => void;
}

export const KantinModal: React.FC<KantinModalProps> = ({
  visible,
  onClose,
  userBalance,
  onOrderSuccess,
}) => {
  const [selectedShift, setSelectedShift] = useState<string>('Shift 1 (11:30)');
  const [selectedStand, setSelectedStand] = useState<string>('Semua');
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  const shifts = ['Shift 1 (11:30)', 'Shift 2 (19:00)', 'Lembur (21:30)'];
  const stands = ['Semua', 'Stand 1 (Bu Eni)', 'Stand 2 (Mas Joko)', 'Stand 3 (Dapur BIT)'];

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

  const filteredMenu = mockKantinMenu.filter((m) => {
    if (selectedStand === 'Semua') return true;
    return m.canteenStand === selectedStand;
  });

  const handleCheckout = () => {
    if (totalItems === 0) {
      Alert.alert('Keranjang Kosong', 'Silakan tambahkan menu yang ingin dipesan terlebih dahulu.');
      return;
    }

    Alert.alert(
      'Konfirmasi Pre-Order Kantin 🍱',
      `Jumlah: ${totalItems} Item\nTotal Bayar: Rp ${formatRupiah(totalPrice)}\nJadwal Ambil: ${selectedShift}\n\nPembayaran: Dilakukan via Pihak Ke-3 saat pengambilan di loket.\n(Saldo Simpanan Koperasi tidak dipotong)`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pesan Sekarang',
          onPress: () => {
            if (onOrderSuccess) {
              onOrderSuccess(totalPrice, totalItems);
            }
            Alert.alert(
              'Pesanan Diterima Dapur Kantin! 🍲',
              `Pesanan Anda sedang dipersiapkan untuk ${selectedShift}.\nAmbil pesanan di loket kasir kantin PT BIT.`
            );
            setCart({});
            onClose();
          },
        },
      ]
    );
  };

  const handleReset = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleReset}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.headerIconCircle}>
                <AppIcon name="food" size={18} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Pre-Order Kantin Pabrik</Text>
                <Text style={styles.modalSub}>Cashless 100% • Siap Saji Tanpa Antre</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn} activeOpacity={0.7}>
              <AppIcon name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Shift Selector */}
            <Text style={styles.sectionLabel}>JADWAL ISTIRAHAT (SHIFT)</Text>
            <View style={styles.shiftRow}>
              {shifts.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.shiftChip, selectedShift === s && styles.shiftChipActive]}
                  onPress={() => setSelectedShift(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.shiftChipText, selectedShift === s && styles.shiftChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stand Selector */}
            <Text style={styles.sectionLabel}>STAND KANTIN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.standScroll}>
              {stands.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.standChip, selectedStand === st && styles.standChipActive]}
                  onPress={() => setSelectedStand(st)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.standChipText, selectedStand === st && styles.standChipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Menu List */}
            <Text style={styles.sectionLabel}>DAFTAR MENU POPULER</Text>
            <View style={styles.menuList}>
              {filteredMenu.map((item) => {
                const count = cart[item.id] || 0;
                return (
                  <View key={item.id} style={styles.menuCard}>
                    <View style={styles.menuIconBox}>
                      <AppIcon name="food" size={20} color="#16a34a" />
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuStand}>{item.canteenStand} • {item.estimatedPrepTime}</Text>
                      <Text style={styles.menuPrice}>Rp {formatRupiah(item.price)}</Text>
                    </View>

                    {/* Counter Controls */}
                    {count > 0 ? (
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterBtnMinus}
                          onPress={() => handleRemoveFromCart(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.counterBtnMinusText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterVal}>{count}</Text>
                        <TouchableOpacity
                          style={styles.counterBtnPlus}
                          onPress={() => handleAddToCart(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.counterBtnPlusText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addBtnText}>+ Tambah</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Floating Cart & Checkout Footer */}
          {totalItems > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.cartSummary}>
                <Text style={styles.cartCountText}>{totalItems} Menu Terpilih ({selectedShift})</Text>
                <Text style={styles.cartTotalText}>Rp {formatRupiah(totalPrice)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.8}>
                <Text style={styles.checkoutBtnText}>Pesan Sekarang ›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  shiftRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  shiftChip: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shiftChipActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  shiftChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  shiftChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  standScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  standChip: {
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 6,
  },
  standChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  standChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  standChipTextActive: {
    color: '#15803d',
    fontWeight: '700',
  },
  menuList: {
    gap: 10,
    marginBottom: 10,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  menuInfo: {
    flex: 1,
    marginRight: 8,
  },
  menuName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuStand: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  menuPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  addBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 2,
  },
  counterBtnMinus: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnMinusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  counterVal: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  counterBtnPlus: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnPlusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cartSummary: {
    flex: 1,
  },
  cartCountText: {
    fontSize: 10.5,
    color: '#64748b',
  },
  cartTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  checkoutBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  checkoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
