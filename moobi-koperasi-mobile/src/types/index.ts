export type TabType = 'beranda' | 'keuangan' | 'qris' | 'riwayat' | 'profil';

export type ActiveScreenType =
  | TabType
  | 'produk'
  | 'transfer'
  | 'tarik'
  | 'tagihan'
  | 'pulsa'
  | 'pinjaman'
  | 'kantin';

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
  phone: string;
  email: string;
  company: string;
  department: string;
  shift: string;
  memberSince: string;
  securityScore: number;
  isPayrollLinked: boolean;
  waNotificationActive: boolean;
}

export interface KoperasiWallet {
  saldoUtama: number;
  saldoKantin?: number;
  moobiCoins: number;

  plafonPinjaman: number;
  pinjamanAktif: number;
  angsuranPerBulan: number;
  sisaTenorBulan: number;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  estimasiPotongGajiBulanIni: number;
  estimasiBagiHasilSHU: number;
}

export interface TransactionItem {
  id: string;
  title: string;
  category: 'ppob' | 'kantin' | 'elektronik' | 'simpan_pinjam' | 'transfer' | 'topup' | 'tarik' | 'payroll';
  description: string;
  amount: number;
  isCredit: boolean; // true = dana masuk (+), false = transaksi keluar/potongan (-)
  paymentSource: string; // 'Saldo Koperasi' | 'Moobi Coins' | 'Potong Gaji Payroll' | 'Saldo Kantin'
  timestamp: string;
  dateLabel: string;
  monthLabel: string;
  iconName: string;
  statusText?: string;
  referenceNo?: string;
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

