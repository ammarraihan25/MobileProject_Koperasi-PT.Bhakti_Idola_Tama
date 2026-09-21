import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppIcon, IconType } from '../components/common/AppIcon';
import { mockTransactions, mockUser } from '../data/mockData';
import { TransactionItem } from '../types';
import { PAGUYUBAN_LOGO_DATA_URI } from '../utils/reportAssets';

interface RiwayatScreenProps {
  transactions?: TransactionItem[];
}

export const RiwayatScreen: React.FC<RiwayatScreenProps> = ({
  transactions = mockTransactions,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState<boolean>(false);
  const [pdfModalVisible, setPdfModalVisible] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const filterOptions: { id: string; label: string; icon?: IconType }[] = [
    { id: 'semua', label: 'Semua' },
    { id: 'kantin', label: 'Kantin Pabrik', icon: 'food' },
    { id: 'payroll', label: 'Potong Payroll', icon: 'wallet' },
    { id: 'simpanan', label: 'Simpanan Sukarela', icon: 'simpanan' },
    { id: 'ppob', label: 'Tagihan & Pulsa', icon: 'zap' },
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const generateReportHTML = () => {
    const now = new Date();
    const printDate = `${now.getDate()} September ${now.getFullYear()}`;
    const printTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} WIB`;
    const docRef = `DOC-BIT-KOP/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}/${Math.floor(1000 + Math.random() * 9000)}`;

    const rowsHTML = filteredTransactions
      .map((t, idx) => {
        const isCredit = t.isCredit;
        const amountFormatted = `${isCredit ? '+' : '-'}Rp ${formatRupiah(t.amount)}`;
        return `
          <tr>
            <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
            <td style="white-space: nowrap;">${t.timestamp || t.dateLabel || '-'}</td>
            <td style="font-family: monospace; font-weight: 800; color: #000000;">${
              t.referenceNo || `BIT-${t.id}`
            }</td>
            <td style="text-align: center;"><span class="category-badge">${t.category.toUpperCase()}</span></td>
            <td>
              <strong style="color: #000000;">${t.title}</strong><br/>
              <span style="font-size: 8pt; color: #4b5563;">${t.description || '-'}</span>
            </td>
            <td>${t.paymentSource || 'Saldo Koperasi'}</td>
            <td style="text-align: right; font-weight: 800; color: #000000; white-space: nowrap;">${amountFormatted}</td>
            <td style="text-align: center;"><span class="status-badge">${
              t.statusText || 'Berhasil'
            }</span></td>
          </tr>
        `;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan_Mutasi_Koperasi_BIT_${now.toISOString().slice(0, 10)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #000000;
      margin: 0;
      padding: 16px;
      font-size: 9pt;
      line-height: 1.35;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
    .brand-title {
      font-size: 15pt;
      font-weight: 900;
      color: #000000;
      margin: 0;
      letter-spacing: -0.3px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 9.5pt;
      font-weight: 800;
      color: #111827;
      margin: 2px 0 0 0;
      text-transform: uppercase;
    }
    .brand-address {
      font-size: 8pt;
      color: #4b5563;
      margin: 2px 0 0 0;
    }
    .doc-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #000000;
    }
    .doc-badge {
      display: inline-block;
      background: #ffffff;
      color: #000000;
      border: 1.5px solid #000000;
      padding: 3px 10px;
      border-radius: 4px;
      font-weight: 900;
      font-size: 8pt;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }
    .member-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #ffffff;
      border: 1.5px solid #000000;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 14px;
    }
    .meta-item {
      font-size: 8.5pt;
    }
    .meta-label {
      color: #4b5563;
      font-size: 7.5pt;
      text-transform: uppercase;
      font-weight: 800;
    }
    .meta-val {
      font-weight: 800;
      color: #000000;
      margin-top: 2px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .summary-card {
      padding: 10px 12px;
      border-radius: 6px;
      border: 1.5px solid #000000;
      background: #ffffff;
      color: #000000;
    }
    .summary-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      font-weight: 800;
      color: #4b5563;
    }
    .summary-val {
      font-size: 13pt;
      font-weight: 900;
      color: #000000;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 8.5pt;
    }
    th {
      background: #000000;
      color: #ffffff;
      text-align: left;
      padding: 8px 6px;
      font-weight: 800;
      font-size: 8pt;
      text-transform: uppercase;
      border: 1px solid #000000;
    }
    td {
      padding: 7px 6px;
      border: 1px solid #d1d5db;
      border-top: none;
      vertical-align: top;
      color: #000000;
    }
    tr:nth-child(even) td {
      background: #f9fafb;
    }
    .category-badge {
      background: #ffffff;
      color: #000000;
      border: 1px solid #000000;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: 800;
      display: inline-block;
    }
    .status-badge {
      background: #ffffff;
      color: #000000;
      border: 1px solid #000000;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: 800;
      display: inline-block;
    }
    .footer {
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1.5px solid #000000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #000000;
    }
    .stamp-box {
      border: 1.5px solid #000000;
      border-radius: 4px;
      padding: 6px 14px;
      color: #000000;
      font-weight: 900;
      font-size: 8pt;
      text-align: center;
      background: #ffffff;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <img src="${PAGUYUBAN_LOGO_DATA_URI}" alt="Logo Paguyuban" class="logo-img" />
      <div>
        <h1 class="brand-title">PT BAKTI IDOLA TAMA</h1>
        <p class="brand-sub">SISTEM KOPERASI & MUTASI TRANSAKSI ANGGOTA</p>
        <p class="brand-address">Kawasan Industri & Pergudangan Terpadu • Laporan Resmi Akuntansi</p>
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-badge">REKAP MUTASI RESMI</div>
      <div><strong>No. Dokumen:</strong> ${docRef}</div>
      <div><strong>Dicetak:</strong> ${printDate}, ${printTime}</div>
    </div>
  </div>

  <div class="member-grid">
    <div class="meta-item">
      <div class="meta-label">Nama Anggota</div>
      <div class="meta-val">${mockUser.name}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Nomor Induk Karyawan (NIK)</div>
      <div class="meta-val">${mockUser.nik}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Unit / Divisi</div>
      <div class="meta-val">${mockUser.department}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Filter Kategori</div>
      <div class="meta-val">${selectedFilter.toUpperCase()}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-label">Total Pemasukan (Kredit)</div>
      <div class="summary-val">+Rp ${formatRupiah(totalPemasukan)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Pengeluaran (Debit)</div>
      <div class="summary-val">-Rp ${formatRupiah(totalPengeluaran)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Jumlah Transaksi Terpilih</div>
      <div class="summary-val">${filteredTransactions.length} Transaksi</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25px; text-align: center;">No</th>
        <th style="width: 110px;">Tanggal / Waktu</th>
        <th style="width: 95px;">No. Referensi</th>
        <th style="width: 75px; text-align: center;">Kategori</th>
        <th>Keterangan / Merchant</th>
        <th style="width: 100px;">Sumber Dana</th>
        <th style="width: 105px; text-align: right;">Nominal (Rp)</th>
        <th style="width: 75px; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <p style="margin: 0; font-weight: 600;">Dokumen ini diterbitkan secara otomatis dan terverifikasi secara elektronik oleh Sistem Koperasi PT Bakti Idola Tama.</p>
      <p style="margin: 2px 0 0 0; color: #4b5563;">ID Autentikasi: SHA256-${Date.now().toString(16).toUpperCase()}</p>
    </div>
    <div class="stamp-box">
      DIVERIFIKASI RESMI<br/>
      KOPERASI PT BIT
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrintPDF = () => {
    if (typeof window === 'undefined') return;

    setIsExporting(true);
    const htmlContent = generateReportHTML();

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setIsExporting(false);
        setPdfModalVisible(false);
      }, 400);
    } else {
      handleDownloadHTMLBlob();
    }
  };

  const handleDownloadHTMLBlob = () => {
    if (typeof window === 'undefined') return;

    const htmlContent = generateReportHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Mutasi_Koperasi_BIT_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
    setPdfModalVisible(false);
    Alert.alert(
      'Export Berhasil! 📄',
      'File dokumen laporan mutasi transaksi berhasil diunduh. Anda dapat langsung membuka dan mencetak/menyimpannya sebagai PDF.'
    );
  };

  const handleDownload = () => {
    setPdfModalVisible(true);
  };

  const handleShareReceipt = (item: TransactionItem) => {
    Alert.alert(
      'Bagikan Struk Digital 📲',
      `Bukti transaksi ${item.referenceNo || 'MB-TRX-2026'} siap dikirimkan via WhatsApp / Email Karyawan.`
    );
  };

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Category filter
      let matchCat = true;
      if (selectedFilter !== 'semua') {
        if (selectedFilter === 'kantin') matchCat = t.category === 'kantin';
        else if (selectedFilter === 'payroll') matchCat = t.category === 'payroll';
        else if (selectedFilter === 'simpanan')
          matchCat =
            t.category === 'tarik' ||
            t.category === 'topup' ||
            t.category === 'simpan_pinjam' ||
            t.title.toLowerCase().includes('simpanan sukarela');
        else if (selectedFilter === 'ppob') matchCat = t.category === 'ppob';
      }

      // Search filter
      const query = searchQuery.toLowerCase().trim();
      let matchSearch = true;
      if (query) {
        matchSearch =
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.paymentSource.toLowerCase().includes(query) ||
          (t.referenceNo && t.referenceNo.toLowerCase().includes(query)) ||
          t.amount.toString().includes(query);
      }

      return matchCat && matchSearch;
    });
  }, [transactions, selectedFilter, searchQuery]);

  // Cashflow Totals
  const { totalPemasukan, totalPengeluaran } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.isCredit) {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    });
    return { totalPemasukan: inc, totalPengeluaran: exp };
  }, [filteredTransactions]);

  const groupedTransactions = useMemo(() => {
    const groups: { [month: string]: TransactionItem[] } = {};
    filteredTransactions.forEach((tx) => {
      const m = tx.monthLabel || 'Transaksi Terbaru';
      if (!groups[m]) groups[m] = [];
      groups[m].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const openReceiptModal = (item: TransactionItem) => {
    setSelectedTx(item);
    setReceiptModalVisible(true);
  };

  const getCategoryConfig = (item: TransactionItem) => {
    if (item.category === 'kantin') {
      return {
        icon: 'food' as IconType,
        bgColor: '#16a34a',
        iconColor: '#ffffff',
      };
    }
    if (item.category === 'elektronik') {
      return {
        icon: 'elektronik' as IconType,
        bgColor: '#1d72db',
        iconColor: '#ffffff',
      };
    }
    if (item.category === 'ppob') {
      return {
        icon: 'zap' as IconType,
        bgColor: '#ea580c',
        iconColor: '#ffffff',
      };
    }
    if (item.category === 'payroll') {
      const isLoan =
        item.title.toLowerCase().includes('pinjaman') ||
        item.title.toLowerCase().includes('cicilan');
      return {
        icon: (isLoan ? 'paylater' : 'wallet') as IconType,
        bgColor: '#1d72db',
        iconColor: '#ffffff',
      };
    }
    if (item.category === 'simpan_pinjam') {
      const isLoan =
        item.title.toLowerCase().includes('pinjaman') ||
        item.title.toLowerCase().includes('cicilan');
      return {
        icon: (isLoan ? 'paylater' : 'simpanan') as IconType,
        bgColor: isLoan ? '#d97706' : '#0284c7',
        iconColor: '#ffffff',
      };
    }
    if (item.category === 'tarik') {
      return {
        icon: 'withdraw' as IconType,
        bgColor: '#dc2626',
        iconColor: '#ffffff',
      };
    }
    if (item.category === 'topup' || item.isCredit) {
      return {
        icon: 'plus' as IconType,
        bgColor: '#16a34a',
        iconColor: '#ffffff',
      };
    }
    return {
      icon: 'arrow-up-right' as IconType,
      bgColor: '#1d72db',
      iconColor: '#ffffff',
    };
  };

  const renderTransactionItem = (item: TransactionItem, index: number, arrayLength: number) => {
    const config = getCategoryConfig(item);

    return (
      <React.Fragment key={item.id}>
        <TouchableOpacity
          style={styles.cardItem}
          onPress={() => openReceiptModal(item)}
          activeOpacity={0.7}
        >
          {/* Left Icon Box */}
          <View style={[styles.itemIconBox, { backgroundColor: config.bgColor }]}>
            <AppIcon name={config.icon} size={18} color={config.iconColor} />
          </View>

          {/* Middle Details */}
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {item.dateLabel}
            </Text>
          </View>

          {/* Right Amount */}
          <View style={styles.amountCol}>
            <Text
              style={[
                styles.itemAmount,
                item.isCredit ? styles.txCreditText : styles.txDebitText,
              ]}
            >
              {item.isCredit ? '+' : '-'}Rp {formatRupiah(item.amount)}
            </Text>
            <AppIcon name="chevron-right" size={13} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        {index < arrayLength - 1 && <View style={styles.divider} />}
      </React.Fragment>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header (Royal Blue Fintech Theme) */}
        <View style={styles.header}>
          {/* Ambient Geometric Watermarks */}
          <View style={styles.watermarkCircle1} />
          <View style={styles.watermarkCircle2} />

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
              <View style={styles.verifiedRow}>
                <View style={styles.liveSyncDot} />
                <Text style={styles.headerSub}>
                  PT Bakti Idola Tama • Rekap Jurnal 2026
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownload}
              activeOpacity={0.85}
            >
              <AppIcon name="receipt" size={13} color="#1d72db" />
              <Text style={styles.downloadBtnText}>Export PDF</Text>
            </TouchableOpacity>
          </View>

          {/* High-Contrast Dual Cashflow Cards */}
          <View style={styles.cashflowRow}>
            {/* Total Masuk Card */}
            <View style={styles.cashflowCardIn}>
              <View style={styles.cashflowIconBoxIn}>
                <AppIcon name="arrow-down-left" size={15} color="#ffffff" />
              </View>
              <View style={styles.cashflowTextWrapper}>
                <Text style={styles.cashflowLabelIn}>Total Masuk</Text>
                <Text style={styles.cashflowAmountIn}>
                  +Rp {formatRupiah(totalPemasukan)}
                </Text>
              </View>
            </View>

            {/* Total Keluar Card */}
            <View style={styles.cashflowCardOut}>
              <View style={styles.cashflowIconBoxOut}>
                <AppIcon name="arrow-up-right" size={15} color="#ffffff" />
              </View>
              <View style={styles.cashflowTextWrapper}>
                <Text style={styles.cashflowLabelOut}>Total Keluar</Text>
                <Text style={styles.cashflowAmountOut}>
                  -Rp {formatRupiah(totalPengeluaran)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Live Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <AppIcon name="search" size={15} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari transaksi, merchant, ref..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. Filter Chips Bar */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {filterOptions.map((opt) => {
              const isActive = selectedFilter === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(opt.id)}
                  activeOpacity={0.75}
                >
                  {opt.icon && (
                    <AppIcon
                      name={opt.icon}
                      size={13}
                      color={isActive ? '#ffffff' : '#64748b'}
                    />
                  )}
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipActiveText,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Dynamic Monthly Transaction Groups */}
        {Object.entries(groupedTransactions).map(([month, list]) => (
          <View key={month} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{month}</Text>
            </View>
            <View style={styles.cardGroup}>
              {list.map((item, idx) =>
                renderTransactionItem(item, idx, list.length)
              )}
            </View>
          </View>
        ))}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <AppIcon name="history" size={26} color="#ffffff" />
            </View>
            <Text style={styles.emptyTitle}>Tidak Ada Transaksi Ditemukan</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? `Tidak ada transaksi dengan kata kunci "${searchQuery}".`
                : 'Belum ada catatan mutasi pada kategori yang dipilih.'}
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('semua');
                }}
              >
                <Text style={styles.resetFilterText}>Reset Pencarian</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* 6. Detail Bukti Transaksi Digital (E-Receipt Modal) */}
      <Modal
        visible={receiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReceiptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            {/* Modal Header */}
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptHeaderTitle}>Bukti Transaksi Digital</Text>
                <Text style={styles.receiptHeaderSub}>
                  Koperasi Karyawan PT Bakti Idola Tama
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReceiptModalVisible(false)}
                style={styles.receiptCloseBtn}
              >
                <Text style={styles.receiptCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.receiptScroll}
              >
                {/* Status Stamp */}
                <View style={styles.statusStampBox}>
                  <View style={styles.successIconBox}>
                    <AppIcon name="check-circle" size={24} color="#ffffff" />
                  </View>
                  <Text style={styles.receiptStatusText}>
                    {selectedTx.statusText || 'Transaksi Berhasil'}
                  </Text>
                  <Text style={styles.receiptStatusSub}>
                    Tercatat Otomatis di Jurnal Akuntansi Koperasi
                  </Text>
                </View>

                {/* Big Amount */}
                <View style={styles.receiptAmountBox}>
                  <Text style={styles.receiptAmountLabel}>Nominal Transaksi</Text>
                  <Text
                    style={[
                      styles.receiptAmountValue,
                      selectedTx.isCredit
                        ? styles.txCreditText
                        : styles.receiptDebitValue,
                    ]}
                  >
                    {selectedTx.isCredit ? '+' : '-'}Rp{' '}
                    {formatRupiah(selectedTx.amount)}
                  </Text>
                </View>

                {/* Item Breakdown (If Canteen or Electronics Order has items) */}
                {selectedTx.itemDetails && selectedTx.itemDetails.length > 0 && (
                  <View style={styles.orderItemsBox}>
                    <Text style={styles.orderItemsHeader}>Rincian Pesanan / Item</Text>
                    {selectedTx.itemDetails.map((detail, dIdx) => (
                      <View key={dIdx} style={styles.orderItemRow}>
                        <View style={styles.orderItemLeft}>
                          <Text style={styles.orderItemName}>
                            {detail.qty ? `${detail.qty}x ` : ''}
                            {detail.name}
                          </Text>
                          {detail.note ? (
                            <Text style={styles.orderItemNote}>{detail.note}</Text>
                          ) : null}
                        </View>
                        {detail.price ? (
                          <Text style={styles.orderItemPrice}>
                            Rp {formatRupiah(detail.price * (detail.qty || 1))}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}

                {/* Perforated Dashed Line */}
                <View style={styles.receiptDashedLine} />

                {/* Detail Breakdown List */}
                <View style={styles.detailList}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Judul Transaksi</Text>
                    <Text style={styles.detailValueBold}>{selectedTx.title}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nomor Referensi</Text>
                    <Text style={styles.detailValueCode}>
                      {selectedTx.referenceNo || 'MB-TRX-2026-AUTO'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sumber Dana / Metode</Text>
                    <Text style={styles.detailValue}>
                      {selectedTx.paymentSource}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Waktu & Tanggal</Text>
                    <Text style={styles.detailValue}>
                      {selectedTx.dateLabel}
                    </Text>
                  </View>

                  {/* Contextual: Lokasi Stand Kantin / Loket Pengambilan */}
                  {selectedTx.metadata?.locationOrStand && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Loket / Lokasi Ambil</Text>
                      <Text style={styles.detailValueHighlight}>
                        {selectedTx.metadata.locationOrStand}
                      </Text>
                    </View>
                  )}

                  {/* Contextual: Garansi Resmi Produk */}
                  {selectedTx.metadata?.warranty && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Garansi Resmi</Text>
                      <Text style={styles.detailValueGreen}>
                        {selectedTx.metadata.warranty}
                      </Text>
                    </View>
                  )}

                  {/* Contextual: Slip Payroll Periode */}
                  {selectedTx.metadata?.payrollPeriod && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Periode Slip Gaji</Text>
                      <Text style={styles.detailValueHighlight}>
                        {selectedTx.metadata.payrollPeriod}
                      </Text>
                    </View>
                  )}

                  {/* Contextual: Rekening Bank / VA */}
                  {selectedTx.metadata?.bankAccount && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tujuan / Rekening</Text>
                      <Text style={styles.detailValueBold}>
                        {selectedTx.metadata.bankAccount}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Keterangan</Text>
                    <Text style={styles.detailValue}>
                      {selectedTx.description}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Biaya Layanan</Text>
                    <Text style={styles.detailFreeVal}>Rp 0</Text>
                  </View>
                </View>

                {/* Digital Verification Box */}
                <View style={styles.securityBox}>
                  <AppIcon name="lock" size={14} color="#16a34a" />
                  <Text style={styles.securityText}>
                    Tervalidasi Resmi • Koperasi PT Bakti Idola Tama
                  </Text>
                </View>

                {/* Receipt Actions */}
                <View style={styles.receiptActionRow}>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => handleShareReceipt(selectedTx)}
                    activeOpacity={0.85}
                  >
                    <AppIcon name="share" size={15} color="#1d72db" />
                    <Text style={styles.shareBtnText}>Bagikan Struk</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setReceiptModalVisible(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneBtnText}>Selesai</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 2. PDF EXPORT MODAL */}
      <Modal
        visible={pdfModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPdfModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pdfExportContainer}>
            <View style={styles.pdfExportHeader}>
              <View style={styles.pdfIconBg}>
                <AppIcon name="receipt" size={22} color="#1d72db" />
              </View>
              <View style={styles.pdfHeaderInfo}>
                <Text style={styles.pdfExportTitle}>Export Laporan Mutasi (PDF)</Text>
                <Text style={styles.pdfExportSub}>PT Bakti Idola Tama • Rekap Jurnal 2026</Text>
              </View>
              <TouchableOpacity
                style={styles.receiptCloseBtn}
                onPress={() => setPdfModalVisible(false)}
              >
                <Text style={styles.receiptCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pdfScroll} showsVerticalScrollIndicator={false}>
              {/* Report Summary Card */}
              <View style={styles.pdfSummaryCard}>
                <View style={styles.pdfSummaryRow}>
                  <Text style={styles.pdfSummaryLabel}>Anggota:</Text>
                  <Text style={styles.pdfSummaryVal}>
                    {mockUser.name} ({mockUser.nik})
                  </Text>
                </View>
                <View style={styles.pdfSummaryRow}>
                  <Text style={styles.pdfSummaryLabel}>Kategori Terpilih:</Text>
                  <Text style={styles.pdfSummaryValHighlight}>
                    {filterOptions.find((f) => f.id === selectedFilter)?.label || 'Semua Kategori'}
                  </Text>
                </View>
                <View style={styles.pdfSummaryRow}>
                  <Text style={styles.pdfSummaryLabel}>Jumlah Transaksi:</Text>
                  <Text style={styles.pdfSummaryVal}>{filteredTransactions.length} Transaksi</Text>
                </View>
                <View style={styles.pdfSummaryRow}>
                  <Text style={styles.pdfSummaryLabel}>Total Pemasukan:</Text>
                  <Text style={styles.pdfSummaryValIn}>+Rp {formatRupiah(totalPemasukan)}</Text>
                </View>
                <View style={styles.pdfSummaryRow}>
                  <Text style={styles.pdfSummaryLabel}>Total Pengeluaran:</Text>
                  <Text style={styles.pdfSummaryValOut}>-Rp {formatRupiah(totalPengeluaran)}</Text>
                </View>
              </View>

              {/* Format explanation */}
              <View style={styles.pdfFormatInfo}>
                <AppIcon name="info" size={16} color="#1d72db" />
                <Text style={styles.pdfFormatInfoText}>
                  Laporan akan digenerate dalam format standar A4 resmi lengkap dengan kop PT Bakti Idola Tama dan tabel rincian mutasi.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.pdfActionButtons}>
                <TouchableOpacity
                  style={styles.pdfPrimaryBtn}
                  onPress={handlePrintPDF}
                  activeOpacity={0.85}
                  disabled={isExporting}
                >
                  <AppIcon name="download" size={18} color="#ffffff" />
                  <Text style={styles.pdfPrimaryBtnText}>
                    {isExporting ? 'Menyiapkan Dokumen...' : 'Cetak / Simpan PDF'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pdfCancelBtn}
                  onPress={() => setPdfModalVisible(false)}
                >
                  <Text style={styles.pdfCancelBtnText}>Tutup</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingBottom: 120, // Prevents bottom tab bar overlap
  },
  header: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
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
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  watermarkCircle2: {
    position: 'absolute',
    bottom: -40,
    left: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
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
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  downloadBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  cashflowRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cashflowCardIn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cashflowIconBoxIn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashflowTextWrapper: {
    flex: 1,
  },
  cashflowLabelIn: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803d',
  },
  cashflowAmountIn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
    marginTop: 1,
    letterSpacing: -0.2,
  },
  cashflowCardOut: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cashflowIconBoxOut: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashflowLabelOut: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#b91c1c',
  },
  cashflowAmountOut: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
    marginTop: 1,
    letterSpacing: -0.2,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0f172a',
    padding: 0,
  },
  clearBtnText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  filterWrapper: {
    marginBottom: 14,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#1d72db',
    borderColor: '#1d72db',
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipActiveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
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
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemIconBox: {
    width: 38,
    height: 38,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.1,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },
  amountCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  txDebitText: {
    color: '#0f172a',
  },
  txCreditText: {
    color: '#16a34a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  resetFilterBtn: {
    backgroundColor: '#1d72db',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  resetFilterText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '600',
  },

  /* Modal E-Receipt Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  receiptContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  receiptHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptHeaderSub: {
    fontSize: 10.5,
    color: '#64748b',
  },
  receiptCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptCloseText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  receiptScroll: {
    padding: 18,
  },
  statusStampBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  successIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2.5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 3,
  },
  receiptStatusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16a34a',
  },
  receiptStatusSub: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  receiptAmountBox: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  receiptAmountLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  receiptAmountValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  receiptDebitValue: {
    color: '#0f172a',
  },
  receiptDashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  detailList: {
    gap: 9,
    marginVertical: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    flex: 0.45,
  },
  detailValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '600',
    flex: 0.55,
    textAlign: 'right',
  },
  detailValueBold: {
    fontSize: 11.5,
    color: '#0f172a',
    fontWeight: '600',
    flex: 0.55,
    textAlign: 'right',
  },
  detailValueCode: {
    fontSize: 11,
    color: '#1d72db',
    fontWeight: '600',
    fontFamily: 'monospace',
    flex: 0.55,
    textAlign: 'right',
  },
  orderItemsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    gap: 8,
  },
  orderItemsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  orderItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  orderItemNote: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailValueHighlight: {
    fontSize: 11,
    color: '#1d72db',
    fontWeight: '700',
    flex: 0.55,
    textAlign: 'right',
  },
  detailValueGreen: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
    flex: 0.55,
    textAlign: 'right',
  },
  detailFreeVal: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
    flex: 0.55,
    textAlign: 'right',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  securityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
  },
  receiptActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  shareBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1d72db',
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d72db',
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* PDF Modal Styles */
  pdfExportContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  pdfExportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  pdfIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pdfHeaderInfo: {
    flex: 1,
  },
  pdfExportTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  pdfExportSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  pdfScroll: {
    padding: 18,
  },
  pdfSummaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    gap: 8,
  },
  pdfSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pdfSummaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  pdfSummaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  pdfSummaryValHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d72db',
  },
  pdfSummaryValIn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  pdfSummaryValOut: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  pdfFormatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 8,
    marginBottom: 16,
  },
  pdfFormatInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#1d4ed8',
    lineHeight: 15,
  },
  pdfActionButtons: {
    gap: 10,
    marginBottom: 8,
  },
  pdfPrimaryBtn: {
    backgroundColor: '#1d72db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#1d72db',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  pdfPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  pdfSecondaryBtn: {
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  pdfSecondaryBtnText: {
    color: '#1d72db',
    fontSize: 12.5,
    fontWeight: '600',
  },
  pdfCancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pdfCancelBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
});
