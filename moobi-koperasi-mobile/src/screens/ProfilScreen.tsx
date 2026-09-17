import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Switch,
  TextInput,
} from 'react-native';
import { AppIcon } from '../components/common/AppIcon';
import { mockUser, mockWallet } from '../data/mockData';

interface ProfilScreenProps {
  onLogout?: () => void;
}

export const ProfilScreen: React.FC<ProfilScreenProps> = ({ onLogout }) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [waNotifEnabled, setWaNotifEnabled] = useState(true);
  const [payrollDebitEnabled, setPayrollDebitEnabled] = useState(true);

  const [newPin, setNewPin] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handleCopyNik = () => {
    Alert.alert('Tersalin! 📋', `NIK Anggota ${mockUser.nik} berhasil disalin ke clipboard.`);
  };

  const handleAction = (title: string, msg?: string) => {
    Alert.alert(
      title,
      msg || `Fitur ${title} terhubung langsung dengan sistem HRD & Koperasi PT Bakti Idola Tama.`
    );
  };

  const handleSaveNewPin = () => {
    if (newPin.length < 6) {
      Alert.alert('PIN Tidak Lengkap', 'PIN harus terdiri dari 6 angka.');
      return;
    }
    setPinModalVisible(false);
    setNewPin('');
    Alert.alert('Berhasil! 🔒', 'PIN transaksi 6-digit Anda berhasil diperbarui.');
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Royal Blue with Ambient Watermarks */}
        <View style={styles.header}>
          <View style={styles.watermarkCircle1} />
          <View style={styles.watermarkCircle2} />

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Profil & Keanggotaan</Text>
              <View style={styles.verifiedRow}>
                <View style={styles.liveSyncDot} />
                <Text style={styles.headerSub}>PT Bakti Idola Tama • Single ID Karyawan</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Anggota Aktif</Text>
            </View>
          </View>

          {/* Holographic VIP Member Smart Card */}
          <View style={styles.digitalCard}>
            {/* Top Pass Header */}
            <View style={styles.digitalCardHeader}>
              <View style={styles.cardBrandRow}>
                <Image
                  source={require('../../assets/transfer/paguyuban.png')}
                  style={styles.cardLogoPaguyuban}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.cardBrandText}>KOPERASI KARYAWAN PT BIT</Text>
                  <Text style={styles.cardBrandSub}>PT Bakti Idola Tama • Verified Member</Text>
                </View>
              </View>
              <View style={styles.chipGraphic}>
                <View style={styles.chipInner1} />
                <View style={styles.chipInner2} />
              </View>
            </View>

            {/* Middle Profile Row */}
            <View style={styles.cardMainRow}>
              {/* Profile Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatarImgBox}>
                  <Text style={styles.avatarInitials}>BS</Text>
                </View>
                <View style={styles.verifiedCheckPill}>
                  <AppIcon name="check-circle" size={12} color="#ffffff" />
                </View>
              </View>

              {/* User Meta Details */}
              <View style={styles.userMetaCol}>
                <Text style={styles.userNameText}>{mockUser.name}</Text>
                <Text style={styles.userDeptText}>
                  Quality Control (QC Dept) • Plant A
                </Text>
                <View style={styles.nikPillRow}>
                  <Text style={styles.nikPillText}>NIK: {mockUser.nik}</Text>
                  <TouchableOpacity onPress={handleCopyNik} style={styles.nikCopyIconBtn} activeOpacity={0.7}>
                    <AppIcon name="copy" size={11} color="#bae6fd" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Bottom Pass Bar with QR Button */}
            <View style={styles.cardFooterDivider} />
            <View style={styles.digitalCardFooter}>
              <View style={styles.cardFooterLeft}>
                <View style={styles.onlineDot} />
                <Text style={styles.cardFooterText}>Auto-Payroll Slip Gaji Aktif</Text>
              </View>

              <TouchableOpacity
                style={styles.qrCodePillBtn}
                onPress={() => setQrModalVisible(true)}
                activeOpacity={0.85}
              >
                <AppIcon name="qris" size={13} color="#1d72db" />
                <Text style={styles.qrCodePillText}>Tampilkan QR ID</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. Mini Stat Highlights */}
        <View style={styles.miniStatsSection}>
          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIconWrap, { backgroundColor: '#eff6ff' }]}>
              <AppIcon name="check-circle" size={16} color="#1d72db" />
            </View>
            <Text style={styles.miniStatVal}>Karyawan Tetap</Text>
            <Text style={styles.miniStatLabel}>Status Kerja</Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIconWrap, { backgroundColor: '#f0fdf4' }]}>
              <AppIcon name="calendar" size={16} color="#16a34a" />
            </View>
            <Text style={styles.miniStatVal}>Jan 2024</Text>
            <Text style={styles.miniStatLabel}>Bergabung</Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={[styles.miniStatIconWrap, { backgroundColor: '#eff6ff' }]}>
              <AppIcon name="building" size={16} color="#1d72db" />
            </View>
            <Text style={styles.miniStatVal}>Plant A</Text>
            <Text style={styles.miniStatLabel}>Lokasi Pabrik</Text>
          </View>
        </View>

        {/* 3. Informasi Data Diri & Kepegawaian */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Data Diri & Kepegawaian</Text>
          </View>

          <View style={styles.cardGroup}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="user" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>Nama Lengkap</Text>
              </View>
              <Text style={styles.infoValue}>{mockUser.name}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="lock" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>NIK Karyawan</Text>
              </View>
              <View style={styles.copyableValueRow}>
                <Text style={styles.infoValueBold}>{mockUser.nik}</Text>
                <TouchableOpacity onPress={handleCopyNik} style={styles.miniCopyBtn}>
                  <Text style={styles.miniCopyBtnText}>Salin</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="building" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>Perusahaan</Text>
              </View>
              <Text style={styles.infoValue}>PT Bakti Idola Tama</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="users" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>Divisi / Unit</Text>
              </View>
              <Text style={styles.infoValue}>Quality Control (Plant 1)</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="calendar" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>Shift Kerja</Text>
              </View>
              <Text style={styles.infoValue}>{mockUser.shift}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="phone" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>Nomor WhatsApp</Text>
              </View>
              <Text style={styles.infoValue}>{mockUser.phone}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelCol}>
                <AppIcon name="receipt" size={15} color="#64748b" />
                <Text style={styles.infoLabel}>Rekening Payroll</Text>
              </View>
              <Text style={styles.infoValue}>BCA • 8800-1234-5678</Text>
            </View>
          </View>
        </View>

        {/* 4. Keamanan Akun & Preferensi Biometrik */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Keamanan Akun & Biometrik</Text>
          </View>

          <View style={styles.cardGroup}>
            {/* Ubah PIN */}
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => setPinModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#1d72db' }]}>
                <AppIcon name="lock" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>PIN Transaksi 6-Digit</Text>
                <Text style={styles.itemSubtitle}>Autentikasi transfer, tarik tunai & belanja</Text>
              </View>
              <View style={styles.actionChevronWrap}>
                <Text style={styles.actionLinkText}>Ubah</Text>
                <AppIcon name="chevron-right" size={13} color="#1d72db" />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />

            {/* Toggle Biometrik */}
            <View style={styles.cardItem}>
              <View style={[styles.itemIconBox, { backgroundColor: '#059669' }]}>
                <AppIcon name="bolt" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Biometrik (Fingerprint / Face ID)</Text>
                <Text style={styles.itemSubtitle}>Login cepat tanpa ketik PIN</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={biometricEnabled ? '#1d72db' : '#f8fafc'}
              />
            </View>
            <View style={styles.divider} />

            {/* Toggle WhatsApp Notifications */}
            <View style={styles.cardItem}>
              <View style={[styles.itemIconBox, { backgroundColor: '#16a34a' }]}>
                <AppIcon name="check-circle" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Notifikasi Struk WhatsApp</Text>
                <Text style={styles.itemSubtitle}>Struk kantin & tagihan otomatis ke WA</Text>
              </View>
              <Switch
                value={waNotifEnabled}
                onValueChange={setWaNotifEnabled}
                trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                thumbColor={waNotifEnabled ? '#16a34a' : '#f8fafc'}
              />
            </View>
            <View style={styles.divider} />

            {/* Toggle Auto-Debit Payroll */}
            <View style={styles.cardItem}>
              <View style={[styles.itemIconBox, { backgroundColor: '#ea580c' }]}>
                <AppIcon name="wallet" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Auto-Debet Potong Gaji</Text>
                <Text style={styles.itemSubtitle}>Simpanan wajib & cicilan per bulan</Text>
              </View>
              <Switch
                value={payrollDebitEnabled}
                onValueChange={setPayrollDebitEnabled}
                trackColor={{ false: '#cbd5e1', true: '#fed7aa' }}
                thumbColor={payrollDebitEnabled ? '#ea580c' : '#f8fafc'}
              />
            </View>
          </View>
        </View>

        {/* 5. Pusat Bantuan On-Site Koperasi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Layanan & Loket Koperasi Pabrik</Text>
          </View>

          <View style={styles.cardGroup}>
            {/* Loket Koperasi */}
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() =>
                handleAction(
                  'Loket Koperasi Pabrik',
                  'Lokasi: Gedung A Lantai 1 (Sebelah Kantin Pusat)\nJam Layanan: Senin - Jumat (08:00 - 17:00 WIB)\nLayanan: Simpan Pinjam, Pengambilan Elektronik, Tarik Tunai & Pendaftaran Anggota.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#1d72db' }]}>
                <AppIcon name="building" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Loket On-Site Gedung A Lt. 1</Text>
                <Text style={styles.itemSubtitle}>Buka Senin - Jumat (08:00 - 17:00 WIB)</Text>
              </View>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </TouchableOpacity>
            <View style={styles.divider} />

            {/* WhatsApp Pengurus */}
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() =>
                handleAction(
                  'WhatsApp Layanan Koperasi',
                  'Menghubungkan ke Admin Layanan Koperasi PT Bakti Idola Tama (No: 0811-9876-5432).'
                )
              }
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#16a34a' }]}>
                <AppIcon name="phone" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>WhatsApp Pengurus Koperasi</Text>
                <Text style={styles.itemSubtitle}>Chat langsung bantuan transaksi & pinjaman</Text>
              </View>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </TouchableOpacity>
            <View style={styles.divider} />

            {/* Panduan & Syarat Ketentuan */}
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() =>
                handleAction(
                  'Syarat & Ketentuan Koperasi',
                  'Anggaran Dasar / Anggaran Rumah Tangga (AD/ART) Paguyuban Koperasi PT Bakti Idola Tama 2026.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={[styles.itemIconBox, { backgroundColor: '#0284c7' }]}>
                <AppIcon name="receipt" size={17} color="#ffffff" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>AD/ART & Regulasi SHU Koperasi</Text>
                <Text style={styles.itemSubtitle}>Ketentuan bagi hasil & hak anggota</Text>
              </View>
              <AppIcon name="chevron-right" size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Footer & Logout */}
        <View style={styles.footerSection}>
          <Text style={styles.versionText}>
            Moobi Koperasi Mobile v2.18.4 • PT Bakti Idola Tama
          </Text>
          <Text style={styles.licenseText}>
            Terenkripsi SHA-256 • Terdaftar di Paguyuban Koperasi Karyawan
          </Text>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <AppIcon name="lock" size={14} color="#dc2626" />
            <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: QR & Barcode Kartu Anggota Digital */}
      <Modal
        visible={qrModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <View>
                <Text style={styles.qrModalTitle}>ID Anggota Koperasi Digital</Text>
                <Text style={styles.qrModalSub}>PT Bakti Idola Tama</Text>
              </View>
              <TouchableOpacity
                onPress={() => setQrModalVisible(false)}
                style={styles.qrCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={15} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={styles.qrBody}>
                <View style={styles.qrFrame}>
                  <AppIcon name="qris" size={130} color="#1d72db" />
                </View>

                <Text style={styles.qrUserName}>{mockUser.name}</Text>
                <Text style={styles.qrNikCode}>NIK: {mockUser.nik}</Text>
                <Text style={styles.qrDept}>Divisi: Quality Control (QC Plant A)</Text>

                {/* Simulated Barcode */}
                <View style={styles.barcodeWrapper}>
                  <View style={styles.barcodeBars}>
                    {[4, 2, 5, 2, 7, 3, 6, 2, 4, 3, 6, 2, 5, 3, 7, 2, 4, 6, 3, 5, 2, 6].map(
                      (w, i) => (
                        <View
                          key={i}
                          style={{
                            width: w,
                            height: 38,
                            backgroundColor: '#0f172a',
                            marginHorizontal: 1.2,
                            borderRadius: 1,
                          }}
                        />
                      )
                    )}
                  </View>
                  <Text style={styles.barcodeNumber}>* {mockUser.nik} *</Text>
                </View>

                <Text style={styles.qrDesc}>
                  Tunjukkan QR atau Barcode ini ke petugas Kasir Kantin Pabrik BIT atau loket koperasi untuk verifikasi instan.
                </Text>

                <TouchableOpacity
                  style={styles.qrCopyBtn}
                  onPress={handleCopyNik}
                  activeOpacity={0.7}
                >
                  <AppIcon name="copy" size={13} color="#1d72db" />
                  <Text style={styles.qrCopyBtnText}>Salin Nomor NIK</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.qrDoneBtn}
              onPress={() => setQrModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.qrDoneText}>Tutup Kartu Digital</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Ubah PIN Transaksi */}
      <Modal
        visible={pinModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModalCard}>
            <View style={styles.qrModalHeader}>
              <View>
                <Text style={styles.qrModalTitle}>Ubah PIN 6-Digit</Text>
                <Text style={styles.qrModalSub}>Autentikasi Transaksi Finansial</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPinModalVisible(false)}
                style={styles.qrCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={15} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.pinInstruction}>
              Masukkan 6 digit PIN baru Anda. Jangan gunakan angka berurutan atau tanggal lahir.
            </Text>

            {/* Simulated PIN Boxes */}
            <View style={styles.pinCirclesRow}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.pinCircleBox,
                    newPin.length > i && styles.pinCircleBoxFilled,
                  ]}
                >
                  {newPin.length > i && <View style={styles.pinCircleDot} />}
                </View>
              ))}
            </View>

            {/* Keypad */}
            <View style={styles.keypadGrid}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <TouchableOpacity
                  key={k}
                  style={styles.keypadBtn}
                  onPress={() => {
                    if (k === 'C') {
                      setNewPin('');
                    } else if (k === '⌫') {
                      setNewPin((prev) => prev.slice(0, -1));
                    } else {
                      if (newPin.length < 6) {
                        setNewPin((prev) => prev + k);
                      }
                    }
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keypadBtnText}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.savePinBtn, newPin.length < 6 && styles.savePinBtnDisabled]}
              onPress={handleSaveNewPin}
              disabled={newPin.length < 6}
              activeOpacity={0.85}
            >
              <Text style={styles.savePinBtnText}>Simpan PIN Baru</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Konfirmasi Logout Akun */}
      <Modal
        visible={logoutModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutIconWrapper}>
              <AppIcon name="lock" size={24} color="#dc2626" />
            </View>

            <Text style={styles.logoutModalTitle}>Konfirmasi Keluar</Text>
            <Text style={styles.logoutModalDesc}>
              Apakah Anda yakin ingin keluar dari akun Moobi Koperasi PT Bakti Idola Tama? Anda perlu memasukkan NIK dan PIN untuk masuk kembali.
            </Text>

            <View style={styles.logoutModalBtnRow}>
              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelLogoutBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={() => {
                  setLogoutModalVisible(false);
                  if (onLogout) {
                    onLogout();
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmLogoutBtnText}>Ya, Keluar</Text>
              </TouchableOpacity>
            </View>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    marginBottom: 14,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  watermarkCircle2: {
    position: 'absolute',
    bottom: -40,
    left: 80,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  liveSyncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#dbeafe',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* VIP Holographic Digital Pass */
  digitalCard: {
    backgroundColor: '#1462c4',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#0c4896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  digitalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLogoPaguyuban: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  cardBrandText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  cardBrandSub: {
    fontSize: 9,
    color: '#bae6fd',
    fontWeight: '500',
  },
  chipGraphic: {
    width: 28,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#fde047',
    borderWidth: 1,
    borderColor: '#ca8a04',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  chipInner1: {
    width: '100%',
    height: 1,
    backgroundColor: '#ca8a04',
    marginBottom: 3,
  },
  chipInner2: {
    width: '100%',
    height: 1,
    backgroundColor: '#ca8a04',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImgBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d72db',
  },
  verifiedCheckPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  userMetaCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  userDeptText: {
    fontSize: 11,
    color: '#dbeafe',
    marginTop: 1,
    fontWeight: '500',
  },
  nikPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nikPillText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  nikCopyIconBtn: {
    padding: 1,
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 10,
  },
  digitalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  cardFooterText: {
    fontSize: 11,
    color: '#bae6fd',
    fontWeight: '600',
  },
  qrCodePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrCodePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d72db',
  },

  /* Mini Stats Highlights */
  miniStatsSection: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  miniStatIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  miniStatVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  miniStatLabel: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },

  /* Sections & Groups */
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  shieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#bbf7d0',
  },
  shieldPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a34a',
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  infoLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoValueBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1d72db',
    fontFamily: 'monospace',
  },
  copyableValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCopyBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
  },
  miniCopyBtnText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    marginRight: 6,
  },
  itemTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
  actionChevronWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },

  /* Footer Section */
  footerSection: {
    marginHorizontal: 16,
    marginTop: 4,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '700',
  },
  licenseText: {
    fontSize: 9.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    paddingVertical: 12,
    borderRadius: 14,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
  },

  /* QR Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  qrModalTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  qrModalSub: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  qrCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBody: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  qrFrame: {
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    marginBottom: 10,
  },
  qrUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  qrNikCode: {
    fontSize: 12,
    color: '#1d72db',
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  qrDept: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  barcodeWrapper: {
    marginVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  barcodeBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeNumber: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 4,
    letterSpacing: 2,
  },
  qrDesc: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 6,
  },
  qrCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 10,
  },
  qrCopyBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d72db',
  },
  qrDoneBtn: {
    backgroundColor: '#1d72db',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  qrDoneText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  /* PIN Modal */
  pinModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
  },
  pinInstruction: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 15,
  },
  pinCirclesRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  pinCircleBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  pinCircleBoxFilled: {
    borderColor: '#1d72db',
    backgroundColor: '#eff6ff',
  },
  pinCircleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1d72db',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 8,
  },
  keypadBtn: {
    width: 68,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  savePinBtn: {
    backgroundColor: '#1d72db',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  savePinBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  savePinBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Logout Confirmation Modal */
  logoutModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  logoutIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
  },
  logoutModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  logoutModalDesc: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  logoutModalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelLogoutBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLogoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmLogoutBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmLogoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
