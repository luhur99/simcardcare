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
Current IMEI: 123456789012345
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

## 🔄 Import Data Excel (Advanced Guide)

### Import Excel Best Practices

#### Persiapan Data

**1. Clean Your Data**
- Hapus spaces di awal/akhir text
- Pastikan no leading zeros hilang (contoh: ICCID, Phone)
- Format date konsisten (YYYY-MM-DD)
- Hapus duplicate rows sebelum upload

**2. Validate ICCID**
```excel
Formula untuk cek length ICCID:
=LEN(A2)

Harus return 19 atau 20
```

**3. Validate Phone Number**
```excel
Formula untuk cek length Phone:
=LEN(B2)

Harus return 10-15
```

**4. Validate IMEI**
```excel
Formula untuk cek length IMEI:
=LEN(E2)

Harus return 15 (jika diisi)
```

#### Common Import Errors & Solutions

**Error: "ICCID too short"**
- **Cause:** ICCID < 19 characters
- **Solution:** Pastikan ICCID 19-20 digit, no spaces
- **Example:**
  - ❌ Bad: `896209021234` (12 digits)
  - ✅ Good: `8962090212345678901` (19 digits)

**Error: "Phone number duplicate"**
- **Cause:** Phone number sudah ada di database
- **Solution:** Ubah phone number atau skip row
- **Tip:** Export existing data dulu untuk cek duplicate

**Error: "IMEI already in use"**
- **Cause:** IMEI sudah digunakan SIM card lain yang aktif
- **Solution:**
  - Option 1: Gunakan IMEI lain
  - Option 2: Deactivate SIM yang menggunakan IMEI tersebut
  - Option 3: Leave IMEI blank (if status allows)

**Error: "Missing Current IMEI for ACTIVATED status"**
- **Cause:** Status ACTIVATED/INSTALLED butuh IMEI
- **Solution:** Isi kolom Current IMEI dengan 15 digit number
- **Example:** `123456789012345`

**Error: "Invalid Status"**
- **Cause:** Status bukan salah satu dari enum values
- **Solution:** Gunakan exact text:
  - ✅ `WAREHOUSE`
  - ✅ `ACTIVATED`
  - ✅ `INSTALLED`
  - ✅ `BILLING`
  - ✅ `GRACE_PERIOD`
  - ✅ `DEACTIVATED`
  - ❌ `Active`, `Aktif`, `active`, `ACTIVE`

**Error: "Invalid date format"**
- **Cause:** Date format bukan YYYY-MM-DD
- **Solution:** Format ulang dates di Excel:
  1. Select date column
  2. Format Cells → Custom
  3. Type: `yyyy-mm-dd`
  4. Example: `2026-01-12`

#### Bulk Import Strategy

**For Large Datasets (1000+ rows):**

1. **Split into Batches**
   - Import 500-1000 rows per batch
   - Easier to manage errors
   - Less chance of timeout

2. **Import Order by Status**
   - Batch 1: WAREHOUSE status (simplest)
   - Batch 2: ACTIVATED status (needs IMEI)
   - Batch 3: INSTALLED status (needs dates)
   - Batch 4: BILLING/GRACE_PERIOD (needs billing info)

3. **Verify Between Batches**
   - Check dashboard stats after each batch
   - Verify counts match expected
   - Fix errors before next batch

#### Excel Tips & Tricks

**1. Remove Duplicates**
```
Excel: Data → Remove Duplicates
Select ICCID column → OK
```

**2. Validate Data dengan Conditional Formatting**
```
Select ICCID column
Conditional Formatting → Highlight Cells Rules → Greater Than
Value: 18 (untuk highlight <19 chars)
```

**3. Quick Fill IMEIs**
```
If you need unique IMEIs:
First cell: 123456789012345
Second cell: =A1+1
Drag down for sequence
```

**4. Convert Text to Number**
```
If ICCID/Phone treated as text:
=VALUE(A2)
Or: Text to Columns → Finish
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. **Preview Tidak Loading / Blank Screen**

**Symptoms:**
- Dashboard tidak muncul
- Halaman putih kosong
- Loading forever

**Solutions:**

**A. Clear Browser Cache**
```
Chrome/Edge:
1. Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Clear data
4. Refresh (Ctrl+Shift+R)
```

**B. Restart Next.js Server**
```
Method 1 (via Softgen interface):
1. Click settings icon (top-right)
2. Click "Restart Server" button
3. Wait for server to restart
4. Refresh browser

