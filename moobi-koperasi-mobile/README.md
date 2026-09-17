# Moobi Koperasi Mobile (Aplikasi Karyawan)

Aplikasi Mobile Karyawan untuk **Moobi Koperasi + Kantin Digital 2026** berbasis **React Native** & **TypeScript** dengan tampilan modern *Fintech Dark Mode* (GoPay style).

---

## 📱 Fitur Layar Karyawan

1. **Beranda (`BerandaScreen`)**
   - Kartu Saldo Koperasi (Toggle sembunyikan saldo, Top Up, Tarik Tunai, Transfer).
   - Widget Pengingat Tagihan & Jatuh Tempo (PLN Pascabayar / Cicilan).
   - 8 Shortcut Menu Cepat: Transfer, Paket Data, Pulsa, Token PLN, Kantin Digital, Simpanan, Pinjaman s.d 25jt, Lihat Semua.
   - Quick Contacts transfer antar rekan kerja di pabrik.
   - Daily Check-in Rewards Moobi Coins.

2. **Keuangan (`KeuanganScreen`)**
   - **Sumber Dana**: Saldo Utama Koperasi, Moobi Coins, Plafon Pinjaman Paylater Karyawan.
   - **Simpanan & Asuransi**: BPJS Ketenagakerjaan, Simpanan Sukarela, Tabungan Emas.
   - **Pinjaman**: Pengajuan Pinjaman Karyawan hingga Rp 25.000.000 dengan simulasi cicilan potong gaji.
   - **Kantin & Merchant**: QRIS Kasir Kantin.
   - **Akun Penerima**: Rekening bank dan ShopeePay terdaftar.

3. **QRIS Center Scanner (`QrisScreen`)**
   - Mode Scan Kamera QR untuk pembayaran cepat di kasir kantin pabrik 100% *cashless*.
   - Mode Tampilkan QR Saya (ID Karyawan) untuk pembayaran/top-up *offline*.

4. **Riwayat (`RiwayatScreen`)**
   - Tombol Download Rekap Mutasi Transaksi (PDF/Excel).
   - Filter Chips interaktif `[Tanggal ⌄]`, `[Layanan ⌄]`, `[Metode ⌄]`.
   - Riwayat terkelompok per bulan (*Agustus 2026*, *Juli 2026*) dan per hari dengan badge nominal (`+` / `-`).

5. **Profil & Keamanan (`ProfilScreen`)**
   - User Card: Nama Karyawan, NIK / ID Pabrik, Email terverifikasi.
   - Skor Perlindungan Akun **100% Aman Sentosa**.
   - Pengaturan Akun & Notifikasi Koperasi.
   - Pusat Bantuan CS Koperasi 24 Jam.
   - Tombol Keluar (Logout).

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Install Dependencies
```bash
cd moobi-koperasi-mobile
npm install
```

### 2. Jalankan Server Pengembangan (Expo / React Native)
```bash
npm start
# atau
npm run android   # untuk emulator/perangkat Android
npm run web       # untuk preview langsung di browser
```
