import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

export type IconType =
  | 'mission'
  | 'transfer'
  | 'riwayat'
  | 'tarik'
  | 'tagihan'
  | 'pulsa'
  | 'paylater'
  | 'kantin'
  | 'simpanan'
  | 'pengaturan'
  | 'gift'
  | 'bolt'
  | 'home'
  | 'home-active'
  | 'wallet'
  | 'wallet-active'
  | 'qr-code'
  | 'qris'
  | 'history'
  | 'history-active'
  | 'profile'
  | 'profile-active'
  | 'topup'
  | 'withdraw'
  | 'bell'
  | 'receipt'
  | 'lock'
  | 'check'
  | 'check-circle'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'food'
  | 'eye'
  | 'eye-off'
  | 'search'
  | 'calendar'
  | 'download'
  | 'share'
  | 'arrow-down-left'
  | 'arrow-up-right'
  | 'x'
  | 'copy'
  | 'user'
  | 'users'
  | 'building'
  | 'phone'
  | 'wifi'
  | 'zap'
  | 'droplet'
  | 'info'
  | 'star'
  | 'elektronik'
  | 'shopping-bag'
  | 'mail'
  | 'facebook'
  | 'google'
  | 'chat'
  | 'clock'
  | 'pdam'
  | 'bpjs'
  | 'camera'
  | 'edit'
  | 'printer'
  | 'plus';