Method 2 (manual):
Terminal: pm2 restart all
```

**C. Check Console for Errors**
```
1. Press F12 (open DevTools)
2. Go to Console tab
3. Look for red error messages
4. Share error with support if needed
```

#### 2. **Data Tidak Muncul di Tabel**

**Symptoms:**
- Tabel kosong
- "No data available" message
- Stats cards show 0

**Solutions:**

**A. Check Supabase Connection**
```
1. Verify .env.local file exists
2. Check NEXT_PUBLIC_SUPABASE_URL
3. Check NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Both should not be "invalid_anon_key"
```

**B. Check Browser Console**
```
F12 → Console
Look for API errors like:
- "401 Unauthorized"
- "Failed to fetch"
- "Network error"
```

**C. Verify Database**
```
1. Go to Supabase dashboard
2. Check if tables exist:
   - sim_cards
   - devices
   - customers
   - installations
   - status_history
3. Check if data exists in tables
```

#### 3. **Form Validation Errors**

**Error: "ICCID must be 19-20 characters"**
- **Check:** Length of ICCID input
- **Solution:** Add/remove digits to make 19-20 chars
- **Tip:** Use Excel LEN() formula to verify before import

**Error: "Phone number already exists"**
- **Check:** Duplicate phone number in database
- **Solution:** Use different phone number
- **Tip:** Export data first to check existing phones

**Error: "IMEI ini sudah terikat dengan kartu aktif lain!"**
- **Cause:** IMEI already used by another active SIM
- **Solution:**
  - Option 1: Use different IMEI
  - Option 2: Deactivate the other SIM first
  - Option 3: Leave IMEI blank (if status allows)

**Error: "Current IMEI required for ACTIVATED status"**
- **Cause:** Trying to set status ACTIVATED without IMEI
- **Solution:** Fill in Current IMEI field (15 digits)

#### 4. **Date & Time Issues**

**Symptoms:**
- Dates showing wrong day
- Time 7 hours behind
- Chart data in wrong months

**Cause:**
- Timezone mismatch (UTC vs WIB)

**Verification:**
```
All dates should use WIB (UTC+7) timezone

