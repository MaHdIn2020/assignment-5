# RentNest Frontend — B7A5

Apollo Level-2 Web Dev | Assignment 5 | Frontend-only repository.

## 🔗 Live Links

| Resource | URL |
|---|---|
| **Frontend (Vercel)** | https://assignment5-ashy.vercel.app |
| **Backend API** | https://rentnest-api-cefz.onrender.com |
| **API Docs (Swagger)** | https://rentnest-api-cefz.onrender.com/api-docs |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@rentnest.com | Admin@12345 |
| Landlord | landlord@rentnest.com | Landlord@12345 |
| Landlord 2 | landlord2@rentnest.com | Landlord@12345 |
| Tenant | tenant@rentnest.com | Tenant@12345 |

> 💡 All roles are pre-seeded and verified against the live backend. The login
> page also has **one-click demo login** buttons and **mock Google/Facebook**
> sign-in (creates a tenant account when the email is new).

---

## ✨ Features

- **Browse & filter** properties by keyword search, city, type, rent range,
  bedrooms and availability, with sorting and pagination
- **Property detail** with image gallery, rating summary, key info, reviews,
  landlord contact and related properties
- **Tenant flow** — request to rent, Stripe test payment, review & rating
- **Landlord flow** — create/edit/delete listings, approve or reject requests
- **Admin panel** — stats overview, user management (ban/unban), content
  moderation, blog CMS, contact-message inbox, and a Recharts analytics page
- **Blog** — public listing with tag filter, article pages with markdown content
- **Contact & newsletter** — working contact form and newsletter subscription
- **Auth** — register/login, role-based dashboards, profile editing, change
  password, mock social login
- **Theme system** — dark (default) / light toggle persisted in localStorage

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (semantic CSS tokens, custom components, no Shadcn)
- **Forms:** React Hook Form + Zod
- **Server State:** TanStack Query v5
- **Global State:** Zustand
- **Charts:** Recharts
- **Markdown:** react-markdown (blog content)
- **Auth:** JWT via Zustand + `localStorage` + cookie (client-side route guards)
- **Payments:** Stripe.js Elements (test mode)
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
│   ├── page.tsx                          # Home (11 sections incl. blog + newsletter)
│   ├── properties/
│   │   ├── page.tsx                      # Browse + search + sort + filters
│   │   └── [id]/page.tsx                 # Detail + request modal + related
│   ├── blog/
│   │   ├── page.tsx                      # Public blog listing (tag filter)
│   │   └── [slug]/page.tsx               # Article (markdown)
│   ├── about/  contact/  help/  privacy/  terms/    # Static/public pages
│   ├── auth/
│   │   ├── register/page.tsx             # Role-select + register form
│   │   └── login/page.tsx                # Login + demo + social login
│   ├── dashboard/
│   │   ├── layout.tsx                    # Role-aware sidebar + auth guard
│   │   ├── profile/page.tsx              # Edit profile + change password
│   │   ├── settings/page.tsx             # Theme + notification prefs
│   │   ├── tenant/
│   │   │   ├── page.tsx                  # Requests + payments + review
│   │   │   └── pay/[requestId]/page.tsx  # Stripe payment page
│   │   ├── landlord/
│   │   │   ├── page.tsx                  # Stats + listings table
│   │   │   ├── properties/new + [id]/edit
│   │   │   └── requests/page.tsx         # Approve/reject requests
│   │   └── admin/
│   │       ├── page.tsx                  # Stats + content moderation
│   │       ├── analytics/page.tsx        # Recharts charts
│   │       ├── users/page.tsx            # User management (ban/unban)
│   │       ├── blog/page.tsx             # Blog CMS
│   │       └── messages/page.tsx         # Contact inbox
│   ├── payment/success + cancel
│   ├── error.tsx / not-found.tsx / loading.tsx
├── components/
│   ├── layout/Navbar.tsx + Footer.tsx
│   ├── DataTable.tsx                     # Reusable table + pagination
│   ├── SocialIcons.tsx                   # Inline SVG brand icons
│   ├── ThemeToggle.tsx
│   ├── PropertyCard.tsx / PropertyForm.tsx / StatusBadge.tsx
│   └── Providers.tsx / ErrorBoundary.tsx
├── lib/
│   ├── axios.ts                          # Axios instance + JWT interceptors
│   └── theme.ts                          # Theme hook (dark/light)
├── store/authStore.ts                    # Zustand auth store
├── types/index.ts                        # Shared TypeScript types
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

`src/app/dashboard/layout.tsx` guards every `/dashboard/*` route client-side:
- Reads the auth store (hydrated from `localStorage` on mount)
- Redirects unauthenticated users to `/auth/login?redirect=<route>`
- Renders a role-aware sidebar (Admin / Landlord / Tenant menus)

---

## 📖 API Integration

See [API_INTEGRATION.md](./API_INTEGRATION.md) for the complete mapping of every
frontend component to its backend endpoint.
