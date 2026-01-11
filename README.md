# Maxim Barber Shop PWA

Progressive Web App per la gestione di un barber shop, costruita con Next.js 16, Prisma ORM e Supabase PostgreSQL.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky

## Setup

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura le variabili d'ambiente

Copia `.env.local.example` in `.env.local` e configura le tue credenziali:

```bash
cp .env.local.example .env.local
```

Poi modifica `.env.local` con:
- URL e chiave anonima di Supabase
- Connection string del database PostgreSQL

### 3. Setup Database

```bash
# Genera il Prisma Client
npm run db:generate

# Crea e applica le migrazioni
npm run db:migrate
```

### 4. Avvia lo sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Comandi Disponibili

### Development
- `npm run dev` - Avvia server di sviluppo
- `npm run build` - Build di produzione
- `npm start` - Avvia server di produzione
- `npm run lint` - Esegue ESLint

### Database (Prisma)
- `npm run db:generate` - Genera Prisma Client
- `npm run db:migrate` - Crea e applica migration
- `npm run db:migrate:deploy` - Applica migrations in produzione
- `npm run db:push` - Push schema senza migration (dev rapido)
- `npm run db:studio` - Apri Prisma Studio (GUI)

## Struttura del Progetto

```
├── app/                  # Next.js App Router
├── lib/                  # Librerie e utilities
│   ├── api/             # Layer API (services)
│   ├── hooks/           # React hooks custom
│   └── prisma.ts        # Prisma Client singleton
├── prisma/              # Schema e migrations
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration history
├── public/              # Asset statici
└── .husky/              # Git hooks
```

## API Layer

Il progetto usa un layer API strutturato con Prisma. Leggi [README-API.md](./README-API.md) per la documentazione completa su:
- Come creare nuovi modelli
- Come creare nuovi servizi
- Esempi di utilizzo
- Query avanzate

## Git Workflow

Il progetto usa Husky per i pre-commit hooks:
- ESLint check
- TypeScript type check
- Build verification

Per committare:
```bash
git add .
git commit -m "messaggio"
```

Se il pre-commit hook fallisce, correggi gli errori prima di poter committare.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