Check:
1. Dashboard charts → Should show current month correctly
2. SIM activation date → Should match today when created
3. Export timestamps → Should show +07:00 timezone
```

**Solution:**
- System already uses WIB timezone
- If still incorrect, contact support
- Provide screenshot of date discrepancy

#### 5. **Import Excel Fails**

**Error: "File format not supported"**
- **Cause:** Not .xlsx or .xls file
- **Solution:** Save Excel as .xlsx format
- **Steps:**
  ```
  Excel: File → Save As
  File type: Excel Workbook (*.xlsx)
  ```

**Error: "Template headers don't match"**
- **Cause:** Column headers modified
- **Solution:**
  1. Download fresh template
  2. Copy data to new template
  3. Don't modify header row

**Error: "Too many invalid rows"**
- **Cause:** Data validation errors
- **Solution:**
  1. Download error report
  2. Fix errors in Excel
  3. Re-upload file

#### 6. **Performance Issues**

**Symptoms:**
- Slow loading
- Lag when typing
- Charts take long to render

**Solutions:**

**A. Reduce Data Load**
```
1. Use date range filter
2. Filter by status
3. Limit to recent data
```

**B. Close Unused Browser Tabs**
```
App uses browser memory
Close other tabs to free RAM
```

**C. Clear Browser Data**
```
1. Clear cache (Ctrl+Shift+Delete)
2. Clear cookies
3. Restart browser
```

#### 7. **Export Not Working**

**Error: "Export failed"**
- **Cause:** Browser blocked download
- **Solution:**
  1. Check browser download settings
  2. Allow downloads from site
  3. Try different browser

**Error: "File is empty"**
- **Cause:** No data to export
- **Solution:**
  1. Check if any SIM cards exist
  2. Clear filters if applied
  3. Verify data loaded in table

---

## ❓ FAQ (Frequently Asked Questions)

### General Questions

**Q: Apa itu BKT-SimCare?**
A: BKT-SimCare adalah sistem manajemen kartu SIM terpusat untuk melacak lifecycle SIM card dari warehouse hingga deaktivasi, termasuk device assignment, customer management, dan billing tracking.

**Q: Apakah ada biaya untuk menggunakan aplikasi ini?**
A: Hubungi admin/manajemen untuk informasi pricing dan licensing.

**Q: Browser apa yang didukung?**
A: 
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge (Chromium)
- ❌ Internet Explorer (not supported)

**Q: Apakah bisa akses dari mobile?**
A: Ya, aplikasi responsive dan bisa diakses dari mobile browser. Namun, untuk experience terbaik disarankan menggunakan desktop/laptop untuk input data dan management tasks.

---

### SIM Card Management

**Q: Apa perbedaan ACTIVATED vs INSTALLED?**
A: 
- **ACTIVATED**: SIM sudah diaktivasi provider tapi belum dipasang di device (disebut "Ghost SIM")
- **INSTALLED**: SIM sudah dipasang dan berfungsi di device

**Q: Kenapa ada kategori "Ghost SIM Card"?**
A: Ghost SIM adalah SIM yang statusnya ACTIVATED (sudah aktif) tapi belum INSTALLED (belum terpasang di device). Ini penting untuk tracking SIM yang activated tapi belum productive.

**Q: Apa itu Grace Period?**
A: Grace Period adalah masa tenggang 30 hari setelah billing cycle jika pembayaran terlambat. Setelah grace period, SIM harus dibayar atau akan deactivated.

**Q: Bisakah SIM yang DEACTIVATED diaktifkan lagi?**
A: Tidak. Status DEACTIVATED adalah final/permanent. Jika perlu menggunakan nomor yang sama, harus request SIM baru ke provider.

**Q: Kenapa IMEI penting?**
A: IMEI (International Mobile Equipment Identity) adalah unique identifier untuk device. System enforce rule: **Satu IMEI hanya bisa digunakan oleh satu SIM aktif** untuk mencegah konflik dan tracking yang akurat.

**Q: Bagaimana cara menghapus SIM card?**
A: Saat ini tidak ada fitur delete. Best practice: Ubah status ke DEACTIVATED dengan reason "Deleted/Removed" agar tetap ada audit trail.

---

### Date & Time

**Q: Timezone apa yang digunakan?**
A: Semua date dan time menggunakan **WIB (Waktu Indonesia Barat / UTC+7)**. Ini termasuk:
- Timestamps di database
- Date inputs di forms
- Chart calculations
- Export timestamps

**Q: Kenapa tanggal di chart tidak sesuai?**
A: Pastikan:
1. Browser timezone set ke Indonesia/Jakarta
2. System time computer benar
3. Refresh browser dengan Ctrl+Shift+R
Jika masih salah, screenshot dan hubungi support.

**Q: Format tanggal apa yang digunakan untuk import Excel?**
A: Format: **YYYY-MM-DD**
- ✅ Correct: `2026-01-12`
- ❌ Wrong: `12/01/2026`, `12-01-2026`, `01/12/2026`

---

### Import & Export

**Q: Berapa maksimal rows untuk import Excel?**
A: Recommended: 500-1000 rows per batch. Untuk lebih banyak, split menjadi multiple batches untuk menghindari timeout dan easier error management.

**Q: Apa yang terjadi jika ada duplicate ICCID saat import?**
A: Row dengan duplicate ICCID akan di-skip dan muncul di error report. ICCID harus unique di sistem.

**Q: Bisakah update data via import Excel?**
A: Saat ini import hanya untuk add new SIM cards. Untuk update, gunakan Edit function di web interface atau export → edit → re-import (after deleting old records via DEACTIVATED status).

**Q: Format apa yang didukung untuk export?**
A: 
- ✅ Excel (.xlsx) - Via "Export" button
- ✅ CSV (coming soon)
- ✅ PDF (via Executive Summary)

**Q: Apakah export meng-include filtered data only?**
A: Ya! Export akan include data yang:
- Match search query (jika ada)
- Match status filter (jika applied)
- Visible di current table view

---

### Reports & Analytics

**Q: Bagaimana cara melihat data untuk periode tertentu?**
A: Gunakan Date Range Filter:
1. Dashboard: Filter Periode Grafik card
2. Executive Summary: Date range picker di top
3. Pilih start & end date sesuai periode yang diinginkan

**Q: Apa perbedaan Dashboard vs Executive Summary?**
A:
- **Dashboard**: Quick overview, real-time stats, 6 bulan recent data
- **Executive Summary**: Detailed analysis, custom date range, comprehensive reports, export functionality

**Q: Bagaimana cara print report?**
A: 
1. Go to Executive Summary
2. Set date range
3. Export PDF
4. Open PDF dan print (Ctrl+P)

---

### Technical Issues

**Q: Error "401 Unauthorized" muncul terus**
A: 
1. Check Supabase connection (settings)
2. Verify API keys di .env.local
3. Contact admin untuk refresh API keys

**Q: Aplikasi slow / loading lama**
A: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Close unused tabs
3. Use date range filter to reduce data load
4. Try different browser
5. Check internet connection

**Q: Preview tidak loading setelah edit file**
A: 
1. Click "Restart Server" button (Softgen interface, top-right settings)
2. Wait 10-15 seconds
3. Refresh browser (Ctrl+Shift+R)

**Q: "IMEI sudah terikat dengan kartu aktif lain" - Bagaimana fix?**
A: Option 1: Use different IMEI
Option 2: Find SIM yang pakai IMEI tersebut → Edit → Deactivate
Option 3: Edit SIM yang pakai IMEI → Clear IMEI field (set to blank)

---

### Data Management

**Q: Bagaimana cara backup data?**
A: 
1. Go to SIM Cards page
2. Don't apply any filter (untuk export all)
3. Click "Export" button
4. Save .xlsx file sebagai backup
5. Lakukan regular backup (weekly recommended)

**Q: Bagaimana cara restore data dari backup?**
A: 
1. **HATI-HATI**: Import akan ADD data, bukan replace
2. Jika perlu restore completely:
   - Deactivate semua SIM existing (via bulk edit - coming soon)
   - Import dari backup file
3. Or contact admin untuk database restore dari server backup

**Q: Apakah ada limit jumlah SIM yang bisa disimpan?**
A: Tidak ada hard limit. System dapat handle ribuan SIM cards. Performance optimal hingga 10,000+ records.

---

### User Access & Security

**Q: Apakah ada role/permission management?**
A: Saat ini semua user punya full access. Role-based access control (RBAC) akan datang di versi berikutnya.

**Q: Bagaimana cara add user baru?**
A: Contact system administrator untuk add user ke Supabase dan grant akses aplikasi.

**Q: Apakah data aman?**
A: Ya. Data disimpan di Supabase (PostgreSQL) dengan:
- ✅ SSL/TLS encryption
- ✅ Row Level Security (RLS) policies
- ✅ Automatic backups
- ✅ Enterprise-grade security

---

## 📞 Support & Contact

### Mendapatkan Bantuan

**Jika mengalami masalah:**

1. **Check Troubleshooting Section**
   - Baca bagian Troubleshooting di manual ini
   - 90% masalah umum sudah tercakup di sana

2. **Check FAQ**
   - Baca FAQ section
   - Search keyword masalah Anda

3. **Check Browser Console**
   - Press F12
   - Go to Console tab
   - Screenshot error messages (jika ada)

4. **Contact Support**
   - Email: support@bkt-simcare.com
   - Provide:
     - Screenshot masalah
     - Browser console errors (jika ada)
     - Steps to reproduce
     - Browser & OS version

### Reporting Bugs

**Format Bug Report:**

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Go to [page]
2. Click [button]
3. See error

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[Attach screenshots]

**Browser**: Chrome 120 / Firefox 121 / etc
**OS**: Windows 11 / macOS 14 / etc
**Date & Time**: 12 Jan 2026, 12:44 WIB
```

