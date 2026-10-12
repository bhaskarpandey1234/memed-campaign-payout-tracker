# Meme'd Campaign Payout Tracker

Full-stack take-home implementation for the Meme'd creator marketplace assignment.

## Structure

- `backend` — Express + TypeScript + Mongoose API
- `frontend` — Next.js + TypeScript client
- `docs/SRS.md` — requirements specification and implementation contract

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
npm run build
```

## Deployment

Deploy the backend to Render (with `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`) and the frontend to Vercel (with `NEXT_PUBLIC_API_URL`). Add the deployed links here before submission.

## Future work

Redis campaign-list caching, velocity-spike detection, Docker packaging, and a scale-out design note are intentionally outside the MVP critical path.
