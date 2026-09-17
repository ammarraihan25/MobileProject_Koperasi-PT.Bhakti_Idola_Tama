import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';
import { mockWallet } from '../../data/mockData';

const plnLogo = require('../../../assets/tagihan/pln.png');
const bpjsLogo = require('../../../assets/tagihan/bpjs.png');
const pdamLogo = require('../../../assets/tagihan/pdam.png');
const wifiLogo = require('../../../assets/tagihan/wifi.png');

const emoneyProviderList = [
  { id: 'gopay', name: 'GoPay', logo: require('../../../assets/transfer/gopay.png') },
  { id: 'dana', name: 'DANA', logo: require('../../../assets/transfer/dana.png') },
  { id: 'ovo', name: 'OVO', logo: require('../../../assets/transfer/ovo.png') },
  { id: 'shopeepay', name: 'ShopeePay', logo: require('../../../assets/transfer/shopeepay.png') },
  { id: 'flazz', name: 'Flazz BCA', logo: require('../../../assets/transfer/bca.png') },
  { id: 'etoll', name: 'Mandiri e-Money', logo: require('../../../assets/transfer/mandiri.png') },
];

export type PPOBServiceType = 'pulsa' | 'token' | 'emoney' | 'pdam' | 'bpjs';

interface PulsaScreenProps {
  onBack: () => void;
  userBalance?: number;
  mode?: PPOBServiceType;
  initialTab?: 'pulsa' | 'token' | 'emoney';
  bpjsPaidStatus?: { kesehatan: boolean; ketenagakerjaan: boolean };
  pdamPaidStatus?: boolean;
  onUpdateBpjsPaidStatus?: (type: 'kesehatan' | 'ketenagakerjaan', status: boolean) => void;
  onUpdatePdamPaidStatus?: (status: boolean) => void;
  onPurchaseSuccess?: (
    amount: number,
    product: string,
    category: string,
    targetNumber: string
  ) => void;
}

