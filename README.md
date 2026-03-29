# Vested — Crypto Copy-Trading Platform

A professional Web3 / crypto investment and copy-trading platform with a full user dashboard and a superadmin control panel. Built with React, Vite, Tailwind CSS v4, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui (New York style) |
| Routing | React Router v7 |
| State/Data | TanStack Query v5 |
| Auth & DB | Supabase (Auth + PostgreSQL) |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Package manager | pnpm (monorepo) |
| Deploy target | Vercel |

---

## Project Structure

```
artifacts/vested/
├── public/
│   ├── favicon.svg
│   └── opengraph.jpg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Main authenticated shell
│   │   │   └── Sidebar.tsx        # Collapsible sidebar (user + admin nav)
│   │   ├── ui/                    # shadcn/ui component library (full set)
│   │   ├── AdminRoute.tsx         # Route guard — admin only
│   │   └── ProtectedRoute.tsx     # Route guard — authenticated users
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts                 # Supabase CRUD helpers (all tables)
│   │   ├── auth.tsx               # AuthProvider + useAuth hook
│   │   ├── supabase.ts            # Supabase client + Database type definitions
│   │   └── utils.ts               # cn() utility
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminTransactions.tsx
│   │   │   ├── ManageCryptos.tsx
│   │   │   ├── ManageTraders.tsx
│   │   │   ├── ManageUsers.tsx
│   │   │   └── PlatformSettings.tsx
│   │   ├── Auth.tsx               # Login + Sign-up page
│   │   ├── CopyTrading.tsx        # Copy trading marketplace
│   │   ├── Dashboard.tsx          # User portfolio overview
│   │   ├── Landing.tsx            # Public marketing page
│   │   ├── Portfolio.tsx          # Holdings breakdown
│   │   ├── Settings.tsx           # User profile settings
│   │   ├── Trade.tsx              # Buy/Sell interface
│   │   ├── Transactions.tsx       # Transaction history
│   │   └── not-found.tsx          # 404 fallback
│   ├── App.tsx                    # Root router + providers
│   ├── index.css                  # Tailwind v4 theme + CSS variables
│   └── main.tsx                   # React DOM root
├── schema.sql                     # Supabase SQL schema (run once in SQL Editor)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## Routes

### Public
| Path | Component |
|---|---|
| `/landing` | Landing page (marketing) |
| `/auth` | Login / Sign-up |
| `/*` (catch-all) | Redirects to `/landing` |

### User (requires login)
| Path | Component |
|---|---|
| `/` | Dashboard |
| `/portfolio` | Portfolio holdings |
| `/trade` | Buy / Sell |
| `/copy-trading` | Copy traders marketplace |
| `/transactions` | Transaction history |
| `/settings` | Profile settings |

### Admin (requires `role = 'admin'`)
| Path | Component |
|---|---|
| `/admin` | Admin dashboard overview |
| `/admin/users` | Manage users |
| `/admin/cryptos` | Manage listed cryptocurrencies |
| `/admin/traders` | Manage copy traders |
| `/admin/transactions` | All platform transactions |
| `/admin/settings` | Platform-wide settings |

---

## Environment Variables

### Required
These must be set before the app will work. In Vercel, add them under **Settings → Environment Variables**.

| Variable | Description | Where to get it |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | Supabase Dashboard → Project → API |

> **Important:** Both variables must be prefixed with `VITE_` for Vite to expose them to the browser bundle.

### Optional (set automatically by deployment)
| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `production` | Set by Vercel automatically |
| `BASE_PATH` | `/` | Root path prefix (set in vercel.json) |

---

## Supabase Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New project.

### 2. Run the schema
Open the **SQL Editor** in your Supabase dashboard and paste the full contents of `schema.sql`. This creates:
- `users` table (linked to Supabase `auth.users`)
- `user_balances` table
- `cryptocurrencies` table (with 10 sample coins seeded)
- `portfolio` table
- `transactions` table
- `copy_traders` table (with 4 sample traders seeded)
- `copy_trades` table
- `platform_settings` table
- Row Level Security (RLS) policies for all tables
- Admin views: `admin_transactions`, `admin_user_summary`
- Auto-update triggers

### 3. Enable Email Auth
Supabase Dashboard → Authentication → Providers → Email → Enable.

### 4. Row Level Security
The `schema.sql` configures RLS policies. Admins are determined by the `role` column in the `users` table. To promote a user to admin, run in the SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Copy API credentials
Go to **Project → API** and copy:
- `Project URL` → set as `VITE_SUPABASE_URL`
- `anon` public key → set as `VITE_SUPABASE_ANON_KEY`

---

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+

### Setup
```bash
# Install all workspace dependencies
pnpm install

# Create a .env.local file in artifacts/vested/
cat > artifacts/vested/.env.local << 'EOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# Start the dev server
pnpm --filter @workspace/vested run dev
```

The app will be available at `http://localhost:21058`.

### Available Commands
```bash
# Dev server with HMR
pnpm --filter @workspace/vested run dev

# Production build
pnpm --filter @workspace/vested run build

# Preview production build locally
pnpm --filter @workspace/vested run serve

# TypeScript type check only
pnpm --filter @workspace/vested run typecheck
```

---

## Deploying to Vercel

### Method 1: Deploy from GitHub (recommended)

1. Push this entire repo to GitHub (the monorepo root, not just `artifacts/vested/`).
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Vercel will auto-detect the `vercel.json` inside `artifacts/vested/`.

**Configure the project in Vercel:**
- **Root Directory:** `artifacts/vested`
- **Build Command:** `pnpm install --no-frozen-lockfile && pnpm --filter @workspace/vested run build`
- **Output Directory:** `dist/public`
- **Install Command:** `pnpm install --no-frozen-lockfile`
- **Framework Preset:** Other

4. Add Environment Variables:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

5. Click **Deploy**.

> **Tip:** Since this is a pnpm monorepo, Vercel must run `pnpm install` from the **monorepo root** (not `artifacts/vested/`). The `vercel.json` inside `artifacts/vested/` handles this with `--filter @workspace/vested`.

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# From the monorepo root
vercel --cwd artifacts/vested

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Vercel JSON Explained

The `artifacts/vested/vercel.json`:
```json
{
  "buildCommand": "pnpm install --no-frozen-lockfile && pnpm --filter @workspace/vested run build",
  "outputDirectory": "artifacts/vested/dist/public",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "NODE_ENV": "production",
    "BASE_PATH": "/"
  }
}
```

The `rewrites` rule is essential — it makes React Router's client-side routing work correctly on Vercel (all URLs serve `index.html`). Without it, refreshing any page other than `/` would return a 404.

---

## Deploying on Other Platforms

### Netlify
1. Build command: `pnpm install --no-frozen-lockfile && pnpm --filter @workspace/vested run build`
2. Publish directory: `artifacts/vested/dist/public`
3. Create `artifacts/vested/public/_redirects`:
   ```
   /*  /index.html  200
   ```
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.

### Docker / Self-hosted
```dockerfile
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/vested run build

FROM nginx:alpine
COPY --from=builder /app/artifacts/vested/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Example `nginx.conf`:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Common Deployment Issues & Fixes

| Error | Cause | Fix |
|---|---|---|
| `VITE_SUPABASE_URL is undefined` | Env vars not set | Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel dashboard |
| 404 on page refresh | SPA routes not rewired | The `rewrites` in `vercel.json` handles this — ensure it's present |
| Build error: `Cannot find module` | pnpm workspace dep missing | Run `pnpm install --no-frozen-lockfile` from the monorepo root |
| Blank page after deploy | Wrong output directory | Set output to `artifacts/vested/dist/public` NOT `dist/` or `public/` |
| Auth redirect loop | Supabase callback URL not configured | Add your Vercel domain to Supabase → Auth → URL Configuration → Site URL |
| `Cannot apply unknown utility class` (dev only) | Tailwind v4 dev scanner false positive | Does not affect production build; safely ignorable in dev |

---

## Auth Flow

1. User visits `/` → `ProtectedRoute` checks for session → redirects to `/landing` if not authenticated.
2. User clicks Sign Up / Login → `/auth` page.
3. Supabase Auth handles email + password.
4. On success, `AuthProvider` calls `fetchAppUser()` to get the app-level user record from `public.users`.
5. If no record exists (first login), it creates one automatically with `role = 'user'` and a zero `user_balances` record.
6. Admin users (`role = 'admin'`) can access `/admin/*` routes.

---

## Database Schema Summary

| Table | Purpose |
|---|---|
| `users` | App-level user profiles (extends Supabase auth) |
| `user_balances` | USD balance, total invested, total P&L per user |
| `cryptocurrencies` | Platform-listed tradeable assets with prices |
| `portfolio` | User crypto holdings (coin + amount + avg buy price) |
| `transactions` | Full audit trail (deposits, withdrawals, buys, sells, copy profits) |
| `copy_traders` | Available traders to copy (curated by admin) |
| `copy_trades` | Active copy-trade allocations per user |
| `platform_settings` | Key-value store for admin-configurable settings |

---

## Security Notes

- All sensitive operations are protected by Supabase RLS policies.
- Admin routes are double-protected: frontend guard (`AdminRoute`) + Supabase RLS on the DB.
- No secrets are stored in the frontend bundle — only the public `anon` key is used.
- The `anon` key is safe to expose in the frontend (Supabase designed it this way; RLS enforces data access).

---

## Contributing / Development Notes

- This is a **static SPA** — there is no backend server. All data goes through Supabase directly.
- The `api.ts` file contains all Supabase query helpers. Add new queries there.
- The `supabase.ts` file contains the full TypeScript database type definitions. Update when you change the schema.
- shadcn/ui components are in `src/components/ui/` — do not modify them directly; regenerate with `npx shadcn@latest add <component>`.
- Use `sonner` for toast notifications (already wired in `App.tsx`).

---

## License

Private — all rights reserved.
