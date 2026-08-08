# API Integration Map — RentNest Frontend (B7A5)

All frontend components and pages map to the following backend endpoints.
**Base URL:** `https://rentnest-api-cefz.onrender.com` (local dev: `http://localhost:5000`)

Every response uses the envelope: `{ "success": true, "message": "...", "data": ..., "meta"? }`.

---

## Authentication

| Page / Component | Method | Endpoint | Auth Required |
|---|---|---|---|
| `src/app/auth/register/page.tsx` | `POST` | `/api/auth/register` | No |
| `src/app/auth/login/page.tsx` | `POST` | `/api/auth/login` | No |
| `src/app/auth/login/page.tsx` (Google/Facebook) | `POST` | `/api/auth/social` | No |
| `src/lib/axios.ts` (interceptor) | `POST` | `/api/auth/refresh-token` | No (uses refreshToken) |
| `src/app/dashboard/profile/page.tsx` | `POST` | `/api/auth/change-password` | Any JWT |

**Register body:**
```json
{ "name": "string", "email": "string", "password": "string", "role": "TENANT|LANDLORD", "phone": "string?" }
```
**Social login body (mock — creates a TENANT if the email is unknown):**
```json
{ "provider": "google|facebook", "email": "string?", "name": "string?", "credential": "string?" }
```
**Login response:**
```json
{ "success": true, "data": { "user": {...}, "accessToken": "jwt", "refreshToken": "jwt" } }
```

---

## Public Property Browsing

| Page | Method | Endpoint | Query Params |
|---|---|---|---|
| `src/app/page.tsx` (home) | `GET` | `/api/properties` | `limit=6` |
| `src/app/properties/page.tsx` | `GET` | `/api/properties` | `page, limit, search, city, categoryId, minRent, maxRent, bedrooms, isAvailable, sortBy, sortOrder` |
| `src/app/properties/[id]/page.tsx` | `GET` | `/api/properties/:id` | — |
| `src/app/properties/[id]/page.tsx` (related) | `GET` | `/api/properties` | `categoryId, limit=3` |
| `src/app/properties/page.tsx` (filter dropdown) | `GET` | `/api/categories` | — |

**Property list now includes** `averageRating` (0–5) and `reviewCount` on every item.

---

## Public Stats & Home

| Page / Component | Method | Endpoint |
|---|---|---|
| `src/app/page.tsx` (counters) | `GET` | `/api/stats` |
| `src/app/page.tsx` (testimonials) | `GET` | `/api/stats` (uses `topReviews`) |
| `src/app/about/page.tsx` | `GET` | `/api/stats` |
| `src/app/page.tsx` (latest articles) | `GET` | `/api/blog/latest?limit=3` |

**`/api/stats` response data:**
```json
{
  "totalUsers", "totalProperties", "availableProperties", "totalCities",
  "totalReviews", "totalBlogPosts", "averageRating",
  "categories": [{ "id", "name", "description", "_count": { "properties" } }],
  "topReviews": [{ "id", "rating", "comment", "tenant", "property" }]
}
```

---

## Blog

| Page / Component | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/blog/page.tsx` | `GET` | `/api/blog` | No (`page, limit, tag`) |
| `src/app/blog/[slug]/page.tsx` | `GET` | `/api/blog/:slug` | No (published only) |
| `src/app/page.tsx` (home preview) | `GET` | `/api/blog/latest?limit=3` | No |
| `src/app/dashboard/admin/blog/page.tsx` | `GET` | `/api/blog/admin/all` | ADMIN JWT |
| `src/app/dashboard/admin/blog/page.tsx` (create) | `POST` | `/api/blog` | ADMIN JWT |
| `src/app/dashboard/admin/blog/page.tsx` (edit / publish toggle) | `PATCH` | `/api/blog/:id` | ADMIN JWT |
| `src/app/dashboard/admin/blog/page.tsx` (delete) | `DELETE` | `/api/blog/:id` | ADMIN JWT |

**Create/update body:**
```json
{ "title": "string", "excerpt": "string", "content": "string", "coverImage": "string?", "tags": ["string"], "isPublished": true }
```
`slug` is auto-generated from the title when omitted.

---

## Contact & Newsletter

| Page / Component | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/contact/page.tsx` | `POST` | `/api/contact` | No |
| `src/app/page.tsx` (newsletter form) | `POST` | `/api/newsletter/subscribe` | No |
| `src/app/dashboard/admin/messages/page.tsx` | `GET` | `/api/contact?page&limit&status` | ADMIN JWT |
| `src/app/dashboard/admin/messages/page.tsx` | `PATCH` | `/api/contact/:id/status` | ADMIN JWT |
| (admin) newsletter list | `GET` | `/api/newsletter` | ADMIN JWT |

