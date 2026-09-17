import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

      {/* Tab 3: Riwayat */}
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

      {/* Tab 4: Profil */}
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
    paddingHorizontal: 16,
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
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: -0.1,
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#1d72db',
    fontWeight: '700',
  },
});
