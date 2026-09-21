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
  Linking,
} from 'react-native';
import { AppIcon } from '../../components/common/AppIcon';
import { mockWallet, mockUser } from '../../data/mockData';
import { QrisPaymentModal } from '../../components/modals/QrisPaymentModal';

const waLogo = require('../../../assets/page/wa.png');
const teleLogo = require('../../../assets/page/tele.png');

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

type LoanScreenStage = 'form' | 'verification_calculation' | 'authorization_pin' | 'pending_verification';

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
  const [repayPaymentMethod, setRepayPaymentMethod] = useState<'qris' | 'va'>('qris');
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

      setIsFormVisible(false);
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

    // Bayar via Payment Gateway (QRIS / VA)
    setRepayModalVisible(false);
    setQrisModalVisible(true);
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

  const [repayShareModalVisible, setRepayShareModalVisible] = useState<boolean>(false);
  const [repayCopiedToast, setRepayCopiedToast] = useState<boolean>(false);

  const generateRepaymentReceiptHtml = (data: {
    amount: number;
    remainingDebt: number;
    ticketNo: string;
    method: string;
    borrowerName: string;
  }) => {
    const now = new Date();
    const dateStr = `${now.getDate()} Sep 2026`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const formatR = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Bukti Pembayaran Angsuran - ${data.ticketNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #f8fafc; color: #0f172a; padding: 24px 12px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .receipt-card { background: #ffffff; width: 100%; max-width: 440px; border-radius: 16px; border: 1.5px solid #cbd5e1; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { text-align: center; padding-bottom: 16px; border-bottom: 2px dashed #cbd5e1; margin-bottom: 16px; }
    .badge-success { display: inline-block; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px; border: 1px solid #86efac; }
    .company-title { font-size: 16px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; }
    .sub-title { font-size: 11px; color: #64748b; margin-top: 2px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .info-table td { padding: 7px 0; font-size: 12px; vertical-align: top; }
    .info-table td.label { color: #64748b; width: 45%; }
    .info-table td.val { font-weight: 700; color: #0f172a; text-align: right; }
    .divider { height: 1.5px; border-top: 1.5px dashed #cbd5e1; margin: 12px 0; }
    .total-row td { font-size: 14px; font-weight: 900; padding-top: 10px; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.5; margin-top: 16px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
    .btn-row { display: flex; gap: 8px; margin-top: 18px; }
    .print-btn { flex: 1; background: #1d72db; color: #ffffff; border: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; }
    @media print { body { background: #ffffff; padding: 0; } .receipt-card { box-shadow: none; border: none; max-width: 100%; } .btn-row { display: none; } }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div class="badge-success">PEMBAYARAN ANGSURAN BERHASIL</div>
      <h1 class="company-title">PT BAKTI IDOLA TAMA</h1>
      <p class="sub-title">Moobi Koperasi Karyawan • Bukti Resmi Pelunasan</p>
    </div>
    <table class="info-table">
      <tr><td class="label">Nomor Referensi</td><td class="val">${data.ticketNo}</td></tr>
      <tr><td class="label">Waktu Transaksi</td><td class="val">${dateStr}, ${timeStr}</td></tr>
      <tr><td class="label">Nama Anggota</td><td class="val">${data.borrowerName}</td></tr>
      <tr><td class="label">Jenis Transaksi</td><td class="val">Pelunasan / Angsuran Pinjaman</td></tr>
      <tr><td class="label">Metode Pembayaran</td><td class="val">${data.method}</td></tr>
      <tr><td class="label">Status</td><td class="val" style="color: #16a34a; font-weight: 800;">Lunas (Verified)</td></tr>
    </table>
    <div class="divider"></div>
    <table class="info-table">
      <tr class="total-row">
        <td style="color: #0f172a;">Jumlah Dibayar</td>
        <td class="val" style="color: #16a34a; font-size: 15px;">Rp ${formatR(data.amount)}</td>
      </tr>
      <tr>
        <td class="label" style="font-weight: 700; color: #0f172a;">Sisa Kewajiban Pokok</td>
        <td class="val" style="color: #0f172a; font-size: 13px;">Rp ${formatR(data.remainingDebt)}</td>
      </tr>
    </table>
    <div class="btn-row">
      <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
    </div>
    <div class="footer">
      Struk ini merupakan bukti transaksi digital yang sah dari Koperasi PT BIT.<br>
      Terima kasih telah melakukan pembayaran tepat waktu.
    </div>
  </div>
</body>
</html>`;
  };

  const getRepayShareText = () => {
    if (!lastRepayData) return '';
    return `*BUKTI PEMBAYARAN ANGSURAN PINJAMAN - PT BAKTI IDOLA TAMA*
━━━━━━━━━━━━━━━━━━━━
🏢 *Koperasi PT Bakti Idola Tama*
📄 *No. Referensi:* ${lastRepayData.ticketNo}
👤 *Nama Anggota:* ${mockUser.name}
💰 *Jumlah Dibayar:* Rp ${formatRupiah(lastRepayData.amount)}
💳 *Metode:* ${lastRepayData.method}
📉 *Sisa Pokok:* Rp ${formatRupiah(lastRepayData.remainingDebt)}
✅ *Status:* LUNAS (TERVERIFIKASI)
━━━━━━━━━━━━━━━━━━━━
_Bukti pembayaran digital ini sah dan diterbitkan otomatis oleh sistem Moobi Koperasi PT BIT._`;
  };

  const handleDownloadRepayReceipt = () => {
    if (!lastRepayData) return;
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const html = generateRepaymentReceiptHtml({
          amount: lastRepayData.amount,
          remainingDebt: lastRepayData.remainingDebt,
          ticketNo: lastRepayData.ticketNo,
          method: lastRepayData.method,
          borrowerName: mockUser.name,
        });
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bukti_Pelunasan_PT_BIT_${lastRepayData.ticketNo}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
      Alert.alert(
        'Bukti Pembayaran Diunduh 📄',
        `Bukti transaksi resmi (${lastRepayData.ticketNo}) berhasil diunduh. Anda dapat membuka atau mencetaknya sebagai dokumen PDF.`
      );
    } catch (e) {
      Alert.alert('Cetak Bukti', `Bukti transaksi ${lastRepayData.ticketNo} siap dicetak.`);
    }
  };

  const handleShareRepayWhatsApp = () => {
    const text = encodeURIComponent(getRepayShareText());
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    } else {
      Linking.openURL(waUrl).catch(() => {});
    }
    setRepayShareModalVisible(false);
  };

  const handleShareRepayTelegram = () => {
    const text = encodeURIComponent(getRepayShareText());
    const tgUrl = `https://t.me/share/url?url=&text=${text}`;
    if (typeof window !== 'undefined') {
      window.open(tgUrl, '_blank');
    } else {
      Linking.openURL(tgUrl).catch(() => {});
    }
    setRepayShareModalVisible(false);
  };

  const handleCopyRepayText = () => {
    const text = getRepayShareText();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setRepayCopiedToast(true);
    setTimeout(() => setRepayCopiedToast(false), 2000);
  };

  const handleConfirmQrisRepayment = () => {
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
  };

  return (
    <View style={styles.screenContainer}>
      {/* 1. TOP NAVBAR */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          onPress={() => {
            if (stage === 'authorization_pin') {
              setStage('verification_calculation');
            } else if (stage === 'verification_calculation') {
              setStage('form');
            } else if (stage === 'pending_verification') {
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
                  <Text style={styles.plafonLabel} numberOfLines={1}>Gaji Pokok</Text>
                  <Text style={styles.plafonVal} numberOfLines={1}>Rp {formatRupiah(gajiBulanan)}</Text>
                </View>
                <View style={styles.plafonDivider} />
                <View style={[styles.plafonCol, { flex: 1.05 }]}>
                  <Text style={styles.plafonLabel} numberOfLines={1}>Batas 30% Gaji</Text>
                  <Text style={styles.plafonVal} numberOfLines={1}>
                    Rp {formatRupiah(maxDeductionPerMonth)}
                    <Text style={styles.plafonValUnit}>/bln</Text>
                  </Text>
                </View>
                <View style={styles.plafonDivider} />
                <View style={[styles.plafonCol, styles.plafonColHighlight, { flex: 1.1 }]}>
                  <Text style={styles.plafonLabelBlue} numberOfLines={1}>Maks. Plafon</Text>
                  <Text style={styles.plafonValBlue} numberOfLines={1}>Rp {formatRupiah(effectiveMaxPlafon)}</Text>
                </View>
              </View>

              <View style={[styles.tenureBadgeRow, isEligibleTenure ? styles.tenureBadgeRowEligible : styles.tenureBadgeRowIneligible]}>
                <View style={styles.tenureBadgeLeft}>
                  <View style={[styles.tenureIconBox, isEligibleTenure ? styles.tenureIconBoxEligible : styles.tenureIconBoxIneligible]}>
                    <AppIcon name={isEligibleTenure ? 'check' : 'lock'} size={11} color="#ffffff" />
                  </View>
                  <Text style={styles.tenureLabelText}>
                    Masa Kerja: <Text style={styles.tenureValueText}>{Math.floor(masaKerjaBulan / 12)} Thn {masaKerjaBulan % 12} Bln</Text>
                  </Text>
                </View>

                <View style={[styles.tenureStatusPill, isEligibleTenure ? styles.tenureStatusPillEligible : styles.tenureStatusPillIneligible]}>
                  <Text style={[styles.tenureStatusPillText, isEligibleTenure ? styles.tenureStatusTextEligible : styles.tenureStatusTextIneligible]}>
                    {isEligibleTenure ? '✓ Lolos Syarat (Min. 1 Thn)' : '✗ Belum 1 Tahun'}
                  </Text>
                </View>
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
                      <View style={styles.totalDeductionLeft}>
                        <View style={styles.totalDeductionTagBadge}>
                          <Text style={styles.totalDeductionTagline}>TOTAL POTONG SLIP GAJI</Text>
                        </View>
                        <Text style={styles.totalDeductionSubinfo}>
                          Total Utang: <Text style={styles.totalDeductionSubBold}>Rp {formatRupiah(currentPinjamanAktif)}</Text>
                        </Text>
                        <Text style={styles.totalDeductionTenorInfo}>
                          Tenor s.d. {currentSisaTenor} Bulan
                        </Text>
                      </View>
                      <View style={styles.totalDeductionRight}>
                        <Text style={styles.totalDeductionLargeVal}>
                          Rp {formatRupiah(currentAngsuran)}
                        </Text>
                        <Text style={styles.totalDeductionUnit}>/bulan</Text>
                      </View>
                    </View>

                    {/* Tombol Detail Rincian Angsuran 1, 2, dst */}
                    <TouchableOpacity
                      style={styles.detailAngsuranTriggerBtn}
                      onPress={() => setDetailModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.detailAngsuranTriggerLeft}>
                        <View style={styles.detailAngsuranIconBox}>
                          <AppIcon name="receipt" size={15} color="#ffffff" />
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
                      <View style={styles.safeLimitIconBox}>
                        <AppIcon name="check" size={11} color="#ffffff" />
                      </View>
                      <Text style={styles.safeLimitText}>
                        Rp {formatRupiah(currentAngsuran)} ≤ Rp {formatRupiah(maxDeductionPerMonth)} (Batas 30% Gaji) — <Text style={styles.safeLimitBold}>Aman</Text>
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
                    <View style={styles.pendingBadgeIconBox}>
                      <AppIcon name="receipt" size={15} color="#ffffff" />
                    </View>
                    <Text style={styles.pendingBadgeTitle}>Menunggu Persetujuan</Text>
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
                <View style={styles.openFormIconBox}>
                  <AppIcon name="bolt" size={13} color="#ffffff" />
                </View>
                <Text style={styles.openFormBtnText}>Ajukan Pinjaman Baru</Text>
              </TouchableOpacity>
            ) : (
              /* FORM PENGAJUAN PINJAMAN SAJA */
              <View style={styles.formContainerCard}>
                <View style={styles.formCardHeader}>
                  <View style={styles.formTitleRow}>
                    <View style={styles.formTitleIconBox}>
                      <AppIcon name="receipt" size={15} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.formTitle}>Formulir Pengajuan Pinjaman</Text>
                      <Text style={styles.formSub}>Isi data pinjaman anggota koperasi</Text>
                    </View>
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
                <Text style={styles.inputFieldLabel}>
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
                <Text style={styles.inputFieldLabel}>
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

                {/* Live Quick Calculation Preview Inside Form */}
                {parsedAmount > 0 && (
                  <View style={styles.formLiveCalcCard}>
                    <View style={styles.formLiveCalcTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLiveCalcTag}>ESTIMASI ANGSURAN PINJAMAN</Text>
                        <Text style={styles.formLiveCalcSub}>
                          Tenor {selectedTenor} Bulan • Jasa 0.8% Flat
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.formLiveCalcAmount}>
                          Rp {formatRupiah(monthlyTotal)}
                          <Text style={styles.formLiveCalcUnit}>/bln</Text>
                        </Text>
                        <Text style={styles.formLiveCalcNote}>Potong Slip Gaji</Text>
                      </View>
                    </View>

                    {currentPinjamanAktif > 0 && (
                      <View style={styles.formLiveMergedRow}>
                        <Text style={styles.formLiveMergedText}>
                          Total Potong Gaji (Lama + Baru): <Text style={styles.boldDark}>Rp {formatRupiah(combinedMonthlyInstallment)}/bln</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Tombol Lanjut ke Kalkulasi */}
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
                      : 'Lanjut ke Rincian Kalkulasi ›'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 2: RINCIAN KALKULASI ANGSURAN PINJAMAN (LANGKAH 2 DARI 3)           */}
        {/* ========================================================================= */}
        {stage === 'verification_calculation' && (
          <View style={styles.calcStageContainer}>
            {/* Header Stage & Stepper */}
            <View style={styles.stageHeaderCard}>
              <View style={styles.stageStepRow}>
                <View style={styles.stageStepPill}>
                  <Text style={styles.stageStepPillText}>Langkah 2 dari 3</Text>
                </View>
                <Text style={styles.stageStepHint}>Kalkulasi & Simulasi Angsuran</Text>
              </View>
              <Text style={styles.stageHeaderTitle}>Rincian Angsuran Pinjaman</Text>
              <Text style={styles.stageHeaderSub}>
                Periksa rincian kalkulasi pinjaman sebelum lanjut ke otorisasi PIN
              </Text>
            </View>

            {/* Main Calculation Card */}
            <View style={styles.mainReceiptCard}>
              {/* Top Monthly Highlight */}
              <View style={styles.receiptHeroBanner}>
                <View style={styles.receiptHeroLeft}>
                  <View style={styles.receiptHeroIconBox}>
                    <AppIcon name="receipt" size={13} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.receiptHeroLabel}>ANGSURAN BULANAN BARU</Text>
                    <Text style={styles.receiptHeroSub}>
                      Tenor {selectedTenor} Bulan • Jasa 0.8% Flat / bln
                    </Text>
                  </View>
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
                  <View>
                    <Text style={styles.receiptTotalLabel}>Total Pengembalian Pinjaman</Text>
                    <Text style={styles.receiptTotalSub}>Pokok Pinjaman + Total Jasa</Text>
                  </View>
                  <Text style={styles.receiptTotalVal}>Rp {formatRupiah(totalRepayment)}</Text>
                </View>
              </View>

              {/* JIKA ADA ANGSURAN LAMA: KALKULASI GABUNGAN OTOMATIS */}
              {currentPinjamanAktif > 0 && (
                <View style={styles.combinedLoanWrapper}>
                  <View style={styles.combinedHeaderRow}>
                    <View style={styles.combinedIconBox}>
                      <AppIcon name="bolt" size={13} color="#ffffff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.combinedTitle}>Kalkulasi Gabungan Cicilan</Text>
                      <Text style={styles.combinedSub}>Akumulasi potongan slip gaji per bulan</Text>
                    </View>
                  </View>

                  <View style={styles.combinedSplitGrid}>
                    <View style={styles.combinedSplitCard}>
                      <Text style={styles.splitCardLabel}>Cicilan Berjalan</Text>
                      <Text style={styles.splitCardValDark}>
                        Rp {formatRupiah(currentAngsuran)}
                        <Text style={styles.splitCardUnit}>/bln</Text>
                      </Text>
                      <Text style={styles.splitCardSub}>Sisa Pokok Rp {formatRupiah(currentPinjamanAktif)}</Text>
                    </View>
                    <View style={[styles.combinedSplitCard, styles.combinedSplitCardHighlight]}>
                      <Text style={styles.splitCardLabelBlue}>Pinjaman Baru</Text>
                      <Text style={styles.splitCardValBlue}>
                        + Rp {formatRupiah(monthlyTotal)}
                        <Text style={styles.splitCardUnitBlue}>/bln</Text>
                      </Text>
                      <Text style={styles.splitCardSubBlue}>Pokok Rp {formatRupiah(parsedAmount)}</Text>
                    </View>
                  </View>

                  {/* Pure Blue Total Monthly Deduction Card (Gambar 2 Cleaned Up) */}
                  <View style={styles.totalDeductionBlueCard}>
                    <View style={styles.totalDeductionLeft}>
                      <View style={styles.totalDeductionTagBadge}>
                        <Text style={styles.totalDeductionTagline}>TOTAL POTONG SLIP GAJI</Text>
                      </View>
                      <Text style={styles.totalDeductionSubinfo}>
                        Total Utang: <Text style={styles.totalDeductionSubBold}>Rp {formatRupiah(combinedTotalLoan)}</Text>
                      </Text>
                      <Text style={styles.totalDeductionTenorInfo}>
                        Tenor gabungan s.d. {combinedMaxTenor} Bulan
                      </Text>
                    </View>
                    <View style={styles.totalDeductionRight}>
                      <Text style={styles.totalDeductionLargeVal}>
                        Rp {formatRupiah(combinedMonthlyInstallment)}
                      </Text>
                      <Text style={styles.totalDeductionUnit}>/bulan</Text>
                    </View>
                  </View>

                  {/* Safe Limit Verification Pill */}
                  <View style={styles.safeLimitBadge}>
                    <View style={styles.safeLimitIconBox}>
                      <AppIcon name="check" size={11} color="#ffffff" />
                    </View>
                    <Text style={styles.safeLimitText}>
                      Rp {formatRupiah(combinedMonthlyInstallment)} ≤ Rp {formatRupiah(maxDeductionPerMonth)} (Batas 30% Gaji) — <Text style={styles.safeLimitBold}>Aman</Text>
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons for Step 2 */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={styles.backToFormBtn}
                onPress={() => setStage('form')}
                activeOpacity={0.7}
              >
                <Text style={styles.backToFormBtnText}>‹ Ubah Form</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitVerificationBtn}
                onPress={() => {
                  setPinInput('');
                  setStage('authorization_pin');
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.submitVerificationBtnText}>Lanjut ke Otorisasi PIN ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 3: VERIFIKASI & OTORISASI PIN (LANGKAH 3 DARI 3)                     */}
        {/* ========================================================================= */}
        {stage === 'authorization_pin' && (
          <View style={styles.calcStageContainer}>
            {/* Header Stage & Stepper */}
            <View style={styles.stageHeaderCard}>
              <View style={styles.stageStepRow}>
                <View style={styles.stageStepPill}>
                  <Text style={styles.stageStepPillText}>Langkah 3 dari 3</Text>
                </View>
                <Text style={styles.stageStepHint}>Otorisasi & Konfirmasi</Text>
              </View>
              <Text style={styles.stageHeaderTitle}>Otorisasi Pengajuan Pinjaman</Text>
              <Text style={styles.stageHeaderSub}>
                Selesaikan verifikasi keamanan akun untuk mengirim pengajuan pinjaman
              </Text>
            </View>

            {/* Mini Summary Card */}
            <View style={styles.authSummaryCard}>
              <View style={styles.authSummaryRow}>
                <View style={styles.authSummaryCol}>
                  <Text style={styles.authSummaryLabel}>Nominal Pinjaman</Text>
                  <Text style={styles.authSummaryVal}>Rp {formatRupiah(parsedAmount)}</Text>
                  <Text style={styles.authSummarySub}>Tenor {selectedTenor} Bulan</Text>
                </View>
                <View style={styles.authSummaryDivider} />
                <View style={styles.authSummaryCol}>
                  <Text style={styles.authSummaryLabel}>Total Potong Gaji</Text>
                  <Text style={styles.authSummaryValBlue}>
                    Rp {formatRupiah(currentPinjamanAktif > 0 ? combinedMonthlyInstallment : monthlyTotal)}
                  </Text>
                  <Text style={styles.authSummarySubBlue}>/bulan (Slip Gaji)</Text>
                </View>
              </View>
            </View>

            {/* Verification Notice Card (Gambar 1 - Atas) */}
            <View style={styles.verificationNoticeCard}>
              <View style={styles.noticeIconBox}>
                <AppIcon name="clock" size={16} color="#ffffff" />
              </View>
              <View style={styles.noticeTextContainer}>
                <Text style={styles.noticeHeading}>Verifikasi Koperasi & HRD (Maksimal 2 Hari)</Text>
                <Text style={styles.noticeBody}>
                  Pengajuan ini akan diverifikasi kelayakan slip gaji & disetujui Pengurus Koperasi & HRD PT BIT dalam waktu maksimal 2 hari kerja sebelum dicairkan.
                </Text>
              </View>
            </View>

            {/* Input PIN Otorisasi Anggota (Gambar 1 - Bawah) */}
            <View style={styles.pinSectionCard}>
              <View style={styles.pinHeaderArea}>
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

            {/* Action Buttons for Step 3 */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity
                style={styles.backToFormBtn}
                onPress={() => setStage('verification_calculation')}
                activeOpacity={0.7}
              >
                <Text style={styles.backToFormBtnText}>‹ Rincian Kalkulasi</Text>
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
                  <Text style={styles.submitVerificationBtnText}>Kirim Pengajuan Sekarang ›</Text>
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
                onPress={() => {
                  setIsFormVisible(false);
                  setStage('form');
                }}
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
                <View style={[styles.modalTitleIconBox, { backgroundColor: '#2563eb' }]}>
                  <AppIcon name="receipt" size={15} color="#ffffff" />
                </View>
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
                <View style={[styles.modalTitleIconBox, { backgroundColor: '#059669' }]}>
                  <AppIcon name="simpanan" size={15} color="#ffffff" />
                </View>
                <Text style={styles.modalMainTitle}>Bayar / Lunasi Angsuran</Text>
              </View>
              <TouchableOpacity onPress={() => setRepayModalVisible(false)} style={styles.modalCloseBtn}>
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* PAYROLL AUTOMATIC INFO BANNER */}
              <View style={styles.payrollNoticeBox}>
                <View style={styles.payrollNoticeHeaderRow}>
                  <View style={styles.payrollNoticeIconWrap}>
                    <AppIcon name="receipt" size={16} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payrollNoticeTitle}>Angsuran Rutin via Slip Gaji (Payroll)</Text>
                    <Text style={styles.payrollNoticeBadgeText}>Pemotongan Otomatis Aktif</Text>
                  </View>
                </View>
                <Text style={styles.payrollNoticeDesc}>
                  Angsuran rutin sebesar <Text style={{ fontWeight: '800', color: '#0f172a' }}>Rp {formatRupiah(currentAngsuran)}/bulan</Text> sudah dipotong otomatis dari slip gaji bulanan Anda.
                </Text>
                <Text style={styles.payrollNoticeDescSub}>
                  Fitur di bawah ini digunakan khusus jika Anda ingin melakukan <Text style={{ fontWeight: '700', color: '#1d72db' }}>pelunasan dipercepat</Text> atau pembayaran angsuran ekstra secara mandiri via QRIS.
                </Text>
              </View>

              {/* METODE PEMBAYARAN: HANYA QRIS */}
              <Text style={styles.inputFieldLabel}>Metode Pembayaran Mandiri</Text>
              <View style={styles.paymentMethodSelector}>
                <View style={[styles.paymentMethodCard, styles.paymentMethodCardActive]}>
                  <View style={styles.paymentMethodRadioRow}>
                    <View style={[styles.radioCircleOuter, styles.radioCircleOuterActive]}>
                      <View style={styles.radioCircleInner} />
                    </View>
                    <View style={[styles.paymentMethodIconBadge, { backgroundColor: '#fef2f2' }]}>
                      <AppIcon name="qris" size={14} color="#dc2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentMethodTitle}>Bayar Menggunakan QRIS</Text>
                      <Text style={styles.paymentMethodSub}>
                        BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* INPUT NOMINAL PEMBAYARAN */}
              <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>Nominal Pelunasan / Pembayaran</Text>
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

              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  parsedRepay <= 0 && styles.primaryActionBtnDisabled,
                ]}
                onPress={handleInitiateRepay}
                disabled={parsedRepay <= 0}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>
                  {parsedRepay <= 0
                    ? 'Masukkan Nominal'
                    : `Lanjut Bayar via QRIS (Rp ${formatRupiah(parsedRepay)}) ›`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL PEMBAYARAN VIA KODE QRIS STANDAR NASIONAL (RESMI)                  */}
      {/* ========================================================================= */}
      <QrisPaymentModal
        visible={qrisModalVisible}
        onClose={() => setQrisModalVisible(false)}
        serviceTitle={parsedRepay >= currentPinjamanAktif ? 'Pelunasan Total Pinjaman' : 'Pembayaran Angsuran Pinjaman'}
        serviceType="pinjaman"
        targetNumber={`No. Ref: ${submittedTicket?.ticketNo || 'KOP-PINJ-8812'}`}
        customerName={mockUser.name}
        amount={parsedRepay}
        adminFee={0}
        onPaymentConfirmed={handleConfirmQrisRepayment}
      />

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

            {/* Tombol Cetak Bukti & Bagikan Bukti */}
            <View style={styles.receiptActionBtnsRow}>
              <TouchableOpacity
                style={styles.btnCetakBukti}
                onPress={handleDownloadRepayReceipt}
                activeOpacity={0.85}
              >
                <AppIcon name="download" size={14} color="#1d72db" />
                <Text style={styles.btnCetakBuktiText}>Cetak Bukti</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnBagikanBukti}
                onPress={() => setRepayShareModalVisible(true)}
                activeOpacity={0.85}
              >
                <AppIcon name="share" size={14} color="#ffffff" />
                <Text style={styles.btnBagikanBuktiText}>Bagikan Bukti</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeSuccessBtn}
              onPress={() => setRepaySuccessModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeSuccessBtnText}>Selesai & Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL BAGIKAN BUKTI PELUNASAN PINJAMAN (SHARE SHEET)                     */}
      {/* ========================================================================= */}
      <Modal
        visible={repayShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRepayShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareSheetContainer}>
            <View style={styles.shareSheetHeader}>
              <Text style={styles.shareSheetTitle}>Bagikan Bukti Pembayaran</Text>
              <TouchableOpacity
                onPress={() => setRepayShareModalVisible(false)}
                style={styles.shareCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.shareSheetSubtitle}>
              Pilih aplikasi untuk membagikan bukti pelunasan angsuran resmi:
            </Text>

            <View style={styles.shareAppRow}>
              <TouchableOpacity
                style={styles.shareAppItem}
                onPress={handleShareRepayWhatsApp}
                activeOpacity={0.8}
              >
                <View style={[styles.shareAppIconBox, { backgroundColor: '#25D366' }]}>
                  <Image source={waLogo} style={styles.shareAppImg} resizeMode="contain" />
                </View>
                <Text style={styles.shareAppName}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareAppItem}
                onPress={handleShareRepayTelegram}
                activeOpacity={0.8}
              >
                <View style={[styles.shareAppIconBox, { backgroundColor: '#229ED9' }]}>
                  <Image source={teleLogo} style={styles.shareAppImg} resizeMode="contain" />
                </View>
                <Text style={styles.shareAppName}>Telegram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareAppItem}
                onPress={handleCopyRepayText}
                activeOpacity={0.8}
              >
                <View style={[styles.shareAppIconBox, { backgroundColor: '#0284c7' }]}>
                  <AppIcon name="copy" size={20} color="#ffffff" />
                </View>
                <Text style={styles.shareAppName}>Salin Teks</Text>
              </TouchableOpacity>
            </View>

            {repayCopiedToast && (
              <View style={styles.copiedToast}>
                <AppIcon name="check" size={14} color="#16a34a" />
                <Text style={styles.copiedToastText}>Teks bukti pembayaran berhasil disalin!</Text>
              </View>
            )}
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
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  plafonCol: {
    flex: 1,
    justifyContent: 'center',
  },
  plafonColHighlight: {
    backgroundColor: '#eff6ff',
    borderRadius: 7,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  plafonDivider: {
    width: 1.2,
    height: 28,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 6,
  },
  plafonLabel: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  plafonVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  plafonValUnit: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
  },
  plafonLabelBlue: {
    fontSize: 9.5,
    color: '#1d4ed8',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  plafonValBlue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1d72db',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  tenureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  tenureBadgeRowEligible: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  tenureBadgeRowIneligible: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecdd3',
  },
  tenureBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  tenureIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenureIconBoxEligible: {
    backgroundColor: '#16a34a',
  },
  tenureIconBoxIneligible: {
    backgroundColor: '#dc2626',
  },
  tenureLabelText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  tenureValueText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  tenureStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tenureStatusPillEligible: {
    backgroundColor: '#dcfce7',
  },
  tenureStatusPillIneligible: {
    backgroundColor: '#fee2e2',
  },
  tenureStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tenureStatusTextEligible: {
    color: '#15803d',
  },
  tenureStatusTextIneligible: {
    color: '#b91c1c',
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
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    paddingVertical: 14,
    marginTop: 4,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  openFormIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openFormBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1d72db',
  },
  formContainerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  /* Form Live Calc Preview */
  formLiveCalcCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    padding: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  formLiveCalcTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formLiveCalcTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formLiveCalcIconBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLiveCalcTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#1d4ed8',
  },
  formLiveCalcSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 3,
    fontWeight: '600',
  },
  formLiveCalcAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1d72db',
  },
  formLiveCalcUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3b82f6',
  },
  formLiveCalcNote: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
  formLiveMergedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
  },
  formLiveMergedIconBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLiveMergedText: {
    fontSize: 10,
    color: '#1e3a8a',
    flex: 1,
    fontWeight: '500',
  },
  formCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  formTitleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hideFormBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
  },
  inputFieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  fieldIconBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
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
    marginBottom: 10,
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
    marginBottom: 10,
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
    marginBottom: 10,
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
    gap: 14,
    paddingBottom: 20,
  },
  stageHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  stageStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stageStepPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageStepPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d72db',
  },
  stageStepHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  stageHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  stageHeaderSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 15,
  },
  mainReceiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptHeroBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1.2,
    borderBottomColor: '#e2e8f0',
  },
  receiptHeroLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  receiptHeroIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptHeroLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#0f172a',
  },
  receiptHeroSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  receiptHeroRight: {
    alignItems: 'flex-end',
  },
  receiptHeroAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1d72db',
    letterSpacing: -0.4,
  },
  receiptHeroUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3b82f6',
  },
  receiptBreakdownList: {
    padding: 16,
    gap: 10,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptItemLabel: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  receiptItemVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  purposeTag: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '55%',
  },
  purposeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  receiptDashedDivider: {
    height: 1.2,
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
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  receiptTotalSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
  receiptTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1d72db',
    letterSpacing: -0.3,
  },
  combinedLoanWrapper: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1.2,
    borderTopColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  combinedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  combinedIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  combinedTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  combinedSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  combinedSplitGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  combinedSplitCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
  },
  combinedSplitCardHighlight: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  splitCardLabel: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '700',
  },
  splitCardLabelBlue: {
    fontSize: 9.5,
    color: '#1d4ed8',
    fontWeight: '800',
  },
  splitCardValDark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  splitCardValBlue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1d72db',
    marginTop: 2,
  },
  splitCardUnit: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
  },
  splitCardUnitBlue: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#3b82f6',
  },
  splitCardSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '500',
  },
  splitCardSubBlue: {
    fontSize: 9.5,
    color: '#2563eb',
    marginTop: 3,
    fontWeight: '600',
  },
  /* Blue Total Monthly Deduction Card (Clean 2-Column Layout) */
  totalDeductionBlueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1d72db',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  totalDeductionLeft: {
    flex: 1,
    paddingRight: 10,
  },
  totalDeductionTagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  totalDeductionTagline: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  totalDeductionSubinfo: {
    fontSize: 10,
    color: '#e0f2fe',
    marginTop: 1,
  },
  totalDeductionSubBold: {
    fontWeight: '800',
    color: '#ffffff',
  },
  totalDeductionTenorInfo: {
    fontSize: 9,
    color: '#bae6fd',
    marginTop: 1.5,
    fontWeight: '600',
  },
  totalDeductionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalDeductionLargeVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  totalDeductionUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#bae6fd',
    marginTop: 1,
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
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  pendingBadgeIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBadgeTitle: {
    fontSize: 12,
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
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1.2,
    borderColor: '#bbf7d0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  safeLimitIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeLimitText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803d',
    flex: 1,
  },
  safeLimitBold: {
    fontWeight: '900',
    color: '#15803d',
  },
  /* Mini Summary for Stage 3 (Authorization PIN) */
  authSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  authSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authSummaryCol: {
    flex: 1,
  },
  authSummaryDivider: {
    width: 1.2,
    height: 36,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  authSummaryLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  authSummaryVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  authSummarySub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  authSummaryValBlue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1d72db',
    marginTop: 2,
  },
  authSummarySubBlue: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563eb',
    marginTop: 1,
  },
  verificationNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  noticeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  noticeBody: {
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
    lineHeight: 16,
  },
  pinSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  pinHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pinSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  pinSectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14,
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
    width: 40,
    height: 46,
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
    backgroundColor: '#1d72db',
  },
  pinInputHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  backToFormBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToFormBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  submitVerificationBtn: {
    flex: 2,
    backgroundColor: '#1d72db',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitVerificationBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitVerificationBtnText: {
    fontSize: 12.5,
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
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
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
  receiptActionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 14,
    marginBottom: 8,
  },
  btnCetakBukti: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1.2,
    borderColor: '#93c5fd',
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnCetakBuktiText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d72db',
  },
  btnBagikanBukti: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1d72db',
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  btnBagikanBuktiText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeSuccessBtn: {
    width: '100%',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSuccessBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  shareSheetContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  shareSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shareSheetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  shareCloseBtn: {
    padding: 4,
  },
  shareSheetSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 15,
  },
  shareAppRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
  },
  shareAppItem: {
    alignItems: 'center',
    gap: 6,
  },
  shareAppIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  shareAppImg: {
    width: 28,
    height: 28,
  },
  shareAppName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  copiedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  copiedToastText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  payrollNoticeBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    marginBottom: 14,
  },
  payrollNoticeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  payrollNoticeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  modalTitleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  payrollNoticeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1e40af',
  },
  payrollNoticeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 1,
  },
  payrollNoticeDesc: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 15,
    marginBottom: 4,
  },
  payrollNoticeDescSub: {
    fontSize: 9.5,
    color: '#64748b',
    lineHeight: 14,
  },
});
