# Beyond — Booking API

This repository contains the **Booking API** for the Beyond project.

The API is responsible for:
- Slot availability
- Booking creation and management
- Payment processing with Stripe
- Booking confirmation and cancellation

It is built using **Express**, **ts-rest**, **MongoDB**, and **Stripe**, and relies on a **shared domain library** to ensure consistency across the system.

---

## 🧩 Shared Booking Library (`libs/booking`)

The API uses the shared **booking library** as the single source of truth for:

- **API contracts** (ts-rest)
- **Zod schemas** (queries, mutations, DTOs)
- **Domain constants**
  - `BOOKING_TIME_MS`
  - `BUSINESS_START_MS`
  - `BUSINESS_END_MS`
- **Slot utilities**
  - `slotKey`
  - slot normalisation helpers

This guarantees:
- End-to-end type safety
- No contract drift
- Identical validation rules across all consumers

---

## ⚙️ Requirements

### Node & NPM

The API requires:

```json
"engines": {
  "node": ">=24.12.0",
  "npm": ">=11.6.2"
}
```
Recommended setup using nvm:

```bash
nvm install 24.12.0
nvm use 24.12.0
npm install -g npm@11.6.2
```

📦 Installation
From the repository root:

```bash
npm install
```

🗄️ Environment Variables
Create a .env file inside apps/api:

```env
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/beyond

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx

# Environment
NODE_ENV=development
```

▶️ Running the API
```bash
npm run serve
```

The API will be available at: http://localhost:3000

🔌 API Architecture Tech Stack

* Express
* ts-rest
* MongoDB (Mongoose)
* Stripe (PaymentIntents)
* Zod
* Pino (logging)

💳 Stripe Integration
Uses PaymentIntents

* All sensitive operations handled server-side
* Client secret returned to the consumer
* Webhooks supported for future extensions

🔐 Validation & Safety

* All inputs validated with Zod
* Strict typing enforced via ts-rest
* Slot collisions are prevented at service level
* Business rules are enforced centrally

🧪 Testing & Quality
```bash
npm run lint:check
npm run typecheck
npm run test:unit
```

🧼 Logging

* Structured logging using Pino
* HTTP logs via pino-http
* Suitable for production observability

📦 Build
```bash
npm run build
```