**Contact body:** `{ "name", "email", "subject", "message" }`
**Status body:** `{ "status": "NEW" | "REPLIED" }`
**Newsletter body:** `{ "email": "string" }` — returns 409 if already actively subscribed.

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
**Payment create-intent body:** `{ "rentalRequestId": "uuid" }`
**Payment confirm body:** `{ "rentalRequestId": "uuid", "paymentIntentId": "pi_stripe_id" }`
**Review body:** `{ "propertyId": "uuid", "rating": 1-5, "comment": "string?" }`

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

**Status update body:** `{ "status": "APPROVED" | "REJECTED" }`

---

## Admin Flow

| Page | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/dashboard/admin/page.tsx` | `GET` | `/api/admin/stats` | ADMIN JWT |
| `src/app/dashboard/admin/analytics/page.tsx` | `GET` | `/api/admin/analytics` | ADMIN JWT |
| `src/app/dashboard/admin/users/page.tsx` | `GET` | `/api/users?name&page&limit` | ADMIN JWT |
| `src/app/dashboard/admin/users/page.tsx` (ban/unban) | `PATCH` | `/api/users/:id/status` | ADMIN JWT |
| `src/app/dashboard/admin/page.tsx` (All Listings tab) | `GET` | `/api/properties?page&limit` | ADMIN JWT |
| `src/app/dashboard/admin/page.tsx` (Rental Requests tab) | `GET` | `/api/rental-requests?page&limit` | ADMIN JWT |
| `src/app/dashboard/admin/blog/page.tsx` | (see Blog table above) | | ADMIN JWT |
| `src/app/dashboard/admin/messages/page.tsx` | (see Contact table above) | | ADMIN JWT |

**`/api/admin/stats` data shape:** `{ "overview": { totalUsers, activeUsers, totalProperties, availableProperties, totalRentalRequests, pendingRequests, totalPayments, successfulPayments, totalReviews, totalRevenue }, "usersByRole": [...] }`

**`/api/admin/analytics` data shape:**
```json
{
  "revenueByMonth": [{ "month": "2026-08", "revenue": 0 }],
  "requestsByStatus": [{ "status", "count" }],
  "propertiesByCity": [{ "city", "count" }],
  "propertiesByCategory": [{ "name", "count" }],
  "usersByRole": [{ "role", "count" }],
  "avgRentByCity": [{ "city", "avgRent" }],
  "recentUsers": [...], "recentProperties": [...]
}
```

---

## Profile & Settings

| Page | Method | Endpoint | Auth |
|---|---|---|---|
| `src/app/dashboard/profile/page.tsx` | `PATCH` | `/api/users/:id` | Own JWT (or ADMIN) |
| `src/app/dashboard/profile/page.tsx` | `POST` | `/api/auth/change-password` | Any JWT |
| `src/app/dashboard/settings/page.tsx` | — | theme + notifications stored in `localStorage` only | — |

**Profile update body:** `{ "name"?, "phone"?, "profilePhoto"? }`

---

## Auth Token Flow

1. **Login** → JWT stored in Zustand store, `localStorage`, and a cookie.
2. **Every API request** → `src/lib/axios.ts` request interceptor reads `localStorage.accessToken` and adds `Authorization: Bearer <token>`.
3. **401 response** → interceptor silently calls `POST /api/auth/refresh-token` with `refreshToken`, updates token, retries original request.
4. **Route gating** → `src/app/dashboard/layout.tsx` guards `/dashboard/*` client-side (redirects to login with a `redirect` param when unauthenticated).

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
| — (new) | `POST /api/auth/social`, `GET /api/stats`, `GET|POST|PATCH|DELETE /api/blog*`, `POST /api/contact`, `PATCH /api/contact/:id/status`, `POST /api/newsletter/subscribe`, `GET /api/admin/analytics` |
