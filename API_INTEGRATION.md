# API Integration Map — RentNest Frontend (B7A5)

All frontend components and pages map to the following backend endpoints.
**Base URL:** `https://rentnest-api-cefz.onrender.com`

---

## Authentication

| Page / Component | Method | Endpoint | Auth Required |
|---|---|---|---|
| `src/app/auth/register/page.tsx` | `POST` | `/api/auth/register` | No |
| `src/app/auth/login/page.tsx` | `POST` | `/api/auth/login` | No |
| `src/lib/axios.ts` (interceptor) | `POST` | `/api/auth/refresh-token` | No (uses refreshToken) |
| `src/components/layout/Navbar.tsx` | — | (reads Zustand store, no API call on render) | — |

**Request body for register:**
```json
{ "name": "string", "email": "string", "password": "string", "role": "TENANT|LANDLORD", "phone": "string?" }
```
**Response for login:**
```json
{ "success": true, "data": { "user": {...}, "accessToken": "jwt", "refreshToken": "jwt" } }
```

---

## Public Property Browsing

| Page | Method | Endpoint | Query Params |
|---|---|---|---|
| `src/app/page.tsx` (home) | `GET` | `/api/properties` | `limit=6` |
| `src/app/properties/page.tsx` | `GET` | `/api/properties` | `page, limit, city, categoryId, minRent, maxRent, bedrooms` |
| `src/app/properties/[id]/page.tsx` | `GET` | `/api/properties/:id` | — |
| `src/app/properties/page.tsx` (filter dropdown) | `GET` | `/api/categories` | — |

**Property list response shape:**
```json
{ "success": true, "data": [...properties], "meta": { "page": 1, "limit": 10, "total": 8 } }
```

---

## Tenant Flow

| Page / Component | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/properties/[id]/page.tsx` (request modal) | `POST` | `/api/rental-requests` | TENANT JWT |
| `src/app/dashboard/tenant/page.tsx` | `GET` | `/api/rental-requests/my-requests` | TENANT JWT |
| `src/app/dashboard/tenant/page.tsx` | `GET` | `/api/payments/my-payments` | TENANT JWT |
| `src/app/dashboard/tenant/pay/[requestId]/page.tsx` | `POST` | `/api/payments/create-intent` | TENANT JWT |
| `src/app/dashboard/tenant/pay/[requestId]/page.tsx` | `POST` | `/api/payments/confirm` | TENANT JWT |
| `src/app/dashboard/tenant/page.tsx` (review modal) | `POST` | `/api/reviews` | TENANT JWT |

**Rental request body:**
```json
{ "propertyId": "uuid", "moveInDate": "2026-08-01", "message": "string?" }
```
**Payment create-intent body:**
```json
{ "rentalRequestId": "uuid" }
```
**Payment confirm body:**
```json
{ "rentalRequestId": "uuid", "paymentIntentId": "pi_stripe_id" }
```
**Review body:**
```json
{ "propertyId": "uuid", "rating": 1-5, "comment": "string?" }
```

---

## Landlord Flow

| Page | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/dashboard/landlord/page.tsx` | `GET` | `/api/properties/my-listings` | LANDLORD JWT |
| `src/app/dashboard/landlord/properties/new/page.tsx` | `POST` | `/api/properties` | LANDLORD JWT |
| `src/app/dashboard/landlord/properties/[id]/edit/page.tsx` | `GET` | `/api/properties/:id` | LANDLORD JWT |
| `src/app/dashboard/landlord/properties/[id]/edit/page.tsx` | `PATCH` | `/api/properties/:id` | LANDLORD JWT |
| `src/app/dashboard/landlord/page.tsx` (delete) | `DELETE` | `/api/properties/:id` | LANDLORD JWT |
| `src/app/dashboard/landlord/requests/page.tsx` | `GET` | `/api/rental-requests/incoming` | LANDLORD JWT |
| `src/app/dashboard/landlord/requests/page.tsx` | `PATCH` | `/api/rental-requests/:id/status` | LANDLORD JWT |

**Status update body:**
```json
{ "status": "APPROVED" | "REJECTED" }
```

---

## Admin Flow

| Page | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/dashboard/admin/page.tsx` | `GET` | `/api/admin/stats` | ADMIN JWT |
| `src/app/dashboard/admin/page.tsx` | `GET` | `/api/users` | ADMIN JWT |
| `src/app/dashboard/admin/page.tsx` (ban/unban) | `PATCH` | `/api/users/:id/status` | ADMIN JWT |

**Ban/unban body:**
```json
{ "isActive": false }   // ban
{ "isActive": true }    // unban
```

---

## Auth Token Flow

1. **Login** → JWT stored in Zustand store, `localStorage`, and a cookie.
2. **Every API request** → `src/lib/axios.ts` request interceptor reads `localStorage.accessToken` and adds `Authorization: Bearer <token>` header.
3. **401 response** → interceptor silently calls `POST /api/auth/refresh-token` with `refreshToken`, updates token, retries original request.
4. **Middleware** (`src/middleware.ts`) reads the cookie and decodes the JWT role to gate `/dashboard/*` routes before any page renders.

---

## Route Corrections (Prompt vs. Real Backend)

| Assignment Prompt Said | Actual Backend Route |
|---|---|
| `GET /api/rentals` | `GET /api/rental-requests/my-requests` |
| `GET /api/landlord/properties` | `GET /api/properties/my-listings` |
| `GET /api/landlord/requests` | `GET /api/rental-requests/incoming` |
| `PATCH /api/landlord/requests/:id` | `PATCH /api/rental-requests/:id/status` |
| `POST /api/payments/create` | `POST /api/payments/create-intent` |
| `GET /api/admin/users` | `GET /api/users` |
| `PATCH /api/admin/users/:id` | `PATCH /api/users/:id/status` |
