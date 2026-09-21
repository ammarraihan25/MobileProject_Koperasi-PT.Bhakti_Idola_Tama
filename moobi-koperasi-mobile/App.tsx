import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Platform,
} from 'react-native';
import { colors } from './src/theme/colors';
import { TabType, ActiveScreenType, TransactionItem } from './src/types';
import { BottomTabBar } from './src/components/BottomTabBar';
import { mockWallet, mockTransactions, mockUser } from './src/data/mockData';

// Main Tab Screens
import { BerandaScreen } from './src/screens/BerandaScreen';
import { KeuanganScreen } from './src/screens/KeuanganScreen';
import { RiwayatScreen } from './src/screens/RiwayatScreen';
import { ProfilScreen } from './src/screens/ProfilScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SplashScreen } from './src/screens/SplashScreen';

// Full-Page Feature Screens
import { PulsaScreen } from './src/screens/features/PulsaScreen';
import {
  PinjamanScreen,
  SubmittedLoanTicket,
  ActiveLoanBreakdown,
} from './src/screens/features/PinjamanScreen';
import { KantinScreen } from './src/screens/features/KantinScreen';
import { SimpananWajibScreen } from './src/screens/features/SimpananWajibScreen';
import { SimpananSukarelaScreen } from './src/screens/features/SimpananSukarelaScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<ActiveScreenType>('beranda');
  const [currentTab, setCurrentTab] = useState<TabType>('beranda');

  // Shared Wallet State (Simpanan Sukarela is the active balance)
  const [userBalance, setUserBalance] = useState<number>(mockWallet.simpananSukarela);
  const [userCoins, setUserCoins] = useState<number>(mockWallet.moobiCoins);
  const [walletState, setWalletState] = useState(mockWallet);

  // Shared Loan State (Persisted across screen navigation)
  const [submittedLoanTicket, setSubmittedLoanTicket] = useState<SubmittedLoanTicket | null>(null);
  const [activeLoanBreakdown, setActiveLoanBreakdown] = useState<ActiveLoanBreakdown | null>(null);

  // Shared Bill & PPoB Paid Status (Persisted across screen navigation)
  const [bpjsPaidStatus, setBpjsPaidStatus] = useState<{ kesehatan: boolean; ketenagakerjaan: boolean }>({
    kesehatan: false,
    ketenagakerjaan: false,
  });
  const [pdamPaidStatus, setPdamPaidStatus] = useState<boolean>(false);
  const [paidBills, setPaidBills] = useState<string[]>(['internet']);

  // Shared User Avatar (Integrated across Beranda & Profil)
  const [userAvatarUri, setUserAvatarUri] = useState<string | null>(mockUser.avatarUri || null);

  // Shared Transactions State
  const [transactions, setTransactions] = useState<TransactionItem[]>(mockTransactions);
  const [ppobInitialTab, setPpobInitialTab] = useState<'pulsa' | 'token' | 'emoney'>('pulsa');

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
    category: 'kantin' | 'elektronik' | 'ppob' | 'simpan_pinjam' | 'payroll' | 'topup',
    amount: number,
    paymentSource: string = 'Simpanan Sukarela',
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

  // Loan Application Handler (Submitted to HR)
  const handleApplyLoan = (amount: number, tenor: number) => {
    recordTransaction(
      'Pengajuan Pinjaman (HR Approval)',
      'simpan_pinjam',
      amount,
      'Verifikasi Payroll PT BIT',
      `Tiket pengajuan pinjaman ${tenor} bulan telah dikirimkan ke HRD untuk persetujuan`,
      'paylater',
      true
    );
  };

  // Loan Repayment Handler
  const handleRepayLoan = (amount: number) => {
    setWalletState((w) => {
      const newPinjaman = Math.max(0, w.pinjamanAktif - amount);
      const isLunas = newPinjaman === 0;
      const newTenor = isLunas ? 0 : w.sisaTenorBulan;
      const newAngsuran = isLunas ? 0 : Math.round(newPinjaman / Math.max(1, newTenor));
      return {
        ...w,
        pinjamanAktif: newPinjaman,
        angsuranPerBulan: newAngsuran,
        sisaTenorBulan: newTenor,
        plafonPinjaman: Math.min(25000000, w.plafonPinjaman + amount),
      };
    });

    recordTransaction(
      'Pembayaran Angsuran Pinjaman',
      'simpan_pinjam',
      amount,
      'VA Bank / QRIS Pihak Ke-3',
      'Pembayaran / pelunasan cicilan pinjaman PT Bakti Idola Tama via Payment Gateway',
      'simpanan',
      false
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
            userAvatarUri={userAvatarUri}
            walletState={walletState}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            onNavigateTab={handleTabChange}
            onOpenPPOB={(tab) => {
              setPpobInitialTab(tab);
              setCurrentScreen('pulsa');
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
            simpananWajib={walletState.simpananWajib}
            simpananSukarela={userBalance}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
          />
        );

      case 'riwayat':
        return <RiwayatScreen transactions={transactions} />;

      case 'profil':
        return (
          <ProfilScreen
            userBalance={userBalance}
            userAvatarUri={userAvatarUri}
            onUpdateAvatar={setUserAvatarUri}
            walletState={walletState}
            onNavigateTab={handleTabChange}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            onLogout={() => setIsLoggedIn(false)}
          />
        );


      case 'pulsa':
      case 'token':
      case 'emoney':
      case 'pdam':
      case 'bpjs':
        return (
          <PulsaScreen
            mode={currentScreen}
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            bpjsPaidStatus={bpjsPaidStatus}
            pdamPaidStatus={pdamPaidStatus}
            onUpdateBpjsPaidStatus={(type, isPaid) => {
              setBpjsPaidStatus((prev) => ({ ...prev, [type]: isPaid }));
              if (type === 'kesehatan') {
                setPaidBills((prev) => (prev.includes('bpjs') ? prev : [...prev, 'bpjs']));
              }
            }}
            onUpdatePdamPaidStatus={(isPaid) => {
              setPdamPaidStatus(isPaid);
              setPaidBills((prev) => (prev.includes('pdam') ? prev : [...prev, 'pdam']));
            }}
            onPurchaseSuccess={(amt, product, category, targetNumber) => {
              const getIcon = () => {
                switch (category) {
                  case 'token':
                    return 'zap';
                  case 'emoney':
                    return 'topup';
                  case 'pdam':
                    return 'pdam';
                  case 'bpjs':
                    return 'bpjs';
                  default:
                    return 'pulsa';
                }
              };
              recordTransaction(
                `${product}`,
                category === 'emoney' ? 'topup' : 'ppob',
                amt,
                'Payment Gateway (Pihak Ke-3)',
                `Pembayaran transaksi ${targetNumber} via Payment Gateway Pihak Ke-3`,
                getIcon(),
                false
              );
            }}
          />
        );

      case 'pinjaman':
        return (
          <PinjamanScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            maxPlafon={walletState.plafonPinjaman}
            pinjamanAktif={walletState.pinjamanAktif}
            angsuranPerBulan={walletState.angsuranPerBulan}
            sisaTenorBulan={walletState.sisaTenorBulan}
            gajiBulanan={mockUser.gajiBulanan}
            masaKerjaBulan={mockUser.masaKerjaBulan}
            submittedTicket={submittedLoanTicket}
            onSaveSubmittedTicket={setSubmittedLoanTicket}
            activeLoanBreakdown={activeLoanBreakdown}
            onSaveActiveLoanBreakdown={setActiveLoanBreakdown}
            onApproveLoan={(newActiveDebt, newMonthly, newTenor) => {
              setWalletState((prev) => ({
                ...prev,
                pinjamanAktif: newActiveDebt,
                angsuranPerBulan: newMonthly,
                sisaTenorBulan: newTenor,
              }));
            }}
            onApplySuccess={handleApplyLoan}
            onRepaySuccess={handleRepayLoan}
            onNavigateKeuangan={() => {
              setCurrentTab('keuangan');
              setCurrentScreen('keuangan');
            }}
            onNavigateTopUp={() => {
              setCurrentTab('keuangan');
              setCurrentScreen('keuangan');
            }}
          />
        );

      case 'kantin':
        return (
          <KantinScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            onOrderSuccess={(amt, itemsCount, itemsSummary) => {
              recordTransaction(
                itemsSummary || `Kantin BIT (${itemsCount} Menu)`,
                'kantin',
                amt,
                'Payment Gateway (Pihak Ke-3)',
                `Pesanan Kantin PT BIT - ${itemsCount} porsi via Payment Gateway Pihak Ke-3`,
                'food',
                false
              );
            }}
            onNavigateRiwayat={() => {
              setCurrentTab('riwayat');
              setCurrentScreen('riwayat');
            }}
          />
        );

      case 'simpanan_wajib':
        return (
          <SimpananWajibScreen
            onBack={() => setCurrentScreen('beranda')}
            simpananWajib={walletState.simpananWajib}
          />
        );

      case 'simpanan_sukarela':
        return (
          <SimpananSukarelaScreen
            onBack={() => setCurrentScreen('beranda')}
            userBalance={userBalance}
            transactions={transactions}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
          />
        );

      default:
        return null;
    }
  };

  const isMainTab = ['beranda', 'keuangan', 'riwayat', 'profil'].includes(
    currentScreen
  );

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandBlue} />
      <View style={styles.container}>
        <View style={styles.contentArea}>{renderActiveScreen()}</View>

        {isMainTab && (
          <BottomTabBar
            currentTab={currentTab}
            onSelectTab={handleTabChange}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brandBlue,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentArea: {
    flex: 1,
  },
});