### Feature Requests

**Ada idea untuk fitur baru?**

Submit feature request:
- Email: features@bkt-simcare.com
- Include:
  - Feature description
  - Use case / problem it solves
  - Priority (Low/Medium/High)
  - Mockup/wireframe (jika ada)

---

## 📚 Appendix

### A. Glossary (Istilah Penting)

**ICCID** (Integrated Circuit Card Identifier)
- Nomor unik kartu SIM (19-20 digit)
- Contoh: 8962090212345678901

**IMEI** (International Mobile Equipment Identity)
- Nomor unik device hardware (15 digit)
- Contoh: 123456789012345

**SIM Card**
- Subscriber Identity Module
- Kartu yang dipasang di device untuk koneksi cellular

**Ghost SIM**
- SIM dengan status ACTIVATED tapi belum INSTALLED
- Sudah aktif tapi belum productive/terpasang

**Grace Period**
- Masa tenggang 30 hari setelah billing
- Untuk pembayaran yang terlambat

**Provider**
- Operator seluler (Telkomsel, Indosat, XL, dll)

**Lifecycle**
- Siklus hidup SIM: WAREHOUSE → ACTIVATED → INSTALLED → BILLING → GRACE_PERIOD → DEACTIVATED

**WIB** (Waktu Indonesia Barat)
- Timezone UTC+7
- Digunakan untuk semua timestamps di sistem

