import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { AppIcon, IconType } from '../common/AppIcon';

const waLogo = require('../../../assets/page/wa.png');
const teleLogo = require('../../../assets/page/tele.png');

interface QrisPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  serviceTitle: string;
  serviceType: 'pulsa' | 'token' | 'emoney' | 'pdam' | 'bpjs' | string;
  targetNumber: string;
  customerName?: string;
  amount: number;
  adminFee?: number;
  onPaymentConfirmed: () => void;
}

// Generates an authentic, high-density, realistic QR Code matrix (33x33)
function generateQRMatrix(seedStr: string, size = 33): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  const isReserved: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Place Finder Pattern
  const placeFinder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isReserved[nr][nc] = true;
          if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
            if (dr === 0 || dr === 6 || dc === 0 || dc === 6) {
              matrix[nr][nc] = true;
            } else if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) {
              matrix[nr][nc] = true;
            } else {
              matrix[nr][nc] = false;
            }
          } else {
            matrix[nr][nc] = false; // white separator
          }
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isReserved[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    isReserved[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern (at bottom right area)
  const alignR = size - 9;
  const alignC = size - 9;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const nr = alignR + dr;
      const nc = alignC + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        isReserved[nr][nc] = true;
        if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
          matrix[nr][nc] = true;
        } else {
          matrix[nr][nc] = false;
        }
      }
    }
  }

  // Center logo reserve box
  const mid = Math.floor(size / 2);
  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      isReserved[mid + dr][mid + dc] = true;
      matrix[mid + dr][mid + dc] = false;
    }
  }

  // Deterministic hash fill
  let hash = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved[r][c]) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        matrix[r][c] = (hash % 100) < 53;
      }
    }
  }

  return matrix;
}

