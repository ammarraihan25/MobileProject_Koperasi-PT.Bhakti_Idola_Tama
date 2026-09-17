import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ImageBackground,
} from 'react-native';
import { AppIcon } from '../components/common/AppIcon';
import { mockUser } from '../data/mockData';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [nik, setNik] = useState('2024-089');
  const [pin, setPin] = useState('123456');
  const [hidePin, setHidePin] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);

  const handleLogin = () => {
    if (!nik.trim()) {
      Alert.alert('NIK / Email Kosong', 'Silakan masukkan NIK Karyawan atau Email Anda.');
      return;
    }
    if (pin.length < 6) {
      Alert.alert('PIN Tidak Lengkap', 'PIN / Password harus terdiri dari 6 angka.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 450);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        `${provider} Terhubung! ✅`,
        `Selamat datang kembali, ${mockUser.name} (${mockUser.nik})!`,
        [
          {
            text: 'Buka Beranda',
            onPress: onLoginSuccess,
          },
        ]
      );
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* TOP HERO SECTION: CINEMATIC RINNAI FACTORY HEADER */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={require('../../assets/rinnai_pabrik.jpg')}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
          >
            {/* Subtle Gradient & Vignette Overlay */}
            <View style={styles.heroGradientOverlay} />
          </ImageBackground>
        </View>

        {/* MAIN CURVED WHITE FORM SHEET (Holds Brand Identity, Articles & Form) */}
        <View style={styles.mainSheetCard}>
          {/* Sheet Handle Bar */}
          <View style={styles.sheetHandleBar} />

          {/* 1. BRAND IDENTITY HEADER */}
          <View style={styles.formBrandHeader}>
            <View style={styles.brandLogoRow}>
              <View style={styles.logoBadgeWrap}>
                <Image
                  source={require('../../assets/transfer/paguyuban.png')}
                  style={styles.paguyubanLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.mainCompanyTitle}>PT BAKTI IDOLA TAMA</Text>
            </View>
          </View>

          {/* 2. WELCOMING HEADLINE & ARTICLE DESCRIPTIONS */}
          <View style={styles.articleIntroSection}>
            <Text style={styles.sheetTitle}>Sign in Your Account</Text>
            <Text style={styles.articleBodyText}>
              Akses layanan simpan pinjam, kantin, tagihan PPoB, dan transaksi anggota koperasi karyawan PT Bakti Idola Tama.
            </Text>
          </View>

          {/* 3. INPUT NIK / EMAIL */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconLeft}>
              <AppIcon name="user" size={18} color="#1d72db" />
            </View>
            <View style={styles.inputDividerBar} />
            <TextInput
              style={styles.inputField}
              placeholder="Masukkan NIK Karyawan / Email"
              placeholderTextColor="#94a3b8"
              value={nik}
              onChangeText={setNik}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {nik.length > 0 && (
              <TouchableOpacity
                onPress={() => setNik('')}
                style={styles.inputClearBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={13} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* 4. INPUT PASSWORD / PIN */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconLeft}>
              <AppIcon name="lock" size={18} color="#1d72db" />
            </View>
            <View style={styles.inputDividerBar} />
            <TextInput
              style={styles.inputField}
              placeholder="Masukkan 6-Digit PIN Transaksi"
              placeholderTextColor="#94a3b8"
              value={pin}
              onChangeText={(val) => setPin(val.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="numeric"
              secureTextEntry={hidePin}
            />
            <TouchableOpacity
              onPress={() => setHidePin(!hidePin)}
              style={styles.inputEyeBtn}
              activeOpacity={0.7}
            >
              <AppIcon
                name={hidePin ? 'eye-off' : 'eye'}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* 5. REMEMBER ME & FORGOT PASSWORD */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeBtn}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.customCheckCircle,
                  rememberMe && styles.customCheckCircleActive,
                ]}
              >
                {rememberMe && (
                  <AppIcon name="check" size={11} color="#ffffff" />
                )}
              </View>
              <Text style={styles.rememberMeLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setHelpModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* 6. PRIMARY SIGN IN BUTTON */}
          <TouchableOpacity
            style={[styles.signInPrimaryBtn, isLoading && styles.signInPrimaryBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.signInPrimaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* 7. DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.orDividerText}>Or sign in with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 8. SINGLE GOOGLE QUICK ACCESS BUTTON */}
          <View style={styles.singleSocialContainer}>
            <TouchableOpacity
              style={styles.googleFullBtn}
              onPress={() => handleSocialLogin('Google Workspace')}
              activeOpacity={0.8}
            >
              <AppIcon name="google" size={20} />
              <Text style={styles.googleFullBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          {/* 9. BOTTOM SIGN UP PROMPT */}
          <View style={styles.bottomSignUpRow}>
            <Text style={styles.noAccountText}>Don’t have an account? </Text>
            <TouchableOpacity
              onPress={() => setSignUpModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLinkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL LUPA PIN / PASSWORD */}
      <Modal
        visible={helpModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardBox}>
            <View style={styles.modalTopHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <AppIcon name="lock" size={18} color="#1d72db" />
                <Text style={styles.modalHeaderTitle}>Lupa PIN / Password</Text>
              </View>
              <TouchableOpacity
                onPress={() => setHelpModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescText}>
              Untuk mereset PIN transaksi 6-digit atau akun Moobi Koperasi PT Bakti Idola Tama:
            </Text>

            <View style={styles.modalHelpStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={styles.stepDescText}>
                Kunjungi Loket Koperasi di <Text style={{ fontWeight: '600' }}>Gedung A Lt. 1</Text> (sebelah Kantin Pusat) dengan membawa ID Badge Karyawan.
              </Text>
            </View>

            <View style={styles.modalHelpStep}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={styles.stepDescText}>
                Hubungi WhatsApp Admin Koperasi di <Text style={{ fontWeight: '600', color: '#1d72db' }}>0811-9876-5432</Text> (Senin - Jumat 08:00 - 17:00 WIB).
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setHelpModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryBtnText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL PENDAFTARAN ANGGOTA (SIGN UP) */}
      <Modal
        visible={signUpModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSignUpModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardBox}>
            <View style={styles.modalTopHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <AppIcon name="user" size={18} color="#1d72db" />
                <Text style={styles.modalHeaderTitle}>Pendaftaran Anggota Koperasi</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSignUpModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <AppIcon name="x" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescText}>
              Pendaftaran keanggotaan Koperasi Karyawan PT Bakti Idola Tama terintegrasi otomatis dengan HRD:
            </Text>

            <View style={styles.modalHelpStep}>
              <View style={[styles.stepNumCircle, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <AppIcon name="check-circle" size={14} color="#1d72db" />
              </View>
              <Text style={styles.stepDescText}>
                Karyawan tetap atau kontrak aktif PT BIT otomatis terdaftar dengan NIK resmi.
              </Text>
            </View>

            <View style={styles.modalHelpStep}>
              <View style={[styles.stepNumCircle, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <AppIcon name="lock" size={14} color="#1d72db" />
              </View>
              <Text style={styles.stepDescText}>
                Gunakan NIK Karyawan Anda dan PIN default yang telah dikirimkan ke email kantor / WhatsApp HRD.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setSignUpModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryBtnText}>Tutup Informasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },

  /* TOP CINEMATIC HERO SECTION */
  heroContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },

  /* MAIN CURVED WHITE BOTTOM SHEET */
  mainSheetCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 20,
  },
  sheetHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 16,
  },

  /* BRAND IDENTITY HEADER (Inside the Form Sheet) */
  formBrandHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadgeWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  paguyubanLogo: {
    width: 28,
    height: 28,
  },
  mainCompanyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },

  /* WELCOMING ARTICLE / COPYWRITING INTRO */
  articleIntroSection: {
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  articleBodyText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  /* INPUT FIELDS */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  inputIconLeft: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputDividerBar: {
    width: 1,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a',
    paddingVertical: 0,
  },
  inputClearBtn: {
    padding: 6,
  },
  inputEyeBtn: {
    padding: 6,
  },

  /* OPTIONS ROW */
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  rememberMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  customCheckCircleActive: {
    backgroundColor: '#1d72db',
    borderColor: '#1d72db',
    borderWidth: 0,
  },
  rememberMeLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#475569',
  },
  forgotPasswordLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1d72db',
  },

  /* PRIMARY BUTTON */
  signInPrimaryBtn: {
    backgroundColor: '#1d72db',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  signInPrimaryBtnDisabled: {
    opacity: 0.7,
  },
  signInPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  /* DIVIDER */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  orDividerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginHorizontal: 12,
  },

  /* SINGLE GOOGLE BUTTON */
  singleSocialContainer: {
    marginBottom: 22,
  },
  googleFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 48,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleFullBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },

  /* BOTTOM SIGN UP LINK */
  bottomSignUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '500',
  },
  signUpLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1d72db',
  },

  /* MODALS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCardBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescText: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 12,
  },
  modalHelpStep: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1d72db',
  },
  stepDescText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
  },
  modalPrimaryBtn: {
    backgroundColor: '#1d72db',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 8,
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
