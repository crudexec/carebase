# HomeCare Application Architecture

## Architecture Overview

This is a Next.js 14 healthcare management application with the following architecture:

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser/PWA]
        UI[React Components]
        Context[Context/State Management]
    end

    subgraph "Next.js Application"
        subgraph "Frontend"
            Pages[Pages/Routes]
            Components[UI Components]
            Hooks[Custom Hooks]
            Forms[React Hook Form + Zod]
        end

        subgraph "API Layer"
            Routes[API Routes]
            Middleware[Middleware Layer]
            Auth[Authentication]
            RBAC[RBAC/Casbin]
        end
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
        S3[AWS S3 Storage]
    end

    Browser --> UI
    UI --> Context
    Context --> Pages
    Pages --> Components
    Components --> Hooks
    Pages --> Routes
    Routes --> Middleware
    Middleware --> Auth
    Auth --> RBAC
    Routes --> Prisma
    Prisma --> DB
    Routes --> S3

    classDef client fill:#e1f5e1
    classDef app fill:#e3f2fd
    classDef data fill:#fff3e0
    class Browser,UI,Context client
    class Pages,Components,Hooks,Forms,Routes,Middleware,Auth,RBAC app
    class Prisma,DB,S3 data
```

## Key Components

```mermaid
graph LR
    subgraph "Authentication & Authorization"
        JWT[JWT Tokens]
        Bcrypt[Password Hashing]
        Casbin[Casbin RBAC]
        Cookies[Cookie Storage]
    end

    subgraph "State Management"
        Jotai[Jotai Atoms]
        SWR[SWR Data Fetching]
        RHF[React Hook Form]
    end

    subgraph "UI Framework"
        Radix[Radix UI]
        Tailwind[Tailwind CSS]
        Lucide[Lucide Icons]
        Shadcn[Shadcn Components]
    end

    subgraph "Data & Storage"
        PrismaORM[Prisma ORM]
        PostgreSQL[PostgreSQL DB]
        AWSS3[AWS S3]
    end

    subgraph "Build & Dev Tools"
        Next[Next.js 14]
        TypeScript[TypeScript]
        ESLint[ESLint]
        Prettier[Prettier]
        Husky[Husky Hooks]
    end
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ UserProvider : has
    Provider ||--o{ UserProvider : has
    Provider ||--o{ Vendor : has

    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        string image
        boolean active
        datetime archivedOn
        datetime createdAt
        datetime updatedAt
    }

    Provider {
        string id PK
        string providerName
        string billingName
        string providerNumber
        string contact1
        string contact2
        string address1
        string address2
        string state
        string city
        string zipCode
        string npi
        string taxId
        ProviderType providerType
        boolean active
        datetime archivedOn
        datetime createdAt
        datetime updatedAt
    }

    UserProvider {
        string id PK
        string userId FK
        string providerId FK
        datetime createdAt
        datetime updatedAt
    }

    Vendor {
        string id PK
        VendorType name
        string providerId FK
        json credentials
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    CasbinRule {
        string id PK
        string ptype
        string v0
        string v1
        string v2
        string v3
        string v4
        string v5
        datetime createdAt
        datetime updatedAt
    }
```

## API Endpoints

```mermaid
graph TD
    subgraph "Authentication APIs"
        POST_Login[POST /api/auth/login]
        POST_AuthProvider[POST /api/auth/authenticate-provider]
        POST_Logout[POST /api/auth/logout]
    end

    subgraph "User Management APIs"
        GET_Users[GET /api/user]
        POST_User[POST /api/user]
        PUT_User[PUT /api/user]
        DELETE_User[DELETE /api/user]
    end

    subgraph "Provider Management APIs"
        GET_Providers[GET /api/provider]
        POST_Provider[POST /api/provider]
        PUT_Provider[PUT /api/provider]
        DELETE_Provider[DELETE /api/provider]
        GET_ProviderById[GET /api/provider/:id]
    end

    subgraph "Role & Permission APIs"
        GET_Roles[GET /api/role]
        POST_Role[POST /api/role]
        PUT_Role[PUT /api/role]
        DELETE_Role[DELETE /api/role]
        GET_Policy[GET /api/role/assign]
        POST_Policy[POST /api/role/assign]
        DELETE_Policy[DELETE /api/role/assign]
    end

    subgraph "Middleware Chain"
        AuthMiddleware[authorizeUser]
        ProviderMiddleware[authorizeUserProvider]
        ValidateMiddleware[validateUpdateProvider]
    end

    POST_Login --> JWT[Generate JWT]
    GET_Users --> AuthMiddleware
    POST_Provider --> AuthMiddleware
    PUT_Provider --> ValidateMiddleware
    POST_AuthProvider --> ProviderMiddleware
```

## Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant API Route
    participant Auth/RBAC
    participant Prisma
    participant Database

    Client->>Middleware: HTTP Request
    Middleware->>Middleware: Check Auth Cookies
    alt No Auth
        Middleware-->>Client: Redirect to /login
    else Has Auth
        Middleware->>API Route: Forward Request
        API Route->>Auth/RBAC: Verify Permissions
        alt Authorized
            API Route->>Prisma: Database Query
            Prisma->>Database: SQL Query
            Database-->>Prisma: Result
            Prisma-->>API Route: Data
            API Route-->>Client: JSON Response
        else Not Authorized
            Auth/RBAC-->>Client: 401/403 Error
        end
    end
```

## Page Routes & Navigation

```mermaid
graph TD
    Root["/"] -->|Redirect| Dashboard["/dashboard"]
    Root --> Login["/login"]

    subgraph "Protected Routes"
        Dashboard --> UserManagement["/user"]
        Dashboard --> Settings["/settings"]
        Settings --> ProviderSettings["/settings/provider"]
    end

    subgraph "Auth Flow"
        Login -->|Success| Dashboard
        Login -->|Multiple Providers| ProviderSelection
        ProviderSelection --> Dashboard
    end
```

## Technology Stack Summary

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with cookie storage
- **Authorization**: Casbin RBAC
- **State Management**: Jotai + SWR
- **UI Components**: Radix UI + Shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **File Storage**: AWS S3
- **PWA Support**: @ducanh2912/next-pwa
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier, Husky