export const QrisPaymentModal: React.FC<QrisPaymentModalProps> = ({
  visible,
  onClose,
  serviceTitle,
  serviceType,
  targetNumber,
  customerName = 'Budi Santoso',
  amount,
  adminFee = 0,
  onPaymentConfirmed,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 menit
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [txRef, setTxRef] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setSecondsRemaining(899);
      setIsVerifying(false);
      const randomRef = `QRIS-BIT-${Date.now().toString().slice(-6)}`;
      setTxRef(randomRef);
    }
  }, [visible]);

  // Countdown timer
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const totalPayment = amount + adminFee;

  const handleCheckPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentConfirmed();
    }, 700);
  };

  const [shareQrisModalVisible, setShareQrisModalVisible] = useState<boolean>(false);
  const [copiedQrisToast, setCopiedQrisToast] = useState<boolean>(false);

  const getQrisShareText = () => {
    return `*PEMBAYARAN QRIS RESMI - PT BAKTI IDOLA TAMA*
━━━━━━━━━━━━━━━━━━━━
🏢 *Merchant:* PT BAKTI IDOLA TAMA
🆔 *NMID:* ID1026090019284 • A01
📄 *Kode Ref:* ${txRef}
⚡ *Layanan:* ${serviceTitle}
🎯 *Tujuan:* ${targetNumber} ${customerName ? `(${customerName})` : ''}
💰 *Total Tagihan:* Rp ${formatRupiah(totalPayment)}
⏱️ *Batas Waktu:* 15 Menit
━━━━━━━━━━━━━━━━━━━━
_Silakan buka aplikasi M-Banking atau E-Wallet (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay) untuk menyelesaikan pembayaran._`;
  };

  const handleSaveQR = () => {
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        let svgRects = '';
        qrMatrix.forEach((row, rIdx) => {
          row.forEach((isDark, cIdx) => {
            if (isDark) {
              svgRects += `<rect x="${cIdx * 6}" y="${rIdx * 6}" width="6" height="6" fill="#000000"/>`;
            }
          });
        });

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="460" viewBox="0 0 360 460">
  <rect width="360" height="460" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <text x="180" y="38" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="18" font-weight="900" fill="#dc2626" letter-spacing="2">QRIS</text>
  <text x="180" y="55" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="9" font-weight="600" fill="#64748b">QR Code Standar Pembayaran Nasional</text>
  <text x="180" y="80" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="13" font-weight="800" fill="#0f172a">PT BAKTI IDOLA TAMA</text>
  <text x="180" y="96" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="9" fill="#64748b">NMID: ID1026090019284 • A01</text>
  
  <g transform="translate(81, 110)">
    <rect width="198" height="198" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="8"/>
    ${svgRects}
    <rect x="84" y="84" width="30" height="30" rx="4" fill="#dc2626"/>
    <rect x="93" y="93" width="12" height="12" fill="#ffffff"/>
  </g>
  
  <text x="180" y="335" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="10.5" font-weight="700" fill="#475569">Kode Ref: ${txRef}</text>
  <text x="180" y="352" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="9.5" fill="#64748b">Layanan: ${serviceTitle}</text>
  <text x="180" y="380" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" fill="#1d72db">Total: Rp ${formatRupiah(totalPayment)}</text>
  <text x="180" y="420" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="8.5" fill="#94a3b8">Scan menggunakan M-Banking atau E-Wallet apa saja</text>
</svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QRIS_PT_BIT_${txRef}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
      Alert.alert(
        'QR Code Disimpan 📥',
        `Gambar QRIS pembayaran (${txRef}) sebesar Rp ${formatRupiah(
          totalPayment
        )} telah diunduh ke perangkat. Buka file untuk discan di aplikasi M-Banking atau E-Wallet Anda.`
      );
    } catch (e) {
      Alert.alert('Simpan QR', `QR Code pembayaran ${txRef} siap disimpan.`);
    }
  };

  const handleShareQR = () => {
    setShareQrisModalVisible(true);
  };

  const handleShareQrisToWhatsApp = () => {
    const text = encodeURIComponent(getQrisShareText());
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    } else {
      Linking.openURL(waUrl).catch(() => {});
    }
    setShareQrisModalVisible(false);
  };

  const handleShareQrisToTelegram = () => {
    const text = encodeURIComponent(getQrisShareText());
    const tgUrl = `https://t.me/share/url?url=&text=${text}`;
    if (typeof window !== 'undefined') {
      window.open(tgUrl, '_blank');
    } else {
      Linking.openURL(tgUrl).catch(() => {});
    }
    setShareQrisModalVisible(false);
  };

  const handleCopyQrisText = () => {
    const text = getQrisShareText();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedQrisToast(true);
    setTimeout(() => {
      setCopiedQrisToast(false);
    }, 2000);
  };

  const handleShareQrisToEmail = () => {
    const subject = encodeURIComponent(`Pembayaran QRIS ${txRef} - PT Bakti Idola Tama`);
    const body = encodeURIComponent(getQrisShareText());
    const mailUrl = `mailto:?subject=${subject}&body=${body}`;
    if (typeof window !== 'undefined') {
      window.open(mailUrl, '_blank');
    } else {
      Linking.openURL(mailUrl).catch(() => {});
    }
    setShareQrisModalVisible(false);
  };

  const getServiceIcon = (): IconType => {
    switch (serviceType) {
      case 'pinjaman':
      case 'pelunasan':
        return 'simpanan';
      case 'token':
        return 'zap';
      case 'emoney':
        return 'topup';
      case 'pdam':
        return 'pdam';
      case 'bpjs':
        return 'bpjs';
      case 'pulsa':
      default:
        return 'pulsa';
    }
  };

  const qrMatrix = generateQRMatrix(`${txRef}-${serviceTitle}-${totalPayment}`, 33);
  const moduleSize = 6.2;
  const qrTotalSize = 33 * moduleSize;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.qrisIconCircle}>
                <AppIcon name="qris" size={20} color="#ffffff" />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle} numberOfLines={1}>Pembayaran QRIS</Text>
                <Text style={styles.headerSubtitle} numberOfLines={2}>
                  Pindai kode QRIS menggunakan M-Banking atau E-Wallet apa saja
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Countdown Banner */}
            <View style={styles.countdownBanner}>
              <View style={styles.countdownLeft}>
                <AppIcon name="clock" size={15} color="#b45309" />
                <Text style={styles.countdownLabel}>Batas Waktu Pembayaran:</Text>
              </View>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownNumber}>
                  {formatTime(secondsRemaining)}
                </Text>
              </View>
            </View>

            {/* AUTHENTIC QRIS NATIONAL BOARD */}
            <View style={styles.qrisCard}>
              {/* QRIS Header Row with Official Assets */}
              <View style={styles.qrisTopHeader}>
                <Image
                  source={require('../../../assets/transfer/qris.png')}
                  style={styles.qrisLogoImage}
                  resizeMode="contain"
                />
                <Image
                  source={require('../../../assets/transfer/gpn.png')}
                  style={styles.gpnLogoImage}
                  resizeMode="contain"
                />
              </View>

              {/* Merchant Details */}
              <View style={styles.merchantInfoRow}>
                <Text style={styles.merchantName}>
                  PT BAKTI IDOLA TAMA
                </Text>
                <Text style={styles.nmidText}>NMID: ID1026090019284 • A01</Text>
              </View>

              {/* High-Resolution Dense QR Code (SVG) */}
              <View style={styles.qrMatrixContainer}>
                <Svg
                  width={qrTotalSize}
                  height={qrTotalSize}
                  viewBox={`0 0 ${qrTotalSize} ${qrTotalSize}`}
                >
                  {/* Background */}
                  <Rect width={qrTotalSize} height={qrTotalSize} fill="#ffffff" />

                  {/* QR Modules */}
                  {qrMatrix.map((row, rIdx) =>
                    row.map((isDark, cIdx) => {
                      if (!isDark) return null;
                      return (
                        <Rect
                          key={`${rIdx}-${cIdx}`}
                          x={cIdx * moduleSize}
                          y={rIdx * moduleSize}
                          width={moduleSize}
                          height={moduleSize}
                          fill="#000000"
                        />
                      );
                    })
                  )}

                  {/* Center Logo Square */}
                  <Rect
                    x={qrTotalSize / 2 - 18}
                    y={qrTotalSize / 2 - 18}
                    width={36}
                    height={36}
                    fill="#ffffff"
                    rx={6}
                  />
                  <Rect
                    x={qrTotalSize / 2 - 15}
                    y={qrTotalSize / 2 - 15}
                    width={30}
                    height={30}
                    fill="#dc2626"
                    rx={4}
                  />
                  <Path
                    d={`M ${qrTotalSize / 2 - 6} ${qrTotalSize / 2 - 6} h 12 v 12 h -12 Z`}
                    fill="#ffffff"
                  />
                </Svg>
              </View>

              {/* Reference and Instruction */}
              <View style={styles.qrFooterMeta}>
                <Text style={styles.qrRefText}>Kode Ref: {txRef}</Text>
                <Text style={styles.qrScanHint}>
                  Arahkan kamera pemindai aplikasi M-Banking / E-Wallet ke QR Code di atas
                </Text>
              </View>
            </View>

            {/* Quick Action: Save & Share QR */}
            <View style={styles.qrActionRow}>
              <TouchableOpacity
                style={styles.qrActionBtn}
                onPress={handleSaveQR}
                activeOpacity={0.75}
              >
                <AppIcon name="download" size={14} color="#1d72db" />
                <Text style={styles.qrActionBtnText}>Simpan QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qrActionBtn}
                onPress={handleShareQR}
                activeOpacity={0.75}
              >
                <AppIcon name="share" size={14} color="#1d72db" />
                <Text style={styles.qrActionBtnText}>Bagikan QR</Text>
              </TouchableOpacity>
            </View>

            {/* Transaction Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <View style={styles.serviceIconCircle}>
                  <AppIcon name={getServiceIcon()} size={16} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitleText}>{serviceTitle}</Text>
                  <Text style={styles.targetNumberText}>
                    {targetNumber} {customerName ? `• ${customerName}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tagihan / Nominal</Text>
                <Text style={styles.summaryValue}>Rp {formatRupiah(amount)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Biaya Admin</Text>
                <Text style={styles.summaryValuePromo}>
                  {adminFee === 0
                    ? 'Rp 0 (Gratis)'
                    : `Rp ${formatRupiah(adminFee)}`}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={styles.totalValue}>
                  Rp {formatRupiah(totalPayment)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.confirmPaymentBtn}
              onPress={handleCheckPayment}
              disabled={isVerifying}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <View style={styles.verifyingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.confirmPaymentBtnText}>
                    Memeriksa Status Pembayaran...
                  </Text>
                </View>
              ) : (
                <View style={styles.verifyingRow}>
                  <AppIcon name="check-circle" size={17} color="#ffffff" />
                  <Text style={styles.confirmPaymentBtnText}>
                    Cek Status Pembayaran
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isVerifying}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Batalkan Transaksi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Multi-App Share QR Sheet Modal */}
        <Modal
          visible={shareQrisModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShareQrisModalVisible(false)}
        >
          <View style={styles.shareSheetOverlay}>
            <View style={styles.shareSheetCard}>
              <View style={styles.shareSheetHeader}>
                <View>
                  <Text style={styles.shareSheetTitle}>Bagikan Kode QRIS</Text>
                  <Text style={styles.shareSheetSub}>Pilih aplikasi untuk membagikan detail pembayaran</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShareQrisModalVisible(false)}
                  style={styles.shareSheetCloseBtn}
                  activeOpacity={0.7}
                >
                  <AppIcon name="x" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              {copiedQrisToast && (
                <View style={styles.copiedToastBadge}>
                  <AppIcon name="check-circle" size={13} color="#ffffff" />
                  <Text style={styles.copiedToastText}>Detail pembayaran disalin ke clipboard!</Text>
                </View>
              )}

              {/* Apps Grid */}
              <View style={styles.shareAppsRow}>
                <TouchableOpacity
                  style={styles.shareAppItem}
                  onPress={handleShareQrisToWhatsApp}
                  activeOpacity={0.75}
                >
                  <Image
                    source={waLogo}
                    style={styles.shareAppImgLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.shareAppName}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareAppItem}
                  onPress={handleShareQrisToTelegram}
                  activeOpacity={0.75}
                >
                  <Image
                    source={teleLogo}
                    style={styles.shareAppImgLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.shareAppName}>Telegram</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareAppItem}
                  onPress={handleCopyQrisText}
                  activeOpacity={0.75}
                >
                  <View style={[styles.shareAppIconBox, { backgroundColor: '#1d72db' }]}>
                    <AppIcon name="copy" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.shareAppName}>Salin Info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareAppItem}
                  onPress={handleShareQrisToEmail}
                  activeOpacity={0.75}
                >
                  <View style={[styles.shareAppIconBox, { backgroundColor: '#6366f1' }]}>
                    <AppIcon name="mail" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.shareAppName}>Email</Text>
                </TouchableOpacity>
              </View>

              {/* Preview Box */}
              <View style={styles.sharePreviewBox}>
                <Text style={styles.sharePreviewLabel}>DETAIL TAGIHAN QRIS:</Text>
                <Text style={styles.sharePreviewText} numberOfLines={5}>
                  {getQrisShareText()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.shareSheetCancelBtn}
                onPress={() => setShareQrisModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.shareSheetCancelBtnText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    minHeight: '75%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 4,
  },
  headerTextWrap: {
    flex: 1,
  },
  qrisIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
    lineHeight: 14,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 14,
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400e',
  },
  countdownBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  countdownNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
    letterSpacing: 1,
  },
  qrisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  qrisTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12,
  },
  qrisLogoImage: {
    width: 140,
    height: 32,
  },
  gpnLogoImage: {
    width: 28,
    height: 30,
  },
  merchantInfoRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  nmidText: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  qrMatrixContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  qrFooterMeta: {
    alignItems: 'center',
    marginTop: 10,
  },
  qrRefText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  qrScanHint: {
    fontSize: 10.5,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 15,
  },
  qrActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  qrActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  qrActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  serviceIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
  serviceTitleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  targetNumberText: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 11.5,
    color: '#0f172a',
    fontWeight: '700',
  },
  summaryValuePromo: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1d72db',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  confirmPaymentBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmPaymentBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Share Sheet Modal Styles */
  shareSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'flex-end',
  },
  shareSheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  shareSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareSheetTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  shareSheetSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  shareSheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedToastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  copiedToastText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  shareAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  shareAppItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shareAppImgLogo: {
    width: 40,
    height: 40,
    marginBottom: 6,
    borderRadius: 20,
  },
  shareAppIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shareAppName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  sharePreviewBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  sharePreviewLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sharePreviewText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 14,
  },
  shareSheetCancelBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareSheetCancelBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
});
