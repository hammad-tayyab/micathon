<div align="center">

```
███╗   ██╗██╗ ██████╗ ██╗  ██╗ █████╗ ██████╗  █████╗  █████╗ ███╗   ██╗
████╗  ██║██║██╔════╝ ██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║
██╔██╗ ██║██║██║  ███╗███████║███████║██████╔╝███████║███████║██╔██╗ ██║
██║╚██╗██║██║██║   ██║██╔══██║██╔══██║██╔══██╗██╔══██║██╔══██║██║╚██╗██║
██║ ╚████║██║╚██████╔╝██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
```

### **نگہبان** — *Lock the Money. Release the Trust.*

[![Status](https://img.shields.io/badge/STATUS-LIVE_MVP-F4A933?style=for-the-badge&labelColor=0D1B2A)](https://github.com/hammad-tayyab/nighabaan)
[![Built At](https://img.shields.io/badge/BUILT_AT-GIKI-0D1B2A?style=for-the-badge&labelColor=F4A933)](https://giki.edu.pk)
[![Market](https://img.shields.io/badge/TARGET_MARKET-PKR_50B%2B-F4A933?style=for-the-badge&labelColor=0D1B2A)](#)
[![License](https://img.shields.io/badge/LICENSE-MIT-0D1B2A?style=for-the-badge&labelColor=F4A933)](LICENSE)

> *Pakistan's first micro-escrow platform for domestic services.*

</div>

---

## What is Nighabaan?

Pakistan's informal labor sector moves **PKR 50 Billion+** annually — almost entirely on handshakes and hope. Workers fear not getting paid. Homeowners fear paying upfront for work that never gets done.

**Nighabaan** (نگہبان, *Guardian*) solves this by acting as a secure digital intermediary. It locks payment in escrow when a job is created and releases it to the worker only when the job is marked complete.

No middlemen. No vanishing acts. No broken promises.

---

## Screenshots

| Landing Page | Dashboard | Job Detail |
|---|---|---|
| ![Landing](assets/Screenshot%202026-06-02%20182950.png) | ![Dashboard](assets/Screenshot%202026-06-02%20183025.png) | ![Job Detail](assets/Screenshot%202026-06-02%20183255.png) |

---

## The Core Loop: Lock → Work → Release

| Step | Who | Action | Result |
|------|-----|--------|--------|
| 🔒 **Lock** | Homeowner | Posts job + deposits amount + 1% fee | Worker sees funds secured |
| 🛠️ **Work** | Worker | Browses marketplace, accepts task | Works with certainty |
| ✅ **Release** | Homeowner | Marks job complete | Worker paid instantly |

---

## Features

**Role-Based Accounts**
Users register as either an **Owner** (homeowner) or a **Worker**. Each role gets a tailored dashboard experience.

**Escrow-Backed Jobs**
Homeowners create jobs with a title, description, city, and amount. Funds are locked on creation — workers see a guaranteed payout before accepting anything.

**Marketplace Dashboard**
Browse open jobs with live status badges (`open` / `hired` / `closed`). Homeowners manage applicants and control the hiring flow.

**Integrated PKR Wallet**
Every account has a built-in wallet (`balance_pkr`). Deposits, escrow holds, and worker payouts all flow through it seamlessly.

**Secure Auth**
Phone-number-based authentication via Supabase Auth. User data, roles, and balances are securely managed end-to-end.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Lucide React |
| Backend & DB | Supabase (PostgreSQL + Auth) |
| Routing | State-based (no React Router needed) |

---

## Getting Started

**Prerequisites:** Node ≥ 18, npm ≥ 9

```bash
git clone https://github.com/hammad-tayyab/micathon.git
cd micathon
npm install
npm run dev
```

Frontend → `http://localhost:5173`

**Environment variables** (`.env` in root):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Database

Powered by Supabase (PostgreSQL). Migrations in `supabase/migrations/`.

| Table | Purpose |
|-------|---------|
| `users` | Role-based accounts (owner / worker) |
| `jobs` | Listings with escrow status (`pending`, `locked`, `released`) |
| `escrow_transactions` | Full audit trail of all fund movements |

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| MVP — Manual Release | ✅ Done | Core escrow flow working end-to-end |
| Proof-of-Work | 🔜 Next | Workers upload before/after photos as job proof |
| Mobile Wallets | ⏳ Planned | Easypaisa / JazzCash API integration for real money movement |
| Trust Scores | ⏳ Planned | Community ratings and worker reputation graph |

---

## The Numbers

| Metric | Reality |
|--------|---------|
| Informal labor market | PKR 50B+ annually |
| Workers with formal contracts | ~3% |
| Disputes with legal recourse | Nearly zero |
| Nighabaan's target | All of them |

---

## Team — *Malum Afraad*

*Built with grit and too much chai at GIKI.*

| Role | Person |
|------|--------|
| 🧠 Lead Developer | Hammad Tayyab |

> *"Malum Afraad" — the people who know. We know the problem. We built the solution.*

---

## License

MIT © 2026 Nighabaan — Malum Afraad @ GIKI

---

<div align="center">

**نگہبان** · *Guardian of the deal. Keeper of the word.*

*Built at GIKI · Powered by trust · Made for Pakistan*

</div>