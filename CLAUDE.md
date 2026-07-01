# Spendexa Web

Full-stack personal finance manager. Rebuild of an earlier C++ terminal app, now React + Node/Express + Prisma + PostgreSQL (Neon).

## Stack
- Backend: /server — Express + TypeScript + Prisma
- Frontend: /client — React + TypeScript + Tailwind (Vite)
- DB: PostgreSQL on Neon, connection string in /server/.env (DATABASE_URL)
- Auth: JWT in httpOnly cookies, bcrypt for passwords

## Conventions
- All money fields use Prisma Decimal(14,2), never float/number for currency
- Every API route that touches user data must go through the auth middleware
- Test new endpoints end-to-end with curl before considering them done
- Commit and push after each working feature, don't let work pile up uncommitted

## Commands
- Backend dev: cd server && npm run dev
- Migration: cd server && npx prisma migrate dev --name <name>
- Frontend dev: cd client && npm run dev

## Current status
- Auth (register/login/logout/me) — done, tested
- Dashboard summary endpoint — done, tested
- Next up: transactions CRUD
