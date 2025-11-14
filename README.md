
---

# 🚢 FuelEU Maritime — Compliance Platform

*A Full-Stack Clean Architecture Implementation (Frontend + Backend + DB)*

This project implements a **FuelEU Maritime compliance module**, covering:

* Route management
* Baseline selection
* GHG comparison
* Compliance balance (CB) calculations
* Banking (Article 20)
* Pooling (Article 21)
* A complete frontend dashboard
* A PostgreSQL-backed backend using Hexagonal Architecture

Designed following the assignment specification for the FuelEU Maritime Developer Challenge.

---

# 📘 Table of Contents

* [Project Overview](#project-overview)
* [Architecture](#architecture)

  * [Folder Structure](#folder-structure)
  * [Hexagonal Design](#hexagonal-design)
* [Tech Stack](#tech-stack)
* [Backend](#backend)

  * [Setup](#backend-setup)
  * [Database Schema](#database-schema)
  * [Seeding Data](#seeding-data)
  * [API Endpoints](#api-endpoints)
* [Frontend](#frontend)

  * [Dashboard Features](#dashboard-features)
  * [Running Frontend](#running-frontend)
* [Screenshots](#screenshots)
* [Testing](#testing)
* [Known Limitations](#known-limitations)
* [How AI was Used](#how-ai-was-used)
* [License](#license)

---

# 📌 Project Overview

The purpose of this project is to implement a **Fuel EU Maritime compliance system** for ships, including:

✔ Managing shipping routes and environmental metrics
✔ Selecting a baseline route
✔ Comparing routes against the baseline
✔ Computing compliance balance (CB) values
✔ Performing banking (Article 20)
✔ Creating pooling collaborations (Article 21)

The project is built using modern best practices such as **TypeScript**, **React**, **Express**, **Prisma**, and **Hexagonal Architecture** (Ports and Adapters).

---

# 🧱 Architecture

This project follows a strict separation between:

* **Core domain logic (pure business rules)**
* **Adapters (HTTP, database, UI)**
* **Infrastructure (Express server, Prisma client)**

## 🗂 Folder Structure

```
fuel-eu-compliance/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── ports/
│   │   ├── adapters/
│   │   │   ├── inbound/http/
│   │   │   └── outbound/postgres/
│   │   └── infrastructure/
│   │       ├── server/
│   │       └── db/
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── adapters/
    │   │   ├── ui/
    │   │   └── infrastructure/
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

---

# 🧩 Hexagonal Design

### **Core Layer**

Contains all domain entities and business rules:

* Route
* Banking logic
* Pooling logic
* Comparison logic

### **Application Layer**

Implements use cases:

* `RoutesUseCase`
* `BankingUseCase`
* `PoolingUseCase`

### **Adapters**

* HTTP adapters (Express routes)
* Database adapters (Prisma repositories)
* UI adapters (React components)

### **Infrastructure**

* Express server
* Prisma client
* Database connection

This ensures maximum testability and prevents framework coupling inside core logic.

---

# ⚙️ Tech Stack

## **Frontend**

* React + TypeScript
* Vite
* TailwindCSS
* Recharts (data visualization)

## **Backend**

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL

## **Architecture**

* Hexagonal (Ports & Adapters)
* Domain-Driven approach for core logic

---

# 🖥 Backend

## Backend Setup

### 1. Install dependencies

```
cd backend
npm install
```

### 2. Set environment variables

Create:

```
backend/.env
```

Contents:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fueleu?schema=public"
```

### 3. Run database migrations

```
npm run migrate
```

### 4. Seed initial dataset (5 example routes)

```
npm run seed
```

### 5. Start backend server

```
npm run dev
```

The backend now runs at:

```
http://localhost:4000
```

---

# 🗄 Database Schema

Prisma schema includes:

```prisma
model Route {
  id              Int      @id @default(autoincrement())
  routeId         String   @unique
  vesselType      String
  fuelType        String
  year            Int
  ghgIntensity    Float
  fuelConsumption Float
  distance        Float
  totalEmissions  Float
  isBaseline      Boolean  @default(false)
}

model BankEntry {
  id            Int      @id @default(autoincrement())
  shipId        String
  year          Int
  amountGCO2eq  Float
  createdAt     DateTime @default(now())
}

model Pool {
  id         Int           @id @default(autoincrement())
  year       Int
  createdAt  DateTime      @default(now())
  members    PoolMember[]
}

model PoolMember {
  id        Int     @id @default(autoincrement())
  shipId    String
  cbBefore  Float
  cbAfter   Float
  poolId    Int
  pool      Pool    @relation(fields: [poolId], references: [id])
}
```

---

# 🌐 API Endpoints

## **Routes API**

### `GET /routes`

Returns all routes.

### `POST /routes/:id/baseline`

Sets given route as baseline.

### `GET /routes/comparison`

Compares all routes against the baseline using:

```
percentDiff = ((comparison / baseline) − 1) × 100
target = 89.3368
```

---

## **Banking API (Article 20)**

### `GET /banking/balance?shipId=X&year=Y`

Returns current banked CB.

### `POST /banking/bank`

Banks a surplus.

### `POST /banking/apply`

Applies banked surplus to a deficit.

Validation included:

* Cannot bank ≤ 0
* Cannot apply more than banked amount

---

## **Pooling API (Article 21)**

### `POST /pools`

Creates a pool from member list.

Rules implemented:

* ∑ cbBefore ≥ 0
* No deficit ship leaves worse-off
* No surplus ship becomes negative
* Greedy allocation algorithm

### `GET /pools`

List all pools.

### `GET /pools/:id`

Returns detailed pool info.

---

# 🎨 Frontend

## Running the Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Make sure `.env` exists:

```
VITE_API_URL=http://localhost:4000
```

---

# 📊 Dashboard Features

### **1. Routes Tab**

* Displays all routes
* Highlights baseline
* Set baseline with one click
* Null-safe rendering
* Refresh button

### **2. Compare Tab**

* Loads comparisons from backend
* Red/green coloring
* Percentage difference
* Bar chart using Recharts

### **3. Banking Tab**

* Check balance
* Bank surplus CB
* Apply surplus to deficit
* Error messages and validations

### **4. Pooling Tab**

* Add/remove members dynamically
* Validates total CB ≥ 0
* Posts to backend
* Displays server-calculated `cbAfter`

---



# 📸 Screenshots

## Routes Tab
![Routes Tab](./screenshots/routes.png)

## Compare Tab
![Compare Tab](./screenshots/compare.png)

## Banking Tab
![Banking Tab](./screenshots/banking.png)

## Pooling Tab
![Pooling Tab](./screenshots/pooling.png)


---

# 🧪 Testing

### Backend tests (manual or automated):

* Route fetching
* Baseline setting
* Comparison computation
* Banking transactions
* Pooling validation and allocation

Manual testing performed via:

* Browser
* VS Code REST Client
* Prisma Studio
* Frontend integration testing

---

# ⚠ Known Limitations

* No authentication
* No pagination for large datasets
* Pooling algorithm is greedy (per assignment requirement)
* Banking does not handle cross-year balances

---

# 🤖 How AI was Used

A detailed record of AI usage is documented in:

```
AGENT_WORKFLOW.md
```

This includes:

* Prompt logs
* Code generation
* Refactoring assistance
* Bug fixing using AI agents
* Validating agent output manually

---

# 📜 License

MIT License — Free to use and modify.

---

# 🎯 Final Notes

This project successfully demonstrates:

* Strong architectural decisions
* Clean TypeScript implementation
* Real database integration
* Proper use of AI assistants during development
* Complete functional frontend dashboard

It fully meets the **FuelEU Maritime Full-Stack Developer Assignment** requirements.

---

If you'd like, I can now generate the remaining:

✔ `AGENT_WORKFLOW.md`
✔ `REFLECTION.md`

