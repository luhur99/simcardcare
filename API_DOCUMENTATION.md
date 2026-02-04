# 📡 BKT Simcard Care - API Documentation

Complete REST API documentation for BKT Simcard Care application.

**Base URL:** `http://localhost:3000/api` (Development)

---

## 📋 Table of Contents

1. [SIM Cards API](#sim-cards-api)
2. [Providers API](#providers-api)
3. [Devices API](#devices-api)
4. [Calculations API](#calculations-api)
5. [Response Format](#response-format)
6. [Error Codes](#error-codes)

---

## 📱 SIM Cards API

### Get All SIM Cards
```http
GET /api/sim-cards
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

---

### Get SIM Card by ID
```http
GET /api/sim-cards/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "iccid": "89620012345678901234",
    "phone_number": "081234567890",
    "provider": "Telkomsel",
    "status": "INSTALLED",
    ...
  }
}
```

---

### Create SIM Card
```http
POST /api/sim-cards
```

**Request Body:**
```json
{
  "phone_number": "081234567890",
  "provider": "Telkomsel",
  "plan_name": "Corporate 50GB",
  "status": "WAREHOUSE",
  "iccid": "89620012345678901234",
  "billing_cycle_day": 1,
  "monthly_cost": 150000,
  "notes": "Batch 2024-Q1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "SIM card created successfully"
}
```

---

### Update SIM Card
```http
PUT /api/sim-cards/{id}
```

**Request Body:**
```json
{
  "status": "ACTIVATED",
  "activation_date": "2026-02-04",
  "notes": "Updated notes"
}
```

---

### Delete/Deactivate SIM Card
```http
DELETE /api/sim-cards/{id}
```

**Request Body:**
```json
{
  "deactivation_date": "2026-02-04",
  "reason": "Device rusak"
}
```

---

### Get Statistics
```http
GET /api/sim-cards/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSims": 150,
    "activeDevices": 120,
    "customers": 45,
    "warehouse": 30,
    "overdueGracePeriod": 5,
    "overdueSims": [...]
  }
}
```

---

### Quick Actions

#### Activate SIM Card
```http
POST /api/sim-cards/actions/activate
```

**Request Body:**
```json
{
  "id": "sim-123",
  "activation_date": "2026-02-04"
}
```

---

#### Install SIM Card
```http
POST /api/sim-cards/actions/install
```

**Request Body:**
```json
{
  "id": "sim-123",
  "installation_date": "2026-02-10",
  "imei": "123456789012345",
  "free_pulsa_months": 3,
  "use_installation_as_billing_cycle": true,
  "custom_billing_day": 15
}
```

**Options for Billing Cycle:**
1. **Keep existing**: Don't send `use_installation_as_billing_cycle` or `custom_billing_day`
2. **Use installation date**: `"use_installation_as_billing_cycle": true`
3. **Custom day**: `"custom_billing_day": 15` (1-31)

---

#### Grace Period Management
```http
POST /api/sim-cards/actions/grace-period
```

**Enter Grace Period:**
```json
{
  "id": "sim-123",
  "action": "enter",
  "grace_period_start_date": "2026-02-04",
  "due_date": "2026-03-04"
}
```

**Reactivate from Grace Period:**
```json
{
  "id": "sim-123",
  "action": "reactivate",
  "activation_date": "2026-02-04"
}
```

---

## 🏢 Providers API

### Get All Providers
```http
GET /api/providers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "provider-1",
      "name": "Telkomsel",
      "contact_person": "Ahmad Santoso",
      "contact_phone": "08123456789",
      "contact_email": "ahmad@telkomsel.com",
      "billing_cycle_day": 1,
      "notes": "Main provider",
      "is_active": true,
      "created_at": "2026-01-11T01:17:58Z",
      "updated_at": "2026-01-11T01:17:58Z"
    }
  ],
  "count": 3
}
```

---

### Get Provider by ID
```http
GET /api/providers/{id}
```

---

### Create Provider
```http
POST /api/providers
```

**Request Body:**
```json
{
  "name": "Telkomsel",
  "contact_person": "Ahmad Santoso",
  "contact_phone": "08123456789",
  "contact_email": "ahmad@telkomsel.com",
  "billing_cycle_day": 1,
  "notes": "Corporate provider",
  "is_active": true
}
```

---

### Update Provider
```http
PUT /api/providers/{id}
```

**Request Body:**
```json
{
  "contact_person": "Budi Hartono",
  "contact_phone": "08567891234",
  "billing_cycle_day": 15
}
```

---

### Delete Provider
```http
DELETE /api/providers/{id}
```

---

### Toggle Provider Status
```http
POST /api/providers/{id}/toggle-status
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Provider activated successfully"
}
```

---

## 📱 Devices API

### Get All Devices
```http
GET /api/devices
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "imei": "123456789012345",
      "model": "iPhone 14 Pro",
      "brand": "Apple",
      "device_type": "Smartphone",
      "serial_number": "SN123456",
      "status": "AVAILABLE",
      "customer_id": null,
      "created_at": "2026-01-11T01:17:58Z",
      "updated_at": "2026-01-11T01:17:58Z"
    }
  ],
  "count": 2
}
```

---

## 🧮 Calculations API

### Calculate Daily Burden
```http
POST /api/calculations/daily-burden
```

**Request Body:**
```json
{
  "sim_card_id": "sim-123",
  "calculation_type": "all"
}
```

**Calculation Types:**
- `daily_burden` - Only overlap calculations
- `grace_period` - Grace period cost
- `free_pulsa` - Free pulsa tracking
- `all` - All calculations

**Response:**
```json
{
  "success": true,
  "data": {
    "daily_burden": {
      "overlap_1_days": 4,
      "overlap_1_cost": 20000,
      "overlap_2_days": 3,
      "overlap_2_cost": 15000,
      "total_burden": 35000
    },
    "grace_period": {
      "gracePeriodDays": 15,
      "gracePeriodCost": 75000,
      "dailyRate": 5000
    },
    "free_pulsa": {
      "monthsElapsed": 2,
      "totalFreeMonths": 3,
      "costIncurred": 300000,
      "isActive": true,
      "expiryDate": "2026-04-30",
      "daysRemaining": 85,
      "progressPercent": 66.67
    }
  },
  "sim_card": {...}
}
```

---

### Get Daily Burden Logs
```http
GET /api/calculations/burden-logs?sim_card_id=sim-123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log1",
      "sim_card_id": "sim-123",
      "calculation_type": "OVERLAP_1",
      "start_date": "2026-01-01",
      "end_date": "2026-01-05",
      "days_count": 4,
      "daily_rate": 5000,
      "total_cost": 20000,
      "description": "Biaya overlap: Aktivasi → Instalasi",
      "calculation_date": "2026-02-04T10:30:00Z"
    }
  ],
  "count": 2
}
```

---

## ✅ Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful" // Optional
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## ❌ Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

---

## 🔐 Authentication

Currently, the API doesn't require authentication. For production:

1. Add JWT token validation
2. Use Supabase Auth middleware
3. Implement role-based access control (RBAC)

**Future Implementation:**
```typescript
// Add to API routes
import { authService } from '@/services/authService';

