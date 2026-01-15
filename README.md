# CareBase - Care Agency Management System

A comprehensive care agency management platform built with Next.js, TypeScript, and PostgreSQL.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database connection string

# Run database migrations
npx prisma migrate dev

# Seed the database with test data
npm run db:seed

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Test Credentials

After running the seed script, you can log in with any of the following test accounts:

| Role               | Email                   | Password     |
| ------------------ | ----------------------- | ------------ |
| Admin              | admin@carebase.com      | Password123! |
| Operations Manager | ops@carebase.com        | Password123! |
| Clinical Director  | clinical@carebase.com   | Password123! |
| Staff              | staff@carebase.com      | Password123! |
| Supervisor         | supervisor@carebase.com | Password123! |
| Carer              | carer@carebase.com      | Password123! |
| Sponsor            | sponsor@carebase.com    | Password123! |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Testing**: Jest, React Testing Library, Playwright

## Documentation

See the [docs](./docs) folder for detailed documentation.

## License

Private - All rights reserved
