# RentNest Frontend — B7A5

Apollo Level-2 Web Dev | Assignment 5 | Frontend-only repository.

## 🔗 Live Links

| Resource | URL |
|---|---|
| **Frontend (Vercel)** | https://assignment5-5cqhj3czz-tanjipsuraitmahdin-gmailcoms-projects.vercel.app |
| **Backend API** | https://rentnest-api-cefz.onrender.com |
| **API Docs** | https://rentnest-api-cefz.onrender.com/api-docs |

---

## 🔑 Admin Credentials (for grading)

```
Email:    admin@rentnest.com
Password: Admin@12345
```

## 🧑‍💼 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@rentnest.com | Admin@12345 |

> 💡 Only the **Admin** account is pre-seeded on the live backend. Landlord and
> Tenant accounts can be created via the **Register** page (`/auth/register`) in
> about 30 seconds — just pick the role you want to test.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (custom components, no Shadcn)
- **Forms:** React Hook Form + Zod
- **Server State:** TanStack Query v5
- **Global State:** Zustand
- **Auth:** JWT via cookie + Next.js Middleware (role-gated routes)
- **Payments:** Stripe.js Elements (real card flow)
- **Deploy:** Vercel

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📝 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (`https://rentnest-api-cefz.onrender.com`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_…`) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Home (featured properties)
│   ├── properties/
│   │   ├── page.tsx                      # Browse + filter
│   │   └── [id]/page.tsx                 # Property detail + request modal
│   ├── auth/
│   │   ├── register/page.tsx             # Role-select + register form
│   │   └── login/page.tsx               # Login + role-based redirect
│   ├── dashboard/
│   │   ├── tenant/
│   │   │   ├── page.tsx                  # Requests + payments history
│   │   │   └── pay/[requestId]/page.tsx  # Stripe payment page
│   │   ├── landlord/
│   │   │   ├── page.tsx                  # Stats + listings table
│   │   │   ├── properties/
│   │   │   │   ├── new/page.tsx          # Create property
│   │   │   │   └── [id]/edit/page.tsx    # Edit property
│   │   │   └── requests/page.tsx         # Approve/reject requests
│   │   └── admin/
│   │       └── page.tsx                  # Stats + user management
│   ├── payment/
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── loading.tsx
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── Providers.tsx
│   ├── PropertyCard.tsx
│   ├── PropertyForm.tsx
│   ├── StatusBadge.tsx
│   └── ErrorBoundary.tsx
├── lib/
│   └── axios.ts                          # Axios instance + JWT interceptors
├── store/
│   └── authStore.ts                      # Zustand auth store
├── types/
│   └── index.ts                          # Shared TypeScript types
└── middleware.ts                          # Edge route protection
```

---

## 💳 Payment Flow

1. Tenant clicks **Pay Now** on an APPROVED request
2. Frontend calls `POST /api/payments/create-intent` → receives Stripe `clientSecret`
3. Stripe.js `CardElement` collects card details (no raw card data touches our server)
4. `stripe.confirmCardPayment(clientSecret)` called on form submit
5. On success → `POST /api/payments/confirm` to persist in DB
6. Redirect to `/payment/success`

**Test card:** `4242 4242 4242 4242` | Any future expiry | Any CVC

---

## 🔐 Route Protection

Next.js Middleware (`src/middleware.ts`) runs on every `/dashboard/*` request:
- Reads `accessToken` cookie
- Base64-decodes the JWT payload (Edge runtime has no Node.js crypto)
- Checks `role` field and redirects if wrong role or unauthenticated

---

## 📖 API Integration

See [API_INTEGRATION.md](./API_INTEGRATION.md) for the complete mapping of every frontend component to its backend endpoint.