interface AppIconProps {
  name: IconType;
  size?: number;
  color?: string;
  badgeBg?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = '#1d72db',
  badgeBg,
}) => {
  const renderSvg = () => {
    switch (name) {
      // 0. Elektronik / Shopping Appliance
      case 'elektronik':
      case 'shopping-bag':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" />
            <Path
              d="M16 10a4 4 0 01-8 0"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      // 1. Mission (Gift Box)
      case 'mission':
      case 'gift':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="8" width="18" height="4" rx="1" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 8v13M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M7.5 8a2.5 2.5 0 010-5c1.5 0 3.5 2 4.5 5 1-3 3-5 4.5-5a2.5 2.5 0 010 5" stroke={color} strokeWidth="1.8" />
          </Svg>
        );

      // 2. Minta / Transfer (Arrow Up-Right)
      case 'transfer':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <Path d="M8 16L16 8M10 8h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 3. Riwayat / History Loop
      case 'riwayat':
      case 'history':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 12a9 9 0 102.6-6.3L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="3 3 3 8 8 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="12 7 12 12 15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      case 'history-active':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" fill={color} opacity="0.15" />
            <Path d="M3 12a9 9 0 102.6-6.3L3 8" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="3 3 3 8 8 8" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="12 7 12 12 15 15" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 4. Tarik Tunai / Cash
      case 'tarik':
      case 'withdraw':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2" />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
            <Path d="M6 12h.01M18 12h.01" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </Svg>
        );

      // 5. Tagihan PPoB (Receipt)
      case 'tagihan':
      case 'receipt':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M4 2v20l3-1.5 3 1.5 3-1.5 3 1.5 4-2V2l-4 2-3-1.5-3 1.5-3-1.5-3 1.5z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            <Path d="M8 8h8M8 12h8M8 16h5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      // 6. Pulsa & Data (Smartphone Signal)
      case 'pulsa':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="7" y="2" width="10" height="20" rx="2" stroke={color} strokeWidth="2" />
            <Circle cx="12" cy="18" r="1" fill={color} />
            <Path d="M10 5h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <Path d="M3 8a13 13 0 010 8M21 8a13 13 0 000 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          </Svg>
        );

      // 7. PayLater (Card Chip)
      case 'paylater':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
            <Path d="M2 10h20" stroke={color} strokeWidth="2" />
            <Rect x="5" y="13" width="4" height="3" rx="0.5" fill={color} />
          </Svg>
        );

      // 8. Kantin (Fork & Knife / Food)
      case 'kantin':
      case 'food':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M18 2v20M15 2v5a3 3 0 003 3M21 2v5a3 3 0 01-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6 2v20M3 2v6a3 3 0 006 0V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 9. Simpanan (Bank Building)
      case 'simpanan':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 21h18M3 10h18M12 3l9 5H3l9-5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5 10v7M9 10v7M15 10v7M19 10v7" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );

      // 10. Pengaturan (Sliders)
      case 'pengaturan':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="4" cy="14" r="2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="8" r="2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="20" cy="16" r="2" stroke={color} strokeWidth="2" fill="none" />
          </Svg>
        );

      // 11. Home Navigation Tab
      case 'home':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      case 'home-active':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M3 9l9-7 9 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill={color} />
          </Svg>
        );

      // 12. Wallet Navigation Tab
      case 'wallet':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={color} strokeWidth="2" />
            <Path d="M16 3H4a2 2 0 00-2 2v2h18V5a2 2 0 00-2-2z" stroke={color} strokeWidth="2" />
            <Circle cx="16" cy="14" r="1.5" fill={color} />
          </Svg>
        );
      case 'wallet-active':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.15" />
            <Path d="M16 3H4a2 2 0 00-2 2v2h18V5a2 2 0 00-2-2z" stroke={color} strokeWidth="2.2" />
            <Circle cx="16" cy="14" r="2" fill={color} />
          </Svg>
        );

      // 13. QR Code / Member Barcode Scan
      case 'qr-code':
      case 'qris':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            <Rect x="7" y="7" width="10" height="10" rx="2" stroke={color} strokeWidth="2" />
            <Rect x="10" y="10" width="4" height="4" fill={color} />
          </Svg>
        );

      // 14. Profile Navigation Tab
      case 'profile':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
          </Svg>
        );
      case 'profile-active':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.15" strokeLinecap="round" />
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.2" />
          </Svg>
        );

      // 15. Top Up (Plus)
      case 'topup':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 16. Bolt / Lightning
      case 'bolt':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </Svg>
        );

      // 17. Bell (Notification)
      case 'bell':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 18. Lock / Shield
      case 'lock':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 19. Check & Check Circle
      case 'check':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case 'check-circle':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1" />
            <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 20. Chevron Right & Left
      case 'chevron-right':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case 'chevron-left':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case 'chevron-down':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      case 'chevron-up':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 21. Eye / Show
      case 'eye':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
          </Svg>
        );

      // 22. Eye Off / Hide
      case 'eye-off':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 23. Search
      case 'search':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 24. Calendar
      case 'calendar':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 25. Download
      case 'download':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="7 10 12 15 17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 25b. Printer
      case 'printer':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="6 9 6 2 18 2 18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="6" y="14" width="12" height="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 26. Share
      case 'share':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
            <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
            <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
            <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2" />
            <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2" />
          </Svg>
        );

      // 27. Arrow Down-Left (Masuk / Credit)
      case 'arrow-down-left':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <Path d="M16 8L8 16M16 16H8V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 28. Arrow Up-Right (Keluar / Debit)
      case 'arrow-up-right':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <Path d="M8 16L16 8M8 8h8v8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 29. X / Close
      case 'x':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 30. Copy
      case 'copy':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 31. User
      case 'user':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 31b. Users (Multiple Members)
      case 'users':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 32. Building / Bank
      case 'building':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 33. Phone
      case 'phone':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 34. Wifi
      case 'wifi':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 35. Zap / Electric
      case 'zap':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 36. Droplet / Water
      case 'droplet':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 37. Info
      case 'info':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="12" y1="12" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 38. Star
      case 'star':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.9" />
          </Svg>
        );

      // 39. Mail / Envelope
      case 'mail':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="3 7 12 13 21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 40. Facebook
      case 'facebook':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#1877f2" />
            <Path
              d="M13.5 8.5h1.8V5.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v2.5H6v3.2h2.4V22h3.3v-6.2h2.7l.4-3.2h-3.1v-2.1c0-.9.3-1.6 1.8-1.6z"
              fill="#ffffff"
            />
          </Svg>
        );

      // 41. Google
      case 'google':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <Path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <Path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <Path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </Svg>
        );

      // 42. Chat / Message Bubble
      case 'chat':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#0284c7" />
            <Path
              d="M7 11.5a5 5 0 0110 0c0 2.2-1.5 4-3.5 4.7-.5.2-.9.5-1.1.9l-.7 1.2c-.2.3-.6.4-.9.2-.2-.1-.3-.3-.3-.5v-1.8c-2-.5-3.5-2.3-3.5-4.7z"
              fill="#ffffff"
            />
            <Line x1="9.5" y1="10" x2="14.5" y2="10" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
            <Line x1="9.5" y1="12" x2="13" y2="12" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
          </Svg>
        );

      // 42b. Clock / Time
      case 'clock':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );

      // 43. PDAM / Water Utility
      case 'pdam':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 13.5c1 1.5 2 2 3 2s2-.5 3-2"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        );

      // 44. BPJS / Health & Employment Protection
      case 'bpjs':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 7.5v7M8.5 11h7"
              stroke={color}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </Svg>
        );

      // 53. Camera
      case 'camera':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
          </Svg>
        );

      // 54. Edit / Pencil
      case 'edit':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      // 55. Plus / Add
      case 'plus':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 5v14M5 12h14"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
          </Svg>
        );
    }
  };

  if (badgeBg) {
    return (
      <View style={[styles.badgeWrapper, { backgroundColor: badgeBg, width: size * 1.8, height: size * 1.8, borderRadius: size * 0.9 }]}>
        {renderSvg()}
      </View>
    );
  }

  return renderSvg();
};

const styles = StyleSheet.create({
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
