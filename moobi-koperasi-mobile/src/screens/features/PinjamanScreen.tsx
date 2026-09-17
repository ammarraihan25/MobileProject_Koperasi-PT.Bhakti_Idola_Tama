import React, { useState, useRef } from 'react';
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
import { mockWallet, mockUser } from '../../data/mockData';

const supportedQrisChannels = [
  { id: 'bca', name: 'BCA', logo: require('../../../assets/transfer/bca.png') },
  { id: 'mandiri', name: 'Mandiri', logo: require('../../../assets/transfer/mandiri.png') },
  { id: 'bri', name: 'BRI', logo: require('../../../assets/transfer/bri.png') },
  { id: 'bni', name: 'BNI', logo: require('../../../assets/transfer/bni.png') },
  { id: 'cimb', name: 'CIMB', logo: require('../../../assets/transfer/cimb.png') },
  { id: 'gopay', name: 'GoPay', logo: require('../../../assets/transfer/gopay.png') },
  { id: 'dana', name: 'DANA', logo: require('../../../assets/transfer/dana.png') },
  { id: 'ovo', name: 'OVO', logo: require('../../../assets/transfer/ovo.png') },
  { id: 'shopeepay', name: 'ShopeePay', logo: require('../../../assets/transfer/shopeepay.png') },
  { id: 'linkaja', name: 'LinkAja', logo: require('../../../assets/transfer/linkaja.png') },
];

type LoanScreenStage = 'form' | 'verification_calculation' | 'pending_verification';

export interface SubmittedLoanTicket {
  ticketNo: string;
  amount: number;
  tenor: number;
  monthly: number;
  purpose: string;
  submissionDate: string;
  estCompletionDate: string;
  combinedMonthly: number;
  combinedTotal: number;
  status: 'pending' | 'approved';
}

export interface ActiveLoanBreakdown {
  isMerged: boolean;
  oldLoanAmount: number;
  oldLoanMonthly: number;
  oldLoanTenor: number;
  newLoanAmount: number;
  newLoanMonthly: number;
  newLoanTenor: number;
}

interface PinjamanScreenProps {
  onBack: () => void;
  userBalance?: number;
  maxPlafon?: number;
  pinjamanAktif?: number;
  angsuranPerBulan?: number;
  sisaTenorBulan?: number;
  gajiBulanan?: number;
  masaKerjaBulan?: number;
  submittedTicket?: SubmittedLoanTicket | null;
  onSaveSubmittedTicket?: (ticket: SubmittedLoanTicket | null) => void;
  activeLoanBreakdown?: ActiveLoanBreakdown | null;
  onSaveActiveLoanBreakdown?: (breakdown: ActiveLoanBreakdown | null) => void;
  onApproveLoan?: (newActiveDebt: number, newMonthly: number, newTenor: number) => void;
  onApplySuccess?: (amount: number, tenor: number) => void;
  onRepaySuccess?: (amount: number) => void;
  onNavigateKeuangan?: () => void;
  onNavigateTopUp?: () => void;
}

