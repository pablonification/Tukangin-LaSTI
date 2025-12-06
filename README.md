# 🛠️ Tukangin (LaSTI Project)

**Tukangin** is a Next.js-based Home Service Platform designed to solve the inefficiencies of the "As-Is" market (Kanggo) by introducing **Fixed-Price Menus**, **Automated Dispatch**, and **Digital Warranties**.

This repository contains the implementation of the **"To-Be" Architecture** defined in the **Layanan Sistem dan Teknologi Informasi (II3120)** Report.

---

## 📋 Project Scope & Alignment

This implementation strictly follows the **Improved Service Engineering** methodology:

| Component | Source Reference | Implementation Status |
| :--- | :--- | :--- |
| **Business Model** | BMC To-Be (Fig 2.4) | ✅ Implemented (Fixed Price, DP Logic) |
| **Service Design** | Service Blueprints (Fig 2.9-2.12) | ✅ Implemented (Frontend Flows) |
| **Process Logic** | BPMN To-Be (Fig 2.17-2.20) | ✅ Enforced via State Machine |
| **Architecture** | SOAML Diagrams (Chap 3) | ✅ Mapped to API Services |
| **Interface** | REST API Design (Chap 4) | ✅ 100% Match |

---

## 🏗️ Technical Architecture

* **Framework:** Next.js 15 (App Router)
* **Database:** PostgreSQL (via Supabase)
* **ORM:** Prisma
* **Auth:** Supabase Auth (Middleware Protected)
* **Testing:** Jest (Integration Testing)

---

## 🔌 API Documentation

The system exposes 4 core microservices (consolidated into Next.js Route Handlers) corresponding to the SOAML contracts.

### 1. Ordering Service (Pencarian & Pemesanan)

| Method | Endpoint | Description | SOAML Contract |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Retrieve fixed-price menu filtered by category. | `Ordering Provider` |
| `POST` | `/api/order` | Create order. Sets status to `WAITING_DP` (DB: `PENDING`). Returns DP amount (50%). | `Ordering Provider` |
| `POST` | `/api/order/[id]/payment` | Process DP. Updates status to `SEARCHING` (DB: `PROCESSING`). | `Payment Transaction` |

### 2. Dispatch & Tracking Service (Penugasan)

| Method | Endpoint | Description | SOAML Contract |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/order/[id]/professional` | Get assigned mitra profile (Name, Rating, Photo). | `Mitra Assignment` |
| `GET` | `/api/tracking/[id]` | Get real-time GPS coordinates. **Secured:** Only accessible if status is `PROCESSING`. | `Realtime Tracking` |

### 3. Execution Service (Pelaksanaan)

| Method | Endpoint | Description | SOAML Contract |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Upload evidence photos (Before/After work). | `Work Reporting` |
| `PATCH` | `/api/order/[id]` | Customer confirms completion. Updates status to `COMPLETED`. Triggers Warranty creation. | `Work Acceptance` |

### 4. Post-Service (Pasca Layanan)

| Method | Endpoint | Description | SOAML Contract |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Submit rating & comment. Linked to Professional reputation. | `Feedback & Reputation` |
| `GET` | `/api/warranty/[id]` | Retrieve digital warranty certificate (Valid for 30 days). | `Digital Warranty` |
| `POST` | `/api/warranty/claim` | Submit a warranty claim ticket. | `Digital Warranty` |

---

## 🧪 Testing Strategy

We utilize **Integration Testing** to validate the robustness of the business flows. Tests are located in `__tests__/integration/`.

### Coverage Summary
**Status:** ✅ **100% Pass** (29/29 Assertions)

| Scenario File | Focus Area | Key Validations |
| :--- | :--- | :--- |
| `01_ordering.test.ts` | **Financial Security** | • Ensures fixed price calculation.<br>• Blocks dispatch until 50% DP is paid.<br>• Validates exact DP amount. |
| `02_dispatch_tracking.test.ts` | **Transparency** | • Ensures Mitra profile is hidden until assigned.<br>• Ensures Tracking API throws 403 if order is not active. |
| `03_execution.test.ts` | **Operational** | • Validates photo upload handling.<br>• Ensures evidence URL persistence. |
| `04_completion_warranty.test.ts` | **Accountability** | • Enforces "No Rating, No Closure" rule.<br>• **Auto-generates Warranty** (`valid_until` = Now + 30 days).<br>• Validates claim submission. |

---

## 🚀 Getting Started

### 1. Environment Setup
Clone the repository and install dependencies:
```bash
npm install
````

Configure `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2\. Database Seeding

Run the SQL script located in `docs/supabase-init.sql` (or Phase 2 Plan) via Supabase SQL Editor to create:

  * `orders`, `users`, `professionals`, `vouchers`
  * **NEW:** `warranties`, `reviews`
  * **Enums:** `PENDING`, `PROCESSING`, `COMPLETED`

### 3\. Running Tests

Execute the Jest test suite to verify system integrity:

```bash
npm test
```

### 4\. Running the App

```bash
npm run dev
```

Access the application at `http://localhost:3000`.

-----

**University:** Institut Teknologi Bandung  
**Course:** II3120 Layanan Sistem dan Teknologi Informasi  
**Team:** Kelompok 03 - gacor 2025