export const PulsaScreen: React.FC<PulsaScreenProps> = ({
  onBack,
  userBalance = mockWallet.simpananSukarela,
  mode = 'pulsa',
  bpjsPaidStatus = { kesehatan: false, ketenagakerjaan: false },
  pdamPaidStatus = false,
  onUpdateBpjsPaidStatus,
  onUpdatePdamPaidStatus,
  onPurchaseSuccess,
}) => {
  // Mobile recharge sub-tab (only active when mode === 'pulsa')
  const [mobileTab, setMobileTab] = useState<'pulsa' | 'data'>('pulsa');

  // Input states
  const [phoneNumber, setPhoneNumber] = useState('0812-3456-7890');
  const [meterNumber, setMeterNumber] = useState('5371-2099-1823');
  const [emoneyNumber, setEmoneyNumber] = useState('0812-3456-7890');
  const [selectedEmoneyProvider, setSelectedEmoneyProvider] = useState<'etoll' | 'flazz' | 'gopay' | 'ovo' | 'shopeepay' | 'dana'>('etoll');

  // PDAM States
  const [pdamWilayah, setPdamWilayah] = useState('PDAM Kota Semarang (Tirta Moedal)');
  const [pdamNumber, setPdamNumber] = useState('1029384756');

  // BPJS States
  const [bpjsType, setBpjsType] = useState<'kesehatan' | 'ketenagakerjaan'>('kesehatan');
  const [bpjsNumber, setBpjsNumber] = useState('0001234567890');

  const isBpjsPaid = !!bpjsPaidStatus[bpjsType];
  const isPdamPaid = !!pdamPaidStatus;

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastTxData, setLastTxData] = useState<{
    productName: string;
    target: string;
    price: number;
    tokenCode?: string;
    txNo: string;
  } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  // Products Data
  const pulsaItems = [
    { id: 'p10', title: 'Pulsa 10.000', amount: '10.000', price: 10500, desc: 'Masa aktif +15 hari' },
    { id: 'p25', title: 'Pulsa 25.000', amount: '25.000', price: 25000, desc: 'Masa aktif +30 hari • Promo BIT', isPromo: true },
    { id: 'p50', title: 'Pulsa 50.000', amount: '50.000', price: 49500, desc: 'Diskon Anggota Koperasi', isPromo: true },
    { id: 'p100', title: 'Pulsa 100.000', amount: '100.000', price: 98000, desc: 'Masa aktif +60 hari • Terlaris', isPromo: true },
  ];

  const dataItems = [
    { id: 'd5', title: 'Flash 5GB (7 Hari)', amount: '5 GB', price: 25000, desc: '24 Jam Semua Jaringan' },
    { id: 'd15', title: 'OMG! 15GB (30 Hari)', amount: '15 GB', price: 55000, desc: '10GB Kuota + 5GB Apps', isPromo: true },
    { id: 'd35', title: 'Super 35GB (30 Hari)', amount: '35 GB', price: 85000, desc: 'Kuota Utama Tanpa Bagi Waktu' },
  ];

  const tokenPlnItems = [
    { id: 'pln20', title: 'Token PLN 20.000', amount: '20.000', price: 21500, desc: 'KWh sesuai tarif golongan' },
    { id: 'pln50', title: 'Token PLN 50.000', amount: '50.000', price: 51500, desc: 'KWh sesuai tarif golongan • Promo', isPromo: true },
    { id: 'pln100', title: 'Token PLN 100.000', amount: '100.000', price: 101500, desc: 'KWh sesuai tarif golongan' },
    { id: 'pln200', title: 'Token PLN 200.000', amount: '200.000', price: 201500, desc: 'KWh sesuai tarif golongan' },
    { id: 'pln500', title: 'Token PLN 500.000', amount: '500.000', price: 501500, desc: 'KWh sesuai tarif golongan' },
  ];

  const emoneyItems = [
    { id: 'em20', title: 'Top Up 20.000', amount: '20.000', price: 21000, desc: 'Biaya admin Rp 1.000' },
    { id: 'em50', title: 'Top Up 50.000', amount: '50.000', price: 51000, desc: 'Biaya admin Rp 1.000' },
    { id: 'em100', title: 'Top Up 100.000', amount: '100.000', price: 101000, desc: 'Biaya admin Rp 1.000 • Terlaris', isPromo: true },
    { id: 'em200', title: 'Top Up 200.000', amount: '200.000', price: 201000, desc: 'Biaya admin Rp 1.000' },
    { id: 'em500', title: 'Top Up 500.000', amount: '500.000', price: 501000, desc: 'Biaya admin Rp 1.000' },
  ];

  // PDAM Bill Calculation
  const pdamBill = {
    title: `Tagihan PDAM Periode Agu 2026`,
    price: isPdamPaid ? 0 : 71000,
    customerName: 'Budi Santoso',
    pemakaian: '24 m³',
    tarifAir: 68500,
    admin: 2500,
    isPaid: isPdamPaid,
  };

  // BPJS Bill Calculation (Otomatis Cek Tagihan Bulan Berjalan)
  const bpjsPricePerMonth = bpjsType === 'kesehatan' ? 150000 : 168000;
  const bpjsBill = {
    title: `Iuran ${bpjsType === 'kesehatan' ? 'BPJS Kesehatan' : 'BPJS Ketenagakerjaan'} (September 2026)`,
    price: isBpjsPaid ? 0 : bpjsPricePerMonth + 2500,
    customerName: 'Budi Santoso',
    iuranPokok: bpjsPricePerMonth,
    admin: 2500,
    periode: 'September 2026',
    isPaid: isBpjsPaid,
  };

  const handleSelectProduct = (item: any) => {
    setSelectedProduct(item);
  };

  const getEffectiveProduct = () => {
    if (mode === 'pdam') return pdamBill;
    if (mode === 'bpjs') return bpjsBill;
    return selectedProduct;
  };

  const handleProceedPay = () => {
    const effProduct = getEffectiveProduct();
    if (!effProduct) {
      Alert.alert('Pilih Nominal', 'Silakan pilih produk atau nominal yang diinginkan.');
      return;
    }
    if (mode === 'bpjs' && isBpjsPaid) {
      Alert.alert('Tagihan Lunas', 'Tagihan BPJS untuk periode ini sudah terbayar lunas.');
      return;
    }
    if (mode === 'pdam' && isPdamPaid) {
      Alert.alert('Tagihan Lunas', 'Tagihan PDAM untuk periode ini sudah terbayar lunas.');
      return;
    }
    if (userBalance < effProduct.price) {
      Alert.alert(
        'Simpanan Sukarela Kurang',
        `Saldo Simpanan Sukarela Anda (Rp ${formatRupiah(
          userBalance
        )}) tidak cukup untuk membayar Rp ${formatRupiah(effProduct.price)}.`
      );
      return;
    }
    setPinInput('');
    setPinModalVisible(true);
  };

  const handleConfirmPIN = () => {
    if (pinInput.length < 6) {
      Alert.alert('PIN Tidak Lengkap', 'Masukkan 6-digit PIN keamanan transaksi Anda.');
      return;
    }

    const effProduct = getEffectiveProduct();
    if (!effProduct) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPinModalVisible(false);

      let target = phoneNumber;
      let tokenCode: string | undefined = undefined;

      if (mode === 'token') {
        target = meterNumber;
        tokenCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (mode === 'emoney') {
        target = `${selectedEmoneyProvider.toUpperCase()} - ${emoneyNumber}`;
      } else if (mode === 'pdam') {
        target = `${pdamWilayah} - ${pdamNumber}`;
        onUpdatePdamPaidStatus?.(true);
      } else if (mode === 'bpjs') {
        target = `BPJS ${bpjsType.toUpperCase()} - ${bpjsNumber}`;
        onUpdateBpjsPaidStatus?.(bpjsType, true);
      }

      const txNo = `${mode.toUpperCase()}-${Date.now().toString().slice(-6)}`;

      setLastTxData({
        productName: effProduct.title,
        target,
        price: effProduct.price,
        tokenCode,
        txNo,
      });

      if (onPurchaseSuccess) {
        onPurchaseSuccess(effProduct.price, effProduct.title, mode, target);
      }

      setSuccessModalVisible(true);
    }, 700);
  };

  // Header Title and Info Mapping for 1-menu 1-activity
  const getHeaderInfo = () => {
    switch (mode) {
      case 'token':
        return {
          title: 'Token Listrik PLN',
          sub: 'Prabayar PLN • Sumber: Simpanan Sukarela',
          icon: 'zap' as const,
        };
      case 'emoney':
        return {
          title: 'Top Up E-Money',
          sub: 'Dompet Digital & Kartu • Sumber: Simpanan Sukarela',
          icon: 'topup' as const,
        };
      case 'pdam':
        return {
          title: 'Pembayaran PDAM',
          sub: 'Tagihan Air Bersih • Sumber: Simpanan Sukarela',
          icon: 'pdam' as const,
        };
      case 'bpjs':
        return {
          title: 'Pembayaran BPJS',
          sub: 'Kesehatan & Ketenagakerjaan • Sumber: Simpanan Sukarela',
          icon: 'bpjs' as const,
        };
      case 'pulsa':
      default:
        return {
          title: 'Pulsa & Paket Data',
          sub: 'Semua Operator • Sumber: Simpanan Sukarela',
          icon: 'pulsa' as const,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <View style={styles.screenContainer}>
      {/* 1. Header (Dedicated Title per Activity) */}
      <View style={styles.topNavBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <AppIcon name="chevron-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>{headerInfo.title}</Text>
          <Text style={styles.topNavSub}>{headerInfo.sub}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* 2. ACTIVITY SPECIFIC VIEW */}

        {/* ================= A. MODE: PULSA & DATA ================= */}
        {mode === 'pulsa' && (
          <>
            {/* Sub-Tabs: Pulsa vs Paket Data */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, mobileTab === 'pulsa' && styles.tabBtnActive]}
                onPress={() => {
                  setMobileTab('pulsa');
                  setSelectedProduct(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mobileTab === 'pulsa' && styles.tabTextActive]}>Pulsa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, mobileTab === 'data' && styles.tabBtnActive]}
                onPress={() => {
                  setMobileTab('data');
                  setSelectedProduct(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mobileTab === 'data' && styles.tabTextActive]}>Paket Data</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputCardLabel}>Nomor Handphone Penerima</Text>
              <View style={styles.inputBoxRow}>
                <AppIcon name="phone" size={16} color="#2563eb" />
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="0812-xxxx-xxxx"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <Text style={styles.inputHelperText}>Operator terdeteksi: Telkomsel Prabayar</Text>
            </View>

            <Text style={styles.sectionTitle}>
              Pilih Nominal {mobileTab === 'pulsa' ? 'Pulsa' : 'Paket Data'}
            </Text>
            <View style={styles.productsList}>
              {(mobileTab === 'pulsa' ? pulsaItems : dataItems).map((item) => {
                const isSelected = selectedProduct?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.productCard, isSelected && styles.productCardActive]}
                    onPress={() => handleSelectProduct(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.productTopRow}>
                      <Text style={[styles.productTitle, isSelected && styles.productTitleActive]}>
                        {item.title}
                      </Text>
                      {item.isPromo && (
                        <View style={styles.promoBadge}>
                          <Text style={styles.promoBadgeText}>PROMO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.productDesc}>{item.desc}</Text>
                    <View style={styles.productPriceRow}>
                      <Text style={[styles.productPrice, isSelected && styles.productPriceActive]}>
                        Rp {formatRupiah(item.price)}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ================= B. MODE: TOKEN LISTRIK PLN ================= */}
        {mode === 'token' && (
          <>
            <View style={styles.inputCard}>
              <View style={styles.serviceBrandHeader}>
                <View style={styles.serviceBrandLogoWrap}>
                  <Image source={plnLogo} style={styles.serviceBrandLogo} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceBrandTitle}>PLN Listrik Pintar</Text>
                  <Text style={styles.serviceBrandSub}>Pembelian Strum / Token Listrik Prabayar</Text>
                </View>
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 12 }]}>Nomor Meter / ID Pelanggan PLN</Text>
              <View style={styles.inputBoxRow}>
                <AppIcon name="zap" size={16} color="#ea580c" />
                <TextInput
                  style={styles.textInput}
                  value={meterNumber}
                  onChangeText={setMeterNumber}
                  keyboardType="numeric"
                  placeholder="5371-2099-1823"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <Text style={styles.inputHelperText}>ID Pelanggan: 5371-2099-1823 • Budi Santoso (R1M/1300VA)</Text>
            </View>

            <Text style={styles.sectionTitle}>Pilih Nominal Token PLN</Text>
            <View style={styles.productsList}>
              {tokenPlnItems.map((item) => {
                const isSelected = selectedProduct?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.productCard, isSelected && styles.productCardActive]}
                    onPress={() => handleSelectProduct(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.productTopRow}>
                      <Text style={[styles.productTitle, isSelected && styles.productTitleActive]}>
                        {item.title}
                      </Text>
                      {item.isPromo && (
                        <View style={styles.promoBadge}>
                          <Text style={styles.promoBadgeText}>PROMO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.productDesc}>{item.desc}</Text>
                    <View style={styles.productPriceRow}>
                      <Text style={[styles.productPrice, isSelected && styles.productPriceActive]}>
                        Rp {formatRupiah(item.price)}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ================= C. MODE: TOP UP E-MONEY ================= */}
        {mode === 'emoney' && (
          <>
            <View style={styles.inputCard}>
              <Text style={styles.inputCardLabel}>Pilih Penyedia E-Money / Dompet Digital</Text>
              <View style={styles.emoneyProviderGrid}>
                {emoneyProviderList.map((prov) => {
                  const isSelected = selectedEmoneyProvider === prov.id;
                  return (
                    <TouchableOpacity
                      key={prov.id}
                      style={[styles.emoneyProvCard, isSelected && styles.emoneyProvCardActive]}
                      onPress={() => setSelectedEmoneyProvider(prov.id as any)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.emoneyLogoBox}>
                        <Image source={prov.logo} style={styles.emoneyProvLogo} resizeMode="contain" />
                      </View>
                      <Text style={[styles.emoneyProvText, isSelected && styles.emoneyProvTextActive]}>
                        {prov.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 12 }]}>Nomor Kartu / HP Akun E-Money</Text>
              <View style={styles.inputBoxRow}>
                <AppIcon name="topup" size={16} color="#059669" />
                <TextInput
                  style={styles.textInput}
                  value={emoneyNumber}
                  onChangeText={setEmoneyNumber}
                  keyboardType="numeric"
                  placeholder="Nomor kartu e-Toll / No HP e-Wallet"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Pilih Nominal Top Up</Text>
            <View style={styles.productsList}>
              {emoneyItems.map((item) => {
                const isSelected = selectedProduct?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.productCard, isSelected && styles.productCardActive]}
                    onPress={() => handleSelectProduct(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.productTopRow}>
                      <Text style={[styles.productTitle, isSelected && styles.productTitleActive]}>
                        {item.title}
                      </Text>
                      {item.isPromo && (
                        <View style={styles.promoBadge}>
                          <Text style={styles.promoBadgeText}>PROMO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.productDesc}>{item.desc}</Text>
                    <View style={styles.productPriceRow}>
                      <Text style={[styles.productPrice, isSelected && styles.productPriceActive]}>
                        Rp {formatRupiah(item.price)}
                      </Text>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ================= D. MODE: PEMBAYARAN PDAM ================= */}
        {mode === 'pdam' && (
          <>
            <View style={styles.inputCard}>
              <View style={styles.serviceBrandHeader}>
                <View style={[styles.serviceBrandLogoWrap, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]}>
                  <Image source={pdamLogo} style={styles.serviceBrandLogo} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceBrandTitle}>PDAM Air Minum</Text>
                  <Text style={styles.serviceBrandSub}>Pembayaran Rekening Air Bersih Daerah</Text>
                </View>
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 12 }]}>Wilayah Layanan PDAM</Text>
              <View style={styles.inputBoxRow}>
                <AppIcon name="pdam" size={16} color="#0284c7" />
                <TextInput
                  style={styles.textInput}
                  value={pdamWilayah}
                  onChangeText={setPdamWilayah}
                  placeholder="Pilih / ketik nama kota PDAM"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 10 }]}>Nomor Sambungan / Pelanggan PDAM</Text>
              <View style={styles.inputBoxRow}>
                <AppIcon name="receipt" size={16} color="#0284c7" />
                <TextInput
                  style={styles.textInput}
                  value={pdamNumber}
                  onChangeText={setPdamNumber}
                  keyboardType="numeric"
                  placeholder="Contoh: 1029384756"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <Text style={[styles.inputCardLabel, { marginTop: 12 }]}>Hasil Cek Tagihan PDAM</Text>
              <View
                style={[
                  styles.inquiryStatusCard,
                  isPdamPaid ? styles.inquiryStatusCardPaid : styles.inquiryStatusCardUnpaid,
                ]}
              >
                <View style={styles.inquiryStatusLeft}>
                  <View
                    style={[
                      styles.inquiryStatusIconCircle,
                      isPdamPaid ? styles.inquiryStatusIconPaid : styles.inquiryStatusIconUnpaid,
                    ]}
                  >
                    <AppIcon
                      name={isPdamPaid ? 'check-circle' : 'receipt'}
                      size={18}
                      color={isPdamPaid ? '#16a34a' : '#ef4444'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inquiryStatusHeading}>
                      {isPdamPaid ? 'Tagihan Periode Ini Lunas' : 'Tagihan Agustus 2026'}
                    </Text>
                    <Text style={styles.inquiryStatusSub}>
                      {isPdamPaid
                        ? 'Tidak ada tunggakan tagihan air PDAM'
                        : '1 Bulan pemakaian (24 m³) belum dibayar'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.inquiryBadgePill,
                    isPdamPaid ? styles.inquiryBadgePillGreen : styles.inquiryBadgePillRed,
                  ]}
                >
                  <Text
                    style={[
                      styles.inquiryBadgePillText,
                      isPdamPaid ? styles.inquiryBadgePillTextGreen : styles.inquiryBadgePillTextRed,
                    ]}
                  >
                    {isPdamPaid ? 'LUNAS' : 'BELUM BAYAR'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Rincian Tagihan Air PDAM</Text>
            <View style={styles.billInquiryCard}>
              <View style={styles.billHeaderRow}>
                <View style={styles.billIconCircle}>
                  <Image source={pdamLogo} style={{ width: 26, height: 26 }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.billTitleText}>{pdamWilayah}</Text>
                  <Text style={styles.billSubText}>ID: {pdamNumber} • {pdamBill.customerName}</Text>
                </View>
                <View
                  style={[
                    styles.unpaidPill,
                    isPdamPaid
                      ? { backgroundColor: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.25)' }
                      : { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.unpaidPillText,
                      { color: isPdamPaid ? '#16a34a' : '#ef4444' },
                    ]}
                  >
                    {isPdamPaid ? 'Lunas' : 'Belum Bayar'}
                  </Text>
                </View>
              </View>

              <View style={styles.billDetailBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Nama Pelanggan</Text>
                  <Text style={styles.billRowVal}>{pdamBill.customerName}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Periode Tagihan</Text>
                  <Text style={styles.billRowVal}>Agustus 2026</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Status Tagihan</Text>
                  <Text
                    style={[
                      styles.billRowVal,
                      { color: isPdamPaid ? '#16a34a' : '#ef4444', fontWeight: '800' },
                    ]}
                  >
                    {isPdamPaid ? 'Sudah Dibayar (Lunas)' : 'Belum Dibayar'}
                  </Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Jumlah Pemakaian</Text>
                  <Text style={styles.billRowVal}>{pdamBill.pemakaian}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Tarif Air</Text>
                  <Text style={styles.billRowVal}>Rp {formatRupiah(pdamBill.tarifAir)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Biaya Admin Koperasi</Text>
                  <Text style={styles.billRowVal}>Rp {formatRupiah(pdamBill.admin)}</Text>
                </View>
                <View style={styles.billDivider} />
                <View style={styles.billRow}>
                  <Text style={styles.billTotalLabel}>Total Pembayaran</Text>
                  <Text
                    style={[
                      styles.billTotalVal,
                      { color: isPdamPaid ? '#16a34a' : '#0284c7' },
                    ]}
                  >
                    {isPdamPaid ? 'Rp 0 (Lunas)' : `Rp ${formatRupiah(pdamBill.price)}`}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ================= E. MODE: PEMBAYARAN BPJS ================= */}
        {mode === 'bpjs' && (
          <>
            <View style={styles.inputCard}>
              <View style={styles.serviceBrandHeader}>
                <View style={[styles.serviceBrandLogoWrap, { backgroundColor: '#f0fdfa', borderColor: '#99f6e4' }]}>
                  <Image source={bpjsLogo} style={styles.serviceBrandLogo} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceBrandTitle}>BPJS Kesehatan & Ketenagakerjaan</Text>
                  <Text style={styles.serviceBrandSub}>Iuran Jaminan Sosial Nasional</Text>
                </View>
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 12 }]}>Pilih Layanan BPJS</Text>
              <View style={styles.bpjsTypeRow}>
                <TouchableOpacity
                  style={[styles.bpjsTypeBtn, bpjsType === 'kesehatan' && styles.bpjsTypeBtnActive]}
                  onPress={() => setBpjsType('kesehatan')}
                  activeOpacity={0.8}
                >
                  <Image source={bpjsLogo} style={{ width: 18, height: 18 }} resizeMode="contain" />
                  <Text style={[styles.bpjsTypeText, bpjsType === 'kesehatan' && styles.bpjsTypeTextActive]}>
                    BPJS Kesehatan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bpjsTypeBtn, bpjsType === 'ketenagakerjaan' && styles.bpjsTypeBtnActive]}
                  onPress={() => setBpjsType('ketenagakerjaan')}
                  activeOpacity={0.8}
                >
                  <Image source={bpjsLogo} style={{ width: 18, height: 18 }} resizeMode="contain" />
                  <Text style={[styles.bpjsTypeText, bpjsType === 'ketenagakerjaan' && styles.bpjsTypeTextActive]}>
                    BPJS Ketenagakerjaan
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 10 }]}>Nomor Virtual Account / Peserta BPJS</Text>
              <View style={styles.inputBoxRow}>
                <AppIcon name="receipt" size={16} color="#0d9488" />
                <TextInput
                  style={styles.textInput}
                  value={bpjsNumber}
                  onChangeText={setBpjsNumber}
                  keyboardType="numeric"
                  placeholder="Contoh: 0001234567890"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={[styles.inputCardLabel, { marginTop: 12 }]}>Hasil Cek Tagihan BPJS</Text>
              <View
                style={[
                  styles.inquiryStatusCard,
                  isBpjsPaid ? styles.inquiryStatusCardPaid : styles.inquiryStatusCardUnpaid,
                ]}
              >
                <View style={styles.inquiryStatusLeft}>
                  <View
                    style={[
                      styles.inquiryStatusIconCircle,
                      isBpjsPaid ? styles.inquiryStatusIconPaid : styles.inquiryStatusIconUnpaid,
                    ]}
                  >
                    <AppIcon
                      name={isBpjsPaid ? 'check-circle' : 'receipt'}
                      size={18}
                      color={isBpjsPaid ? '#16a34a' : '#ef4444'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inquiryStatusHeading}>
                      {isBpjsPaid ? 'Tagihan Bulan Ini Lunas' : 'Tagihan September 2026'}
                    </Text>
                    <Text style={styles.inquiryStatusSub}>
                      {isBpjsPaid
                        ? 'Tidak ada tunggakan iuran BPJS'
                        : '1 Periode (September 2026) belum dibayar'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.inquiryBadgePill,
                    isBpjsPaid ? styles.inquiryBadgePillGreen : styles.inquiryBadgePillRed,
                  ]}
                >
                  <Text
                    style={[
                      styles.inquiryBadgePillText,
                      isBpjsPaid ? styles.inquiryBadgePillTextGreen : styles.inquiryBadgePillTextRed,
                    ]}
                  >
                    {isBpjsPaid ? 'LUNAS' : 'BELUM BAYAR'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Rincian Tagihan BPJS</Text>
            <View style={styles.billInquiryCard}>
              <View style={styles.billHeaderRow}>
                <View style={[styles.billIconCircle, { backgroundColor: 'rgba(13, 148, 136, 0.15)' }]}>
                  <Image source={bpjsLogo} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.billTitleText}>
                    {bpjsType === 'kesehatan' ? 'BPJS Kesehatan Mandiri' : 'BPJS Ketenagakerjaan BPU'}
                  </Text>
                  <Text style={styles.billSubText}>VA: {bpjsNumber} • {bpjsBill.customerName}</Text>
                </View>
                <View
                  style={[
                    styles.unpaidPill,
                    isBpjsPaid
                      ? { backgroundColor: 'rgba(22, 163, 74, 0.12)', borderColor: 'rgba(22, 163, 74, 0.25)' }
                      : { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.unpaidPillText,
                      { color: isBpjsPaid ? '#16a34a' : '#ef4444' },
                    ]}
                  >
                    {isBpjsPaid ? 'Lunas' : 'Belum Bayar'}
                  </Text>
                </View>
              </View>

              <View style={styles.billDetailBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Nama Peserta</Text>
                  <Text style={styles.billRowVal}>Budi Santoso (1 Peserta)</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Periode Tagihan</Text>
                  <Text style={styles.billRowVal}>September 2026</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Status Tagihan</Text>
                  <Text
                    style={[
                      styles.billRowVal,
                      { color: isBpjsPaid ? '#16a34a' : '#ef4444', fontWeight: '800' },
                    ]}
                  >
                    {isBpjsPaid ? 'Sudah Dibayar (Lunas)' : 'Belum Dibayar'}
                  </Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Iuran Pokok</Text>
                  <Text style={styles.billRowVal}>Rp {formatRupiah(bpjsBill.iuranPokok)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billRowLabel}>Biaya Admin Koperasi</Text>
                  <Text style={styles.billRowVal}>Rp {formatRupiah(bpjsBill.admin)}</Text>
                </View>
                <View style={styles.billDivider} />
                <View style={styles.billRow}>
                  <Text style={styles.billTotalLabel}>Total Tagihan</Text>
                  <Text
                    style={[
                      styles.billTotalVal,
                      { color: isBpjsPaid ? '#16a34a' : '#0d9488' },
                    ]}
                  >
                    {isBpjsPaid ? 'Rp 0 (Lunas)' : `Rp ${formatRupiah(bpjsBill.price)}`}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* 4. Checkout Bottom Bar */}
        {(mode === 'pdam' || mode === 'bpjs' || selectedProduct) && (
          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.checkoutTotalLabel}>
                {((mode === 'bpjs' && isBpjsPaid) || (mode === 'pdam' && isPdamPaid))
                  ? 'Status Tagihan:'
                  : 'Total Bayar (Simpanan Sukarela):'}
              </Text>
              <Text
                style={[
                  styles.checkoutTotalVal,
                  ((mode === 'bpjs' && isBpjsPaid) || (mode === 'pdam' && isPdamPaid)) && { color: '#16a34a' },
                ]}
              >
                {((mode === 'bpjs' && isBpjsPaid) || (mode === 'pdam' && isPdamPaid))
                  ? 'Sudah Lunas'
                  : `Rp ${formatRupiah(getEffectiveProduct()?.price || 0)}`}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                ((mode === 'bpjs' && isBpjsPaid) || (mode === 'pdam' && isPdamPaid)) && styles.checkoutBtnDisabled,
              ]}
              onPress={handleProceedPay}
              disabled={(mode === 'bpjs' && isBpjsPaid) || (mode === 'pdam' && isPdamPaid)}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>
                {mode === 'bpjs'
                  ? isBpjsPaid
                    ? 'Sudah Lunas'
                    : 'Bayar Tagihan'
                  : mode === 'pdam'
                  ? isPdamPaid
                    ? 'Sudah Lunas'
                    : 'Bayar Tagihan'
                  : 'Beli Sekarang'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 5. MODAL PIN KEAMANAN */}
      <Modal visible={pinModalVisible} transparent animationType="slide" onRequestClose={() => setPinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <AppIcon name="lock" size={17} color="#1d72db" />
                <Text style={styles.modalTitle}>Konfirmasi Pembayaran</Text>
              </View>
              <TouchableOpacity onPress={() => setPinModalVisible(false)} style={styles.modalCloseBtn}>
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            {getEffectiveProduct() && (
              <View style={styles.confirmSummaryBox}>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Layanan</Text>
                  <Text style={styles.confirmValBold}>{getEffectiveProduct()?.title}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Tujuan / ID</Text>
                  <Text style={styles.confirmVal}>
                    {mode === 'token'
                      ? meterNumber
                      : mode === 'emoney'
                      ? `${selectedEmoneyProvider.toUpperCase()} - ${emoneyNumber}`
                      : mode === 'pdam'
                      ? pdamNumber
                      : mode === 'bpjs'
                      ? bpjsNumber
                      : phoneNumber}
                  </Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Total Potong Simpanan</Text>
                  <Text style={styles.confirmValGreen}>Rp {formatRupiah(getEffectiveProduct()?.price || 0)}</Text>
                </View>
              </View>
            )}

            <Text style={styles.pinInstruction}>Masukkan 6-Digit PIN Transaksi:</Text>
            <TextInput
              style={styles.pinInputField}
              value={pinInput}
              onChangeText={(v) => setPinInput(v.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="numeric"
              secureTextEntry
              placeholder="••••••"
              placeholderTextColor="#94a3b8"
              maxLength={6}
              autoFocus
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPinModalVisible(false)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmPIN} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Konfirmasi Bayar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. MODAL SUKSES TRANSAKSI */}
      <Modal visible={successModalVisible} transparent animationType="fade" onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconOuter}>
              <AppIcon name="check-circle" size={42} color="#16a34a" />
            </View>

            <Text style={styles.successTitle}>Transaksi Berhasil!</Text>
            <Text style={styles.successSub}>
              Pembayaran telah didebit dari Simpanan Sukarela Anda.
            </Text>

            {lastTxData && (
              <View style={styles.receiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Layanan</Text>
                  <Text style={styles.receiptVal}>{lastTxData.productName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Tujuan</Text>
                  <Text style={styles.receiptVal}>{lastTxData.target}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Nomor Referensi</Text>
                  <Text style={styles.receiptVal}>{lastTxData.txNo}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Bayar</Text>
                  <Text style={styles.receiptValGreen}>Rp {formatRupiah(lastTxData.price)}</Text>
                </View>

                {lastTxData.tokenCode && (
                  <View style={styles.tokenBox}>
                    <Text style={styles.tokenBoxLabel}>KODE STROOM TOKEN PLN:</Text>
                    <Text style={styles.tokenCodeText}>{lastTxData.tokenCode}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setSuccessModalVisible(false);
                onBack();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Selesai & Kembali ke Beranda</Text>
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
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
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
    flex: 1,
  },
  topNavTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  topNavSub: {
    fontSize: 9.5,
    color: '#dbeafe',
    marginTop: 1,
    fontWeight: '500',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  balanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 12,
  },
  balanceBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
  },
  balanceBarValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d72db',
  },

  /* Tabs for Mobile Recharge */
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 3,
    borderRadius: 10,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#1d72db',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },

  /* Input Card */
  inputCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0f172a',
    fontWeight: '600',
  },
  inputHelperText: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 5,
    fontWeight: '500',
  },

  /* BPJS Type & Month Chips */
  bpjsTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  bpjsTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bpjsTypeBtnActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0f766e',
  },
  bpjsTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  bpjsTypeTextActive: {
    color: '#ffffff',
  },
  /* BPJS Inquiry Status Card */
  inquiryStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
    gap: 8,
  },
  inquiryStatusCardUnpaid: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  inquiryStatusCardPaid: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  inquiryStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  inquiryStatusIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquiryStatusIconUnpaid: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  inquiryStatusIconPaid: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
  },
  inquiryStatusHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  inquiryStatusSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
  inquiryBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  inquiryBadgePillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  inquiryBadgePillGreen: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  inquiryBadgePillText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  inquiryBadgePillTextRed: {
    color: '#ef4444',
  },
  inquiryBadgePillTextGreen: {
    color: '#16a34a',
  },

  /* Inquiry Bill Card for PDAM and BPJS */
  billInquiryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  billHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  billIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  billSubText: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  unpaidPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  unpaidPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ef4444',
  },
  billDetailBox: {
    gap: 6,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billRowLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },
  billRowVal: {
    fontSize: 10.5,
    color: '#1e293b',
    fontWeight: '700',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  billTotalLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  billTotalVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0284c7',
  },

  /* Product List */
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  productsList: {
    gap: 8,
    marginBottom: 14,
  },
  productCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
  },
  productCardActive: {
    borderColor: '#1d72db',
    backgroundColor: '#f0f7ff',
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  productTitleActive: {
    color: '#1d72db',
  },
  promoBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  promoBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ef4444',
  },
  productDesc: {
    fontSize: 9.5,
    color: '#64748b',
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  productPriceActive: {
    color: '#1d72db',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#1d72db',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1d72db',
  },

  /* Bottom Checkout Bar */
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 6,
  },
  checkoutTotalLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  checkoutTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1d72db',
    marginTop: 1,
  },
  checkoutBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* PIN Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  confirmSummaryBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
    marginBottom: 12,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  confirmVal: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: '600',
  },
  confirmValBold: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 2,
  },
  confirmValGreen: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16a34a',
  },
  pinInstruction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textAlign: 'center',
  },
  pinInputField: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1d72db',
    height: 44,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#0f172a',
    marginBottom: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#1d72db',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* Success Modal */
  successCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  successIconOuter: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  successSub: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    marginBottom: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  receiptVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptValGreen: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#16a34a',
  },
  tokenBox: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
    alignItems: 'center',
  },
  tokenBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 2,
  },
  tokenCodeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#d97706',
    letterSpacing: 1,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#1d72db',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* Service Brand Headers & Logo Cards */
  serviceBrandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  serviceBrandLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceBrandLogo: {
    width: 26,
    height: 26,
  },
  serviceBrandTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  serviceBrandSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },

  /* E-Money Grid with Real Logos */
  emoneyProviderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 4,
  },
  emoneyProvCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoneyProvCardActive: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  emoneyLogoBox: {
    width: 44,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoneyProvLogo: {
    width: 40,
    height: 20,
  },
  emoneyProvText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emoneyProvTextActive: {
    color: '#1d72db',
    fontWeight: '800',
  },
});