export const PinjamanScreen: React.FC<PinjamanScreenProps> = ({
  onBack,
  userBalance = mockWallet.simpananSukarela,
  maxPlafon = mockWallet.plafonPinjaman,
  pinjamanAktif: initialPinjamanAktif = mockWallet.pinjamanAktif,
  angsuranPerBulan: initialAngsuran = mockWallet.angsuranPerBulan,
  sisaTenorBulan: initialTenor = mockWallet.sisaTenorBulan,
  gajiBulanan = mockUser.gajiBulanan,
  masaKerjaBulan = mockUser.masaKerjaBulan,
  submittedTicket: propSubmittedTicket,
  onSaveSubmittedTicket,
  activeLoanBreakdown: propActiveLoanBreakdown,
  onSaveActiveLoanBreakdown,
  onApproveLoan,
  onApplySuccess,
  onRepaySuccess,
  onNavigateKeuangan,
  onNavigateTopUp,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Active Loan States (Synchronized)
  const [currentPinjamanAktif, setCurrentPinjamanAktif] = useState<number>(initialPinjamanAktif);
  const [currentAngsuran, setCurrentAngsuran] = useState<number>(initialAngsuran);
  const [currentSisaTenor, setCurrentSisaTenor] = useState<number>(initialTenor);

  // Screen Stage Controller
  const [stage, setStage] = useState<LoanScreenStage>('form');

  // If there's an active loan or pending ticket, form is hidden by default and shown when user clicks "+ Ajukan Pinjaman"
  const [isFormVisible, setIsFormVisible] = useState<boolean>(
    initialPinjamanAktif === 0 && !propSubmittedTicket
  );

  // Form Inputs
  const [amountInput, setAmountInput] = useState<string>('5000000');
  const [selectedTenor, setSelectedTenor] = useState<number>(6);
  const [loanPurpose, setLoanPurpose] = useState<string>('');

  // Verification & PIN States
  const [pinInput, setPinInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Submitted Application Ticket Data (Local or Prop Sync)
  const [localSubmittedTicket, setLocalSubmittedTicket] = useState<SubmittedLoanTicket | null>(
    propSubmittedTicket || null
  );
  const submittedTicket = propSubmittedTicket !== undefined ? propSubmittedTicket : localSubmittedTicket;

  const updateSubmittedTicket = (ticket: SubmittedLoanTicket | null) => {
    setLocalSubmittedTicket(ticket);
    if (onSaveSubmittedTicket) {
      onSaveSubmittedTicket(ticket);
    }
  };

  // Active Loan Details Tracker (untuk penggabungan 2 angsuran saat approved)
  const [localActiveLoanBreakdown, setLocalActiveLoanBreakdown] = useState<ActiveLoanBreakdown | null>(
    propActiveLoanBreakdown || null
  );
  const activeLoanBreakdown =
    propActiveLoanBreakdown !== undefined ? propActiveLoanBreakdown : localActiveLoanBreakdown;

  const updateActiveLoanBreakdown = (breakdown: ActiveLoanBreakdown | null) => {
    setLocalActiveLoanBreakdown(breakdown);
    if (onSaveActiveLoanBreakdown) {
      onSaveActiveLoanBreakdown(breakdown);
    }
  };

  // Loan Breakdown Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

  // Repayment Modal States (Pelunasan Pinjaman Berjalan)
  const [repayModalVisible, setRepayModalVisible] = useState<boolean>(false);
  const [repayPaymentMethod, setRepayPaymentMethod] = useState<'simpanan' | 'qris'>('simpanan');
  const [repayAmountInput, setRepayAmountInput] = useState<string>(
    currentPinjamanAktif > 0 ? currentPinjamanAktif.toString() : '0'
  );
  const [repayPinModalVisible, setRepayPinModalVisible] = useState<boolean>(false);
  const [repayPinInput, setRepayPinInput] = useState<string>('');
  const [isRepaySubmitting, setIsRepaySubmitting] = useState<boolean>(false);

  // QRIS Payment Modal States
  const [qrisModalVisible, setQrisModalVisible] = useState<boolean>(false);
  const [isQrisProcessing, setIsQrisProcessing] = useState<boolean>(false);

  const [repaySuccessModalVisible, setRepaySuccessModalVisible] = useState<boolean>(false);
  const [lastRepayData, setLastRepayData] = useState<{
    amount: number;
    remainingDebt: number;
    remainingBalance: number;
    ticketNo: string;
    method: string;
  } | null>(null);

  // Business Calculations
  const maxDeductionPerMonth = Math.round(gajiBulanan * 0.3); // 30% Gaji
  const effectiveMaxPlafon = maxPlafon || maxDeductionPerMonth * 12;
  const interestRate = 0.008; // 0.8% Flat Koperasi
  const isEligibleTenure = masaKerjaBulan >= 12;

  const tenorOptions = [3, 6, 12, 18, 24];
  const presetAmounts = [2000000, 5000000, 10000000, 15000000];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const parsedAmount = Math.min(
    effectiveMaxPlafon,
    Math.max(0, parseInt(amountInput.replace(/[^0-9]/g, ''), 10) || 0)
  );

  const monthlyPrincipal = Math.round(parsedAmount / (selectedTenor || 1));
  const monthlyInterest = Math.round(parsedAmount * interestRate);
  const monthlyTotal = monthlyPrincipal + monthlyInterest;
  const totalRepayment = monthlyTotal * selectedTenor;

  // Combined Calculation with Old Loan
  const combinedTotalLoan = currentPinjamanAktif + parsedAmount;
  const combinedMonthlyInstallment = currentAngsuran + monthlyTotal;
  const combinedMaxTenor = Math.max(currentSisaTenor, selectedTenor);
  const isDeductionSafe = combinedMonthlyInstallment <= maxDeductionPerMonth;

  // Step 1: Proceed from Form to Verification & Calculation Step
  const handleProceedToVerification = () => {
    if (!isEligibleTenure) {
      Alert.alert(
        'Syarat Masa Kerja Belum Terpenuhi',
        `Pinjaman hanya dapat diajukan oleh anggota dengan masa kerja minimal 1 tahun (12 bulan). Masa kerja Anda saat ini: ${masaKerjaBulan} bulan.`
      );
      return;
    }
    if (parsedAmount < 500000) {
      Alert.alert('Nominal Tidak Valid', 'Minimal pengajuan pinjaman adalah Rp 500.000.');
      return;
    }
    if (parsedAmount > effectiveMaxPlafon) {
      Alert.alert(
        'Melebihi Batas Plafon',
        `Maksimal pinjaman Anda adalah Rp ${formatRupiah(effectiveMaxPlafon)}.`
      );
      return;
    }
    if (!isDeductionSafe) {
      Alert.alert(
        'Melebihi Batas 30% Gaji',
        `Total gabungan cicilan lama + baru (Rp ${formatRupiah(
          combinedMonthlyInstallment
        )}/bln) melebihi batas aman 30% gaji (Rp ${formatRupiah(
          maxDeductionPerMonth
        )}/bln). Kurangi nominal atau perpanjang tenor.`
      );
      return;
    }

    setPinInput('');
    setStage('verification_calculation');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Step 2: Confirm PIN & Submit Application -> Move to 'pending_verification'
  const handleConfirmSubmitApplication = () => {
    if (pinInput.length < 6) {
      Alert.alert('PIN Tidak Lengkap', 'Masukkan 6-digit PIN otorisasi transaksi Anda.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const ticketNo = `KOP-PINJ-${Date.now().toString().slice(-6)}`;
      const now = new Date();
      const submissionDate = `${now.getDate()} Sep 2026, ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')} WIB`;

      const estDate = new Date();
      estDate.setDate(now.getDate() + 2);
      const estCompletionDate = `${estDate.getDate()} Sep 2026 (Maks. 2 Hari Kerja)`;

      const ticketData: SubmittedLoanTicket = {
        ticketNo,
        amount: parsedAmount,
        tenor: selectedTenor,
        monthly: monthlyTotal,
        purpose: loanPurpose.trim() || 'Kebutuhan Pribadi / Mendesak',
        submissionDate,
        estCompletionDate,
        combinedMonthly: combinedMonthlyInstallment,
        combinedTotal: combinedTotalLoan,
        status: 'pending',
      };

      updateSubmittedTicket(ticketData);

      if (onApplySuccess) {
        onApplySuccess(parsedAmount, selectedTenor);
      }

      setStage('pending_verification');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 700);
  };

  // Approval Action: Koperasi approves application -> combines loans if 2 exist
  const handleApproveApplication = () => {
    if (!submittedTicket) return;

    const newTicket: SubmittedLoanTicket = {
      ...submittedTicket,
      status: 'approved',
    };

    if (currentPinjamanAktif > 0) {
      // Gabungkan 2 Angsuran (Lama + Baru) dengan kalkulasi terpadu
      const newMergedBreakdown: ActiveLoanBreakdown = {
        isMerged: true,
        oldLoanAmount: currentPinjamanAktif,
        oldLoanMonthly: currentAngsuran,
        oldLoanTenor: currentSisaTenor,
        newLoanAmount: submittedTicket.amount,
        newLoanMonthly: submittedTicket.monthly,
        newLoanTenor: submittedTicket.tenor,
      };
      updateActiveLoanBreakdown(newMergedBreakdown);
      setCurrentPinjamanAktif(submittedTicket.combinedTotal);
      setCurrentAngsuran(submittedTicket.combinedMonthly);
      setCurrentSisaTenor(Math.max(currentSisaTenor, submittedTicket.tenor));

      if (onApproveLoan) {
        onApproveLoan(
          submittedTicket.combinedTotal,
          submittedTicket.combinedMonthly,
          Math.max(currentSisaTenor, submittedTicket.tenor)
        );
      }
    } else {
      // Pinjaman Tunggal Baru
      updateActiveLoanBreakdown(null);
      setCurrentPinjamanAktif(submittedTicket.amount);
      setCurrentAngsuran(submittedTicket.monthly);
      setCurrentSisaTenor(submittedTicket.tenor);

      if (onApproveLoan) {
        onApproveLoan(submittedTicket.amount, submittedTicket.monthly, submittedTicket.tenor);
      }
    }

    updateSubmittedTicket(newTicket);
    setIsFormVisible(false);
    setStage('form');

    Alert.alert(
      'Pengajuan Disetujui! 🎉',
      `Koperasi PT BIT telah menyetujui pengajuan pinjaman Rp ${formatRupiah(
        submittedTicket.amount
      )}. ${
        currentPinjamanAktif > 0
          ? 'Kalkulasi angsuran lama & baru telah disatukan dalam pinjaman aktif.'
          : 'Pinjaman aktif kini telah tampil.'
      }`
    );
  };

  // Repayment Flow Handlers
  const parsedRepay = Math.min(
    currentPinjamanAktif,
    Math.max(0, parseInt(repayAmountInput.replace(/[^0-9]/g, ''), 10) || 0)
  );
  const isRepayInsufficient = parsedRepay > userBalance;
  const repayShortage = Math.max(0, parsedRepay - userBalance);

  const handleInitiateRepay = () => {
    if (parsedRepay <= 0) {
      Alert.alert('Nominal Tidak Valid', 'Masukkan nominal pembayaran minimal Rp 1.');
      return;
    }

    if (repayPaymentMethod === 'simpanan') {
      if (isRepayInsufficient) {
        Alert.alert(
          'Simpanan Sukarela Kurang',
          `Saldo Simpanan Sukarela Anda (Rp ${formatRupiah(userBalance)}) tidak cukup untuk membayar Rp ${formatRupiah(
            parsedRepay
          )}.`
        );
        return;
      }
      setRepayPinInput('');
      setRepayModalVisible(false);
      setRepayPinModalVisible(true);
    } else {
      // Bayar via QRIS Koperasi
      setRepayModalVisible(false);
      setQrisModalVisible(true);
    }
  };

  const handleConfirmRepayWithPin = () => {
    if (repayPinInput.length < 6) {
      Alert.alert('PIN Tidak Lengkap', 'Masukkan 6-digit PIN keamanan Anda.');
      return;
    }

    setIsRepaySubmitting(true);
    setTimeout(() => {
      setIsRepaySubmitting(false);
      setRepayPinModalVisible(false);

      const actualRepay = Math.min(parsedRepay, currentPinjamanAktif);
      const remainingDebt = Math.max(0, currentPinjamanAktif - actualRepay);
      const remainingBalance = Math.max(0, userBalance - actualRepay);
      const ticketNo = `TX-PAY-LOAN-${Date.now().toString().slice(-6)}`;

      setCurrentPinjamanAktif(remainingDebt);
      if (remainingDebt === 0) {
        setCurrentAngsuran(0);
        setCurrentSisaTenor(0);
        setIsFormVisible(true);
      }

      setLastRepayData({
        amount: actualRepay,
        remainingDebt,
        remainingBalance,
        ticketNo,
        method: 'Simpanan Sukarela',
      });

      if (onRepaySuccess) {
        onRepaySuccess(actualRepay);
      }

      setRepaySuccessModalVisible(true);
    }, 700);
  };

  const handleConfirmQrisRepayment = () => {
    setIsQrisProcessing(true);
    setTimeout(() => {
      setIsQrisProcessing(false);
      setQrisModalVisible(false);

      const actualRepay = Math.min(parsedRepay, currentPinjamanAktif);
      const remainingDebt = Math.max(0, currentPinjamanAktif - actualRepay);
      const remainingBalance = userBalance;
      const ticketNo = `QRIS-PAY-${Date.now().toString().slice(-6)}`;

      setCurrentPinjamanAktif(remainingDebt);
      if (remainingDebt === 0) {
        setCurrentAngsuran(0);
        setCurrentSisaTenor(0);
        setIsFormVisible(true);
      }

      setLastRepayData({
        amount: actualRepay,
        remainingDebt,
        remainingBalance,
        ticketNo,
        method: 'QRIS Koperasi PT BIT',
      });

      if (onRepaySuccess) {
        onRepaySuccess(actualRepay);
      }

      setRepaySuccessModalVisible(true);
    }, 900);
  };

  return (
    <View style={styles.screenContainer}>
      {/* 1. TOP NAVBAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          onPress={() => {
            if (stage === 'verification_calculation') {
              setStage('form');
            } else {
              onBack();
            }
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="chevron-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle}>Pinjaman Karyawan</Text>
          <Text style={styles.topNavSub}>Koperasi PT Bakti Idola Tama</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (onNavigateKeuangan) onNavigateKeuangan();
          }}
          style={styles.historyBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="wallet" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* ========================================================================= */}
        {/* TAHAP 1: FORMULIR PENGAJUAN PINJAMAN (TAMPILAN AWAL)                      */}
        {/* ========================================================================= */}
        {stage === 'form' && (
          <>
            {/* Header Ringkas Plafon & Masa Kerja */}
            <View style={styles.plafonSummaryCard}>
              <View style={styles.plafonSummaryRow}>
                <View style={styles.plafonCol}>
                  <Text style={styles.plafonLabel}>Gaji Pokok</Text>
                  <Text style={styles.plafonVal}>Rp {formatRupiah(gajiBulanan)}</Text>
                </View>
                <View style={styles.plafonDivider} />
                <View style={styles.plafonCol}>
                  <Text style={styles.plafonLabel}>Batas 30% Gaji</Text>
                  <Text style={styles.plafonVal}>Rp {formatRupiah(maxDeductionPerMonth)}/bln</Text>
                </View>
                <View style={styles.plafonDivider} />
                <View style={styles.plafonCol}>
                  <Text style={styles.plafonLabelBlue}>Maks. Plafon</Text>
                  <Text style={styles.plafonValBlue}>Rp {formatRupiah(effectiveMaxPlafon)}</Text>
                </View>
              </View>

              <View style={styles.tenureBadgeRow}>
                <AppIcon name={isEligibleTenure ? 'check' : 'lock'} size={11} color={isEligibleTenure ? '#1d72db' : '#dc2626'} />
                <Text style={[styles.tenureBadgeText, { color: isEligibleTenure ? '#1e40af' : '#b91c1c' }]}>
                  Masa Kerja: {Math.floor(masaKerjaBulan / 12)} Thn {masaKerjaBulan % 12} Bln {isEligibleTenure ? '(✓ Lolos Syarat Minimal 1 Tahun)' : '(✗ Belum 1 Tahun)'}
                </Text>
              </View>
            </View>

            {/* JIKA SUDAH ADA PINJAMAN AKTIF YANG DIVERIFIKASI */}
            {currentPinjamanAktif > 0 && (
              <View style={styles.activeLoanCard}>
                <View style={styles.activeLoanTopRow}>
                  <View style={styles.activeTag}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.activeTagText}>
                      {activeLoanBreakdown?.isMerged
                        ? 'Gabungan Pinjaman Karyawan Aktif'
                        : 'Pinjaman Karyawan Aktif'}
                    </Text>
                  </View>
                  <View style={styles.tenorBadge}>
                    <Text style={styles.tenorBadgeText}>
                      {activeLoanBreakdown?.isMerged
                        ? '2 Pinjaman Berjalan'
                        : `Sisa ${currentSisaTenor}/12 Bulan`}
                    </Text>
                  </View>
                </View>

                <View style={styles.activeMainRow}>
                  <View>
                    <Text style={styles.activeDebtLabel}>Sisa Kewajiban Pokok</Text>
                    <Text style={styles.activeDebtAmount}>Rp {formatRupiah(currentPinjamanAktif)}</Text>
                    {!activeLoanBreakdown?.isMerged && (
                      <Text style={styles.activeInstallmentSub}>
                        Angsuran: <Text style={styles.boldDark}>Rp {formatRupiah(currentAngsuran)}/bln</Text> (Potong Slip Gaji)
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.quickRepayBtn}
                    onPress={() => {
                      setRepayAmountInput(currentPinjamanAktif.toString());
                      setRepayModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <AppIcon name="simpanan" size={12} color="#ffffff" />
                    <Text style={styles.quickRepayBtnText}>Bayar / Lunasi</Text>
                  </TouchableOpacity>
                </View>

                {/* JIKA 2 ANGSURAN SUDAH APPROVED: TAMPILKAN KALKULASI GABUNGAN TERPADU */}
                {activeLoanBreakdown?.isMerged && (
                  <View style={styles.activeMergedSection}>
                    <View style={styles.totalDeductionBlueCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.totalDeductionTagline}>TOTAL POTONG SLIP GAJI</Text>
                        <Text style={styles.totalDeductionSubinfo}>
                          Total Utang: Rp {formatRupiah(currentPinjamanAktif)} (Tenor s.d. {currentSisaTenor} Bln)
                        </Text>
                      </View>
                      <Text style={styles.totalDeductionLargeVal}>
                        Rp {formatRupiah(currentAngsuran)}
                        <Text style={styles.totalDeductionUnit}>/bln</Text>
                      </Text>
                    </View>

                    {/* Tombol Detail Rincian Angsuran 1, 2, dst */}
                    <TouchableOpacity
                      style={styles.detailAngsuranTriggerBtn}
                      onPress={() => setDetailModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.detailAngsuranTriggerLeft}>
                        <View style={styles.detailAngsuranIconBox}>
                          <AppIcon name="receipt" size={13} color="#1d72db" />
                        </View>
                        <View>
                          <Text style={styles.detailAngsuranTriggerTitle}>Rincian Cicilan Pinjaman (1 & 2)</Text>
                          <Text style={styles.detailAngsuranTriggerSub}>Lihat perincian pokok & tenor masing-masing pinjaman</Text>
                        </View>
                      </View>
                      <View style={styles.detailAngsuranTriggerRight}>
                        <Text style={styles.detailAngsuranTriggerAction}>Detail</Text>
                        <AppIcon name="chevron-right" size={12} color="#1d72db" />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.safeLimitBadge}>
                      <AppIcon name="check" size={12} color="#16a34a" />
                      <Text style={styles.safeLimitText}>
                        Rp {formatRupiah(currentAngsuran)} ≤ Rp {formatRupiah(maxDeductionPerMonth)} (Batas 30% Gaji) — Aman
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.max(
                          10,
                          Math.min(100, ((12 - currentSisaTenor) / 12) * 100)
                        )}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* KARTU STATUS PENGAJUAN PINJAMAN (MENUNGGU PERSETUJUAN KOPERASI) */}
            {submittedTicket && submittedTicket.status === 'pending' && (
              <View style={styles.pendingTicketHomeCard}>
                <View style={styles.pendingTicketTopRow}>
                  <View style={styles.pendingBadgeRow}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.pendingBadgeTitle}>Pengajuan Menunggu Persetujuan</Text>
                  </View>
                  <View style={styles.pendingDaysBadge}>
                    <AppIcon name="clock" size={11} color="#1d72db" />
                    <Text style={styles.pendingDaysBadgeText}>Maks. 2 Hari Kerja</Text>
                  </View>
                </View>

                <View style={styles.pendingTicketBody}>
                  {/* Highlight Box Amount & Monthly Installment */}
                  <View style={styles.pendingSummaryHighlight}>
                    <View style={styles.pendingHighlightColLeft}>
                      <Text style={styles.pendingHighlightLabel}>NOMINAL PENGAJUAN</Text>
                      <Text style={styles.pendingHighlightAmount}>
                        Rp {formatRupiah(submittedTicket.amount)}
                      </Text>
                      <Text style={styles.pendingHighlightSub}>
                        Tenor {submittedTicket.tenor} Bulan • Jasa 0.8% Flat
                      </Text>
                    </View>

                    <View style={styles.pendingHighlightDivider} />

                    <View style={styles.pendingHighlightColRight}>
                      <Text style={styles.pendingHighlightLabelRight}>ESTIMASI ANGSURAN</Text>
                      <Text style={styles.pendingHighlightMonthly}>
                        Rp {formatRupiah(submittedTicket.monthly)}
                        <Text style={styles.pendingHighlightUnit}>/bln</Text>
                      </Text>
                      <Text style={styles.pendingHighlightSubRight}>Potong Slip Gaji</Text>
                    </View>
                  </View>

                  {/* Details List */}
                  <View style={styles.pendingTicketGrid}>
                    <View style={styles.pendingTicketRow}>
                      <Text style={styles.pendingTicketLabel}>Nomor Tiket</Text>
                      <Text style={styles.pendingTicketValBold}>{submittedTicket.ticketNo}</Text>
                    </View>
                    <View style={styles.pendingTicketRow}>
                      <Text style={styles.pendingTicketLabel}>Waktu Pengajuan</Text>
                      <Text style={styles.pendingTicketVal}>{submittedTicket.submissionDate}</Text>
                    </View>
                    <View style={styles.pendingTicketRow}>
                      <Text style={styles.pendingTicketLabel}>Estimasi Selesai</Text>
                      <Text style={styles.pendingTicketValBlue}>{submittedTicket.estCompletionDate}</Text>
                    </View>
                    <View style={styles.pendingTicketRow}>
                      <Text style={styles.pendingTicketLabel}>Keperluan</Text>
                      <Text style={styles.pendingTicketValDark}>{submittedTicket.purpose}</Text>
                    </View>
                  </View>

                  <View style={styles.pendingNoticeAlert}>
                    <AppIcon name="clock" size={13} color="#1d72db" />
                    <Text style={styles.pendingNoticeAlertText}>
                      Pengajuan sedang dalam antrean verifikasi berkas oleh Pengurus Koperasi & HRD PT BIT.
                    </Text>
                  </View>

                  {/* Clean Action Button */}
                  <TouchableOpacity
                    style={styles.pendingDetailFullBtn}
                    onPress={() => setStage('pending_verification')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pendingDetailFullBtnText}>Lihat Rincian Status Pengajuan ›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* TOGGLE FORM BUTTON JIKA SUDAH ADA PINJAMAN / PENGAJUAN & FORM DISEMBUNYIKAN */}
            {(currentPinjamanAktif > 0 || (submittedTicket && submittedTicket.status === 'pending')) && !isFormVisible ? (
              <TouchableOpacity
                style={styles.openFormBtn}
                onPress={() => setIsFormVisible(true)}
                activeOpacity={0.85}
              >
                <AppIcon name="topup" size={15} color="#1d72db" />
                <Text style={styles.openFormBtnText}>Ajukan Pinjaman Baru</Text>
              </TouchableOpacity>
            ) : (
              /* FORM PENGAJUAN PINJAMAN SAJA */
              <View style={styles.formContainerCard}>
                <View style={styles.formCardHeader}>
                  <View>
                    <Text style={styles.formTitle}>Formulir Pengajuan Pinjaman</Text>
                    <Text style={styles.formSub}>Isi data pinjaman anggota koperasi</Text>
                  </View>
                  {(currentPinjamanAktif > 0 || (submittedTicket && submittedTicket.status === 'pending')) && (
                    <TouchableOpacity
                      onPress={() => setIsFormVisible(false)}
                      style={styles.hideFormBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.hideFormBtnText}>Sembunyikan</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Input Jumlah Pinjaman */}
                <Text style={styles.inputFieldLabel}>Jumlah Pinjaman (Rp)</Text>
                <View style={styles.inputBoxRow}>
                  <Text style={styles.inputPrefix}>Rp</Text>
                  <TextInput
                    style={styles.textInputField}
                    value={amountInput ? formatRupiah(parsedAmount) : ''}
                    onChangeText={(t) => {
                      const num = t.replace(/[^0-9]/g, '');
                      setAmountInput(num);
                    }}
                    keyboardType="numeric"
                    placeholder="5.000.000"
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity
                    style={styles.maxBtn}
                    onPress={() => setAmountInput(effectiveMaxPlafon.toString())}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.maxBtnText}>Maksimal</Text>
                  </TouchableOpacity>
                </View>

                {/* Preset Cepat */}
                <View style={styles.presetAmountsGrid}>
                  {presetAmounts.map((amt) => {
                    const isSelected = parsedAmount === amt;
                    const isOverLimit = amt > effectiveMaxPlafon;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[
                          styles.presetChip,
                          isSelected && styles.presetChipActive,
                          isOverLimit && styles.presetChipDisabled,
                        ]}
                        onPress={() => {
                          if (!isOverLimit) setAmountInput(amt.toString());
                        }}
                        activeOpacity={0.8}
                        disabled={isOverLimit}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isSelected && styles.presetChipTextActive,
                            isOverLimit && styles.presetChipTextDisabled,
                          ]}
                        >
                          Rp {formatRupiah(amt)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Pilihan Tenor Pembayaran */}
                <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>
                  Pilih Tenor Pembayaran (Potong Slip Gaji)
                </Text>
                <View style={styles.tenorChipsRow}>
                  {tenorOptions.map((m) => {
                    const isSelected = selectedTenor === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={[styles.tenorButton, isSelected && styles.tenorButtonActive]}
                        onPress={() => setSelectedTenor(m)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.tenorButtonText, isSelected && styles.tenorButtonTextActive]}>
                          {m} Bulan
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Input Tujuan Pinjaman */}
                <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>
                  Tujuan / Keperluan Pinjaman
                </Text>
                <View style={styles.purposeInputBox}>
                  <TextInput
                    style={styles.purposeTextInput}
                    value={loanPurpose}
                    onChangeText={setLoanPurpose}
                    placeholder="Contoh: Renovasi rumah, biaya pendidikan, darurat..."
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Tombol Lanjut ke Kalkulasi & Verifikasi */}
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    (!isEligibleTenure || parsedAmount <= 0 || parsedAmount > effectiveMaxPlafon || !isDeductionSafe) &&
                      styles.primaryActionBtnDisabled,
                  ]}
                  onPress={handleProceedToVerification}
                  disabled={!isEligibleTenure || parsedAmount <= 0 || parsedAmount > effectiveMaxPlafon || !isDeductionSafe}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionBtnText}>
                    {!isEligibleTenure
                      ? 'Masa Kerja Belum 1 Tahun'
                      : !isDeductionSafe
                      ? 'Melebihi Batas Potong 30% Gaji'
                      : parsedAmount > effectiveMaxPlafon
                      ? 'Melebihi Batas Plafon'
                      : 'Lanjut ke Rincian & Verifikasi ›'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 2: RINCIAN KALKULASI ANGSURAN & PROSES VERIFIKASI (DETAIL + PIN)    */}
        {/* ========================================================================= */}
        {stage === 'verification_calculation' && (
          <View style={styles.calcStageContainer}>
            {/* Header Stage & Stepper */}
            <View style={styles.stageHeaderCard}>
              <View style={styles.stageStepRow}>
                <View style={styles.stageStepPill}>
                  <Text style={styles.stageStepPillText}>Langkah 2 dari 2</Text>
                </View>
                <Text style={styles.stageStepHint}>Konfirmasi & Verifikasi</Text>
              </View>
              <Text style={styles.stageHeaderTitle}>Rincian Angsuran Pinjaman</Text>
              <Text style={styles.stageHeaderSub}>
                Periksa rincian kalkulasi pinjaman sebelum otorisasi pengajuan
              </Text>
            </View>

            {/* Main Calculation Card */}
            <View style={styles.mainReceiptCard}>
              {/* Top Monthly Highlight */}
              <View style={styles.receiptHeroBanner}>
                <View style={styles.receiptHeroLeft}>
                  <Text style={styles.receiptHeroLabel}>ANGSURAN BULANAN BARU</Text>
                  <Text style={styles.receiptHeroSub}>
                    Tenor {selectedTenor} Bulan • Jasa 0.8% Flat / bln
                  </Text>
                </View>
                <View style={styles.receiptHeroRight}>
                  <Text style={styles.receiptHeroAmount}>
                    Rp {formatRupiah(monthlyTotal)}
                    <Text style={styles.receiptHeroUnit}>/bln</Text>
                  </Text>
                </View>
              </View>

              {/* Breakdown Rows */}
              <View style={styles.receiptBreakdownList}>
                <View style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemLabel}>Nominal Pokok Pinjaman</Text>
                  <Text style={styles.receiptItemVal}>Rp {formatRupiah(parsedAmount)}</Text>
                </View>
                <View style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemLabel}>Pokok Angsuran / Bulan</Text>
                  <Text style={styles.receiptItemVal}>Rp {formatRupiah(monthlyPrincipal)}</Text>
                </View>
                <View style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemLabel}>Jasa Koperasi (0.8% Flat)</Text>
                  <Text style={styles.receiptItemVal}>Rp {formatRupiah(monthlyInterest)}</Text>
                </View>
                <View style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemLabel}>Keperluan / Tujuan</Text>
                  <View style={styles.purposeTag}>
                    <Text style={styles.purposeTagText} numberOfLines={1}>
                      {loanPurpose.trim() || 'Kebutuhan Pribadi'}
                    </Text>
                  </View>
                </View>

                <View style={styles.receiptDashedDivider} />

                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptTotalLabel}>Total Pengembalian Pinjaman</Text>
                  <Text style={styles.receiptTotalVal}>Rp {formatRupiah(totalRepayment)}</Text>
                </View>
              </View>

              {/* JIKA ADA ANGSURAN LAMA: KALKULASI GABUNGAN OTOMATIS */}
              {currentPinjamanAktif > 0 && (
                <View style={styles.combinedLoanWrapper}>
                  <View style={styles.combinedHeaderRow}>
                    <View style={styles.combinedIconBadge}>
                      <AppIcon name="bolt" size={12} color="#1d72db" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.combinedTitle}>Kalkulasi Gabungan Cicilan</Text>
                      <Text style={styles.combinedSub}>Akumulasi potongan slip gaji per bulan</Text>
                    </View>
                  </View>

                  <View style={styles.combinedSplitGrid}>
                    <View style={styles.combinedSplitCard}>
                      <Text style={styles.splitCardLabel}>Cicilan Berjalan</Text>
                      <Text style={styles.splitCardValDark}>Rp {formatRupiah(currentAngsuran)}/bln</Text>
                      <Text style={styles.splitCardSub}>Sisa Rp {formatRupiah(currentPinjamanAktif)}</Text>
                    </View>
                    <View style={styles.combinedSplitCard}>
                      <Text style={styles.splitCardLabel}>Pinjaman Baru</Text>
                      <Text style={styles.splitCardValBlue}>+ Rp {formatRupiah(monthlyTotal)}/bln</Text>
                      <Text style={styles.splitCardSub}>Pokok Rp {formatRupiah(parsedAmount)}</Text>
                    </View>
                  </View>

                  {/* Pure Blue Total Monthly Deduction Card */}
                  <View style={styles.totalDeductionBlueCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.totalDeductionTagline}>TOTAL POTONG SLIP GAJI</Text>
                      <Text style={styles.totalDeductionSubinfo}>
                        Total Utang: Rp {formatRupiah(combinedTotalLoan)} (Tenor s.d. {combinedMaxTenor} Bln)
                      </Text>
                    </View>
                    <Text style={styles.totalDeductionLargeVal}>
                      Rp {formatRupiah(combinedMonthlyInstallment)}
                      <Text style={styles.totalDeductionUnit}>/bln</Text>
                    </Text>
                  </View>

                  {/* Safe Limit Verification Pill */}
                  <View style={styles.safeLimitBadge}>
                    <AppIcon name="check" size={12} color="#16a34a" />
                    <Text style={styles.safeLimitText}>
                      Rp {formatRupiah(combinedMonthlyInstallment)} ≤ Rp {formatRupiah(maxDeductionPerMonth)} (Batas 30% Gaji) — Aman
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Verification Notice Card */}
            <View style={styles.verificationNoticeCard}>
              <View style={styles.noticeIconCircle}>
                <AppIcon name="clock" size={18} color="#1d72db" />
              </View>
              <View style={styles.noticeTextContainer}>
                <Text style={styles.noticeHeading}>Verifikasi Koperasi & HRD (Maksimal 2 Hari)</Text>
                <Text style={styles.noticeBody}>
                  Pengajuan ini akan diverifikasi kelayakan slip gaji & disetujui Pengurus Koperasi & HRD PT BIT dalam waktu maksimal 2 hari kerja sebelum dicairkan.
                </Text>
              </View>
            </View>

            {/* Input PIN Otorisasi Anggota */}
            <View style={styles.pinSectionCard}>
              <View style={styles.pinHeaderArea}>
                <AppIcon name="lock" size={14} color="#1d72db" />
                <Text style={styles.pinSectionTitle}>Otorisasi PIN Transaksi Anggota</Text>
              </View>
              <Text style={styles.pinSectionSubtitle}>
                Masukkan 6-digit PIN keamanan akun koperasi Anda
              </Text>

              {/* Interactive Visual PIN Digits */}
              <View style={styles.pinBoxesContainer}>
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = pinInput.length > idx;
                  const isCurrent = pinInput.length === idx;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.pinBoxItem,
                        isFilled && styles.pinBoxItemFilled,
                        isCurrent && styles.pinBoxItemCurrent,
                      ]}
                    >
                      {isFilled ? (
                        <View style={styles.pinDotFilled} />
                      ) : (
                        <View style={styles.pinDotEmpty} />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Actual Native Input */}
              <TextInput
                style={styles.pinInputHidden}
                value={pinInput}
                onChangeText={(v) => setPinInput(v.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                autoFocus
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={styles.backToFormBtn}
                onPress={() => setStage('form')}
                activeOpacity={0.7}
              >
                <Text style={styles.backToFormBtnText}>Ubah Form</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitVerificationBtn,
                  (pinInput.length < 6 || isSubmitting) && styles.submitVerificationBtnDisabled,
                ]}
                onPress={handleConfirmSubmitApplication}
                disabled={pinInput.length < 6 || isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitVerificationBtnText}>Kirim untuk Verifikasi ›</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 3: STATUS MENUNGGU VERIFIKASI KOPERASI (MAKSIMAL 2 HARI)           */}
        {/* ========================================================================= */}
        {stage === 'pending_verification' && submittedTicket && (
          <View style={styles.pendingStageCard}>
            {/* Animated / Pulse Waiting Icon */}
            <View style={styles.waitingIconOuter}>
              <View style={styles.waitingIconInner}>
                <AppIcon name="clock" size={34} color="#1d72db" />
              </View>
            </View>

            <Text style={styles.pendingMainTitle}>Menunggu Verifikasi Koperasi</Text>
            <Text style={styles.pendingMainSub}>
              Pengajuan pinjaman Anda telah diterima. Proses verifikasi berkas & slip gaji oleh Pengurus Koperasi & HRD PT BIT memakan waktu <Text style={styles.boldDark}>maksimal 2 hari kerja</Text>.
            </Text>

            {/* Info Waktu & Tiket Verifikasi */}
            <View style={styles.ticketDetailBox}>
              <View style={styles.ticketRowItem}>
                <Text style={styles.ticketItemLabel}>Nomor Tiket</Text>
                <Text style={styles.ticketItemValBold}>{submittedTicket.ticketNo}</Text>
              </View>
              <View style={styles.ticketRowItem}>
                <Text style={styles.ticketItemLabel}>Waktu Pengajuan</Text>
                <Text style={styles.ticketItemVal}>{submittedTicket.submissionDate}</Text>
              </View>
              <View style={styles.ticketRowItem}>
                <Text style={styles.ticketItemLabel}>Estimasi Selesai Verifikasi</Text>
                <Text style={styles.ticketItemValBlue}>{submittedTicket.estCompletionDate}</Text>
              </View>
              <View style={styles.ticketDividerLine} />
              <View style={styles.ticketRowItem}>
                <Text style={styles.ticketItemLabel}>Nominal Diajukan</Text>
                <Text style={styles.ticketItemValDark}>
                  Rp {formatRupiah(submittedTicket.amount)} ({submittedTicket.tenor} Bulan)
                </Text>
              </View>
              <View style={styles.ticketRowItem}>
                <Text style={styles.ticketItemLabel}>Estimasi Angsuran</Text>
                <Text style={styles.ticketItemValGreen}>
                  Rp {formatRupiah(submittedTicket.monthly)} / bulan
                </Text>
              </View>
              <View style={styles.ticketRowItem}>
                <Text style={styles.ticketItemLabel}>Tujuan Pinjaman</Text>
                <Text style={styles.ticketItemVal}>{submittedTicket.purpose}</Text>
              </View>
              <View style={styles.ticketDividerLine} />
              <View style={styles.statusPillRow}>
                <View style={styles.pulsingDot} />
                <Text style={styles.statusPillText}>Status: Sedang Diverifikasi Pengurus Koperasi</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.pendingBtnStack}>
              <TouchableOpacity
                style={styles.navKeuanganBtn}
                onPress={() => setStage('form')}
                activeOpacity={0.85}
              >
                <Text style={styles.navKeuanganBtnText}>Lihat Pengajuan di Halaman Pinjaman</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navKeuanganOutlineBtn}
                onPress={() => {
                  if (onNavigateKeuangan) onNavigateKeuangan();
                  else onBack();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.navKeuanganOutlineBtnText}>Cek Status di Menu Keuangan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backHomeBtn}
                onPress={() => onBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backHomeBtnText}>Kembali ke Beranda</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL DETAIL RINCIAN ANGSURAN (PINJAMAN 1, 2, DST)                        */}
      {/* ========================================================================= */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <AppIcon name="receipt" size={16} color="#1d72db" />
                <Text style={styles.modalMainTitle}>Rincian Angsuran Pinjaman</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.modalCloseBtn}>
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.modalSectionSub}>
                Berikut adalah perincian pembiayaan pinjaman aktif yang dipotong melalui slip gaji bulanan Anda:
              </Text>

              {activeLoanBreakdown && activeLoanBreakdown.isMerged ? (
                <>
                  {/* Kartu Pinjaman 1 */}
                  <View style={styles.detailLoanItemCard}>
                    <View style={styles.detailLoanHeaderRow}>
                      <View style={styles.detailLoanBadge}>
                        <Text style={styles.detailLoanBadgeText}>Pinjaman 1 (Berjalan)</Text>
                      </View>
                      <Text style={styles.detailLoanStatusText}>Aktif</Text>
                    </View>
                    <View style={styles.detailLoanGrid}>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Sisa Pokok</Text>
                        <Text style={styles.detailLoanValDark}>
                          Rp {formatRupiah(activeLoanBreakdown.oldLoanAmount)}
                        </Text>
                      </View>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Cicilan / Bulan</Text>
                        <Text style={styles.detailLoanValBlue}>
                          Rp {formatRupiah(activeLoanBreakdown.oldLoanMonthly)}/bln
                        </Text>
                      </View>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Sisa Tenor</Text>
                        <Text style={styles.detailLoanValDark}>
                          {activeLoanBreakdown.oldLoanTenor} Bulan
                        </Text>
                      </View>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Metode Bayar</Text>
                        <Text style={styles.detailLoanValDark}>Potong Slip Gaji</Text>
                      </View>
                    </View>
                  </View>

                  {/* Kartu Pinjaman 2 */}
                  <View style={styles.detailLoanItemCard}>
                    <View style={styles.detailLoanHeaderRow}>
                      <View style={[styles.detailLoanBadge, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.detailLoanBadgeText, { color: '#15803d' }]}>
                          Pinjaman 2 (Disetujui)
                        </Text>
                      </View>
                      <Text style={[styles.detailLoanStatusText, { color: '#16a34a' }]}>Disetujui</Text>
                    </View>
                    <View style={styles.detailLoanGrid}>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Pokok Pinjaman</Text>
                        <Text style={styles.detailLoanValDark}>
                          Rp {formatRupiah(activeLoanBreakdown.newLoanAmount)}
                        </Text>
                      </View>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Cicilan / Bulan</Text>
                        <Text style={styles.detailLoanValBlue}>
                          Rp {formatRupiah(activeLoanBreakdown.newLoanMonthly)}/bln
                        </Text>
                      </View>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Tenor Pinjaman</Text>
                        <Text style={styles.detailLoanValDark}>
                          {activeLoanBreakdown.newLoanTenor} Bulan
                        </Text>
                      </View>
                      <View style={styles.detailLoanCol}>
                        <Text style={styles.detailLoanLabel}>Jasa Koperasi</Text>
                        <Text style={styles.detailLoanValDark}>0.8% Flat / bln</Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.detailLoanItemCard}>
                  <View style={styles.detailLoanHeaderRow}>
                    <View style={styles.detailLoanBadge}>
                      <Text style={styles.detailLoanBadgeText}>Pinjaman Karyawan</Text>
                    </View>
                    <Text style={styles.detailLoanStatusText}>Aktif</Text>
                  </View>
                  <View style={styles.detailLoanGrid}>
                    <View style={styles.detailLoanCol}>
                      <Text style={styles.detailLoanLabel}>Sisa Pokok</Text>
                      <Text style={styles.detailLoanValDark}>Rp {formatRupiah(currentPinjamanAktif)}</Text>
                    </View>
                    <View style={styles.detailLoanCol}>
                      <Text style={styles.detailLoanLabel}>Cicilan / Bulan</Text>
                      <Text style={styles.detailLoanValBlue}>
                        Rp {formatRupiah(currentAngsuran)}/bln
                      </Text>
                    </View>
                    <View style={styles.detailLoanCol}>
                      <Text style={styles.detailLoanLabel}>Sisa Tenor</Text>
                      <Text style={styles.detailLoanValDark}>{currentSisaTenor} Bulan</Text>
                    </View>
                    <View style={styles.detailLoanCol}>
                      <Text style={styles.detailLoanLabel}>Metode Bayar</Text>
                      <Text style={styles.detailLoanValDark}>Potong Slip Gaji</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Ringkasan Total Gabungan */}
              <View style={styles.detailSummaryBox}>
                <View style={styles.detailSummaryRow}>
                  <Text style={styles.detailSummaryLabel}>Total Sisa Utang Pokok</Text>
                  <Text style={styles.detailSummaryValBold}>Rp {formatRupiah(currentPinjamanAktif)}</Text>
                </View>
                <View style={styles.detailSummaryRow}>
                  <Text style={styles.detailSummaryLabel}>Total Potongan Slip Gaji / Bulan</Text>
                  <Text style={styles.detailSummaryValBlue}>
                    Rp {formatRupiah(currentAngsuran)}/bln
                  </Text>
                </View>
                <View style={styles.detailSummaryRow}>
                  <Text style={styles.detailSummaryLabel}>Batas Maksimal Potongan (30% Gaji)</Text>
                  <Text style={styles.detailSummaryValDark}>
                    Rp {formatRupiah(maxDeductionPerMonth)}/bln
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => setDetailModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>Tutup Rincian</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL PELUNASAN ANGSURAN (SIMPANAN SUKARELA & QRIS GENERATE)              */}
      {/* ========================================================================= */}
      <Modal
        visible={repayModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRepayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <AppIcon name="simpanan" size={16} color="#1d72db" />
                <Text style={styles.modalMainTitle}>Bayar / Lunasi Angsuran</Text>
              </View>
              <TouchableOpacity onPress={() => setRepayModalVisible(false)} style={styles.modalCloseBtn}>
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* METODE PEMBAYARAN SELECTOR */}
              <Text style={styles.inputFieldLabel}>Pilih Metode Pembayaran</Text>
              <View style={styles.paymentMethodSelector}>
                {/* Opsi 1: Simpanan Sukarela */}
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    repayPaymentMethod === 'simpanan' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setRepayPaymentMethod('simpanan')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodRadioRow}>
                    <View
                      style={[
                        styles.radioCircleOuter,
                        repayPaymentMethod === 'simpanan' && styles.radioCircleOuterActive,
                      ]}
                    >
                      {repayPaymentMethod === 'simpanan' && <View style={styles.radioCircleInner} />}
                    </View>
                    <View style={styles.paymentMethodIconBadge}>
                      <AppIcon name="wallet" size={13} color="#1d72db" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentMethodTitle}>Potong Simpanan Sukarela</Text>
                      <Text style={styles.paymentMethodBalance}>
                        Saldo: Rp {formatRupiah(userBalance)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Opsi 2: Bayar Menggunakan QRIS */}
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    repayPaymentMethod === 'qris' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setRepayPaymentMethod('qris')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodRadioRow}>
                    <View
                      style={[
                        styles.radioCircleOuter,
                        repayPaymentMethod === 'qris' && styles.radioCircleOuterActive,
                      ]}
                    >
                      {repayPaymentMethod === 'qris' && <View style={styles.radioCircleInner} />}
                    </View>
                    <View style={[styles.paymentMethodIconBadge, { backgroundColor: '#fef2f2' }]}>
                      <AppIcon name="qris" size={13} color="#dc2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.paymentMethodTitle}>Bayar Menggunakan QRIS</Text>
                        <View style={styles.instantTag}>
                          <Text style={styles.instantTagText}>Bebas Admin</Text>
                        </View>
                      </View>
                      <Text style={styles.paymentMethodSub}>
                        BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* INPUT NOMINAL PEMBAYARAN */}
              <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>Nominal Pembayaran</Text>
              <View style={styles.inputBoxRow}>
                <Text style={styles.inputPrefix}>Rp</Text>
                <TextInput
                  style={styles.textInputField}
                  value={repayAmountInput ? formatRupiah(parsedRepay) : ''}
                  onChangeText={(t) => setRepayAmountInput(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity
                  style={styles.maxBtn}
                  onPress={() => setRepayAmountInput(currentPinjamanAktif.toString())}
                  activeOpacity={0.75}
                >
                  <Text style={styles.maxBtnText}>Lunasi Semua</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.presetAmountsGrid}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setRepayAmountInput(currentAngsuran.toString())}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetChipText}>1x Angsuran (Rp {formatRupiah(currentAngsuran)})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setRepayAmountInput(currentPinjamanAktif.toString())}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetChipText}>Pelunasan Total (Rp {formatRupiah(currentPinjamanAktif)})</Text>
                </TouchableOpacity>
              </View>

              {repayPaymentMethod === 'simpanan' && isRepayInsufficient && (
                <View style={styles.shortageNoticeBox}>
                  <Text style={styles.shortageNoticeText}>
                    Simpanan Sukarela Anda kurang Rp {formatRupiah(repayShortage)}.
                  </Text>
                  {onNavigateTopUp && (
                    <TouchableOpacity
                      onPress={() => {
                        setRepayModalVisible(false);
                        onNavigateTopUp();
                      }}
                    >
                      <Text style={styles.shortageSetorLink}>+ Setor Simpanan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  ((repayPaymentMethod === 'simpanan' && isRepayInsufficient) || parsedRepay <= 0) &&
                    styles.primaryActionBtnDisabled,
                ]}
                onPress={handleInitiateRepay}
                disabled={(repayPaymentMethod === 'simpanan' && isRepayInsufficient) || parsedRepay <= 0}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>
                  {parsedRepay <= 0
                    ? 'Masukkan Nominal'
                    : repayPaymentMethod === 'simpanan'
                    ? `Lanjut Bayar via Simpanan (Rp ${formatRupiah(parsedRepay)}) ›`
                    : `Bayar Menggunakan QRIS (Rp ${formatRupiah(parsedRepay)}) ›`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL PEMBAYARAN VIA KODE QRIS                                            */}
      {/* ========================================================================= */}
      <Modal
        visible={qrisModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQrisModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '92%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <AppIcon name="qris" size={18} color="#dc2626" />
                <Text style={styles.modalMainTitle}>Pembayaran QRIS Koperasi</Text>
              </View>
              <TouchableOpacity onPress={() => setQrisModalVisible(false)} style={styles.modalCloseBtn}>
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* QRIS Official Styled Box */}
              <View style={styles.qrisOfficialContainer}>
                {/* QRIS Header Banner */}
                <View style={styles.qrisHeaderBanner}>
                  <View style={styles.qrisLogoRow}>
                    <Text style={styles.qrisBrandTitle}>QRIS</Text>
                    <Text style={styles.qrisBrandSub}>QR Code Indonesian Standard</Text>
                  </View>
                  <Text style={styles.qrisNmidText}>NMID: ID102026091701</Text>
                </View>

                {/* Merchant Name */}
                <View style={styles.qrisMerchantArea}>
                  <Text style={styles.qrisMerchantName}>KOPERASI PT BAKTI IDOLA TAMA</Text>
                  <Text style={styles.qrisMerchantCity}>JAKARTA BARAT</Text>
                </View>

                {/* Real High-Res QRIS Code Generated for YouTube link */}
                <View style={styles.qrisMatrixWrapper}>
                  <View style={styles.qrisMatrixContainer}>
                    <Image
                      source={{
                        uri: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=https%3A%2F%2Fyoutu.be%2FWZYUSaHlGlk%3Fsi%3DWZ1vg0ICvHRfkUtH&margin=8',
                      }}
                      style={styles.realQrisImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* Tagihan & Timer Box */}
                <View style={styles.qrisAmountBox}>
                  <Text style={styles.qrisAmountLabel}>TOTAL PEMBAYARAN ANGSURAN</Text>
                  <Text style={styles.qrisAmountVal}>Rp {formatRupiah(parsedRepay)}</Text>
                  <View style={styles.qrisTimerRow}>
                    <AppIcon name="clock" size={11} color="#dc2626" />
                    <Text style={styles.qrisTimerText}>Kode berlaku hingga 15:00 menit</Text>
                  </View>
                </View>
              </View>

              {/* Supported Banks & E-Wallets Info with Real Logos */}
              <View style={styles.supportedPaymentBox}>
                <Text style={styles.supportedPaymentLabel}>
                  Dapat dibayar dari seluruh m-Banking & e-Wallet:
                </Text>
                <View style={styles.supportedChannelGrid}>
                  {supportedQrisChannels.map((ch) => (
                    <View key={ch.id} style={styles.channelLogoCard}>
                      <Image source={ch.logo} style={styles.channelLogoImg} resizeMode="contain" />
                    </View>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.primaryActionBtn, isQrisProcessing && styles.primaryActionBtnDisabled]}
                onPress={handleConfirmQrisRepayment}
                disabled={isQrisProcessing}
                activeOpacity={0.85}
              >
                {isQrisProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryActionBtnText}>Saya Sudah Bayar via QRIS ›</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelQrisBtn}
                onPress={() => setQrisModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelQrisBtnText}>Batal / Ubah Metode</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL PIN PELUNASAN VIA SIMPANAN SUKARELA                                */}
      {/* ========================================================================= */}
      <Modal
        visible={repayPinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRepayPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalMainTitle}>Konfirmasi PIN Pembayaran</Text>
              <TouchableOpacity onPress={() => setRepayPinModalVisible(false)} style={styles.modalCloseBtn}>
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.confirmBox}>
              <Text style={styles.confirmBoxLabel}>
                Total Bayar: <Text style={styles.confirmBoxValGreen}>Rp {formatRupiah(parsedRepay)}</Text>
              </Text>
              <Text style={styles.confirmBoxSub}>Sumber Dana: Saldo Simpanan Sukarela Anggota</Text>
            </View>

            <Text style={styles.pinSectionTitle}>Masukkan 6-Digit PIN Transaksi:</Text>
            <TextInput
              style={styles.pinInputBox}
              value={repayPinInput}
              onChangeText={(v) => setRepayPinInput(v.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="numeric"
              secureTextEntry
              placeholder="••••••"
              placeholderTextColor="#94a3b8"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.primaryActionBtn,
                (repayPinInput.length < 6 || isRepaySubmitting) && styles.primaryActionBtnDisabled,
              ]}
              onPress={handleConfirmRepayWithPin}
              disabled={repayPinInput.length < 6 || isRepaySubmitting}
              activeOpacity={0.85}
            >
              {isRepaySubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryActionBtnText}>Konfirmasi Pembayaran</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL SUKSES PELUNASAN ANGSURAN                                          */}
      {/* ========================================================================= */}
      <Modal
        visible={repaySuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRepaySuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardSuccess}>
            <View style={styles.successIconBadge}>
              <AppIcon name="check-circle" size={38} color="#16a34a" />
            </View>
            <Text style={styles.successModalTitle}>Pembayaran Berhasil! 🎉</Text>
            <Text style={styles.successModalSub}>
              Angsuran pinjaman telah berhasil dibayarkan dan tercatat di sistem Koperasi PT BIT.
            </Text>
            {lastRepayData && (
              <View style={styles.successReceiptBox}>
                <View style={styles.receiptRowItem}>
                  <Text style={styles.receiptItemLabel}>Metode Pembayaran</Text>
                  <Text style={styles.ticketItemValBold}>{lastRepayData.method}</Text>
                </View>
                <View style={styles.receiptRowItem}>
                  <Text style={styles.receiptItemLabel}>Nomor Referensi</Text>
                  <Text style={styles.ticketItemVal}>{lastRepayData.ticketNo}</Text>
                </View>
                <View style={styles.ticketDividerLine} />
                <View style={styles.receiptRowItem}>
                  <Text style={styles.receiptItemLabel}>Jumlah Dibayar</Text>
                  <Text style={styles.ticketItemValGreen}>Rp {formatRupiah(lastRepayData.amount)}</Text>
                </View>
                <View style={styles.receiptRowItem}>
                  <Text style={styles.receiptItemLabel}>Sisa Kewajiban Pokok</Text>
                  <Text style={styles.ticketItemValDark}>
                    Rp {formatRupiah(lastRepayData.remainingDebt)}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => setRepaySuccessModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>Selesai & Tutup</Text>
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
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCenter: {
    alignItems: 'center',
  },
  topNavTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  topNavSub: {
    color: '#dbeafe',
    fontSize: 10,
    marginTop: 1,
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 50,
  },
  plafonSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  plafonSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
  },
  plafonCol: {
    flex: 1,
  },
  plafonDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 6,
  },
  plafonLabel: {
    fontSize: 8.5,
    color: '#64748b',
    fontWeight: '600',
  },
  plafonVal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  plafonLabelBlue: {
    fontSize: 8.5,
    color: '#1d72db',
    fontWeight: '700',
  },
  plafonValBlue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
    marginTop: 1,
  },
  tenureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  tenureBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  activeLoanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activeLoanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1d72db',
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
  },
  tenorBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
  },
  tenorBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  activeMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeDebtLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '600',
  },
  activeDebtAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  activeInstallmentSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 2,
  },
  boldDark: {
    fontWeight: '700',
    color: '#0f172a',
  },
  quickRepayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1d72db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  quickRepayBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1d72db',
    borderRadius: 3,
  },
  openFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    paddingVertical: 13,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  openFormBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  formContainerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  formCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  formSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  hideFormBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  hideFormBtnText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
  },
  inputFieldLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d72db',
    marginRight: 6,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    padding: 0,
  },
  maxBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  maxBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
  },
  presetAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  presetChip: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d72db',
  },
  presetChipDisabled: {
    opacity: 0.4,
  },
  presetChipText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#1d72db',
    fontWeight: '700',
  },
  presetChipTextDisabled: {
    color: '#94a3b8',
  },
  tenorChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  tenorButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  tenorButtonActive: {
    backgroundColor: '#1d72db',
    borderColor: '#1d72db',
  },
  tenorButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  tenorButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  purposeInputBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  purposeTextInput: {
    fontSize: 12.5,
    color: '#0f172a',
    fontWeight: '600',
    padding: 0,
  },
  primaryActionBtn: {
    backgroundColor: '#1d72db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryActionBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryActionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  /* STAGE 2: CALCULATION & VERIFICATION */
  calcStageContainer: {
    gap: 12,
  },
  stageHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  stageStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stageStepPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageStepPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  stageStepHint: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
  },
  stageHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  stageHeaderSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  mainReceiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  receiptHeroBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  receiptHeroLeft: {
    flex: 1,
  },
  receiptHeroLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748b',
  },
  receiptHeroSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  receiptHeroRight: {
    alignItems: 'flex-end',
  },
  receiptHeroAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1d72db',
  },
  receiptHeroUnit: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  receiptBreakdownList: {
    padding: 14,
    gap: 8,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptItemLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  receiptItemVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  purposeTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    maxWidth: '55%',
  },
  purposeTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  receiptDashedDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  receiptTotalLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptTotalVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  combinedLoanWrapper: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  combinedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  combinedIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  combinedTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  combinedSub: {
    fontSize: 9.5,
    color: '#64748b',
  },
  combinedSplitGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  combinedSplitCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  splitCardLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  splitCardValDark: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  splitCardValBlue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1d72db',
    marginTop: 2,
  },
  splitCardSub: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  /* Blue Total Monthly Deduction Card */
  totalDeductionBlueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1d72db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  totalDeductionTagline: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#dbeafe',
  },
  totalDeductionSubinfo: {
    fontSize: 9.5,
    color: '#eff6ff',
    marginTop: 2,
  },
  totalDeductionLargeVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  totalDeductionUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#bfdbfe',
  },
  activeMergedSection: {
    marginTop: 12,
    gap: 8,
  },
  /* Pending Ticket Card on Home Page */
  pendingTicketHomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    overflow: 'hidden',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingTicketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  pendingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingBadgeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },
  pendingDaysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pendingDaysBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  pendingTicketBody: {
    padding: 14,
    gap: 10,
  },
  pendingSummaryHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pendingHighlightColLeft: {
    flex: 1.1,
  },
  pendingHighlightLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#64748b',
  },
  pendingHighlightAmount: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  pendingHighlightSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  pendingHighlightDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  pendingHighlightColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  pendingHighlightLabelRight: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#64748b',
  },
  pendingHighlightMonthly: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1d72db',
    marginTop: 2,
  },
  pendingHighlightUnit: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
  },
  pendingHighlightSubRight: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  pendingTicketGrid: {
    gap: 6,
    paddingHorizontal: 2,
  },
  pendingTicketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingTicketLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  pendingTicketVal: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '600',
  },
  pendingTicketValBold: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1d72db',
  },
  pendingTicketValDark: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  pendingTicketValBlue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d72db',
  },
  pendingNoticeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pendingNoticeAlertText: {
    fontSize: 10,
    color: '#1e40af',
    flex: 1,
    lineHeight: 14,
  },
  pendingDetailFullBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#1d72db',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pendingDetailFullBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  safeLimitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  safeLimitText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
    flex: 1,
  },
  verificationNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  noticeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  noticeBody: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 14,
  },
  pinSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    alignItems: 'center',
    position: 'relative',
  },
  pinHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  pinSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  pinSectionSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 12,
    textAlign: 'center',
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  pinBoxItem: {
    width: 38,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxItemCurrent: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  pinBoxItemFilled: {
    borderColor: '#1d72db',
    backgroundColor: '#ffffff',
  },
  pinDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  pinDotFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0f172a',
  },
  pinInputHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  pinInputBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#1d72db',
    borderRadius: 10,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#0f172a',
    marginBottom: 12,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  backToFormBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToFormBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  submitVerificationBtn: {
    flex: 2,
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitVerificationBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitVerificationBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  /* STAGE 3: PENDING VERIFICATION */
  pendingStageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    alignItems: 'center',
  },
  waitingIconOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  waitingIconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingMainTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  pendingMainSub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  ticketDetailBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  ticketRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketItemLabel: {
    fontSize: 10.5,
    color: '#64748b',
  },
  ticketItemVal: {
    fontSize: 10.5,
    color: '#0f172a',
    fontWeight: '600',
  },
  ticketItemValBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },
  ticketItemValDark: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  ticketItemValGreen: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
  },
  ticketItemValBlue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  ticketDividerLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 2,
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    padding: 7,
    borderRadius: 6,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1d72db',
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  pendingBtnStack: {
    width: '100%',
    gap: 8,
  },
  navKeuanganBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  navKeuanganBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  navKeuanganOutlineBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  navKeuanganOutlineBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  backHomeBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  backHomeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '88%',
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  modalMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  repayBalanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 10,
  },
  repayBalanceLabel: {
    fontSize: 9.5,
    color: '#1e40af',
  },
  repayBalanceVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  repaySetorBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  repaySetorBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  shortageNoticeBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 10,
  },
  shortageNoticeText: {
    fontSize: 10,
    color: '#b91c1c',
    fontWeight: '600',
  },
  confirmBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 4,
  },
  confirmBoxLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  confirmBoxValGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  confirmBoxSub: {
    fontSize: 9.5,
    color: '#64748b',
  },
  modalCardSuccess: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 18,
    marginVertical: 'auto',
    padding: 18,
    alignItems: 'center',
  },
  successIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  successModalSub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  successReceiptBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  /* DETAIL TRIGGER BUTTON ON MERGED LOAN CARD */
  detailAngsuranTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailAngsuranTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  detailAngsuranIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAngsuranTriggerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  detailAngsuranTriggerSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  detailAngsuranTriggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailAngsuranTriggerAction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d72db',
  },

  /* DETAIL BREAKDOWN MODAL STYLES */
  modalSectionSub: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
    marginBottom: 12,
  },
  detailLoanItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  detailLoanHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLoanBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  detailLoanBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d72db',
  },
  detailLoanStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  detailLoanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailLoanCol: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailLoanLabel: {
    fontSize: 9.5,
    color: '#64748b',
  },
  detailLoanValDark: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  detailLoanValBlue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1d72db',
    marginTop: 2,
  },
  detailSummaryBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    gap: 6,
    marginVertical: 10,
  },
  detailSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailSummaryLabel: {
    fontSize: 10.5,
    color: '#1e40af',
  },
  detailSummaryValBold: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  detailSummaryValBlue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  detailSummaryValDark: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },

  /* PAYMENT METHOD SELECTOR IN REPAY MODAL */
  paymentMethodSelector: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  paymentMethodCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 11,
  },
  paymentMethodCardActive: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  paymentMethodRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  radioCircleOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleOuterActive: {
    borderColor: '#1d72db',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1d72db',
  },
  paymentMethodIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  paymentMethodBalance: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d72db',
    marginTop: 1,
  },
  paymentMethodSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
  },
  instantTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  instantTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#15803d',
  },
  shortageSetorLink: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1d72db',
    marginTop: 3,
  },

  /* QRIS MODAL STYLES */
  qrisOfficialContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrisHeaderBanner: {
    width: '100%',
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrisLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qrisBrandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  qrisBrandSub: {
    fontSize: 8.5,
    color: '#94a3b8',
  },
  qrisNmidText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  qrisMerchantArea: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  qrisMerchantName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  qrisMerchantCity: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  qrisMatrixWrapper: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 4,
  },
  qrisMatrixContainer: {
    width: 170,
    height: 170,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  realQrisImage: {
    width: 170,
    height: 170,
    borderRadius: 6,
  },
  qrisAmountBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  qrisAmountLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#64748b',
  },
  qrisAmountVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1d72db',
    marginTop: 2,
  },
  qrisTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  qrisTimerText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#dc2626',
  },
  supportedPaymentBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    alignItems: 'center',
  },
  supportedPaymentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  supportedChannelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelLogoCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    height: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  channelLogoImg: {
    width: 44,
    height: 18,
  },
  cancelQrisBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelQrisBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  receiptRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
