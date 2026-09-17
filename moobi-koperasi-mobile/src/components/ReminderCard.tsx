import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { AppIcon } from './common/AppIcon';
import { BillItem, BillCategoryType } from '../types';
import { mockBills } from '../data/mockData';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReminderCardProps {
  bills?: BillItem[];
  paidBills?: string[];
  onPayPress?: (category: BillCategoryType) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  bills = mockBills,
  paidBills = ['internet'],
  onPayPress,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Count unpaid bills
  const unpaidBills = bills.filter((b) => !paidBills.includes(b.id));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed(!isCollapsed);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / containerWidth);
    if (index >= 0 && index < bills.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < bills.length && scrollRef.current && containerWidth > 0) {
      scrollRef.current.scrollTo({ x: idx * containerWidth, animated: true });
      setCurrentIndex(idx);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <View style={[styles.card, isCollapsed && styles.cardCollapsed]}>
      {/* Top Header Row with Bell & Counter, Slide Pagination Counter, and Collapse Toggle */}
      <View style={[styles.headerRow, isCollapsed && styles.headerRowCollapsed]}>
        <View style={styles.titleContainer}>
          <View style={styles.bellCircle}>
            <AppIcon name="bell" size={13} color="#ffffff" />
            {unpaidBills.length > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unpaidBills.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.reminderTitle} numberOfLines={1}>
            Pengingat Tagihan & Cicilan
          </Text>
        </View>

        <View style={styles.headerRightControls}>
          {!isCollapsed && bills.length > 1 && (
            <View style={styles.slideCounterBadge}>
              <Text style={styles.slideCounterText}>
                {currentIndex + 1}/{bills.length}
              </Text>
            </View>
          )}

          {/* Toggle Collapse Icon Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggleCollapse}
            style={styles.toggleIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={13}
              color="#1d72db"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Slide Carousel (Hidden when collapsed) */}
      {!isCollapsed && (
        <View
          style={styles.carouselContainer}
          onLayout={(e) => {
            const { width } = e.nativeEvent.layout;
            if (width > 0 && width !== containerWidth) {
              setContainerWidth(width);
            }
          }}
        >
          {containerWidth > 0 && (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
              style={styles.horizontalScroll}
            >
              {bills.map((bill) => {
                const isBillPaid = paidBills.includes(bill.id);
                return (
                  <View key={bill.id} style={[styles.billSlide, { width: containerWidth }]}>
                    <View style={styles.billBox}>
                      {/* Decorative background glow circles */}
                      <View style={styles.billBgAccent} />
                      <View style={styles.billBgAccentSmall} />

                      {/* Top Row: Authentic Brand Logo + Details */}
                      <View style={styles.billTopRow}>
                        {/* Service Logo Box */}
                        <View style={styles.iconBoxWrapper}>
                          <View style={styles.logoCardBox}>
                            <Image
                              source={bill.logo}
                              style={styles.billBrandLogo}
                              resizeMode="contain"
                            />
                          </View>
                        </View>

                        {/* Details Column */}
                        <View style={styles.detailContainer}>
                          <Text style={styles.serviceName} numberOfLines={1}>
                            {bill.title}
                          </Text>

                          <View style={styles.dueRow}>
                            {isBillPaid ? (
                              <View style={styles.paidPill}>
                                <Text style={styles.paidPillText}>✓ Sudah Dibayar</Text>
                              </View>
                            ) : (
                              <View style={styles.duePill}>
                                <Animated.View
                                  style={[
                                    styles.duePulseDot,
                                    { transform: [{ scale: pulseAnim }] },
                                  ]}
                                />
                                <Text style={styles.duePillText}>
                                  Jatuh tempo {bill.dueDateText}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.idPelText}>ID Pel: {bill.defaultId}</Text>
                        </View>
                      </View>

                      {/* Dashed Separator Line */}
                      <View style={styles.dashedDivider} />

                      {/* Bottom Bill Row: Amount & Pay Button */}
                      <View style={styles.billBottomRow}>
                        <View style={styles.amountCol}>
                          <Text style={styles.amountLabel}>Total Tagihan</Text>
                          <View style={styles.amountValueRow}>
                            <Text style={styles.amountCurrency}>Rp</Text>
                            <Text style={styles.amountNumber}>{formatRupiah(bill.amount)}</Text>
                          </View>
                        </View>

                        {/* Pay Button - Royal Blue Theme */}
                        {isBillPaid ? (
                          <View style={styles.paidDoneBtn}>
                            <Text style={styles.paidDoneBtnText}>Lunas</Text>
                            <View style={styles.paidDoneCheck}>
                              <Text style={styles.paidDoneCheckText}>✓</Text>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.payButton}
                            onPress={() => onPayPress?.(bill.id)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.payButtonText}>Bayar</Text>
                            <View style={styles.payBtnArrowCircle}>
                              <AppIcon name="chevron-right" size={11} color="#1d72db" />
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Slide Navigation Dots & Quick Next/Prev Controls */}
          {bills.length > 1 && (
            <View style={styles.slideFooter}>
              <TouchableOpacity
                onPress={() => goToSlide(currentIndex - 1)}
                disabled={currentIndex === 0}
                style={[styles.arrowNavBtn, currentIndex === 0 && styles.arrowNavBtnDisabled]}
                activeOpacity={0.7}
              >
                <AppIcon
                  name="chevron-left"
                  size={12}
                  color={currentIndex === 0 ? '#cbd5e1' : '#1d72db'}
                />
              </TouchableOpacity>

              {/* Dots */}
              <View style={styles.dotsContainer}>
                {bills.map((b, i) => {
                  const isActive = i === currentIndex;
                  const isPaid = paidBills.includes(b.id);
                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => goToSlide(i)}
                      style={[
                        styles.dot,
                        isActive && styles.dotActive,
                        isPaid && !isActive && styles.dotPaid,
                      ]}
                      activeOpacity={0.7}
                    />
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => goToSlide(currentIndex + 1)}
                disabled={currentIndex === bills.length - 1}
                style={[
                  styles.arrowNavBtn,
                  currentIndex === bills.length - 1 && styles.arrowNavBtnDisabled,
                ]}
                activeOpacity={0.7}
              >
                <AppIcon
                  name="chevron-right"
                  size={12}
                  color={currentIndex === bills.length - 1 ? '#cbd5e1' : '#1d72db'}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCollapsed: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRowCollapsed: {
    marginBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  bellCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1d72db',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
    elevation: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    paddingHorizontal: 2,
  },
  bellBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
  },
  reminderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slideCounterBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  slideCounterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1d72db',
  },
  toggleIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  carouselContainer: {
    width: '100%',
  },
  horizontalScroll: {
    width: '100%',
  },
  billSlide: {
    paddingHorizontal: 1,
  },
  billBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    position: 'relative',
    overflow: 'hidden',
  },
  billBgAccent: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(29, 114, 219, 0.05)',
  },
  billBgAccentSmall: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(29, 114, 219, 0.03)',
  },
  billTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBoxWrapper: {
    position: 'relative',
    marginRight: 10,
    alignItems: 'center',
  },
  logoCardBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1.2,
    borderColor: '#bfdbfe',
    padding: 3,
  },
  billBrandLogo: {
    width: 32,
    height: 32,
  },
  servicePillBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#bfdbfe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  servicePillText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: 0.3,
  },
  detailContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.1,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 4,
  },
  duePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#dc2626',
  },
  duePillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#dc2626',
  },
  paidPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  paidPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#059669',
  },
  idPelText: {
    fontSize: 10.5,
    color: '#1d72db',
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 0.7,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  billBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountCol: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 1,
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  amountCurrency: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d72db',
  },
  amountNumber: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1d72db',
    letterSpacing: -0.2,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1d72db',
    paddingVertical: 6.5,
    paddingLeft: 14,
    paddingRight: 7,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  payBtnArrowCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  paidDoneBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  paidDoneCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidDoneCheckText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
  },
  slideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  arrowNavBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  arrowNavBtnDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1d72db',
  },
  dotPaid: {
    backgroundColor: '#86efac',
  },
});
