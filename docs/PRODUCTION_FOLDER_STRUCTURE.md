# Production-Ready Folder Structure

This guide proposes a scalable folder structure for the Meme'd Campaign Payout
Tracker. It is a migration target for this repository, not a generic starter
template and not a request to change the application's behavior.

The structure is based on the versions currently declared in the package
manifests and on the official framework documentation linked in
[References](#references). Next.js and Express deliberately allow multiple
organization strategies, so the feature-oriented choices below are project
conventions rather than framework requirements.

## 1. Current technology stack

### Frontend

| Concern | Current technology |
| --- | --- |
| Framework | Next.js `^14.2.15`, App Router |
| UI | React and React DOM `^18.3.1` |
| Language | TypeScript `^5.6.3`, strict mode |
| Styling | Global CSS |
| Backend access | Same-origin `/api/*` calls rewritten by `next.config.mjs` |
| Authentication transport | HttpOnly cookie sent with `credentials: 'include'` |

### Backend

| Concern | Current technology |
| --- | --- |
| HTTP API | Express `^4.21.1` on Node.js |
| Language/runtime tooling | TypeScript `^5.6.3`, `tsx`, Node16 modules |
| Database | MongoDB through Mongoose `^8.7.1` |
| Validation | Zod `^3.23.8` |
| Authentication | JWT `^9.0.2`, `bcryptjs`, and cookie-parser |
| Cross-origin access | CORS with credentials and one configured frontend origin |
| Tests | Jest `^29.7.0` and ts-jest `^29.2.5`, Node test environment |

Other runtime dependencies are `cors ^2.8.5` and `dotenv ^16.4.5`. This guide
does not propose dependency additions, removals, or version upgrades.

## 2. Why the current layout should evolve

The current implementation is intentionally compact and appropriate for an
MVP, but three files already contain several unrelated responsibilities:

- `frontend/app/page.tsx` contains authentication, API transport, session
  state, both role dashboards, form state, formatting, campaign creation,
  submission creation, and view updates.
- `backend/src/server.ts` configures Express, declares every route, performs
  authentication and validation orchestration, runs business logic, manages a
  transaction, handles errors, connects to MongoDB, synchronizes indexes, and
  starts the listener.
- `backend/src/models.ts` defines every schema, index, and model in one module.

As the application grows, these files create broad merge-conflict surfaces,
make ownership unclear, and make isolated testing harder. The target structure
keeps route entry points thin and groups code by business capability: auth,
campaigns, submissions, earnings, and payouts.

## 3. Recommended frontend structure

```text
frontend/
├── public/                         # Static files served from the site root
├── src/
│   ├── app/                        # Next.js routes and route-level boundaries
│   │   ├── error.tsx               # Root error boundary
│   │   ├── globals.css             # Application-wide styles
│   │   ├── layout.tsx              # Required root layout
│   │   ├── loading.tsx             # Root loading fallback when needed
│   │   ├── not-found.tsx           # Root 404 UI
│   │   └── page.tsx                # Thin home/session orchestration route
│   ├── components/
│   │   └── ui/                     # Feature-neutral Button, Card, Field, etc.
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/                # Login, signup, logout, and current-user calls
│   │   │   ├── components/         # Auth form and authentication views
│   │   │   ├── hooks/              # Session/authentication state
│   │   │   ├── schemas/            # Client-side input schemas if introduced
│   │   │   ├── types.ts            # User, role, and auth DTO types
│   │   │   └── index.ts            # Deliberate public exports
│   │   ├── campaigns/
│   │   │   ├── api/                # Create, owned-list, and live-list calls
│   │   │   ├── components/         # Campaign form, list, card, and budget UI
│   │   │   ├── hooks/              # Campaign state/data orchestration
│   │   │   ├── schemas/            # Campaign form parsing when needed
│   │   │   ├── types.ts            # Campaign and milestone DTOs
│   │   │   └── index.ts
│   │   ├── submissions/
│   │   │   ├── api/                # Submit-post and update-view calls
│   │   │   ├── components/         # Submission form/list/card UI
│   │   │   ├── hooks/              # Submission mutations and pending state
│   │   │   ├── types.ts            # Submission DTOs
│   │   │   └── index.ts
│   │   └── earnings/
│   │       ├── api/                # Current creator earnings call
│   │       ├── components/         # Earnings summary UI
│   │       ├── hooks/              # Earnings query/state
│   │       ├── types.ts            # Earnings response types
│   │       └── index.ts
│   └── lib/
│       ├── api/
│       │   └── client.ts            # Shared fetch, JSON, cookie, and error behavior
│       ├── env.ts                   # Typed access to public/runtime configuration
│       └── format/
│           └── currency.ts          # Paise-to-rupee display helpers
├── .env.example
├── next.config.mjs                 # Retains the existing /api rewrite
├── package.json
├── package-lock.json
└── tsconfig.json
```

Empty directories should not be created pre-emptively. Add a folder or file
from the tree when its first real responsibility is extracted.

### Frontend responsibilities

- `src/app` owns URL structure and Next.js special files. Pages compose
  features; they do not contain reusable API clients or full feature
  implementations.
- `src/features` owns business-facing UI and client behavior. A feature should
  expose only intentionally reusable symbols through its `index.ts`.
- `src/components/ui` contains presentation primitives with no campaign,
  submission, earnings, or authentication knowledge.
- `src/lib` contains feature-neutral technical utilities. It must not import
  from `features` or `app`.
- `public` and configuration files remain at the frontend package root, as
  required or recommended by Next.js when using `src`.

### Next.js organization conventions

This application can retain the single `/` route while its large page is
decomposed. New URLs should follow these optional App Router conventions only
when there is a product need:

- A route group such as `(auth)` or `(dashboard)` organizes routes without
  changing their URL paths.
- A private folder such as `_components` marks a route-local implementation
  detail and opts it out of routing.
- Shared feature code stays outside `app`; code used by only one route may be
  colocated inside that route segment.

Use a `@/*` alias for `frontend/src/*` when the migration begins:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

This is a configuration change only; introduce it in the same phase that moves
`app` into `src` so imports never point at both layouts.

### Frontend dependency direction

```text
src/app  ───────► src/features ───────► src/components/ui
   │                    │                       │
   └────────────────────┴──────────────► src/lib
```

- `app` may compose any feature or shared frontend module.
- Features may use `components/ui` and `lib`.
- Cross-feature imports should go through the feature's public `index.ts` and
  should be rare; move genuinely shared contracts or presentation primitives
  to a neutral location instead of creating a cycle.
- `components/ui` and `lib` never import from a feature or route.
- Keep server-only values out of client modules. The browser continues to call
  relative `/api/*` URLs; it does not receive `BACKEND_API_URL`.

## 4. Recommended backend structure

```text
backend/
├── src/
│   ├── app.ts                       # Build and configure the Express app
│   ├── server.ts                    # Connect, listen, and shut down cleanly
│   ├── config/
│   │   ├── database.ts              # Mongoose connection lifecycle
│   │   └── env.ts                   # Parse and expose environment configuration
│   ├── middleware/
│   │   ├── authenticate.ts          # JWT cookie authentication
│   │   ├── authorize.ts             # Brand/creator role authorization
│   │   ├── error-handler.ts         # Central error-to-response mapping
│   │   ├── not-found.ts             # Unknown-route response
│   │   └── validate.ts              # Reusable Zod request validation helper
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.model.ts         # User schema/model and its indexes
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts       # Password and session use cases
│   │   │   ├── auth.token.ts         # JWT and cookie helpers
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   ├── campaigns/
│   │   │   ├── campaign.controller.ts
│   │   │   ├── campaign.model.ts     # Campaign schema/model and indexes
│   │   │   ├── campaign.routes.ts
│   │   │   ├── campaign.service.ts
│   │   │   ├── campaign.validation.ts
│   │   │   ├── campaign.types.ts
│   │   │   └── index.ts
│   │   ├── submissions/
│   │   │   ├── submission.controller.ts
│   │   │   ├── submission.model.ts   # Submission schema/model and indexes
│   │   │   ├── submission.routes.ts
│   │   │   ├── submission.service.ts # Submission and atomic view-update use cases
│   │   │   ├── submission.validation.ts
│   │   │   ├── submission.types.ts
│   │   │   └── index.ts
│   │   ├── earnings/
│   │   │   ├── earnings.controller.ts
│   │   │   ├── earnings.routes.ts
│   │   │   ├── earnings.service.ts
│   │   │   └── index.ts
│   │   └── payouts/
│   │       ├── payout.service.ts     # Pure milestone and cap calculations
│   │       ├── payout.types.ts
│   │       └── index.ts
│   └── shared/
│       ├── errors/
│       │   └── app-error.ts          # Typed operational HTTP errors
│       ├── http/
│       │   └── async-handler.ts      # Async Express error propagation
│       └── types/
│           └── express.ts            # Authenticated request augmentation
├── scripts/
│   ├── backfill-campaign-names.ts    # Controlled data backfill
│   └── sync-indexes.ts               # Explicit production index operation
├── tests/
│   ├── fixtures/                     # Reusable test data builders
│   ├── helpers/                      # Database/app test setup
│   ├── integration/                  # HTTP and MongoDB behavior tests
│   └── unit/                         # Pure service and validation tests
├── .env.example
├── jest.config.js
├── package.json
├── package-lock.json
└── tsconfig.json
```

As with the frontend, only create directories when they contain a real file.
The tree describes ownership boundaries, not a requirement to add placeholders.

### Backend responsibilities

- `app.ts` creates the Express instance, installs global middleware, mounts
  feature routers, exposes `/health`, and installs not-found/error handlers. It
  does not connect to MongoDB or open a network port, which makes it importable
  in tests.
- `server.ts` performs process-level work: load configuration, connect to
  MongoDB, start listening, respond to termination signals, and close resources.
- Routes declare paths and middleware order. Controllers translate HTTP input
  and output. Services implement use cases and transaction boundaries. Models
  define persistence shape and indexes.
- Validation remains at the transport boundary through module-local Zod
  schemas. Database constraints remain in Mongoose schemas as a second line of
  defense.
- `shared` is reserved for code used by multiple modules and contains no
  campaign-payout business policy.

### Backend dependency direction

```text
server ──► app ──► routes ──► controllers ──► services ──► models
                    │              │               │
                    └──────────────┴───────────────┴──► shared/config

submission.service ──► payout.service
```

- Routers may import controllers and middleware, but not models directly.
- Controllers handle HTTP concerns and call services; they do not implement
  payout rules or perform multi-document writes.
- Services may use their module's model and another module's deliberately
  exported service/model contract where a use case requires it. They never
  import another module's controller or router.
- Models and shared utilities do not import controllers, routes, or services.
- `payout.service.ts` remains a deterministic, database-free domain function so
  milestone and budget-cap logic stays easy to test.
- Avoid generic `helpers.ts`, `utils.ts`, or `common.ts` dumping grounds. Name a
  shared file for the capability it provides.

### Transaction and persistence ownership

The atomic view update belongs in `submission.service.ts` because the use case
starts from a submission and coordinates both `Submission` and `Campaign`.
The service must retain these invariants:

1. Start a Mongoose session and execute the read/modify/write sequence through
   `withTransaction()` or an equivalent Mongoose transaction helper.
2. Attach the same session to every database operation in the transaction.
3. Do not parallelize operations within the transaction.
4. Calculate the incremental payout through the pure payout service.
5. Cap the credit at the campaign's remaining budget and update both documents
   before committing.
6. End the session in a `finally` block and preserve the current response shape.

Keep schema indexes beside their models so their intent is visible. In
production, run potentially expensive index synchronization and data backfills
through explicit scripts or deployment steps rather than hiding them inside an
ordinary request path. During migration, do not remove the current startup
backfill/index behavior until an equivalent release step is configured and
verified. The existing Render build and start commands remain valid throughout
the documentation-only change.

### Test organization

- Move the current pure payout tests to
  `tests/unit/payout.service.test.ts`.
- Move the current post URL/validation tests to
  `tests/unit/submission.validation.test.ts`.
- Put route, authentication-cookie, authorization, MongoDB, and transaction
  tests in `tests/integration` once they exist.
- Keep reusable data factories in `tests/fixtures` and application/database
  lifecycle code in `tests/helpers`.
- Retain `testEnvironment: 'node'`. Do not use Jest fake timers around Mongoose
  or create reusable Mongoose connections in Jest `globalSetup`.

## 5. Naming and import rules

| Item | Convention | Example |
| --- | --- | --- |
| React component | PascalCase export; kebab-case file | `CampaignCard` in `campaign-card.tsx` |
| React hook | `use` prefix | `useCampaigns` in `use-campaigns.ts` |
| Backend module file | Singular domain plus responsibility | `campaign.service.ts` |
| Zod schema | Domain/action plus `Schema` | `createCampaignSchema` |
| Mongoose model | Preserve existing singular model names | `User`, `Campaign`, `Submission` |
| Test | Source name plus `.test.ts` | `payout.service.test.ts` |
| Public module surface | Named exports from `index.ts` | `modules/campaigns/index.ts` |

Additional rules:

- Prefer named exports, except where Next.js requires a default export for a
  special file such as `page.tsx` or `layout.tsx`.
- Avoid importing deep internal files across features. Import from a feature's
  `index.ts` when a cross-feature dependency is necessary.
- Use absolute aliases for frontend application code. For the backend, use
  either consistent relative imports or a TypeScript alias only after the
  emitted Node.js resolution strategy is configured and tested.
- Keep request/response DTO types near the owning feature. Do not reuse a
  Mongoose document type as an HTTP response contract.
- Environment access is centralized in `config/env.ts` on the backend and
  `lib/env.ts` on the frontend; application modules do not read
  `process.env` directly.

## 6. Current-to-target migration map

| Current path | Target ownership | Migration notes |
| --- | --- | --- |
| `frontend/app/layout.tsx` | `frontend/src/app/layout.tsx` | Move with the App Router; preserve metadata and root markup. |
| `frontend/app/globals.css` | `frontend/src/app/globals.css` | Preserve the root-layout import and existing selectors. |
| `frontend/app/page.tsx` | `src/app/page.tsx` plus `src/features/*` | Keep the `/` behavior while extracting the API client, auth UI, brand dashboard, creator dashboard, campaigns, submissions, and earnings. |
| Inline frontend `api()` | `frontend/src/lib/api/client.ts` | Preserve JSON parsing, errors, `Content-Type`, relative URLs, and credentials. |
| Inline frontend DTO types | Owning `frontend/src/features/*/types.ts` | Keep current wire shapes; split only by ownership. |
| `backend/src/server.ts` | `backend/src/app.ts`, `server.ts`, routers, controllers, and services | Extract in stages without changing route order, status codes, or error bodies. |
| `backend/src/config.ts` | `backend/src/config/env.ts` and `database.ts` | Preserve `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, and `NODE_ENV` defaults. |
| `backend/src/auth.ts` | Auth token helpers plus authenticate/authorize middleware | Preserve JWT claims and the current `token` cookie behavior. |
| `backend/src/models.ts` | `auth.model.ts`, `campaign.model.ts`, and `submission.model.ts` | Preserve model names, collection resolution, schema options, timestamps, and every existing index. |
| `backend/src/validation.ts` | Module-local `*.validation.ts` files | Keep every Zod constraint, normalization rule, and platform URL rule. |
| `backend/src/payout.ts` | `modules/payouts/payout.service.ts` | Keep it pure and preserve cumulative/incremental payout behavior. |
| `backend/src/types.ts` | Module types plus `shared/types/express.ts` | Keep authenticated request typing near the Express augmentation. |
| `backend/tests/payout.test.ts` | `tests/unit/payout.service.test.ts` | Update imports only; keep all scenarios. |
| `backend/tests/submission-validation.test.ts` | `tests/unit/submission.validation.test.ts` | Update imports only; keep all scenarios. |

## 7. Compatibility contract

The restructure must not change the application's public contract.

### HTTP routes

| Method | Path | Required behavior |
| --- | --- | --- |
| GET | `/health` | Remains public and returns the existing health payload. |
| POST | `/api/auth/signup` | Creates a user and sets the existing JWT cookie. |
| POST | `/api/auth/login` | Authenticates and sets the existing JWT cookie. |
| POST | `/api/auth/logout` | Clears the existing cookie. |
| GET | `/api/auth/me` | Returns the authenticated user. |
| POST | `/api/campaigns` | Remains brand-only and retains idempotency behavior. |
| GET | `/api/campaigns/mine` | Remains brand-only with the same budget summary. |
| GET | `/api/campaigns/live` | Remains creator-only and filters exhausted campaigns. |
| POST | `/api/campaigns/:id/submissions` | Retains URL/platform validation and deduplication. |
| GET | `/api/earnings/me` | Retains the current total and populated submissions. |
| PATCH | `/api/submissions/:id/views` | Remains the public simulator endpoint and retains atomic payout behavior. |

All error responses remain `{ "message": string, "errors"?: object }` with the
same meaningful status codes. Response field names and money units remain
unchanged; budgets and payouts continue to use integer paise.

### Runtime and deployment

- Preserve the `token` cookie name, JWT payload, HttpOnly behavior, and current
  environment-specific cookie options.
- Preserve the frontend's same-origin `/api/*` requests and the
  `BACKEND_API_URL` rewrite in `next.config.mjs`.
- Preserve backend `FRONTEND_URL` CORS behavior and credential support.
- Preserve the `User`, `Campaign`, and `Submission` Mongoose model names so
  existing collections continue to be used.
- Preserve the current npm commands and Render/Vercel deployment configuration:
  backend build remains `npm ci --include=dev && npm run build`, backend start
  remains `npm start`, and the frontend continues to use its existing Next.js
  build/start scripts.

## 8. Phased migration order

Each phase should compile and pass tests before the next begins.

1. **Establish shared boundaries.** Extract the frontend API client and display
   formatting without changing rendering. On the backend, extract async/error
   utilities and split `app.ts` from `server.ts` while mounting the same routes.
2. **Move the frontend under `src`.** Move `app`, configure `@/*`, and verify the
   existing `/` route and `/api/*` rewrite before extracting UI features.
3. **Extract frontend features.** Move auth first, then campaigns, submissions,
   and earnings. Keep `src/app/page.tsx` as the session/role composition point
   unless product requirements introduce separate URLs.
4. **Extract pure backend code.** Move payout calculation, module-local Zod
   schemas, types, and models with import-only changes. Preserve Mongoose model
   names to prevent collection changes.
5. **Extract backend request layers.** Create routers, controllers, and services
   one endpoint group at a time: auth, campaigns, submissions, and earnings.
   Mount each router at its existing path.
6. **Move the transaction intact.** Relocate view-update orchestration into the
   submission service as one unit; run concurrency and budget-cap tests before
   removing the old implementation.
7. **Reorganize tests.** Move existing tests into `tests/unit`, then add
   integration coverage around app assembly, cookies, authorization, duplicate
   handling, errors, and transactions.
8. **Separate release operations.** Add explicit backfill/index scripts and wire
   them into a controlled deployment step. Remove startup equivalents only
   after the new step has run successfully in every environment.

## 9. Migration acceptance checklist

- Both `npm run build` commands succeed with no behavior-changing dependency
  updates.
- Backend unit and integration tests pass in the Node environment.
- All routes, status codes, response bodies, cookie behavior, and role checks
  match the compatibility contract.
- Concurrent view updates cannot overspend a campaign and repeated updates do
  not double-pay.
- Existing MongoDB collections and indexes are retained.
- The frontend still reaches the backend only through its same-origin rewrite.
- No secret value is committed; `.env.example` remains the configuration
  contract.
- No module violates the dependency directions documented above.

## 10. References

Official sources reviewed on **2026-10-13**:

- [Next.js 14: Project Organization and File Colocation](https://nextjs.org/docs/14/app/building-your-application/routing/colocation) — documents safe colocation, private folders, route groups, the optional `src` directory, path aliases, and multiple valid organization strategies.
- [Next.js 14: Route Groups](https://nextjs.org/docs/14/app/building-your-application/routing/route-groups) — documents grouping routes without changing URL paths.
- [Next.js 14: `src` Directory](https://nextjs.org/docs/14/pages/building-your-application/configuring/src-directory) — documents keeping application code under `src` while configuration, environment files, and `public` stay at the project root.
- [Express: Routing](https://expressjs.com/en/guide/routing/) — documents `express.Router` as a modular, mountable routing system.
- [Express: Using Middleware](https://expressjs.com/en/guide/using-middleware/) — defines application, router, error-handling, built-in, and third-party middleware boundaries.
- [Express: Application Generator](https://expressjs.com/en/starter/generator/) — provides an example skeleton and explicitly notes that it is only one of many valid structures.
- [Express: Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance/) — covers production process, error handling, logging, reverse proxy, and reliability concerns.
- [Mongoose 8: Schemas](https://mongoosejs.com/docs/8.x/docs/guide.html) — documents schemas, models, indexes, and production considerations for automatic index creation.
- [Mongoose 8: Transactions](https://mongoosejs.com/docs/8.x/docs/transactions.html) — documents sessions, transaction helpers, session propagation, and the restriction on parallel operations within a transaction.
- [Mongoose 8: Testing with Jest](https://mongoosejs.com/docs/8.x/docs/jest.html) — recommends the Node test environment and records Mongoose-specific Jest caveats.
- [Jest 29.7: Configuration](https://jestjs.io/docs/29.7/configuration) — documents test roots, matching, environments, and configuration behavior.
