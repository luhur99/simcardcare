# BKT-SimCare - SIM Card Management System

A comprehensive SIM card lifecycle management application built with Next.js and Supabase.

## Features

- **SIM Card Lifecycle Management**: Track SIM cards through their complete lifecycle (WAREHOUSE → ACTIVATED → INSTALLED → BILLING → GRACE_PERIOD → DEACTIVATED)
- **IMEI Protection**: Unique constraint ensures no two active SIM cards can share the same IMEI
- **Device Management**: Track devices and their associations with SIM cards
- **Customer Management**: Manage customer database
- **Installation Tracking**: Monitor SIM card installations and removals
- **Automated History**: Automatic logging of all status changes

## Database Schema

### Tables
- `sim_cards`: Core SIM card information with status tracking
- `devices`: Device registry with IMEI as unique identifier
- `customers`: Customer information database
- `installations`: SIM-Device-Customer installation records
- `status_history`: Audit log for status changes

### Key Constraints
- **Unique Active IMEI**: Prevents multiple active SIM cards on the same device
  - Error message: "IMEI ini sudah terikat dengan kartu aktif lain!"
- **Automatic Status Logging**: Trigger automatically logs all status changes
- **Referential Integrity**: Foreign key constraints maintain data consistency

## Setup Instructions

1. **Connect Supabase**:
   - Click "Supabase" button in Softgen navbar
   - Connect your Supabase project

2. **Run Database Schema**:
   - Open Supabase SQL Editor
   - Copy and run the SQL from `supabase/schema.sql`

3. **Environment Variables**:
   - Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Install Dependencies** (if needed):
   ```bash
   npm install @supabase/supabase-js
   ```

## Tech Stack

- **Framework**: Next.js 15 (Page Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Status Lifecycle

1. **WAREHOUSE**: Initial state, SIM in inventory
2. **ACTIVATED**: SIM activated by provider
3. **INSTALLED**: SIM installed in device
4. **BILLING**: Active billing cycle
5. **GRACE_PERIOD**: Payment grace period
6. **DEACTIVATED**: SIM deactivated (IMEI constraint released)

## License

© 2026 BKT-SimCare. All rights reserved.