# 📘 BKT-SimCare - Buku Panduan Pengguna
## Sistem Manajemen Kartu SIM Terpadu

---

## 📋 Daftar Isi

1. [Pengenalan Aplikasi](#pengenalan-aplikasi)
2. [Login & Akses Aplikasi](#login--akses-aplikasi)
3. [Dashboard Overview](#dashboard-overview)
4. [Manajemen SIM Cards](#manajemen-sim-cards)
5. [Manajemen Devices](#manajemen-devices)
6. [Manajemen Customers](#manajemen-customers)
7. [History & Audit Trail](#history--audit-trail)
8. [Executive Summary & Reports](#executive-summary--reports)
9. [Import Data Excel](#import-data-excel)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## 🎯 Pengenalan Aplikasi

### Apa itu BKT-SimCare?

**BKT-SimCare** adalah sistem manajemen kartu SIM yang dirancang untuk membantu perusahaan mengelola inventori SIM card, perangkat (devices), pelanggan (customers), dan tracking status lifecycle kartu SIM secara terpusat.

### Fitur Utama

✅ **Manajemen SIM Cards** - Kelola kartu SIM dari warehouse hingga deaktivasi  
✅ **Device Management** - Track perangkat yang menggunakan SIM card  
✅ **Customer Management** - Kelola data pelanggan dan instalasi  
✅ **Status Tracking** - Monitor lifecycle SIM card secara real-time  
✅ **History Audit** - Rekam jejak perubahan status lengkap  
✅ **Dashboard Analytics** - Visualisasi data dengan grafik interaktif  
✅ **Executive Reports** - Laporan komprehensif untuk manajemen  
✅ **Excel Import** - Import data massal dari file Excel  

### Teknologi yang Digunakan

- **Frontend:** Next.js 15, React 18, TypeScript
- **Backend:** Supabase (PostgreSQL Database)
- **UI Components:** Shadcn/UI, Tailwind CSS
- **Charts:** Recharts
- **Timezone:** UTC+7 (WIB - Waktu Indonesia Barat)

---

## 🔐 Login & Akses Aplikasi

### Cara Mengakses Aplikasi

1. **Buka Browser**
   - Chrome, Firefox, Safari, atau Edge (versi terbaru)

2. **Masukkan URL Aplikasi**
   ```
   https://your-domain.vercel.app
   ```
   atau untuk development:
   ```
   http://localhost:3000
   ```

3. **Halaman Dashboard Otomatis Terbuka**
   - Aplikasi langsung menampilkan dashboard utama
   - Tidak ada proses login (sistem internal)

---

## 📊 Dashboard Overview

### Halaman Dashboard Utama

Dashboard adalah halaman pertama yang Anda lihat saat membuka aplikasi. Halaman ini memberikan overview cepat tentang status keseluruhan SIM card di sistem.

### Komponen Dashboard

#### 1. **Welcome Header**
```
┌────────────────────────────────────────┐
│ 🏠 DASHBOARD                           │
│ Welcome to BKT-SimCare Management      │
└────────────────────────────────────────┘
```

#### 2. **Status Cards (6 Cards)**

**Card 1: Total SIM Cards**
- **Fungsi:** Menampilkan total keseluruhan SIM card di sistem
- **Warna:** Blue
- **Icon:** 📱 Phone
- **Contoh:** `200` (total cards)

**Card 2: Warehouse Stock**
- **Fungsi:** Menampilkan jumlah SIM card dengan status WAREHOUSE (stok tersedia)
- **Warna:** Orange
- **Icon:** 📦 Package
- **Contoh:** `31` (cards in warehouse)

**Card 3: Ghost SIM Card**
- **Fungsi:** Menampilkan SIM card yang sudah activated tapi belum installed (tidak terhubung ke device)
- **Warna:** Purple
- **Icon:** 👻 Ghost
- **Contoh:** `15` (ghost cards)

**Card 4: Installed SIM**
- **Fungsi:** Menampilkan SIM card yang sudah terinstall di device
- **Warna:** Green
- **Icon:** ✅ Check Circle
- **Contoh:** `120` (installed cards)

**Card 5: Grace Period**
- **Fungsi:** Menampilkan SIM card dalam masa tenggang billing (30 hari setelah billing)
- **Warna:** Yellow
- **Icon:** ⏰ Clock
- **Contoh:** `8` (in grace period)

**Card 6: Deactivated**
- **Fungsi:** Menampilkan SIM card yang sudah dinonaktifkan
- **Warna:** Red
- **Icon:** ⛔ Ban
- **Contoh:** `26` (deactivated cards)

#### 3. **Filter Periode Grafik**

```
┌─────────────────────────────────────────┐
│ 📅 Filter Periode Grafik                │
├─────────────────────────────────────────┤
│  Start Date: [2025-08-01] ▼             │
│  End Date:   [2026-01-31] ▼             │
└─────────────────────────────────────────┘
```

**Fungsi:**
- Filter data grafik berdasarkan rentang tanggal
- Default: 6 bulan terakhir (bulan berjalan + 5 bulan ke belakang)
- User dapat memilih rentang tanggal custom

**Cara Menggunakan:**
1. Klik pada **Start Date** input
2. Pilih tanggal mulai dari calendar picker
3. Klik pada **End Date** input
4. Pilih tanggal akhir dari calendar picker
5. Grafik otomatis update sesuai rentang yang dipilih

**Tips:**
- Untuk melihat data 3 bulan terakhir: Set start date 3 bulan lalu
- Untuk melihat data 1 tahun: Set start date 12 bulan lalu
- Untuk melihat data bulan tertentu: Set start dan end date di bulan yang sama

#### 4. **Chart 1: SIM Cards Masuk (Warehouse) - Per Bulan**

**Fungsi:**
- Menampilkan jumlah SIM card baru yang masuk ke warehouse setiap bulannya
- Data berdasarkan tanggal pembuatan SIM card (created_at)
- Hanya menghitung SIM dengan status WAREHOUSE

**Visual:**
- Line chart dengan warna biru (#8884d8)
- Y-axis: Jumlah (Qty)
- X-axis: Nama bulan (Agt 2025, Sep 2025, dst.)
- Tooltip: Menampilkan jumlah kartu saat hover

**Contoh Data:**
```
Agt 2025: 18 cards
Sep 2025: 23 cards
Okt 2025: 21 cards
Nov 2025: 26 cards
Des 2025: 28 cards
Jan 2026: 31 cards
```

**Cara Membaca:**
- Point tertinggi = bulan dengan penerimaan SIM terbanyak
- Point terendah = bulan dengan penerimaan SIM paling sedikit
- Tren naik = Peningkatan penerimaan SIM
- Tren turun = Penurunan penerimaan SIM

#### 5. **Chart 2: SIM Cards Deactivated - Per Bulan**

**Fungsi:**
- Menampilkan jumlah SIM card yang dinonaktifkan setiap bulannya
- Data berdasarkan tanggal deaktivasi (deactivation_date)
- Menghitung semua SIM yang di-deactivate

**Visual:**
- Line chart dengan warna merah (#ef4444)
- Y-axis: Jumlah (Qty)
- X-axis: Nama bulan (Agt 2025, Sep 2025, dst.)
- Tooltip: Menampilkan jumlah kartu saat hover

**Contoh Data:**
```
Agt 2025: 9 cards
Sep 2025: 12 cards
Okt 2025: 14 cards
Nov 2025: 15 cards
Des 2025: 16 cards
Jan 2026: 17 cards
```

**Cara Membaca:**
- Point tertinggi = bulan dengan deaktivasi terbanyak
- Point terendah = bulan dengan deaktivasi paling sedikit
- Tren naik = Peningkatan jumlah deaktivasi (perlu perhatian)
- Tren stabil = Deaktivasi terkontrol

---

## 📱 Manajemen SIM Cards

### Overview Halaman SIM Cards

Halaman SIM Cards adalah inti dari aplikasi BKT-SimCare. Di sini Anda dapat:
- Melihat daftar semua SIM card
- Menambah SIM card baru
- Mengedit informasi SIM card
- Mengubah status SIM card
- Mencari dan filter SIM card
- Export data ke Excel

### Layout Halaman SIM Cards

```
┌─────────────────────────────────────────────────┐
│ SIM Cards Management                            │
├─────────────────────────────────────────────────┤
│ [🔍 Search ICCID/Phone] [📊 Status Filter ▼]  │
│ [+ Add SIM Card] [📥 Import Excel] [📤 Export] │
├─────────────────────────────────────────────────┤
│ Table:                                          │
│ │ ICCID │ Phone │ Provider │ Status │ Actions││
│ │ 8962... │ 0812... │ Telkomsel │ ACTIVE │ ✏️📄││
│ │ 8962... │ 0813... │ XL │ WAREHOUSE │ ✏️📄││
└─────────────────────────────────────────────────┘
```

---

### 🔍 Fitur Pencarian & Filter

#### 1. **Search Bar**

**Lokasi:** Top-left, sebelah kiri tombol filter

**Fungsi:**
- Mencari SIM card berdasarkan:
  - ICCID (nomor kartu SIM)
  - Phone Number (nomor telepon)
  - Provider name

**Cara Menggunakan:**
1. Klik pada search box
2. Ketik kata kunci (minimal 3 karakter)
3. Tekan Enter atau tunggu 1 detik
4. Tabel otomatis filter hasil pencarian

**Contoh:**
- Ketik `"0812"` → Mencari semua SIM dengan nomor yang mengandung 0812
- Ketik `"Telkomsel"` → Mencari semua SIM dari provider Telkomsel
- Ketik `"8962"` → Mencari SIM dengan ICCID yang mengandung 8962

**Tips:**
- Pencarian tidak case-sensitive
- Bisa mencari partial match (sebagian teks)
- Untuk clear search, hapus semua teks di search box

#### 2. **Status Filter**

**Lokasi:** Top-right, dropdown menu

**Fungsi:**
- Filter SIM card berdasarkan status lifecycle
- Menampilkan jumlah SIM di setiap status

**Pilihan Status:**

**All Status (Default)**
- Menampilkan semua SIM card tanpa filter
- Contoh: `All Status (200)` → 200 total SIM cards

**WAREHOUSE**
- SIM card baru yang ada di gudang, belum diaktivasi
- Contoh: `WAREHOUSE (31)` → 31 SIM di warehouse

**ACTIVATED**
- SIM card yang sudah diaktivasi tapi belum terinstall (Ghost SIM)
- Contoh: `ACTIVATED (15)` → 15 Ghost SIM cards

**INSTALLED**
- SIM card yang sudah terinstall di device
- Contoh: `INSTALLED (120)` → 120 SIM terinstall

**BILLING**
- SIM card dalam status billing normal
- Contoh: `BILLING (18)` → 18 SIM dalam billing

**GRACE_PERIOD**
- SIM card dalam masa tenggang 30 hari setelah billing
- Contoh: `GRACE_PERIOD (8)` → 8 SIM dalam grace period

**DEACTIVATED**
- SIM card yang sudah dinonaktifkan
- Contoh: `DEACTIVATED (26)` → 26 SIM deactivated

**Cara Menggunakan:**
1. Klik dropdown "Status Filter"
2. Pilih status yang ingin ditampilkan
3. Tabel otomatis update dengan filter yang dipilih
4. Untuk melihat semua, pilih "All Status"

---

### ➕ Menambah SIM Card Baru

#### Step-by-Step: Tambah SIM Card

**Step 1: Buka Form Tambah SIM Card**
1. Klik tombol **"+ Add SIM Card"** (warna hijau) di kanan atas
2. Dialog form akan muncul

**Step 2: Isi Data Wajib**

```
┌─────────────────────────────────────┐
│ Add New SIM Card                    │
├─────────────────────────────────────┤
│ ICCID Number *                      │
│ [____________________________]      │
│                                     │
│ Phone Number *                      │
│ [____________________________]      │
│                                     │
│ Provider *                          │
│ [Select Provider ▼]                 │
│                                     │
│ Status *                            │
│ [WAREHOUSE ▼]                       │
└─────────────────────────────────────┘
```

**Field Wajib:**

**1. ICCID Number**
- **Format:** 19-20 digit angka
- **Contoh:** `8962090212345678901`
- **Validasi:** 
  - Harus 19-20 karakter
  - Hanya angka
  - Tidak boleh duplikat dengan ICCID yang sudah ada

**2. Phone Number**
- **Format:** 10-15 digit
- **Contoh:** `081234567890`
- **Validasi:**
  - Harus 10-15 karakter
  - Hanya angka
  - Tidak boleh duplikat dengan phone number yang sudah ada

**3. Provider**
- **Pilihan:** Dropdown list provider yang tersedia
- **Contoh:** Telkomsel, Indosat, XL, Tri, Smartfren
- **Cara Pilih:** Klik dropdown, pilih provider dari list

**4. Status**
- **Default:** WAREHOUSE (untuk SIM baru)
- **Pilihan:** 
  - WAREHOUSE (stok gudang)
  - ACTIVATED (sudah aktif tapi belum install)
  - INSTALLED (sudah terinstall)
  - BILLING (dalam billing cycle)
  - GRACE_PERIOD (masa tenggang)
  - DEACTIVATED (nonaktif)

**Step 3: Isi Data Opsional (Jika Status ACTIVATED/INSTALLED)**

**Jika Status = ACTIVATED atau INSTALLED:**

```
┌─────────────────────────────────────┐
│ Activation Date                     │
│ [2026-01-12] ▼                      │
│                                     │
│ Current IMEI                        │
│ [____________________________]      │
└─────────────────────────────────────┘
```

**Activation Date:**
- **Default:** Hari ini (WIB timezone)
- **Format:** YYYY-MM-DD
- **Cara Pilih:** Klik untuk buka calendar picker

**Current IMEI:**
- **Format:** 15 digit angka
- **Contoh:** `123456789012345`
- **Validasi:** 
  - Harus 15 karakter
  - Hanya angka
  - **CRITICAL:** Satu IMEI hanya bisa digunakan oleh satu SIM aktif
  - Error jika IMEI sudah digunakan: `"IMEI ini sudah terikat dengan kartu aktif lain!"`

**Jika Status = INSTALLED:**

```
┌─────────────────────────────────────┐
│ Installation Date                   │
│ [2026-01-12] ▼                      │
└─────────────────────────────────────┘
```

**Installation Date:**
- **Default:** Hari ini (WIB timezone)
- **Format:** YYYY-MM-DD
- **Cara Pilih:** Klik untuk buka calendar picker

**Jika Status = BILLING:**

```
┌─────────────────────────────────────┐
│ Billing Cycle Day                   │
│ [1-31] ▼                            │
│                                     │
│ Monthly Bill Amount                 │
│ [____________________________]      │
└─────────────────────────────────────┘
```

**Billing Cycle Day:**
- **Range:** 1-31 (tanggal billing setiap bulan)
- **Contoh:** `15` (billing tanggal 15 setiap bulan)
- **Default:** 1

**Monthly Bill Amount:**
- **Format:** Angka (Rupiah)
- **Contoh:** `150000` (Rp 150.000)
- **Validasi:** Harus angka positif

**Jika Status = GRACE_PERIOD:**

```
┌─────────────────────────────────────┐
│ Grace Period Start                  │
│ [2026-01-12] ▼                      │
└─────────────────────────────────────┘
```

**Grace Period Start:**
- **Format:** YYYY-MM-DD
- **Fungsi:** Tanggal mulai grace period (30 hari)
- **Default:** Hari ini

**Jika Status = DEACTIVATED:**

```
┌─────────────────────────────────────┐
│ Deactivation Date                   │
│ [2026-01-12] ▼                      │
│                                     │
│ Deactivation Reason                 │
│ [____________________________]      │
└─────────────────────────────────────┘
```

**Deactivation Date:**
- **Format:** YYYY-MM-DD
- **Default:** Hari ini

**Deactivation Reason:**
- **Format:** Text (optional)
- **Contoh:** "Lost SIM", "Customer request", "Expired contract"

**Step 4: Simpan Data**
1. Review semua data yang diisi
2. Klik tombol **"Add SIM Card"** (hijau) di bawah form
3. Tunggu konfirmasi sukses
4. Dialog otomatis close
5. SIM card baru muncul di tabel

**Step 5: Verifikasi**
1. Cek tabel SIM Cards
2. SIM card baru ada di urutan teratas (sorted by newest)
3. Verifikasi semua data sesuai

---

### ✏️ Mengedit SIM Card

#### Step-by-Step: Edit SIM Card

**Step 1: Buka Form Edit**
1. Locate SIM card yang ingin diedit di tabel
2. Klik icon **✏️ Edit** (pensil) di kolom Actions
3. Dialog form edit akan muncul dengan data existing

**Step 2: Form Edit**

```
┌─────────────────────────────────────┐
│ Edit SIM Card                       │
├─────────────────────────────────────┤
│ ICCID: 8962090212345678901 (Read-only)│
│                                     │
│ Phone Number *                      │
│ [081234567890]                      │
│                                     │
│ Provider *                          │
│ [Telkomsel ▼]                       │
│                                     │
│ Status *                            │
│ [INSTALLED ▼]                       │
│                                     │
│ Current IMEI                        │
│ [123456789012345]                   │
│                                     │
│ ... (fields lain sesuai status)    │
└─────────────────────────────────────┘
```

**Field yang Bisa Diedit:**
- ✅ Phone Number
- ✅ Provider
- ✅ Status
- ✅ Current IMEI
- ✅ Activation Date
- ✅ Installation Date
- ✅ Billing Cycle Day
- ✅ Monthly Bill Amount
- ✅ Grace Period Start
- ✅ Deactivation Date
- ✅ Deactivation Reason
- ❌ ICCID (Read-only, tidak bisa diedit)

**Step 3: Ubah Data**
1. Edit field yang ingin diubah
2. Jika mengubah Status:
   - Form akan update menampilkan field yang relevan
   - Contoh: Ubah ke BILLING → field billing cycle muncul

**Step 4: Simpan Perubahan**
1. Review perubahan yang dibuat
2. Klik tombol **"Update SIM Card"** (hijau)
3. Tunggu konfirmasi sukses
4. Dialog otomatis close
5. Data terupdate di tabel

**Step 5: Verifikasi**
1. Cek tabel SIM Cards
2. Pastikan perubahan tersimpan
3. Status card di dashboard ikut terupdate

---

### 🔄 Mengubah Status SIM Card

#### Lifecycle Status SIM Card

```
┌──────────────┐
│  WAREHOUSE   │ (Stok gudang, belum aktif)
└──────┬───────┘
       ↓
┌──────────────┐
│  ACTIVATED   │ (Aktif, belum install - Ghost SIM)
└──────┬───────┘
       ↓
┌──────────────┐
│  INSTALLED   │ (Terinstall di device)
└──────┬───────┘
       ↓
┌──────────────┐
│   BILLING    │ (Dalam billing cycle)
└──────┬───────┘
       ↓
┌──────────────┐
│GRACE_PERIOD  │ (Masa tenggang 30 hari)
└──────┬───────┘
       ↓
┌──────────────┐
│ DEACTIVATED  │ (Nonaktif)
└──────────────┘
```

#### Panduan Perubahan Status

**1. WAREHOUSE → ACTIVATED**

**Kapan:** Saat SIM card diaktivasi provider

**Field Required:**
- ✅ Activation Date (default: today)
- ✅ Current IMEI (15 digit)

**Validasi:**
- IMEI tidak boleh duplikat dengan SIM aktif lain
- Error: `"IMEI ini sudah terikat dengan kartu aktif lain!"`

**Langkah:**
1. Edit SIM card
2. Ubah Status ke ACTIVATED
3. Isi Activation Date (default today)
4. Isi Current IMEI (15 digit)
5. Save

**Hasil:**
- Status berubah ke ACTIVATED
- Masuk kategori "Ghost SIM Card" (activated tapi belum install)

---

**2. ACTIVATED → INSTALLED**

**Kapan:** Saat SIM card diinstall ke device

**Field Required:**
- ✅ Installation Date (default: today)
- ✅ Current IMEI (harus sudah ada dari step sebelumnya)

**Langkah:**
1. Edit SIM card
2. Ubah Status ke INSTALLED
3. Isi Installation Date (default today)
4. Pastikan IMEI masih ada (dari step ACTIVATED)
5. Save

**Hasil:**
- Status berubah ke INSTALLED
- Keluar dari kategori "Ghost SIM Card"
- Masuk kategori "Installed SIM"

---

**3. INSTALLED → BILLING**

**Kapan:** Saat mulai billing cycle

**Field Required:**
- ✅ Billing Cycle Day (1-31)
- ✅ Monthly Bill Amount (Rupiah)

**Langkah:**
1. Edit SIM card
2. Ubah Status ke BILLING
3. Isi Billing Cycle Day (contoh: 15 = billing tanggal 15)
4. Isi Monthly Bill Amount (contoh: 150000 = Rp 150.000)
5. Save

**Hasil:**
- Status berubah ke BILLING
- Sistem mulai track billing cycle

---

**4. BILLING → GRACE_PERIOD**

**Kapan:** 30 hari setelah billing jika pembayaran terlambat

**Field Required:**
- ✅ Grace Period Start (default: today)

**Langkah:**
1. Edit SIM card
2. Ubah Status ke GRACE_PERIOD
3. Isi Grace Period Start (default today)
4. Save

**Hasil:**
- Status berubah ke GRACE_PERIOD
- Masuk kategori "Grace Period"
- User punya 30 hari untuk membayar sebelum deactivated

---

**5. ANY_STATUS → DEACTIVATED**

**Kapan:** Saat SIM card dinonaktifkan

**Field Required:**
- ✅ Deactivation Date (default: today)
- ⭕ Deactivation Reason (optional, tapi recommended)

**Langkah:**
1. Edit SIM card
2. Ubah Status ke DEACTIVATED
3. Isi Deactivation Date (default today)
4. Isi Deactivation Reason (contoh: "Lost SIM", "Customer request")
5. Save

**Hasil:**
- Status berubah ke DEACTIVATED
- Current IMEI di-clear (bisa digunakan SIM lain)
- Masuk kategori "Deactivated"
- SIM tidak bisa diaktifkan lagi (permanent)

---

### 📄 Melihat Detail SIM Card

#### Step-by-Step: Lihat Detail

**Step 1: Buka Detail Page**
1. Locate SIM card di tabel
2. Klik icon **📄 View** (document) di kolom Actions
3. Halaman detail SIM card terbuka

**Step 2: Halaman Detail SIM Card**

```
┌─────────────────────────────────────────────┐
│ SIM Card Details                            │
│ ICCID: 8962090212345678901                  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Basic Information                       │ │
│ ├─────────────────────────────────────────┤ │
│ │ ICCID: 8962090212345678901              │ │
│ │ Phone Number: 081234567890              │ │
│ │ Provider: Telkomsel                     │ │
│ │ Status: 🟢 INSTALLED                    │ │
│ │ Current IMEI: 123456789012345           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Date Information                        │ │
│ ├─────────────────────────────────────────┤ │
│ │ Created: 15 Des 2025                    │ │
│ │ Activated: 20 Des 2025                  │ │
│ │ Installed: 22 Des 2025                  │ │
│ │ Last Updated: 12 Jan 2026, 12:44        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Billing Information                     │ │
│ ├─────────────────────────────────────────┤ │
│ │ Billing Cycle: Day 15 of each month    │ │
│ │ Monthly Amount: Rp 150.000              │ │
│ │ Next Billing: 15 Feb 2026               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Associated Device                       │ │
│ ├─────────────────────────────────────────┤ │
│ │ Device IMEI: 123456789012345            │ │
│ │ Device Type: Router 4G                  │ │
│ │ Location: Jakarta Office - 3rd Floor    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Customer Information                    │ │
│ ├─────────────────────────────────────────┤ │
│ │ Customer: PT. Contoh Indonesia          │ │
│ │ Contact: Budi Santoso                   │ │
│ │ Phone: 081234567890                     │ │
│ │ Address: Jl. Sudirman No. 123, Jakarta  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [← Back to List] [✏️ Edit SIM Card]        │
└─────────────────────────────────────────────┘
```

**Informasi yang Ditampilkan:**

**1. Basic Information**
- ICCID Number
- Phone Number
- Provider Name
- Current Status (dengan color indicator)
- Current IMEI (jika ada)

**2. Date Information**
- Created Date (tanggal dibuat di sistem)
- Activation Date (jika sudah activated)
- Installation Date (jika sudah installed)
- Last Updated (terakhir diubah)

**3. Billing Information** (jika status BILLING/GRACE_PERIOD)
- Billing Cycle Day
- Monthly Bill Amount
- Next Billing Date (calculated)
- Grace Period Status (jika applicable)

**4. Associated Device** (jika sudah terinstall)
- Device IMEI
- Device Type
- Device Location
- Link ke device detail page

**5. Customer Information** (jika sudah ada customer)
- Customer Name
- Contact Person
- Phone Number
- Address
- Link ke customer detail page

**Step 3: Aksi dari Detail Page**

**Tombol "Back to List"**
- Kembali ke halaman SIM Cards list

**Tombol "Edit SIM Card"**
- Langsung membuka form edit untuk SIM card ini
- Sama dengan klik icon Edit di list

---

### 📥 Import Data dari Excel

#### Overview Import Excel

Fitur import Excel memungkinkan Anda menambahkan multiple SIM cards sekaligus dari file Excel (.xlsx atau .xls).

**Keuntungan:**
- ⚡ Cepat: Import puluhan/ratusan SIM sekaligus
- ✅ Validasi: Sistem otomatis validasi setiap baris
- 📊 Report: Dapat summary berapa yang berhasil/gagal

#### Step-by-Step: Import Excel

**Step 1: Siapkan File Excel**

**Download Template:**
1. Klik tombol **"📥 Import Excel"** di halaman SIM Cards
2. Klik **"Download Template"** di dialog
3. File `sim_card_template.xlsx` akan terdownload

**Template Format:**

```
| ICCID              | Phone Number | Provider   | Status     | Current IMEI    | Activation Date | Installation Date | Billing Cycle Day | Monthly Bill Amount |
|--------------------|--------------|------------|------------|-----------------|-----------------|-------------------|-------------------|---------------------|
| 8962090212345678901| 081234567890 | Telkomsel  | WAREHOUSE  |                 |                 |                   |                   |                     |
| 8962090212345678902| 081234567891 | Indosat    | ACTIVATED  | 123456789012345 | 2026-01-10      |                   |                   |                     |
| 8962090212345678903| 081234567892 | XL         | INSTALLED  | 123456789012346 | 2026-01-08      | 2026-01-10        |                   |                     |
```

**Required Columns:**
- ✅ ICCID (19-20 digits)
- ✅ Phone Number (10-15 digits)
- ✅ Provider
- ✅ Status

**Optional Columns (tergantung Status):**
- Current IMEI (15 digits, required untuk ACTIVATED/INSTALLED)
- Activation Date (format: YYYY-MM-DD)
- Installation Date (format: YYYY-MM-DD)
- Billing Cycle Day (1-31, untuk BILLING)
- Monthly Bill Amount (number, untuk BILLING)

**Step 2: Isi Data di Excel**

**Guidelines:**
1. Jangan ubah header columns
2. Isi data mulai baris ke-2
3. ICCID harus unique (tidak boleh duplikat)
4. Phone Number harus unique (tidak boleh duplikat)
5. Status harus salah satu dari: WAREHOUSE, ACTIVATED, INSTALLED, BILLING, GRACE_PERIOD, DEACTIVATED
6. Current IMEI harus 15 digit (jika diisi)
7. Date format: YYYY-MM-DD (contoh: 2026-01-12)

**Contoh Data Valid:**

```excel
ICCID: 8962090212345678901
Phone: 081234567890
Provider: Telkomsel
Status: WAREHOUSE
✅ Valid - Semua field required ada
```

```excel
ICCID: 8962090212345678902
Phone: 081234567891
Provider: Indosat
Status: ACTIVATED
Current IMEI: 123456789012345
Activation Date: 2026-01-10
✅ Valid - ACTIVATED dengan IMEI dan activation date
```

```excel
ICCID: 8962090212345678903
Phone: 081234567892
Provider: XL
Status: INSTALLED
Current IMEI: 123456789012346
Activation Date: 2026-01-08
Installation Date: 2026-01-10
✅ Valid - INSTALLED dengan semua date
```

**Contoh Data INVALID:**

```excel
ICCID: 896209021234 (❌ too short)
Phone: 081234567890
Status: WAREHOUSE
```

```excel
ICCID: 8962090212345678901
Phone: 0812345 (❌ too short)
Status: WAREHOUSE
```

```excel
ICCID: 8962090212345678901
Phone: 081234567890
Status: ACTIVATED
(❌ missing Current IMEI for ACTIVATED status)
```

```excel
ICCID: 8962090212345678901
Phone: 081234567890
Status: WAREHOUSE
(❌ WAREHOUSE status tidak boleh punya IMEI)
```

**Step 3: Upload File**

1. Klik tombol **"📥 Import Excel"**
2. Dialog import muncul
3. Klik **"Choose File"** atau drag-drop file ke area upload
4. Pilih file Excel yang sudah diisi
5. File akan otomatis di-validate

**Step 4: Review Preview**

```
┌─────────────────────────────────────────┐
│ Import Preview                          │
├─────────────────────────────────────────┤
│ File: sim_cards_import.xlsx             │
│ Total Rows: 150                         │
│                                         │
│ ✅ Valid Rows: 145                      │
│ ❌ Invalid Rows: 5                      │
│                                         │
│ Invalid Rows Details:                   │
│ Row 23: ICCID too short (14 chars)     │
│ Row 45: Phone duplicate with existing  │
│ Row 67: IMEI duplicate with row 34     │
│ Row 89: Missing Current IMEI (ACTIVATED)│
│ Row 102: Invalid Status "ACTIVE"       │
└─────────────────────────────────────────┘
```

**Preview Information:**
- Total rows found
- Valid rows count (akan di-import)
- Invalid rows count (akan di-skip)
- Detail error per invalid row

**Step 5: Confirm Import**

**Jika Ada Invalid Rows:**
- Option 1: Cancel dan fix Excel file
- Option 2: Continue import (hanya valid rows yang akan di-import)

**Jika Semua Valid:**
- Klik tombol **"Import [N] SIM Cards"**
- Tunggu proses import (loading indicator)

**Step 6: Review Results**

```
┌─────────────────────────────────────────┐
│ Import Complete! ✅                     │
├─────────────────────────────────────────┤
│ Successfully Imported: 145 SIM cards    │
│ Failed: 5 rows (see details below)     │
│                                         │
│ Failed Rows:                            │
│ Row 23: ICCID validation failed        │
│ Row 45: Phone number duplicate         │
│ Row 67: IMEI already in use            │
│ Row 89: Missing required field         │
│ Row 102: Invalid status value          │
│                                         │
│ [📄 Download Error Report]              │
│ [✅ Done]                               │
└─────────────────────────────────────────┘
```

**Success Summary:**
- Number of successful imports
- Number of failed rows
- Detail error messages
- Option to download error report (Excel)

**Step 7: Verify Import**

1. Close import dialog
2. Refresh SIM Cards list
3. Verify imported SIM cards appear in table
4. Check dashboard stats updated

---

### 📤 Export Data ke Excel

#### Step-by-Step: Export Excel

**Step 1: Pilih Data untuk Export**

**Option 1: Export Semua Data**
1. Jangan filter/search apa-apa
2. Klik tombol **"📤 Export"**
3. Semua SIM cards akan di-export

**Option 2: Export Filtered Data**
1. Apply filter status (contoh: hanya INSTALLED)
2. Atau gunakan search (contoh: cari "Telkomsel")
3. Klik tombol **"📤 Export"**
4. Hanya data yang terfilter yang akan di-export

**Step 2: Klik Export**
1. Klik tombol **"📤 Export"** (hijau)
2. File akan otomatis generate dan download
3. Filename: `sim_cards_YYYYMMDD_HHMMSS.xlsx`
4. Contoh: `sim_cards_20260112_124417.xlsx`

**Step 3: Buka File Excel**

**Excel Structure:**

```
Sheet: SIM Cards Export

┌──────────────────────────────────────────────────────┐
│ BKT-SimCare SIM Cards Export                         │
│ Export Date: 12 Januari 2026, 12:44 WIB             │
│ Total Records: 145                                   │
└──────────────────────────────────────────────────────┘

| No | ICCID              | Phone        | Provider  | Status     | IMEI            | Created     | Activated   | Installed   | Billing Cycle | Monthly Bill |
|----|--------------------|--------------|-----------|------------
|-----------------|-------------|-------------|-------------|---------------|--------------|
| 1  | 8962090212345678901| 081234567890 | Telkomsel | INSTALLED | 123456789012345 | 15 Des 2025 | 20 Des 2025 | 22 Des 2025 | 15            | Rp 150.000   |
| 2  | 8962090212345678902| 081234567891 | Indosat   | ACTIVATED | 123456789012346 | 16 Des 2025 | 21 Des 2025 | -           | -             | -            |
| 3  | 8962090212345678903| 081234567892 | XL        | WAREHOUSE | -               | 18 Des 2025 | -           | -           | -             | -            |
...
```

**Export Columns:**
1. No (row number)
2. ICCID
3. Phone Number
4. Provider
5. Status
6. Current IMEI (jika ada)
7. Created Date
8. Activation Date (jika ada)
9. Installation Date (jika ada)
10. Billing Cycle Day (jika applicable)
11. Monthly Bill Amount (jika applicable)

**Export Features:**
- ✅ Header dengan metadata (export date, total records)
- ✅ Formatted dates (Indonesian format)
- ✅ Formatted currency (Rupiah)
- ✅ Auto-width columns
- ✅ Professional styling

**Step 4: Gunakan Data**

**Use Cases:**
- 📊 Analysis di Excel (pivot table, charts)
- 📧 Share dengan team via email
- 💾 Backup data offline
- 📈 Import ke sistem lain
- 📝 Print untuk reporting

---

## 🖥️ Manajemen Devices

### Overview Halaman Devices

Halaman Devices mengelola perangkat hardware yang menggunakan SIM cards (router, modem, GPS tracker, dll).

### Layout Halaman Devices

```
┌─────────────────────────────────────────────────┐
│ Device Management                               │
├─────────────────────────────────────────────────┤
│ [🔍 Search IMEI/Type] [+ Add Device]           │
├─────────────────────────────────────────────────┤
│ Table:                                          │
│ │ IMEI │ Type │ Location │ SIM Card │ Actions│ │
│ │ 1234... │ Router │ Jakarta │ 0812... │ ✏️📄│ │
└─────────────────────────────────────────────────┘
```

**Coming Soon:**
- Device registration
- Device tracking
- SIM-Device association
- Location management
- Status monitoring

---

## 👥 Manajemen Customers

### Overview Halaman Customers

Halaman Customers mengelola data pelanggan/klien yang menggunakan SIM cards.

### Layout Halaman Customers

```
┌─────────────────────────────────────────────────┐
│ Customer Management                             │
├─────────────────────────────────────────────────┤
│ [🔍 Search Name/Email] [+ Add Customer]        │
├─────────────────────────────────────────────────┤
│ Table:                                          │
│ │ Name │ Email │ Phone │ Total SIMs │ Actions││
│ │ PT ABC │ info@abc │ 021... │ 25 │ ✏️📄│    │
└─────────────────────────────────────────────────┘
```

**Coming Soon:**
- Customer registration
- Contact management
- SIM allocation per customer
- Customer billing
- Contract management

---

## 📜 History & Audit Trail

### Overview Halaman History

Halaman History mencatat semua perubahan yang terjadi di sistem untuk audit trail.

### Layout Halaman History

```
┌─────────────────────────────────────────────────┐
│ System History & Audit Trail                    │
├─────────────────────────────────────────────────┤
│ [📅 Date Filter] [🔍 Search]                   │
├─────────────────────────────────────────────────┤
│ Timeline:                                       │
│ 12 Jan 2026, 12:44                              │
│ ├─ SIM 0812... status changed                   │
│ │  FROM: ACTIVATED → TO: INSTALLED              │
│ │  By: System / User ID: admin@bkt.com          │
│ │                                               │
│ 12 Jan 2026, 11:30                              │
│ ├─ New SIM added                                │
│ │  ICCID: 8962090212345678901                   │
│ │  By: admin@bkt.com                            │
└─────────────────────────────────────────────────┘
```

**Features:**
- 📅 Date range filter
- 🔍 Search by ICCID/phone/user
- 📊 Export audit trail
- 🕐 Timezone: WIB (UTC+7)

**Coming Soon:**
- Full audit trail implementation
- User action tracking
- Change history per SIM
- Rollback functionality

---

## 📈 Executive Summary & Reports

### Overview Halaman Executive Summary

Halaman Executive Summary menyediakan laporan komprehensif untuk manajemen dengan visualisasi data yang lebih detail.

### Layout Halaman Executive Summary

```
┌─────────────────────────────────────────────────┐
│ Executive Summary                               │
│ [📅 01 Dec 2025 - 31 Dec 2025] [🔄 Apply]     │
├─────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┐   │
│ │ Total Cards │ Active Rate │ Deactivated │   │
│ │    200      │    85%      │     15      │   │
│ └─────────────┴─────────────┴─────────────┘   │
│                                                 │
│ ┌───────────────────────────────────────────┐ │
│ │ [Bar Chart: Status Breakdown]             │ │
│ │ WAREHOUSE: ████████ 31                    │ │
│ │ ACTIVATED: ████ 15                        │ │
│ │ INSTALLED: ████████████████ 120           │ │
│ │ BILLING:   █████ 18                       │ │
│ │ GRACE:     ██ 8                           │ │
│ │ DEACTIVATED: ████ 26                      │ │
│ └───────────────────────────────────────────┘ │
│                                                 │
│ ┌───────────────────────────────────────────┐ │
│ │ [Line Chart: Monthly Trend]               │ │
│ │ Shows SIM activation/deactivation trends  │ │
│ └───────────────────────────────────────────┘ │
│                                                 │
│ [📤 Export PDF] [📊 Export Excel]             │
└─────────────────────────────────────────────────┘
```

### Fitur Executive Summary

#### 1. **Date Range Filter**

**Default:** Last 30 days

**Cara Gunakan:**
1. Klik Start Date input
2. Pilih tanggal mulai
3. Klik End Date input
4. Pilih tanggal akhir
5. Klik tombol **"Apply"**
6. Semua charts dan stats update sesuai range

#### 2. **Summary Cards**

**Total Cards**
- Total SIM cards dalam date range
- Contoh: 200 cards

**Active Rate**
- Persentase SIM yang aktif (bukan DEACTIVATED)
- Formula: (Active Cards / Total Cards) × 100%
- Contoh: 85% (170 dari 200 cards)

**Deactivated**
- Jumlah SIM yang deactivated dalam range
- Contoh: 15 cards deactivated

#### 3. **Status Breakdown Chart**

**Bar Chart - Horizontal**
- Menampilkan jumlah SIM per status
- Sorted by count (descending)
- Color-coded:
  - WAREHOUSE: Orange
  - ACTIVATED: Purple
  - INSTALLED: Green
  - BILLING: Blue
  - GRACE_PERIOD: Yellow
  - DEACTIVATED: Red

**Insights:**
- Status dengan bar terpanjang = paling banyak
- Compare proporsi antar status
- Identify status yang perlu attention (contoh: banyak grace period)

#### 4. **Monthly Trend Chart**

**Line Chart - Dual Lines**
- Line 1: SIM Activations per month (Blue)
- Line 2: SIM Deactivations per month (Red)

**Insights:**
- Trend naik activations = good growth
- Trend naik deactivations = perlu investigasi
- Gap besar antara activations & deactivations = growth rate

#### 5. **Provider Breakdown** (Coming Soon)

**Pie Chart**
- Proporsi SIM per provider
- Contoh: Telkomsel 45%, Indosat 30%, XL 25%

#### 6. **Export Reports**

**Export PDF:**
1. Klik **"📤 Export PDF"**
2. PDF report generated dengan:
   - Executive summary
   - All charts and stats
   - Date range metadata
   - Professional formatting

**Export Excel:**
1. Klik **"📊 Export Excel"**
2. Excel workbook dengan multiple sheets:
   - Sheet 1: Summary data
   - Sheet 2: Detailed SIM list
   - Sheet 3: Charts data

---

## 🧮 **EXECUTIVE SUMMARY - LOGIC & PERHITUNGAN DETAIL**

### **Overview Komponen Executive Summary**

Executive Summary page terdiri dari beberapa komponen analisis utama yang memberikan insight mendalam tentang status SIM cards di sistem. Berikut adalah penjelasan lengkap setiap komponen.

---

### **1️⃣ KEY PERFORMANCE INDICATORS (KPIs)**

#### **A. Total Cards**

**Fungsi:**
- Menampilkan total keseluruhan SIM cards yang ada di sistem dalam periode yang dipilih

**Logic & Perhitungan:**
```typescript
// Formula
Total Cards = COUNT(sim_cards WHERE created_at BETWEEN startDate AND endDate)

// Contoh Implementasi
const totalCards = simCards.filter(sim => {
  const createdDate = new Date(sim.created_at);
  return createdDate >= new Date(startDate) && createdDate <= new Date(endDate);
}).length;
```

**Contoh Konkret:**
```
Periode: 01 Dec 2025 - 31 Dec 2025

Data:
- SIM A: created_at = "2025-12-05" ✅ (dalam periode)
- SIM B: created_at = "2025-12-15" ✅ (dalam periode)
- SIM C: created_at = "2025-11-20" ❌ (di luar periode)
- SIM D: created_at = "2025-12-28" ✅ (dalam periode)

Result: Total Cards = 3
```

**Interpretasi:**
- **Tinggi (>100)**: High volume SIM card inventory
- **Sedang (50-100)**: Moderate inventory level
- **Rendah (<50)**: Low inventory, mungkin perlu restock

---

#### **B. Active Rate**

**Fungsi:**
- Menghitung persentase SIM cards yang aktif (tidak DEACTIVATED) dibandingkan total

**Logic & Perhitungan:**
```typescript
// Formula
Active Cards = COUNT(sim_cards WHERE status != 'DEACTIVATED')
Total Cards = COUNT(all sim_cards)
Active Rate = (Active Cards / Total Cards) × 100%

// Contoh Implementasi
const activeCards = simCards.filter(sim => sim.status !== "DEACTIVATED").length;
const totalCards = simCards.length;
const activeRate = totalCards > 0 
  ? Math.round((activeCards / totalCards) * 100) 
  : 0;
```

**Contoh Konkret:**
```
Periode: 01 Dec 2025 - 31 Dec 2025

Data (200 SIM cards total):
- WAREHOUSE: 31 cards ✅ (aktif)
- ACTIVATED: 15 cards ✅ (aktif)
- INSTALLED: 120 cards ✅ (aktif)
- BILLING: 18 cards ✅ (aktif)
- GRACE_PERIOD: 8 cards ✅ (aktif)
- DEACTIVATED: 8 cards ❌ (tidak aktif)

Calculation:
Active Cards = 31 + 15 + 120 + 18 + 8 = 192
Total Cards = 200
Active Rate = (192 / 200) × 100% = 96%

Result: Active Rate = 96%
```

**Interpretasi:**
- **Sangat Baik (>90%)**: High utilization, minimal waste
- **Baik (80-90%)**: Good utilization, acceptable level
- **Perlu Perhatian (70-80%)**: Moderate utilization, investigate causes
- **Buruk (<70%)**: Low utilization, significant waste, action required

**Business Impact:**
```
Example:
- 200 SIM cards total
- 96% active rate = 192 active SIMs
- 4% inactive rate = 8 deactivated SIMs

If monthly cost per SIM = Rp 150,000
Deactivated SIM cost impact = 8 × Rp 150,000 = Rp 1,200,000/month (wasted)

Annual impact = Rp 1,200,000 × 12 = Rp 14,400,000/year
```

---

#### **C. Deactivated (dalam periode)**

**Fungsi:**
- Menghitung jumlah SIM cards yang di-deactivate dalam periode yang dipilih

**Logic & Perhitungan:**
```typescript
// Formula
Deactivated = COUNT(sim_cards WHERE 
  deactivation_date BETWEEN startDate AND endDate
)

// Contoh Implementasi
const deactivatedCards = simCards.filter(sim => {
  if (!sim.deactivation_date) return false;
  const deactivationDate = new Date(sim.deactivation_date);
  return deactivationDate >= new Date(startDate) && 
         deactivationDate <= new Date(endDate);
}).length;
```

**Contoh Konkret:**
```
Periode: 01 Dec 2025 - 31 Dec 2025

Data:
- SIM A: deactivation_date = "2025-12-05" ✅ (dalam periode)
- SIM B: deactivation_date = "2025-12-20" ✅ (dalam periode)
- SIM C: deactivation_date = "2025-11-25" ❌ (di luar periode)
- SIM D: deactivation_date = "2025-12-31" ✅ (dalam periode)
- SIM E: deactivation_date = null ❌ (tidak deactivated)

Result: Deactivated = 3
```

**Interpretasi & Trend Analysis:**
```
Monthly Deactivation Trend:
- Nov 2025: 2 deactivated (low, normal)
- Dec 2025: 3 deactivated (low, normal)
- Jan 2026: 12 deactivated (high, investigate!)

Red Flag Indicators:
- Sudden spike (>50% increase) = Problem indicator
- Consistent high rate = Systematic issue
- Pattern correlation = Identify root cause (provider, device, customer)
```

---

### **2️⃣ STATUS BREAKDOWN CHART**

**Fungsi:**
- Visualisasi distribusi SIM cards berdasarkan status lifecycle

**Logic & Perhitungan:**
```typescript
// Formula untuk setiap status
Status Count = COUNT(sim_cards WHERE status = [STATUS] AND 
  created_at <= endDate
)

// Data Structure
statusData = [
  { status: "WAREHOUSE", count: 31, color: "#f97316" },
  { status: "ACTIVATED", count: 15, color: "#a855f7" },
  { status: "INSTALLED", count: 120, color: "#22c55e" },
  { status: "BILLING", count: 18, color: "#3b82f6" },
  { status: "GRACE_PERIOD", count: 8, color: "#eab308" },
  { status: "DEACTIVATED", count: 8, color: "#ef4444" }
]
```

**Contoh Konkret:**
```
Total: 200 SIM Cards

Status Distribution:
┌──────────────┬───────┬─────────┬────────────────┐
│ Status       │ Count │ Percent │ Bar Visual     │
├──────────────┼───────┼─────────┼────────────────┤
│ INSTALLED    │ 120   │  60%    │ ████████████   │ ← Majority (Good!)
│ WAREHOUSE    │  31   │  15.5%  │ ███            │ ← Stock reserve
│ BILLING      │  18   │   9%    │ ██             │ ← Normal cycle
│ ACTIVATED    │  15   │  7.5%   │ ██             │ ← Ghost SIMs (Investigate)
│ GRACE_PERIOD │   8   │   4%    │ █              │ ← Payment warning
│ DEACTIVATED  │   8   │   4%    │ █              │ ← Terminated
└──────────────┴───────┴─────────┴────────────────┘
```

**Analisis Distribusi Ideal:**
```
IDEAL DISTRIBUTION (for healthy operation):
┌──────────────┬────────────┬────────┐
│ Status       │ Ideal %    │ Status │
├──────────────┼────────────┼────────┤
│ INSTALLED    │ 60-70%     │ ✅ OK  │ ← Productive SIMs
│ WAREHOUSE    │ 10-20%     │ ✅ OK  │ ← Buffer stock
│ BILLING      │ 5-15%      │ ✅ OK  │ ← Normal cycle
│ ACTIVATED    │ <5%        │ ⚠️ HIGH│ ← Ghost SIMs should be low
│ GRACE_PERIOD │ <5%        │ ✅ OK  │ ← Payment issues minimal
│ DEACTIVATED  │ <5%        │ ✅ OK  │ ← Churn rate acceptable
└──────────────┴────────────┴────────┘

RED FLAGS:
- ACTIVATED >10% = Too many Ghost SIMs (not installed)
- WAREHOUSE <5% = Stock too low, risk of shortage
- GRACE_PERIOD >10% = Payment collection issues
- DEACTIVATED >15% = High churn rate, investigate causes
```

**Business Insights:**
```
Example Analysis (from chart above):

✅ POSITIVES:
1. INSTALLED (60%): Good utilization, most SIMs productive
2. WAREHOUSE (15.5%): Healthy buffer stock
3. GRACE_PERIOD (4%): Low payment issues

⚠️ CONCERNS:
1. ACTIVATED (7.5% / 15 SIMs): Above ideal threshold
   → Action: Investigate why Ghost SIMs not installed
   → Possible causes: Installation delays, customer issues

💡 RECOMMENDATIONS:
1. Focus on installing the 15 Ghost SIMs (ACTIVATED)
2. Monitor GRACE_PERIOD closely (8 SIMs at risk)
3. Maintain WAREHOUSE stock at current level
4. Analyze reasons for 8 deactivated SIMs
```

---

### **3️⃣ MONTHLY TREND CHART**

**Fungsi:**
- Menampilkan trend aktivasi dan deaktivasi SIM cards per bulan dalam periode yang dipilih

**Logic & Perhitungan:**
```typescript
// Generate months in date range
const months = generateMonthsBetween(startDate, endDate);

// For each month, calculate:
monthlyData = months.map(month => {
  // Month boundaries (WIB timezone)
  const monthStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  
  // Count activations
  const activations = simCards.filter(sim => {
    const activationDate = new Date(sim.activation_date);
    return activationDate >= monthStart && activationDate <= monthEnd;
  }).length;
  
  // Count deactivations
  const deactivations = simCards.filter(sim => {
    const deactivationDate = new Date(sim.deactivation_date);
    return deactivationDate >= monthStart && deactivationDate <= monthEnd;
  }).length;
  
  return {
    month: monthName,
    activations: activations,
    deactivations: deactivations,
    netGrowth: activations - deactivations
  };
});
```

**Contoh Konkret:**
```
Periode: Aug 2025 - Jan 2026 (6 months)

Monthly Data:
┌──────────┬─────────────┬──────────────┬────────────┐
│ Month    │ Activations │ Deactivations│ Net Growth │
├──────────┼─────────────┼──────────────┼────────────┤
│ Agt 2025 │     25      │      5       │   +20      │ ✅ Good growth
│ Sep 2025 │     30      │      8       │   +22      │ ✅ Accelerating
│ Okt 2025 │     28      │      6       │   +22      │ ✅ Stable growth
│ Nov 2025 │     32      │     10       │   +22      │ ✅ Strong growth
│ Des 2025 │     35      │     12       │   +23      │ ✅ Peak season
│ Jan 2026 │     20      │     15       │   +5       │ ⚠️ Slowing down
└──────────┴─────────────┴──────────────┴────────────┘

Total: 170 activations, 56 deactivations, +114 net growth
```

**Visual Representation:**
```
Line Chart Visualization:

35│                                    ●  Activations (Blue)
30│              ●─────●─────●────────●
25│        ●────┘                        
20│                                 ●
15│                                       ●  Deactivations (Red)
10│                    ●────────────●────┘
 5│  ●────●────●──────┘
 0└─────┴─────┴─────┴─────┴─────┴─────
   Aug  Sep  Okt  Nov  Des  Jan

Key Insights from chart:
1. Activation trend: Upward until Dec, dip in Jan
2. Deactivation trend: Gradually increasing
3. Gap widening Sep-Dec = Strong growth period
4. Gap narrowing in Jan = Warning sign
```

**Trend Analysis & Interpretation:**
```
HEALTHY TRENDS:
✅ Activations > Deactivations consistently
✅ Stable or increasing activation rate
✅ Low and stable deactivation rate
✅ Widening gap between lines = Growth acceleration

WARNING SIGNS:
⚠️ Activations declining month-over-month
⚠️ Deactivations increasing significantly
⚠️ Gap narrowing = Growth slowing
⚠️ Lines crossing = Net negative growth

RED FLAGS:
🚨 Activations < Deactivations = Shrinking inventory
🚨 Sharp activation drop (>30%) = Market/operational issue
🚨 Sharp deactivation spike (>50%) = Service quality issue
🚨 Consistent net negative = Business crisis
```

**Business Actions Based on Trends:**
```
SCENARIO 1: High Activations + Low Deactivations (Aug-Dec)
├─ Status: ✅ Healthy growth
├─ Action: Maintain current strategy
└─ Monitor: Stock levels to ensure supply

SCENARIO 2: Declining Activations (Jan)
├─ Status: ⚠️ Slowing growth
├─ Action: Investigate causes
│   ├─ Seasonal effect?
│   ├─ Marketing campaign ended?
│   ├─ Competition increased?
│   └─ Stock shortage?
└─ Response: Boost marketing, check inventory

SCENARIO 3: Increasing Deactivations (Jan)
├─ Status: ⚠️ Higher churn
├─ Action: Analyze deactivation reasons
│   ├─ Service quality issues?
│   ├─ Pricing concerns?
│   ├─ Technical problems?
│   └─ Customer satisfaction?
└─ Response: Improve service, customer retention program

SCENARIO 4: Lines Crossing (hypothetical)
├─ Status: 🚨 Critical - Net negative growth
├─ Action: Emergency response
│   ├─ Executive review meeting
│   ├─ Deep-dive analysis
│   ├─ Immediate corrective actions
│   └─ Customer feedback collection
└─ Response: Strategic pivot, service improvement
```

---

### **4️⃣ DATE RANGE FILTER**

**Fungsi:**
- Memfilter semua data dan chart berdasarkan periode waktu yang dipilih

**Logic & Perhitungan:**
```typescript
// Default: Last 30 days from today (WIB timezone)
const today = getTodayWIB();
const defaultStartDate = new Date(today);
defaultStartDate.setDate(defaultStartDate.getDate() - 30);

// User can select custom range
const [startDate, setStartDate] = useState(defaultStartDate.toISOString().split("T")[0]);
const [endDate, setEndDate] = useState(today);

// All calculations filter by this range
const filteredData = allData.filter(item => {
  const itemDate = new Date(item.created_at);
  return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
});
```

**Contoh Skenario:**
```
SKENARIO A: Last 7 Days Analysis
┌────────────────────────────────┐
│ Start: 2026-01-05              │
│ End:   2026-01-12              │
└────────────────────────────────┘

Use Case: Daily operations monitoring
Result: Shows recent activity, quick pulse check

SKENARIO B: Monthly Report (Dec 2025)
┌────────────────────────────────┐
│ Start: 2025-12-01              │
│ End:   2025-12-31              │
└────────────────────────────────┘

Use Case: Monthly performance review
Result: Complete month analysis, KPIs for reporting

SKENARIO C: Quarterly Analysis (Q4 2025)
┌────────────────────────────────┐
│ Start: 2025-10-01              │
│ End:   2025-12-31              │
└────────────────────────────────┘

Use Case: Quarterly business review
Result: 3-month trends, strategic planning data

SKENARIO D: Year-over-Year Comparison
┌────────────────────────────────┐
│ Period 1: 2024-01-01 to 2024-12-31 │
│ Period 2: 2025-01-01 to 2025-12-31 │
└────────────────────────────────┘

Use Case: Annual performance comparison
Result: Growth rate, trend changes, strategic insights
```

---

### **5️⃣ EXPORT FUNCTIONALITY**

#### **A. Export to CSV**

**Fungsi:**
- Export data summary dan detail ke CSV format untuk analysis di Excel

**Data Structure:**
```csv
BKT-SimCare Executive Summary Report
Export Date,2026-01-12T12:44:17.000+07:00
Period,01 Desember 2025 - 31 Desember 2025

Key Metrics
Total SIM Cards,200
Active Cards,192
Active Rate,96%
Deactivated Cards,8

Status Breakdown
Status,Count,Percentage
WAREHOUSE,31,15.5%
ACTIVATED,15,7.5%
INSTALLED,120,60.0%
BILLING,18,9.0%
GRACE_PERIOD,8,4.0%
DEACTIVATED,8,4.0%

Monthly Trend
Month,Activations,Deactivations,Net Growth
Agt 2025,25,5,+20
Sep 2025,30,8,+22
Okt 2025,28,6,+22
Nov 2025,32,10,+22
Des 2025,35,12,+23
Jan 2026,20,15,+5
```

**Use Cases:**
- 📊 Pivot tables di Excel
- 📈 Custom charts dan visualizations
- 📧 Email reports ke stakeholders
- 💾 Archive untuk historical analysis
- 🔄 Import ke sistem BI tools

#### **B. Export to PDF (Coming Soon)**

**Fungsi:**
- Export full report dengan charts ke PDF format untuk presentation

**Content Structure:**
```
Page 1: Cover & Executive Summary
├─ Company logo
├─ Report title
├─ Date range
├─ Key metrics summary
└─ Generated timestamp

Page 2: Status Analysis
├─ Status breakdown chart
├─ Distribution table
├─ Key insights
└─ Recommendations

Page 3: Trend Analysis
├─ Monthly trend chart
├─ Growth metrics
├─ Trend interpretation
└─ Action items

Page 4: Detailed Data
├─ Complete SIM list
├─ Status details
└─ Appendix
```

---

### **6️⃣ USE CASES & SCENARIOS**

#### **Use Case 1: Daily Operations Dashboard**
```
Persona: Operations Manager
Frequency: Daily

Steps:
1. Open Executive Summary
2. Set date range: Last 7 days
3. Check Active Rate: Should be >90%
4. Review Deactivated count: Should be <5/day
5. Quick status check: Any concerning trends?

Decision Points:
- Active Rate <90% → Investigate causes
- Deactivation spike → Emergency review
- Ghost SIM (ACTIVATED) increase → Follow up installations
```

#### **Use Case 2: Weekly Management Review**
```
Persona: Department Head
Frequency: Weekly (every Monday)

Steps:
1. Set date range: Last 7 days
2. Compare with previous week
3. Review KPIs:
   - Total Cards growth
   - Active Rate trend
   - Deactivation rate
4. Analyze Status Breakdown changes
5. Export CSV for detailed analysis

Deliverables:
- Weekly summary email
- KPI tracking spreadsheet
- Action items for team
```

#### **Use Case 3: Monthly Business Review**
```
Persona: CEO / Management Team
Frequency: Monthly

Steps:
1. Set date range: Full previous month
2. Comprehensive analysis:
   - Total inventory growth
   - Utilization rate (Active Rate)
   - Churn analysis (Deactivations)
   - Cost optimization opportunities
3. Export PDF report
4. Present in management meeting

Key Questions:
- Are we meeting growth targets?
- Is utilization improving?
- What's causing deactivations?
- Where can we optimize costs?
```

#### **Use Case 4: Quarterly Strategic Planning**
```
Persona: Executive Team
Frequency: Quarterly

Steps:
1. Set date range: Full quarter (3 months)
2. Deep analysis:
   - Growth trajectory
   - Market penetration
   - Operational efficiency
   - Financial impact
3. Benchmark against targets
4. Identify strategic initiatives

Strategic Outputs:
- Resource allocation decisions
- Budget planning for next quarter
- Process improvement initiatives
- Investment priorities
```

#### **Use Case 5: Troubleshooting & Root Cause Analysis**
```
Persona: Technical Team
Frequency: As needed (when issues detected)

Scenario: Sudden spike in deactivations

Steps:
1. Set date range: Around spike period
2. Analyze deactivation trend
3. Check correlation with:
   - Specific providers
   - Device types
   - Customer segments
   - Time patterns
4. Export detailed data
5. Perform root cause analysis

Investigation Flow:
┌─────────────────────────┐
│ Spike Detected: Dec 15  │
├─────────────────────────┤
│ 1. Check provider mix   │
│    └─ Is it specific to │
│       one provider?     │
├─────────────────────────┤
│ 2. Check device types   │
│    └─ Is it specific to │
│       certain devices?  │
├─────────────────────────┤
│ 3. Check customer data  │
│    └─ Is it specific to │
│       one customer?     │
├─────────────────────────┤
│ 4. Check time pattern   │
│    └─ Time of day?      │
│       Day of week?      │
└─────────────────────────┘
```

---

### **7️⃣ ADVANCED ANALYTICS TECHNIQUES**

#### **A. Cohort Analysis**
```
Question: How long do SIM cards typically last before deactivation?

Analysis:
1. Group SIMs by activation month (cohort)
2. Track deactivation over time
3. Calculate average lifespan

Example:
Cohort: Aug 2025 Activations (25 SIMs)
├─ Month 1 (Sep): 1 deactivated (4%)
├─ Month 2 (Oct): 2 deactivated (8%)
├─ Month 3 (Nov): 1 deactivated (4%)
├─ Month 4 (Dec): 2 deactivated (8%)
└─ Month 5 (Jan): 3 deactivated (12%)

Total deactivated: 9 out of 25 (36%)
Still active: 16 (64%)
Average lifespan: 4.2 months (for deactivated SIMs)
```

#### **B. Churn Rate Calculation**
```
Formula:
Monthly Churn Rate = (Deactivations in Month / Active SIMs at Start of Month) × 100%

Example:
Dec 2025:
- Active SIMs at Dec 1: 180
- Deactivations in Dec: 12
- Churn Rate = (12 / 180) × 100% = 6.67%

Benchmark:
- Excellent: <2%
- Good: 2-5%
- Acceptable: 5-8%
- Concerning: 8-10%
- Critical: >10%

Action Required:
If churn rate >8% for 2 consecutive months:
→ Emergency churn reduction program
→ Customer retention initiatives
→ Service quality audit
```

#### **C. Growth Rate Analysis**
```
Formula:
Monthly Growth Rate = ((Ending SIMs - Starting SIMs) / Starting SIMs) × 100%

Example:
Dec 2025:
- Starting SIMs (Dec 1): 180
- Ending SIMs (Dec 31): 203
- Growth Rate = ((203 - 180) / 180) × 100% = 12.78%

Compound Monthly Growth Rate (CMGR) over 6 months:
CMGR = ((Ending / Starting) ^ (1/months) - 1) × 100%

Example:
Aug 2025 - Jan 2026:
- Starting (Aug 1): 150
- Ending (Jan 31): 203
- Months: 6
- CMGR = ((203/150)^(1/6) - 1) × 100% = 5.16% per month
```

#### **D. Forecasting**
```
Simple Linear Forecast:
Based on 6-month trend, predict next 3 months

Historical data (activations):
Agt: 25, Sep: 30, Okt: 28, Nov: 32, Des: 35, Jan: 20
Average: 28.33 activations/month
Trend: +2.5/month (average increase)

Forecast:
- Feb 2026: 22 (Jan + trend, considering seasonality)
- Mar 2026: 25
- Apr 2026: 27

With 80% confidence interval: ±5 SIMs
```

---

### **8️⃣ DASHBOARD BEST PRACTICES**

#### **Daily Routine:**
```
Morning Check (5 minutes):
1. Open Executive Summary
2. Set range: Yesterday
3. Quick metrics scan:
   ✓ Any new deactivations?
   ✓ Activations vs target?
   ✓ Active rate stable?
4. Flag anomalies for investigation
```

#### **Weekly Review:**
```
Monday Morning (15 minutes):
1. Set range: Last 7 days
2. Export CSV
3. Update tracking spreadsheet
4. Compare vs previous week
5. Prepare team briefing
6. Set weekly targets
```

#### **Monthly Reporting:**
```
End of Month (30 minutes):
1. Set range: Full month
2. Generate all reports
3. Calculate key metrics
4. Analyze trends
5. Prepare management presentation
6. Archive data
```

#### **Alert Thresholds:**
```
Set up monitoring for:
🔴 CRITICAL:
   - Active Rate drops below 85%
   - Daily deactivations >10
   - Ghost SIMs >15% of total

🟡 WARNING:
   - Active Rate 85-90%
   - Daily deactivations 5-10
   - Ghost SIMs 10-15% of total

🟢 NORMAL:
   - Active Rate >90%
   - Daily deactivations <5
   - Ghost SIMs <10% of total
```

---

## 🎓 Training & Onboarding

### New User Onboarding Checklist

**Day 1: Introduction**
- [ ] Read manual introduction section
- [ ] Understand BKT-SimCare purpose
- [ ] Learn SIM lifecycle (WAREHOUSE → DEACTIVATED)
- [ ] Practice navigating dashboard
- [ ] Review status cards meaning

**Day 2: Basic Operations**
- [ ] Add 5 test SIM cards (different statuses)
- [ ] Edit SIM card (change status)
- [ ] Search SIM cards
- [ ] Filter by status
- [ ] View SIM detail pages

**Day 3: Data Management**
- [ ] Download import template
- [ ] Create test Excel file (10 rows)
- [ ] Import Excel data
- [ ] Review import results
- [ ] Export data to Excel

**Day 4: Reports & Analytics**
- [ ] Explore Dashboard charts
- [ ] Use date range filter
- [ ] Visit Executive Summary
- [ ] Generate and export report

**Day 5: Advanced Features**
- [ ] Understand IMEI uniqueness rule
- [ ] Practice status changes (full lifecycle)
- [ ] Troubleshoot common errors
- [ ] Review best practices

---

## 📝 Version History

### Version 1.0.0 (January 2026)
**Initial Release**
- ✅ Dashboard with status cards and charts
- ✅ SIM Cards CRUD operations
- ✅ Status lifecycle management
- ✅ IMEI uniqueness enforcement
- ✅ Date range filtering for charts
- ✅ Excel import/export
- ✅ WIB timezone support
- ✅ Executive Summary page
- ✅ Search and filter functionality
- ✅ Responsive design

**Coming Soon (Future Versions)**
- Device Management (full implementation)
- Customer Management (full implementation)
- History & Audit Trail (full implementation)
- User authentication & RBAC
- Bulk operations (edit, deactivate)
- Advanced reporting (PDF, custom templates)
- API documentation
- Mobile app

---

## 🏁 Conclusion

**Selamat!** Anda telah menyelesaikan Buku Panduan BKT-SimCare.

Dengan manual ini, Anda seharusnya sudah bisa:
- ✅ Navigate aplikasi dengan lancar
- ✅ Mengelola SIM cards dari awal hingga akhir lifecycle
- ✅ Import dan export data dengan efisien
- ✅ Generate reports untuk manajemen
- ✅ Troubleshoot masalah umum
- ✅ Memahami best practices

**Next Steps:**
1. Bookmark manual ini untuk referensi cepat
2. Mulai gunakan aplikasi dengan data real
3. Hubungi support jika ada pertanyaan
4. Provide feedback untuk improvement

**Remember:**
- 🔄 Regular backups (export Excel weekly)
- 📊 Review dashboard daily untuk monitoring
- 📝 Update status SIM secara berkala
- 🚨 Report bugs/issues immediately

---

**Thank you for using BKT-SimCare!**

*For support: support@bkt-simcare.com*  
*For feature requests: features@bkt-simcare.com*

---

**Document Information:**
- Version: 1.0.0
- Last Updated: 12 Januari 2026
- Language: Bahasa Indonesia
- Format: Markdown
- Total Pages: ~50 pages (PDF equivalent)

---