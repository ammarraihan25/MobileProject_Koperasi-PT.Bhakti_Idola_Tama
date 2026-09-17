import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { TabType } from '../types';
import { AppIcon } from './common/AppIcon';

interface BottomTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      {/* Tab 1: Beranda */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('beranda')}
        activeOpacity={0.7}
      >
        <AppIcon
          name={currentTab === 'beranda' ? 'home-active' : 'home'}
          size={23}
          color={currentTab === 'beranda' ? '#1d72db' : '#64748b'}
        />
        <Text style={[styles.tabLabel, currentTab === 'beranda' && styles.activeTabLabel]}>
          Beranda
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Keuangan */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('keuangan')}
        activeOpacity={0.7}
      >
        <AppIcon
          name={currentTab === 'keuangan' ? 'wallet-active' : 'wallet'}
          size={23}
          color={currentTab === 'keuangan' ? '#1d72db' : '#64748b'}
        />
        <Text style={[styles.tabLabel, currentTab === 'keuangan' && styles.activeTabLabel]}>
          Keuangan
        </Text>
      </TouchableOpacity>

      {/* Tab 3: QRIS Center Floating Button */}
      <View style={styles.qrisButtonWrapper}>
        <TouchableOpacity
          style={[styles.qrisButton, currentTab === 'qris' && styles.qrisButtonActive]}
          onPress={() => onSelectTab('qris')}
          activeOpacity={0.85}
        >
          <AppIcon name="qris" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={[styles.tabLabel, currentTab === 'qris' && styles.activeTabLabel]}>
          QRIS
        </Text>
      </View>

      {/* Tab 4: Riwayat */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('riwayat')}
        activeOpacity={0.7}
      >
        <AppIcon
          name={currentTab === 'riwayat' ? 'history-active' : 'history'}
          size={23}
          color={currentTab === 'riwayat' ? '#1d72db' : '#64748b'}
        />
        <Text style={[styles.tabLabel, currentTab === 'riwayat' && styles.activeTabLabel]}>
          Riwayat
        </Text>
      </TouchableOpacity>

      {/* Tab 5: Profil */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('profil')}
        activeOpacity={0.7}
      >
        <AppIcon
          name={currentTab === 'profil' ? 'profile-active' : 'profile'}
          size={23}
          color={currentTab === 'profil' ? '#1d72db' : '#64748b'}
        />
        <Text style={[styles.tabLabel, currentTab === 'profil' && styles.activeTabLabel]}>
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 80 : 62,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.45,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: -0.1,
  },
  activeTabLabel: {
    color: '#1d72db',
    fontWeight: '700',
  },
  qrisButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  qrisButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  qrisButtonActive: {
    backgroundColor: '#00aa13',
    shadowColor: '#00aa13',
  },
  qrisIcon: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
