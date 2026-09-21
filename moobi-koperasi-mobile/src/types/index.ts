export type TabType = 'beranda' | 'keuangan' | 'riwayat' | 'profil';

export type ActiveScreenType =
  | TabType
  | 'transfer'
  | 'tarik'
  | 'tagihan'
  | 'pulsa'
  | 'token'
  | 'emoney'
  | 'pdam'
  | 'bpjs'
  | 'pinjaman'
  | 'kantin'
  | 'simpanan_wajib'
  | 'simpanan_sukarela';

export interface ElektronikProductItem {
  id: string;
  name: string;
  brand: 'Miyako' | 'Rinnai' | 'Shimizu';
  category: 'dapur' | 'living' | 'cooling';
  price: number;
  originalPrice: number;
  discountBadge?: string;
  stock: number;
  image: any;
  specs: string;
  warranty: string;
  cicilanPerBulan: number;
}

export type BillCategoryType = 'pln' | 'bpjs' | 'pdam' | 'internet';

export interface BillItem {
  id: BillCategoryType;
  title: string;
  categoryName: string;
  subName: string;
  defaultId: string;
  amount: number;
  dueDateText: string;
  logo: any;
  customerName: string;
  serviceDetail: string;
  period: string;
  isPaid?: boolean;
}

export interface UserProfile {
  id: string;
  nik: string;
  name: string;
  jabatan: string;
  phone: string;
  email: string;
  company: string;
  department: string;
  shift: string;
  gajiBulanan: number;
  masaKerjaBulan: number;
  memberSince: string;
  securityScore: number;
  isPayrollLinked: boolean;
  waNotificationActive: boolean;
  isEligiblePinjaman: boolean;
  isEligibleTarikWajib: boolean;
  avatarUri?: string | null;
}

export interface KoperasiWallet {
  saldoUtama: number; // Saldo Simpanan Sukarela tabungan anggota (hanya untuk penarikan dana)
  saldoKantin?: number;
  moobiCoins: number;

  gajiPokok: number;
  plafonPinjaman: number; // 30% x Gaji x 12
  pinjamanAktif: number;
  angsuranPerBulan: number;
  sisaTenorBulan: number;
  simpananPokok: number;
  simpananWajib: number; // Terkunci s.d. 1 thn masa kerja
  simpananSukarela: number; // Tabungan sukarela, khusus penarikan dana
  estimasiPotongGajiBulanIni: number;
  estimasiBagiHasilSHU: number;
}

export interface TransactionItemDetail {
  name: string;
  qty?: number;
  price?: number;
  note?: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  category: 'ppob' | 'kantin' | 'elektronik' | 'simpan_pinjam' | 'transfer' | 'topup' | 'tarik' | 'payroll';
  description: string;
  amount: number;
  isCredit: boolean; // true = dana masuk (+), false = transaksi keluar/potongan (-)
  paymentSource: string; // 'Payment Gateway (Pihak Ke-3)' | 'QRIS Pihak Ke-3' | 'Virtual Account' | 'Potong Gaji Payroll' | 'Simpanan Sukarela (Penarikan)'
  timestamp: string;
  dateLabel: string;
  monthLabel: string;
  iconName: string;
  statusText?: string;
  referenceNo?: string;
  itemDetails?: TransactionItemDetail[];
  metadata?: {
    locationOrStand?: string;
    warranty?: string;
    payrollPeriod?: string;
    slipNo?: string;
    bankAccount?: string;
    accountHolder?: string;
    notes?: string;
  };
}

export interface KantinMenuItem {
  id: string;
  name: string;
  category: 'makanan' | 'minuman' | 'snack';
  price: number;
  originalPrice?: number;
  stock: number;
  imageKey: string;
  canteenStand: string;
  estimatedPrepTime: string;
}
