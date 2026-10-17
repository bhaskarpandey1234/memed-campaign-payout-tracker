# Meme'd Campaign Payout Tracker

Full-stack take-home implementation for the Meme'd creator marketplace assignment.

## Structure

- `backend` — Express + TypeScript + Mongoose API
- `frontend` — Next.js + TypeScript client
- `docs/SRS.md` — requirements specification and implementation contract

## Frontend experience

The frontend uses a token-driven Tailwind design system with accessible reusable controls, responsive role workspaces, custom dialogs and dropdowns, inline validation, toast feedback, skeleton loading states, and retryable error states.

- Brand users build milestone ladders with rupee inputs; the browser converts them to paise only when calling the existing API.
- Creator users can browse live campaigns, submit platform-specific links, and simulate views in a custom dialog instead of a browser prompt.
- All API behavior, payout rules, credentials, and same-origin `/api/*` proxying remain unchanged.

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

For local transactional payout testing, start MongoDB as a single-node replica set named `rs0`, initialize it once with `rs.initiate()`, and use `mongodb://127.0.0.1:27017/memed-payouts?replicaSet=rs0` in `MONGODB_URI`.

The API runs on `http://localhost:4000`.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The web app runs on `http://localhost:3000`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. MongoDB Atlas or a local MongoDB instance can be used.

## Assumptions

- Budgets and payouts are stored as integer paise and displayed as rupees.
- A campaign is live while active and has remaining budget.
- Multiple submissions per creator/campaign are allowed.
- A milestone update pays only the incremental amount not already credited.
- When the remaining budget is smaller than the next payout, the remaining amount is credited and the submission is marked budget-capped.
- View updates are intentionally unauthenticated because the assignment describes them as a platform-data simulation endpoint.
- The atomic view-update path uses MongoDB transactions; use MongoDB Atlas or a replica-set-enabled local MongoDB for the concurrency guarantee.
- Campaign creation uses a client idempotency key and disables the submit button while pending, preventing accidental duplicate campaigns on repeated clicks or retries.
- Creators can submit multiple distinct posts per campaign; the same creator cannot submit the same URL twice, and post URLs must match the campaign platform.

## Verification

```bash
cd backend
npm test
npm run build

cd ../frontend
npm test
npm run build
```

## Deployment

Deploy the backend to Render (with `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`) and the frontend to Vercel (with `BACKEND_API_URL`).

### Submission checklist

- [ ] Add the verified Vercel frontend URL here after deployment.
- [ ] Add the verified Render API URL and check its `/health` endpoint.
- [ ] Set Render's `FRONTEND_URL` to the exact Vercel origin with no trailing slash, then test login and a full brand-to-creator flow on the live site.
- [ ] Confirm the GitHub repository is public and that neither `.env` nor `.env.local` has been committed.

The frontend proxies `/api/*` requests through its own origin to avoid third-party authentication cookies. Set `BACKEND_API_URL` to `http://localhost:4000` locally and `https://memed-payout-api.onrender.com` in Vercel. Keep Render's `FRONTEND_URL` as the exact Vercel origin with no trailing slash.

For Render, configure the backend service with Root Directory `backend`, Build Command `npm ci --include=dev && npm run build`, and Start Command `npm start`. `NODE_ENV=production` can remain set: `--include=dev` makes TypeScript and its type packages available during the build.

## Future work

Redis campaign-list caching, velocity-spike detection, Docker packaging, and a scale-out design note are intentionally outside the MVP critical path.
