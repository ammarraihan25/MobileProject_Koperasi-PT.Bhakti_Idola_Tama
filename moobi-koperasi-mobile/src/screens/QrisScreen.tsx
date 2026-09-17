import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { AppIcon } from '../components/common/AppIcon';
import { mockUser, mockWallet } from '../data/mockData';

export interface QrisScreenProps {
  userBalance?: number;
  onPaymentSuccess?: (
    amount: number,
    merchantName: string,
    category: 'kantin' | 'elektronik' | 'ppob',
    description: string
  ) => void;
  onNavigateHistory?: () => void;
}

export const QrisScreen: React.FC<QrisScreenProps> = ({
  userBalance = mockWallet.saldoUtama,
  onPaymentSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'scan' | 'myqr'>('scan');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Animated laser scan line
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startLaser = () => {
      laserAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    };

    if (activeMode === 'scan') {
      startLaser();
    }
  }, [activeMode, laserAnim]);

  // Robust Camera Starter
  const startCamera = async () => {
    if (
      Platform.OS !== 'web' ||
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraError('Fitur kamera tidak didukung di browser ini.');
      return;
    }

    setIsLoadingCamera(true);
    setCameraError('');

    try {
      let stream: MediaStream;
      try {
        // Try environment camera (back camera) with ideal constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to default camera (front webcam or basic video)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      // Stop previous stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = stream;
      setMediaStream(stream);
      setCameraActive(true);
      setIsLoadingCamera(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera request error:', err);
      setIsLoadingCamera(false);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Izin kamera diblokir browser. Klik ikon 🔒 / 📹 di samping URL address bar (localhost), ubah izin Kamera menjadi "Izinkan", lalu klik Aktifkan Kamera.'
        );
      } else {
        setCameraError('Kamera tidak terdeteksi atau sedang dipakai aplikasi lain.');
      }
    }
  };

  // Auto-start camera when activeMode is 'scan'
  useEffect(() => {
    if (activeMode === 'scan') {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setMediaStream(null);
      setCameraActive(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [activeMode]);

  // Attach stream to video tag whenever mediaStream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream]);

  const handleSimulateScan = () => {
    const amount = 22000;
    const merchantName = 'Kasir Kantin Pabrik (Stand 02)';

    Alert.alert(
      'Scan Berhasil! 🎉',
      `Merchant: ${merchantName}\nTotal Pembayaran: Rp ${new Intl.NumberFormat('id-ID').format(
        amount
      )}\nMetode Bayar: Saldo Koperasi (Cashless)`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bayar Sekarang',
          onPress: () => {
            if (onPaymentSuccess) {
              onPaymentSuccess(
                amount,
                merchantName,
                'kantin',
                'Pembayaran QRIS Kasir Kantin Pabrik Stand 02'
              );
            }
            Alert.alert(
              'Pembayaran Sukses! ✅',
              `Transaksi sebesar Rp ${new Intl.NumberFormat('id-ID').format(
                amount
              )} telah berhasil dipotong dari Saldo Koperasi.\n\nStruk digital telah dikirimkan secara otomatis ke WhatsApp Anda (${mockUser.phone}) dan tercatat di mutasi riwayat.`
            );
          },
        },
      ]
    );
  };

  const handleTriggerFileCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target?.files && e.target.files.length > 0) {
      handleSimulateScan();
    }
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <View style={styles.container}>
      {/* Hidden File Input for Native Camera Capture fallback */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef as any}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {/* Header Mode Toggle */}
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'scan' && styles.toggleBtnActive]}
            onPress={() => setActiveMode('scan')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                activeMode === 'scan' && styles.toggleTextActive,
              ]}
            >
              Scan QR Kasir Kantin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeMode === 'myqr' && styles.toggleBtnActive]}
            onPress={() => setActiveMode('myqr')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                activeMode === 'myqr' && styles.toggleTextActive,
              ]}
            >
              ID QR Karyawan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeMode === 'scan' ? (
        /* Mode 1: Camera Scanner Frame */
        <View style={styles.scannerWrapper}>
          <Text style={styles.scanInstruction}>
            Arahkan kamera ke QRIS Tablet Kasir Kantin atau Stand Toko Koperasi Pabrik
          </Text>

          <View style={styles.viewfinderFrame}>
            {/* Live Camera Video Feed */}
            {Platform.OS === 'web' && (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && mediaStream && el.srcObject !== mediaStream) {
                    el.srcObject = mediaStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 16,
                  backgroundColor: '#0f172a',
                  display: cameraActive ? 'block' : 'none',
                  zIndex: 1,
                }}
              />
            )}

            {/* Fallback / Tap to Start Container */}
            {!cameraActive && (
              <View style={styles.cameraPlaceholder}>
                <AppIcon name="qris" size={46} color="#1d72db" />
                
                {cameraError ? (
                  <View style={styles.cameraErrorBox}>
                    <Text style={styles.cameraErrorTitle}>Izin Kamera Belum Aktif</Text>
                    <Text style={styles.cameraErrorDesc}>{cameraError}</Text>
                  </View>
                ) : (
                  <Text style={styles.cameraStatusText}>
                    {isLoadingCamera ? 'Sedang menghubungkan kamera...' : 'Kamera siap dihubungkan'}
                  </Text>
                )}

                <View style={styles.actionButtonsCol}>
                  <TouchableOpacity
                    style={styles.enableCamBtn}
                    onPress={startCamera}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.enableCamBtnText}>
                      {isLoadingCamera ? 'Menghubungkan...' : 'Aktifkan Kamera'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cameraCaptureBtn}
                    onPress={handleTriggerFileCamera}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cameraCaptureBtnText}>Buka Kamera Foto / Galeri</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Corner Brackets in Royal Blue */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated Laser Scanning Line */}
            {cameraActive && (
              <Animated.View
                style={[
                  styles.scannerLine,
                  {
                    transform: [{ translateY: laserTranslateY }],
                  },
                ]}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={handleSimulateScan}
            activeOpacity={0.8}
          >
            <Text style={styles.simulateBtnText}>Simulasikan Scan Kasir Kantin</Text>
          </TouchableOpacity>

          <View style={styles.walletQuickBadge}>
            <Text style={styles.walletText}>
              Sumber Dana: <Text style={styles.walletBold}>Saldo Koperasi</Text> (Rp{' '}
              {new Intl.NumberFormat('id-ID').format(userBalance)})
            </Text>
          </View>
        </View>
      ) : (
        /* Mode 2: My QR Code */
        <View style={styles.myQrWrapper}>
          <View style={styles.qrCard}>
            <Text style={styles.qrCompanyTag}>PT Bakti Idola Tama</Text>
            <Text style={styles.qrUserName}>{mockUser.name}</Text>
            <Text style={styles.qrUserNik}>
              1 ID: {mockUser.nik} • {mockUser.department}
            </Text>

            <View style={styles.qrBoxMock}>
              <AppIcon name="qris" size={64} color="#1d72db" />
              <Text style={styles.qrSubCaption}>1 ID Koperasi & Kantin</Text>
            </View>

            <Text style={styles.qrDesc}>
              Tunjukkan QR ID ini ke kasir kantin untuk bayar cepat tanpa perlu mengetik nomor HP. Struk
              dikirim via WhatsApp.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: '#1d72db',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scannerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scanInstruction: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  viewfinderFrame: {
    width: 250,
    height: 250,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    zIndex: 4,
    width: '100%',
  },
  cameraStatusText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  cameraErrorBox: {
    marginTop: 6,
    marginBottom: 4,
    alignItems: 'center',
  },
  cameraErrorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 2,
  },
  cameraErrorDesc: {
    fontSize: 9.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 13,
  },
  actionButtonsCol: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  enableCamBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  enableCamBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  cameraCaptureBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  cameraCaptureBtnText: {
    fontSize: 10,
    color: '#1d72db',
    fontWeight: '700',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#1d72db',
    zIndex: 10,
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderColor: '#1d72db',
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderColor: '#1d72db',
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderColor: '#1d72db',
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderColor: '#1d72db',
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 14,
  },
  scannerLine: {
    position: 'absolute',
    top: 25,
    width: '88%',
    height: 2.5,
    backgroundColor: '#1d72db',
    zIndex: 8,
  },
  simulateBtn: {
    backgroundColor: '#1d72db',
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginTop: 24,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  simulateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  walletQuickBadge: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  walletText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  walletBold: {
    color: '#0f172a',
    fontWeight: '600',
  },
  myQrWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qrCompanyTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d72db',
    marginBottom: 2,
  },
  qrUserName: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  qrUserNik: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    marginBottom: 14,
  },
  qrBoxMock: {
    width: 180,
    height: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  qrSubCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  qrDesc: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 15,
  },
});