// Verify session
const session = await authService.getCurrentSession();
if (!session) {
  return res.status(401).json({
    success: false,
    error: "Unauthorized"
  });
}
```

---

## 📝 Usage Examples

### JavaScript/TypeScript
```typescript
// Get all SIM cards
const response = await fetch('/api/sim-cards');
const { success, data } = await response.json();

// Create SIM card
const newSim = await fetch('/api/sim-cards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone_number: '081234567890',
    provider: 'Telkomsel',
    plan_name: 'Corporate 50GB',
    status: 'WAREHOUSE'
  })
});

// Activate SIM
await fetch('/api/sim-cards/actions/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'sim-123',
    activation_date: '2026-02-04'
  })
});
```

### cURL Examples
```bash
# Get all SIM cards
curl http://localhost:3000/api/sim-cards

# Create SIM card
curl -X POST http://localhost:3000/api/sim-cards \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "081234567890",
    "provider": "Telkomsel",
    "status": "WAREHOUSE"
  }'

# Get statistics
curl http://localhost:3000/api/sim-cards/stats

# Calculate daily burden
curl -X POST http://localhost:3000/api/calculations/daily-burden \
  -H "Content-Type: application/json" \
  -d '{
    "sim_card_id": "sim-123",
    "calculation_type": "all"
  }'
```

---

## 🚀 Testing

Use tools like:
- **Postman** - Import API collection
- **Insomnia** - REST client
- **Thunder Client** (VS Code)
- **cURL** - Command line

---

## 📞 Support

For API issues or questions:
- Check error responses
- Review calculation logic in `simService.ts`
- Contact: BKT Simcard Care Support

---

**Last Updated:** February 4, 2026
**API Version:** 1.0.0