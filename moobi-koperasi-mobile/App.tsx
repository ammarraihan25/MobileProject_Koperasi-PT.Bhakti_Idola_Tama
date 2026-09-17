import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Platform,
} from 'react-native';
import { colors } from './src/theme/colors';
import { TabType, ActiveScreenType, BillCategoryType, TransactionItem } from './src/types';
import { BottomTabBar } from './src/components/BottomTabBar';
import { mockWallet, mockTransactions } from './src/data/mockData';

// Main Tab Screens
import { BerandaScreen } from './src/screens/BerandaScreen';
import { KeuanganScreen } from './src/screens/KeuanganScreen';
import { QrisScreen } from './src/screens/QrisScreen';
import { RiwayatScreen } from './src/screens/RiwayatScreen';
import { ProfilScreen } from './src/screens/ProfilScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SplashScreen } from './src/screens/SplashScreen';

// Full-Page Feature Screens
import { ProdukElektronikScreen } from './src/screens/features/ProdukElektronikScreen';
import { TransferScreen } from './src/screens/features/TransferScreen';
import { TarikTunaiScreen } from './src/screens/features/TarikTunaiScreen';
import { TagihanScreen } from './src/screens/features/TagihanScreen';
import { PulsaScreen } from './src/screens/features/PulsaScreen';
import { PinjamanScreen } from './src/screens/features/PinjamanScreen';
import { KantinScreen } from './src/screens/features/KantinScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreenType>('beranda');
  const [currentTab, setCurrentTab] = useState<TabType>('beranda');

  // Shared Wallet State
  const [userBalance, setUserBalance] = useState<number>(mockWallet.saldoUtama);
  const [userCoins, setUserCoins] = useState<number>(mockWallet.moobiCoins);
  const [walletState, setWalletState] = useState(mockWallet);

  // Shared Transactions State
  const [transactions, setTransactions] = useState<TransactionItem[]>(mockTransactions);

  // Shared Bill / Tagihan State
  const [paidBills, setPaidBills] = useState<string[]>(['internet']);
  const [selectedTagihanCategory, setSelectedTagihanCategory] = useState<BillCategoryType>('pln');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'google-font-jakarta';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.innerHTML = `
          *, body, input, textarea, select, button, div, span, p, [dir="auto"] {
            font-family: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setCurrentScreen(tab);
  };

  // Helper to dynamically record new transactions into shared state
  const recordTransaction = (
    title: string,
    category: 'kantin' | 'elektronik' | 'ppob' | 'transfer' | 'tarik' | 'simpan_pinjam' | 'payroll' | 'topup',
    amount: number,
    paymentSource: string = 'Saldo Koperasi',
    description: string = '',
    iconName: string = 'receipt',
    isCredit: boolean = false
  ) => {
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} WIB`;
    const dateFormatted = `${now.getDate()} Sep 2026, ${timeFormatted}`;

    const newTx: TransactionItem = {
      id: `TX-${Date.now()}`,
      title,
      category,
      amount,
      isCredit,
      paymentSource,
      timestamp: dateFormatted,
      dateLabel: 'Hari Ini',
      monthLabel: 'September 2026',
      iconName,
      description,
      statusText: 'Berhasil',
      referenceNo: `BIT-${Date.now().toString().slice(-6)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Loan Application Handler
  const handleApplyLoan = (amount: number, tenor: number) => {
    const interest = Math.round(amount * 0.008);
    const newMonthly = Math.round(amount / tenor) + interest;

    setWalletState((prev) => ({
      ...prev,
      pinjamanAktif: prev.pinjamanAktif + amount,
      angsuranPerBulan: prev.angsuranPerBulan + newMonthly,
      sisaTenorBulan: tenor,
      plafonPinjaman: Math.max(0, prev.plafonPinjaman - amount),
    }));

    recordTransaction(
      'Pencairan Pinjaman Karyawan',
      'simpan_pinjam',
      amount,
      'Transfer Payroll BCA',
      `Pengajuan pinjaman dana tunai ${tenor} bulan PT Bakti Idola Tama disetujui`,
      'pinjaman',
      true
    );
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      // 5 Main Navigation Tabs
      case 'beranda':
        return (
          <BerandaScreen
            userBalance={userBalance}
            userCoins={userCoins}
            paidBills={paidBills}
            onNavigateScreen={(screen) => {
              if (screen === 'tagihan') {
                setSelectedTagihanCategory('pln');
              }
              setCurrentScreen(screen);
            }}
            onNavigateTab={handleTabChange}
            onPayBillPress={(cat) => {
              setSelectedTagihanCategory(cat);
              setCurrentScreen('tagihan');
            }}
          />
        );

      case 'keuangan':
        return (
          <KeuanganScreen
            userBalance={userBalance}
            userCoins={userCoins}
            plafonPinjaman={walletState.plafonPinjaman}
            pinjamanAktif={walletState.pinjamanAktif}
            angsuranPerBulan={walletState.angsuranPerBulan}
            sisaTenorBulan={walletState.sisaTenorBulan}
            simpananPokok={walletState.simpananPokok}
            simpananWajib={walletState.simpananWajib}
            simpananSukarela={walletState.simpananSukarela}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            onApplyLoan={handleApplyLoan}
          />
        );

      case 'qris':
        return (
          <QrisScreen
            userBalance={userBalance}
            onPaymentSuccess={(amt, merchantName, category, description) => {
              setUserBalance((prev) => prev - amt);
              recordTransaction(
                merchantName,
                category,
                amt,
                'Saldo Koperasi',
                description,
                'qris',
                false
              );
            }}
            onNavigateHistory={() => handleTabChange('riwayat')}
          />
        );

      case 'riwayat':
        return <RiwayatScreen transactions={transactions} />;

      case 'profil':
        return <ProfilScreen onLogout={() => setIsLoggedIn(false)} />;

      // 7 Full-Page Dedicated Feature Screens (No Overlays)
      case 'produk':
        return (
          <ProdukElektronikScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            onPurchaseSuccess={(totalPrice, itemsCount, paymentMethod, itemsSummary) => {
              if (paymentMethod === 'saldo') {
                setUserBalance((prev) => prev - totalPrice);
              }
              recordTransaction(
                itemsSummary || `Pembelian Elektronik (${itemsCount} Barang)`,
                'elektronik',
                totalPrice,
                paymentMethod,
                `Pembelian Produk Elektronik via ${
                  paymentMethod === 'saldo' ? 'Saldo Koperasi BIT' : 'Potong Gaji Payroll'
                }`,
                'tagihan',
                false
              );
            }}
          />
        );

      case 'transfer':
        return (
          <TransferScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            onTransferSuccess={(amt, dest) => {
              setUserBalance((prev) => prev - amt);
              recordTransaction(
                `Transfer ke ${dest}`,
                'transfer',
                amt,
                'saldo',
                `Transfer Saldo Koperasi ke ${dest}`,
                'transfer',
                false
              );
            }}
          />
        );

      case 'tarik':
        return (
          <TarikTunaiScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            onWithdrawSuccess={(amt, locationLabel) => {
              setUserBalance((prev) => prev - amt);
              recordTransaction(
                `Tarik Tunai (${locationLabel})`,
                'tarik',
                amt,
                'saldo',
                `Penarikan tunai tanpa kartu di ${locationLabel}`,
                'tarik',
                false
              );
            }}
          />
        );

      case 'tagihan':
        return (
          <TagihanScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            initialCategory={selectedTagihanCategory}
            paidBills={paidBills}
            onPaymentSuccess={(amt, catName, catId, paymentSource, customerId) => {
              if (paymentSource === 'saldo') {
                setUserBalance((prev) => prev - amt);
              }
              if (catId && !paidBills.includes(catId)) {
                setPaidBills((prev) => [...prev, catId]);
              }
              recordTransaction(
                `Bayar Tagihan ${catName}`,
                'ppob',
                amt,
                paymentSource,
                `No. Pelanggan: ${customerId} • ${
                  paymentSource === 'saldo' ? 'Saldo Koperasi' : 'Potong Gaji'
                }`,
                'tagihan',
                false
              );
            }}
          />
        );

      case 'pulsa':
        return (
          <PulsaScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            onPurchaseSuccess={(amt, product, operatorName, phoneNumber) => {
              setUserBalance((prev) => prev - amt);
              recordTransaction(
                `${product} (${operatorName})`,
                'ppob',
                amt,
                'saldo',
                `Isi ulang pulsa/kuota no ${phoneNumber}`,
                'pulsa',
                false
              );
            }}
          />
        );

      case 'pinjaman':
        return (
          <PinjamanScreen
            onBack={() => setCurrentScreen('beranda')}
            maxPlafon={walletState.plafonPinjaman}
            pinjamanAktif={walletState.pinjamanAktif}
            angsuranPerBulan={walletState.angsuranPerBulan}
            sisaTenorBulan={walletState.sisaTenorBulan}
            onApplySuccess={handleApplyLoan}
          />
        );

      case 'kantin':
        return (
          <KantinScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            onOrderSuccess={(amt, itemsCount, itemsSummary) => {
              setUserBalance((prev) => prev - amt);
              recordTransaction(
                itemsSummary || `Kantin BIT (${itemsCount} Menu)`,
                'kantin',
                amt,
                'saldo',
                `Pesanan Kantin PT BIT - ${itemsCount} menu makanan & minuman`,
                'food',
                false
              );
            }}
          />
        );

      default:
        return <BerandaScreen onNavigateTab={handleTabChange} />;
    }
  };

  if (showSplash) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#ffffff' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <SplashScreen
          durationSeconds={5}
          onFinish={() => setShowSplash(false)}
        />
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#0f172a' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LoginScreen
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setCurrentScreen('beranda');
            setCurrentTab('beranda');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1d72db" />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <BottomTabBar currentTab={currentTab} onSelectTab={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContainer: {
    flex: 1,
  },
});
