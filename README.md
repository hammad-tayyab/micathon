<div align="center">

<br/>

```
███╗   ██╗██╗ ██████╗ ██╗  ██╗ █████╗ ██████╗  █████╗  █████╗ ███╗   ██╗
████╗  ██║██║██╔════╝ ██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║
██╔██╗ ██║██║██║  ███╗███████║███████║██████╔╝███████║███████║██╔██╗ ██║
██║╚██╗██║██║██║   ██║██╔══██║██╔══██║██╔══██╗██╔══██║██╔══██║██║╚██╗██║
██║ ╚████║██║╚██████╔╝██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
```

**نگہبان**

### *Lock the Money. Release the Trust.*

<br/>

[![Status](https://img.shields.io/badge/STATUS-LIVE_MVP-F4A933?style=for-the-badge&labelColor=0D1B2A)](https://github.com/hammad-tayyab/nighabaan)
[![Built At](https://img.shields.io/badge/BUILT_AT-GIKI-0D1B2A?style=for-the-badge&labelColor=F4A933)](https://giki.edu.pk)
[![Market](https://img.shields.io/badge/TARGET_MARKET-PKR_50B%2B-F4A933?style=for-the-badge&labelColor=0D1B2A)](#)
[![License](https://img.shields.io/badge/LICENSE-MIT-0D1B2A?style=for-the-badge&labelColor=F4A933)](LICENSE)

<br/>

> **"آپ کی محنت، ہماری ذمہ داری"**
> 
> *Your hard work, our responsibility.*

<br/>

---

</div>

<br/>

## ⚡ What is Nighabaan?

Pakistan's informal labor sector moves **PKR 50 Billion+** every year — almost entirely on *handshakes and hope.*

**Nighabaan** (نگہبان, meaning *Guardian*) is a **Micro-Escrow platform** purpose-built for this market. It holds payment in a secure digital lock between homeowners and skilled workers — plumbers, carpenters, painters, electricians — and releases funds only when the job is done.

No middlemen. No vanishing acts. No broken promises.

**Just work. And pay.**

<br/>

---

## 🩸 The Problem Has a Name: *Trust Friction*

<br/>

> Every day across Pakistan, two sides of the same coin lose.

<br/>

<table>
<tr>
<td width="50%" valign="top">

### 🔨 Rafiq's Story
*The Worker's Grief*

Rafiq wakes at 5 AM. He buys his own tile adhesive. He spends 10 hours on his knees laying marble in a DHA house. 

At sunset, he knocks for payment.

The door doesn't open.

He goes home with nothing but aching hands and a lesson learned too late — **never trust a stranger with your livelihood.**

</td>
<td width="50%" valign="top">

### 🏠 Asad's Story
*The Homeowner's Regret*

Asad needs his bathroom fixed before Eid. He finds a plumber on Facebook. Pays PKR 8,000 advance. 

The plumber says "coming tomorrow."

Tomorrow never comes.

Asad files no FIR. There's no system for this. He swallows the loss and tells his wife — **never pay anyone upfront again.**

</td>
</tr>
</table>

<br/>

**These aren't edge cases. This is Tuesday in Pakistan.**

Nighabaan doesn't offer sympathy. It offers a **system.**

<br/>

---

## ✨ The Core Loop: *Lock → Work → Release*

<br/>

```
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │    HOMEOWNER                          WORKER            │
  │        │                                 │              │
  │        │  1. LOCK 🔒                     │              │
  │        │  ─────────────────────────────► │              │
  │        │  Deposits job total + 1% fee    │              │
  │        │  Funds held in escrow           │              │
  │        │                                 │              │
  │        │  2. WORK 🛠️                     │              │
  │        │  ◄───────────────────────────── │              │
  │        │                  Worker sees    │              │
  │        │                  locked balance │              │
  │        │                  Works with     │              │
  │        │                  certainty      │              │
  │        │                                 │              │
  │        │  3. RELEASE ✅                  │              │
  │        │  ─────────────────────────────► │              │
  │        │  Homeowner taps "Release"       │              │
  │        │  Worker paid instantly          │              │
  │        │                                 │              │
  └─────────────────────────────────────────────────────────┘
```

<br/>

No OTPs. No bureaucracy. No friction.

Just **three steps** that transform strangers into trusted partners.

<br/>

| Step | Actor | Action | Result |
|------|--------|--------|--------|
| 🔒 **LOCK** | Homeowner | Deposits job total + 1% Trust Fee | App signals: *Funds Secured* |
| 🛠️ **WORK** | Worker | Sees locked balance before starting | Works with **certainty** for the first time |
| ✅ **RELEASE** | Homeowner | Taps "Release" on completion | Worker paid **instantly** |

<br/>

---

## 🛠️ The Tech Fortress

> Engineering simplicity. No over-engineering. Maximum impact.

<br/>

```
nighabaan/
├── 🖥️  frontend/          ← React + Vite (User-Facing App)
│   ├── src/
│   │   ├── components/   ← Reusable UI blocks
│   │   ├── pages/        ← Route-level views
│   │   └── hooks/        ← Custom React logic
│   └── tailwind.config.js
│
├── ⚙️  backend/           ← Express API + Business Logic
│   ├── routes/           ← API endpoint definitions
│   ├── middleware/        ← JWT auth guards
│   ├── db/               ← SQLite schema & queries
│   └── server.js         ← Entry point (Port 5000)
│
└── 📦  package.json       ← Concurrently config (one command, full stack)
```

<br/>

### Full Stack Breakdown

| Layer | Technology | The *Why* |
|-------|-----------|-----------|
| **Frontend** | React 18 + Vite | Lightning-fast HMR, component-driven, mobile-first |
| **Styling** | Tailwind CSS | Utility-first — ships lean, looks sharp |
| **Backend** | Node.js + Express | Minimal, battle-tested, handles real-time transactions cleanly |
| **Database** | SQLite (`better-sqlite3`) | Zero-config, synchronous, perfect for rapid MVP iteration |
| **Auth** | JWT (JSON Web Tokens) | Stateless — scales without session servers |
| **Dev Workflow** | `concurrently` | One command spins the entire ecosystem |

<br/>

### Design DNA

```css
/* The Nighabaan Visual Identity */
--color-authority:  #0D1B2A;   /* Deep Navy    — Trust, Depth, Stability   */
--color-action:     #F4A933;   /* Amber        — Energy, Value, Warmth     */
--font-display:     'Baloo 2'; /* Friendly, Urdu-aesthetic, approachable   */
```

Authority. Action. Human.

<br/>

---

## 🚀 Get It Running

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
```

### One-Time Setup

```bash
# 1. Clone the vision
git clone https://github.com/hammad-tayyab/nighabaan.git
cd nighabaan

# 2. Install everything in one go
npm run install:all
```

### Launch the Full Stack

```bash
npm run dev
```

> Spins up:
> - 🖥️  **Frontend** → `http://localhost:5173` (Vite)
> - ⚙️  **Backend**  → `http://localhost:5000` (Express)

Both run concurrently. One terminal. Zero ceremony.

<br/>

### Environment Variables

Create a `.env` file in `/backend`:

```env
JWT_SECRET=your_super_secret_key_here
PORT=5000
DB_PATH=./db/nighabaan.sqlite
```

<br/>

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register as homeowner or worker |
| `POST` | `/api/auth/login` | ❌ | Get JWT token |
| `POST` | `/api/jobs/create` | ✅ | Homeowner creates & funds a job |
| `GET` | `/api/jobs/:id` | ✅ | Fetch job + escrow status |
| `PATCH` | `/api/jobs/:id/release` | ✅ | Homeowner releases funds to worker |
| `GET` | `/api/jobs/my` | ✅ | List all jobs for current user |

<br/>

---

## 📈 The Roadmap

```
2025 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2026+
  │                                                              │
  ●  Phase 1          ○  Phase 2          ○  Phase 3          ○  Phase 4
  │  Manual Release   │  Proof-of-Work    │  Easypaisa /      │  Community
  │  MVP ✅ DONE      │  Photo Uploads    │  JazzCash APIs    │  Ratings
  │                   │                   │                   │
  │  Core escrow      │  Workers upload   │  Real money       │  Trust scores
  │  flow working     │  before/after     │  movement via     │  for workers.
  │  end-to-end.      │  photos as        │  Pakistan's top   │  Pakistan's
  │                   │  proof of job.    │  mobile wallets.  │  labor graph.
```

<br/>

---

## 🌍 Why This Matters

<div align="center">

| Metric | Reality |
|--------|---------|
| Informal labor market size | **PKR 50B+** annually |
| Workers with formal contracts | **~3%** |
| Disputes with zero legal recourse | **Nearly all of them** |
| Nighabaan's target | **Every single one** |

</div>

<br/>

Pakistan's skilled workers are among the most industrious people on earth. They deserve a system that protects their sweat.

Nighabaan is that system.

<br/>

---

## 👥 The Team — *Malum Afraad*

*Built with grit, logic, and too much chai at GIKI.*

<br/>

| Role | Person |
|------|--------|
| 🧠 **Lead Developer** | Hammad Tayyab |
| 🎯 **Product Vision** | *(Team members)* |

<br/>

> *"Malum Afraad" — the people who know.*
> We know the problem. We built the solution.

<br/>

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

Please make sure to update tests as appropriate.

```bash
# Run tests
npm test

# Lint
npm run lint
```

<br/>

---

## 📄 License

MIT © 2025 Nighabaan — Malum Afraad @ GIKI

<br/>

---

<div align="center">

<br/>

**نگہبان**

*Guardian of the deal. Keeper of the word.*

<br/>

[![Star this repo](https://img.shields.io/badge/⭐_STAR_THIS_REPO-F4A933?style=for-the-badge&labelColor=0D1B2A)](https://github.com/hammad-tayyab/nighabaan)

<br/>

*Built at GIKI · Powered by trust · Made for Pakistan*

</div>