---

### B. Status Lifecycle Diagram

```
                    START
                      ↓
            ┌──────────────────┐
            │   WAREHOUSE      │ Stock gudang
            │  (Stok Gudang)   │ Belum aktif
            └────────┬─────────┘
                     ↓
            ┌──────────────────┐
            │   ACTIVATED      │ Sudah aktif
            │  (Ghost SIM)     │ Belum terpasang
            └────────┬─────────┘
                     ↓
            ┌──────────────────┐
            │   INSTALLED      │ Terpasang di device
            │  (Terinstall)    │ Sudah productive
            └────────┬─────────┘
                     ↓
            ┌──────────────────┐
            │    BILLING       │ Dalam billing cycle
            │  (Normal usage)  │ Pembayaran rutin
            └────────┬─────────┘
                     ↓
            ┌──────────────────┐
            │  GRACE_PERIOD    │ Masa tenggang
            │ (30 hari buffer) │ Payment warning
            └────────┬─────────┘
                     ↓
            ┌──────────────────┐
            │  DEACTIVATED     │ Nonaktif permanent
            │   (Terminated)   │ End of lifecycle
            └──────────────────┘
                     ↓
                     END
```

---

### C. Quick Reference Card

**Keyboard Shortcuts:**
- `Ctrl + Shift + R`: Hard refresh browser
- `F12`: Open DevTools
- `Ctrl + F`: Find in page
- `Ctrl + P`: Print page
- `Esc`: Close dialog/modal

**Common Tasks:**

| Task | Steps |
|------|-------|
| Add SIM | SIM Cards → + Add → Fill form → Save |
| Edit SIM | SIM Cards → ✏️ Edit → Update → Save |
| View Detail | SIM Cards → 📄 View |
| Filter Status | SIM Cards → Status dropdown → Select |
| Search | SIM Cards → Search box → Type → Enter |
| Export | SIM Cards → Export button |
| Import | SIM Cards → Import Excel → Upload file |
| View Dashboard | Click "Dashboard" in navbar |
| View Reports | Click "Executive Summary" in navbar |

---

### D. Database Schema Reference

**Tables:**

**sim_cards**
- id (UUID, primary key)
- iccid (TEXT, unique, 19-20 chars)
- phone_number (TEXT, unique, 10-15 chars)
- provider (TEXT)
- status (ENUM)
- current_imei (TEXT, 15 chars, unique when active)
- activation_date (TIMESTAMP)
- installation_date (TIMESTAMP)
- billing_cycle_day (INTEGER, 1-31)
- monthly_bill_amount (DECIMAL)
- grace_period_start (TIMESTAMP)
- deactivation_date (TIMESTAMP)
- deactivation_reason (TEXT)
- created_at (TIMESTAMP, WIB)
- updated_at (TIMESTAMP, WIB)

**devices** (Coming Soon)
- id, imei, type, location, etc.

**customers** (Coming Soon)
- id, name, email, phone, address, etc.

**installations** (Coming Soon)
- id, sim_card_id, device_id, customer_id, etc.

**status_history** (Coming Soon)
- id, sim_card_id, old_status, new_status, changed_at, etc.

---

### E. API Endpoints (For Developers)

**Supabase API:**

```
Base URL: https://[your-project].supabase.co

GET /rest/v1/sim_cards
- List all SIM cards
- Supports filtering, sorting, pagination

POST /rest/v1/sim_cards
- Create new SIM card
- Body: JSON with SIM data

PATCH /rest/v1/sim_cards?id=eq.[uuid]
- Update SIM card
- Body: JSON with updated fields

DELETE /rest/v1/sim_cards?id=eq.[uuid]
- Delete SIM card (soft delete recommended)
```

**Authentication:**
```
Headers:
  apikey: [SUPABASE_ANON_KEY]
  Authorization: Bearer [SUPABASE_ANON_KEY]
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