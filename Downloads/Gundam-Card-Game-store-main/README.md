# Gundam Card Game Store

This is a monorepo for a Gundam Card Game store application, including admin, customer, and backend server modules.

## Structure
- `client-admin/`: Admin dashboard (frontend)
- `client-customer/`: Customer-facing frontend
- `server/`: Node.js backend (Express)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- pnpm (or npm/yarn)

### Install dependencies
```
pnpm install
```

### Run Backend
```
cd server
node server.js
```

### Run Admin Frontend
```
cd client-admin
pnpm install
pnpm run dev
```

### Run Customer Frontend
```
cd client-customer
pnpm install
pnpm run dev
```

## Environment Variables
- Place your environment variables in `server/.env` and as needed in frontend folders.

## License
MIT
