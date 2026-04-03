<div align="center">

<br />

```
██████╗ ██████╗  ██████╗ ███████╗██╗████████╗ █████╗ ██╗  ██╗   ██╗
██╔══██╗██╔══██╗██╔═══██╗██╔════╝██║╚══██╔══╝██╔══██╗██║  ╚██╗ ██╔╝
██████╔╝██████╔╝██║   ██║█████╗  ██║   ██║   ███████║██║   ╚████╔╝ 
██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██║   ██║   ██╔══██║██║    ╚██╔╝  
██║     ██║  ██║╚██████╔╝██║     ██║   ██║   ██║  ██║███████╗██║   
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝   
```

**The intelligent stock market platform for the next generation of investors.**

<br />

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

<br />

[**Live Demo**](https://profitaly.vercel.app) · [**Report Bug**](https://github.com/TheVijayVignesh/Profitaly/issues) · [**Request Feature**](https://github.com/TheVijayVignesh/Profitaly/issues)

<br />

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#-project-structure)
- [Core Modules](#-core-modules)
- [Database Schema](#-database-schema)
- [API Integrations](#-api-integrations)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

**ProfitAly** is a full-featured, production-grade stock market learning and analysis platform designed to bridge the gap between financial education and real-world investing. Whether you're a complete beginner or a seasoned trader looking to test new strategies risk-free, ProfitAly gives you the tools, data, and AI-driven insights to make smarter investment decisions.

> *"Invest smarter. Learn faster. Trade confidently."*

The platform combines **real-time market data**, a **virtual trading sandbox**, **AI-powered recommendations**, and a **comprehensive analytics dashboard** — all in one beautifully designed, responsive interface.

### Why ProfitAly?

- 📚 **Learn without risk** — Practice trading with $10,000 in virtual capital before committing real money
- 🤖 **AI at your fingertips** — Get personalized investment insights powered by advanced AI models
- 🌍 **Global market access** — Trade across NSE (India), NYSE, and NASDAQ from a single platform
- ⚡ **Real-time everything** — Live prices, live news, live portfolio updates
- 🎨 **Beautifully designed** — A professional-grade UI that makes finance feel approachable

---

## ✨ Features

### 🏠 Dashboard
A powerful command center that gives you a bird's-eye view of your entire investment universe at a glance.
- **Portfolio Overview** — Total value, P&L, and performance metrics front and center
- **Live Watchlist** — Real-time price updates for your tracked stocks
- **Recent Transactions** — Instant access to your latest trade history
- **Market News Feed** — Curated financial news relevant to your holdings
- **Performance Charts** — Visual breakdowns of portfolio growth over time

### 📈 Stock Explorer
Deep-dive into any stock with institutional-grade research tools.
- **Global Search** — Find any stock across NSE, NYSE, and NASDAQ with autocomplete
- **Interactive Price Charts** — Fully interactive candlestick and line charts with zoom/pan
- **Company Financials** — Revenue, earnings, margins, and key financial ratios
- **Technical Indicators** — RSI, MACD, Bollinger Bands, and more
- **Analyst Ratings** — Aggregated buy/hold/sell recommendations from top analysts
- **Insider Trading Data** — Track what company insiders are buying and selling

### 🎮 Trial Room (Virtual Trading)
A completely risk-free paper trading environment that mirrors real market conditions.
- **$10,000 Starting Capital** — Begin your journey with a realistic portfolio size
- **Real-time Execution** — Trades execute at live market prices
- **Multi-Market Support** — Trade stocks from NSE, NYSE, and NASDAQ
- **Portfolio Analytics** — Track win rate, ROI, Sharpe ratio, and more
- **Full Transaction History** — Every trade logged and searchable
- **Performance Benchmarking** — Compare your returns against market indices

### 🤖 Smart Advisor (AI-Powered)
Your personal AI investment advisor, available 24/7.
- **Personalized Profiling** — Tailored advice based on your risk tolerance and goals
- **Goal-Based Strategies** — Investment plans aligned to your specific financial objectives
- **Sector Recommendations** — AI-curated sector allocations based on market conditions
- **Portfolio Optimization** — Suggestions to rebalance and improve your existing portfolio
- **Educational Insights** — Learn the "why" behind every recommendation
- **Market Sentiment Analysis** — AI interpretation of news and market trends

### 👤 Profile & Settings
Full control over your ProfitAly experience.
- **Investment Preferences** — Customize your risk profile and sector interests
- **Dark / Light Mode** — System preference detection with manual override
- **Notification Settings** — Alerts for price movements, news, and portfolio milestones
- **Account Security** — Email verification and secure password management

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.5.3 | Type safety |
| Vite + SWC | 5.4.19 | Build tool & HMR |
| Tailwind CSS | 3.4.11 | Utility-first styling |
| shadcn/ui | Latest | Component library |
| Radix UI | Latest | Accessible primitives |
| Recharts | 2.12.7 | Data visualization |
| Chart.js | 4.4.9 | Advanced charting |
| TanStack Query | 5.56.2 | Server state management |
| React Router | 6.26.2 | Client-side routing |

### Backend & Database
| Technology | Version | Purpose |
|---|---|---|
| Firebase Auth | 10.14.1 | Authentication |
| Neon PostgreSQL | Latest | Primary database |
| Drizzle ORM | Latest | Type-safe SQL ORM |
| Vercel Serverless | Latest | API route hosting |

### External APIs
| API | Purpose |
|---|---|
| TwelveData | Real-time stock prices & historical data |
| Finnhub | Company financials & earnings |
| NewsAPI | Financial news aggregation |
| Perplexity AI | Market analysis & AI insights |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                             │
│   React + TypeScript + Vite                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │Dashboard │  │ Stocks   │  │ Trial    │  │  Smart   │  │
│   │          │  │ Explorer │  │ Room     │  │ Advisor  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              TanStack Query (Cache Layer)            │  │
│   └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
   ┌─────────────┐ ┌──────────────┐ ┌─────────────┐
   │  Vercel     │ │   Firebase   │ │  External   │
   │  API Routes │ │     Auth     │ │    APIs     │
   │ /api/*      │ └──────────────┘ │ TwelveData  │
   └──────┬──────┘                  │ Finnhub     │
          │                         │ NewsAPI     │
          ▼                         │ Perplexity  │
   ┌─────────────┐                  └─────────────┘
   │    Neon     │
   │ PostgreSQL  │
   │  (Drizzle  │
   │    ORM)    │
   └─────────────┘
```

### Key Architectural Decisions

- **Serverless API Routes** — All database operations go through Vercel serverless functions, keeping credentials server-side and never exposing them to the browser
- **Firebase Auth Only** — Firebase is used exclusively for authentication; all application data lives in Neon PostgreSQL for full SQL control and scalability  
- **TanStack Query** — Intelligent caching layer that minimizes API calls and keeps the UI responsive with optimistic updates
- **Drizzle ORM** — Type-safe database queries that catch schema errors at compile time, not runtime

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version   # v18.0.0 or higher
npm --version    # v9.0.0 or higher
git --version    # any recent version
```

You'll also need accounts with:
- [Firebase](https://console.firebase.google.com/) — for authentication
- [Neon](https://neon.tech/) — for the PostgreSQL database
- [TwelveData](https://twelvedata.com/) — for stock market data
- [Finnhub](https://finnhub.io/) — for company financials
- [NewsAPI](https://newsapi.org/) — for financial news
- [Perplexity](https://www.perplexity.ai/) — for AI features

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/TheVijayVignesh/Profitaly.git
cd Profitaly

# 2. Install dependencies
npm install

# 3. Set up your environment variables (see below)
cp .env.example .env

# 4. Push the database schema to Neon
npx drizzle-kit push

# 5. Start the development server
npm run dev
```

The app will be running at **http://localhost:8080**

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ── Neon PostgreSQL ─────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host-unpooled/neondb?sslmode=require
PGHOST=your-pooler-host.neon.tech
PGUSER=your_user
PGDATABASE=neondb
PGPASSWORD=your_password

# ── Firebase Auth ────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ── Market Data APIs ─────────────────────────────────────────
VITE_TWELVEDATA_API_KEY=your_twelvedata_key
VITE_FINNHUB_API_KEY=your_finnhub_key
VITE_NEWSAPI_KEY=your_newsapi_key

# ── AI ───────────────────────────────────────────────────────
VITE_PERPLEXITY_API_KEY=your_perplexity_key
```

> ⚠️ **Never commit your `.env` file.** It is gitignored by default. Use `.env.example` as a reference template for collaborators.

---

## 📁 Project Structure

```
Profitaly/
│
├── api/                          # Vercel serverless API routes
│   ├── db.ts                     # Shared Neon DB client for API routes
│   ├── users/
│   │   └── [id].ts               # GET/POST user profile
│   ├── portfolios/
│   │   ├── index.ts              # GET all portfolios, POST create
│   │   └── [id].ts               # GET/PUT/DELETE single portfolio
│   ├── holdings/
│   │   └── index.ts              # GET/POST holdings
│   ├── transactions/
│   │   └── index.ts              # GET/POST transactions
│   ├── watchlist/
│   │   └── index.ts              # GET/POST/DELETE watchlist
│   └── recommendations/
│       └── index.ts              # GET/POST AI recommendations
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui base components (49)
│   │   ├── trial-room/           # Virtual trading components (13)
│   │   ├── ai-insights/          # AI insight components (5)
│   │   ├── profile/              # Profile management (7)
│   │   ├── settings/             # Settings components (1)
│   │   ├── Layout.tsx            # Root layout wrapper
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── MainSidebar.tsx       # Side navigation
│   │   └── StockCard.tsx         # Reusable stock display card
│   │
│   ├── pages/                    # Route-level page components
│   │   ├── Index.tsx             # Landing page
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Stocks.tsx            # Stock explorer
│   │   ├── TrialRoom.tsx         # Virtual trading
│   │   └── SmartAdvisor.tsx      # AI advisor
│   │
│   ├── services/                 # External API integrations
│   │   ├── dbService.ts          # Neon DB service (CRUD operations)
│   │   ├── twelveDataService.ts  # TwelveData market data
│   │   ├── finnhubService.ts     # Finnhub financials
│   │   └── newsApiService.ts     # NewsAPI news feed
│   │
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle ORM table definitions
│   │   └── index.ts              # DB client instance
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React context providers
│   ├── utils/                    # Helper utilities
│   └── types/                    # TypeScript type definitions
│
├── drizzle/                      # Generated migration files
├── drizzle.config.ts             # Drizzle ORM configuration
├── vercel.json                   # Vercel deployment configuration
├── vite.config.ts                # Vite build configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## 🧩 Core Modules

### Virtual Trading Engine

The Trial Room implements a complete paper trading engine with the following logic:

```
User places order
       │
       ▼
Fetch live price from TwelveData API
       │
       ▼
Validate: sufficient cash balance (BUY) or shares owned (SELL)
       │
       ▼
Execute trade at current market price
       │
       ├── Record transaction in PostgreSQL
       ├── Update holding quantity & average cost
       └── Update portfolio cash balance
       │
       ▼
Recalculate portfolio P&L and metrics
```

**Key metrics calculated:**
- **Unrealized P&L** — `(current price − avg cost) × quantity`
- **Total Return %** — `(current value / cost basis − 1) × 100`
- **Sharpe Ratio** — Risk-adjusted return relative to portfolio volatility
- **Win Rate** — Percentage of closed positions that were profitable

### AI Recommendation Engine

```
User completes investment profile
       │
       ├── Risk tolerance (Conservative / Moderate / Aggressive)
       ├── Investment goals (Growth / Income / Preservation)
       ├── Time horizon (Short / Medium / Long term)
       └── Sector preferences
       │
       ▼
Profile sent to Perplexity AI with market context
       │
       ▼
AI generates scored, ranked stock recommendations
       │
       ▼
Recommendations stored in PostgreSQL & displayed to user
```

---

## 🗄 Database Schema

ProfitAly uses **Neon PostgreSQL** with **Drizzle ORM** for type-safe database access.

```sql
-- Users (synced from Firebase Auth)
users (id PK, email, display_name, photo_url, investment_profile JSONB, preferences JSONB, created_at, updated_at)

-- Portfolios (each user can have multiple)
portfolios (id UUID PK, user_id → users, name, cash_balance NUMERIC, total_value NUMERIC, created_at, updated_at)

-- Holdings (stocks currently held in a portfolio)
holdings (id UUID PK, portfolio_id → portfolios, user_id, symbol, company_name, quantity NUMERIC, average_cost NUMERIC, exchange, updated_at)

-- Transactions (full trade history)
transactions (id UUID PK, user_id → users, portfolio_id → portfolios, symbol, type [BUY|SELL], quantity NUMERIC, price NUMERIC, total NUMERIC, exchange, executed_at)

-- Watchlists (stocks user is tracking)
watchlists (id UUID PK, user_id → users, symbol, company_name, exchange, added_at)

-- Recommendations (AI-generated picks)
recommendations (id UUID PK, user_id → users, symbol, reasoning TEXT, risk_level, score NUMERIC, is_active BOOLEAN, generated_at)
```

To apply the schema to your Neon database:

```bash
# Push schema directly (recommended for development)
npx drizzle-kit push

# Or generate and run migration files
npx drizzle-kit generate
npx drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio
```

---

## 🔌 API Integrations

### TwelveData
Used for real-time and historical stock market data.
- **Endpoints used:** `/price`, `/time_series`, `/quote`, `/symbol_search`
- **Rate limit:** 8 requests/minute (free tier)
- **Get your key:** [twelvedata.com](https://twelvedata.com/)

### Finnhub
Used for company fundamentals and analyst data.
- **Endpoints used:** `/stock/metric`, `/stock/recommendation`, `/stock/insider-transactions`, `/company-earnings`
- **Rate limit:** 60 requests/minute (free tier)
- **Get your key:** [finnhub.io](https://finnhub.io/)

### NewsAPI
Used for aggregated financial news.
- **Endpoints used:** `/everything`, `/top-headlines`
- **Rate limit:** 100 requests/day (free tier)
- **Get your key:** [newsapi.org](https://newsapi.org/)

### Perplexity AI
Used for AI-powered market analysis and recommendations.
- **Model used:** `llama-3.1-sonar-large-128k-online`
- **Get your key:** [perplexity.ai](https://www.perplexity.ai/)

---

## ☁️ Deployment

### One-Click Vercel Deployment

ProfitAly is fully configured for Vercel deployment. After your first setup, deploying is as simple as pushing to `main`.

#### First-time setup:

**1. Push your code to GitHub**
```bash
git add .
git commit -m "initial commit"
git push origin main
```

**2. Import on Vercel**
- Go to [vercel.com](https://vercel.com) → **Add New Project**
- Import your GitHub repository
- Vercel auto-detects Vite — verify settings:
  - **Framework**: Vite
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

**3. Add environment variables**

In the Vercel dashboard under **Settings → Environment Variables**, add all variables from your `.env` file.

**4. Deploy**

Click **Deploy**. Your app will be live in ~2 minutes.

**5. Initialize the database (one time only)**
```bash
npx drizzle-kit push
```

#### Every deployment after that:
```bash
git add .
git commit -m "your changes"
git push
# Vercel auto-deploys ✅
```

### Available Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run db:push      # Push schema to Neon (no migration files)
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio visual browser
```

---

## 🗺 Roadmap

### In Progress
- [ ] WebSocket integration for true real-time streaming prices
- [ ] Advanced technical analysis charting tools

### Planned
- [ ] **Options Trading** — Paper trade calls and puts
- [ ] **Social Trading** — Follow top-performing users and copy their strategies
- [ ] **Mobile App** — React Native companion app
- [ ] **Crypto Support** — BTC, ETH, and top altcoins
- [ ] **Internationalization** — Multi-language support (Hindi, Tamil, Spanish)
- [ ] **Public API** — Allow developers to build on the ProfitAly platform
- [ ] **Machine Learning** — Predictive price modeling using historical patterns
- [ ] **Tax Reports** — Automated capital gains calculation and export

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place. Any contributions you make are **greatly appreciated**.

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

Please make sure your code:
- Passes `npm run lint` with no errors
- Follows the existing TypeScript patterns
- Includes type definitions for any new data structures
- Works with both dark and light mode

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) — For the incredible component library
- [TwelveData](https://twelvedata.com/) — For reliable market data
- [Neon](https://neon.tech/) — For serverless PostgreSQL
- [Vercel](https://vercel.com/) — For effortless deployment
- [Drizzle ORM](https://orm.drizzle.team/) — For type-safe database access

---

<div align="center">

Made with ❤️ by [Vijay Vignesh](https://github.com/TheVijayVignesh)

⭐ **Star this repo if you found it useful!** ⭐

</div>
